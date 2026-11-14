// Symboles et pastilles de classification des coups (feuille de notation, plateau, explications).
import { MOVE_CLASS_LABELS, MOVE_CLASS_SYMBOLS, type MoveClass } from '../../analysis/classify';
import type { BoardBadge } from '../Board';

/** Symbole affiché sur le plateau : toutes les classes ont une pastille. */
export const BADGE_SYMBOLS: Record<MoveClass, string> = {
  best: '★',
  excellent: '✓',
  good: '✓',
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  miss: '✗',
};

/** Symbole affiché dans la feuille de notation : seulement les coups notables (?!, ?, ??, ✗). */
export function sheetSymbol(cls: MoveClass | null | undefined): string | null {
  return cls ? MOVE_CLASS_SYMBOLS[cls] ?? null : null;
}

/** Pastille à poser sur la case d'arrivée d'un coup UCI. */
export function badgeFor(uci: string | null | undefined, cls: MoveClass | null | undefined): BoardBadge | null {
  if (!uci || !cls || uci.length < 4) return null;
  return { square: uci.slice(2, 4), cls, symbol: BADGE_SYMBOLS[cls], title: MOVE_CLASS_LABELS[cls] };
}

/** Numéro de coup avant un coup joué depuis `fen` : « 16. » (Blancs) ou « 16… » (Noirs). */
export function moveNumberLabel(fen: string): string {
  const parts = fen.split(' ');
  const n = parseInt(parts[5] ?? '1', 10) || 1;
  return parts[1] === 'b' ? `${n}…` : `${n}.`;
}
