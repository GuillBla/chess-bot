import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BoardPreview } from '../components/VariationLine';
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
import { MATE_CP, classifyMove, lineCp, type MoveClass } from '../analysis/classify';
import type { BoardArrow, MoveExplanation, SquareMark } from '../analysis/types';
import { PieceIcon } from '../components/pieces';
import PlayerCard from '../components/play/PlayerCard';
import { badgeFor } from '../components/play/moveClass';

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

/**
 * Classe un coup à partir de l'analyse MultiPV de la position d'avant
 * (et, si le coup n'y figure pas, de la meilleure ligne de la position d'après).
 */
function classifyPlayed(fenAfter: string, uci: string, lines: EngineLine[], bestMove: string | null, afterLine?: EngineLine): MoveClass | undefined {
  const best = lines[0];
  if (!best) return undefined;
  const beforeCp = lineCp(best);
  const own = lines.find((l) => l.pv[0] === uci);
  const after = new Chess(fenAfter);
  let afterCp: number;
  if (after.isCheckmate()) afterCp = MATE_CP;
  else if (after.isDraw()) afterCp = 0;
  else if (own) afterCp = lineCp(own);
  else if (afterLine) afterCp = -lineCp(afterLine);
  else return undefined;
  return classifyMove({ beforeCp, afterCp, isBest: (bestMove ?? best.pv[0]) === uci }).cls;
}

const ELO_TICKS = [400, 1200, 2000, 3000];

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
  const [explanation, setExplanation] = useState<{ kind: 'hint' | 'last'; title: string; ex: MoveExplanation; fenBefore: string; cls?: MoveClass } | null>(null);
  const [helpLoading, setHelpLoading] = useState<string | null>(null);
  const [focusArrows, setFocusArrows] = useState<{ arrows: BoardArrow[]; marks: SquareMark[] }>({ arrows: [], marks: [] });
  const [evalLine, setEvalLine] = useState<{ line: EngineLine; turn: Side } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const moves = game?.moves ?? [];
  const { chess, fens, sans } = useMemo(() => replay(moves), [moves]);
  const fen = fens[fens.length - 1];
  // Aperçu d'une variation (plan, alternatives) : position simulée sur l'échiquier, effacée dès que la vraie position change.
  const [preview, setPreview] = useState<BoardPreview | null>(null);
  useEffect(() => setPreview(null), [fen]);
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
      if (best) setExplanation({ kind: 'hint', title: 'Indice : le meilleur coup et pourquoi', ex: best, fenBefore: fen });
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
      setExplanation({ kind: 'last', title: 'Votre dernier coup', ex, fenBefore: before, cls: classifyPlayed(after, uci, analysis.lines, analysis.bestMove, afterLine) });
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
  const defaultArrows: BoardArrow[] = explanation ? [{ from: explanation.ex.uci.slice(0, 2) as Square, to: explanation.ex.uci.slice(2, 4) as Square, kind: explanation.kind === 'hint' ? 'good' : 'idea' }] : [];
  const arrows = focusArrows.arrows.length ? focusArrows.arrows : defaultArrows;
  const marks = focusArrows.marks;
  const badge = explanation?.kind === 'last' ? badgeFor(explanation.ex.uci, explanation.cls) : null;
  const resultText = game?.result ? (game.result === (game.player === 'w' ? '0-1' : '1-0') ? 'Vous avez abandonné.' : 'Le bot a abandonné.') : over;
  const boardOrientation: 'white' | 'black' = game ? orientation : colorChoice === 'b' ? 'black' : 'white';
  const busy = !!helpLoading;

  // Cartes joueurs : le camp en haut de l'échiquier dépend de l'orientation (comme sur chess.com).
  const topSide: Side = boardOrientation === 'white' ? 'b' : 'w';
  const playerCard = (side: Side) => {
    if (!game) return null;
    const isYou = side === game.player;
    const toMove = !finished && turn === side;
    if (!isYou) {
      return (
        <PlayerCard
          side={side}
          name="Stockfish"
          detail={`${game.elo} Elo · ${eloLabel(game.elo)}`}
          fen={fen}
          active={toMove}
          status={
            thinking || toMove ? (
              <span className="player-thinking">
                <span className="spinner" aria-hidden /> réfléchit…
              </span>
            ) : null
          }
        />
      );
    }
    const check = toMove && chess.inCheck();
    return (
      <PlayerCard
        side={side}
        name="Vous"
        detail={side === 'w' ? 'Blancs' : 'Noirs'}
        fen={fen}
        active={toMove}
        you
        status={toMove ? <span className={`player-turn${check ? ' check' : ''}`}>{check ? 'Échec ! À vous' : 'À vous de jouer'}</span> : null}
      />
    );
  };

  const settings = (
    <>
      <div className="play-field">
        <span className="play-label" id="color-label">
          Votre couleur
        </span>
        <div className="color-choice" role="radiogroup" aria-labelledby="color-label">
          {(
            [
              ['w', 'Blancs'],
              ['b', 'Noirs'],
              ['random', 'Aléatoire'],
            ] as const
          ).map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={colorChoice === v} className={`color-opt${colorChoice === v ? ' on' : ''}`} onClick={() => setColorChoice(v)}>
              <span className={`color-icon${v === 'random' ? ' split' : ''}`} aria-hidden>
                {v === 'random' ? (
                  <>
                    <PieceIcon piece="wK" size={26} />
                    <PieceIcon piece="bK" size={26} />
                  </>
                ) : (
                  <PieceIcon piece={v === 'w' ? 'wK' : 'bK'} size={34} />
                )}
              </span>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="play-field">
        <label htmlFor="elo" className="play-label">
          Force du bot
        </label>
        <div className="elo-readout">
          <strong>{eloSetting}</strong> <span className="elo-unit">Elo</span>
          <span className="elo-level">{eloLabel(eloSetting)}</span>
        </div>
        <input
          id="elo"
          type="range"
          min={MIN_ELO}
          max={MAX_ELO}
          step={50}
          value={eloSetting}
          onChange={(e) => setEloSetting(Number(e.target.value))}
          aria-valuetext={`${eloSetting} Elo, ${eloLabel(eloSetting)}`}
        />
        <div className="elo-ticks">
          {ELO_TICKS.map((t) => {
            const pct = ((t - MIN_ELO) / (MAX_ELO - MIN_ELO)) * 100;
            return (
              <button
                key={t}
                type="button"
                className={`elo-tick${eloSetting === t ? ' on' : ''}`}
                style={{ left: `calc(${pct.toFixed(2)}% + ${((0.5 - pct / 100) * 16).toFixed(1)}px)` }}
                onClick={() => setEloSetting(t)}
                title={eloLabel(t)}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
      <label className="play-toggle">
        <input type="checkbox" checked={showEval} onChange={(e) => setShowEval(e.target.checked)} />
        <span>
          Afficher la barre d’évaluation <span className="muted">(désactivée par défaut pour ne pas tricher)</span>
        </span>
      </label>
      <button className="btn primary play-start" onClick={newGame}>
        {game ? 'Lancer une nouvelle partie' : 'Commencer la partie'}
      </button>
    </>
  );

  return (
    <div className={`page play-page${game ? '' : ' no-game'}`}>
      <header className={game ? 'page-head visually-hidden' : 'page-head'}>
        <span className="eyebrow">Partie d’entraînement</span>
        <h1>Jouer contre Stockfish</h1>
      </header>
      <div className="board-layout two-col">
        <div className="board-col">
          {playerCard(topSide)}
          <div className="board-row">
            {showEval && game && (
              <EvalBar whiteCp={evalLine ? whiteScore(evalLine.line, evalLine.turn) : 0} label={evalLine ? formatScore(evalLine.line, evalLine.turn) : '…'} orientation={boardOrientation} />
            )}
            <div className="board-row-main">
              <Board preview={preview} fen={fen} orientation={boardOrientation} onMove={game && playerTurn ? onMove : undefined} arrows={arrows} marks={marks} lastMove={last} badge={badge} id="play-board" maxWidth={760} />
            </div>
          </div>
          {playerCard(topSide === 'w' ? 'b' : 'w')}
        </div>

        <div className="side-col play-side">
          {game && resultText && (
            <div className="play-result" role="status">
              <span className="eyebrow">Partie terminée</span>
              <strong>{resultText}</strong>
              <span className="mono">{pgnResult(chess, game.result)}</span>
            </div>
          )}
          {game && (
            <div className="toolbar" role="toolbar" aria-label="Actions de la partie">
              <div className="toolbar-group">
                <button className="btn primary" onClick={hint} disabled={!playerTurn || busy} title="Le meilleur coup, expliqué">
                  Indice
                </button>
                <button className="btn" onClick={explainLast} disabled={lastPlayerPly < 0 || busy}>
                  Expliquer mon dernier coup
                </button>
              </div>
              <div className="toolbar-group">
                <button className="btn" onClick={undo} disabled={lastPlayerPly < 0 || busy} title="Reprendre votre dernier coup">
                  <span aria-hidden>↶</span> Annuler
                </button>
                <button className="btn" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))} title="Retourner l’échiquier">
                  <span aria-hidden>⇅</span> Retourner
                </button>
                <button className="btn" onClick={resign} disabled={finished}>
                  <span aria-hidden>⚑</span> Abandonner
                </button>
              </div>
            </div>
          )}

          {(helpLoading || notice || explanation) && (
            <div className="card play-help" aria-live="polite">
              {helpLoading && (
                <p className="muted">
                  <span className="spinner" aria-hidden /> {helpLoading}
                </p>
              )}
              {notice && !helpLoading && <p className="muted">{notice}</p>}
              {explanation && !helpLoading && (
                <ExplanationPanel
                onPreview={setPreview}
                  title={explanation.title}
                  explanation={explanation.ex}
                  cls={explanation.cls}
                  fenBefore={explanation.fenBefore}
                  onFocusArrows={(a, m) => setFocusArrows({ arrows: a, marks: m })}
                />
              )}
            </div>
          )}

          {game && (
            <div className="card">
              <div className="card-head">
                <h3>Feuille de partie</h3>
                <span className="muted">
                  {Math.ceil(sans.length / 2)} coup{sans.length > 2 ? 's' : ''}
                </span>
              </div>
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
          )}

          {game ? (
            <details className="card play-settings">
              <summary>
                <span className="play-settings-title">Nouvelle partie</span>
                <span className="muted">Couleur, force du bot…</span>
              </summary>
              <div className="play-settings-body">{settings}</div>
            </details>
          ) : (
            <div className="card play-settings">
              <h3>Nouvelle partie</h3>
              <p className="muted play-intro">Choisissez votre couleur et la force de Stockfish, puis lancez la partie. L’indice et l’explication de vos coups sont là pour apprendre.</p>
              <div className="play-settings-body">{settings}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
