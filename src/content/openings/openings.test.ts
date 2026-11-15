import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { openings } from './index';
import { parseOpeningPgn, repertoireLines, sideColor, trainingPositions, pathTo, repertoireMoves, type OpeningNode } from '../../lib/openingTree';

// Ouverture en cours de rédaction : `ONLY=london npx vitest run src/content/openings` pour ne tester qu'elle.
const only = process.env.ONLY;
const list = only ? openings.filter((o) => o.id === only) : openings;

function loadLegal(fen: string): Chess {
  const chess = new Chess(fen);
  const parts = fen.split(' ');
  const other = parts[1] === 'w' ? 'b' : 'w';
  const flipped = new Chess([parts[0], other, '-', '-', '0', '1'].join(' '), { skipValidation: true });
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
}

const where = (n: OpeningNode) => pathTo(n).map((x) => x.san).join(' ');

describe('ouvertures', () => {
  it('identifiants uniques', () => {
    expect(new Set(openings.map((o) => o.id)).size).toBe(openings.length);
  });

  for (const o of list) {
    describe(o.id, () => {
      const tree = parseOpeningPgn(o.pgn);
      const c = sideColor(o.side);
      const nodes = [...tree.byId.values()].filter((n) => n.parent);
      const rep = o.family === 'repertoire';

      it('fiche complète', () => {
        expect(o.name && o.against && o.summary && o.why).toBeTruthy();
        expect(o.keyIdeas.length).toBeGreaterThanOrEqual(4);
        expect(o.keyIdeas.length).toBeLessThanOrEqual(7);
        const positions = o.sections.filter((s) => s.type === 'position');
        expect(positions.length).toBeGreaterThanOrEqual(rep ? 3 : 2);
        expect(o.traps.length).toBeGreaterThanOrEqual(rep ? 3 : 1);
      });

      it('arbre assez riche', () => {
        const lines = repertoireLines(tree, o.side);
        expect(lines.length).toBeGreaterThanOrEqual(rep ? 8 : 3);
        expect(trainingPositions(tree, o.side).length).toBeGreaterThanOrEqual(rep ? 25 : 6);
      });

      it('chaque coup du répertoire est expliqué', () => {
        for (const n of nodes) {
          if (n.color === c && !n.dubious) expect(n.comment.length, `coup sans explication : ${where(n)}`).toBeGreaterThanOrEqual(25);
          if (n.dubious) expect(n.comment.length, `erreur non expliquée : ${where(n)}`).toBeGreaterThanOrEqual(40);
          // une réponse adverse à un embranchement doit dire ce qu'elle veut
          if (n.color !== c && n.parent && n.parent.children.length > 1) expect(n.comment.length, `réponse adverse sans commentaire : ${where(n)}`).toBeGreaterThanOrEqual(20);
        }
      });

      it('un seul coup de répertoire (au plus deux) par position', () => {
        for (const n of trainingPositions(tree, o.side)) {
          expect(repertoireMoves(n, o.side).length, `trop de choix après ${where(n) || 'le début'}`).toBeLessThanOrEqual(2);
        }
      });

      o.sections.forEach((s, i) => {
        if (s.type !== 'position') return;
        it(`position ${i} légale`, () => playAll(s.fen, (s.moves ?? []).map((m) => m.uci)));
      });

      o.traps.forEach((ex, i) => {
        it(`piège ${i + 1} légal`, () => {
          playAll(ex.fen, ex.solution);
          for (const alt of ex.acceptAlso ?? []) playAll(ex.fen, [alt]);
          expect(ex.explanation.length).toBeGreaterThan(80);
        });
      });
    });
  }
});
