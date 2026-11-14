import { describe, expect, it } from 'vitest';
import { findMoves, frToSan } from './frenchMoves';
import { lessons } from '../content/lessons';

describe('frToSan', () => {
  it('convertit la notation française', () => {
    expect(frToSan('Txc3!!')).toBe('Rxc3');
    expect(frToSan('Db8+')).toBe('Qb8+');
    expect(frToSan('e8=D')).toBe('e8=Q');
    expect(frToSan('0-0')).toBe('O-O');
    expect(frToSan('Rxh7')).toBe('Kxh7');
  });
});

describe('findMoves', () => {
  const ex = lessons.flatMap((l) => l.exercises).find((e) => e.explanation.includes('22…Txc3'))!;

  it('suit la ligne principale et les variantes de Rotlewi – Rubinstein', () => {
    const refs = findMoves(ex.explanation, ex.fen, ex.solution);
    const sans = refs.filter((r) => !r.threat).map((r) => r.move.san);
    // la menace « (menace Fxe4+) » est reconnue comme telle, sans casser la ligne
    expect(refs.filter((r) => r.threat).map((r) => r.move.san)).toEqual(['Bxe4+']);
    // ligne principale
    expect(sans.slice(0, 7)).toEqual(['Rxc3', 'gxh4', 'Rd2', 'Qxd2', 'Bxe4+', 'Qg2', 'Rh3']);
    // variante 23.Fxb7 Txg3 et le repli 22…De7
    expect(sans).toContain('Bxb7');
    expect(sans).toContain('Rxg3');
    expect(sans).toContain('Qe7');
    // chaque coup a une position valide
    for (const r of refs) expect(r.fen.split(' ').length).toBe(6);
  });

  it('ignore une case isolée dans la prose', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(findMoves('Le cavalier vise la case d5 puis e4.', fen)).toEqual([]);
    expect(findMoves('**1.e4 e5 2.Cf3**', fen).map((r) => r.move.san)).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('reconnaît des coups dans la plupart des explications d’exercices', () => {
    let withMoves = 0;
    const all = lessons.flatMap((l) => l.exercises);
    for (const e of all) if (findMoves(e.explanation, e.fen, e.solution).length) withMoves++;
    // la grande majorité des explications citent au moins un coup jouable
    expect(withMoves).toBeGreaterThan(all.length * 0.7);
  });
});
