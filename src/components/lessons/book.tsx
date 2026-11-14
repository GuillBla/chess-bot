// Mise en page « livre d'échecs » des leçons : parties, chapitres, sources des diagrammes.
// Uniquement de l'affichage : le contenu échiquéen (FEN, coups, solutions) n'est jamais modifié.
import type { Lesson, LessonLevel } from '../../content/lessons/types';
import { PieceIcon } from '../pieces';

export const BASE = '/teacher/lessons';

export interface Part {
  level: LessonLevel;
  roman: string;
  range: string;
  intro: string;
}

/** Les trois parties du livre, dans l'ordre de progression. */
export const PARTS: Part[] = [
  {
    level: '1200-1500',
    roman: 'I',
    range: '1200–1500',
    intro: 'Les outils qui font la différence dès maintenant : calcul, tactique combinée, pièces, finales de pions.',
  },
  {
    level: '1500-1800',
    roman: 'II',
    range: '1500–1800',
    intro: 'Plans de milieu de partie, attaque, finales de tours, conversion et défense.',
  },
  {
    level: '1800+',
    roman: 'III',
    range: '1800 et plus',
    intro: 'Penser comme un fort joueur : prophylaxie, dynamique contre statique.',
  },
];

export function partOf(level: LessonLevel): Part {
  return PARTS.find((p) => p.level === level) ?? PARTS[0];
}

/** « Partie I · 1200–1500 » */
export function partLabel(level: LessonLevel): string {
  const p = partOf(level);
  return `Partie ${p.roman} · ${p.range}`;
}

/** Numéro de chapitre = rang dans le catalogue (l'ordre du catalogue est la progression conseillée). */
export function chapterNumber(lessons: Lesson[], lesson: Lesson): number {
  return lessons.indexOf(lesson) + 1;
}

/**
 * Sépare la source d'un titre de diagramme quand c'est une partie ou une étude datée.
 * « Rotlewi – Rubinstein, Łódź 1907 : une ligne forcée » → { source: « Rotlewi – Rubinstein, Łódź 1907 », title: « une ligne forcée » }
 * « Lasker – Bauer, Amsterdam 1889 » → { source: « Lasker – Bauer, Amsterdam 1889 », title: '' }
 */
export function splitSource(raw: string | undefined): { title: string; source?: string } {
  if (!raw) return { title: '' };
  const idx = raw.indexOf(' : ');
  const head = idx >= 0 ? raw.slice(0, idx) : raw;
  const tail = idx >= 0 ? raw.slice(idx + 3) : '';
  const dated = /\b(1[5-9]|20)\d{2}\b/.test(head);
  if (!dated) return { title: raw };
  const title = tail ? tail.charAt(0).toUpperCase() + tail.slice(1) : '';
  return { title, source: head };
}

/** Indicateur du camp au trait : petit roi + « Les Blancs jouent ». */
export function TurnIndicator({ fen, label }: { fen: string; label?: string }) {
  const black = fen.split(' ')[1] === 'b';
  return (
    <span className={`turn-ind ${black ? 'is-black' : 'is-white'}`}>
      <PieceIcon piece={black ? 'bK' : 'wK'} size={20} />
      <span>{label ?? (black ? 'Les Noirs jouent' : 'Les Blancs jouent')}</span>
    </span>
  );
}

/** Petites icônes de navigation (SVG en currentColor : pas d'émoji, rendu identique partout). */
export function NavIcon({ kind }: { kind: 'first' | 'prev' | 'next' | 'last' }) {
  const d = {
    first: 'M5 4v12M15 4l-6 6 6 6',
    prev: 'M12 4l-6 6 6 6',
    next: 'M8 4l6 6-6 6',
    last: 'M15 4v12M5 4l6 6-6 6',
  }[kind];
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
