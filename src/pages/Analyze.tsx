import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Chess, validateFen, type Square } from 'chess.js';
import Board from '../components/Board';
import EvalBar from '../components/EvalBar';
import MoveList from '../components/MoveList';
import ExplanationPanel from '../components/ExplanationPanel';
import { getAnalysisEngine, type AnalysisResult, type EngineLine } from '../engine/stockfish';
import { START_FEN, formatLine, formatScore, parseUci, whiteScore } from '../lib/chessUtils';
import { explainMove } from '../analysis/explain';
import type { BoardArrow, MoveExplanation, SquareMark } from '../analysis/types';

const MAX_DEPTH = 18;
const PREV_DEPTH = 14;
const EXPLAIN_EARLY_DEPTH = 12;

interface Source {
  startFen: string;
  /** Coups de la partie chargée (UCI) — vide pour une simple position. */
  game: string[];
}

function parseInput(text: string): Source | string {
  const t = text.trim();
  if (!t) return 'Collez une FEN ou un PGN.';
  if (validateFen(t).ok) return { startFen: t, game: [] };
  try {
    const c = new Chess();
    c.loadPgn(t);
    const hist = c.history({ verbose: true });
    const startFen = hist.length ? hist[0].before : c.fen();
    return { startFen, game: hist.map((m) => m.from + m.to + (m.promotion ?? '')) };
  } catch {
    return 'Texte non reconnu : ni une FEN valide, ni un PGN lisible.';
  }
}

function replay(startFen: string, moves: string[]) {
  const chess = new Chess(startFen);
  const fens = [chess.fen()];
  const sans: string[] = [];
  const ucis: string[] = [];
  for (const u of moves) {
    try {
      const m = chess.move(parseUci(u));
      sans.push(m.san);
      ucis.push(u);
      fens.push(chess.fen());
    } catch {
      break;
    }
  }
  return { fens, sans, ucis };
}

const turnOfFen = (fen: string): 'w' | 'b' => (fen.split(' ')[1] === 'b' ? 'b' : 'w');

export default function Analyze() {
  const location = useLocation();
  const [source, setSource] = useState<Source>({ startFen: START_FEN, game: [] });
  const [line, setLine] = useState<string[]>([]);
  const [ply, setPly] = useState(0);
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  const [live, setLive] = useState<{ fen: string; lines: EngineLine[]; depth: number; done: boolean } | null>(null);
  const [bestEx, setBestEx] = useState<MoveExplanation | null>(null);
  const [playedEx, setPlayedEx] = useState<MoveExplanation | null>(null);
  const [selected, setSelected] = useState<number>(0);
  const [focus, setFocus] = useState<{ arrows: BoardArrow[]; marks: SquareMark[] }>({ arrows: [], marks: [] });
  const cache = useRef(new Map<string, AnalysisResult>());

  // Chargement depuis la navigation (Play, analyse de parties…)
  useEffect(() => {
    const st = location.state as { pgn?: string; fen?: string } | null;
    const text = st?.pgn ?? st?.fen;
    if (!text) return;
    const r = parseInput(text);
    if (typeof r === 'string') {
      setInputError(r);
      return;
    }
    loadSource(r, st?.fen ? 0 : r.game.length);
    setInput(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const loadSource = (s: Source, atPly = 0) => {
    setSource(s);
    setLine(s.game);
    setPly(Math.min(atPly, s.game.length));
    setInputError(null);
    setOrientation(s.game.length === 0 && turnOfFen(s.startFen) === 'b' ? 'black' : 'white');
  };

  const { fens, sans, ucis } = useMemo(() => replay(source.startFen, line), [source.startFen, line]);
  const fen = fens[Math.min(ply, fens.length - 1)];
  const turn = turnOfFen(fen);
  const inGame = ply > 0 && ply <= source.game.length && line.slice(0, ply).every((u, i) => u === source.game[i]);
  const diverged = line.length !== source.game.length || line.some((u, i) => u !== source.game[i]);
  const gameOver = useMemo(() => new Chess(fen).isGameOver(), [fen]);

  // ---- Analyse continue -------------------------------------------------
  useEffect(() => {
    setBestEx(null);
    setPlayedEx(null);
    setSelected(0);
    setFocus({ arrows: [], marks: [] });
    if (gameOver) {
      setLive(null);
      return;
    }
    let alive = true;
    const engine = getAnalysisEngine();
    const prevFen = inGame ? fens[ply - 1] : null;
    const playedUci = inGame ? ucis[ply - 1] : null;
    let explainedEarly = false;

    const explainPlayed = (prev: AnalysisResult, afterLine?: EngineLine) => {
      if (!prevFen || !playedUci) return;
      const inLines = prev.lines.some((l) => l.pv[0] === playedUci);
      if (!inLines && !afterLine) return;
      try {
        setPlayedEx(explainMove(prevFen, playedUci, prev, { afterLine: inLines ? undefined : afterLine }));
      } catch (e) {
        console.error(e);
      }
    };

    (async () => {
      let prev: AnalysisResult | undefined;
      if (prevFen) {
        prev = cache.current.get(prevFen);
        if (!prev) {
          prev = await engine.analyse(prevFen, { depth: PREV_DEPTH, multipv: 3 });
          if (!alive) return;
          if (prev.depth >= PREV_DEPTH) cache.current.set(prevFen, prev);
        }
        explainPlayed(prev);
      }
      const cached = cache.current.get(fen);
      let result: AnalysisResult;
      if (cached && cached.depth >= MAX_DEPTH) {
        result = cached;
      } else {
        setLive({ fen, lines: [], depth: 0, done: false });
        result = await engine.analyse(fen, {
          depth: MAX_DEPTH,
          multipv: 3,
          onInfo: (lines, depth) => {
            if (!alive) return;
            setLive({ fen, lines, depth, done: false });
            if (!explainedEarly && depth >= EXPLAIN_EARLY_DEPTH && lines.length && lines[0].pv.length) {
              explainedEarly = true;
              const partial: AnalysisResult = { fen, depth, bestMove: lines[0].pv[0], lines };
              // différé pour ne pas bloquer le flux des infos
              setTimeout(() => {
                if (alive) setBestEx(explainMove(fen, partial.lines[0].pv[0], partial));
              }, 0);
            }
          },
        });
        if (!alive) return;
        if (result.depth >= MAX_DEPTH) cache.current.set(fen, result);
      }
      setLive({ fen, lines: result.lines, depth: result.depth, done: true });
      const bestUci = result.lines[0]?.pv[0];
      if (bestUci) setBestEx(explainMove(fen, bestUci, result));
      if (prev && result.lines[0]) explainPlayed(prev, result.lines[0]);
    })().catch((e) => console.error('Analyse interrompue', e));

    return () => {
      alive = false;
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, inGame, gameOver]);

  // Arrêt propre en quittant la page
  useEffect(() => () => getAnalysisEngine().stop(), []);

  // ---- Navigation clavier -------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') setPly((p) => Math.max(0, p - 1));
      else if (e.key === 'ArrowRight') setPly((p) => Math.min(line.length, p + 1));
      else if (e.key === 'Home') setPly(0);
      else if (e.key === 'End') setPly(line.length);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [line.length]);

  // ---- Coups joués sur l'échiquier (exploration) -------------------------
  const onMove = (from: Square, to: Square, promotion?: string): boolean => {
    const c = new Chess(fen);
    try {
      const m = c.move({ from, to, promotion });
      const uci = m.from + m.to + (m.promotion ?? '');
      if (line[ply] === uci) setPly(ply + 1);
      else {
        setLine([...line.slice(0, ply), uci]);
        setPly(ply + 1);
      }
      return true;
    } catch {
      return false;
    }
  };

  const load = () => {
    const r = parseInput(input);
    if (typeof r === 'string') setInputError(r);
    else loadSource(r, 0);
  };

  // ---- Explication de la ligne sélectionnée -------------------------------
  const lines = live && live.fen === fen ? live.lines : [];
  const finalAnalysis: AnalysisResult | null = live && live.fen === fen && lines.length ? { fen, depth: live.depth, bestMove: lines[0].pv[0] ?? null, lines } : null;
  const selectedEx = useMemo(() => {
    if (selected === 0 || !finalAnalysis || !live?.done) return null;
    const l = finalAnalysis.lines[selected];
    if (!l?.pv[0]) return null;
    try {
      return explainMove(fen, l.pv[0], finalAnalysis);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, live?.done, fen]);
  const shownEx = selectedEx ?? bestEx;

  const top = lines[0];
  const evalCp = top ? whiteScore(top, turn) : 0;
  const evalLabel = top ? formatScore(top, turn) : '…';

  const defaultArrows: BoardArrow[] = [];
  lines.forEach((l, i) => {
    if (!l.pv[0]) return;
    if (i === 0 || i === selected) defaultArrows.push({ from: l.pv[0].slice(0, 2) as Square, to: l.pv[0].slice(2, 4) as Square, kind: i === 0 ? 'good' : 'idea' });
  });
  const arrows = focus.arrows.length ? focus.arrows : defaultArrows;
  const lastMove = ply > 0 ? parseUci(ucis[ply - 1]) : null;
  const startMoveNumber = parseInt(source.startFen.split(' ')[5] ?? '1', 10) || 1;
  const gameStatus = (() => {
    const c = new Chess(fen);
    if (c.isCheckmate()) return `Échec et mat : ${turn === 'w' ? 'les Noirs' : 'les Blancs'} gagnent.`;
    if (c.isStalemate()) return 'Pat : partie nulle.';
    if (c.isDraw()) return 'Position nulle (matériel insuffisant ou règle des 50 coups).';
    return null;
  })();

  return (
    <div className="page analyze-page">
      <h1>Analyse expliquée</h1>
      <div className="board-layout">
        <EvalBar whiteCp={evalCp} label={evalLabel} orientation={orientation} height={480} />
        <div className="board-col">
          <Board fen={fen} orientation={orientation} onMove={onMove} arrows={arrows} marks={focus.marks} lastMove={lastMove} id="analyze-board" />
          <div className="btn-row" style={{ marginTop: '0.6rem' }}>
            <button className="btn" onClick={() => setPly(0)} disabled={ply === 0} title="Début (Début)">
              ⏮
            </button>
            <button className="btn" onClick={() => setPly((p) => Math.max(0, p - 1))} disabled={ply === 0} title="Coup précédent (←)">
              ◀
            </button>
            <button className="btn" onClick={() => setPly((p) => Math.min(line.length, p + 1))} disabled={ply >= line.length} title="Coup suivant (→)">
              ▶
            </button>
            <button className="btn" onClick={() => setPly(line.length)} disabled={ply >= line.length} title="Fin (Fin)">
              ⏭
            </button>
            <button className="btn" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
              Retourner
            </button>
            {diverged && source.game.length > 0 && (
              <button
                className="btn"
                onClick={() => {
                  setLine(source.game);
                  setPly(Math.min(ply, source.game.length));
                }}
              >
                Revenir à la partie
              </button>
            )}
          </div>
          <div className="card" style={{ marginTop: '0.75rem' }}>
            <label htmlFor="analyze-input">Position (FEN) ou partie (PGN)</label>
            <textarea id="analyze-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Collez ici une FEN ou un PGN…" />
            {inputError && <p className="analyze-error">{inputError}</p>}
            <div className="btn-row" style={{ marginTop: '0.5rem' }}>
              <button className="btn primary" onClick={load}>
                Charger
              </button>
              <button className="btn" onClick={() => loadSource({ startFen: START_FEN, game: [] })}>
                Position initiale
              </button>
              <button className="btn" onClick={() => setInput(fen)}>
                Afficher la FEN actuelle
              </button>
            </div>
          </div>
        </div>

        <div className="side-col analyze-side">
          <div className="card">
            <div className="analyze-engine-head">
              <h3>Moteur</h3>
              <span className="muted">
                {gameStatus ? '' : live?.fen === fen ? (live.done ? `profondeur ${live.depth}` : <><span className="spinner" aria-hidden /> profondeur {live.depth}/{MAX_DEPTH}</>) : 'en attente…'}
              </span>
            </div>
            {gameStatus ? (
              <p>{gameStatus}</p>
            ) : (
              <ol className="engine-lines">
                {lines.map((l, i) => (
                  <li key={l.multipv}>
                    <button
                      type="button"
                      className={`engine-line${selected === i ? ' selected' : ''}`}
                      onClick={() => setSelected(i)}
                      onMouseEnter={() => l.pv[0] && setFocus({ arrows: [{ from: l.pv[0].slice(0, 2) as Square, to: l.pv[0].slice(2, 4) as Square, kind: i === 0 ? 'good' : 'idea' }], marks: [] })}
                      onMouseLeave={() => setFocus({ arrows: [], marks: [] })}
                    >
                      <span className="badge">{formatScore(l, turn)}</span>
                      <span className="mono">{formatLine(fen, l.pv, 10)}</span>
                    </button>
                  </li>
                ))}
                {!lines.length && <li className="muted">Calcul en cours…</li>}
              </ol>
            )}
            {lines.length > 1 && <p className="muted analyze-hint">Cliquez sur une ligne pour l’expliquer.</p>}
          </div>

          {playedEx && (
            <div className="card">
              <ExplanationPanel title={`Coup joué dans la partie : ${playedEx.san}`} explanation={playedEx} onFocusArrows={(a, m) => setFocus({ arrows: a, marks: m })} />
            </div>
          )}

          {shownEx && !gameStatus && (
            <div className="card">
              <ExplanationPanel
                title={selectedEx ? `Ligne ${selected + 1} : ce que vise ce coup` : `Meilleur coup${live?.done ? '' : ' (analyse en cours)'}`}
                explanation={shownEx}
                onFocusArrows={(a, m) => setFocus({ arrows: a, marks: m })}
              />
            </div>
          )}

          <div className="card">
            <h3>Coups</h3>
            <MoveList sans={sans} current={ply} onSelect={setPly} startTurn={turnOfFen(source.startFen)} startMoveNumber={startMoveNumber} />
            {ply > 0 && (
              <button className="btn ghost" onClick={() => setPly(0)} style={{ marginTop: '0.4rem' }}>
                Position de départ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
