// Choix des lignes à travailler : nouvelles lignes d'abord, puis positions dues, puis le reste.
import type { Opening } from '../content/openings/types';
import { repertoireLines, sideColor, trainingPositions, type OpeningNode, type OpeningTree } from './openingTree';
import type { SrsState } from './openingSrs';

export interface TrainLine {
  opening: Opening;
  tree: OpeningTree;
  line: OpeningNode[];
}

/** Identifiants des positions à mémoriser rencontrées dans la ligne (la position AVANT chacun de nos coups). */
export function lineCardIds(line: OpeningNode[], side: Opening['side']): string[] {
  const c = sideColor(side);
  return line.filter((n) => n.color === c && n.parent).map((n) => n.parent!.id);
}

export function cardIds(opening: Opening, tree: OpeningTree): string[] {
  return trainingPositions(tree, opening.side).map((n) => n.id);
}

const passesThrough = (line: OpeningNode[], nodeId: string) => !nodeId || line.some((n) => n.id === nodeId);

/**
 * Lignes d'une ouverture dans l'ordre de travail conseillé :
 * 1. celles qui contiennent des positions jamais vues (dans l'ordre du PGN : on apprend la ligne principale d'abord) ;
 * 2. celles qui contiennent le plus de positions à réviser ;
 * 3. les autres (entraînement libre).
 */
export function linesToStudy(opening: Opening, tree: OpeningTree, srs: SrsState, throughNodeId = '', now = Date.now()): TrainLine[] {
  const cards = srs[opening.id] ?? {};
  const scored = repertoireLines(tree, opening.side)
    .filter((l) => passesThrough(l, throughNodeId))
    .map((line, order) => {
      const ids = lineCardIds(line, opening.side);
      const unseen = ids.filter((id) => !cards[id]).length;
      const due = ids.filter((id) => cards[id] && cards[id].due <= now).length;
      return { line, order, unseen, due };
    });
  const group = (s: (typeof scored)[number]) => (s.unseen ? 0 : s.due ? 1 : 2);
  scored.sort((a, b) => group(a) - group(b) || (group(a) === 1 ? b.due - a.due : 0) || a.order - b.order);
  return scored.map((s) => ({ opening, tree, line: s.line }));
}

/** Révision du jour, toutes ouvertures confondues : on couvre les positions dues avec le moins de lignes possible. */
export function reviewQueue(items: { opening: Opening; tree: OpeningTree }[], srs: SrsState, now = Date.now()): TrainLine[] {
  const out: TrainLine[] = [];
  for (const { opening, tree } of items) {
    const cards = srs[opening.id] ?? {};
    const due = new Set(Object.keys(cards).filter((id) => cards[id].due <= now));
    if (!due.size) continue;
    const lines = repertoireLines(tree, opening.side);
    while (due.size) {
      let best: OpeningNode[] | null = null;
      let bestN = 0;
      for (const l of lines) {
        const n = lineCardIds(l, opening.side).filter((id) => due.has(id)).length;
        if (n > bestN) {
          best = l;
          bestN = n;
        }
      }
      if (!best) break; // positions dues qui ne sont plus dans l'arbre (contenu modifié)
      for (const id of lineCardIds(best, opening.side)) due.delete(id);
      out.push({ opening, tree, line: best });
    }
  }
  return out;
}

/** Nombre de positions dues (ignore celles qui ne sont plus dans l'arbre). */
export function dueCount(opening: Opening, tree: OpeningTree, srs: SrsState, now = Date.now()): number {
  const cards = srs[opening.id] ?? {};
  return cardIds(opening, tree).filter((id) => cards[id] && cards[id].due <= now).length;
}
