// Petits outils partagés par l'explorateur et l'entraîneur d'ouvertures.
import type { Opening } from '../../content/openings/types';
import { moveNumberLabel, pathTo, sideColor, type OpeningNode } from '../../lib/openingTree';
import { nullMove, sanToFrench } from '../../lib/frenchMoves';
import { START_FEN } from '../../lib/chessUtils';
import type { MoveContext } from '../MoveText';
import type { BoardPreview } from '../VariationLine';

export const OPENINGS_BASE = '/openings';

export type NodeKind = 'rep' | 'mistake' | 'opp' | 'opp-mistake';

/** Rôle d'un coup de l'arbre pour celui qui apprend l'ouverture. */
export function nodeKind(n: OpeningNode, side: Opening['side']): NodeKind {
  const ours = n.color === sideColor(side);
  if (ours) return n.dubious ? 'mistake' : 'rep';
  return n.dubious ? 'opp-mistake' : 'opp';
}

export const KIND_LABEL: Record<NodeKind, { text: string; cls: string }> = {
  rep: { text: 'Ton répertoire', cls: 'good' },
  mistake: { text: 'Erreur à éviter', cls: 'bad' },
  opp: { text: 'Réponse adverse', cls: 'idea' },
  'opp-mistake': { text: 'Erreur adverse', cls: 'warn' },
};

/** « 5. Fd3 » / « 4… e6 », en notation française, avec l'annotation (!, ?!…). */
export function nodeLabel(n: OpeningNode, withNumber = true): string {
  const san = sanToFrench(n.san) + (n.nag ?? '');
  return withNumber ? `${moveNumberLabel(n)} ${san}` : san;
}

export function nodePreview(n: OpeningNode): BoardPreview {
  return { fen: n.fen, lastMove: { from: n.uci.slice(0, 2), to: n.uci.slice(2, 4) }, label: nodeLabel(n), step: 0, total: 0 };
}

/** Première phrase d'un commentaire, sans markdown, raccourcie. */
export function firstSentence(text: string, max = 120): string {
  const plain = text.replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\s+/g, ' ').trim();
  const m = /^(.+?[.!?])(\s|$)/.exec(plain);
  let s = m ? m[1] : plain;
  if (s.length > max) s = s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
  return s;
}

export const sideName = (side: Opening['side']) => (side === 'white' ? 'les Blancs' : 'les Noirs');

/**
 * Où rejouer les coups cités dans le commentaire d'un nœud :
 * les coups numérotés depuis le début de la ligne ; les idées isolées (« …Fg7 », « Cbd2 ») depuis la position du nœud,
 * pour le camp au trait puis pour l'autre camp (« et si c'était à nous ? »).
 */
export function commentContexts(n: OpeningNode): MoveContext[] {
  // Ordre : position du nœud (coups à venir, numérotés ou non), puis l'autre camp au trait, puis toute la ligne (coups déjà joués).
  const ctx: MoveContext[] = [{ fen: n.fen, standalone: true }];
  const other = nullMove(n.fen);
  if (other) ctx.push({ fen: other, standalone: true });
  ctx.push({ fen: START_FEN, mainline: pathTo(n).map((x) => x.uci), bareDots: false });
  return ctx;
}
