import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { lessons } from './index';

const EXPECTED_IDS = [
  'structures-de-pions',
  'prophylaxie',
  'bonnes-mauvaises-pieces',
  'attaque-sur-le-roi',
  'calcul',
  'tactique-avancee',
  'finales-pions',
  'finales-tours',
  'convertir-avantage',
  'defense',
  'dynamique-vs-statique',
];

/** Charge une FEN et vérifie qu'elle est légale (chess.js + roi du camp qui n'a pas le trait hors d'échec). */
function loadLegal(fen: string): Chess {
  const chess = new Chess(fen); // lève une erreur si la FEN est invalide
  expect(chess.fen().split(' ').slice(0, 4).join(' ')).toBe(fen.split(' ').slice(0, 4).join(' '));
  const parts = fen.split(' ');
  const other = parts[1] === 'w' ? 'b' : 'w';
  const flipped = new Chess([parts[0], other, '-', '-', '0', '1'].join(' '), { skipValidation: true });
  // Si le camp qui n'a pas le trait était en échec, on pourrait capturer son roi : position illégale.
  expect(flipped.inCheck(), `le camp qui n'a pas le trait est en échec : ${fen}`).toBe(false);
  return chess;
}

function playAll(fen: string, moves: string[]) {
  const chess = loadLegal(fen);
  for (const uci of moves) {
    let ok = true;
    try {
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    } catch {
      ok = false;
    }
    expect(ok, `coup illégal ${uci} dans ${fen} (après ${chess.history().join(' ')})`).toBe(true);
  }
  return chess;
}

describe('leçons', () => {
  it('contient exactement les 11 leçons attendues', () => {
    expect(lessons.map((l) => l.id).sort()).toEqual([...EXPECTED_IDS].sort());
  });

  for (const lesson of lessons) {
    describe(lesson.id, () => {
      it('a un contenu complet', () => {
        const positions = lesson.sections.filter((s) => s.type === 'position');
        expect(positions.length).toBeGreaterThanOrEqual(2);
        expect(positions.length).toBeLessThanOrEqual(4);
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(3);
        expect(lesson.exercises.length).toBeLessThanOrEqual(5);
      });

      lesson.sections.forEach((s, i) => {
        if (s.type !== 'position') return;
        it(`position ${i} : FEN légale et coups légaux`, () => {
          playAll(s.fen, (s.moves ?? []).map((m) => m.uci));
          const board = new Chess(s.fen);
          for (const a of s.arrows ?? []) {
            expect(a.from).toMatch(/^[a-h][1-8]$/);
            expect(a.to).toMatch(/^[a-h][1-8]$/);
          }
          for (const m of s.marks ?? []) expect(m.square).toMatch(/^[a-h][1-8]$/);
          expect(board).toBeTruthy();
        });
      });

      lesson.exercises.forEach((ex, i) => {
        it(`exercice ${i + 1} : FEN légale, solution et alternatives légales`, () => {
          expect(ex.solution.length).toBeGreaterThan(0);
          playAll(ex.fen, ex.solution);
          for (const alt of ex.acceptAlso ?? []) {
            expect(alt).not.toBe(ex.solution[0]);
            playAll(ex.fen, [alt]);
          }
          expect(ex.explanation.length).toBeGreaterThan(80);
        });
      });
    });
  }
});
