// Client typé de l'API publique chess.com (https://www.chess.com/news/view/published-data-api).
// Sans authentification, CORS ouvert (Access-Control-Allow-Origin: *).
// Cache localStorage : archives des mois terminés = permanentes, le reste = TTL 10 min.

const BASE = 'https://api.chess.com/pub/player';
const CACHE_PREFIX = 'chessbot:chesscom:v1:';
const USER_KEY = 'chessbot:chesscom-user';
const TTL_MS = 10 * 60 * 1000;
export const DEFAULT_USERNAME = 'zargost';

// ---------------------------------------------------------------------------
// Types (forme confirmée sur l'API réelle, novembre 2026)
// ---------------------------------------------------------------------------

export interface PlayerProfile {
  '@id': string;
  url: string;
  username: string;
  player_id: number;
  avatar?: string;
  name?: string;
  title?: string;
  /** URL de l'API pays, ex. "https://api.chess.com/pub/country/FR". */
  country: string;
  location?: string;
  followers: number;
  /** Timestamps Unix en secondes. */
  joined: number;
  last_online: number;
  status: string;
  league?: string;
  is_streamer?: boolean;
  verified?: boolean;
}

export interface RatingPoint {
  rating: number;
  date: number;
  rd?: number;
  game?: string;
}

export interface RatingStats {
  last: RatingPoint;
  best?: RatingPoint;
  record: { win: number; loss: number; draw: number; time_per_move?: number; timeout_percent?: number };
}

export interface PlayerStats {
  chess_rapid?: RatingStats;
  chess_blitz?: RatingStats;
  chess_bullet?: RatingStats;
  chess_daily?: RatingStats;
  chess960_daily?: RatingStats;
  fide?: number;
  tactics?: { highest?: { rating: number; date: number }; lowest?: { rating: number; date: number } };
  puzzle_rush?: { best?: { total_attempts: number; score: number } };
}

/** Codes de résultat chess.com (côté de chaque joueur). */
export type ResultCode =
  | 'win'
  | 'checkmated'
  | 'agreed'
  | 'repetition'
  | 'timeout'
  | 'resigned'
  | 'stalemate'
  | 'lose'
  | 'insufficient'
  | '50move'
  | 'abandoned'
  | 'kingofthehill'
  | 'threecheck'
  | 'timevsinsufficient'
  | 'bughousepartnerlose';

export interface GamePlayer {
  '@id': string;
  username: string;
  rating: number;
  result: ResultCode;
  uuid?: string;
}

export type TimeClass = 'bullet' | 'blitz' | 'rapid' | 'daily';

export interface ChessComGame {
  url: string;
  pgn: string;
  /** "600", "180+2", "1/259200" (daily). */
  time_control: string;
  /** Timestamp Unix (secondes). */
  end_time: number;
  rated: boolean;
  uuid?: string;
  initial_setup?: string;
  fen: string;
  time_class: TimeClass;
  /** "chess", "chess960", "bughouse"… */
  rules: string;
  white: GamePlayer;
  black: GamePlayer;
  /** URL de l'ouverture chess.com (aussi dans l'en-tête PGN ECOUrl). */
  eco?: string;
  /** Présent seulement si la partie a été revue sur chess.com. */
  accuracies?: { white: number; black: number };
  tcn?: string;
}

// ---------------------------------------------------------------------------
// Erreurs
// ---------------------------------------------------------------------------

export class ChessComError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ChessComError';
  }
}

// ---------------------------------------------------------------------------
// Pseudo mémorisé
// ---------------------------------------------------------------------------

export function normalizeUsername(user: string): string {
  return user.trim().toLowerCase();
}

export function getStoredUsername(): string {
  try {
    return localStorage.getItem(USER_KEY) || DEFAULT_USERNAME;
  } catch {
    return DEFAULT_USERNAME;
  }
}

export function setStoredUsername(user: string): void {
  try {
    localStorage.setItem(USER_KEY, normalizeUsername(user));
  } catch {
    /* stockage indisponible */
  }
}

// ---------------------------------------------------------------------------
// Cache localStorage
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  t: number;
  /** true = immuable (mois terminé). */
  p?: boolean;
  d: T;
}

function cacheGet<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T, permanent: boolean): void {
  const entry: CacheEntry<T> = { t: Date.now(), p: permanent || undefined, d: data };
  const raw = JSON.stringify(entry);
  try {
    localStorage.setItem(CACHE_PREFIX + key, raw);
  } catch {
    // Quota dépassé : on purge les entrées non permanentes puis on réessaie une fois.
    try {
      pruneCache();
      localStorage.setItem(CACHE_PREFIX + key, raw);
    } catch {
      /* tant pis : pas de cache */
    }
  }
}

function pruneCache() {
  const toDelete: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(CACHE_PREFIX)) continue;
    try {
      const e = JSON.parse(localStorage.getItem(k) ?? 'null') as CacheEntry<unknown> | null;
      if (!e?.p) toDelete.push(k);
    } catch {
      toDelete.push(k);
    }
  }
  toDelete.forEach((k) => localStorage.removeItem(k));
}

/** Supprime toutes les données chess.com en cache (ou celles d'un joueur). */
export function clearChessComCache(user?: string): void {
  try {
    const prefix = CACHE_PREFIX + (user ? normalizeUsername(user) : '');
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Requêtes
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string, user: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ChessComError('Impossible de joindre chess.com. Vérifie ta connexion internet.', 0);
  }
  if (res.status === 404) throw new ChessComError(`Le joueur « ${user} » est introuvable sur chess.com.`, 404);
  if (res.status === 429)
    throw new ChessComError('chess.com limite le nombre de requêtes : patiente une minute puis réessaie.', 429);
  if (res.status === 410) throw new ChessComError(`Le compte « ${user} » n'est plus disponible sur chess.com.`, 410);
  if (!res.ok) throw new ChessComError(`Erreur chess.com (HTTP ${res.status}).`, res.status);
  try {
    return (await res.json()) as T;
  } catch {
    throw new ChessComError('Réponse de chess.com illisible.', res.status);
  }
}

async function cachedFetch<T>(
  key: string,
  url: string,
  user: string,
  opts: { permanent?: boolean; force?: boolean; signal?: AbortSignal; transform?: (d: T) => T } = {},
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached && !opts.force && (cached.p || Date.now() - cached.t < TTL_MS)) return cached.d;
  try {
    let data: T = await fetchJson<T>(url, user, opts.signal);
    if (opts.transform) data = opts.transform(data);
    cacheSet(key, data, !!opts.permanent);
    return data;
  } catch (e) {
    // En cas de 429 / réseau, on préfère une donnée périmée à rien.
    if (cached && e instanceof ChessComError && (e.status === 429 || e.status === 0)) return cached.d;
    throw e;
  }
}

export function fetchProfile(user: string, opts: { force?: boolean; signal?: AbortSignal } = {}): Promise<PlayerProfile> {
  const u = normalizeUsername(user);
  return cachedFetch<PlayerProfile>(`${u}:profile`, `${BASE}/${encodeURIComponent(u)}`, u, opts);
}

export function fetchStats(user: string, opts: { force?: boolean; signal?: AbortSignal } = {}): Promise<PlayerStats> {
  const u = normalizeUsername(user);
  return cachedFetch<PlayerStats>(`${u}:stats`, `${BASE}/${encodeURIComponent(u)}/stats`, u, opts);
}

/** URLs des archives mensuelles, triées de la plus ancienne à la plus récente. */
export async function fetchArchives(user: string, opts: { force?: boolean; signal?: AbortSignal } = {}): Promise<string[]> {
  const u = normalizeUsername(user);
  const r = await cachedFetch<{ archives: string[] }>(
    `${u}:archives`,
    `${BASE}/${encodeURIComponent(u)}/games/archives`,
    u,
    opts,
  );
  return r.archives ?? [];
}

/** Année/mois d'une URL d'archive ".../games/2026/10". */
export function archiveMonth(url: string): { year: number; month: number } {
  const m = url.match(/(\d{4})\/(\d{2})\/?$/);
  return m ? { year: +m[1], month: +m[2] } : { year: 0, month: 0 };
}

function isFinishedMonth(year: number, month: number): boolean {
  const now = new Date();
  const cy = now.getUTCFullYear();
  const cm = now.getUTCMonth() + 1;
  // Marge : on considère le mois terminé seulement à partir du 2 du mois suivant (fuseaux horaires).
  if (year < cy || (year === cy && month < cm)) {
    const isPrevMonth = (year === cy && month === cm - 1) || (cm === 1 && year === cy - 1 && month === 12);
    return !(isPrevMonth && now.getUTCDate() < 2);
  }
  return false;
}

/** Parties d'un mois. Mois terminé => cache permanent. */
export async function fetchMonthGames(
  user: string,
  year: number,
  month: number,
  opts: { force?: boolean; signal?: AbortSignal } = {},
): Promise<ChessComGame[]> {
  const u = normalizeUsername(user);
  const mm = String(month).padStart(2, '0');
  const r = await cachedFetch<{ games: ChessComGame[] }>(
    `${u}:games:${year}-${mm}`,
    `${BASE}/${encodeURIComponent(u)}/games/${year}/${mm}`,
    u,
    {
      ...opts,
      permanent: isFinishedMonth(year, month),
      // On retire les champs volumineux inutiles pour économiser le localStorage.
      transform: (d) => ({ games: (d.games ?? []).map(({ tcn: _tcn, ...g }) => g) }),
    },
  );
  return r.games ?? [];
}

/**
 * Charge les archives de la plus récente à la plus ancienne, en appelant onMonth après chaque mois.
 * S'arrête quand `stop(gamesSoFar)` renvoie true (ex. assez de parties).
 */
export async function loadGamesProgressively(
  user: string,
  opts: {
    signal?: AbortSignal;
    onMonth?: (games: ChessComGame[], loadedMonths: number, totalMonths: number) => void;
    stop?: (games: ChessComGame[]) => boolean;
    force?: boolean;
  } = {},
): Promise<ChessComGame[]> {
  const archives = await fetchArchives(user, { signal: opts.signal, force: opts.force });
  const all: ChessComGame[] = [];
  const ordered = [...archives].reverse();
  for (let i = 0; i < ordered.length; i++) {
    if (opts.signal?.aborted) throw new DOMException('Annulé', 'AbortError');
    const { year, month } = archiveMonth(ordered[i]);
    if (!year) continue;
    const games = await fetchMonthGames(user, year, month, { signal: opts.signal, force: opts.force && i === 0 });
    all.push(...games);
    opts.onMonth?.(all, i + 1, ordered.length);
    if (opts.stop?.(all)) break;
  }
  return all;
}

// ---------------------------------------------------------------------------
// Helpers PGN / partie
// ---------------------------------------------------------------------------

export function parsePgnHeaders(pgn: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of pgn.matchAll(/^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/gm)) out[m[1]] = m[2];
  return out;
}

const APOSTROPHES: Record<string, string> = {
  Queens: "Queen's",
  Kings: "King's",
  Petrovs: "Petrov's",
  Alekhines: "Alekhine's",
  Birds: "Bird's",
  Larsens: "Larsen's",
  Philidors: "Philidor's",
  Owens: "Owen's",
  Bishops: "Bishop's",
  Pirc: 'Pirc',
  Nimzowitsch: 'Nimzowitsch',
  Grobs: "Grob's",
  Vant: "Van't",
  Kruijs: 'Kruijs',
};

const FAMILY_END = new Set(['Opening', 'Defense', 'Game', 'Gambit', 'Attack', 'System', 'Countergambit', 'Variation']);

/** Nom lisible depuis une URL ECOUrl : "Scotch-Game-3...exd4-4.Nxd4" → "Scotch Game". */
export function openingNameFromUrl(url: string | undefined): { name: string; family: string; full: string } {
  if (!url) return { name: 'Inconnue', family: 'Inconnue', full: 'Inconnue' };
  const slug = decodeURIComponent(url.split('/openings/')[1] ?? url.split('/').pop() ?? '');
  const tokens = slug.split('-').filter(Boolean);
  const words: string[] = [];
  for (const tok of tokens) {
    if (/^\d/.test(tok)) break; // début des coups ("3...exd4", "2.d4", "1")
    const cut = tok.search(/\.\.\.|\.\d|\d\./); // "Variation...3.Bf4"
    const t = cut >= 0 ? tok.slice(0, cut) : tok;
    if (t) words.push(APOSTROPHES[t] ?? t);
    if (cut >= 0) break;
  }
  while (words.length && /^(with|and|the|of)$/i.test(words[words.length - 1])) words.pop();
  const name = words.join(' ') || 'Inconnue';
  const idx = words.findIndex((w) => FAMILY_END.has(w));
  const family = idx >= 0 ? words.slice(0, idx + 1).join(' ') : name;
  const full = tokens.map((t) => APOSTROPHES[t] ?? t).join(' ');
  return { name, family, full };
}

export interface OpeningInfo {
  eco: string;
  url?: string;
  /** Nom sans les coups : "Queen's Pawn Opening Zukertort Variation". */
  name: string;
  /** Famille : "Queen's Pawn Opening". */
  family: string;
}

export function openingOf(game: Pick<ChessComGame, 'pgn' | 'eco'>, headers = parsePgnHeaders(game.pgn)): OpeningInfo {
  const url = headers.ECOUrl || game.eco;
  const { name, family } = openingNameFromUrl(url);
  return { eco: headers.ECO || '?', url, name, family };
}

export type Outcome = 'win' | 'loss' | 'draw';

export type EndReason =
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'abandoned'
  | 'agreed'
  | 'repetition'
  | 'stalemate'
  | 'insufficient'
  | '50move'
  | 'timevsinsufficient'
  | 'other';

export const END_REASON_LABELS: Record<EndReason, string> = {
  checkmate: 'Mat',
  resignation: 'Abandon',
  timeout: 'Au temps',
  abandoned: 'Partie abandonnée',
  agreed: 'Nulle par accord',
  repetition: 'Répétition',
  stalemate: 'Pat',
  insufficient: 'Matériel insuffisant',
  '50move': 'Règle des 50 coups',
  timevsinsufficient: 'Temps vs matériel insuffisant',
  other: 'Autre',
};

export const OUTCOME_LABELS: Record<Outcome, string> = { win: 'Victoire', loss: 'Défaite', draw: 'Nulle' };

export const TIME_CLASS_LABELS: Record<TimeClass, string> = {
  bullet: 'Bullet',
  blitz: 'Blitz',
  rapid: 'Rapide',
  daily: 'Par jour',
};

function reasonFromCode(code: ResultCode): EndReason {
  switch (code) {
    case 'checkmated':
      return 'checkmate';
    case 'resigned':
      return 'resignation';
    case 'timeout':
      return 'timeout';
    case 'abandoned':
      return 'abandoned';
    case 'agreed':
      return 'agreed';
    case 'repetition':
      return 'repetition';
    case 'stalemate':
      return 'stalemate';
    case 'insufficient':
      return 'insufficient';
    case '50move':
      return '50move';
    case 'timevsinsufficient':
      return 'timevsinsufficient';
    default:
      return 'other';
  }
}

const DRAW_CODES = new Set<ResultCode>(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient']);

/** Couleur jouée par `user` dans la partie (null s'il n'y a pas joué). */
export function colorOf(game: Pick<ChessComGame, 'white' | 'black'>, user: string): 'white' | 'black' | null {
  const u = normalizeUsername(user);
  if (game.white.username.toLowerCase() === u) return 'white';
  if (game.black.username.toLowerCase() === u) return 'black';
  return null;
}

/** Résultat du point de vue du joueur + motif de fin. */
export function outcomeOf(game: ChessComGame, color: 'white' | 'black'): { outcome: Outcome; reason: EndReason } {
  const me = game[color];
  const opp = game[color === 'white' ? 'black' : 'white'];
  if (me.result === 'win') return { outcome: 'win', reason: reasonFromCode(opp.result) };
  if (opp.result === 'win') return { outcome: 'loss', reason: reasonFromCode(me.result) };
  if (DRAW_CODES.has(me.result)) return { outcome: 'draw', reason: reasonFromCode(me.result) };
  return { outcome: 'draw', reason: 'other' };
}

/** Temps initial en secondes d'une cadence "600" / "180+2" (null pour daily). */
export function baseTimeSeconds(timeControl: string): number | null {
  if (timeControl.includes('/')) return null;
  const base = parseInt(timeControl.split('+')[0], 10);
  return Number.isFinite(base) ? base : null;
}

export function formatTimeControl(tc: string): string {
  if (tc.includes('/')) {
    const secs = parseInt(tc.split('/')[1], 10);
    return `${Math.round(secs / 86400)} j/coup`;
  }
  const [b, inc] = tc.split('+').map((x) => parseInt(x, 10));
  const min = b / 60;
  const base = min >= 1 ? `${Number.isInteger(min) ? min : min.toFixed(1)} min` : `${b} s`;
  return inc ? `${base} + ${inc} s` : base;
}

/** Résumé d'une partie du point de vue d'un joueur. */
export interface GameSummary {
  url: string;
  /** Identifiant court (dernier segment de l'URL). */
  id: string;
  endTime: number; // ms
  timeClass: TimeClass;
  timeControl: string;
  rated: boolean;
  rules: string;
  color: 'white' | 'black';
  outcome: Outcome;
  reason: EndReason;
  myRating: number;
  oppRating: number;
  opponent: string;
  opening: OpeningInfo;
  accuracy?: { me: number; opp: number };
  pgn: string;
}

export function gameId(url: string): string {
  return url.split('/').filter(Boolean).pop() ?? url;
}

export function summarize(game: ChessComGame, user: string): GameSummary | null {
  const color = colorOf(game, user);
  if (!color) return null;
  const opp = color === 'white' ? 'black' : 'white';
  const { outcome, reason } = outcomeOf(game, color);
  return {
    url: game.url,
    id: gameId(game.url),
    endTime: game.end_time * 1000,
    timeClass: game.time_class,
    timeControl: game.time_control,
    rated: game.rated,
    rules: game.rules,
    color,
    outcome,
    reason,
    myRating: game[color].rating,
    oppRating: game[opp].rating,
    opponent: game[opp].username,
    opening: openingOf(game),
    accuracy: game.accuracies ? { me: game.accuracies[color], opp: game.accuracies[opp] } : undefined,
    pgn: game.pgn,
  };
}

/** Résume et trie (plus récente d'abord) les parties d'échecs standard. */
export function summarizeAll(games: ChessComGame[], user: string): GameSummary[] {
  const out: GameSummary[] = [];
  for (const g of games) {
    if (g.rules !== 'chess') continue;
    const s = summarize(g, user);
    if (s) out.push(s);
  }
  return out.sort((a, b) => b.endTime - a.endTime);
}

/** Les N dernières parties (standard), éventuellement filtrées par cadence. */
export async function fetchRecentGames(
  user: string,
  count: number,
  opts: { timeClass?: TimeClass | 'all'; signal?: AbortSignal; force?: boolean } = {},
): Promise<GameSummary[]> {
  const keep = (s: GameSummary) => !opts.timeClass || opts.timeClass === 'all' || s.timeClass === opts.timeClass;
  const games = await loadGamesProgressively(user, {
    signal: opts.signal,
    force: opts.force,
    stop: (all) => summarizeAll(all, user).filter(keep).length >= count,
  });
  return summarizeAll(games, user).filter(keep).slice(0, count);
}

/** Code pays depuis l'URL de l'API ("…/country/FR" → "FR"). */
export function countryCode(countryUrl: string | undefined): string {
  return countryUrl?.split('/').pop() ?? '';
}

/** Nom du pays en français via Intl (repli : code). */
export function countryName(code: string): string {
  if (!code || code.length !== 2) return code;
  try {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
