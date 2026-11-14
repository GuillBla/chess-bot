// Catalogue des leçons du Professeur (ordre = progression conseillée).
import type { Lesson } from './types';
import calcul from './calcul';
import tactiqueAvancee from './tactique-avancee';
import bonnesMauvaisesPieces from './bonnes-mauvaises-pieces';
import finalesPions from './finales-pions';
import structuresDePions from './structures-de-pions';
import attaqueSurLeRoi from './attaque-sur-le-roi';
import finalesTours from './finales-tours';
import convertirAvantage from './convertir-avantage';
import defense from './defense';
import prophylaxie from './prophylaxie';
import dynamiqueVsStatique from './dynamique-vs-statique';

export type { Lesson, Exercise, LessonSection, LessonLevel } from './types';

export const lessons: Lesson[] = [
  calcul,
  tactiqueAvancee,
  bonnesMauvaisesPieces,
  finalesPions,
  structuresDePions,
  attaqueSurLeRoi,
  finalesTours,
  convertirAvantage,
  defense,
  prophylaxie,
  dynamiqueVsStatique,
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}
