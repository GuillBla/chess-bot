import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess, type Square } from 'chess.js';
import Board from '../components/Board';
import EvalBar from '../components/EvalBar';
import MoveList from '../components/MoveList';
import ExplanationPanel from '../components/ExplanationPanel';
import { getAnalysisEngine, getPlayEngine, type EngineLine } from '../engine/stockfish';
import { MAX_ELO, MIN_ELO, eloLabel, pickBotMove, strengthForElo } from '../engine/strength';
import { START_FEN, formatScore, parseUci, whiteScore } from '../lib/chessUtils';
import { explainMove, explainPosition } from '../analysis/explain';
import type { BoardArrow, MoveExplanation, SquareMark } from '../analysis/types';

type Side = 'w' | 'b';
type ColorChoice = Side | 'random';

interface SavedGame {
  moves: string[];
  player: Side;
  elo: number;
  result?: string | null;
}

const STORAGE_KEY = 'chessbot.play.v1';
const SETTINGS_KEY = 'chessbot.play.settings.v1';
const MIN_BOT_DELAY = 400;

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Rejoue une liste de coups UCI ; renvoie l'instance finale et les FEN successives. */
function replay(moves: string[]) {
  const chess = new Chess(START_FEN);
  const fens = [chess.fen()];
  const sans: string[] = [];
  for (const u of moves) {
    try {
      sans.push(chess.move(parseUci(u)).san);
      fens.push(chess.fen());
    } catch {
      break;
    }
  }
  return { chess, fens, sans };
}

function gameOverText(chess: Chess, player: Side): string | null {
  if (chess.isCheckmate()) return chess.turn() === player ? 'Échec et mat : le bot gagne.' : 'Échec et mat : vous gagnez ! Bravo.';
  if (chess.isStalemate()) return 'Pat : le camp au trait n’a aucun coup légal mais n’est pas en échec. Partie nulle.';
  if (chess.isThreefoldRepetition()) return 'Nulle par triple répétition de la position.';
  if (chess.isInsufficientMaterial()) return 'Nulle : matériel insuffisant pour mater.';
  if (chess.isDrawByFiftyMoves()) return 'Nulle par la règle des 50 coups.';
  return null;
}

function pgnResult(chess: Chess, resigned: string | null | undefined): string {
  if (resigned) return resigned;
  if (chess.isCheckmate()) return chess.turn() === 'w' ? '0-1' : '1-0';
  if (chess.isDraw()) return '1/2-1/2';
  return '*';
}

export default function Play() {
  const navigate = useNavigate();
  const saved = useMemo(() => load<SavedGame>(STORAGE_KEY), []);
  const savedSettings = useMemo(() => load<{ color: ColorChoice; elo: number; showEval: boolean }>(SETTINGS_KEY), []);

  // Réglages (pour la prochaine partie)
  const [colorChoice, setColorChoice] = useState<ColorChoice>(savedSettings?.color ?? 'w');
  const [eloSetting, setEloSetting] = useState<number>(savedSettings?.elo ?? 1200);
  const [showEval, setShowEval] = useState<boolean>(savedSettings?.showEval ?? false);

  // Partie en cours
  const [game, setGame] = useState<SavedGame | null>(saved);
  const [gameId, setGameId] = useState(0);
  const [orientation, setOrientation] = useState<'white' | 'black'>(saved?.player === 'b' ? 'black' : 'white');
  const [thinking, setThinking] = useState(false);

  // Aide
  const [explanation, setExplanation] = useState<{ title: string; ex: MoveExplanation } | null>(null);
  const [helpLoading, setHelpLoading] = useState<string | null>(null);
  const [focusArrows, setFocusArrows] = useState<{ arrows: BoardArrow[]; marks: SquareMark[] }>({ arrows: [], marks: [] });
  const [evalLine, setEvalLine] = useState<{ line: EngineLine; turn: Side } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const moves = game?.moves ?? [];
  const { chess, fens, sans } = useMemo(() => replay(moves), [moves]);
  const fen = fens[fens.length - 1];
  const turn = chess.turn();
  const over = game ? gameOverText(chess, game.player) : null;
  const finished = !!over || !!game?.result;
  const playerTurn = !!game && !finished && turn === game.player;

  useEffect(() => save(SETTINGS_KEY, { color: colorChoice, elo: eloSetting, showEval }), [colorChoice, eloSetting, showEval]);
  useEffect(() => save(STORAGE_KEY, game), [game]);

  // ---- Coup du bot ----------------------------------------------------
  const tokenRef = useRef(0);
  useEffect(() => {
    if (!game || finished || turn === game.player) return;
    const token = ++tokenRef.current;
    const engine = getPlayEngine();
    const cfg = strengthForElo(game.elo);
    setThinking(true);
    (async () => {
      try {
        const [analysis] = await Promise.all([
          (async () => {
            await engine.setOptions(cfg.options);
            return engine.analyse(fen, { depth: cfg.depth, movetime: cfg.movetime, multipv: cfg.multipv });
          })(),
          sleep(MIN_BOT_DELAY),
        ]);
        if (token !== tokenRef.current) return;
        const uci = pickBotMove(analysis.lines, analysis.bestMove, cfg);
        const legal = new Chess(fen).moves({ verbose: true });
        const chosen = (uci && legal.find((m) => m.from + m.to + (m.promotion ?? '') === uci)) || legal[0];
        if (!chosen) return;
        setGame((g) => (g && g.moves.length === moves.length ? { ...g, moves: [...g.moves, chosen.from + chosen.to + (chosen.promotion ?? '')] } : g));
      } catch (e) {
        console.error('Le bot n’a pas pu jouer', e);
      } finally {
        if (token === tokenRef.current) setThinking(false);
      }
    })();
    return () => {
      // Partie modifiée (annulation, nouvelle partie) pendant la réflexion : on interrompt.
      if (token === tokenRef.current) {
        tokenRef.current++;
        engine.stop();
        setThinking(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, game?.player, game?.elo, finished, gameId]);

  // ---- Barre d'évaluation -----------------------------------------------
  useEffect(() => {
    if (!showEval) return;
    let alive = true;
    const engine = getAnalysisEngine();
    const t = fen.split(' ')[1] as Side;
    engine
      .analyse(fen, { depth: 12, multipv: 1 })
      .then((a) => {
        if (alive && a.lines[0]) setEvalLine({ line: a.lines[0], turn: t });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [fen, showEval]);

  // Une nouvelle position efface l'aide affichée.
  useEffect(() => {
    setExplanation(null);
    setFocusArrows({ arrows: [], marks: [] });
    setNotice(null);
  }, [fen]);

  // ---- Actions ------------------------------------------------------------
  const newGame = () => {
    const player: Side = colorChoice === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : colorChoice;
    tokenRef.current++;
    getPlayEngine().stop();
    void getPlayEngine().newGame();
    setGame({ moves: [], player, elo: eloSetting, result: null });
    setGameId((n) => n + 1);
    setOrientation(player === 'w' ? 'white' : 'black');
    setEvalLine(null);
  };

  const onMove = (from: Square, to: Square, promotion?: string): boolean => {
    if (!game || !playerTurn || helpLoading) return false;
    const c = new Chess(fen);
    try {
      const m = c.move({ from, to, promotion });
      setGame({ ...game, moves: [...game.moves, m.from + m.to + (m.promotion ?? '')] });
      return true;
    } catch {
      return false;
    }
  };

  const undo = () => {
    if (!game) return;
    let target = game.moves.length - 1;
    const turnAt = (k: number): Side => (k % 2 === 0 ? 'w' : 'b');
    while (target >= 0 && turnAt(target) !== game.player) target--;
    if (target < 0) return;
    tokenRef.current++;
    getPlayEngine().stop();
    setGame({ ...game, moves: game.moves.slice(0, target), result: null });
  };

  const resign = () => {
    if (!game || finished) return;
    setGame({ ...game, result: game.player === 'w' ? '0-1' : '1-0' });
  };

  const hint = async () => {
    if (!playerTurn) return;
    setHelpLoading('Le moteur réfléchit à la meilleure idée…');
    try {
      const { best } = await explainPosition(fen, getAnalysisEngine(), { depth: 14, multipv: 3 });
      if (best) setExplanation({ title: 'Indice : le meilleur coup et pourquoi', ex: best });
      else setNotice('Aucun coup disponible.');
    } catch (e) {
      console.error(e);
      setNotice('L’analyse a échoué.');
    } finally {
      setHelpLoading(null);
    }
  };

  const lastPlayerPly = useMemo(() => {
    if (!game) return -1;
    for (let k = moves.length - 1; k >= 0; k--) if ((k % 2 === 0 ? 'w' : 'b') === game.player) return k;
    return -1;
  }, [moves, game]);

  const explainLast = async () => {
    if (lastPlayerPly < 0) return;
    const before = fens[lastPlayerPly];
    const after = fens[lastPlayerPly + 1];
    const uci = moves[lastPlayerPly];
    setHelpLoading('Analyse de votre dernier coup…');
    try {
      const engine = getAnalysisEngine();
      const analysis = await engine.analyse(before, { depth: 14, multipv: 3 });
      let afterLine: EngineLine | undefined;
      if (!analysis.lines.some((l) => l.pv[0] === uci) && !new Chess(after).isGameOver()) {
        afterLine = (await engine.analyse(after, { depth: 13, multipv: 1 })).lines[0];
      }
      const ex = explainMove(before, uci, analysis, { afterLine });
      setExplanation({ title: `Votre coup ${sans[lastPlayerPly]}`, ex });
    } catch (e) {
      console.error(e);
      setNotice('L’analyse a échoué.');
    } finally {
      setHelpLoading(null);
    }
  };

  const pgn = useCallback(() => {
    const c = new Chess();
    for (const u of moves) c.move(parseUci(u));
    const d = new Date();
    c.setHeader('Event', 'Partie contre Chess Bot');
    c.setHeader('Site', 'Chess Bot');
    c.setHeader('Date', `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`);
    const bot = `Stockfish (${game?.elo ?? '?'} Elo)`;
    c.setHeader('White', game?.player === 'w' ? 'Vous' : bot);
    c.setHeader('Black', game?.player === 'b' ? 'Vous' : bot);
    c.setHeader('Result', pgnResult(c, game?.result));
    return c.pgn();
  }, [moves, game]);

  const copyPgn = async () => {
    const text = pgn();
    try {
      await navigator.clipboard.writeText(text);
      setNotice('PGN copié dans le presse-papier.');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setNotice('PGN copié dans le presse-papier.');
      } catch {
        setNotice('Impossible de copier automatiquement le PGN.');
      }
      ta.remove();
    }
  };

  // ---- Affichage ------------------------------------------------------------
  const last = moves.length ? parseUci(moves[moves.length - 1]) : null;
  const defaultArrows: BoardArrow[] = explanation ? [{ from: explanation.ex.uci.slice(0, 2) as Square, to: explanation.ex.uci.slice(2, 4) as Square, kind: explanation.title.startsWith('Indice') ? 'good' : 'idea' }] : [];
  const arrows = focusArrows.arrows.length ? focusArrows.arrows : defaultArrows;
  const marks = focusArrows.marks;
  const resultText = game?.result ? (game.result === (game.player === 'w' ? '0-1' : '1-0') ? 'Vous avez abandonné.' : 'Le bot a abandonné.') : over;
  const statusText = !game
    ? 'Choisissez vos réglages puis lancez une partie.'
    : resultText ?? (thinking || !playerTurn ? 'Le bot réfléchit…' : chess.inCheck() ? 'Échec ! À vous de jouer.' : 'À vous de jouer.');

  return (
    <div className="page play-page">
      <h1>Jouer contre le bot</h1>
      <div className="board-layout">
        {showEval && game ? (
          <EvalBar
            whiteCp={evalLine ? whiteScore(evalLine.line, evalLine.turn) : 0}
            label={evalLine ? formatScore(evalLine.line, evalLine.turn) : '…'}
            orientation={orientation}
            height={480}
          />
        ) : (
          <div />
        )}
        <div className="board-col">
          <div className="play-status">
            {game && (
              <span className="badge idea" title={eloLabel(game.elo)}>
                Bot : {game.elo} Elo · {eloLabel(game.elo)}
              </span>
            )}
            <span className={`play-status-text${finished ? ' done' : ''}`}>
              {thinking && <span className="spinner" aria-hidden />} {statusText}
            </span>
          </div>
          <Board fen={fen} orientation={orientation} onMove={game && playerTurn ? onMove : undefined} arrows={arrows} marks={marks} lastMove={last} id="play-board" />
          <div className="btn-row" style={{ marginTop: '0.6rem' }}>
            <button className="btn primary" onClick={hint} disabled={!playerTurn || !!helpLoading}>
              Indice
            </button>
            <button className="btn" onClick={explainLast} disabled={lastPlayerPly < 0 || !!helpLoading}>
              Expliquer mon dernier coup
            </button>
            <button className="btn" onClick={undo} disabled={!game || lastPlayerPly < 0 || !!helpLoading}>
              Annuler
            </button>
            <button className="btn" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
              Retourner
            </button>
            <button className="btn" onClick={resign} disabled={!game || finished}>
              Abandonner
            </button>
          </div>
        </div>

        <div className="side-col play-side">
          <div className="card">
            <h3>Nouvelle partie</h3>
            <div className="play-field">
              <label>Votre couleur</label>
              <div className="btn-row">
                {(
                  [
                    ['w', 'Blancs'],
                    ['b', 'Noirs'],
                    ['random', 'Aléatoire'],
                  ] as const
                ).map(([v, l]) => (
                  <button key={v} type="button" className={`btn${colorChoice === v ? ' primary' : ''}`} onClick={() => setColorChoice(v)}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="play-field">
              <label htmlFor="elo">
                Force du bot : <strong>{eloSetting} Elo</strong> <span className="muted">({eloLabel(eloSetting)})</span>
              </label>
              <input id="elo" type="range" min={MIN_ELO} max={MAX_ELO} step={50} value={eloSetting} onChange={(e) => setEloSetting(Number(e.target.value))} />
              <div className="play-range-legend muted">
                <span>{MIN_ELO}</span>
                <span>{MAX_ELO}</span>
              </div>
            </div>
            <button className="btn primary" onClick={newGame}>
              {game ? 'Nouvelle partie' : 'Commencer la partie'}
            </button>
            <label className="play-toggle">
              <input type="checkbox" checked={showEval} onChange={(e) => setShowEval(e.target.checked)} /> Afficher la barre d’évaluation <span className="muted">(désactivée par défaut pour ne pas tricher)</span>
            </label>
          </div>

          {(helpLoading || notice || explanation) && (
            <div className="card">
              {helpLoading && (
                <p className="muted">
                  <span className="spinner" aria-hidden /> {helpLoading}
                </p>
              )}
              {notice && !helpLoading && <p className="muted">{notice}</p>}
              {explanation && !helpLoading && (
                <ExplanationPanel title={explanation.title} explanation={explanation.ex} onFocusArrows={(a, m) => setFocusArrows({ arrows: a, marks: m })} />
              )}
            </div>
          )}

          <div className="card">
            <h3>Coups</h3>
            <MoveList sans={sans} current={sans.length} onSelect={() => undefined} />
            <div className="btn-row" style={{ marginTop: '0.6rem' }}>
              <button className="btn" onClick={copyPgn} disabled={!moves.length}>
                Copier le PGN
              </button>
              <button className="btn" onClick={() => navigate('/analyze', { state: { pgn: pgn() } })} disabled={!moves.length}>
                Analyser cette partie
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
