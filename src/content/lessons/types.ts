// Modèle de données des leçons du Professeur.
// Toutes les positions et tous les coups sont vérifiés par src/content/lessons/lessons.test.ts
// (légalité) et ont été contrôlés avec Stockfish (exercices : coup unique ou acceptAlso complet).
import type { BoardArrow, SquareMark } from '../../analysis/types';

export type LessonLevel = '1200-1500' | '1500-1800' | '1800+';

/** Bloc de texte : une suite de paragraphes. `**gras**` et `*italique*` sont rendus. */
export interface TextSection {
  type: 'text';
  title?: string;
  paragraphs: string[];
}

/** Une étape rejouable d'une position commentée. */
export interface MoveStep {
  /** Coup en notation UCI (ex. "e2e4", "e7e8q"). */
  uci: string;
  comment: string;
}

/** Position commentée, affichée sur un échiquier non interactif. */
export interface PositionSection {
  type: 'position';
  title?: string;
  fen: string;
  orientation?: 'white' | 'black';
  /** Commentaire de la position de départ. */
  caption: string;
  /** Flèches / marques affichées sur la position de départ. */
  arrows?: BoardArrow[];
  marks?: SquareMark[];
  /** Coups rejouables pas à pas (◀ ▶), chacun avec son commentaire. */
  moves?: MoveStep[];
}

export type LessonSection = TextSection | PositionSection;

export interface Exercise {
  title?: string;
  fen: string;
  /** Consigne affichée au-dessus de l'échiquier. */
  prompt: string;
  /** Ligne principale en UCI : coups du joueur ET réponses de l'adversaire, en alternance. */
  solution: string[];
  /** Premiers coups alternatifs acceptés (aussi bons selon Stockfish). */
  acceptAlso?: string[];
  /** Pourquoi c'est le bon coup, et pourquoi le piège tentant ne marche pas. */
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: LessonLevel;
  summary: string;
  sections: LessonSection[];
  exercises: Exercise[];
}
