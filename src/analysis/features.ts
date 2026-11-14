// Extraction de traits d'une position (100 % par règles).
//
// On travaille sur une représentation simple du plateau : un tableau de 64 cases,
// index = rang * 8 + colonne (a1 = 0, h1 = 7, a8 = 56, h8 = 63).
// Les attaques sont « géométriques » (pseudo-légales) : les clouages ne sont pas
// pris en compte, ce qui suffit pour des explications pédagogiques.

import type { Color, PieceSymbol, Square } from 'chess.js';

export interface BoardPiece {
  type: PieceSymbol;
  color: Color;
}
export type Board = (BoardPiece | null)[];

/** Valeurs en pions (le roi vaut « beaucoup » pour le calcul d'échanges). */
export const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

export const FILES = 'abcdefgh';

export const opp = (c: Color): Color => (c === 'w' ? 'b' : 'w');
export const fileOf = (i: number) => i & 7;
export const rankOf = (i: number) => i >> 3;
export const sqName = (i: number) => (FILES[i & 7] + ((i >> 3) + 1)) as Square;
export const sqIndex = (s: string) => (s.charCodeAt(1) - 49) * 8 + (s.charCodeAt(0) - 97);
const onBoard = (f: number, r: number) => f >= 0 && f < 8 && r >= 0 && r < 8;

/** Parse la partie « placement » d'une FEN. */
export function boardFromFen(fen: string): Board {
  const board: Board = new Array(64).fill(null);
  const rows = fen.split(' ')[0].split('/');
  rows.forEach((row, ri) => {
    const r = 7 - ri;
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) f += parseInt(ch, 10);
      else {
        const lower = ch.toLowerCase() as PieceSymbol;
        board[r * 8 + f] = { type: lower, color: ch === lower ? 'b' : 'w' };
        f++;
      }
    }
  });
  return board;
}

export const KNIGHT_D = [
  [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2],
];
export const KING_D = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];
export const DIAG_D = [
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];
export const ORTHO_D = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

export function sliderDirs(t: PieceSymbol): number[][] {
  if (t === 'b') return DIAG_D;
  if (t === 'r') return ORTHO_D;
  if (t === 'q') return [...DIAG_D, ...ORTHO_D];
  return [];
}

/** Cases attaquées par la pièce en `i` (s'arrête sur la première pièce rencontrée, incluse). */
export function attacksFrom(board: Board, i: number): number[] {
  const p = board[i];
  if (!p) return [];
  const f = fileOf(i);
  const r = rankOf(i);
  const out: number[] = [];
  if (p.type === 'p') {
    const dr = p.color === 'w' ? 1 : -1;
    for (const df of [-1, 1]) if (onBoard(f + df, r + dr)) out.push((r + dr) * 8 + f + df);
  } else if (p.type === 'n' || p.type === 'k') {
    for (const [df, dr] of p.type === 'n' ? KNIGHT_D : KING_D) if (onBoard(f + df, r + dr)) out.push((r + dr) * 8 + f + df);
  } else {
    for (const [df, dr] of sliderDirs(p.type)) {
      let nf = f + df;
      let nr = r + dr;
      while (onBoard(nf, nr)) {
        const j = nr * 8 + nf;
        out.push(j);
        if (board[j]) break;
        nf += df;
        nr += dr;
      }
    }
  }
  return out;
}

/** Pièces de `color` qui attaquent la case `i`. */
export function attackersOf(board: Board, i: number, color: Color): number[] {
  const out: number[] = [];
  const f = fileOf(i);
  const r = rankOf(i);
  const at = (ff: number, rr: number) => (onBoard(ff, rr) ? board[rr * 8 + ff] : null);
  const pr = color === 'w' ? r - 1 : r + 1;
  for (const df of [-1, 1]) {
    const p = at(f + df, pr);
    if (p && p.color === color && p.type === 'p') out.push(pr * 8 + f + df);
  }
  for (const [df, dr] of KNIGHT_D) {
    const p = at(f + df, r + dr);
    if (p && p.color === color && p.type === 'n') out.push((r + dr) * 8 + f + df);
  }
  for (const [df, dr] of KING_D) {
    const p = at(f + df, r + dr);
    if (p && p.color === color && p.type === 'k') out.push((r + dr) * 8 + f + df);
  }
  for (const [dirs, kinds] of [[DIAG_D, 'bq'], [ORTHO_D, 'rq']] as const) {
    for (const [df, dr] of dirs) {
      let nf = f + df;
      let nr = r + dr;
      while (onBoard(nf, nr)) {
        const p = board[nr * 8 + nf];
        if (p) {
          if (p.color === color && kinds.includes(p.type)) out.push(nr * 8 + nf);
          break;
        }
        nf += df;
        nr += dr;
      }
    }
  }
  return out;
}

export function isAttackedBy(board: Board, i: number, color: Color): boolean {
  return attackersOf(board, i, color).length > 0;
}

function leastValuableAttacker(board: Board, i: number, color: Color): number | null {
  let best: number | null = null;
  for (const j of attackersOf(board, i, color)) {
    if (best === null || VALUE[board[j]!.type] < VALUE[board[best]!.type]) best = j;
  }
  return best;
}

/**
 * Échange statique (SEE simplifié) : gain en pions que `side` peut obtenir en lançant
 * une suite de captures sur la case `i` (toujours ≥ 0 car on peut ne pas capturer).
 * Les rayons sont recalculés après chaque prise (batteries / rayons X gérés).
 */
export function see(board: Board, i: number, side: Color, depth = 0): number {
  const target = board[i];
  if (!target || target.color === side || depth > 12) return 0;
  const a = leastValuableAttacker(board, i, side);
  if (a === null) return 0;
  return Math.max(0, seeAfterCapture(board, a, i, depth));
}

/** Résultat (en pions, pour le camp qui capture) de la prise from → to suivie de l'échange optimal. */
export function seeCapture(board: Board, from: number, to: number): number {
  return seeAfterCapture(board, from, to, 0);
}

function seeAfterCapture(board: Board, from: number, to: number, depth: number): number {
  const target = board[to];
  const mover = board[from];
  if (!target || !mover) return 0;
  const b2 = board.slice();
  b2[to] = mover;
  b2[from] = null;
  return VALUE[target.type] - see(b2, to, opp(mover.color), depth + 1);
}

export function applyMoveToBoard(board: Board, from: number, to: number, promotion?: PieceSymbol): Board {
  const b2 = board.slice();
  const p = b2[from];
  if (!p) return b2;
  // prise en passant : pion qui change de colonne vers une case vide
  if (p.type === 'p' && fileOf(from) !== fileOf(to) && !b2[to]) b2[rankOf(from) * 8 + fileOf(to)] = null;
  // roque : déplacer la tour
  if (p.type === 'k' && Math.abs(fileOf(to) - fileOf(from)) === 2) {
    const r = rankOf(from);
    if (fileOf(to) === 6) {
      b2[r * 8 + 5] = b2[r * 8 + 7];
      b2[r * 8 + 7] = null;
    } else {
      b2[r * 8 + 3] = b2[r * 8 + 0];
      b2[r * 8 + 0] = null;
    }
  }
  b2[to] = promotion ? { type: promotion, color: p.color } : p;
  b2[from] = null;
  return b2;
}

export interface HangingPiece {
  square: Square;
  type: PieceSymbol;
  /** Matériel que l'adversaire gagne en capturant (pions). */
  loss: number;
  attackers: Square[];
  defenders: Square[];
}

/** Pièces de `color` en prise : l'adversaire gagne du matériel en les capturant. */
export function hangingPieces(board: Board, color: Color): HangingPiece[] {
  const out: HangingPiece[] = [];
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p || p.color !== color || p.type === 'k') continue;
    const att = attackersOf(board, i, opp(color));
    if (!att.length) continue;
    const loss = see(board, i, opp(color));
    if (loss > 0) {
      out.push({ square: sqName(i), type: p.type, loss, attackers: att.map(sqName), defenders: attackersOf(board, i, color).map(sqName) });
    }
  }
  return out.sort((a, b) => b.loss - a.loss);
}

export function findKing(board: Board, color: Color): number {
  return board.findIndex((p) => p?.type === 'k' && p.color === color);
}

// --------------------------------------------------------------------------
// Traits positionnels

export type Phase = 'ouverture' | 'milieu' | 'finale';

export interface SideFeatures {
  /** Matériel en pions (P=1, C=F=3, T=5, D=9). */
  material: number;
  counts: Record<PieceSymbol, number>;
  hanging: HangingPiece[];
  /** Pièces mineures encore sur leur case de départ. */
  undeveloped: Square[];
  kingSquare: Square | null;
  castled: boolean;
  canCastle: boolean;
  /** Roi resté au centre sans droit de roque (hors finale). */
  kingStuckInCenter: boolean;
  /** Pions devant le roi (bouclier, 0..3). */
  kingShield: number;
  /** Colonnes autour du roi sans pion du camp (ouvertes ou semi-ouvertes pour l'adversaire). */
  openFilesNearKing: string[];
  /** Nombre d'attaques adverses sur les cases autour du roi. */
  kingZoneAttacks: number;
  /** Contrôle du centre (d4, e4, d5, e5) : attaques + occupation par pion. */
  centerControl: number;
  rooksOpenFile: Square[];
  rooksSemiOpenFile: Square[];
  rooksOnSeventh: Square[];
  outposts: Square[];
  passedPawns: Square[];
  isolatedPawns: Square[];
  doubledPawns: Square[];
  backwardPawns: Square[];
  bishopPair: boolean;
  badBishop: Square | null;
  /** Mobilité (cases accessibles des pièces hors pions et roi). */
  mobility: number;
  /** Centralisation du roi (0 = coin, ~6 = centre). */
  kingActivity: number;
}

export interface PositionFeatures {
  fen: string;
  turn: Color;
  phase: Phase;
  fullmove: number;
  w: SideFeatures;
  b: SideFeatures;
}

const HOME_MINORS: Record<Color, Square[]> = { w: ['b1', 'g1', 'c1', 'f1'], b: ['b8', 'g8', 'c8', 'f8'] };
const CENTER = ['d4', 'e4', 'd5', 'e5'].map(sqIndex);

function pawnFiles(board: Board, color: Color): number[][] {
  const files: number[][] = Array.from({ length: 8 }, () => []);
  board.forEach((p, i) => {
    if (p && p.type === 'p' && p.color === color) files[fileOf(i)].push(rankOf(i));
  });
  return files;
}

export function isPassedPawn(board: Board, i: number): boolean {
  const p = board[i];
  if (!p || p.type !== 'p') return false;
  const f = fileOf(i);
  const r = rankOf(i);
  const enemy = pawnFiles(board, opp(p.color));
  for (let df = -1; df <= 1; df++) {
    const ff = f + df;
    if (ff < 0 || ff > 7) continue;
    for (const er of enemy[ff]) if (p.color === 'w' ? er > r : er < r) return false;
  }
  return true;
}

export function computePhase(board: Board, fullmove: number): Phase {
  let npm = 0;
  let queens = 0;
  let undeveloped = 0;
  board.forEach((p, i) => {
    if (!p || p.type === 'p' || p.type === 'k') return;
    npm += VALUE[p.type];
    if (p.type === 'q') queens++;
    if ((p.type === 'n' || p.type === 'b') && HOME_MINORS[p.color].includes(sqName(i))) undeveloped++;
  });
  if (npm <= 20 || (queens === 0 && npm <= 26)) return 'finale';
  if (fullmove <= 10 && (undeveloped >= 3 || fullmove <= 6)) return 'ouverture';
  return 'milieu';
}

function sideFeatures(board: Board, color: Color, castling: string, phase: Phase): SideFeatures {
  const enemy = opp(color);
  const counts: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  let material = 0;
  const own = pawnFiles(board, color);
  const theirs = pawnFiles(board, enemy);
  const fwd = color === 'w' ? 1 : -1;
  const out: SideFeatures = {
    material: 0,
    counts,
    hanging: hangingPieces(board, color),
    undeveloped: [],
    kingSquare: null,
    castled: false,
    canCastle: false,
    kingStuckInCenter: false,
    kingShield: 0,
    openFilesNearKing: [],
    kingZoneAttacks: 0,
    centerControl: 0,
    rooksOpenFile: [],
    rooksSemiOpenFile: [],
    rooksOnSeventh: [],
    outposts: [],
    passedPawns: [],
    isolatedPawns: [],
    doubledPawns: [],
    backwardPawns: [],
    bishopPair: false,
    badBishop: null,
    mobility: 0,
    kingActivity: 0,
  };
  const bishops: number[] = [];

  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p || p.color !== color) continue;
    counts[p.type]++;
    if (p.type !== 'k') material += VALUE[p.type];
    const f = fileOf(i);
    const r = rankOf(i);
    const sq = sqName(i);

    if ((p.type === 'n' || p.type === 'b') && HOME_MINORS[color].includes(sq)) {
      const homeType = sq[0] === 'b' || sq[0] === 'g' ? 'n' : 'b';
      if (homeType === p.type) out.undeveloped.push(sq);
    }
    if (p.type !== 'p' && p.type !== 'k') {
      out.mobility += attacksFrom(board, i).filter((j) => board[j]?.color !== color).length;
    }
    if (p.type === 'r') {
      if (!own[f].length && !theirs[f].length) out.rooksOpenFile.push(sq);
      else if (!own[f].length) out.rooksSemiOpenFile.push(sq);
      if (r === (color === 'w' ? 6 : 1)) out.rooksOnSeventh.push(sq);
    }
    if (p.type === 'b') bishops.push(i);
    if (p.type === 'n' || p.type === 'b') {
      // avant-poste : case dans le camp adverse, soutenue par un pion, inattaquable par les pions adverses
      const inEnemyHalf = color === 'w' ? r >= 3 && r <= 5 : r >= 2 && r <= 4;
      if (inEnemyHalf) {
        const supported = [-1, 1].some((df) => {
          const ff = f + df;
          const rr = r - fwd;
          return onBoard(ff, rr) && board[rr * 8 + ff]?.type === 'p' && board[rr * 8 + ff]?.color === color;
        });
        const attackable = [-1, 1].some((df) => {
          const ff = f + df;
          if (ff < 0 || ff > 7) return false;
          return theirs[ff].some((er) => (color === 'w' ? er > r : er < r));
        });
        if (supported && !attackable && p.type === 'n') out.outposts.push(sq);
      }
    }
    if (p.type === 'p') {
      if (isPassedPawn(board, i)) out.passedPawns.push(sq);
      const left = f > 0 ? own[f - 1] : [];
      const right = f < 7 ? own[f + 1] : [];
      if (!left.length && !right.length) out.isolatedPawns.push(sq);
      else {
        // arriéré : aucun pion voisin à hauteur ou derrière, case d'avancée contrôlée par un pion adverse
        const neighbors = [...left, ...right];
        const supportable = neighbors.some((nr) => (color === 'w' ? nr <= r : nr >= r));
        const stop = r + fwd;
        const stopAttacked = [-1, 1].some((df) => {
          const ff = f + df;
          const rr = stop + fwd;
          return onBoard(ff, rr) && board[rr * 8 + ff]?.type === 'p' && board[rr * 8 + ff]?.color === enemy;
        });
        if (!supportable && stopAttacked && !isPassedPawn(board, i)) out.backwardPawns.push(sq);
      }
      if (own[f].length > 1) out.doubledPawns.push(sq);
    }
    if (p.type === 'k') {
      out.kingSquare = sq;
      out.kingActivity = Math.round((7 - (Math.abs(f - 3.5) + Math.abs(r - 3.5))) * 10) / 10;
      const homeRank = color === 'w' ? 0 : 7;
      out.castled = r === homeRank && (f >= 6 || f <= 2);
      for (let df = -1; df <= 1; df++) {
        const ff = f + df;
        if (ff < 0 || ff > 7) continue;
        if (own[ff].some((pr) => pr === r + fwd || pr === r + 2 * fwd)) out.kingShield++;
        if (!own[ff].length) out.openFilesNearKing.push(FILES[ff]);
      }
      for (const [df, dr] of [[0, 0], ...KING_D]) {
        if (!onBoard(f + df, r + dr)) continue;
        out.kingZoneAttacks += attackersOf(board, (r + dr) * 8 + f + df, enemy).length;
      }
    }
  }
  out.material = material;
  out.canCastle = color === 'w' ? /[KQ]/.test(castling) : /[kq]/.test(castling);
  out.kingStuckInCenter =
    phase !== 'finale' && !out.canCastle && !!out.kingSquare && 'def'.includes(out.kingSquare[0]) && counts.q > 0;

  for (const c of CENTER) {
    out.centerControl += attackersOf(board, c, color).length;
    if (board[c]?.type === 'p' && board[c]?.color === color) out.centerControl += 2;
  }

  out.bishopPair = bishops.length >= 2 && new Set(bishops.map((i) => (fileOf(i) + rankOf(i)) % 2)).size === 2;
  if (bishops.length === 1) {
    const bc = (fileOf(bishops[0]) + rankOf(bishops[0])) % 2;
    let same = 0;
    let total = 0;
    board.forEach((p, i) => {
      if (p?.type === 'p' && p.color === color) {
        total++;
        if ((fileOf(i) + rankOf(i)) % 2 === bc) same++;
      }
    });
    if (total >= 4 && same >= 4 && same / total >= 0.65) out.badBishop = sqName(bishops[0]);
  }
  return out;
}

/** Calcule tous les traits d'une position donnée par sa FEN. */
export function extractFeatures(fen: string): PositionFeatures {
  const parts = fen.split(' ');
  const board = boardFromFen(fen);
  const fullmove = parseInt(parts[5] ?? '1', 10) || 1;
  const castling = parts[2] ?? '-';
  const phase = computePhase(board, fullmove);
  return {
    fen,
    turn: parts[1] === 'b' ? 'b' : 'w',
    phase,
    fullmove,
    w: sideFeatures(board, 'w', castling, phase),
    b: sideFeatures(board, 'b', castling, phase),
  };
}

/** Différence matérielle (Blancs − Noirs) en pions. */
export function materialBalance(f: PositionFeatures): number {
  return f.w.material - f.b.material;
}
