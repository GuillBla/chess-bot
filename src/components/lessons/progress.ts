// Progression des exercices (localStorage, tolérant aux erreurs : navigation privée, stockage bloqué…).
import { useCallback, useEffect, useState } from 'react';

const KEY = 'chessbot.lessons.progress.v1';
const EVENT = 'chessbot-lessons-progress';

/** { [lessonId]: indices des exercices réussis } */
export type Progress = Record<string, number[]>;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? (data as Progress) : {};
  } catch {
    return {};
  }
}

function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* stockage indisponible : la progression reste en mémoire pour la session */
  }
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

let memory: Progress | null = null;

function current(): Progress {
  if (!memory) memory = loadProgress();
  return memory;
}

export function markSolved(lessonId: string, index: number) {
  const p = { ...current() };
  const set = new Set(p[lessonId] ?? []);
  if (set.has(index)) return;
  set.add(index);
  p[lessonId] = [...set].sort((a, b) => a - b);
  memory = p;
  saveProgress(p);
}

export function resetLessonProgress(lessonId: string) {
  const p = { ...current() };
  delete p[lessonId];
  memory = p;
  saveProgress(p);
}

/** Hook : progression courante, mise à jour quand un exercice est réussi. */
export function useProgress(): Progress {
  const [p, setP] = useState<Progress>(() => current());
  const refresh = useCallback(() => setP({ ...current() }), []);
  useEffect(() => {
    window.addEventListener(EVENT, refresh);
    return () => window.removeEventListener(EVENT, refresh);
  }, [refresh]);
  return p;
}
