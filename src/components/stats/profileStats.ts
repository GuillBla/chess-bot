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

/** Variation d'Elo sur la période (premier → dernier point classé). */
export function ratingDelta(points: { t: number; rating: number }[]): number | null {
  if (points.length < 2) return null;
  return points[points.length - 1].rating - points[0].rating;
}

/** Série en cours (parties les plus récentes de même issue), plus longue série de victoires, 10 derniers résultats. */
export function streaks(games: GameSummary[]) {
  const sorted = [...games].sort((a, b) => b.endTime - a.endTime);
  let current: { outcome: GameSummary['outcome']; count: number } | null = null;
  for (const g of sorted) {
    if (!current) current = { outcome: g.outcome, count: 1 };
    else if (g.outcome === current.outcome) current.count++;
    else break;
  }
  let bestWin = 0;
  let run = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    run = sorted[i].outcome === 'win' ? run + 1 : 0;
    bestWin = Math.max(bestWin, run);
  }
  return { current, bestWin, recent: sorted.slice(0, 10).map((g) => g.outcome) };
}

/** Ouverture la plus jouée (toutes couleurs), avec son score. */
export function favoriteOpening(games: GameSummary[]): (OpeningRow & { color: 'white' | 'black' }) | null {
  const all = [
    ...topOpenings(games, 'white', 1).map((o) => ({ ...o, color: 'white' as const })),
    ...topOpenings(games, 'black', 1).map((o) => ({ ...o, color: 'black' as const })),
  ].sort((a, b) => b.total - a.total);
  return all[0] ?? null;
}

export interface WeakPoint {
  title: string;
  figure: string;
  detail: string;
}

/** Point faible le plus saillant, choisi par règles (ouverture, couleur, pendule, mat). */
export function weakPoint(games: GameSummary[]): WeakPoint | null {
  if (games.length < 10) return null;
  const cands: (WeakPoint & { severity: number })[] = [];
  for (const color of ['white', 'black'] as const) {
    const worst = topOpenings(games, color, 20)
      .filter((o) => o.total >= 5)
      .sort((a, b) => a.score - b.score)[0];
    if (worst && worst.score < 45)
      cands.push({
        title: worst.name,
        figure: pct(worst.score),
        detail: `de score avec les ${color === 'white' ? 'Blancs' : 'Noirs'} sur ${worst.total} parties : ouverture à revoir.`,
        severity: 50 - worst.score,
      });
  }
  const [w, b] = byColor(games);
  if (w.total >= 5 && b.total >= 5 && Math.abs(w.score - b.score) >= 6) {
    const weak = w.score < b.score ? w : b;
    const strong = weak === w ? b : w;
    cands.push({
      title: `Avec les ${weak.label}`,
      figure: pct(weak.score),
      detail: `de score avec les ${weak.label}, contre ${pct(strong.score)} avec les ${strong.label}.`,
      severity: Math.abs(w.score - b.score),
    });
  }
  const losses = games.filter((g) => g.outcome === 'loss');
  if (losses.length >= 5) {
    const time = losses.filter((g) => g.reason === 'timeout').length / losses.length;
    if (time >= 0.15) cands.push({ title: 'La pendule', figure: pct(time * 100), detail: 'de tes défaites sont au temps.', severity: time * 40 });
    const mate = losses.filter((g) => g.reason === 'checkmate').length / losses.length;
    if (mate >= 0.35)
      cands.push({ title: 'La sécurité du roi', figure: pct(mate * 100), detail: 'de tes défaites se terminent par un mat.', severity: mate * 25 });
  }
  cands.sort((a, b2) => b2.severity - a.severity);
  const top = cands[0];
  return top ? { title: top.title, figure: top.figure, detail: top.detail } : null;
}

export interface Insight {
  /** Chiffre clé mis en avant. */
  figure: string;
  /** Phrase qui suit le chiffre. */
  text: string;
  tone: 'good' | 'bad' | 'neutral';
}

/** Insights textuels calculés (aucune génération libre : uniquement des règles). */
export function insights(games: GameSummary[]): Insight[] {
  const out: Insight[] = [];
  if (games.length < 10) return out;
  const [w, b] = byColor(games);
  if (w.total >= 5 && b.total >= 5) {
    const diff = w.score - b.score;
    if (Math.abs(diff) >= 5)
      out.push({
        figure: `${Math.round(Math.abs(diff))} pts`,
        text: `d'écart de score entre les couleurs (${pct(w.score)} avec les Blancs, ${pct(b.score)} avec les Noirs) : ton répertoire avec les ${diff > 0 ? 'Noirs' : 'Blancs'} mérite du travail.`,
        tone: 'bad',
      });
    else
      out.push({
        figure: pct((w.score + b.score) / 2),
        text: `de score, équilibré selon la couleur : ${pct(w.score)} avec les Blancs, ${pct(b.score)} avec les Noirs.`,
        tone: 'neutral',
      });
  }
  const losses = games.filter((g) => g.outcome === 'loss');
  if (losses.length >= 5) {
    const time = losses.filter((g) => g.reason === 'timeout').length / losses.length;
    if (time >= 0.1) out.push({ figure: pct(time * 100), text: 'de tes défaites sont au temps : la gestion de la pendule te coûte des points.', tone: 'bad' });
    const mate = losses.filter((g) => g.reason === 'checkmate').length / losses.length;
    if (mate >= 0.3) out.push({ figure: pct(mate * 100), text: 'de tes défaites se terminent par un mat : la sécurité du roi est un axe de progrès.', tone: 'bad' });
  }
  const wins = games.filter((g) => g.outcome === 'win');
  if (wins.length >= 5) {
    const t = wins.filter((g) => g.reason === 'timeout').length / wins.length;
    if (t >= 0.15) out.push({ figure: pct(t * 100), text: 'de tes victoires sont au temps : tu sais mettre la pression à la pendule.', tone: 'good' });
  }
  for (const color of ['white', 'black'] as const) {
    const ops = topOpenings(games, color, 20).filter((o) => o.total >= 5);
    if (ops.length >= 2) {
      const best = [...ops].sort((a, b2) => b2.score - a.score)[0];
      const worst = [...ops].sort((a, b2) => a.score - b2.score)[0];
      const side = color === 'white' ? 'avec les Blancs' : 'avec les Noirs';
      out.push({ figure: pct(best.score), text: `de score ${side} dans ta meilleure ouverture : ${best.name} (${best.total} parties).`, tone: 'good' });
      if (worst.name !== best.name && worst.score < 45)
        out.push({ figure: pct(worst.score), text: `seulement ${side} dans : ${worst.name} (${worst.total} parties). Ouverture à revoir.`, tone: 'bad' });
    }
  }
  const gap = byEloGap(games);
  const stronger = gap.filter((g, i) => i >= 5 && g.total > 0);
  const strongerAll = stronger.reduce((a, g) => ({ s: a.s + g.win + g.draw / 2, n: a.n + g.total }), { s: 0, n: 0 });
  if (strongerAll.n >= 5) {
    const sc = (strongerAll.s / strongerAll.n) * 100;
    out.push({
      figure: pct(sc),
      text: `de score contre des adversaires classés 50 points ou plus au-dessus de toi (${strongerAll.n} parties).`,
      tone: sc >= 40 ? 'good' : 'neutral',
    });
  }
  const tc = byTimeClass(games).filter((r) => r.total >= 10);
  if (tc.length >= 2) {
    const best = [...tc].sort((a, b2) => b2.score - a.score)[0];
    out.push({ figure: pct(best.score), text: `de score en ${best.label.toLowerCase()} : ta cadence la plus rentable.`, tone: 'good' });
  }
  return out;
}
