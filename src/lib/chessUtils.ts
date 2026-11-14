import { Chess, type Move, type Square } from 'chess.js';
import type { EngineLine } from '../engine/stockfish';

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const PIECE_NAMES_FR: Record<string, string> = {
  p: 'pion',
  n: 'cavalier',
  b: 'fou',
  r: 'tour',
  q: 'dame',
  k: 'roi',
};

export const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export const colorName = (c: 'w' | 'b') => (c === 'w' ? 'les Blancs' : 'les Noirs');
export const ColorName = (c: 'w' | 'b') => (c === 'w' ? 'Les Blancs' : 'Les Noirs');

/** Convertit un coup UCI ("e7e8q") en objet {from,to,promotion}. */
export function parseUci(uci: string): { from: Square; to: Square; promotion?: string } {
  return {
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: uci.length > 4 ? uci[4] : undefined,
  };
}

/** Joue un coup UCI sur une copie de la position ; renvoie le Move ou null s'il est illégal. */
export function playUci(fen: string, uci: string): { move: Move; fen: string } | null {
  const chess = new Chess(fen);
  try {
    const move = chess.move(parseUci(uci));
    return { move, fen: chess.fen() };
  } catch {
    return null;
  }
}

/** Convertit une suite de coups UCI en SAN (s'arrête au premier coup illégal). */
export function pvToSan(fen: string, pv: string[], max = pv.length): string[] {
  const chess = new Chess(fen);
  const out: string[] = [];
  for (const uci of pv.slice(0, max)) {
    try {
      out.push(chess.move(parseUci(uci)).san);
    } catch {
      break;
    }
  }
  return out;
}

/** Formate une variation avec numéros de coups : "12. Nf3 Nc6 13. Bb5". */
export function formatLine(fen: string, pv: string[], max = 8): string {
  const sans = pvToSan(fen, pv, max);
  const parts = fen.split(' ');
  let moveNo = parseInt(parts[5] ?? '1', 10);
  let white = parts[1] === 'w';
  const out: string[] = [];
  sans.forEach((san, i) => {
    if (white) out.push(`${moveNo}. ${san}`);
    else out.push(i === 0 ? `${moveNo}… ${san}` : san);
    if (!white) moveNo++;
    white = !white;
  });
  return out.join(' ');
}

/** Score d'une ligne du point de vue des Blancs, en centipions (mat => ±10000). */
export function whiteScore(line: Pick<EngineLine, 'cp' | 'mate'>, turn: 'w' | 'b'): number {
  const sign = turn === 'w' ? 1 : -1;
  if (line.mate !== null) return sign * (line.mate > 0 ? 10000 - line.mate : -10000 - line.mate);
  return sign * (line.cp ?? 0);
}

/** Texte d'évaluation du point de vue des Blancs : "+1.25", "-0.40", "#3", "#-2". */
export function formatScore(line: Pick<EngineLine, 'cp' | 'mate'>, turn: 'w' | 'b'): string {
  const sign = turn === 'w' ? 1 : -1;
  if (line.mate !== null) return `#${sign * line.mate}`;
  const v = (sign * (line.cp ?? 0)) / 100;
  return (v > 0 ? '+' : '') + v.toFixed(2);
}

/** Probabilité de gain (0..1) pour les Blancs à partir d'un score en centipions (formule Lichess). */
export function winProbability(whiteCp: number): number {
  const cp = Math.max(-1000, Math.min(1000, whiteCp));
  return 1 / (1 + Math.exp(-0.00368208 * cp));
}

export function turnOf(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}
