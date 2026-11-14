import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { boardFromFen, extractFeatures, hangingPieces, see, sqIndex } from './features';

const FENS = {
  start: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  passed: '4k3/8/8/3P4/8/8/8/4K3 w - - 0 1',
  isolated: '4k3/pp6/8/8/8/8/P1P5/4K3 w - - 0 1',
  doubled: '4k3/8/8/8/8/2P5/2P5/4K3 w - - 0 1',
  outpost: '4k3/8/8/3N4/4P3/8/8/4K3 w - - 0 1',
  hanging: '4k3/8/8/3n4/8/8/8/3RK3 b - - 0 1',
  defended: '4k3/8/4p3/3n4/8/8/8/3RK3 b - - 0 1',
  castled: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 6 6',
  rooks: '6k1/1R6/8/8/8/8/5PPP/3R2K1 w - - 0 1',
  backward: '4k3/8/3p4/2p1p3/2P1P3/8/8/4K3 w - - 0 1',
  badBishop: '4k3/8/8/1p1p1p2/1P1P1P2/2P1P3/8/2B1K3 w - - 0 1',
  rookEnding: '8/5k2/8/8/8/8/2K2R2/8 w - - 0 1',
};

describe('FEN de test', () => {
  it('sont toutes légales', () => {
    for (const fen of Object.values(FENS)) expect(() => new Chess(fen)).not.toThrow();
  });
});

describe('extractFeatures', () => {
  it('position initiale : ouverture, rien de développé, matériel égal', () => {
    const f = extractFeatures(FENS.start);
    expect(f.phase).toBe('ouverture');
    expect(f.w.material).toBe(39);
    expect(f.b.material).toBe(39);
    expect(f.w.undeveloped).toHaveLength(4);
    expect(f.w.bishopPair).toBe(true);
    expect(f.w.canCastle).toBe(true);
    expect(f.w.hanging).toHaveLength(0);
  });

  it('détecte un pion passé', () => {
    expect(extractFeatures(FENS.passed).w.passedPawns).toEqual(['d5']);
  });

  it('détecte les pions isolés', () => {
    const f = extractFeatures(FENS.isolated);
    expect(f.w.isolatedPawns.sort()).toEqual(['a2', 'c2']);
    expect(f.b.isolatedPawns).toEqual([]);
    // a2 et c2 surveillent les colonnes voisines : b7 n'est pas passé
    expect(f.b.passedPawns).toEqual([]);
  });

  it('détecte les pions doublés', () => {
    expect(extractFeatures(FENS.doubled).w.doubledPawns.sort()).toEqual(['c2', 'c3']);
  });

  it('détecte un avant-poste de cavalier', () => {
    expect(extractFeatures(FENS.outpost).w.outposts).toEqual(['d5']);
  });

  it('détecte une pièce en prise et non une pièce défendue par un pion', () => {
    expect(extractFeatures(FENS.hanging).b.hanging.map((h) => h.square)).toEqual(['d5']);
    expect(extractFeatures(FENS.defended).b.hanging).toHaveLength(0);
  });

  it('sécurité du roi après le roque', () => {
    const f = extractFeatures(FENS.castled);
    expect(f.w.castled).toBe(true);
    expect(f.w.kingShield).toBe(3);
    expect(f.w.openFilesNearKing).toEqual([]);
    expect(f.phase).toBe('ouverture');
  });

  it('tours : colonne ouverte et 7e rangée', () => {
    const f = extractFeatures(FENS.rooks);
    expect(f.w.rooksOnSeventh).toEqual(['b7']);
    expect(f.w.rooksOpenFile.sort()).toEqual(['b7', 'd1']);
  });

  it('pion arriéré', () => {
    const f = extractFeatures(FENS.backward);
    expect(f.b.backwardPawns).toEqual(['d6']);
  });

  it('mauvais fou', () => {
    expect(extractFeatures(FENS.badBishop).w.badBishop).toBe('c1');
  });

  it('finale et activité du roi', () => {
    const f = extractFeatures(FENS.rookEnding);
    expect(f.phase).toBe('finale');
    expect(f.w.kingActivity).toBeGreaterThan(0);
  });
});

describe('SEE', () => {
  it('pièce non défendue = gain total', () => {
    const b = boardFromFen(FENS.hanging);
    expect(see(b, sqIndex('d5'), 'w')).toBe(3);
  });
  it('tour qui prend un cavalier défendu par un pion = perte', () => {
    const b = boardFromFen(FENS.defended);
    expect(see(b, sqIndex('d5'), 'w')).toBe(0);
    expect(hangingPieces(b, 'b')).toHaveLength(0);
  });
});
