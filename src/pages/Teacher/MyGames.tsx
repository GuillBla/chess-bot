import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
import { MOVE_CLASS_LABELS, MOVE_CLASS_SYMBOLS, isError, winPercent, type MoveClass } from '../../analysis/classify';
import type { BoardArrow, SquareMark } from '../../analysis/types';
import Board from '../../components/Board';
import EvalBar from '../../components/EvalBar';
import ExplanationPanel from '../../components/ExplanationPanel';
import { AXIS_PROPS, ChartCard, GRID_PROPS, TooltipBox } from '../../components/stats/chartKit';

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

function clsBadge(cls: MoveClass): string {
  if (cls === 'blunder' || cls === 'miss') return 'bad';
  if (cls === 'mistake' || cls === 'inaccuracy') return 'warn';
  if (cls === 'best' || cls === 'excellent') return 'good';
  return '';
}

function outcomeBadge(o: GameSummary['outcome']): string {
  return o === 'win' ? 'good' : o === 'loss' ? 'bad' : '';
}

function isUserReview(r: GameReview, user: string) {
  const u = normalizeUsername(user);
  return r.meta[r.playerColor].toLowerCase() === u;
}

const COUNT_ROWS: MoveClass[] = ['best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder', 'miss'];

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
// Liste + rapport agrégé
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
        <label htmlFor="mg-user">Pseudo</label>
        <input id="mg-user" type="text" value={input} onChange={(e) => setInput(e.target.value)} style={{ maxWidth: 180 }} spellCheck={false} />
        <button className="btn" type="submit">
          Charger
        </button>
        <label htmlFor="mg-tc">Cadence</label>
        <select id="mg-tc" value={ctx.timeClass} onChange={(e) => ctx.setTimeClass(e.target.value as TimeClass | 'all')}>
          <option value="all">Toutes</option>
          {(Object.keys(TIME_CLASS_LABELS) as TimeClass[]).map((tc) => (
            <option key={tc} value={tc}>
              {TIME_CLASS_LABELS[tc]}
            </option>
          ))}
        </select>
        <label htmlFor="mg-n">Parties</label>
        <select id="mg-n" value={ctx.count} onChange={(e) => ctx.setCount(+e.target.value)}>
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
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
        <div className="card table-scroll">
          <table className="mg-games stats-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cadence</th>
                <th>Adversaire</th>
                <th>Résultat</th>
                <th>Ouverture</th>
                <th className="num">Précision</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ctx.games.map((g) => {
                const r = ctx.reviews[g.url];
                const running = ctx.job?.url === g.url;
                return (
                  <tr key={g.url} className={running ? 'current' : ''}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(g.endTime)}</td>
                    <td>
                      {TIME_CLASS_LABELS[g.timeClass]} <span className="muted">{formatTimeControl(g.timeControl)}</span>
                    </td>
                    <td>
                      <span title={g.color === 'white' ? 'Tu avais les Blancs' : 'Tu avais les Noirs'}>{g.color === 'white' ? '♔' : '♚'}</span>{' '}
                      {g.opponent} <span className="muted">({g.oppRating})</span>
                    </td>
                    <td>
                      <span className={`badge ${outcomeBadge(g.outcome)}`}>{OUTCOME_LABELS[g.outcome]}</span>{' '}
                      <span className="muted">{END_REASON_LABELS[g.reason].toLowerCase()}</span>
                    </td>
                    <td>
                      {g.opening.name} <span className="muted mono">{g.opening.eco}</span>
                    </td>
                    <td className="num">{r?.accuracy[r.playerColor] != null ? `${r.accuracy[r.playerColor]!.toFixed(1)} %` : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
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
  const catData = rep.categories.map((c) => ({ ...c }));
  return (
    <>
      <h2>Rapport sur {rep.games} partie{rep.games > 1 ? 's' : ''} analysée{rep.games > 1 ? 's' : ''}</h2>
      <div className="stat-tiles">
        <div className="stat-tile">
          <div className="stat-tile-label">Précision moyenne</div>
          <div className="stat-tile-value">{rep.avgAccuracy != null ? `${rep.avgAccuracy.toFixed(1)} %` : '—'}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Imprécisions / partie</div>
          <div className="stat-tile-value">{(rep.classCounts.inaccuracy / rep.games).toFixed(1)}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">Erreurs + gaffes / partie</div>
          <div className="stat-tile-value">{(errors / rep.games).toFixed(1)}</div>
        </div>
        {worstPhase && (
          <div className="stat-tile">
            <div className="stat-tile-label">Phase la plus coûteuse</div>
            <div className="stat-tile-value" style={{ fontSize: '1.25rem' }}>
              {worstPhase.label}
            </div>
          </div>
        )}
      </div>

      {rep.recommendations.length > 0 && (
        <section className="card">
          <h3>Leçons recommandées</h3>
          <div className="card-grid">
            {rep.recommendations.map((r) => (
              <Link key={r.lesson.id} to={`/teacher/lessons/${r.lesson.id}`} className="card link-card mg-rec">
                <strong>{r.lesson.title}</strong>
                <p>{r.why}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="viz-grid">
        <ChartCard title="Erreurs récurrentes" subtitle="Erreurs, gaffes et coups manqués, par catégorie (un coup peut en cumuler plusieurs)">
          {catData.length === 0 ? (
            <p className="muted">Aucune erreur détectée : bravo !</p>
          ) : (
            <ResponsiveContainer width="100%" height={catData.length * 34 + 24}>
              <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={8}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={200} {...AXIS_PROPS} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--viz-hover)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const c = payload[0].payload as (typeof catData)[number];
                    return (
                      <TooltipBox
                        title={c.label}
                        rows={[
                          { color: 'var(--viz-loss)', label: 'Coups', value: c.count },
                          { label: 'Parties concernées', value: c.games },
                          { label: 'Win% perdu (total)', value: Math.round(c.winLoss) },
                        ]}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--viz-loss)"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  label={{ position: 'right', fill: 'var(--viz-axis)', fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
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
                  <th className="num">Perte moy. / coup</th>
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
                        {o.name} <span className="muted">({o.color === 'white' ? 'Blancs' : 'Noirs'})</span>
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
// Vue d'une partie
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
        <Link to="..">← Retour à la liste</Link>
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

  return (
    <div className="page">
      <div className="mg-nav">
        <Link to="..">← Retour à la liste</Link>
      </div>
      <h2 style={{ margin: 0 }}>
        {white} – {black}
      </h2>
      <p className="muted" style={{ margin: 0 }}>
        {summary && (
          <>
            <span className={`badge ${outcomeBadge(summary.outcome)}`}>{OUTCOME_LABELS[summary.outcome]}</span> {END_REASON_LABELS[summary.reason].toLowerCase()} ·{' '}
            {TIME_CLASS_LABELS[summary.timeClass]} · {fmtDate(summary.endTime)} · {summary.opening.name} ({summary.opening.eco}) ·{' '}
          </>
        )}
        <a href={summary?.url ?? review?.url} target="_blank" rel="noreferrer">
          Voir sur chess.com
        </a>
      </p>
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

      <div className="board-layout">
        <EvalBar whiteCp={evalCp} label={review ? fmtEval(evalCp) : '?'} orientation={playerColor} height={420} />
        <div className="board-col">
          <Board fen={fen} orientation={playerColor} lastMove={lastMove} arrows={arrows} marks={marks} id="mygames-board" />
          <div className="btn-row" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            <button className="btn" type="button" onClick={() => goto(0)} aria-label="Début">
              ⏮
            </button>
            <button className="btn" type="button" onClick={() => goto(ply - 1)} aria-label="Coup précédent">
              ◀
            </button>
            <span className="muted" style={{ alignSelf: 'center', minWidth: '5rem', textAlign: 'center' }}>
              {ply === 0 ? 'Départ' : moveLabel({ ply: ply - 1, san: parsed.moves[ply - 1].san })}
            </span>
            <button className="btn" type="button" onClick={() => goto(ply + 1)} aria-label="Coup suivant">
              ▶
            </button>
            <button className="btn" type="button" onClick={() => goto(n)} aria-label="Fin">
              ⏭
            </button>
          </div>
        </div>
        <div className="side-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {review ? (
            <>
              <div className="mg-acc">
                {(['white', 'black'] as const).map((c) => (
                  <div key={c} className={`stat-tile ${c === playerColor ? 'me' : ''}`}>
                    <div className="stat-tile-label">Précision {c === 'white' ? 'Blancs' : 'Noirs'}</div>
                    <div className="stat-tile-value">{review.accuracy[c] != null ? `${review.accuracy[c]!.toFixed(1)} %` : '—'}</div>
                    <div className="stat-tile-meta">{c === 'white' ? white : black}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: '0.6rem 0.8rem' }}>
                <div className="mg-counts">
                  <span />
                  <strong className="num">Blancs</strong>
                  <strong className="num">Noirs</strong>
                  {COUNT_ROWS.filter((c) => c !== 'miss' || review.counts.white.miss + review.counts.black.miss > 0).map((c) => (
                    <FragmentRow key={c} cls={c} w={review.counts.white[c]} b={review.counts.black[c]} />
                  ))}
                </div>
              </div>
              {prevMove && (
                <div className="card" style={{ padding: '0.6rem 0.8rem' }}>
                  <div>
                    <strong>{moveLabel(prevMove)}</strong> <span className={`badge ${clsBadge(prevMove.cls)}`}>{MOVE_CLASS_LABELS[prevMove.cls]}</span>{' '}
                    <span className="mono muted">{fmtEval(prevMove.evalAfter)}</span>
                  </div>
                  {prevMove.cls !== 'best' && prevMove.bestSan && (
                    <div className="muted" style={{ fontSize: '0.9rem' }}>
                      Meilleur : <strong>{prevMove.bestSan}</strong> — <span className="mono">{prevMove.bestLine}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            !running && <p className="muted">Lance l'analyse pour obtenir la précision, la classification des coups et les moments clés.</p>
          )}
          <MoveList moves={parsed.moves.map((m, i) => ({ san: m.san, cls: review?.moves[i]?.cls }))} ply={ply} onSelect={goto} />
        </div>
      </div>

      {review && <EvalGraph review={review} ply={ply} onSelect={goto} />}

      {review && (
        <section className="card">
          <h3>Moments clés</h3>
          {keyMoments.length === 0 ? (
            <p className="muted">Aucune erreur notable de ta part dans cette partie. Belle partie !</p>
          ) : (
            keyMoments.map((idx) => {
              const m = review.moves[idx];
              return (
                <div key={idx} className={`mg-key ${m.cls}`}>
                  <div className="mg-key-head">
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setPly(m.ply);
                        setSelectedKey(idx);
                        setFocus(null);
                      }}
                    >
                      {moveLabel(m)}
                      {MOVE_CLASS_SYMBOLS[m.cls] ?? ''}
                    </button>
                    <span className={`badge ${clsBadge(m.cls)}`}>{MOVE_CLASS_LABELS[m.cls]}</span>
                    <span className="muted">
                      {fmtEval(m.evalBefore)} → {fmtEval(m.evalAfter)} · −{Math.round(m.winLoss)} % de chances de gain
                    </span>
                  </div>
                  <div className="mg-cats">
                    {m.categories.map((c) => (
                      <span key={c} className="badge">
                        {CATEGORY_LABELS[c]}
                      </span>
                    ))}
                  </div>
                  {m.bestSan && (
                    <p style={{ margin: '0.3rem 0' }}>
                      Il fallait jouer <strong>{m.bestSan}</strong> : <span className="mono">{m.bestLine}</span>
                    </p>
                  )}
                  {selectedKey === idx && m.explanation && (
                    <ExplanationPanel
                      explanation={m.explanation}
                      onFocusArrows={(a: BoardArrow[], mk: SquareMark[]) => {
                        setPly(m.ply);
                        setFocus({ arrows: a, marks: mk });
                      }}
                    />
                  )}
                  {selectedKey !== idx && m.explanation && (
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        setPly(m.ply);
                        setSelectedKey(idx);
                        setFocus(null);
                      }}
                    >
                      Voir l'explication
                    </button>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}

function FragmentRow({ cls, w, b }: { cls: MoveClass; w: number; b: number }) {
  return (
    <>
      <span>
        <span className={`badge ${clsBadge(cls)}`}>{MOVE_CLASS_LABELS[cls]}</span>
      </span>
      <span className="num">{w}</span>
      <span className="num">{b}</span>
    </>
  );
}

function MoveList({ moves, ply, onSelect }: { moves: { san: string; cls?: MoveClass }[]; ply: number; onSelect: (p: number) => void }) {
  const rows: { no: number; w?: number; b?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) rows.push({ no: i / 2 + 1, w: i, b: i + 1 < moves.length ? i + 1 : undefined });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector('button.current')?.scrollIntoView({ block: 'nearest' });
  }, [ply]);
  const btn = (i?: number) => {
    if (i === undefined) return <span />;
    const m = moves[i];
    const tone = m.cls === 'blunder' || m.cls === 'miss' ? 'bad' : m.cls === 'mistake' || m.cls === 'inaccuracy' ? 'warn' : '';
    return (
      <button type="button" className={`${tone} ${ply === i + 1 ? 'current' : ''}`} onClick={() => onSelect(i + 1)} title={m.cls ? MOVE_CLASS_LABELS[m.cls] : undefined}>
        {m.san}
        {m.cls ? (MOVE_CLASS_SYMBOLS[m.cls] ?? '') : ''}
      </button>
    );
  };
  return (
    <div className="movelist mg-moves" ref={ref}>
      {rows.map((r) => (
        <div key={r.no} style={{ display: 'contents' }}>
          <span className="num">{r.no}.</span>
          {btn(r.w)}
          {btn(r.b)}
        </div>
      ))}
    </div>
  );
}

function EvalGraph({ review, ply, onSelect }: { review: GameReview; ply: number; onSelect: (p: number) => void }) {
  const data = review.evals.map((cp, i) => ({
    ply: i,
    win: winPercent(cp),
    cp,
    move: i > 0 ? review.moves[i - 1] : null,
  }));
  const errs = review.moves.filter((m) => m.cls === 'blunder' || m.cls === 'mistake' || m.cls === 'miss');
  return (
    <ChartCard title="Évolution de l'évaluation" subtitle="Chances de gain des Blancs (clique sur le graphe pour aller au coup)">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
          onClick={(e) => {
            if (e && e.activeLabel !== undefined && e.activeLabel !== null) onSelect(Number(e.activeLabel));
          }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="ply" type="number" domain={[0, data.length - 1]} tickFormatter={(p) => String(Math.ceil(p / 2))} {...AXIS_PROPS} allowDecimals={false} />
          <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickFormatter={(v) => `${v} %`} width={44} {...AXIS_PROPS} axisLine={false} />
          <ReferenceLine y={50} stroke="var(--viz-axis-line)" />
          <ReferenceLine x={ply} stroke="var(--accent)" strokeWidth={2} />
          <Tooltip
            cursor={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[number];
              return (
                <TooltipBox
                  title={d.move ? moveLabel(d.move) : 'Position de départ'}
                  rows={[
                    { color: 'var(--viz-1)', label: 'Éval', value: fmtEval(d.cp) },
                    { label: 'Gain Blancs', value: `${Math.round(d.win)} %` },
                    ...(d.move ? [{ label: 'Coup', value: MOVE_CLASS_LABELS[d.move.cls] }] : []),
                  ]}
                />
              );
            }}
          />
          <Area type="monotone" dataKey="win" stroke="var(--viz-1)" strokeWidth={2} fill="var(--viz-eval-fill)" baseValue={50} isAnimationActive={false} activeDot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2 }} />
          {errs.map((m) => (
            <ReferenceDot
              key={m.ply}
              x={m.ply + 1}
              y={winPercent(m.evalAfter)}
              r={m.color === review.playerColor ? 5 : 4}
              fill={m.cls === 'mistake' ? 'var(--warn)' : 'var(--bad)'}
              stroke="var(--surface)"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <p className="muted" style={{ fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
        Points : <span style={{ color: 'var(--bad)' }}>●</span> gaffe / coup manqué, <span style={{ color: 'var(--warn)' }}>●</span> erreur (gros points = tes
        coups).
      </p>
    </ChartCard>
  );
}
