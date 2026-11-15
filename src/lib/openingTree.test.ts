import { describe, expect, it } from 'vitest';
import { parseOpeningPgn, repertoireLines, trainingPositions, variationName } from './openingTree';

const PGN = `1.d4 {Le centre.} d5 {[%name Ligne principale] Symétrique.} (1...Nf6 {[%name Indienne] Souple.} 2.Bf4 {Le fou sort. [%cal Gc1f4]}) 2.Bf4 {Le fou sort avant e3. [%csl Gf4]} c5 {Contre-attaque.} (2...Nf6 {Calme.} 3.e3 {Solide.}) 3.e3 {Solide.} Qb6 {Vise b2.} 4.Nc3! {On défend par la tactique.} (4.b3?! {Affaiblit c3 sans nécessité.}) 4...Qxb2?? {Piège.} 5.Nb5 {Menace Cc7+.} *`;

describe('openingTree', () => {
  const t = parseOpeningPgn(PGN);
  it('construit les variantes', () => {
    expect(t.root.children.map((c) => c.san)).toEqual(['d4']);
    const d4 = t.root.children[0];
    expect(d4.children.map((c) => c.san)).toEqual(['d5', 'Nf6']);
    expect(variationName(d4.children[1].children[0])).toBe('Indienne');
    expect(d4.children[1].children[0].arrows).toEqual([{ from: 'c1', to: 'f4', kind: 'good' }]);
  });
  it('fusionne les coups identiques et lit les annotations', () => {
    const bf4 = t.byId.get('d2d4 d7d5 c1f4')!;
    expect(bf4.marks).toEqual([{ square: 'f4', kind: 'strong' }]);
    const qb6 = t.byId.get('d2d4 d7d5 c1f4 c7c5 e2e3 d8b6')!;
    expect(qb6.children.map((c) => [c.san, c.nag, c.dubious])).toEqual([
      ['Nc3', '!', false],
      ['b3', '?!', true],
    ]);
    expect(t.byId.get('d2d4 d7d5 c1f4 c7c5 e2e3 d8b6 b1c3 b6b2')!.dubious).toBe(true);
  });
  it('lignes et positions à mémoriser (sans nos erreurs)', () => {
    const lines = repertoireLines(t, 'white').map((l) => l.map((n) => n.san).join(' '));
    expect(lines).toEqual(['d4 d5 Bf4 c5 e3 Qb6 Nc3 Qxb2 Nb5', 'd4 d5 Bf4 Nf6 e3', 'd4 Nf6 Bf4']);
    expect(trainingPositions(t, 'white').length).toBe(7);
  });
  it('erreur explicite sur coup illégal', () => {
    expect(() => parseOpeningPgn('1.e4 e5 2.Ke3')).toThrow(/Ke3/);
  });
});
