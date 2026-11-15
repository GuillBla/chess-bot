// Arbre d'ouverture construit à partir d'un PGN commenté avec variantes.
// Sert à l'explorateur (coups possibles et leurs explications) et à l'entraînement (positions à mémoriser).
import { Chess, type Square } from 'chess.js';
import type { BoardArrow, SquareMark } from '../analysis/types';
import { START_FEN } from './chessUtils';

export type Nag = '!' | '!!' | '?' | '??' | '!?' | '?!';

export interface OpeningNode {
  /** Chemin depuis la racine : coups UCI séparés par des espaces ('' pour la racine). */
  id: string;
  san: string;
  uci: string;
  /** Position après le coup (position de départ pour la racine). */
  fen: string;
  /** Demi-coups joués depuis le début (0 pour la racine). */
  ply: number;
  /** Camp qui a joué le coup ('w' | 'b'), null pour la racine. */
  color: 'w' | 'b' | null;
  comment: string;
  arrows: BoardArrow[];
  marks: SquareMark[];
  /** Nom de variante qui commence à ce coup. */
  name?: string;
  nag?: Nag;
  /** Coup annoté ?, ?! ou ?? : une erreur à connaître. */
  dubious: boolean;
  children: OpeningNode[];
  parent: OpeningNode | null;
}

export interface OpeningTree {
  root: OpeningNode;
  byId: Map<string, OpeningNode>;
}

const NUMERIC_NAG: Record<string, Nag> = { $1: '!', $2: '?', $3: '!!', $4: '??', $5: '!?', $6: '?!' };
const ARROW_KIND: Record<string, BoardArrow['kind']> = { G: 'good', R: 'bad', Y: 'threat', B: 'idea' };
const MARK_KIND: Record<string, SquareMark['kind']> = { G: 'strong', R: 'weak', Y: 'target', B: 'target' };

type Token = { t: 'move'; san: string; nag?: Nag } | { t: 'comment'; text: string } | { t: 'open' } | { t: 'close' } | { t: 'nag'; nag: Nag };

function tokenize(pgn: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < pgn.length) {
    const c = pgn[i];
    if (/\s/.test(c)) {
      i++;
    } else if (c === '{') {
      const end = pgn.indexOf('}', i);
      if (end < 0) throw new Error(`Commentaire non fermé : ${pgn.slice(i, i + 40)}`);
      out.push({ t: 'comment', text: pgn.slice(i + 1, end) });
      i = end + 1;
    } else if (c === '(') {
      out.push({ t: 'open' });
      i++;
    } else if (c === ')') {
      out.push({ t: 'close' });
      i++;
    } else {
      const m = /^[^\s(){}]+/.exec(pgn.slice(i))!;
      const word = m[0];
      i += word.length;
      if (/^\$\d+$/.test(word)) {
        const nag = NUMERIC_NAG[word];
        if (nag) out.push({ t: 'nag', nag });
        continue;
      }
      if (/^(1-0|0-1|1\/2-1\/2|\*)$/.test(word)) continue;
      // « 12. », « 12... », « 12…Nf3 » : on enlève le numéro
      const body = word.replace(/^\d+\s*(\.\.\.|…|\.)+/, '').replace(/^(\.\.\.|…)/, '');
      if (!body) continue;
      const nm = /^(.*?)([!?]{1,2})?$/.exec(body)!;
      out.push({ t: 'move', san: nm[1], nag: nm[2] as Nag | undefined });
    }
  }
  return out;
}

/** Extrait les commandes [%cal …], [%csl …], [%name …] d'un commentaire. */
function parseComment(raw: string): { text: string; arrows: BoardArrow[]; marks: SquareMark[]; name?: string } {
  const arrows: BoardArrow[] = [];
  const marks: SquareMark[] = [];
  let name: string | undefined;
  const text = raw
    .replace(/\[%(cal|csl|name)\s+([^\]]*)\]/g, (_, cmd: string, arg: string) => {
      if (cmd === 'name') {
        name = arg.trim();
        return '';
      }
      for (const item of arg.split(',').map((s) => s.trim()).filter(Boolean)) {
        const kind = item[0];
        if (cmd === 'cal' && /^[GRYB][a-h][1-8][a-h][1-8]$/.test(item)) {
          arrows.push({ from: item.slice(1, 3) as Square, to: item.slice(3, 5) as Square, kind: ARROW_KIND[kind] });
        } else if (cmd === 'csl' && /^[GRYB][a-h][1-8]$/.test(item)) {
          marks.push({ square: item.slice(1, 3) as Square, kind: MARK_KIND[kind] });
        } else {
          throw new Error(`Annotation [%${cmd}] invalide : « ${item} »`);
        }
      }
      return '';
    })
    .replace(/\s+/g, ' ')
    .trim();
  return { text, arrows, marks, name };
}

function makeRoot(fen: string): OpeningNode {
  return { id: '', san: '', uci: '', fen, ply: 0, color: null, comment: '', arrows: [], marks: [], dubious: false, children: [], parent: null };
}

/**
 * Construit l'arbre d'un PGN commenté. Un même coup cité dans plusieurs variantes n'apparaît qu'une fois
 * (ses commentaires sont fusionnés). Lève une erreur explicite sur un coup illégal.
 */
export function parseOpeningPgn(pgn: string, startFen: string = START_FEN): OpeningTree {
  const root = makeRoot(startFen);
  const byId = new Map<string, OpeningNode>([['', root]]);

  const addChild = (parent: OpeningNode, san: string): OpeningNode => {
    const chess = new Chess(parent.fen);
    let mv;
    try {
      mv = chess.move(san, { strict: false });
    } catch {
      const path = pathTo(parent).map((n) => n.san).join(' ');
      throw new Error(`Coup illégal « ${san} » après : ${path || '(début)'}`);
    }
    const uci = mv.from + mv.to + (mv.promotion ?? '');
    const existing = parent.children.find((c) => c.uci === uci);
    if (existing) return existing;
    const node: OpeningNode = {
      id: parent.id ? `${parent.id} ${uci}` : uci,
      san: mv.san,
      uci,
      fen: chess.fen(),
      ply: parent.ply + 1,
      color: mv.color,
      comment: '',
      arrows: [],
      marks: [],
      dubious: false,
      children: [],
      parent,
    };
    parent.children.push(node);
    byId.set(node.id, node);
    return node;
  };

  const attach = (node: OpeningNode, raw: string, prepend = false) => {
    const c = parseComment(raw);
    if (c.text && !node.comment.includes(c.text)) node.comment = prepend ? `${c.text} ${node.comment}`.trim() : `${node.comment} ${c.text}`.trim();
    for (const a of c.arrows) if (!node.arrows.some((x) => x.from === a.from && x.to === a.to)) node.arrows.push(a);
    for (const m of c.marks) if (!node.marks.some((x) => x.square === m.square)) node.marks.push(m);
    if (c.name && !node.name) node.name = c.name;
  };

  const setNag = (node: OpeningNode, nag?: Nag) => {
    if (!nag) return;
    node.nag = nag;
    node.dubious = nag === '?' || nag === '??' || nag === '?!';
  };

  // Pile de lectures : `cur` = position où s'ajoute le prochain coup, `last` = dernier coup lu (une variante remplace ce coup).
  type Frame = { cur: OpeningNode; last: OpeningNode | null; pending: string[] };
  const stack: Frame[] = [{ cur: root, last: null, pending: [] }];
  for (const tok of tokenize(pgn)) {
    const f = stack[stack.length - 1];
    if (tok.t === 'move') {
      const node = addChild(f.cur, tok.san);
      setNag(node, tok.nag);
      for (const p of f.pending) attach(node, p, true);
      f.pending = [];
      f.last = node;
      f.cur = node;
    } else if (tok.t === 'nag') {
      if (f.last) setNag(f.last, tok.nag);
    } else if (tok.t === 'comment') {
      if (f.last) attach(f.last, tok.text);
      else if (f.cur === root && stack.length === 1) attach(root, tok.text);
      else f.pending.push(tok.text);
    } else if (tok.t === 'open') {
      if (!f.last?.parent) throw new Error('Variante « ( » sans coup à remplacer');
      stack.push({ cur: f.last.parent, last: null, pending: [] });
    } else {
      if (stack.length === 1) throw new Error('Parenthèse « ) » en trop');
      stack.pop();
    }
  }
  if (stack.length !== 1) throw new Error('Parenthèse « ( » non fermée');
  return { root, byId };
}

/** Coups depuis la racine jusqu'au nœud inclus (racine exclue). */
export function pathTo(node: OpeningNode): OpeningNode[] {
  const out: OpeningNode[] = [];
  for (let n: OpeningNode | null = node; n && n.parent; n = n.parent) out.unshift(n);
  return out;
}

/** Nom de la variante en cours (le plus proche en remontant), ou undefined. */
export function variationName(node: OpeningNode): string | undefined {
  for (let n: OpeningNode | null = node; n; n = n.parent) if (n.name) return n.name;
  return undefined;
}

/** Tous les noms de variante rencontrés sur le chemin (du plus général au plus précis). */
export function variationNames(node: OpeningNode): string[] {
  return pathTo(node)
    .filter((n) => n.name)
    .map((n) => n.name!);
}

export const sideColor = (side: 'white' | 'black'): 'w' | 'b' => (side === 'white' ? 'w' : 'b');

/** Camp au trait dans la position du nœud. */
export const turnAt = (node: OpeningNode): 'w' | 'b' => (node.fen.split(' ')[1] === 'b' ? 'b' : 'w');

/** Coups « du répertoire » dans cette position : joués par notre camp et non annotés comme erreurs. */
export function repertoireMoves(node: OpeningNode, side: 'white' | 'black'): OpeningNode[] {
  const c = sideColor(side);
  return node.children.filter((ch) => ch.color === c && !ch.dubious);
}

/** Positions à mémoriser : notre camp au trait et au moins un coup de répertoire prévu. */
export function trainingPositions(tree: OpeningTree, side: 'white' | 'black'): OpeningNode[] {
  const out: OpeningNode[] = [];
  const walk = (n: OpeningNode) => {
    if (turnAt(n) === sideColor(side) && repertoireMoves(n, side).length) out.push(n);
    for (const ch of n.children) if (!(ch.color === sideColor(side) && ch.dubious)) walk(ch);
  };
  walk(tree.root);
  return out;
}

/**
 * Lignes complètes du répertoire (de la racine à une feuille), dans l'ordre du PGN.
 * Toutes les réponses adverses sont suivies ; seuls nos coups de répertoire (pas nos erreurs annotées).
 */
export function repertoireLines(tree: OpeningTree, side: 'white' | 'black'): OpeningNode[][] {
  const c = sideColor(side);
  const out: OpeningNode[][] = [];
  const walk = (n: OpeningNode, path: OpeningNode[]) => {
    const next = n.children.filter((ch) => !(ch.color === c && ch.dubious));
    if (!next.length) {
      if (path.length) out.push(path);
      return;
    }
    for (const ch of next) walk(ch, [...path, ch]);
  };
  walk(tree.root, []);
  return out;
}

/** Libellé numéroté d'un nœud : « 5. Fd3 » / « 4… e6 » (notation anglaise ; convertir avec sanToFrench). */
export function moveNumberLabel(node: OpeningNode): string {
  const no = Math.floor((node.ply - 1) / 2) + 1;
  return node.color === 'w' ? `${no}.` : `${no}…`;
}
