import { useEffect, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import Board from '../Board';
import { formatLine, parseUci } from '../../lib/chessUtils';
import { getAnalysisEngine, type EngineLine } from '../../engine/stockfish';
import type { Exercise } from '../../content/lessons/types';
import type { BoardArrow, SquareMark } from '../../analysis/types';
import { RichText } from './RichText';

type Status = 'playing' | 'wrong' | 'checking' | 'solved' | 'alternative' | 'revealed';

interface Props {
  exercise: Exercise;
  index: number;
  solvedBefore: boolean;
  onSolved: () => void;
}

/** Tolérance (centipions) pour accepter un coup non prévu, vérifié par Stockfish. */
const ALT_TOLERANCE = 30;
const REPLY_DELAY = 550;

/** Score « centipions » d'une ligne du point de vue du camp au trait (mat = ±10000). */
function lineScore(l: Pick<EngineLine, 'cp' | 'mate'> | undefined): number | null {
  if (!l) return null;
  if (l.mate !== null) return l.mate > 0 ? 10000 - l.mate : -10000 - l.mate;
  return l.cp;
}

function sideName(fen: string) {
  return fen.split(' ')[1] === 'b' ? 'Les Noirs' : 'Les Blancs';
}

export default function ExercisePlayer({ exercise, index, solvedBefore, onSolved }: Props) {
  const { fen: startFen, solution } = exercise;
  const orientation = startFen.split(' ')[1] === 'b' ? 'black' : 'white';
  const [fen, setFen] = useState(startFen);
  const [ply, setPly] = useState(0); // index du prochain coup attendu dans `solution`
  const [status, setStatus] = useState<Status>('playing');
  const [message, setMessage] = useState<string>('');
  const [hint, setHint] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [wrongArrow, setWrongArrow] = useState<BoardArrow | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const timers = useRef<number[]>([]);
  const alive = useRef(true);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimers();
    };
  }, []);

  // Changement d'exercice : on repart de zéro.
  useEffect(() => {
    reset();
  }, [exercise]);

  function reset() {
    clearTimers();
    setFen(startFen);
    setPly(0);
    setStatus('playing');
    setMessage('');
    setHint(false);
    setLastMove(null);
    setWrongArrow(null);
    setMistakes(0);
  }

  function finish(kind: 'solved' | 'alternative', msg: string) {
    setStatus(kind);
    setMessage(msg);
    setHint(false);
    onSolved();
  }

  /** Joue la réponse adverse (solution[p]) puis rend la main, ou termine l'exercice. */
  function playReply(fenNow: string, p: number) {
    if (p >= solution.length) {
      finish('solved', mistakes === 0 ? 'Bravo, c’est exactement ça !' : 'Résolu !');
      return;
    }
    later(() => {
      const chess = new Chess(fenNow);
      const mv = chess.move(parseUci(solution[p]));
      setFen(chess.fen());
      setLastMove({ from: mv.from, to: mv.to });
      if (p + 1 >= solution.length) {
        finish('solved', mistakes === 0 ? 'Bravo, c’est exactement ça !' : 'Résolu !');
      } else {
        setPly(p + 1);
        setStatus('playing');
        setMessage(`Réponse : ${mv.san}. À toi.`);
      }
    }, REPLY_DELAY);
  }

  async function checkAlternative(fenBefore: string, fenAfter: string, san: string, from: Square, to: Square) {
    setStatus('checking');
    setMessage(`${san} n’est pas le coup prévu… vérification avec Stockfish.`);
    try {
      const engine = getAnalysisEngine();
      const before = await engine.analyse(fenBefore, { depth: 16 });
      const chessAfter = new Chess(fenAfter);
      let userScore: number | null;
      if (chessAfter.isCheckmate()) userScore = 10000;
      else if (chessAfter.isDraw()) userScore = 0;
      else {
        const after = await engine.analyse(fenAfter, { depth: 15 });
        const s = lineScore(after.lines[0]);
        userScore = s === null ? null : -s;
      }
      const best = lineScore(before.lines[0]);
      if (!alive.current) return;
      if (best !== null && userScore !== null && best - userScore <= ALT_TOLERANCE) {
        setFen(fenAfter);
        setLastMove({ from, to });
        finish('alternative', `Coup alternatif valable : ${san} est presque aussi fort selon Stockfish. La ligne prévue est expliquée ci-dessous.`);
        return;
      }
      wrong(san, from, to);
    } catch {
      if (alive.current) wrong(san, from, to);
    }
  }

  function wrong(san: string, from: Square, to: Square) {
    setMistakes((m) => m + 1);
    setStatus('wrong');
    setWrongArrow({ from, to, kind: 'bad' });
    setMessage(`${san} n’est pas le meilleur coup ici. Cherche encore : quels sont les coups forcés ?`);
    later(() => setWrongArrow(null), 1600);
  }

  function onMove(from: Square, to: Square, promotion?: string): boolean {
    if (status !== 'playing' && status !== 'wrong') return false;
    const chess = new Chess(fen);
    let mv;
    try {
      mv = chess.move({ from, to, promotion });
    } catch {
      return false;
    }
    const uci = mv.from + mv.to + (mv.promotion ?? '');
    const expected = solution[ply];
    setWrongArrow(null);
    if (uci === expected) {
      setFen(chess.fen());
      setLastMove({ from: mv.from, to: mv.to });
      setHint(false);
      setStatus('checking');
      setMessage(`${mv.san} — correct !`);
      playReply(chess.fen(), ply + 1);
      return true;
    }
    if (ply === 0 && exercise.acceptAlso?.includes(uci)) {
      setFen(chess.fen());
      setLastMove({ from: mv.from, to: mv.to });
      finish('alternative', `${mv.san} est aussi un bon coup ! La ligne principale est expliquée ci-dessous.`);
      return true;
    }
    void checkAlternative(fen, chess.fen(), mv.san, mv.from, mv.to);
    return false;
  }

  function showSolution() {
    clearTimers();
    setStatus('revealed');
    setHint(false);
    setWrongArrow(null);
    setMessage('Solution :');
    // Rejoue la ligne depuis la position courante, coup par coup.
    let f = fen;
    for (let p = ply; p < solution.length; p++) {
      const delay = (p - ply) * 700 + 200;
      const uci = solution[p];
      later(() => {
        const chess = new Chess(f);
        const mv = chess.move(parseUci(uci));
        f = chess.fen();
        setFen(f);
        setLastMove({ from: mv.from, to: mv.to });
      }, delay);
    }
  }

  const done = status === 'solved' || status === 'alternative' || status === 'revealed';
  const expected = solution[ply];
  const marks: SquareMark[] = hint && expected && !done ? [{ square: expected.slice(0, 2) as Square, kind: 'strong' }] : [];
  const arrows: BoardArrow[] = wrongArrow ? [wrongArrow] : [];
  const msgClass =
    status === 'wrong' ? 'bad' : status === 'solved' || status === 'alternative' ? 'good' : status === 'revealed' ? 'idea' : '';

  return (
    <div className="lesson-ex-grid">
      <div className="lesson-board">
        <Board
          id={`exercise-${index}`}
          fen={fen}
          orientation={orientation}
          onMove={done || status === 'checking' ? undefined : onMove}
          arrows={arrows}
          marks={marks}
          lastMove={lastMove}
          maxWidth={480}
        />
      </div>
      <div className="lesson-ex-side">
        {exercise.title && <h3>{exercise.title}</h3>}
        <p className="lesson-turn">
          <span className={`badge ${orientation === 'white' ? '' : 'idea'}`}>{sideName(startFen)} jouent</span>
          {solvedBefore && <span className="badge good">Déjà réussi</span>}
        </p>
        <p>
          <RichText text={exercise.prompt} />
        </p>
        {message && (
          <p className={`lesson-msg ${msgClass}`} role="status">
            {status === 'checking' && <span className="spinner" aria-hidden />} {message}
          </p>
        )}
        {status === 'revealed' && <p className="mono lesson-line">{formatLine(startFen, solution, solution.length)}</p>}
        <div className="btn-row">
          {!done && (
            <>
              <button className="btn" onClick={() => setHint(true)} disabled={hint || status === 'checking'}>
                Indice
              </button>
              <button className="btn" onClick={showSolution} disabled={status === 'checking'}>
                Solution
              </button>
            </>
          )}
          <button className="btn ghost" onClick={reset}>
            Recommencer
          </button>
        </div>
        {hint && !done && <p className="muted small">La case en vert indique la pièce à jouer.</p>}
        {done && (
          <div className="lesson-explain">
            <h4>Explication</h4>
            {status !== 'revealed' && <p className="mono lesson-line">{formatLine(startFen, solution, solution.length)}</p>}
            <p>
              <RichText text={exercise.explanation} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
