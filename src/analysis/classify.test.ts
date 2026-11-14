import { describe, expect, it } from 'vitest';
import { classifyMove, gameAccuracy, isError, lineCp, moveAccuracy, winPercent, MATE_CP } from './classify';

describe('lineCp', () => {
  it('renvoie les centipions tels quels', () => {
    expect(lineCp({ cp: 35, mate: null })).toBe(35);
  });
  it('convertit les mats en scores extrêmes ordonnés', () => {
    expect(lineCp({ cp: null, mate: 2 })).toBe(MATE_CP - 2);
    expect(lineCp({ cp: null, mate: -3 })).toBe(-MATE_CP + 3);
    expect(lineCp({ cp: null, mate: 1 })).toBeGreaterThan(lineCp({ cp: null, mate: 5 }));
  });
});

describe('winPercent', () => {
  it('vaut 50 % à égalité et est symétrique', () => {
    expect(winPercent(0)).toBeCloseTo(50, 5);
    expect(winPercent(300) + winPercent(-300)).toBeCloseTo(100, 5);
  });
  it('vaut 100 / 0 pour un mat', () => {
    expect(winPercent(MATE_CP - 3)).toBe(100);
    expect(winPercent(-MATE_CP + 3)).toBe(0);
  });
});

describe('classifyMove', () => {
  it('meilleur coup quand le coup est le premier choix', () => {
    expect(classifyMove({ beforeCp: 40, afterCp: 30, isBest: true }).cls).toBe('best');
  });
  it('excellent / bon pour de petites pertes', () => {
    expect(classifyMove({ beforeCp: 30, afterCp: 10 }).cls).toBe('excellent');
    expect(classifyMove({ beforeCp: 30, afterCp: -20 }).cls).toBe('good');
  });
  it('imprécision, erreur, gaffe selon la perte de win%', () => {
    expect(classifyMove({ beforeCp: 0, afterCp: -80 }).cls).toBe('inaccuracy'); // ~7 %
    expect(classifyMove({ beforeCp: 0, afterCp: -150 }).cls).toBe('mistake'); // ~13.7 %
    expect(classifyMove({ beforeCp: 0, afterCp: -350 }).cls).toBe('blunder'); // ~28 %
  });
  it("ne sanctionne pas une perte de centipions dans une position déjà gagnée", () => {
    // +9 → +7 : win% passe de ~96 % à ~93 %, simple « bon » coup.
    expect(classifyMove({ beforeCp: 900, afterCp: 700 }).cls).toBe('good');
  });
  it('laisser filer un mat forcé est au moins une erreur', () => {
    const r = classifyMove({ beforeCp: MATE_CP - 2, afterCp: 300 });
    expect(['mistake', 'blunder']).toContain(r.cls);
  });
  it('gaffe quand on passe de gagnant à perdant', () => {
    expect(classifyMove({ beforeCp: 400, afterCp: -400 }).cls).toBe('blunder');
  });
  it("coup manqué quand l'adversaire venait de gaffer et qu'on rend l'avantage", () => {
    const r = classifyMove({ beforeCp: 500, afterCp: 50, opponentErred: true });
    expect(r.cls).toBe('miss');
    expect(isError(r.cls)).toBe(true);
    // Sans erreur adverse, c'est une gaffe classique.
    expect(classifyMove({ beforeCp: 500, afterCp: 50 }).cls).toBe('blunder');
  });
  it('perte nulle si la position s’améliore', () => {
    const r = classifyMove({ beforeCp: 0, afterCp: 100 });
    expect(r.winLoss).toBe(0);
    expect(r.accuracy).toBe(100);
  });
});

describe('moveAccuracy', () => {
  it('décroît avec la perte et reste dans [0, 100]', () => {
    const a = moveAccuracy(50, 45);
    const b = moveAccuracy(50, 30);
    expect(a).toBeGreaterThan(b);
    expect(moveAccuracy(100, 0)).toBeGreaterThanOrEqual(0);
    expect(moveAccuracy(50, 50)).toBe(100);
  });
});

describe('gameAccuracy', () => {
  it('donne ~100 % pour une partie sans perte', () => {
    const evals = [20, 25, 20, 30, 25, 30, 20, 25, 20, 30, 30];
    expect(gameAccuracy(evals, 'white')!).toBeGreaterThan(95);
    expect(gameAccuracy(evals, 'black')!).toBeGreaterThan(95);
  });
  it('pénalise le camp qui gaffe', () => {
    // Les Noirs gaffent au 4e demi-coup (0 → +500 pour les Blancs).
    const evals = [20, 20, 20, 20, 500, 520, 510, 530, 520, 540, 540, 560];
    const w = gameAccuracy(evals, 'white')!;
    const b = gameAccuracy(evals, 'black')!;
    expect(w).toBeGreaterThan(b);
    expect(b).toBeLessThan(80);
  });
  it('gère un premier coup des Noirs', () => {
    const evals = [0, 400, 400]; // les Noirs (1er coup) gaffent
    expect(gameAccuracy(evals, 'black', 'black')!).toBeLessThan(gameAccuracy(evals, 'white', 'black')!);
  });
  it('renvoie null sans coups', () => {
    expect(gameAccuracy([10], 'white')).toBeNull();
  });
});
