import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
import { PieceIcon } from '../components/pieces';
import {
  AXIS_PROPS,
  ChartCard,
  GRID_PROPS,
  Legend,
  ResultPill,
  Seg,
  TIME_CLASS_COLORS,
  TooltipBox,
  WDL_COLORS,
  fmtPct,
  fmtSigned,
} from '../components/stats/chartKit';
import WdlChart from '../components/stats/WdlChart';
import {
  TIME_CLASSES,
  activityByMonth,
  byColor,
  byEloGap,
  byTimeClass,
  endReasons,
  favoriteOpening,
  insights,
  ratingDelta,
  ratingSeries,
  streaks,
  topOpenings,
  weakPoint,
  type OpeningRow,
} from '../components/stats/profileStats';

type Period = '3m' | '1y' | 'all';
const PERIODS: { id: Period; label: string }[] = [
  { id: '3m', label: '3 mois' },
  { id: '1y', label: '1 an' },
  { id: 'all', label: 'Tout' },
];
const PERIOD_TEXT: Record<Period, string> = { '3m': 'sur 3 mois', '1y': 'sur 1 an', all: 'depuis le début' };

const STATS_KEY: Record<TimeClass, keyof PlayerStats> = {
  rapid: 'chess_rapid',
  blitz: 'chess_blitz',
  bullet: 'chess_bullet',
  daily: 'chess_daily',
};

const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtMonth = (ms: number) => new Date(ms).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
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
  const [curveTc, setCurveTc] = useState<TimeClass | null>(null);

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
    setCurveTc(null);
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
  // Cadence affichée par la courbe : choix explicite, sinon la plus jouée sur la période.
  const shownTc: TimeClass | null =
    curveTc && series[curveTc].length > 1 ? curveTc : ([...seriesClasses].sort((a, b) => series[b].length - series[a].length)[0] ?? null);

  const colorRows = useMemo(() => byColor(filtered), [filtered]);
  const tcRows = useMemo(() => byTimeClass(all), [all]);
  const openW = useMemo(() => topOpenings(filtered, 'white'), [filtered]);
  const openB = useMemo(() => topOpenings(filtered, 'black'), [filtered]);
  const winReasons = useMemo(() => endReasons(filtered, 'win'), [filtered]);
  const lossReasons = useMemo(() => endReasons(filtered, 'loss'), [filtered]);
  const gap = useMemo(() => byEloGap(filtered), [filtered]);
  const activity = useMemo(() => activityByMonth(filtered), [filtered]);
  const tips = useMemo(() => insights(filtered), [filtered]);
  const fav = useMemo(() => favoriteOpening(filtered), [filtered]);
  const weak = useMemo(() => weakPoint(filtered), [filtered]);
  const streak = useMemo(() => streaks(filtered), [filtered]);
  const activityClasses = TIME_CLASSES.filter((tc) => activity.some((a) => a[tc] > 0));

  const loadingText = progress
    ? `Chargement des archives : ${progress.loaded} / ${progress.total} mois (${all.length} parties)…`
    : 'Chargement des archives…';

  return (
    <div className="page stats-page">
      <PlayerHeader
        profile={profile}
        user={user}
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        onReload={() => setReloadKey((k) => k + 1)}
      />

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

      {stats && (
        <RatingPlates
          stats={stats}
          series={series}
          period={period}
          selected={shownTc}
          onSelect={(tc) => setCurveTc(tc)}
          selectable={(tc) => series[tc].length > 1}
        />
      )}

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
              <EloCurve
                tc={shownTc}
                points={shownTc ? series[shownTc] : []}
                classes={seriesClasses}
                onTc={setCurveTc}
                period={period}
                onPeriod={setPeriod}
              />

              <div className="stats-filter">
                <span className="eyebrow">Filtrer la suite</span>
                <Seg<TimeClass | 'all'>
                  label="Cadence"
                  value={tcFilter}
                  onChange={setTcFilter}
                  options={[
                    { id: 'all', label: 'Toutes' },
                    ...TIME_CLASSES.filter((tc) => all.some((g) => g.timeClass === tc)).map((tc) => ({ id: tc, label: TIME_CLASS_LABELS[tc] })),
                  ]}
                />
                <span className="muted">{filtered.length} parties</span>
              </div>

              <div className="highlights">
                <section className="card highlight">
                  <div className="highlight-head">
                    <PieceIcon piece="wN" size={22} />
                    <span className="eyebrow">Ouverture préférée</span>
                  </div>
                  {fav ? (
                    <>
                      <div className="highlight-title">{fav.name}</div>
                      <div className="highlight-figure">
                        {fmtPct(fav.score)}
                        <small>de score</small>
                      </div>
                      <p>
                        {fav.total} parties avec les {fav.color === 'white' ? 'Blancs' : 'Noirs'} · {fav.win} V · {fav.draw} N · {fav.loss} D
                        {fav.eco && <span className="mono"> · {fav.eco}</span>}
                      </p>
                    </>
                  ) : (
                    <p>Pas encore assez de parties.</p>
                  )}
                </section>

                <section className="card highlight bad">
                  <div className="highlight-head">
                    <PieceIcon piece="bK" size={22} />
                    <span className="eyebrow">Point faible</span>
                  </div>
                  {weak ? (
                    <>
                      <div className="highlight-title">{weak.title}</div>
                      <div className="highlight-figure">{weak.figure}</div>
                      <p>{weak.detail}</p>
                    </>
                  ) : (
                    <p>Aucun point faible net sur ces parties (ou pas assez de parties pour conclure).</p>
                  )}
                </section>

                <section className={`card highlight ${streak.current?.outcome === 'win' ? 'good' : streak.current?.outcome === 'loss' ? 'bad' : ''}`}>
                  <div className="highlight-head">
                    <PieceIcon piece="wR" size={22} />
                    <span className="eyebrow">Série en cours</span>
                  </div>
                  {streak.current ? (
                    <>
                      <div className="highlight-figure">
                        {streak.current.count}
                        <small>
                          {streak.current.outcome === 'win' ? 'victoire' : streak.current.outcome === 'loss' ? 'défaite' : 'nulle'}
                          {streak.current.count > 1 ? 's' : ''} d'affilée
                        </small>
                      </div>
                      <div className="streak" aria-label="Dix derniers résultats, du plus récent au plus ancien">
                        {streak.recent.map((o, i) => (
                          <ResultPill key={i} outcome={o} small />
                        ))}
                      </div>
                      <p>
                        Record de la période : {streak.bestWin} victoire{streak.bestWin > 1 ? 's' : ''} de suite. Du plus récent (à gauche) au plus ancien.
                      </p>
                    </>
                  ) : (
                    <p>Pas de parties.</p>
                  )}
                </section>
              </div>

              {tips.length > 0 && (
                <section aria-labelledby="tips-title">
                  <h2 id="tips-title" style={{ marginTop: 0 }}>
                    Ce que disent tes parties
                  </h2>
                  <ul className="insights">
                    {tips.map((t) => (
                      <li key={t.text} className={`insight ${t.tone}`}>
                        <span className="insight-figure">{t.figure}</span>
                        <p>{t.text}</p>
                      </li>
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
                <ChartCard title="Ouvertures avec les Blancs" subtitle="Les plus jouées ; score = (V + N/2) / parties">
                  <OpeningTable rows={openW} />
                </ChartCard>
                <ChartCard title="Ouvertures avec les Noirs" subtitle="Les plus jouées ; score = (V + N/2) / parties">
                  <OpeningTable rows={openB} />
                </ChartCard>
                <ChartCard title="Comment tu gagnes" subtitle={`${winReasons.reduce((a, r) => a + r.count, 0)} victoires`}>
                  <ReasonChart rows={winReasons} color={WDL_COLORS.win} />
                </ChartCard>
                <ChartCard title="Comment tu perds" subtitle={`${lossReasons.reduce((a, r) => a + r.count, 0)} défaites`}>
                  <ReasonChart rows={lossReasons} color={WDL_COLORS.loss} />
                </ChartCard>
                <ChartCard title="Performance selon l'écart d'Elo" subtitle="Elo adverse − ton Elo ; à droite, adversaires plus forts. Pointillé : 50 %.">
                  <GapChart rows={gap} />
                </ChartCard>
                <ChartCard title="Activité par mois" subtitle="Nombre de parties jouées">
                  <Legend items={activityClasses.map((tc) => ({ color: TIME_CLASS_COLORS[tc], label: TIME_CLASS_LABELS[tc] }))} />
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={activity} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
                      <YAxis allowDecimals={false} width={36} {...AXIS_PROPS} axisLine={false} />
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
              </div>
            </>
          )}

          {!loadingGames && !error && all.length === 0 && <p className="muted">Aucune partie d'échecs standard trouvée pour ce joueur.</p>}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// En-tête de joueur
// ---------------------------------------------------------------------------

function PlayerHeader({
  profile,
  user,
  input,
  setInput,
  onSubmit,
  onReload,
}: {
  profile: PlayerProfile | null;
  user: string;
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onReload: () => void;
}) {
  const cc = profile ? countryCode(profile.country) : '';
  const country = countryName(cc);
  const name = profile ? (profile.url.split('/').pop() ?? profile.username) : user;
  return (
    <header className="player-head">
      <div className="player-id">
        {profile?.avatar ? (
          <img src={profile.avatar} alt="" className="stats-avatar" />
        ) : (
          <div className="stats-avatar stats-avatar-empty" aria-hidden>
            <PieceIcon piece="wK" size={44} />
          </div>
        )}
        <div>
          <div className="eyebrow">Tableau de bord du joueur</div>
          <h1>
            {profile ? (
              <a href={profile.url} target="_blank" rel="noreferrer" title="Voir le profil sur chess.com">
                {profile.title && <span className="player-title">{profile.title}</span>}
                {name}
              </a>
            ) : (
              name
            )}
          </h1>
          {profile && (
            <div className="player-meta">
              {cc && (
                <span>
                  <span className="player-flag" title={country}>
                    {cc}
                  </span>{' '}
                  {country}
                </span>
              )}
              {profile.location && <span>{profile.location}</span>}
              <span>Membre depuis {fmtMonth(profile.joined * 1000)}</span>
              {profile.league && <span>Ligue {profile.league}</span>}
            </div>
          )}
        </div>
      </div>
      <form className="user-switch" onSubmit={onSubmit}>
        <label htmlFor="cc-user">Joueur chess.com</label>
        <input id="cc-user" type="text" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" spellCheck={false} />
        <button className="btn" type="submit">
          Charger
        </button>
        <button
          className="btn ghost"
          type="button"
          onClick={onReload}
          title="Recharge le profil, les stats et le mois en cours depuis chess.com (les mois terminés restent en cache)"
          aria-label="Actualiser"
        >
          ↻
        </button>
      </form>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Plaques de classement
// ---------------------------------------------------------------------------

function RatingPlates({
  stats,
  series,
  period,
  selected,
  onSelect,
  selectable,
}: {
  stats: PlayerStats;
  series: Record<TimeClass, { t: number; rating: number }[]>;
  period: Period;
  selected: TimeClass | null;
  onSelect: (tc: TimeClass) => void;
  selectable: (tc: TimeClass) => boolean;
}) {
  const tcs = TIME_CLASSES.filter((tc) => stats[STATS_KEY[tc]]);
  const puzzles = stats.tactics?.highest || stats.puzzle_rush?.best;
  if (tcs.length === 0 && !puzzles) return null;
  return (
    <div className="plates">
      {tcs.map((tc) => {
        const s = stats[STATS_KEY[tc]] as RatingStats;
        const delta = ratingDelta(series[tc]);
        const can = selectable(tc);
        return (
          <button
            key={tc}
            type="button"
            className={`plate ${selected === tc ? 'on' : ''}`}
            disabled={!can}
            aria-pressed={selected === tc}
            onClick={() => onSelect(tc)}
            title={can ? 'Afficher la courbe de cette cadence' : undefined}
          >
            <span className="plate-label">
              <span className="viz-swatch" style={{ background: TIME_CLASS_COLORS[tc] }} />
              {TIME_CLASS_LABELS[tc]}
            </span>
            <span className="plate-elo">{s.last.rating}</span>
            <span className="plate-meta">
              <span title={s.best ? fmtDate(s.best.date * 1000) : undefined}>
                Record <strong>{s.best?.rating ?? '—'}</strong>
              </span>
              {delta !== null && (
                <span>
                  <span className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>{fmtSigned(delta)}</span> {PERIOD_TEXT[period]}
                </span>
              )}
            </span>
            <span className="plate-meta">
              <span>
                {s.record.win} V · {s.record.draw} N · {s.record.loss} D
              </span>
            </span>
          </button>
        );
      })}
      {puzzles && (
        <div className="plate static" aria-label="Problèmes">
          <span className="plate-label">
            <PieceIcon piece="wQ" size={14} />
            Problèmes
          </span>
          <span className="plate-elo">{stats.tactics?.highest?.rating ?? '—'}</span>
          <span className="plate-meta">
            <span>Record tactique</span>
            {stats.puzzle_rush?.best && (
              <span>
                Puzzle Rush <strong>{stats.puzzle_rush.best.score}</strong>
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Courbe d'Elo
// ---------------------------------------------------------------------------

function EloCurve({
  tc,
  points,
  classes,
  onTc,
  period,
  onPeriod,
}: {
  tc: TimeClass | null;
  points: { t: number; rating: number }[];
  classes: TimeClass[];
  onTc: (tc: TimeClass) => void;
  period: Period;
  onPeriod: (p: Period) => void;
}) {
  const color = tc ? TIME_CLASS_COLORS[tc] : 'var(--viz-1)';
  const last = points[points.length - 1];
  const delta = ratingDelta(points);
  const ratings = points.map((p) => p.rating);
  const lo = ratings.length ? Math.floor((Math.min(...ratings) - 15) / 50) * 50 : 0;
  const hi = ratings.length ? Math.ceil((Math.max(...ratings) + 15) / 50) * 50 : 100;
  const peak = points.reduce<{ t: number; rating: number } | null>((m, p) => (!m || p.rating > m.rating ? p : m), null);
  return (
    <ChartCard
      className="elo-card"
      title={
        <span className="elo-head-figure">
          <span>Courbe d'Elo{tc ? ` · ${TIME_CLASS_LABELS[tc]}` : ''}</span>
          {last && (
            <>
              <span className="big">{last.rating}</span>
              {delta !== null && (
                <span className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
                  {fmtSigned(delta)} {PERIOD_TEXT[period]}
                </span>
              )}
            </>
          )}
        </span>
      }
      subtitle={`Parties classées ${PERIOD_TEXT[period]}${points.length ? ` · ${points.length} parties` : ''}`}
      actions={
        <div className="elo-controls">
          {classes.length > 1 && tc && (
            <Seg<TimeClass> label="Cadence de la courbe" value={tc} onChange={onTc} options={classes.map((c) => ({ id: c, label: TIME_CLASS_LABELS[c] }))} />
          )}
          <Seg<Period> label="Période" value={period} onChange={onPeriod} options={PERIODS} />
        </div>
      }
    >
      {points.length < 2 ? (
        <p className="muted">Pas assez de parties classées sur cette période.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={points} margin={{ top: 28, right: 28, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={fmtShortDate} {...AXIS_PROPS} minTickGap={36} />
            <YAxis domain={[lo, hi]} width={44} {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: 'var(--viz-axis)', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as { t: number; rating: number };
                return <TooltipBox title={fmtDate(p.t)} rows={[{ color, label: 'Elo', value: p.rating }]} />;
              }}
            />
            {peak && peak !== last && (
              <ReferenceLine y={peak.rating} stroke="var(--viz-axis-line)" strokeDasharray="4 4">
                <Label value={`record ${peak.rating}`} position="insideTopLeft" fill="var(--viz-axis)" fontSize={11} />
              </ReferenceLine>
            )}
            <Area
              type="monotone"
              dataKey="rating"
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.12}
              dot={false}
              activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2, fill: color }}
              isAnimationActive={false}
            />
            {last && (
              <ReferenceDot x={last.t} y={last.rating} r={6} fill={color} stroke="var(--surface)" strokeWidth={3} ifOverflow="visible">
                <Label value={last.rating} position="top" offset={10} fill="var(--text)" fontSize={13} fontWeight={700} />
              </ReferenceDot>
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ---------------------------------------------------------------------------
// Graphiques et tableaux secondaires
// ---------------------------------------------------------------------------

function GapChart({ rows }: { rows: ReturnType<typeof byEloGap> }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval="preserveStartEnd" tick={{ ...AXIS_PROPS.tick, fontSize: 11 }} />
        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v} %`} width={44} {...AXIS_PROPS} axisLine={false} />
        <ReferenceLine y={50} stroke="var(--viz-axis)" strokeDasharray="4 4" />
        <Tooltip
          cursor={{ fill: 'var(--viz-hover)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const r = payload[0].payload as (typeof rows)[number];
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
        <Bar dataKey="score" fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
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
        <YAxis type="category" dataKey="label" width={130} {...AXIS_PROPS} axisLine={false} />
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
          maxBarSize={22}
          isAnimationActive={false}
          label={{ position: 'right', fill: 'var(--viz-axis)', fontSize: 12 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

