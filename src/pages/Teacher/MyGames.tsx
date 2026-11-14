import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Square } from 'chess.js';
import {
  ChessComError,
  END_REASON_LABELS,
  OUTCOME_LABELS,
  TIME_CLASS_LABELS,
  fetchRecentGames,
  formatTimeControl,
  gameId,
  getStoredUsername,
  normalizeUsername,
  setStoredUsername,
  type GameSummary,
  type TimeClass,
} from '../../api/chesscom';
import {
  CATEGORY_LABELS,
  aggregateReviews,
  listReviews,
  parseGame,
  reviewGame,
  type GameReview,
  type ReviewProgress,
  type ReviewedMove,
} from '../../analysis/gameReview';
import { MOVE_CLASS_LABELS, isError, winPercent, type MoveClass } from '../../analysis/classify';
import type { BoardArrow, SquareMark } from '../../analysis/types';
import Board from '../../components/Board';
import EvalBar from '../../components/EvalBar';
import ExplanationPanel from '../../components/ExplanationPanel';
import MoveList from '../../components/MoveList';
import { PieceIcon, type PieceCode } from '../../components/pieces';
import { BADGE_SYMBOLS, badgeFor } from '../../components/play/moveClass';
import { AXIS_PROPS, ChartCard, ResultPill, TooltipBox } from '../../components/stats/chartKit';

// ---------------------------------------------------------------------------
// Utilitaires d'affichage
// ---------------------------------------------------------------------------

function fmtEval(whiteCp: number): string {
  if (Math.abs(whiteCp) >= 9000) {
    const n = 10000 - Math.abs(whiteCp);
    return n === 0 ? 'Mat' : `#${whiteCp > 0 ? '' : '-'}${n}`;
  }
  const v = whiteCp / 100;
  return (v > 0 ? '+' : '') + v.toFixed(2);
}

const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const moveLabel = (m: Pick<ReviewedMove, 'ply' | 'san'>) => `${Math.floor(m.ply / 2) + 1}${m.ply % 2 === 0 ? '.' : '…'} ${m.san}`;

function isUserReview(r: GameReview, user: string) {
  const u = normalizeUsername(user);
  return r.meta[r.playerColor].toLowerCase() === u;
}

/** Compteurs affichés sous la précision : les coups à problème, avec leur symbole de feuille. */
const ERROR_CLASSES: MoveClass[] = ['inaccuracy', 'mistake', 'blunder', 'miss'];

/** Pastille de classification (symbole + couleur de la classe, libellé en infobulle). */
function ClsChip({ cls }: { cls: MoveClass }) {
  return (
    <span className={`cls-chip cls-${cls}`} title={MOVE_CLASS_LABELS[cls]} aria-label={MOVE_CLASS_LABELS[cls]}>
      {BADGE_SYMBOLS[cls]}
    </span>
  );
}

/** Icône de pièce associée à une leçon (repère visuel, pas d'information portée par la seule icône). */
const LESSON_ICONS: Record<string, PieceCode> = {
  calcul: 'wN',
  'tactique-avancee': 'bN',
  prophylaxie: 'wB',
  'bonnes-mauvaises-pieces': 'bB',
  'structures-de-pions': 'wP',
  'finales-pions': 'bP',
  'finales-tours': 'wR',
  'attaque-sur-le-roi': 'bQ',
  'dynamique-vs-statique': 'wQ',
  'convertir-avantage': 'wK',
  defense: 'bK',
};

// ---------------------------------------------------------------------------
// Conteneur : charge les parties, possède le moteur de revue (unitaire ou par lot)
// ---------------------------------------------------------------------------

interface Job {
  url: string;
  progress: ReviewProgress | null;
  batch?: { index: number; total: number };
}

interface Ctx {
  user: string;
  setUser: (u: string) => void;
  games: GameSummary[];
  loading: boolean;
  error: string | null;
  timeClass: TimeClass | 'all';
  setTimeClass: (t: TimeClass | 'all') => void;
  count: number;
  setCount: (n: number) => void;
  reviews: Record<string, GameReview>;
  job: Job | null;
  jobError: string | null;
  analyse: (g: GameSummary) => Promise<void>;
  analyseBatch: (gs: GameSummary[]) => Promise<void>;
  cancel: () => void;
}

export default function MyGames() {
  const [user, setUserState] = useState(getStoredUsername());
  const [timeClass, setTimeClass] = useState<TimeClass | 'all'>('all');
  const [count, setCount] = useState(20);
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, GameReview>>(() => Object.fromEntries(listReviews().map((r) => [r.url, r])));
  const [job, setJob] = useState<Job | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchRecentGames(user, count, { timeClass, signal: ctrl.signal })
      .then((g) => !ctrl.signal.aborted && setGames(g))
      .catch((e) => {
        if ((e as Error).name === 'AbortError') return;
        setGames([]);
        setError(e instanceof ChessComError ? e.message : `Erreur : ${(e as Error).message}`);
      })
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [user, count, timeClass]);

  // Annule une analyse en cours si on quitte l'onglet.
  useEffect(() => () => abortRef.current?.abort(), []);

  const runOne = useCallback(async (g: GameSummary, signal: AbortSignal, batch?: Job['batch']) => {
    setJob({ url: g.url, progress: null, batch });
    const review = await reviewGame(g.pgn, {
      playerColor: g.color,
      url: g.url,
      summary: g,
      depth: 12,
      signal,
      onProgress: (p) => setJob({ url: g.url, progress: p, batch }),
    });
    setReviews((prev) => ({ ...prev, [review.url]: review }));
  }, []);

  const run = useCallback(
    async (list: GameSummary[]) => {
      if (abortRef.current) return; // une analyse à la fois
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setJobError(null);
      try {
        for (let i = 0; i < list.length; i++) {
          if (ctrl.signal.aborted) break;
          await runOne(list[i], ctrl.signal, list.length > 1 ? { index: i, total: list.length } : undefined);
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setJobError(`L'analyse a échoué : ${(e as Error).message}`);
      } finally {
        abortRef.current = null;
        setJob(null);
      }
    },
    [runOne],
  );

  const ctx: Ctx = {
    user,
    setUser: (u) => {
      const n = normalizeUsername(u);
      if (!n) return;
      setStoredUsername(n);
      setUserState(n);
    },
    games,
    loading,
    error,
    timeClass,
    setTimeClass,
    count,
    setCount,
    reviews,
    job,
    jobError,
    analyse: (g) => run([g]),
    analyseBatch: (gs) => run(gs),
    cancel: () => abortRef.current?.abort(),
  };

  return (
    <Routes>
      <Route index element={<GamesHome ctx={ctx} />} />
      <Route path="partie/:id" element={<GameView ctx={ctx} />} />
    </Routes>
  );
}

// ---------------------------------------------------------------------------
// Barre de progression
// ---------------------------------------------------------------------------

function JobProgress({ ctx, game }: { ctx: Ctx; game?: GameSummary }) {
  const { job } = ctx;
  if (!job) return null;
  const g = game ?? ctx.games.find((x) => x.url === job.url);
  const p = job.progress;
  const label = !p
    ? 'Démarrage du moteur…'
    : p.phase === 'analyse'
      ? `Analyse des positions : ${p.done} / ${p.total}`
      : `Explication des moments clés : ${p.done} / ${p.total}`;
  return (
    <div className="mg-progress card" aria-live="polite">
      <span className="spinner" />
      <span>
        {job.batch && (
          <strong>
            Partie {job.batch.index + 1} / {job.batch.total}
            {g ? ` (contre ${g.opponent})` : ''} —{' '}
          </strong>
        )}
        {label}
      </span>
      <progress max={p?.total ?? 1} value={p?.done ?? 0} />
      <button className="btn" type="button" onClick={ctx.cancel}>
        Annuler
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Liste (feuille de résultats) + rapport agrégé
// ---------------------------------------------------------------------------

function GamesHome({ ctx }: { ctx: Ctx }) {
  const navigate = useNavigate();
  const [input, setInput] = useState(ctx.user);
  useEffect(() => setInput(ctx.user), [ctx.user]);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ctx.setUser(input);
  };
  const last10 = ctx.games.slice(0, 10);
  const toAnalyse = last10.filter((g) => !ctx.reviews[g.url]);
  const userReviews = useMemo(() => Object.values(ctx.reviews).filter((r) => isUserReview(r, ctx.user)), [ctx.reviews, ctx.user]);

  return (
    <div className="page">
      <p className="lead">
        Récupère tes dernières parties chess.com, fais-les analyser par Stockfish (profondeur 12, dans ton navigateur) et découvre tes erreurs
        récurrentes, avec les leçons qui y répondent.
      </p>
      <form className="mg-toolbar" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="mg-user">Joueur</label>
          <div className="btn-row" style={{ flexWrap: 'nowrap' }}>
            <input id="mg-user" type="text" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} autoComplete="off" />
            <button className="btn" type="submit">
              Charger
            </button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="mg-tc">Cadence</label>
          <select id="mg-tc" value={ctx.timeClass} onChange={(e) => ctx.setTimeClass(e.target.value as TimeClass | 'all')}>
            <option value="all">Toutes</option>
            {(Object.keys(TIME_CLASS_LABELS) as TimeClass[]).map((tc) => (
              <option key={tc} value={tc}>
                {TIME_CLASS_LABELS[tc]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mg-n">Parties</label>
          <select id="mg-n" value={ctx.count} onChange={(e) => ctx.setCount(+e.target.value)}>
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <span className="spacer" />
        <button
          className="btn primary"
          type="button"
          disabled={!!ctx.job || toAnalyse.length === 0}
          onClick={() => ctx.analyseBatch(toAnalyse)}
          title={toAnalyse.length === 0 ? 'Les 10 dernières parties sont déjà analysées' : undefined}
        >
          Analyser les 10 dernières{toAnalyse.length > 0 && toAnalyse.length < last10.length ? ` (${toAnalyse.length} restantes)` : ''}
        </button>
      </form>

      <JobProgress ctx={ctx} />
      {ctx.jobError && (
        <p role="alert">
          <span className="badge bad">Erreur</span> {ctx.jobError}
        </p>
      )}
      {ctx.error && (
        <div className="card" role="alert">
          <span className="badge bad">Erreur</span> {ctx.error}
        </div>
      )}
      {ctx.loading && (
        <p className="muted">
          <span className="spinner" /> Chargement des parties…
        </p>
      )}

      {ctx.games.length > 0 && (
        <section className="card results-sheet">
          <div className="sheet-head">
            <h2>Feuille de résultats</h2>
            <span className="muted">
              {ctx.games.length} parties · {ctx.games.filter((g) => ctx.reviews[g.url]).length} analysées
            </span>
          </div>
          <div className="table-scroll">
            <table className="mg-games stats-table">
              <thead>
                <tr>
                  <th className="num">N°</th>
                  <th>Adversaire</th>
                  <th>Rés.</th>
                  <th>Ouverture</th>
                  <th>Cadence</th>
                  <th>Date</th>
                  <th className="num">Précision</th>
                  <th aria-label="Action" />
                </tr>
              </thead>
              <tbody>
                {ctx.games.map((g, i) => {
                  const r = ctx.reviews[g.url];
                  const running = ctx.job?.url === g.url;
                  const acc = r?.accuracy[r.playerColor];
                  return (
                    <tr key={g.url} className={running ? 'current' : ''}>
                      <td className="rd">{i + 1}</td>
                      <td>
                        <span className="mg-opp">
                          <PieceIcon
                            piece={g.color === 'white' ? 'wK' : 'bK'}
                            size={20}
                            title={g.color === 'white' ? 'Tu avais les Blancs' : 'Tu avais les Noirs'}
                          />
                          <strong>{g.opponent}</strong>
                          <span className="mg-elo">{g.oppRating}</span>
                        </span>
                      </td>
                      <td>
                        <ResultPill outcome={g.outcome} title={`${OUTCOME_LABELS[g.outcome]} · ${END_REASON_LABELS[g.reason].toLowerCase()}`} />
                      </td>
                      <td className="wrap">
                        {g.opening.name} <span className="muted mono">{g.opening.eco}</span>
                      </td>
                      <td>
                        {TIME_CLASS_LABELS[g.timeClass]} <span className="muted mono">{formatTimeControl(g.timeControl)}</span>
                      </td>
                      <td>{fmtDate(g.endTime)}</td>
                      <td className="num mg-acc-cell">{acc != null ? `${acc.toFixed(1)} %` : <span className="muted">—</span>}</td>
                      <td>
                        {r ? (
                          <Link className="btn" to={`partie/${g.id}`}>
                            Voir l'analyse
                          </Link>
                        ) : (
                          <button
                            className="btn"
                            type="button"
                            disabled={!!ctx.job}
                            onClick={() => {
                              ctx.analyse(g);
                              navigate(`partie/${g.id}`);
                            }}
                          >
                            {running ? 'En cours…' : 'Analyser'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {!ctx.loading && !ctx.error && ctx.games.length === 0 && <p className="muted">Aucune partie trouvée.</p>}

      <AggregateView reviews={userReviews} />
    </div>
  );
}

function AggregateView({ reviews }: { reviews: GameReview[] }) {
  const rep = useMemo(() => aggregateReviews(reviews), [reviews]);
  if (reviews.length === 0)
    return (
      <section className="card">
        <h2>Rapport sur tes parties</h2>
        <p className="muted">Analyse au moins une partie pour obtenir ton rapport : erreurs récurrentes, phase de jeu la plus coûteuse et leçons recommandées.</p>
      </section>
    );
  const errors = rep.classCounts.mistake + rep.classCounts.blunder + rep.classCounts.miss;
  const worstPhase = [...rep.phases].filter((p) => p.moves > 0).sort((a, b) => b.winLoss - a.winLoss)[0];
  const costly = rep.openings.filter((o) => o.errors > 0).slice(0, 5);
  const maxCat = Math.max(1, ...rep.categories.map((c) => c.count));
  return (
    <>
      <div className="report-head">
        <h2>Rapport de tournoi</h2>
        <span className="muted">
          {rep.games} partie{rep.games > 1 ? 's' : ''} analysée{rep.games > 1 ? 's' : ''} · {rep.playerMoves} coups joués
        </span>
      </div>
      <div className="stat-tiles">
        <div className="stat-tile">
          <div className="stat-tile-label">Précision moyenne</div>
          <div className="stat-tile-value">{rep.avgAccuracy != null ? `${rep.avgAccuracy.toFixed(1)} %` : '—'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">
            <ClsChip cls="inaccuracy" /> Imprécisions / partie
          </div>
          <div className="stat-tile-value">{(rep.classCounts.inaccuracy / rep.games).toFixed(1)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">
            <ClsChip cls="mistake" /> <ClsChip cls="blunder" /> Erreurs + gaffes / partie
          </div>
          <div className="stat-tile-value">{(errors / rep.games).toFixed(1)}</div>
        </div>
        {worstPhase && (
          <div className="stat-tile">
            <div className="stat-tile-label">Phase la plus coûteuse</div>
            <div className="stat-tile-value" style={{ fontSize: '1.35rem' }}>
              {worstPhase.label}
            </div>
            <div className="stat-tile-meta">−{Math.round(worstPhase.winLoss)} % de chances de gain cumulées</div>
          </div>
        )}
      </div>

      {rep.recommendations.length > 0 && (
        <section aria-labelledby="mg-lessons">
          <h3 id="mg-lessons">Leçons recommandées</h3>
          <div className="lesson-cards">
            {rep.recommendations.map((r) => (
              <Link key={r.lesson.id} to={`/teacher/lessons/${r.lesson.id}`} className="card link-card lesson-card">
                <span className="icon" aria-hidden>
                  <PieceIcon piece={LESSON_ICONS[r.lesson.id] ?? 'wP'} size={32} />
                </span>
                <div>
                  <strong>{r.lesson.title}</strong>
                  <p>{r.why}</p>
                  <span className="go">Ouvrir la leçon →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="viz-grid">
        <ChartCard title="Erreurs récurrentes" subtitle="Erreurs, gaffes et coups manqués par catégorie (un coup peut en cumuler plusieurs)">
          {rep.categories.length === 0 ? (
            <p className="muted">Aucune erreur détectée : bravo !</p>
          ) : (
            <ul className="hbars">
              {rep.categories.map((c) => (
                <li
                  key={c.category}
                  className="hbar"
                  title={`${c.label} : ${c.count} coup${c.count > 1 ? 's' : ''}, ${c.games} partie${c.games > 1 ? 's' : ''}, ${Math.round(c.winLoss)} % de chances de gain perdues`}
                >
                  <div className="hbar-label">
                    <span>{c.label}</span>
                    <span className="hbar-value">
                      {c.count}
                      <small> · {c.games} p.</small>
                    </span>
                  </div>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Où tu perds des points" subtitle="Par phase de jeu (perte de probabilité de gain)">
          <div className="table-scroll">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th className="num">Coups</th>
                  <th className="num">Erreurs</th>
                  <th className="num">Perte / coup</th>
                  <th className="num">Perte totale</th>
                </tr>
              </thead>
              <tbody>
                {rep.phases.map((p) => (
                  <tr key={p.phase}>
                    <td>{p.label}</td>
                    <td className="num">{p.moves}</td>
                    <td className="num">{p.errors}</td>
                    <td className="num">{p.avgLoss.toFixed(1)} %</td>
                    <td className="num">{Math.round(p.winLoss)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>Ouvertures les plus coûteuses</h3>
          {costly.length === 0 ? (
            <p className="muted">Aucune ouverture coûteuse.</p>
          ) : (
            <div className="table-scroll">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Ouverture</th>
                    <th className="num">Parties</th>
                    <th className="num">Erreurs</th>
                    <th className="num">Perte / partie</th>
                    <th className="num">Précision</th>
                  </tr>
                </thead>
                <tbody>
                  {costly.map((o) => (
                    <tr key={o.color + o.name}>
                      <td>
                        <span className="mg-opp">
                          <PieceIcon piece={o.color === 'white' ? 'wK' : 'bK'} size={16} title={o.color === 'white' ? 'Blancs' : 'Noirs'} />
                          {o.name}
                        </span>
                      </td>
                      <td className="num">{o.games}</td>
                      <td className="num">{o.errors}</td>
                      <td className="num">{Math.round(o.winLoss / o.games)} %</td>
                      <td className="num">{o.avgAccuracy != null ? `${o.avgAccuracy.toFixed(0)} %` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Vue d'une partie : salle d'analyse
// ---------------------------------------------------------------------------

function GameView({ ctx }: { ctx: Ctx }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const summary = ctx.games.find((g) => g.id === id);
  const review = Object.values(ctx.reviews).find((r) => gameId(r.url) === id);
  const pgn = review?.pgn ?? summary?.pgn;
  const parsed = useMemo(() => (pgn ? parseGame(pgn) : null), [pgn]);
  const [ply, setPly] = useState(0); // index de position (0 = départ)
  const [focus, setFocus] = useState<{ arrows: BoardArrow[]; marks: SquareMark[] } | null>(null);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  const n = parsed?.moves.length ?? 0;
  const goto = useCallback(
    (p: number) => {
      setPly(Math.max(0, Math.min(n, p)));
      setFocus(null);
      setSelectedKey(null);
    },
    [n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') return;
      if (e.key === 'ArrowLeft') goto(ply - 1);
      else if (e.key === 'ArrowRight') goto(ply + 1);
      else if (e.key === 'Home') goto(0);
      else if (e.key === 'End') goto(n);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goto, ply, n]);

  if (!parsed || !pgn) {
    return (
      <div className="page">
        <Link className="mg-back" to="..">
          ← Retour à la feuille de résultats
        </Link>
        {ctx.loading ? (
          <p className="muted">
            <span className="spinner" /> Chargement de la partie…
          </p>
        ) : (
          <p className="muted">Partie introuvable (elle n'est peut-être plus dans la liste chargée).</p>
        )}
      </div>
    );
  }

  const playerColor = review?.playerColor ?? summary?.color ?? 'white';
  const fen = ply === 0 ? parsed.startFen : parsed.moves[ply - 1].fenAfter;
  const lastMove = ply > 0 ? { from: parsed.moves[ply - 1].from, to: parsed.moves[ply - 1].to } : null;
  const evalCp = review?.evals[ply] ?? 0;
  const prevMove = review && ply > 0 ? review.moves[ply - 1] : null;
  const nextMove = review && ply < n ? review.moves[ply] : null;
  const running = ctx.job?.url === (summary?.url ?? review?.url);
  const white = review?.meta.white ?? parsed.headers.White ?? 'Blancs';
  const black = review?.meta.black ?? parsed.headers.Black ?? 'Noirs';
  const eloOf = (c: 'white' | 'black') => (summary ? (summary.color === c ? summary.myRating : summary.oppRating) : null);

  // Flèches par défaut : sur une position précédant une erreur, coup joué (rouge) vs meilleur coup (vert).
  let arrows: BoardArrow[] = [];
  let marks: SquareMark[] = [];
  if (focus) {
    arrows = focus.arrows;
    marks = focus.marks;
  } else if (nextMove && isError(nextMove.cls) && nextMove.bestUci) {
    arrows = [
      { from: nextMove.uci.slice(0, 2) as Square, to: nextMove.uci.slice(2, 4) as Square, kind: 'bad' },
      { from: nextMove.bestUci.slice(0, 2) as Square, to: nextMove.bestUci.slice(2, 4) as Square, kind: 'good' },
    ];
  }

  const keyMoments = review?.keyMoments ?? [];
  const openKey = (idx: number) => {
    const m = review!.moves[idx];
    if (selectedKey === idx) {
      setSelectedKey(null);
      return;
    }
    setPly(m.ply);
    setSelectedKey(idx);
    setFocus(null);
  };

  return (
    <div className="page">
      <Link className="mg-back" to="..">
        ← Retour à la feuille de résultats
      </Link>
      <header className="mg-title">
        <span className="eyebrow">Salle d'analyse</span>
        <h2>
          <PieceIcon piece="wK" size={28} title="Blancs" />
          {white}
          {eloOf('white') != null && <span className="mg-elo">{eloOf('white')}</span>}
          <span className="vs">contre</span>
          <PieceIcon piece="bK" size={28} title="Noirs" />
          {black}
          {eloOf('black') != null && <span className="mg-elo">{eloOf('black')}</span>}
        </h2>
        <div className="mg-sub">
          {summary && (
            <>
              <ResultPill outcome={summary.outcome} />
              <span>
                {OUTCOME_LABELS[summary.outcome]} · {END_REASON_LABELS[summary.reason].toLowerCase()}
              </span>
              <span>
                {TIME_CLASS_LABELS[summary.timeClass]} <span className="mono">{formatTimeControl(summary.timeControl)}</span>
              </span>
              <span>{fmtDate(summary.endTime)}</span>
              <span>
                {summary.opening.name} <span className="mono">{summary.opening.eco}</span>
              </span>
            </>
          )}
          <a href={summary?.url ?? review?.url} target="_blank" rel="noreferrer">
            Voir sur chess.com
          </a>
        </div>
      </header>
      <div className="btn-row">
        <button className="btn" type="button" onClick={() => navigate('/analyze', { state: { pgn } })}>
          Ouvrir dans l'analyse
        </button>
        {!review && summary && (
          <button className="btn primary" type="button" disabled={!!ctx.job} onClick={() => ctx.analyse(summary)}>
            {running ? 'Analyse en cours…' : 'Analyser cette partie'}
          </button>
        )}
      </div>
      {running && <JobProgress ctx={ctx} game={summary} />}
      {ctx.jobError && !ctx.job && (
        <p role="alert">
          <span className="badge bad">Erreur</span> {ctx.jobError}
        </p>
      )}

      <div className="mg-room">
        <div className="mg-board-col">
          <div className="mg-board-row">
            <EvalBar whiteCp={evalCp} label={review ? fmtEval(evalCp) : '?'} orientation={playerColor} />
            <div className="mg-board">
              <Board
                fen={fen}
                orientation={playerColor}
                lastMove={lastMove}
                arrows={arrows}
                marks={marks}
                badge={prevMove ? badgeFor(prevMove.uci, prevMove.cls) : null}
                id="mygames-board"
              />
            </div>
          </div>
          <div className="mg-board-nav">
            <button className="btn" type="button" onClick={() => goto(0)} aria-label="Début" title="Début (Origine)">
              ⏮
            </button>
            <button className="btn" type="button" onClick={() => goto(ply - 1)} aria-label="Coup précédent" title="Coup précédent (←)">
              ◀
            </button>
            <span className="cur" aria-live="polite">
              {ply === 0 ? 'Départ' : moveLabel({ ply: ply - 1, san: parsed.moves[ply - 1].san })}
              {prevMove && <ClsChip cls={prevMove.cls} />}
            </span>
            <button className="btn" type="button" onClick={() => goto(ply + 1)} aria-label="Coup suivant" title="Coup suivant (→)">
              ▶
            </button>
            <button className="btn" type="button" onClick={() => goto(n)} aria-label="Fin" title="Fin">
              ⏭
            </button>
          </div>
          {review && <EvalGraph review={review} ply={ply} onSelect={goto} />}
        </div>

        <div className="mg-side">
          {review ? (
            <>
              <div className="mg-acc">
                {(['white', 'black'] as const).map((c) => {
                  const acc = review.accuracy[c];
                  return (
                    <div key={c} className={`acc-card ${c === playerColor ? 'me' : ''}`}>
                      <div className="acc-who">
                        <PieceIcon piece={c === 'white' ? 'wK' : 'bK'} size={18} title={c === 'white' ? 'Blancs' : 'Noirs'} />
                        <span>{c === 'white' ? white : black}</span>
                      </div>
                      <div className="acc-value">
                        {acc != null ? acc.toFixed(1) : '—'}
                        <small> % précision</small>
                      </div>
                      <div className="acc-counts">
                        {ERROR_CLASSES.filter((k) => k !== 'miss' || review.counts.white.miss + review.counts.black.miss > 0).map((k) => (
                          <span key={k} title={`${MOVE_CLASS_LABELS[k]} : ${review.counts[c][k]}`}>
                            <ClsChip cls={k} />
                            {review.counts[c][k]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {prevMove ? (
                <div className="card mg-current">
                  <div className="mg-current-head">
                    <ClsChip cls={prevMove.cls} />
                    <span className="san">{moveLabel(prevMove)}</span>
                    <span>{MOVE_CLASS_LABELS[prevMove.cls]}</span>
                    <span className="mono muted">{fmtEval(prevMove.evalAfter)}</span>
                  </div>
                  {prevMove.cls !== 'best' && prevMove.bestSan && (
                    <div className="best">
                      Meilleur : <strong>{prevMove.bestSan}</strong> — <span className="mono">{prevMove.bestLine}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card mg-current muted">Position de départ. Utilise ← → ou clique un coup.</div>
              )}
            </>
          ) : (
            !running && <p className="muted">Lance l'analyse pour obtenir la précision, la classification des coups et les moments clés.</p>
          )}
          <MoveList sans={parsed.moves.map((m) => m.san)} current={ply} onSelect={goto} classes={review ? review.moves.map((m) => m.cls) : undefined} />
        </div>
      </div>

      {review && (
        <section className="card" aria-labelledby="mg-key-title">
          <h2 id="mg-key-title" style={{ marginTop: 0 }}>
            Moments clés
          </h2>
          {keyMoments.length === 0 ? (
            <p className="muted">Aucune erreur notable de ta part dans cette partie. Belle partie !</p>
          ) : (
            <ol className="key-list">
              {keyMoments.map((idx) => {
                const m = review.moves[idx];
                const on = selectedKey === idx;
                return (
                  <li key={idx} className={`key-item ${on ? 'on' : ''}`}>
                    <span className="key-num" aria-hidden />
                    <div className="key-body">
                      <button className="key-head" type="button" onClick={() => openKey(idx)} aria-expanded={on}>
                        <ClsChip cls={m.cls} />
                        <span className="san">{moveLabel(m)}</span>
                        <span>{MOVE_CLASS_LABELS[m.cls]}</span>
                        <span className="key-eval">
                          {fmtEval(m.evalBefore)} → {fmtEval(m.evalAfter)}
                        </span>
                        <span className="key-loss">−{Math.round(m.winLoss)} % de chances de gain</span>
                      </button>
                      {m.categories.length > 0 && (
                        <div className="mg-cats">
                          {m.categories.map((c) => (
                            <span key={c} className="badge">
                              {CATEGORY_LABELS[c]}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.bestSan && (
                        <p className="key-best">
                          Il fallait jouer <strong>{m.bestSan}</strong> : <span className="mono">{m.bestLine}</span>
                        </p>
                      )}
                      {on && m.explanation && (
                        <ExplanationPanel
                          explanation={m.explanation}
                          cls={m.cls}
                          fenBefore={m.fenBefore}
                          onFocusArrows={(a: BoardArrow[], mk: SquareMark[]) => {
                            setPly(m.ply);
                            setFocus({ arrows: a, marks: mk });
                          }}
                        />
                      )}
                      {!on && m.explanation && (
                        <button className="btn ghost" type="button" style={{ justifySelf: 'start', padding: '0.2rem 0.5rem' }} onClick={() => openKey(idx)}>
                          Voir l'explication
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Graphe d'évaluation : fond noyer (Noirs), aire ivoire (Blancs)
// ---------------------------------------------------------------------------

const DOT_CLASSES: MoveClass[] = ['inaccuracy', 'mistake', 'blunder', 'miss'];

function EvalGraph({ review, ply, onSelect }: { review: GameReview; ply: number; onSelect: (p: number) => void }) {
  const data = review.evals.map((cp, i) => ({
    ply: i,
    win: winPercent(cp),
    cp,
    move: i > 0 ? review.moves[i - 1] : null,
  }));
  // Points : erreurs, gaffes et coups manqués des deux camps ; imprécisions seulement pour le joueur.
  const marks = review.moves.filter(
    (m) => m.cls === 'blunder' || m.cls === 'mistake' || m.cls === 'miss' || (m.cls === 'inaccuracy' && m.color === review.playerColor),
  );
  const shown = DOT_CLASSES.filter((c) => marks.some((m) => m.cls === c));
  return (
    <ChartCard className="eval-card" title="Évaluation" subtitle="Chances de gain des Blancs, coup par coup. Clique pour t'y rendre.">
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart
          data={data}
          margin={{ top: 6, right: 6, bottom: 0, left: 6 }}
          onClick={(e) => {
            if (e && e.activeLabel !== undefined && e.activeLabel !== null) onSelect(Number(e.activeLabel));
          }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid fill="var(--viz-eval-bg)" fillOpacity={1} horizontal={false} vertical={false} />
          <XAxis
            dataKey="ply"
            type="number"
            domain={[0, data.length - 1]}
            tickFormatter={(p) => String(Math.ceil(p / 2))}
            {...AXIS_PROPS}
            allowDecimals={false}
            minTickGap={24}
          />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            cursor={{ stroke: 'var(--viz-eval-line)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[number];
              return (
                <TooltipBox
                  title={d.move ? moveLabel(d.move) : 'Position de départ'}
                  rows={[
                    { label: 'Éval', value: fmtEval(d.cp) },
                    { label: 'Gain Blancs', value: `${Math.round(d.win)} %` },
                    ...(d.move ? [{ label: 'Coup', value: MOVE_CLASS_LABELS[d.move.cls] }] : []),
                  ]}
                />
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="win"
            stroke="var(--viz-eval-line)"
            strokeWidth={2}
            fill="var(--viz-eval-area)"
            fillOpacity={1}
            baseValue={0}
            isAnimationActive={false}
            activeDot={{ r: 4, stroke: 'var(--viz-eval-bg)', strokeWidth: 2, fill: 'var(--viz-eval-line)' }}
          />
          <ReferenceLine y={50} stroke="var(--viz-eval-mid)" strokeDasharray="3 3" />
          <ReferenceLine x={ply} stroke="var(--viz-eval-line)" strokeWidth={2} />
          {marks.map((m) => (
            <ReferenceDot
              key={m.ply}
              x={m.ply + 1}
              y={winPercent(m.evalAfter)}
              r={m.color === review.playerColor ? 5.5 : 4}
              shape={(p: { cx?: number; cy?: number; r?: number }) => (
                <circle
                  className={`cls-${m.cls}`}
                  cx={p.cx}
                  cy={p.cy}
                  r={p.r}
                  style={{ fill: 'var(--cls)', stroke: 'var(--viz-eval-bg)', strokeWidth: 2 }}
                >
                  <title>
                    {moveLabel(m)} : {MOVE_CLASS_LABELS[m.cls]}
                  </title>
                </circle>
              )}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      {shown.length > 0 && (
        <div className="eval-legend">
          {shown.map((c) => (
            <span key={c} className={`cls-${c}`}>
              <i /> {MOVE_CLASS_LABELS[c]}
            </span>
          ))}
          <span>Gros points : tes coups</span>
        </div>
      )}
    </ChartCard>
  );
}
