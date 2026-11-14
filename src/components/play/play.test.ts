import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { MATE_CP } from '../../analysis/classify';
import { classifyGame, terminalWhiteCp } from './useGameReview';
import { materialInfo } from './PlayerCard';
import { badgeFor, moveNumberLabel } from './moveClass';
import { formatCp } from './EvalGraph';
import { START_FEN } from '../../lib/chessUtils';

function fensOf(moves: string[]) {
  const c = new Chess();
  const fens = [c.fen()];
  for (const m of moves) {
    c.move({ from: m.slice(0, 2), to: m.slice(2, 4) });
    fens.push(c.fen());
  }
  return fens;
}

describe('revue rapide', () => {
  it('classe le mat du berger inversé', () => {
    const moves = ['f2f3', 'e7e5', 'g2g4', 'd8h4'];
    const fens = fensOf(moves);
    expect(terminalWhiteCp(fens[4])).toBe(-MATE_CP);
    const evals = [20, 30, 40, -(MATE_CP - 1), -MATE_CP];
    const bests = ['e2e4', 'e7e5', 'e1f2', 'd8h4', null];
    const cls = classifyGame(fens, moves, evals, bests);
    expect(cls[1]).toBe('best');
    expect(cls[2]).toBe('blunder');
    expect(cls[3]).toBe('best');
  });

  it('laisse null les coups non encore analysés', () => {
    const moves = ['e2e4', 'e7e5'];
    const cls = classifyGame(fensOf(moves), moves, [20, null, null], [null, null, null]);
    expect(cls).toEqual([null, null]);
  });
});

describe('aides d’affichage', () => {
  it('matériel et pièces prises', () => {
    const m = materialInfo('rnb1kbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 3');
    expect(m.diff).toBe(9);
    expect(m.captured('w')).toEqual(['bQ']);
    expect(materialInfo(START_FEN).diff).toBe(0);
  });

  it('pastille et numéro de coup', () => {
    expect(badgeFor('e2e4', 'blunder')).toMatchObject({ square: 'e4', symbol: '??' });
    expect(badgeFor('e2e4', null)).toBeNull();
    expect(moveNumberLabel(START_FEN)).toBe('1.');
    expect(moveNumberLabel('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1')).toBe('1…');
  });

  it('format des évaluations', () => {
    expect(formatCp(125)).toBe('+1,3');
    expect(formatCp(-40)).toBe('−0,4');
    expect(formatCp(MATE_CP - 3)).toBe('#3');
    expect(formatCp(-MATE_CP)).toBe('0-1');
  });
});
