// Repérage des coups écrits en notation française dans un texte (« 23.gxh4 Td2!! », « 22…De7 », « Fxe4+ »)
// et reconstruction des positions correspondantes à partir d'une position de départ.
// Sert à rendre les coups des explications survolables : la position s'affiche sur l'échiquier.
import { Chess, type Move } from 'chess.js';
import { parseUci } from './chessUtils';

const FR_TO_EN: Record<string, string> = { R: 'K', D: 'Q', T: 'R', F: 'B', C: 'N' };

/** « Txc3!! » → « Rxc3 » ; « e8=D+ » → « e8=Q+ » ; « 0-0 » → « O-O ». */
export function frToSan(fr: string): string {
  let s = fr.replace(/[!?]+$/, '').replace(/0-0-0/g, 'O-O-O').replace(/0-0/g, 'O-O');
  if (/^[RDTFC]/.test(s)) s = FR_TO_EN[s[0]] + s.slice(1);
  s = s.replace(/=([DTFC])/, (_, p: string) => '=' + FR_TO_EN[p]);
  return s;
}

/** Notation anglaise → française (pour l'affichage). */
export function sanToFrench(san: string): string {
  const EN_TO_FR: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'F', N: 'C' };
  return san.replace(/[KQRBN]/g, (p) => EN_TO_FR[p]);
}

export interface MoveRef {
  /** Indices dans le texte brut (fin exclue). */
  start: number;
  end: number;
  /** Texte du coup tel qu'écrit (ex. « 23.gxh4 », « Td2!! »). */
  text: string;
  /** Position après le coup, et le coup lui-même. */
  fen: string;
  move: Pick<Move, 'from' | 'to' | 'san'>;
  /** Demi-coup depuis la position de départ (0 = premier coup). */
  ply: number;
  /** Coup cité comme menace (« menace Fxe4+ ») : montré comme si l'adversaire passait son tour. */
  threat?: boolean;
}

/** Même position, l'autre camp au trait (« et si l'adversaire passait son tour ? »). Null si le camp au trait est en échec. */
function nullMove(fen: string): string | null {
  const p = fen.split(' ');
  try {
    if (new Chess(fen).inCheck()) return null;
  } catch {
    return null;
  }
  const black = p[1] === 'b';
  const next = [p[0], black ? 'w' : 'b', p[2], '-', p[4], String(parseInt(p[5], 10) + (black ? 1 : 0))].join(' ');
  try {
    new Chess(next);
    return next;
  } catch {
    return null;
  }
}

// numéro optionnel (« 23. », « 23… », « 23... », « … ») puis le coup
const MOVE_RE =
  /(?<![\p{L}\d])(?:(\d{1,3})\s*(\.\.\.|…|\.)\s*|(…|\.\.\.)\s*)?(O-O-O|O-O|0-0-0|0-0|[RDTFC][a-h]?[1-8]?x?[a-h][1-8]|[a-h](?:x[a-h])?[1-8](?:=[DTFC])?)([+#])?([!?]{0,2})(?![\p{L}\d])/gu;

function replay(fen: string, line: string[]): Chess | null {
  const c = new Chess(fen);
  for (const u of line) {
    try {
      c.move(parseUci(u));
    } catch {
      return null;
    }
  }
  return c;
}

function tryMove(fen: string, base: string[], ply: number, san: string): { line: string[]; move: Move; fen: string } | null {
  if (ply < 0 || base.length < ply) return null;
  const prefix = base.slice(0, ply);
  const c = replay(fen, prefix);
  if (!c) return null;
  try {
    const m = c.move(san, { strict: false });
    return { line: [...prefix, m.from + m.to + (m.promotion ?? '')], move: m, fen: c.fen() };
  } catch {
    return null;
  }
}

/**
 * Trouve les coups d'un texte et les rejoue depuis `startFen`.
 * - un coup numéroté se place au bon demi-coup (« 23… » = coup noir du 23e coup) ;
 * - un coup sans numéro qui suit directement un autre coup en est la continuation ;
 * - un coup isolé sans numéro n'est retenu que s'il est jouable depuis la position de départ.
 * Les variantes se construisent au fil du texte : on essaie d'abord la dernière ligne citée, puis la ligne principale.
 */
export function findMoves(text: string, startFen: string, mainline: string[] = [], opts: { standalone?: boolean } = {}): MoveRef[] {
  const allowStandalone = opts.standalone ?? true;
  const parts = startFen.split(' ');
  const startBlack = parts[1] === 'b';
  const startNo = parseInt(parts[5] ?? '1', 10) || 1;
  const out: MoveRef[] = [];
  let current: string[] = [];
  let prev: { end: number; ply: number } | null = null;

  for (const m of text.matchAll(MOVE_RE)) {
    const [whole, num, sep, bareDots, body, check = ''] = m;
    const start = m.index ?? 0;
    const end = start + whole.length;
    const san = frToSan(body + check);
    // Une case seule (« en d5 ») sans numéro ni continuation n'est pas un coup.
    const isPawnPush = /^[a-h][1-8]$/.test(body);
    const gap = prev ? text.slice(prev.end, start) : null;
    const continuation = !!prev && /^[\s*]*$/.test(gap ?? 'x');
    const push = (fen: string, mv: Move, ply: number, threat = false) =>
      out.push({ start, end, text: whole, fen, move: { from: mv.from, to: mv.to, san: mv.san }, ply, threat });

    let ply: number | null = null;
    if (num) {
      const black = sep !== '.';
      ply = (parseInt(num, 10) - startNo) * 2 + (black ? 1 : 0) - (startBlack ? 1 : 0);
    } else if (continuation) {
      ply = prev!.ply + 1;
    } else if (bareDots) {
      ply = startBlack ? 0 : 1;
    }

    if (ply !== null) {
      const res = ply >= 0 ? (tryMove(startFen, current, ply, san) ?? tryMove(startFen, mainline, ply, san)) : null;
      if (!res) {
        prev = null;
        continue;
      }
      current = res.line;
      prev = { end, ply };
      push(res.fen, res.move, ply);
      continue;
    }

    // Coup isolé sans numéro : d'abord une menace dans la position en cours (« menace Fxe4+ »),
    // sinon un coup jouable depuis la position de départ. Il ne modifie pas la ligne en cours.
    prev = null;
    if (isPawnPush) continue;
    // Menace seulement si le texte l'annonce (« menace Fxe4+ », « menaçant … », « avec l'idée … »).
    const announcesThreat = /(menace|menaç|l[’']idée|qui vise|prépare)[^.;:()]{0,25}$/i.test(text.slice(Math.max(0, start - 40), start));
    if (current.length && announcesThreat) {
      const c = replay(startFen, current);
      const threat = c ? nullMove(c.fen()) : null;
      if (threat) {
        try {
          const t = new Chess(threat);
          const mv = t.move(san, { strict: false });
          push(t.fen(), mv, current.length, true);
          continue;
        } catch {
          /* pas une menace jouable : on essaie depuis le départ */
        }
      }
    }
    const res = allowStandalone ? tryMove(startFen, [], 0, san) : null;
    if (res) {
      if (!out.length) {
        current = res.line;
        prev = { end, ply: 0 };
      }
      push(res.fen, res.move, 0);
    }
  }
  return out;
}

/** Libellé numéroté en notation française : « 23. gxh4 », « 22… Txc3 ». */
export function frenchPlyLabel(startFen: string, ply: number, san: string): string {
  const parts = startFen.split(' ');
  const startBlack = parts[1] === 'b';
  const startNo = parseInt(parts[5] ?? '1', 10) || 1;
  const abs = ply + (startBlack ? 1 : 0);
  const no = startNo + Math.floor(abs / 2);
  return `${no}${abs % 2 === 0 ? '.' : '…'} ${sanToFrench(san)}`;
}
