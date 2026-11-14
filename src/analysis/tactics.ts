// Détection des motifs tactiques créés par un coup (100 % par règles).

import { Chess, type Color, type Move, type PieceSymbol, type Square } from 'chess.js';
import type { BoardArrow, SquareMark } from './types';
import { parseUci, PIECE_NAMES_FR } from '../lib/chessUtils';
import {
  VALUE,
  attackersOf,
  attacksFrom,
  boardFromFen,
  findKing,
  hangingPieces,
  opp,
  see,
  seeCapture,
  sliderDirs,
  sqIndex,
  sqName,
  fileOf,
  rankOf,
  type Board,
} from './features';

// --------------------------------------------------------------------------
// Petites aides de langue

const FEMININE: Partial<Record<PieceSymbol, boolean>> = { r: true, q: true };
const PLURAL: Record<PieceSymbol, string> = { p: 'pions', n: 'cavaliers', b: 'fous', r: 'tours', q: 'dames', k: 'rois' };

export const pieceName = (t: PieceSymbol) => PIECE_NAMES_FR[t];
/** « le cavalier », « la tour » */
export const theP = (t: PieceSymbol) => (FEMININE[t] ? 'la ' : 'le ') + PIECE_NAMES_FR[t];
/** « un cavalier », « une tour » */
export const aP = (t: PieceSymbol) => (FEMININE[t] ? 'une ' : 'un ') + PIECE_NAMES_FR[t];
/** « du cavalier », « de la tour » */
export const ofP = (t: PieceSymbol) => (FEMININE[t] ? 'de la ' : 'du ') + PIECE_NAMES_FR[t];
export const pluralP = (t: PieceSymbol) => PLURAL[t];
/** « le cavalier en f3 » */
export const pieceAt = (t: PieceSymbol, sq: string) => `${theP(t)} en ${sq}`;
/** « du cavalier en f3 » */
export const ofPieceAt = (t: PieceSymbol, sq: string) => `${ofP(t)} en ${sq}`;
export const sideName = (c: Color) => (c === 'w' ? 'les Blancs' : 'les Noirs');
export const SideName = (c: Color) => (c === 'w' ? 'Les Blancs' : 'Les Noirs');

/** « un pion », « 2 pions », « une pièce (3 pions) »… */
export function gainText(n: number): string {
  const v = Math.round(n);
  if (v <= 1) return 'un pion';
  if (v === 2) return 'deux pions';
  if (v === 3) return 'l’équivalent d’une pièce mineure (3 pions)';
  if (v === 5) return 'l’équivalent d’une tour (5 pions)';
  if (v >= 9) return `beaucoup de matériel (${v} pions)`;
  return `${v} pions de matériel`;
}

// --------------------------------------------------------------------------
// Positions dérivées

/**
 * FEN où le camp au trait « passe son tour » (coup nul) : trait inversé, prise en passant effacée.
 * Renvoie null si le camp au trait est en échec (passer serait illégal).
 */
export function nullMoveFen(fen: string): string | null {
  try {
    const chess = new Chess(fen);
    if (chess.inCheck()) return null;
    const parts = fen.split(' ');
    parts[1] = parts[1] === 'w' ? 'b' : 'w';
    parts[3] = '-';
    if (parts.length < 6) return null;
    const out = parts.join(' ');
    new Chess(out); // validation
    return out;
  } catch {
    return null;
  }
}

/** Coup (UCI) qui mate immédiatement, ou null. */
export function findMateInOne(fen: string): string | null {
  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return null;
  }
  // chess.js calcule déjà le suffixe « # » des SAN : inutile de rejouer chaque coup.
  const m = chess.moves({ verbose: true }).find((x) => x.san.endsWith('#'));
  return m ? m.from + m.to + (m.promotion ?? '') : null;
}

export interface Threat {
  kind: 'mat' | 'capture' | 'promotion';
  uci: string;
  san: string;
  /** Gain matériel en pions (mat = 100). */
  gain: number;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  target?: PieceSymbol;
}

/** Ce que le camp au trait peut obtenir immédiatement : mat en 1, captures gagnantes, promotions sûres. */
export function findThreats(fen: string): Threat[] {
  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return [];
  }
  const board = boardFromFen(fen);
  const byTarget = new Map<string, Threat>();
  const out: Threat[] = [];
  for (const m of chess.moves({ verbose: true })) {
    const uci = m.from + m.to + (m.promotion ?? '');
    if (m.san.endsWith('#')) {
      out.push({ kind: 'mat', uci, san: m.san, gain: 100, from: m.from, to: m.to, piece: m.piece });
      continue;
    }
    if (m.captured && !m.isEnPassant()) {
      const gain = seeCapture(board, sqIndex(m.from), sqIndex(m.to));
      if (gain > 0) {
        const prev = byTarget.get(m.to);
        if (!prev || prev.gain < gain || (prev.gain === gain && VALUE[prev.piece] > VALUE[m.piece])) {
          byTarget.set(m.to, { kind: 'capture', uci, san: m.san, gain, from: m.from, to: m.to, piece: m.piece, target: m.captured });
        }
      }
    } else if (m.promotion === 'q') {
      const b2 = board.slice();
      b2[sqIndex(m.to)] = { type: 'q', color: m.color };
      b2[sqIndex(m.from)] = null;
      const loss = see(b2, sqIndex(m.to), opp(m.color));
      if (loss < 9) out.push({ kind: 'promotion', uci, san: m.san, gain: 8 - loss, from: m.from, to: m.to, piece: 'p' });
    }
  }
  out.push(...byTarget.values());
  return out.sort((a, b) => b.gain - a.gain);
}

// --------------------------------------------------------------------------
// Clouages et enfilades

export interface LineMotif {
  kind: 'clouage' | 'enfilade';
  absolute: boolean;
  pinner: number;
  front: number;
  back: number;
}

/** Clouages et enfilades exercés par le camp `c` sur le plateau. */
export function findLineMotifs(board: Board, c: Color): LineMotif[] {
  const out: LineMotif[] = [];
  for (let s = 0; s < 64; s++) {
    const p = board[s];
    if (!p || p.color !== c) continue;
    for (const [df, dr] of sliderDirs(p.type)) {
      let f = fileOf(s) + df;
      let r = rankOf(s) + dr;
      let front = -1;
      while (f >= 0 && f < 8 && r >= 0 && r < 8) {
        const j = r * 8 + f;
        const q = board[j];
        if (q) {
          if (q.color === c) break;
          if (front < 0) front = j;
          else {
            const P1 = board[front]!;
            const P2 = q;
            if (P2.type === 'k' && P1.type !== 'k') {
              out.push({ kind: 'clouage', absolute: true, pinner: s, front, back: j });
            } else if (P1.type === 'k') {
              if (VALUE[P2.type] >= 3 || !attackersOf(board, j, opp(c)).length) out.push({ kind: 'enfilade', absolute: true, pinner: s, front, back: j });
            } else if (VALUE[P2.type] > VALUE[P1.type] && (VALUE[P2.type] > VALUE[p.type] || !attackersOf(board, j, opp(c)).length) && P1.type !== 'p') {
              out.push({ kind: 'clouage', absolute: false, pinner: s, front, back: j });
            } else if (VALUE[P1.type] > VALUE[P2.type] && VALUE[P1.type] > VALUE[p.type] && (VALUE[P2.type] > VALUE[p.type] || !attackersOf(board, j, opp(c)).length)) {
              out.push({ kind: 'enfilade', absolute: false, pinner: s, front, back: j });
            }
            break;
          }
        }
        f += df;
        r += dr;
      }
    }
  }
  return out;
}

// --------------------------------------------------------------------------
// Défenseurs surchargés

interface Overload {
  defender: number;
  duties: number[];
}

/** Pièces de `defColor` qui sont l'unique défenseur de deux pièces attaquées par l'adversaire. */
export function findOverloaded(board: Board, defColor: Color): Overload[] {
  const att = opp(defColor);
  const duties = new Map<number, number[]>();
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p || p.color !== defColor || p.type === 'k') continue;
    if (!attackersOf(board, i, att).length) continue;
    if (see(board, i, att) > 0) continue; // déjà en prise : pas une question de surcharge
    const defs = attackersOf(board, i, defColor);
    if (defs.length !== 1) continue;
    const d = defs[0];
    const without = board.slice();
    without[d] = null;
    if (see(without, i, att) <= 0) continue;
    duties.set(d, [...(duties.get(d) ?? []), i]);
  }
  return [...duties.entries()].filter(([, l]) => l.length >= 2).map(([defender, l]) => ({ defender, duties: l }));
}

// --------------------------------------------------------------------------
// Motifs créés par un coup

export type MotifKind =
  | 'mat'
  | 'echec_double'
  | 'fourchette'
  | 'decouverte'
  | 'clouage'
  | 'enfilade'
  | 'menace_mat'
  | 'capture'
  | 'echange'
  | 'sacrifice'
  | 'surcharge'
  | 'deviation'
  | 'promotion'
  | 'menace_promotion'
  | 'enprise'
  | 'echec';

export interface Motif {
  kind: MotifKind;
  /** true = motif favorable au camp qui joue ; false = problème créé par le coup. */
  good: boolean;
  /** Matériel en jeu (pions) ; 100 pour un mat. */
  gain: number;
  text: string;
  /** Formule courte (verbe au singulier, sujet = le coup) pour les titres : « gagne le cavalier en c6 ». */
  short: string;
  arrows: BoardArrow[];
  marks: SquareMark[];
}

const PRIORITY: Record<MotifKind, number> = {
  mat: 100,
  echec_double: 80,
  fourchette: 70,
  decouverte: 68,
  menace_mat: 66,
  enfilade: 64,
  clouage: 60,
  deviation: 58,
  surcharge: 56,
  promotion: 55,
  capture: 50,
  sacrifice: 48,
  echange: 30,
  menace_promotion: 40,
  enprise: 45,
  echec: 10,
};

export function motifScore(m: Motif): number {
  return PRIORITY[m.kind] + Math.min(m.gain, 20) * 2;
}

function arrow(from: number | string, to: number | string, kind: BoardArrow['kind']): BoardArrow {
  return { from: (typeof from === 'number' ? sqName(from) : from) as Square, to: (typeof to === 'number' ? sqName(to) : to) as Square, kind };
}
function mark(sq: number | string, kind: SquareMark['kind']): SquareMark {
  return { square: (typeof sq === 'number' ? sqName(sq) : sq) as Square, kind };
}

function targetValue(board: Board, from: number, t: number): boolean {
  const mover = board[from]!;
  const tp = board[t]!;
  if (tp.type === 'k') return true;
  if (VALUE[tp.type] > VALUE[mover.type]) return true;
  return seeCapture(board, from, t) > 0;
}

function listFr(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
}

/**
 * Analyse un coup et renvoie les motifs tactiques qu'il crée, triés par importance.
 * `fen` = position avant le coup, `uci` = le coup.
 */
export function detectMotifs(fen: string, uci: string): Motif[] {
  const chess = new Chess(fen);
  let move: Move;
  try {
    move = chess.move(parseUci(uci));
  } catch {
    return [];
  }
  const c = move.color;
  const e = opp(c);
  const before = boardFromFen(fen);
  const after = boardFromFen(chess.fen());
  const from = sqIndex(move.from);
  const to = sqIndex(move.to);
  const mover = after[to]!;
  const motifs: Motif[] = [];
  const P = (i: number) => pieceAt(after[i]?.type ?? before[i]!.type, sqName(i));

  // Mat
  if (chess.isCheckmate()) {
    motifs.push({ kind: 'mat', good: true, gain: 100, short: 'donne échec et mat', text: `${move.san} est échec et mat : le roi n'a plus aucune case et l'échec ne peut être ni paré ni bloqué.`, arrows: [arrow(from, to, 'good')], marks: [mark(findKing(after, e), 'target')] });
    return motifs;
  }

  const moverSafe = see(after, to, e) === 0;

  // Captures
  let captureHandled = false;
  if (move.captured) {
    captureHandled = true;
    const capType = move.captured;
    let gain: number;
    if (move.isEnPassant()) gain = 1 - see(after, to, e);
    else gain = seeCapture(before, from, to);
    const defended = attackersOf(before, to, e).length > 0 && !move.isEnPassant();
    const capWhat = pieceAt(capType, move.to);
    if (gain > 0 && !defended) {
      motifs.push({ kind: 'capture', good: true, gain, short: `gagne ${capWhat}, qui n'était pas défendu${FEMININE[capType] ? 'e' : ''}`, text: `${move.san} prend gratuitement ${capWhat}, qui n'était défendu par rien : on gagne ${gainText(gain)}.`, arrows: [arrow(from, to, 'good')], marks: [mark(to, 'hanging')] });
    } else if (gain > 0) {
      motifs.push({ kind: 'capture', good: true, gain, short: `gagne du matériel en ${move.to} (${gainText(gain)})`, text: `${move.san} gagne du matériel : ${theP(move.piece)} prend ${capWhat} et, même après les reprises, le bilan de l'échange est positif (${gainText(gain)}).`, arrows: [arrow(from, to, 'good')], marks: [mark(to, 'target')] });
    } else if (gain === 0) {
      const same = capType === move.piece || VALUE[capType] === VALUE[move.piece];
      motifs.push({ kind: 'echange', good: true, gain: 0, short: `échange en ${move.to}`, text: same ? `${move.san} échange ${capType === move.piece ? 'les ' + pluralP(capType) : 'des pièces de même valeur'} en ${move.to}.` : `${move.san} prend ${capWhat} ; l'échange qui suit est équilibré en matériel.`, arrows: [arrow(from, to, 'idea')], marks: [] });
    } else {
      motifs.push({ kind: 'sacrifice', good: true, gain: -gain, short: `sacrifie ${theP(move.piece)} en ${move.to}`, text: `${move.san} donne du matériel : ${theP(move.piece)} prend ${capWhat} mais peut être repris, ce qui coûte ${gainText(-gain)}. C'est un sacrifice : il n'a de sens que si la suite rapporte plus (attaque, mat, pièce regagnée).`, arrows: [arrow(from, to, 'threat')], marks: [mark(to, 'target')] });
    }
  }

  // Pièces laissées en prise
  const hangBefore = new Set(hangingPieces(before, c).map((h) => h.square));
  for (const h of hangingPieces(after, c)) {
    const isMover = h.square === move.to;
    if (isMover && captureHandled) continue;
    if (!isMover && hangBefore.has(h.square)) continue;
    const who = isMover ? `${theP(h.type)} qui vient d'aller en ${h.square}` : pieceAt(h.type, h.square);
    const why = !h.defenders.length ? 'n’est défendu par rien' : 'est attaqué par une pièce de moindre valeur ou plus de fois qu’il n’est défendu';
    const text = isMover && !move.captured
      ? `Attention : ${who} ${why} — l'adversaire peut le prendre (${gainText(h.loss)}) à moins d'avoir mieux à faire.`
      : `Attention : après ${move.san}, ${who} ${why} (perte possible : ${gainText(h.loss)}).`;
    motifs.push({ kind: 'enprise', good: false, gain: h.loss, short: `laisse ${pieceAt(h.type, h.square)} en prise`, text, arrows: h.attackers.slice(0, 2).map((a) => arrow(a, h.square, 'bad')), marks: [mark(h.square, 'hanging')] });
  }

  // Échec / échec double
  const kingSq = findKing(after, e);
  const isCheck = chess.inCheck();
  if (isCheck && kingSq >= 0) {
    const checkers = attackersOf(after, kingSq, c);
    if (checkers.length >= 2) {
      motifs.push({ kind: 'echec_double', good: true, gain: 3, short: 'donne un échec double qui oblige le roi à bouger', text: `${move.san} est un échec double : ${listFr(checkers.map(P))} donnent échec en même temps. On ne peut ni prendre les deux pièces ni s'interposer deux fois : le roi est obligé de bouger.`, arrows: checkers.map((s) => arrow(s, kingSq, 'good')), marks: [mark(kingSq, 'target')] });
    }
  }

  // Fourchette (attaque double par la pièce jouée)
  if (moverSafe) {
    const targets = attacksFrom(after, to).filter((t) => after[t]?.color === e && targetValue(after, to, t));
    if (targets.length >= 2) {
      const vals = targets.map((t) => (after[t]!.type === 'k' ? 100 : VALUE[after[t]!.type])).sort((a, b) => b - a);
      const gain = vals[1];
      const names = targets.map((t) => (after[t]!.type === 'k' ? 'le roi (échec)' : P(t)));
      const kind = mover.type === 'p' ? 'de pion' : mover.type === 'n' ? 'de cavalier' : mover.type === 'q' ? 'de dame' : '';
      motifs.push({
        kind: 'fourchette',
        good: true,
        gain: Math.max(1, gain),
        short: `fait une fourchette sur ${listFr(names.map((n) => n.replace(' (échec)', '')))}`,
        text: `Fourchette${kind ? ' ' + kind : ''} : ${theP(mover.type)} en ${move.to} attaque en même temps ${listFr(names)}. L'adversaire ne pourra pas tout sauver${targets.some((t) => after[t]!.type === 'k') ? ' : il doit d’abord parer l’échec' : ''}.`,
        arrows: targets.map((t) => arrow(to, t, 'good')),
        marks: targets.map((t) => mark(t, 'target')),
      });
    }
  }

  // Attaque à la découverte
  for (let s = 0; s < 64; s++) {
    const sp = after[s];
    if (!sp || sp.color !== c || s === to || !sliderDirs(sp.type).length) continue;
    const beforeTargets = new Set(attacksFrom(before, s));
    const fresh = attacksFrom(after, s).filter((t) => !beforeTargets.has(t) && after[t]?.color === e && targetValue(after, s, t));
    if (!fresh.length) continue;
    const t = fresh.sort((a, b) => VALUE[after[b]!.type] - VALUE[after[a]!.type])[0];
    const isK = after[t]!.type === 'k';
    const moverThreat = attacksFrom(after, to).some((x) => after[x]?.color === e && x !== t && targetValue(after, to, x));
    motifs.push({
      kind: 'decouverte',
      good: true,
      gain: isK ? 3 : VALUE[after[t]!.type],
      short: isK ? 'donne un échec à la découverte' : `démasque une attaque sur ${P(t)}`,
      text: isK
        ? `Échec à la découverte : en bougeant, ${theP(move.piece)} libère la ligne ${ofPieceAt(sp.type, sqName(s))} qui donne échec au roi${moverThreat ? ', pendant que la pièce jouée crée sa propre menace' : ''}.`
        : `Attaque à la découverte : ${theP(move.piece)} s'écarte et démasque ${pieceAt(sp.type, sqName(s))}, qui attaque maintenant ${P(t)}${moverThreat ? ' ; la pièce jouée menace autre chose en même temps, l’adversaire ne peut pas tout parer' : ''}.`,
      arrows: [arrow(s, t, 'good'), arrow(from, to, 'idea')],
      marks: [mark(t, 'target')],
    });
    break;
  }

  // Clouages / enfilades nouveaux
  const key = (m: LineMotif) => `${m.kind}:${m.front}:${m.back}`;
  const oldLines = new Set(findLineMotifs(before, c).map(key));
  for (const lm of findLineMotifs(after, c)) {
    if (oldLines.has(key(lm))) continue;
    const pinner = pieceAt(after[lm.pinner]!.type, sqName(lm.pinner));
    const front = after[lm.front]!;
    const back = after[lm.back]!;
    if (lm.kind === 'clouage') {
      const winnable = see(after, lm.front, c) > 0 || attackersOf(after, lm.front, c).length > attackersOf(after, lm.front, e).length;
      const text = lm.absolute
        ? `${capital(pinner)} cloue ${P(lm.front)} sur le roi : cette pièce ne peut plus bouger du tout (cela exposerait le roi), elle est paralysée${winnable ? ' et on peut l’attaquer encore pour la gagner' : ''}.`
        : `${capital(pinner)} cloue ${P(lm.front)} devant ${P(lm.back)} : si elle bouge, ${theP(back.type)} est perdu${FEMININE[back.type] ? 'e' : ''}. C'est un clouage relatif, la pièce est gênée dans ses mouvements${winnable ? ' et peut devenir une cible' : ''}.`;
      motifs.push({ kind: 'clouage', good: true, gain: winnable ? VALUE[front.type] : 1, short: `cloue ${P(lm.front)}${lm.absolute ? ' sur le roi' : ` devant ${P(lm.back)}`}`, text, arrows: [arrow(lm.pinner, lm.back, 'good')], marks: [mark(lm.front, 'target')] });
    } else {
      const text = front.type === 'k'
        ? `Enfilade : ${pinner} donne échec et, une fois le roi écarté, ${P(lm.back)} placé${FEMININE[back.type] ? 'e' : ''} derrière lui sur la même ligne tombe.`
        : `Enfilade : ${pinner} attaque ${P(lm.front)} ; si elle s'enfuit, ${P(lm.back)}, juste derrière sur la même ligne, est pris${FEMININE[back.type] ? 'e' : ''}.`;
      motifs.push({ kind: 'enfilade', good: true, gain: VALUE[back.type], short: `fait une enfilade qui vise ${P(lm.back)}`, text, arrows: [arrow(lm.pinner, lm.back, 'good')], marks: [mark(lm.front, 'target'), mark(lm.back, 'target')] });
    }
  }

  // Défenseur surchargé
  const oldOver = new Set(findOverloaded(before, e).map((o) => o.defender));
  for (const o of findOverloaded(after, e)) {
    if (oldOver.has(o.defender)) continue;
    motifs.push({
      kind: 'surcharge',
      good: true,
      gain: Math.min(...o.duties.map((d) => VALUE[after[d]!.type])),
      short: `exploite la surcharge ${ofPieceAt(after[o.defender]!.type, sqName(o.defender))}`,
      text: `${capital(P(o.defender))} est surchargé${FEMININE[after[o.defender]!.type] ? 'e' : ''} : c'est le seul défenseur de ${listFr(o.duties.map(P))}. Il ne peut pas remplir les deux missions à la fois.`,
      arrows: o.duties.map((d) => arrow(o.defender, d, 'threat')),
      marks: [mark(o.defender, 'weak')],
    });
    break;
  }

  // Déviation : la reprise naturelle abandonne une autre pièce
  if (move.captured && !isCheck) {
    const recapturers = attackersOf(after, to, e).filter((a) => after[a]!.type !== 'k' || !attackersOf(after, to, c).length);
    if (recapturers.length === 1) {
      const d = recapturers[0];
      const b3 = after.slice();
      b3[to] = b3[d];
      b3[d] = null;
      const hangNow = new Set(hangingPieces(after, e).map((h) => h.square));
      const deflected = hangingPieces(b3, e).find((h) => !hangNow.has(h.square) && h.square !== sqName(to) && attackersOf(after, sqIndex(h.square), e).includes(d));
      if (deflected) {
        motifs.push({
          kind: 'deviation',
          good: true,
          gain: deflected.loss,
          short: `dévie ${P(d)} de sa mission de défense`,
          text: `Déviation : si ${P(d)} reprend en ${move.to}, il abandonne la défense ${ofPieceAt(deflected.type, deflected.square)}, qui devient prenable.`,
          arrows: [arrow(d, to, 'threat')],
          marks: [mark(deflected.square, 'hanging')],
        });
      }
    }
  }

  // Promotion
  if (move.promotion) {
    motifs.push({ kind: 'promotion', good: true, gain: VALUE[move.promotion] - 1, short: `va à ${pieceName(move.promotion)}`, text: `Le pion arrive au bout et se transforme en ${pieceName(move.promotion)}.`, arrows: [arrow(from, to, 'good')], marks: [] });
  } else if (move.piece === 'p' && rankOf(to) === (c === 'w' ? 6 : 1)) {
    const promo = to + (c === 'w' ? 8 : -8);
    if (!after[promo]) {
      motifs.push({ kind: 'menace_promotion', good: true, gain: 3, short: `menace d'aller à dame en ${sqName(promo)}`, text: `Le pion arrive en ${move.to}, à une case de la promotion : il menace d'aller à dame en ${sqName(promo)}, l'adversaire doit s'en occuper.`, arrows: [arrow(to, promo, 'threat')], marks: [mark(promo, 'target')] });
    }
  }

  // Menace de mat (si l'adversaire passait son tour)
  if (!isCheck) {
    const nf = nullMoveFen(chess.fen());
    if (nf) {
      const mateMove = findMateInOne(nf);
      if (mateMove && !findMateInOne(fen)) {
        const mm = parseUci(mateMove);
        const san = new Chess(nf).move(mm).san;
        motifs.push({ kind: 'menace_mat', good: true, gain: 10, short: `menace le mat en ${mm.to} (${san})`, text: `${move.san} menace ${san}, échec et mat ! L'adversaire doit absolument parer cette menace, ce qui lui laisse peu de choix.`, arrows: [arrow(mm.from, mm.to, 'threat')], marks: [mark(findKing(after, e), 'target')] });
      }
    }
  }

  if (isCheck && !motifs.some((m) => m.kind === 'echec_double' || m.kind === 'decouverte' || m.kind === 'fourchette')) {
    motifs.push({ kind: 'echec', good: true, gain: 0, short: 'donne échec', text: `${move.san} donne échec : l'adversaire est obligé d'y répondre, ce qui laisse l'initiative.`, arrows: [arrow(to, kingSq, 'threat')], marks: [] });
  }

  return motifs.sort((a, b) => motifScore(b) - motifScore(a));
}

export function capital(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
