// Préférences d'affichage partagées (thème, échiquier, sons), mémorisées dans localStorage.
import { useSyncExternalStore } from 'react';

export type ThemePref = 'auto' | 'light' | 'dark';
export type BoardTheme = 'bois' | 'analyse' | 'classique' | 'marbre';

export interface Preferences {
  theme: ThemePref;
  board: BoardTheme;
  sound: boolean;
  coordinates: boolean;
}

export const BOARD_THEMES: { id: BoardTheme; label: string; light: string; dark: string }[] = [
  { id: 'bois', label: 'Bois', light: '#ead3a8', dark: '#b27c4e' },
  { id: 'analyse', label: 'Analyse', light: '#dee3e6', dark: '#8ca2ad' },
  { id: 'classique', label: 'Club', light: '#ebecd0', dark: '#779556' },
  { id: 'marbre', label: 'Marbre', light: '#e8e6e1', dark: '#a3a09a' },
];

const KEY = 'chessbot:prefs';
const DEFAULTS: Preferences = { theme: 'auto', board: 'bois', sound: true, coordinates: true };

function load(): Preferences {
  try {
    const raw = localStorage.getItem(KEY);
    // compatibilité avec l'ancien réglage de thème
    const legacyTheme = localStorage.getItem('theme') as ThemePref | null;
    const parsed = raw ? (JSON.parse(raw) as Partial<Preferences>) : {};
    return { ...DEFAULTS, ...(legacyTheme ? { theme: legacyTheme } : {}), ...parsed };
  } catch {
    return DEFAULTS;
  }
}

let state: Preferences = load();
const listeners = new Set<() => void>();

function apply(p: Preferences) {
  const root = document.documentElement;
  if (p.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', p.theme);
  root.setAttribute('data-board', p.board);
}
if (typeof document !== 'undefined') apply(state);

export function setPreferences(patch: Partial<Preferences>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* stockage indisponible */
  }
  apply(state);
  listeners.forEach((l) => l());
}

export function getPreferences(): Preferences {
  return state;
}

export function usePreferences(): Preferences {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}
