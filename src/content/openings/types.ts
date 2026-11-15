// Modèle de données de la section Ouvertures.
// Le répertoire de chaque ouverture s'écrit en PGN commenté (variantes entre parenthèses) : voir src/lib/openingTree.ts.
// Toutes les lignes sont vérifiées par openings.test.ts (légalité, commentaires présents).
import type { Exercise, LessonSection } from '../lessons/types';

export type OpeningSide = 'white' | 'black';

/**
 * - `repertoire` : une ouverture à jouer soi-même (mémorisation conseillée) ;
 * - `culture` : une ouverture qu'on rencontre en face, à connaître pour comprendre les plans adverses.
 */
export type OpeningFamily = 'repertoire' | 'culture';

export interface Opening {
  id: string;
  /** Nom affiché : « Système de Londres ». */
  name: string;
  /** Le camp que l'on joue dans cette ouverture (les coups de ce camp sont ceux à mémoriser). */
  side: OpeningSide;
  family: OpeningFamily;
  /** Contre quoi : « 1.d4 avec les Blancs », « contre 1.e4 »… */
  against: string;
  /** Code(s) ECO indicatif(s) : « D02, A46 ». */
  eco?: string;
  /** Résumé en une ou deux phrases. */
  summary: string;
  /** Pourquoi cette ouverture convient à un joueur ~1200–1500 (style, effort de mémorisation, cohérence du répertoire). */
  why: string;
  /** Fiche mémo : 4 à 7 idées-clés, une phrase chacune (structure, plans, cases, pièges à éviter). */
  keyIdeas: string[];
  /** « Comprendre » : texte + positions commentées (même format que les leçons). */
  sections: LessonSection[];
  /**
   * Arbre du répertoire en PGN commenté. Conventions :
   * - coups en notation SAN anglaise (Nf3, Bf4, O-O), numéros optionnels ;
   * - commentaires `{…}` en français APRÈS le coup qu'ils expliquent (les coups cités dedans en notation française : Cf3, Fd3) ;
   * - variantes entre parenthèses, comme dans tout PGN ;
   * - un coup du camp `side` annoté `?`, `?!` ou `??` est une erreur à connaître : montrée dans l'explorateur, jamais demandée à l'entraînement ;
   * - dans un commentaire : `[%cal Gd2d4,Rb7b5]` flèches (G bon, R mauvais, Y menace, B idée),
   *   `[%csl Gd5,Re4,Yf7]` cases (G case forte, R faiblesse, Y cible), `[%name Variante d'avance]` nom de la variante.
   */
  pgn: string;
  /** Pièges typiques de l'ouverture, sous forme d'exercices « trouve le coup ». */
  traps: Exercise[];
}
