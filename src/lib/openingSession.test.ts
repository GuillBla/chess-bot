import { beforeEach, describe, expect, it } from 'vitest';
import { parseOpeningPgn } from './openingTree';
import { lineCardIds, linesToStudy, reviewQueue, dueCount } from './openingSession';
import { grade, getCard, resetOpening, BOX_DAYS, type SrsState } from './openingSrs';
import type { Opening } from '../content/openings/types';

const PGN = `1.d4 {Centre.} d5 {Sym.} (1...Nf6 {Indienne.} 2.Bf4 {Le fou sort.}) 2.Bf4 {Le fou sort.} c5 {Contre.} (2...Nf6 {Calme.} 3.e3 {Solide.}) 3.e3 {Solide.} *`;
const opening = { id: 'test', side: 'white', pgn: PGN } as Opening;
const tree = parseOpeningPgn(PGN);
const DAY = 24 * 3600 * 1000;

describe('séances d’entraînement', () => {
  beforeEach(() => resetOpening('test'));

  it('positions d’une ligne = position avant chacun de nos coups', () => {
    const line = linesToStudy(opening, tree, {})[0].line;
    expect(line.map((n) => n.san)).toEqual(['d4', 'd5', 'Bf4', 'c5', 'e3']);
    expect(lineCardIds(line, 'white')).toEqual(['', 'd2d4 d7d5', 'd2d4 d7d5 c1f4 c7c5']);
  });

  it('les lignes avec des positions jamais vues passent d’abord, puis les dues', () => {
    const now = Date.now();
    const srs: SrsState = {
      test: {
        '': { box: 2, due: now + 10 * DAY, reps: 1, lapses: 0, last: now },
        'd2d4 d7d5': { box: 2, due: now + 10 * DAY, reps: 1, lapses: 0, last: now },
        'd2d4 d7d5 c1f4 c7c5': { box: 1, due: now - 1, reps: 1, lapses: 0, last: now },
        'd2d4 d7d5 c1f4 g8f6': { box: 2, due: now + 10 * DAY, reps: 1, lapses: 0, last: now },
      },
    };
    const order = linesToStudy(opening, tree, srs, '', now).map((t) => t.line.map((n) => n.san).join(' '));
    expect(order).toEqual(['d4 Nf6 Bf4', 'd4 d5 Bf4 c5 e3', 'd4 d5 Bf4 Nf6 e3']);
    expect(dueCount(opening, tree, srs, now)).toBe(1);
    expect(reviewQueue([{ opening, tree }], srs, now).map((t) => t.line.map((n) => n.san).join(' '))).toEqual(['d4 d5 Bf4 c5 e3']);
  });

  it('filtre par variante', () => {
    const lines = linesToStudy(opening, tree, {}, 'd2d4 g8f6');
    expect(lines.map((t) => t.line.map((n) => n.san).join(' '))).toEqual(['d4 Nf6 Bf4']);
  });

  it('répétition espacée : boîte suivante si trouvé, boîte 1 et à revoir tout de suite si raté', () => {
    const now = new Date(2026, 0, 10, 15).getTime();
    grade('test', 'x', 'good', now);
    expect(getCard('test', 'x')!.box).toBe(1);
    expect(getCard('test', 'x')!.due).toBeGreaterThan(now);
    expect(getCard('test', 'x')!.due).toBeLessThanOrEqual(now + BOX_DAYS[1] * DAY);
    // revue en avance : pas de promotion
    grade('test', 'x', 'good', now + 1000);
    expect(getCard('test', 'x')!.box).toBe(1);
    grade('test', 'x', 'good', now + 2 * DAY);
    expect(getCard('test', 'x')!.box).toBe(2);
    grade('test', 'x', 'again', now + 3 * DAY);
    expect(getCard('test', 'x')).toMatchObject({ box: 1, due: now + 3 * DAY, lapses: 1 });
  });
});
