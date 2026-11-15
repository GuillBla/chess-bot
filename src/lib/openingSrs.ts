// Mémorisation des ouvertures par répétition espacée (système de Leitner).
// Une « carte » = une position de l'arbre où c'est à nous de jouer ; la réponse attendue = le coup du répertoire.
// Bien répondu : la carte monte d'une boîte et revient de plus en plus tard. Raté : retour en boîte 1, à revoir aujourd'hui.
// Stockage localStorage, tolérant aux erreurs (navigation privée…).
import { useCallback, useEffect, useState } from 'react';

const KEY = 'chessbot.openings.srs.v1';
const EVENT = 'chessbot-openings-srs';

/** Délai avant la prochaine révision, selon la boîte atteinte (en jours). Boîte 0 = jamais vue. */
export const BOX_DAYS = [0, 1, 3, 7, 16, 35, 90];
export const MAX_BOX = BOX_DAYS.length - 1;
/** À partir de cette boîte, la position est considérée comme maîtrisée. */
export const MASTERED_BOX = 4;

export interface Card {
  box: number;
  /** Prochaine révision (ms depuis epoch). */
  due: number;
  /** Nombre de réponses et d'erreurs (statistiques). */
  reps: number;
  lapses: number;
  last: number;
}

/** { [openingId]: { [nodeId]: Card } } */
export type SrsState = Record<string, Record<string, Card>>;

const DAY = 24 * 3600 * 1000;

function load(): SrsState {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data === 'object' ? (data as SrsState) : {};
  } catch {
    return {};
  }
}

let memory: SrsState | null = null;
const state = () => (memory ??= load());

function save(s: SrsState) {
  memory = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* stockage indisponible : on garde en mémoire */
  }
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function getCard(openingId: string, nodeId: string): Card | undefined {
  return state()[openingId]?.[nodeId];
}

/** Début de la journée suivante + n jours : une carte « à revoir dans 1 jour » est due dès demain matin. */
function dueIn(days: number, now: number): number {
  if (days <= 0) return now;
  const d = new Date(now);
  d.setHours(4, 0, 0, 0);
  return d.getTime() + days * DAY;
}

/**
 * Enregistre une réponse.
 * - `good` : bonne réponse du premier coup → boîte suivante ;
 * - `hard` : trouvée avec un indice → même boîte (au moins 1), revue demain ;
 * - `again` : ratée → boîte 1, à revoir aujourd'hui.
 */
export function grade(openingId: string, nodeId: string, result: 'good' | 'hard' | 'again', now = Date.now()) {
  const s = { ...state() };
  const op = { ...(s[openingId] ?? {}) };
  const prev = op[nodeId];
  const box = prev?.box ?? 0;
  let next: number;
  let due: number;
  if (result === 'good') {
    // Une carte encore due monte d'une boîte ; revue en avance (pas due), elle ne monte pas.
    next = !prev || prev.due <= now ? Math.min(MAX_BOX, box + 1) : box;
    due = dueIn(BOX_DAYS[next], now);
  } else if (result === 'hard') {
    next = Math.max(1, box);
    due = dueIn(1, now);
  } else {
    next = 1;
    due = now;
  }
  op[nodeId] = {
    box: next,
    due,
    reps: (prev?.reps ?? 0) + 1,
    lapses: (prev?.lapses ?? 0) + (result === 'again' ? 1 : 0),
    last: now,
  };
  s[openingId] = op;
  save(s);
}

export function resetOpening(openingId: string) {
  const s = { ...state() };
  delete s[openingId];
  save(s);
}

export interface OpeningStats {
  total: number;
  /** Positions déjà vues au moins une fois. */
  learned: number;
  mastered: number;
  due: number;
}

export function statsFor(s: SrsState, openingId: string, nodeIds: string[], now = Date.now()): OpeningStats {
  const op = s[openingId] ?? {};
  let learned = 0;
  let mastered = 0;
  let due = 0;
  for (const id of nodeIds) {
    const c = op[id];
    if (!c) continue;
    learned++;
    if (c.box >= MASTERED_BOX) mastered++;
    if (c.due <= now) due++;
  }
  return { total: nodeIds.length, learned, mastered, due };
}

/** Hook : état de la mémorisation, rafraîchi à chaque réponse. */
export function useSrs(): SrsState {
  const [s, setS] = useState<SrsState>(() => state());
  const refresh = useCallback(() => setS({ ...state() }), []);
  useEffect(() => {
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, [refresh]);
  return s;
}
