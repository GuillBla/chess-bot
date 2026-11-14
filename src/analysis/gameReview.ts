// Revue complète d'une partie : analyse Stockfish de chaque position, classification des coups,
// explications des moments clés, catégorisation des erreurs et rapport agrégé multi-parties.
import { Chess, type Square } from 'chess.js';
import { getAnalysisEngine, type AnalysisResult, type EngineLine } from '../engine/stockfish';
import { formatLine, PIECE_VALUES, playUci, pvToSan } from '../lib/chessUtils';
import { explainMove } from './explain';
import type { MoveExplanation } from './types';
import { lessons } from '../content/lessons';
import { classifyMove, gameAccuracy, isError, lineCp, MATE_CP, MOVE_CLASS_LABELS, winPercent, type MoveClass } from './classify';
import { baseTimeSeconds, parsePgnHeaders, type GameSummary, type OpeningInfo, type Outcome, type TimeClass } from '../api/chesscom';

export const REVIEW_VERSION = 1;
const REVIEW_PREFIX = `chessbot:review:v${REVIEW_VERSION}:`;

export type Phase = 'ouverture' | 'milieu' | 'finale';
export const PHASE_LABELS: Record<Phase, string> = { ouverture: 'Ouverture', milieu: 'Milieu de partie', finale: 'Finale' };

export type ErrorCategory =
  | 'piece-en-prise'
  | 'tactique-adverse'
  | 'tactique-manquee'
  | 'ouverture'
  | 'milieu'
  | 'finale'
  | 'conversion'
  | 'defense'
  | 'temps';

export const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  'piece-en-prise': 'Pièce laissée en prise',
  'tactique-adverse': 'Tactique adverse non vue',
  'tactique-manquee': 'Tactique manquée pour soi',
  ouverture: "Erreur dans l'ouverture",
  milieu: 'Erreur en milieu de partie',
  finale: 'Erreur en finale',
  conversion: "Mauvaise conversion d'une position gagnante",
  defense: 'Erreur en position difficile',
  temps: 'Erreur sous pression du temps',
};

export interface ReviewedMove {
  ply: number; // 0 = premier coup
  san: string;
  uci: string;
  color: 'white' | 'black';
  fenBefore: string;
  fenAfter: string;
  /** Évaluations point de vue des Blancs (cp, mat = ±10000). */
  evalBefore: number;
  evalAfter: number;
  bestUci: string | null;
  bestSan: string | null;
  bestLine: string;
  cls: MoveClass;
  /** Perte de win% (point de vue du joueur qui a joué). */
  winLoss: number;
  accuracy: number;
  /** Temps restant (s) après le coup, si `%clk` présent. */
  clock: number | null;
  phase: Phase;
  categories: ErrorCategory[];
  explanation?: MoveExplanation;
}

export type ClassCounts = Record<MoveClass, number>;

export interface GameReview {
  version: number;
  url: string;
  pgn: string;
  playerColor: 'white' | 'black';
  depth: number;
  createdAt: number;
  startFen: string;
  /** Éval (Blancs) de chaque position, index 0 = position initiale. */
  evals: number[];
  moves: ReviewedMove[];
  accuracy: { white: number | null; black: number | null };
  counts: { white: ClassCounts; black: ClassCounts };
  /** Index (dans moves) des moments clés, du plus coûteux au moins coûteux. */
  keyMoments: number[];
  meta: {
    opening: OpeningInfo;
    outcome?: Outcome;
    opponent?: string;
    timeClass?: TimeClass;
    endTime?: number;
    white: string;
    black: string;
  };
}

export interface ReviewProgress {
  done: number;
  total: number;
  phase: 'analyse' | 'explications';
}

export interface ReviewOptions {
  playerColor: 'white' | 'black';
  url: string;
  summary?: GameSummary;
  depth?: number;
  signal?: AbortSignal;
  onProgress?: (p: ReviewProgress) => void;
  /** Nombre max de moments clés expliqués. */
  maxKeyMoments?: number;
}

// ---------------------------------------------------------------------------
// PGN
// ---------------------------------------------------------------------------

export interface ParsedMove {
  san: string;
  uci: string;
  from: Square;
  to: Square;
  color: 'w' | 'b';
  fenBefore: string;
  fenAfter: string;
}

export interface ParsedGame {
  startFen: string;
  moves: ParsedMove[];
  /** Temps restant (s) après chaque demi-coup, ou null. */
  clocks: (number | null)[];
  headers: Record<string, string>;
}

/** Extrait les `[%clk h:mm:ss.s]` dans l'ordre des coups (format chess.com : un commentaire par coup). */
export function parseClocks(pgn: string): number[] {
  const body = pgn.replace(/^\[.*\]\s*$/gm, '');
  const out: number[] = [];
  for (const m of body.matchAll(/\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/g)) {
    out.push(+m[1] * 3600 + +m[2] * 60 + parseFloat(m[3]));
  }
  return out;
}

export function parseGame(pgn: string): ParsedGame {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const headers = parsePgnHeaders(pgn);
  const history = chess.history({ verbose: true });
  const startFen = history[0]?.before ?? chess.fen();
  const moves: ParsedMove[] = history.map((m) => ({
    san: m.san,
    from: m.from,
    to: m.to,
    color: m.color,
    fenBefore: m.before,
    fenAfter: m.after,
    uci: m.from + m.to + (m.promotion ?? ''),
  }));
  const raw = parseClocks(pgn);
  const clocks = moves.map((_, i) => (raw.length === moves.length ? raw[i] : null));
  return { startFen, moves, clocks, headers };
}

// ---------------------------------------------------------------------------
// Heuristiques
// ---------------------------------------------------------------------------

export function phaseOf(fen: string): Phase {
  const [board, , , , , full] = fen.split(' ');
  let pieces = 0;
  let queens = 0;
  for (const ch of board) {
    if ('nbrqNBRQ'.includes(ch)) pieces++;
    if (ch === 'q' || ch === 'Q') queens++;
  }
  if (pieces <= 6 || (queens === 0 && pieces <= 8)) return 'finale';
  if (parseInt(full ?? '1', 10) <= 12 && pieces >= 12) return 'ouverture';
  return 'milieu';
}

/** Pièce (≥ 3) en prise sur `sq` dans `chess` : attaquée et non défendue, ou attaquée par une pièce de moindre valeur. */
function isHanging(chess: Chess, sq: Square): boolean {
  const p = chess.get(sq);
  if (!p || p.type === 'k') return false;
  const value = PIECE_VALUES[p.type];
  if (value < 3) return false;
  const opp = p.color === 'w' ? 'b' : 'w';
  const attackers = chess.attackers(sq, opp);
  if (attackers.length === 0) return false;
  if (chess.attackers(sq, p.color).length === 0) return true;
  return attackers.some((a) => PIECE_VALUES[chess.get(a)!.type] < value);
}

/**
 * Le coup joué a-t-il laissé une pièce en prise que l'adversaire capture dans sa variation principale
 * (dans ses 2 premiers coups) ?
 */
function leftPieceHanging(fenBefore: string, fenAfter: string, oppPv: string[] | undefined, movedTo?: Square): boolean {
  const before = new Chess(fenBefore);
  const after = new Chess(fenAfter);
  // Cas le plus courant : la pièce qu'on vient de jouer arrive sur une case où elle est en prise.
  if (movedTo && isHanging(after, movedTo)) return true;
  if (!oppPv?.length) return false;
  const me = before.turn();
  for (const k of [0, 2]) {
    const uci = oppPv[k];
    if (!uci) break;
    const to = uci.slice(2, 4) as Square;
    const victim = after.get(to);
    if (!victim || victim.color !== me || !isHanging(after, to)) continue;
    // La pièce n'était pas déjà en prise avant le coup (sinon ce n'est pas ce coup qui l'a « laissée »).
    const wasHanging = before.get(to)?.type === victim.type && isHanging(before, to);
    if (!wasHanging || k === 0) return true;
  }
  return false;
}

function isForcing(fen: string, uci: string | undefined): boolean {
  if (!uci) return false;
  const r = playUci(fen, uci);
  return !!r && (r.move.isCapture() || r.move.san.includes('+') || r.move.san.includes('#'));
}

function terminalWhiteCp(fen: string): number | null {
  const chess = new Chess(fen);
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -MATE_CP : MATE_CP;
  if (chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) return 0;
  return null;
}

function emptyCounts(): ClassCounts {
  return { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, miss: 0 };
}

function abortError() {
  return new DOMException('Analyse annulée', 'AbortError');
}

// ---------------------------------------------------------------------------
// Revue
// ---------------------------------------------------------------------------

export async function reviewGame(pgn: string, opts: ReviewOptions): Promise<GameReview> {
  const depth = opts.depth ?? 12;
  const { signal } = opts;
  const parsed = parseGame(pgn);
  const { moves, clocks, headers } = parsed;
  if (moves.length === 0) throw new Error('Cette partie ne contient aucun coup.');

  const engine = getAnalysisEngine();
  const onAbort = () => engine.stop();
  signal?.addEventListener('abort', onAbort);

  try {
    // 1) Analyse de chaque position (n coups => n + 1 positions).
    const fens = [parsed.startFen, ...moves.map((m) => m.fenAfter)];
    const analyses: (AnalysisResult | null)[] = [];
    const evals: number[] = [];
    await engine.newGame();
    for (let i = 0; i < fens.length; i++) {
      if (signal?.aborted) throw abortError();
      const terminal = terminalWhiteCp(fens[i]);
      if (terminal !== null) {
        analyses.push(null);
        evals.push(terminal);
      } else {
        const a = await engine.analyse(fens[i], { depth, multipv: 3 });
        if (signal?.aborted) throw abortError();
        analyses.push(a);
        const best = a.lines[0];
        const cp = best ? lineCp(best) : 0;
        evals.push(fens[i].split(' ')[1] === 'w' ? cp : -cp);
      }
      opts.onProgress?.({ done: i + 1, total: fens.length, phase: 'analyse' });
    }

    // 2) Classification.
    const base = baseTimeSeconds(headers.TimeControl ?? '');
    const reviewed: ReviewedMove[] = [];
    let prevErred = false;
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      const color = m.color === 'w' ? 'white' : 'black';
      const sign = m.color === 'w' ? 1 : -1;
      const beforeCp = sign * evals[i];
      const afterCp = sign * evals[i + 1];
      const a = analyses[i];
      const bestUci = a?.bestMove ?? a?.lines[0]?.pv[0] ?? null;
      const c = classifyMove({ beforeCp, afterCp, isBest: bestUci === m.uci, opponentErred: prevErred });
      prevErred = isError(c.cls);
      const phase = phaseOf(m.fenBefore);
      const clock = clocks[i];

      const categories: ErrorCategory[] = [];
      if (isError(c.cls)) {
        const after = analyses[i + 1];
        const reply = after?.lines[0]?.pv[0];
        const hanging = leftPieceHanging(m.fenBefore, m.fenAfter, after?.lines[0]?.pv, m.to);
        if (hanging) categories.push('piece-en-prise');
        const l0 = a?.lines[0];
        const l1 = a?.lines[1];
        const onlyMove = !l1 || (l0 ? lineCp(l0) - lineCp(l1) >= 150 : false);
        if (bestUci && bestUci !== m.uci && isForcing(m.fenBefore, bestUci) && onlyMove && beforeCp > -200)
          categories.push('tactique-manquee');
        if (!hanging && (isForcing(m.fenAfter, reply) || c.winLoss >= 25) && afterCp < beforeCp - 150)
          categories.push('tactique-adverse');
        categories.push(phase);
        if (beforeCp >= 300) categories.push('conversion');
        if (beforeCp <= -300) categories.push('defense');
        if (clock !== null && (clock < 30 || (base !== null && clock < base * 0.1))) categories.push('temps');
      }

      reviewed.push({
        ply: i,
        san: m.san,
        uci: m.uci,
        color,
        fenBefore: m.fenBefore,
        fenAfter: m.fenAfter,
        evalBefore: evals[i],
        evalAfter: evals[i + 1],
        bestUci,
        bestSan: bestUci ? (pvToSan(m.fenBefore, [bestUci])[0] ?? null) : null,
        bestLine: a?.lines[0] ? formatLine(m.fenBefore, a.lines[0].pv, 6) : '',
        cls: c.cls,
        winLoss: c.winLoss,
        accuracy: c.accuracy,
        clock,
        phase,
        categories,
      });
    }

    // 3) Moments clés (erreurs du joueur, les plus coûteuses d'abord) + explications.
    const maxKey = opts.maxKeyMoments ?? 6;
    const keyMoments = reviewed
      .map((r, idx) => ({ r, idx }))
      .filter(({ r }) => r.color === opts.playerColor && isError(r.cls))
      .sort((x, y) => y.r.winLoss - x.r.winLoss)
      .slice(0, maxKey)
      .map(({ idx }) => idx);
    for (let k = 0; k < keyMoments.length; k++) {
      if (signal?.aborted) throw abortError();
      const idx = keyMoments[k];
      const a = analyses[idx];
      if (!a) continue;
      const afterLine: EngineLine | undefined = analyses[idx + 1]?.lines[0];
      try {
        reviewed[idx].explanation = explainMove(reviewed[idx].fenBefore, reviewed[idx].uci, a, {
          afterLine,
          severityLabel: MOVE_CLASS_LABELS[reviewed[idx].cls],
        });
      } catch (e) {
        console.warn('explainMove a échoué', e);
      }
      opts.onProgress?.({ done: k + 1, total: keyMoments.length, phase: 'explications' });
    }

    const counts = { white: emptyCounts(), black: emptyCounts() };
    for (const r of reviewed) counts[r.color][r.cls]++;
    const firstMover = moves[0].color === 'w' ? 'white' : 'black';
    const s = opts.summary;
    const review: GameReview = {
      version: REVIEW_VERSION,
      url: opts.url,
      pgn,
      playerColor: opts.playerColor,
      depth,
      createdAt: Date.now(),
      startFen: parsed.startFen,
      evals,
      moves: reviewed,
      accuracy: {
        white: gameAccuracy(evals, 'white', firstMover),
        black: gameAccuracy(evals, 'black', firstMover),
      },
      counts,
      keyMoments,
      meta: {
        opening: s?.opening ?? { eco: headers.ECO ?? '?', name: 'Inconnue', family: 'Inconnue', url: headers.ECOUrl },
        outcome: s?.outcome,
        opponent: s?.opponent,
        timeClass: s?.timeClass,
        endTime: s?.endTime,
        white: headers.White ?? 'Blancs',
        black: headers.Black ?? 'Noirs',
      },
    };
    saveReview(review);
    return review;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

// ---------------------------------------------------------------------------
// Cache localStorage
// ---------------------------------------------------------------------------

export function loadReview(url: string): GameReview | null {
  try {
    const raw = localStorage.getItem(REVIEW_PREFIX + url);
    if (!raw) return null;
    const r = JSON.parse(raw) as GameReview;
    return r.version === REVIEW_VERSION ? r : null;
  } catch {
    return null;
  }
}

export function saveReview(review: GameReview): void {
  const raw = JSON.stringify(review);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      localStorage.setItem(REVIEW_PREFIX + review.url, raw);
      return;
    } catch {
      // Quota : on supprime la revue la plus ancienne et on réessaie.
      const all = listReviews();
      if (all.length === 0) return;
      const oldest = all.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));
      deleteReview(oldest.url);
    }
  }
}

export function deleteReview(url: string): void {
  try {
    localStorage.removeItem(REVIEW_PREFIX + url);
  } catch {
    /* ignore */
  }
}

export function listReviews(): GameReview[] {
  const out: GameReview[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(REVIEW_PREFIX)) continue;
      const r = loadReview(k.slice(REVIEW_PREFIX.length));
      if (r) out.push(r);
    }
  } catch {
    /* ignore */
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rapport agrégé
// ---------------------------------------------------------------------------

export interface LessonRef {
  id: string;
  title: string;
}

/** Titres des leçons, tirés du contenu (src/content/lessons). */
export const LESSONS: Record<string, string> = Object.fromEntries(lessons.map((l) => [l.id, l.title]));

const CATEGORY_LESSONS: Record<ErrorCategory, { ids: string[]; why: (n: number) => string }> = {
  'piece-en-prise': {
    ids: ['calcul', 'prophylaxie'],
    why: (n) => `Tu as laissé ${n} pièce${n > 1 ? 's' : ''} en prise : prends l'habitude de vérifier, avant chaque coup, ce que ton adversaire peut capturer.`,
  },
  'tactique-adverse': {
    ids: ['prophylaxie', 'calcul'],
    why: (n) => `${n} fois, une tactique adverse t'a échappé : pose-toi systématiquement la question « que menace mon adversaire ? ».`,
  },
  'tactique-manquee': {
    ids: ['tactique-avancee', 'calcul'],
    why: (n) => `Tu es passé ${n} fois à côté d'un coup tactique gagnant : entraîne-toi à chercher d'abord les échecs, captures et menaces.`,
  },
  ouverture: {
    ids: ['bonnes-mauvaises-pieces', 'structures-de-pions'],
    why: (n) => `${n} erreur${n > 1 ? 's' : ''} dès l'ouverture : travaille le développement harmonieux des pièces et les plans liés à la structure.`,
  },
  milieu: {
    ids: ['dynamique-vs-statique', 'attaque-sur-le-roi'],
    why: (n) => `Le milieu de partie concentre ${n} erreur${n > 1 ? 's' : ''} : apprends à choisir un plan selon les déséquilibres de la position.`,
  },
  finale: {
    ids: ['finales-tours', 'finales-pions'],
    why: (n) => `${n} erreur${n > 1 ? 's' : ''} en finale : les finales techniques (tours, pions) rapportent beaucoup de points à ton niveau.`,
  },
  conversion: {
    ids: ['convertir-avantage'],
    why: (n) => `${n} fois, tu as laissé filer une position gagnante : simplifie, élimine le contre-jeu et ne te précipite pas.`,
  },
  defense: {
    ids: ['defense'],
    why: (n) => `${n} erreur${n > 1 ? 's' : ''} commise${n > 1 ? 's' : ''} en position difficile : apprends à compliquer et à tenir les positions inférieures.`,
  },
  temps: {
    ids: ['dynamique-vs-statique'],
    why: (n) => `${n} erreur${n > 1 ? 's' : ''} sous pression du temps : répartis mieux ta réflexion entre les coups critiques et les coups simples.`,
  },
};

export interface Recommendation {
  lesson: LessonRef;
  why: string;
  weight: number;
}

export interface AggregateReport {
  games: number;
  playerMoves: number;
  avgAccuracy: number | null;
  classCounts: ClassCounts;
  categories: { category: ErrorCategory; label: string; count: number; games: number; winLoss: number }[];
  phases: { phase: Phase; label: string; moves: number; errors: number; winLoss: number; avgLoss: number }[];
  openings: { name: string; color: 'white' | 'black'; games: number; errors: number; winLoss: number; avgAccuracy: number | null }[];
  recommendations: Recommendation[];
}

export function aggregateReviews(reviews: GameReview[]): AggregateReport {
  const classCounts = emptyCounts();
  const cat = new Map<ErrorCategory, { count: number; games: Set<string>; winLoss: number }>();
  const phases = new Map<Phase, { moves: number; errors: number; winLoss: number }>();
  (['ouverture', 'milieu', 'finale'] as Phase[]).forEach((p) => phases.set(p, { moves: 0, errors: 0, winLoss: 0 }));
  const openings = new Map<string, { name: string; color: 'white' | 'black'; games: number; errors: number; winLoss: number; acc: number[] }>();
  let playerMoves = 0;
  const accs: number[] = [];

  for (const r of reviews) {
    const acc = r.accuracy[r.playerColor];
    if (acc !== null) accs.push(acc);
    const okey = `${r.playerColor}|${r.meta.opening.family}`;
    const o = openings.get(okey) ?? { name: r.meta.opening.family, color: r.playerColor, games: 0, errors: 0, winLoss: 0, acc: [] };
    o.games++;
    if (acc !== null) o.acc.push(acc);
    for (const m of r.moves) {
      if (m.color !== r.playerColor) continue;
      playerMoves++;
      classCounts[m.cls]++;
      const ph = phases.get(m.phase)!;
      ph.moves++;
      ph.winLoss += m.winLoss;
      if (isError(m.cls)) {
        ph.errors++;
        o.errors++;
        o.winLoss += m.winLoss;
        for (const c of m.categories) {
          const e = cat.get(c) ?? { count: 0, games: new Set<string>(), winLoss: 0 };
          e.count++;
          e.games.add(r.url);
          e.winLoss += m.winLoss;
          cat.set(c, e);
        }
      }
    }
    openings.set(okey, o);
  }

  const categories = [...cat.entries()]
    .map(([category, e]) => ({ category, label: CATEGORY_LABELS[category], count: e.count, games: e.games.size, winLoss: e.winLoss }))
    .sort((a, b) => b.count - a.count || b.winLoss - a.winLoss);

  // Recommandations : on pondère par le nombre d'erreurs et leur coût ; une leçon n'apparaît qu'une fois.
  const recMap = new Map<string, Recommendation>();
  for (const c of categories) {
    const def = CATEGORY_LESSONS[c.category];
    const weight = c.count + c.winLoss / 20;
    def.ids.forEach((id, rank) => {
      const w = weight / (rank + 1);
      const prev = recMap.get(id);
      if (!prev || prev.weight < w) recMap.set(id, { lesson: { id, title: LESSONS[id] ?? id }, why: def.why(c.count), weight: w });
    });
  }

  return {
    games: reviews.length,
    playerMoves,
    avgAccuracy: accs.length ? accs.reduce((a, b) => a + b, 0) / accs.length : null,
    classCounts,
    categories,
    phases: [...phases.entries()].map(([phase, p]) => ({
      phase,
      label: PHASE_LABELS[phase],
      ...p,
      avgLoss: p.moves ? p.winLoss / p.moves : 0,
    })),
    openings: [...openings.values()]
      .map((o) => ({
        name: o.name,
        color: o.color,
        games: o.games,
        errors: o.errors,
        winLoss: o.winLoss,
        avgAccuracy: o.acc.length ? o.acc.reduce((a, b) => a + b, 0) / o.acc.length : null,
      }))
      .sort((a, b) => b.winLoss / b.games - a.winLoss / a.games),
    recommendations: [...recMap.values()].sort((a, b) => b.weight - a.weight).slice(0, 4),
  };
}

/** Pour info : win% du joueur avant un coup donné. */
export function playerWinBefore(m: ReviewedMove): number {
  return winPercent(m.color === 'white' ? m.evalBefore : -m.evalBefore);
}
