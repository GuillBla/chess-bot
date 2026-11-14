import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChessComError,
  TIME_CLASS_LABELS,
  countryCode,
  countryName,
  fetchProfile,
  fetchStats,
  getStoredUsername,
  loadGamesProgressively,
  normalizeUsername,
  setStoredUsername,
  summarizeAll,
  type ChessComGame,
  type PlayerProfile,
  type PlayerStats,
  type RatingStats,
  type TimeClass,
} from '../api/chesscom';
import { AXIS_PROPS, ChartCard, GRID_PROPS, Legend, TIME_CLASS_COLORS, TooltipBox, WDL_COLORS, fmtPct } from '../components/stats/chartKit';
import WdlChart from '../components/stats/WdlChart';
import {
  TIME_CLASSES,
  activityByMonth,
  byColor,
  byEloGap,
  byTimeClass,
  endReasons,
  insights,
  ratingSeries,
  topOpenings,
  type OpeningRow,
} from '../components/stats/profileStats';

type Period = '3m' | '1y' | 'all';
const PERIODS: { id: Period; label: string }[] = [
  { id: '3m', label: '3 mois' },
  { id: '1y', label: '1 an' },
  { id: 'all', label: 'Tout' },
];

const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShortDate = (ms: number) => new Date(ms).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

export default function Profile() {
  const [input, setInput] = useState(getStoredUsername());
  const [user, setUser] = useState(getStoredUsername());
  const [reloadKey, setReloadKey] = useState(0);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [games, setGames] = useState<ChessComGame[]>([]);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('1y');
  const [tcFilter, setTcFilter] = useState<TimeClass | 'all'>('all');

  useEffect(() => {
    const ctrl = new AbortController();
    const force = reloadKey > 0;
    setProfile(null);
    setStats(null);
    setGames([]);
    setError(null);
    setProgress(null);
    setLoadingGames(true);
    (async () => {
      try {
        const [p, s] = await Promise.all([fetchProfile(user, { signal: ctrl.signal, force }), fetchStats(user, { signal: ctrl.signal, force })]);
        if (ctrl.signal.aborted) return;
        setProfile(p);
        setStats(s);
        await loadGamesProgressively(user, {
          signal: ctrl.signal,
          force,
          onMonth: (all, loaded, total) => {
            if (ctrl.signal.aborted) return;
            setGames([...all]);
            setProgress({ loaded, total });
          },
        });
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError(e instanceof ChessComError ? e.message : `Erreur inattendue : ${(e as Error).message}`);
      } finally {
        if (!ctrl.signal.aborted) setLoadingGames(false);
      }
    })();
    return () => ctrl.abort();
  }, [user, reloadKey]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const u = normalizeUsername(input);
    if (!u) return;
    setStoredUsername(u);
    setReloadKey(0);
    setUser(u);
  };

  const all = useMemo(() => summarizeAll(games, user), [games, user]);
  const filtered = useMemo(() => (tcFilter === 'all' ? all : all.filter((g) => g.timeClass === tcFilter)), [all, tcFilter]);

  const since = useMemo(() => {
    const now = Date.now();
    if (period === '3m') return now - 91 * 86400e3;
    if (period === '1y') return now - 365 * 86400e3;
    return 0;
  }, [period]);
  const series = useMemo(() => ratingSeries(all, since), [all, since]);
  const seriesClasses = TIME_CLASSES.filter((tc) => series[tc].length > 1);

  const colorRows = useMemo(() => byColor(filtered), [filtered]);
  const tcRows = useMemo(() => byTimeClass(all), [all]);
  const openW = useMemo(() => topOpenings(filtered, 'white'), [filtered]);
  const openB = useMemo(() => topOpenings(filtered, 'black'), [filtered]);
  const winReasons = useMemo(() => endReasons(filtered, 'win'), [filtered]);
  const lossReasons = useMemo(() => endReasons(filtered, 'loss'), [filtered]);
  const gap = useMemo(() => byEloGap(filtered), [filtered]);
  const activity = useMemo(() => activityByMonth(filtered), [filtered]);
  const tips = useMemo(() => insights(filtered), [filtered]);
  const activityClasses = TIME_CLASSES.filter((tc) => activity.some((a) => a[tc] > 0));

  const loadingText = progress
    ? `Chargement des archives : ${progress.loaded} / ${progress.total} mois (${all.length} parties)…`
    : 'Chargement des archives…';

  return (
    <div className="page stats-page">
      <h1>Mes statistiques</h1>
      <form className="stats-userform" onSubmit={onSubmit}>
        <label htmlFor="cc-user">Pseudo chess.com</label>
        <input id="cc-user" type="text" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" spellCheck={false} />
        <button className="btn primary" type="submit">
          Charger
        </button>
        <button
          className="btn"
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          title="Recharge le profil, les stats et le mois en cours depuis chess.com (les mois terminés restent en cache)"
        >
          Actualiser
        </button>
      </form>

      {error && (
        <div className="card stats-error" role="alert">
          <span className="badge bad">Erreur</span> {error}
        </div>
      )}

      {!profile && !error && (
        <div className="card">
          <span className="spinner" /> Chargement du profil…
        </div>
      )}

      {profile && stats && <ProfileHeader profile={profile} stats={stats} />}

      {profile && (
        <>
          {loadingGames && (
            <div className="stats-progress" aria-live="polite">
              <span className="spinner" /> {loadingText}
              {progress && <progress max={progress.total} value={progress.loaded} />}
            </div>
          )}

          {all.length > 0 && (
            <>
              <ChartCard
                title="Évolution de l'Elo"
                subtitle="Parties classées, par cadence"
                actions={
                  <div className="seg" role="group" aria-label="Période">
                    {PERIODS.map((p) => (
                      <button key={p.id} className={period === p.id ? 'active' : ''} onClick={() => setPeriod(p.id)} type="button">
                        {p.label}
                      </button>
                    ))}
                  </div>
                }
              >
                {seriesClasses.length === 0 ? (
                  <p className="muted">Pas assez de parties classées sur cette période.</p>
                ) : (
                  <>
                    <Legend items={seriesClasses.map((tc) => ({ color: TIME_CLASS_COLORS[tc], label: TIME_CLASS_LABELS[tc] }))} />
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={fmtShortDate} {...AXIS_PROPS} minTickGap={30} />
                        <YAxis domain={['auto', 'auto']} width={48} {...AXIS_PROPS} axisLine={false} />
                        <Tooltip
                          cursor={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const t = (payload[0].payload as { t: number }).t;
                            return (
                              <TooltipBox
                                title={fmtDate(t)}
                                rows={payload.map((p) => ({ color: String(p.color), label: String(p.name), value: String(p.value) }))}
                              />
                            );
                          }}
                        />
                        {seriesClasses.map((tc) => (
                          <Line
                            key={tc}
                            data={series[tc]}
                            dataKey="rating"
                            name={TIME_CLASS_LABELS[tc]}
                            stroke={TIME_CLASS_COLORS[tc]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, stroke: 'var(--surface)', strokeWidth: 2 }}
                            isAnimationActive={false}
                            type="monotone"
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                )}
              </ChartCard>

              <div className="stats-filter">
                <span className="muted">Filtrer les statistiques ci-dessous :</span>
                <div className="seg" role="group" aria-label="Cadence">
                  <button type="button" className={tcFilter === 'all' ? 'active' : ''} onClick={() => setTcFilter('all')}>
                    Toutes
                  </button>
                  {TIME_CLASSES.filter((tc) => all.some((g) => g.timeClass === tc)).map((tc) => (
                    <button type="button" key={tc} className={tcFilter === tc ? 'active' : ''} onClick={() => setTcFilter(tc)}>
                      {TIME_CLASS_LABELS[tc]}
                    </button>
                  ))}
                </div>
                <span className="muted">{filtered.length} parties</span>
              </div>

              {tips.length > 0 && (
                <section className="card">
                  <h3>Ce que disent tes parties</h3>
                  <ul className="stats-insights">
                    {tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="viz-grid">
                <ChartCard title="Résultats par couleur">
                  <WdlChart rows={colorRows} />
                </ChartCard>
                <ChartCard title="Résultats par cadence" subtitle="Toutes cadences, indépendamment du filtre">
                  <WdlChart rows={tcRows} />
                </ChartCard>
              </div>

              <div className="viz-grid">
                <ChartCard title="Ouvertures avec les Blancs" subtitle="Les plus jouées, score = (V + N/2) / parties">
                  <OpeningTable rows={openW} />
                </ChartCard>
                <ChartCard title="Ouvertures avec les Noirs" subtitle="Les plus jouées, score = (V + N/2) / parties">
                  <OpeningTable rows={openB} />
                </ChartCard>
              </div>

              <div className="viz-grid">
                <ChartCard title="Comment tu gagnes" subtitle={`${winReasons.reduce((a, r) => a + r.count, 0)} victoires`}>
                  <ReasonChart rows={winReasons} color={WDL_COLORS.win} />
                </ChartCard>
                <ChartCard title="Comment tu perds" subtitle={`${lossReasons.reduce((a, r) => a + r.count, 0)} défaites`}>
                  <ReasonChart rows={lossReasons} color={WDL_COLORS.loss} />
                </ChartCard>
              </div>

              <ChartCard title="Performance selon l'écart d'Elo" subtitle="Elo adverse − ton Elo ; à droite, adversaires plus forts. Ligne : 50 %.">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={gap} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="label" {...AXIS_PROPS} interval={0} tick={{ ...AXIS_PROPS.tick, fontSize: 11 }} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v} %`} width={48} {...AXIS_PROPS} axisLine={false} />
                    <ReferenceLine y={50} stroke="var(--viz-axis)" strokeDasharray="4 4" />
                    <Tooltip
                      cursor={{ fill: 'var(--viz-hover)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const r = payload[0].payload as (typeof gap)[number];
                        return (
                          <TooltipBox
                            title={`Écart ${r.label}`}
                            rows={[
                              { color: 'var(--viz-1)', label: 'Score', value: r.total ? fmtPct(r.score) : '—' },
                              { label: 'Parties', value: r.total },
                              { label: 'V / N / D', value: `${r.win} / ${r.draw} / ${r.loss}` },
                            ]}
                          />
                        );
                      }}
                    />
                    <Bar dataKey="score" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Activité par mois" subtitle="Nombre de parties jouées">
                <Legend items={activityClasses.map((tc) => ({ color: TIME_CLASS_COLORS[tc], label: TIME_CLASS_LABELS[tc] }))} />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={activity} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
                    <YAxis allowDecimals={false} width={40} {...AXIS_PROPS} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'var(--viz-hover)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const r = payload[0].payload as (typeof activity)[number];
                        return (
                          <TooltipBox
                            title={`${r.label} · ${r.total} parties`}
                            rows={activityClasses.map((tc) => ({ color: TIME_CLASS_COLORS[tc], label: TIME_CLASS_LABELS[tc], value: r[tc] }))}
                          />
                        );
                      }}
                    />
                    {activityClasses.map((tc, i) => (
                      <Bar
                        key={tc}
                        dataKey={tc}
                        stackId="m"
                        fill={TIME_CLASS_COLORS[tc]}
                        stroke="var(--surface)"
                        strokeWidth={activity.length > 40 ? 0 : 1}
                        radius={i === activityClasses.length - 1 ? [4, 4, 0, 0] : undefined}
                        isAnimationActive={false}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          )}

          {!loadingGames && !error && all.length === 0 && <p className="muted">Aucune partie d'échecs standard trouvée pour ce joueur.</p>}
        </>
      )}
    </div>
  );
}

function RatingTile({ label, s }: { label: string; s?: RatingStats }) {
  if (!s) return null;
  const { win, loss, draw } = s.record;
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">{s.last.rating}</div>
      <div className="stat-tile-meta">
        {s.best && (
          <span title={fmtDate(s.best.date * 1000)}>
            Record : <strong>{s.best.rating}</strong>
          </span>
        )}
        <span>
          {win} V · {draw} N · {loss} D
        </span>
      </div>
    </div>
  );
}

function ProfileHeader({ profile, stats }: { profile: PlayerProfile; stats: PlayerStats }) {
  const cc = countryCode(profile.country);
  return (
    <section className="card stats-header">
      <div className="stats-identity">
        {profile.avatar ? <img src={profile.avatar} alt="" className="stats-avatar" /> : <div className="stats-avatar stats-avatar-empty">♟</div>}
        <div>
          <h2>
            <a href={profile.url} target="_blank" rel="noreferrer">
              {profile.title && <span className="badge idea">{profile.title}</span>} {profile.url.split('/').pop() ?? profile.username}
            </a>
          </h2>
          <p className="muted">
            {[countryName(cc), profile.location].filter(Boolean).join(' · ')}
            <br />
            Inscrit le {fmtDate(profile.joined * 1000)} · vu le {fmtDate(profile.last_online * 1000)}
            {profile.league && <> · Ligue {profile.league}</>}
          </p>
        </div>
      </div>
      <div className="stat-tiles">
        <RatingTile label="Rapide" s={stats.chess_rapid} />
        <RatingTile label="Blitz" s={stats.chess_blitz} />
        <RatingTile label="Bullet" s={stats.chess_bullet} />
        <RatingTile label="Par jour" s={stats.chess_daily} />
        {(stats.tactics?.highest || stats.puzzle_rush?.best) && (
          <div className="stat-tile">
            <div className="stat-tile-label">Problèmes</div>
            <div className="stat-tile-value">{stats.tactics?.highest?.rating ?? '—'}</div>
            <div className="stat-tile-meta">
              <span>Record tactique</span>
              {stats.puzzle_rush?.best && <span>Puzzle Rush : {stats.puzzle_rush.best.score}</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function OpeningTable({ rows }: { rows: OpeningRow[] }) {
  if (rows.length === 0) return <p className="muted">Pas de parties.</p>;
  return (
    <div className="table-scroll">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Ouverture</th>
            <th className="num">Parties</th>
            <th className="num">V / N / D</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                {r.name} <span className="muted mono">{r.eco}</span>
              </td>
              <td className="num">{r.total}</td>
              <td className="num">
                {r.win} / {r.draw} / {r.loss}
              </td>
              <td>
                <div className="meter" title={`${Math.round(r.score)} %`}>
                  <div className="meter-fill" style={{ width: `${r.score}%` }} />
                  <span className="meter-label">{Math.round(r.score)} %</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReasonChart({ rows, color }: { rows: { label: string; count: number; pct: number }[]; color: string }) {
  if (rows.length === 0) return <p className="muted">Aucune partie.</p>;
  return (
    <ResponsiveContainer width="100%" height={rows.length * 34 + 24}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={8}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={150} {...AXIS_PROPS} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'var(--viz-hover)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const r = payload[0].payload as (typeof rows)[number];
            return <TooltipBox title={r.label} rows={[{ color, label: 'Parties', value: `${r.count} (${fmtPct(r.pct)})` }]} />;
          }}
        />
        <Bar
          dataKey="count"
          fill={color}
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
          label={{ position: 'right', fill: 'var(--viz-axis)', fontSize: 12, formatter: (v: number) => v }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
