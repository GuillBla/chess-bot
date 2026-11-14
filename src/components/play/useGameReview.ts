// Revue rapide d'une partie en tâche de fond : une analyse courte (profondeur ~10) de chaque position,
// puis classement de chaque coup avec classify.ts. Utilise un moteur dédié pour ne pas
// interférer avec l'analyse continue de la position affichée.
import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { StockfishEngine } from '../../engine/stockfish';
import { MATE_CP, classifyMove, gameAccuracy, isError, lineCp, type MoveClass } from '../../analysis/classify';
import { parseUci } from '../../lib/chessUtils';

export interface GameReviewState {
  /** Éval de chaque position (index 0 = départ), point de vue des Blancs ; null = pas encore analysée. */
  evals: (number | null)[];
  /** Meilleur coup UCI de chaque position. */
  bests: (string | null)[];
  /** Classification de chaque demi-coup (null = pas encore classé). */
  classes: (MoveClass | null)[];
  /** Positions analysées / total. */
  done: number;
  total: number;
  status: 'idle' | 'running' | 'paused' | 'done';
  /** Précision par couleur (quand la revue est complète). */
  accuracy: { white: number | null; black: number | null } | null;
  pause: () => void;
  resume: () => void;
}

let reviewEngine: StockfishEngine | null = null;
function getReviewEngine(): StockfishEngine {
  if (!reviewEngine) reviewEngine = new StockfishEngine();
  return reviewEngine;
}

/** Cache des revues (clé = position de départ + coups) pour revenir instantanément sur une partie. */
const cache = new Map<string, { evals: (number | null)[]; bests: (string | null)[] }>();

/** Éval d'une position terminale (mat / pat / nulle), point de vue des Blancs ; null sinon. */
export function terminalWhiteCp(fen: string): number | null {
  const c = new Chess(fen);
  if (c.isCheckmate()) return c.turn() === 'w' ? -MATE_CP : MATE_CP;
  if (c.isStalemate() || c.isInsufficientMaterial() || c.isDraw()) return 0;
  return null;
}

/** Classe chaque coup à partir des évals successives (point de vue des Blancs). Pur, testable. */
export function classifyGame(fens: string[], moves: string[], evals: (number | null)[], bests: (string | null)[]): (MoveClass | null)[] {
  const out: (MoveClass | null)[] = [];
  let prevErred = false;
  for (let i = 0; i < moves.length; i++) {
    const before = evals[i];
    const after = evals[i + 1];
    if (before === null || before === undefined || after === null || after === undefined) {
      out.push(null);
      prevErred = false;
      continue;
    }
    const sign = fens[i]?.split(' ')[1] === 'b' ? -1 : 1;
    const c = classifyMove({ beforeCp: sign * before, afterCp: sign * after, isBest: bests[i] === moves[i], opponentErred: prevErred });
    prevErred = isError(c.cls);
    out.push(c.cls);
  }
  return out;
}

function fensOf(startFen: string, moves: string[]): string[] {
  const chess = new Chess(startFen);
  const fens = [chess.fen()];
  for (const u of moves) {
    try {
      chess.move(parseUci(u));
      fens.push(chess.fen());
    } catch {
      break;
    }
  }
  return fens;
}

/**
 * @param moves coups UCI de la partie (vide = rien à analyser).
 * @param depth profondeur de l'analyse rapide.
 */
export function useGameReview(startFen: string, moves: string[], depth = 10): GameReviewState {
  const key = `${startFen}|${moves.join(' ')}`;
  const fens = useMemo(() => fensOf(startFen, moves), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [data, setData] = useState<{ key: string; evals: (number | null)[]; bests: (string | null)[] }>({ key: '', evals: [], bests: [] });
  const [pausedKey, setPausedKey] = useState<string | null>(null);
  const paused = pausedKey === key;
  const enabled = fens.length > 1;

  useEffect(() => {
    if (!enabled) return;
    const prev = cache.get(key);
    const evals = prev ? [...prev.evals] : fens.map(() => null as number | null);
    const bests = prev ? [...prev.bests] : fens.map(() => null as string | null);
    setData({ key, evals: [...evals], bests: [...bests] });
    if (paused || evals.every((e) => e !== null)) return;

    let alive = true;
    const engine = getReviewEngine();
    (async () => {
      for (let i = 0; i < fens.length; i++) {
        if (!alive) return;
        if (evals[i] !== null) continue;
        const terminal = terminalWhiteCp(fens[i]);
        if (terminal !== null) {
          evals[i] = terminal;
        } else {
          const a = await engine.analyse(fens[i], { depth, multipv: 1 });
          // Recherche interrompue (pause, autre partie) : résultat partiel ignoré.
          if (!alive) return;
          const best = a.lines[0];
          const cp = best ? lineCp(best) : 0;
          evals[i] = fens[i].split(' ')[1] === 'b' ? -cp : cp;
          bests[i] = a.bestMove ?? best?.pv[0] ?? null;
        }
        cache.set(key, { evals: [...evals], bests: [...bests] });
        setData({ key, evals: [...evals], bests: [...bests] });
      }
    })().catch((e) => console.error('Revue de partie interrompue', e));

    return () => {
      alive = false;
      engine.stop();
    };
  }, [key, paused, enabled, depth]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = data.key === key && enabled ? data : { evals: [] as (number | null)[], bests: [] as (string | null)[] };
  const done = current.evals.filter((e) => e !== null).length;
  const total = enabled ? fens.length : 0;
  const complete = enabled && done === total;
  const moveCount = fens.length - 1;
  const classes = useMemo(
    () => (current.evals.length ? classifyGame(fens, moves.slice(0, moveCount), current.evals, current.bests) : []),
    [current.evals, current.bests, fens], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const accuracy = useMemo(() => {
    if (!complete) return null;
    const cps = current.evals as number[];
    const first = fens[0].split(' ')[1] === 'b' ? 'black' : 'white';
    return { white: gameAccuracy(cps, 'white', first), black: gameAccuracy(cps, 'black', first) };
  }, [complete, current.evals, fens]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    evals: current.evals,
    bests: current.bests,
    classes,
    done,
    total,
    status: !enabled ? 'idle' : complete ? 'done' : paused ? 'paused' : 'running',
    accuracy,
    pause: () => setPausedKey(key),
    resume: () => setPausedKey(null),
  };
}
