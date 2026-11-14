// Calculs purs des statistiques de la page « Mes statistiques ».
import { END_REASON_LABELS, TIME_CLASS_LABELS, type EndReason, type GameSummary, type TimeClass } from '../../api/chesscom';

export interface Wdl {
  win: number;
  draw: number;
  loss: number;
  total: number;
  /** Score en % : (V + N/2) / total. */
  score: number;
}

export function wdlOf(games: GameSummary[]): Wdl {
  let win = 0;
  let draw = 0;
  let loss = 0;
  for (const g of games) {
    if (g.outcome === 'win') win++;
    else if (g.outcome === 'draw') draw++;
    else loss++;
  }
  const total = games.length;
  return { win, draw, loss, total, score: total ? ((win + draw / 2) / total) * 100 : 0 };
}

/** Ligne prête pour un graphique empilé en % (V/N/D). */
export function wdlRow(label: string, games: GameSummary[]) {
  const w = wdlOf(games);
  const pct = (n: number) => (w.total ? (n / w.total) * 100 : 0);
  return { label, ...w, winPct: pct(w.win), drawPct: pct(w.draw), lossPct: pct(w.loss) };
}
export type WdlRow = ReturnType<typeof wdlRow>;

export const TIME_CLASSES: TimeClass[] = ['rapid', 'blitz', 'bullet', 'daily'];

export function byTimeClass(games: GameSummary[]): WdlRow[] {
  return TIME_CLASSES.map((tc) => wdlRow(TIME_CLASS_LABELS[tc], games.filter((g) => g.timeClass === tc))).filter((r) => r.total > 0);
}

export function byColor(games: GameSummary[]): WdlRow[] {
  return [wdlRow('Blancs', games.filter((g) => g.color === 'white')), wdlRow('Noirs', games.filter((g) => g.color === 'black'))];
}

export interface OpeningRow extends Wdl {
  name: string;
  eco: string;
}

export function topOpenings(games: GameSummary[], color: 'white' | 'black', n = 8): OpeningRow[] {
  const map = new Map<string, GameSummary[]>();
  for (const g of games) {
    if (g.color !== color) continue;
    const k = g.opening.family;
    map.set(k, [...(map.get(k) ?? []), g]);
  }
  return [...map.entries()]
    .map(([name, gs]) => {
      const ecos = new Map<string, number>();
      gs.forEach((g) => ecos.set(g.opening.eco, (ecos.get(g.opening.eco) ?? 0) + 1));
      const eco = [...ecos.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
      return { name, eco, ...wdlOf(gs) };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

export function endReasons(games: GameSummary[], outcome: 'win' | 'loss') {
  const map = new Map<EndReason, number>();
  const sub = games.filter((g) => g.outcome === outcome);
  for (const g of sub) map.set(g.reason, (map.get(g.reason) ?? 0) + 1);
  return [...map.entries()]
    .map(([reason, count]) => ({ reason, label: END_REASON_LABELS[reason], count, pct: sub.length ? (count / sub.length) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

export const GAP_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: '< −200', min: -Infinity, max: -200 },
  { label: '−200 à −100', min: -200, max: -100 },
  { label: '−100 à −50', min: -100, max: -50 },
  { label: '−50 à 0', min: -50, max: 0 },
  { label: '0 à +50', min: 0, max: 50 },
  { label: '+50 à +100', min: 50, max: 100 },
  { label: '+100 à +200', min: 100, max: 200 },
  { label: '> +200', min: 200, max: Infinity },
];

/** Performance selon l'écart d'Elo (adversaire − moi) : positif = adversaire plus fort. */
export function byEloGap(games: GameSummary[]) {
  return GAP_BUCKETS.map((b) => {
    const gs = games.filter((g) => {
      const d = g.oppRating - g.myRating;
      return d >= b.min && d < b.max;
    });
    return { label: b.label, ...wdlOf(gs) };
  });
}

export function activityByMonth(games: GameSummary[]) {
  const map = new Map<string, Record<TimeClass, number>>();
  for (const g of games) {
    const d = new Date(g.endTime);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const row = map.get(k) ?? { rapid: 0, blitz: 0, bullet: 0, daily: 0 };
    row[g.timeClass] = (row[g.timeClass] ?? 0) + 1;
    map.set(k, row);
  }
  const keys = [...map.keys()].sort();
  if (keys.length === 0) return [];
  // Comble les mois sans partie pour une échelle de temps honnête.
  const out: ({ month: string; label: string; total: number } & Record<TimeClass, number>)[] = [];
  let [y, m] = keys[0].split('-').map(Number);
  const [ly, lm] = keys[keys.length - 1].split('-').map(Number);
  while (y < ly || (y === ly && m <= lm)) {
    const k = `${y}-${String(m).padStart(2, '0')}`;
    const row = map.get(k) ?? { rapid: 0, blitz: 0, bullet: 0, daily: 0 };
    const label = new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    out.push({ month: k, label, total: row.rapid + row.blitz + row.bullet + row.daily, ...row });
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return out;
}

export function ratingSeries(games: GameSummary[], since: number) {
  const out: Record<TimeClass, { t: number; rating: number }[]> = { rapid: [], blitz: [], bullet: [], daily: [] };
  for (const g of games) {
    if (!g.rated || g.endTime < since) continue;
    out[g.timeClass]?.push({ t: g.endTime, rating: g.myRating });
  }
  for (const k of TIME_CLASSES) out[k].sort((a, b) => a.t - b.t);
  return out;
}

const pct = (x: number) => `${Math.round(x)} %`;

/** Insights textuels calculés (aucune génération libre : uniquement des règles). */
export function insights(games: GameSummary[]): string[] {
  const out: string[] = [];
  if (games.length < 10) return out;
  const [w, b] = byColor(games);
  if (w.total >= 5 && b.total >= 5) {
    const diff = w.score - b.score;
    if (Math.abs(diff) >= 5)
      out.push(
        `Tu marques ${pct(w.score)} avec les Blancs mais ${pct(b.score)} avec les Noirs : ${diff > 0 ? 'ton répertoire avec les Noirs' : 'ton répertoire avec les Blancs'} mérite du travail.`,
      );
    else out.push(`Tes résultats sont équilibrés : ${pct(w.score)} avec les Blancs, ${pct(b.score)} avec les Noirs.`);
  }
  const losses = games.filter((g) => g.outcome === 'loss');
  if (losses.length >= 5) {
    const time = losses.filter((g) => g.reason === 'timeout').length / losses.length;
    if (time >= 0.1) out.push(`${pct(time * 100)} de tes défaites sont au temps : la gestion de la pendule te coûte des points.`);
    const mate = losses.filter((g) => g.reason === 'checkmate').length / losses.length;
    if (mate >= 0.3) out.push(`${pct(mate * 100)} de tes défaites se terminent par un mat : la sécurité du roi est un axe de progrès.`);
  }
  const wins = games.filter((g) => g.outcome === 'win');
  if (wins.length >= 5) {
    const t = wins.filter((g) => g.reason === 'timeout').length / wins.length;
    if (t >= 0.15) out.push(`${pct(t * 100)} de tes victoires sont au temps : tu sais mettre la pression à la pendule.`);
  }
  for (const color of ['white', 'black'] as const) {
    const ops = topOpenings(games, color, 20).filter((o) => o.total >= 5);
    if (ops.length >= 2) {
      const best = [...ops].sort((a, b2) => b2.score - a.score)[0];
      const worst = [...ops].sort((a, b2) => a.score - b2.score)[0];
      const side = color === 'white' ? 'avec les Blancs' : 'avec les Noirs';
      out.push(`Ta meilleure ouverture ${side} : ${best.name} (${pct(best.score)} sur ${best.total} parties).`);
      if (worst.name !== best.name && worst.score < 45)
        out.push(`Ouverture à revoir ${side} : ${worst.name} (${pct(worst.score)} sur ${worst.total} parties).`);
    }
  }
  const gap = byEloGap(games);
  const stronger = gap.filter((g, i) => i >= 5 && g.total > 0);
  const strongerAll = stronger.reduce((a, g) => ({ s: a.s + g.win + g.draw / 2, n: a.n + g.total }), { s: 0, n: 0 });
  if (strongerAll.n >= 5)
    out.push(
      `Contre des adversaires classés 50 points ou plus au-dessus de toi, tu marques ${pct((strongerAll.s / strongerAll.n) * 100)} (${strongerAll.n} parties).`,
    );
  const tc = byTimeClass(games).filter((r) => r.total >= 10);
  if (tc.length >= 2) {
    const best = [...tc].sort((a, b2) => b2.score - a.score)[0];
    out.push(`Ta cadence la plus rentable : ${best.label.toLowerCase()} (${pct(best.score)} de score).`);
  }
  return out;
}
