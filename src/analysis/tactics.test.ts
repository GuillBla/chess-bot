import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { detectMotifs, findMateInOne, findThreats, nullMoveFen } from './tactics';
import { explainMove } from './explain';
import type { AnalysisResult } from '../engine/stockfish';

const CASES = {
  fork: { fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', uci: 'd5c7' },
  pin: { fen: '4k3/8/2n5/8/8/8/8/4KB2 w - - 0 1', uci: 'f1b5' },
  skewer: { fen: 'r7/8/8/3k3B/8/8/8/4K3 w - - 0 1', uci: 'h5f3' },
  discovered: { fen: '4k3/4q3/8/8/4N3/8/8/4RK2 w - - 0 1', uci: 'e4g5' },
  doubleCheck: { fen: '4k3/8/8/8/8/8/4B3/4R1K1 w - - 0 1', uci: 'e2b5' },
  mate: { fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1', uci: 'a1a8' },
  mateThreat: { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3', uci: 'd1h5' },
  freeCapture: { fen: '4k3/8/8/3n4/8/8/8/3RK3 w - - 0 1', uci: 'd1d5' },
  hangs: { fen: '4k3/8/8/2p5/8/8/8/3QK3 w - - 0 1', uci: 'd1d4' },
  promotion: { fen: '8/4P3/8/8/8/2k5/8/4K3 w - - 0 1', uci: 'e7e8q' },
  exchange: { fen: '4k3/8/2n5/4N3/3P4/8/8/4K3 b - - 0 1', uci: 'c6e5' },
  ep: { fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 2', uci: 'e5d6' },
};

const kinds = (c: { fen: string; uci: string }) => detectMotifs(c.fen, c.uci).map((m) => m.kind);

describe('FEN de test', () => {
  it('sont légales et les coups aussi', () => {
    for (const c of Object.values(CASES)) {
      const chess = new Chess(c.fen);
      expect(() => chess.move({ from: c.uci.slice(0, 2), to: c.uci.slice(2, 4), promotion: c.uci[4] })).not.toThrow();
    }
  });
});

describe('detectMotifs', () => {
  it('fourchette de cavalier (échec + tour)', () => {
    const m = detectMotifs(CASES.fork.fen, CASES.fork.uci);
    expect(m[0].kind).toBe('fourchette');
    expect(m[0].text).toMatch(/roi/);
    expect(m[0].text).toMatch(/tour en a8/);
  });
  it('clouage absolu', () => {
    const m = detectMotifs(CASES.pin.fen, CASES.pin.uci).find((x) => x.kind === 'clouage');
    expect(m).toBeDefined();
    expect(m!.text).toMatch(/cavalier en c6/);
    expect(m!.text).toMatch(/sur le roi/);
  });
  it('enfilade', () => {
    expect(kinds(CASES.skewer)).toContain('enfilade');
  });
  it('attaque à la découverte', () => {
    const m = detectMotifs(CASES.discovered.fen, CASES.discovered.uci).find((x) => x.kind === 'decouverte');
    expect(m).toBeDefined();
    expect(m!.text).toMatch(/dame en e7/);
  });
  it('échec double', () => {
    expect(kinds(CASES.doubleCheck)).toContain('echec_double');
  });
  it('mat', () => {
    expect(kinds(CASES.mate)[0]).toBe('mat');
    expect(findMateInOne(CASES.mate.fen)).toBe('a1a8');
  });
  it('menace de mat (Dh5 vise f7)', () => {
    const m = detectMotifs(CASES.mateThreat.fen, CASES.mateThreat.uci).find((x) => x.kind === 'menace_mat');
    expect(m).toBeDefined();
    expect(m!.text).toMatch(/Qxf7#/);
  });
  it('capture gratuite', () => {
    const m = detectMotifs(CASES.freeCapture.fen, CASES.freeCapture.uci);
    expect(m[0].kind).toBe('capture');
    expect(m[0].gain).toBe(3);
  });
  it('pièce laissée en prise', () => {
    const m = detectMotifs(CASES.hangs.fen, CASES.hangs.uci).find((x) => x.kind === 'enprise');
    expect(m).toBeDefined();
    expect(m!.good).toBe(false);
    expect(m!.gain).toBeGreaterThanOrEqual(8);
  });
  it('promotion', () => {
    expect(kinds(CASES.promotion)).toContain('promotion');
  });
  it('échange équilibré', () => {
    expect(kinds(CASES.exchange)).toContain('echange');
  });
  it('prise en passant', () => {
    expect(kinds(CASES.ep)).toContain('capture');
  });
});

describe('coup nul et menaces', () => {
  it('nullMoveFen inverse le trait et efface la prise en passant', () => {
    expect(nullMoveFen(CASES.ep.fen)).toBe('4k3/8/8/3pP3/8/8/8/4K3 b - - 0 2');
  });
  it('nullMoveFen refuse une position en échec', () => {
    expect(nullMoveFen('4k3/8/8/8/8/8/8/4R1K1 b - - 0 1')).toBeNull();
  });
  it('findThreats trouve le mat en 1', () => {
    expect(findThreats(CASES.mate.fen)[0].kind).toBe('mat');
  });
});

describe('explainMove', () => {
  const fen = CASES.fork.fen;
  const analysis: AnalysisResult = {
    fen,
    depth: 18,
    bestMove: 'd5c7',
    lines: [
      { multipv: 1, depth: 18, cp: 520, mate: null, pv: ['d5c7', 'e8d7', 'c7a8'] },
      { multipv: 2, depth: 18, cp: 10, mate: null, pv: ['d5f6', 'e8e7', 'f6g4'] },
      { multipv: 3, depth: 18, cp: -380, mate: null, pv: ['e1d2', 'a8a5', 'd5c3'] },
    ],
  };

  it('explique le meilleur coup (fourchette)', () => {
    const ex = explainMove(fen, 'd5c7', analysis);
    expect(ex.san).toBe('Nc7+');
    expect(ex.evalText).toBe('+5.20');
    expect(ex.headline).toMatch(/fourchette/i);
    expect(ex.points.some((p) => p.category === 'tactique' && p.arrows?.length)).toBe(true);
    expect(ex.plan?.text).toMatch(/Blancs/);
    expect(ex.alternatives.map((a) => a.san)).toEqual(['Nf6+', 'Kd2']);
    expect(ex.alternatives[0].lossCp).toBe(510);
  });

  it('explique un coup inférieur et propose le meilleur', () => {
    const ex = explainMove(fen, 'e1d2', analysis);
    expect(ex.headline).toMatch(/^Gaffe/);
    expect(ex.headline).toMatch(/Nc7\+/);
    expect(ex.alternatives[0].san).toBe('Nc7+');
    expect(ex.alternatives[0].lossCp).toBe(0);
  });

  it('utilise afterLine quand le coup n’est pas dans les lignes', () => {
    const ex = explainMove(fen, 'd5b4', analysis, { afterLine: { multipv: 1, depth: 16, cp: -15, mate: null, pv: ['e8d7'] } });
    expect(ex.evalText).toBe('+0.15');
    expect(ex.headline).toMatch(/Gaffe|Erreur/);
  });

  it('coup illégal', () => {
    expect(explainMove(fen, 'a1a2', analysis).headline).toMatch(/pas légal/);
  });
});
