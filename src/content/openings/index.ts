// Catalogue des ouvertures (ordre d'affichage). Le répertoire conseillé forme un tout cohérent :
// Londres avec les Blancs ; structure …c6/…d5 avec le fou sorti en f5 avec les Noirs (Caro-Kann, Slave).
import type { Opening } from './types';
import { parseOpeningPgn, type OpeningTree } from '../../lib/openingTree';
import london from './london';
import caroKann from './caro-kann';
import slave from './slave';
import antiLondon from './anti-london';
import italienne from './italienne';
import espagnole from './espagnole';
import sicilienne from './sicilienne';
import gambitDame from './gambit-dame';

export type { Opening, OpeningSide, OpeningFamily } from './types';

export const openings: Opening[] = [london, caroKann, slave, antiLondon, italienne, espagnole, sicilienne, gambitDame];

export function getOpening(id: string): Opening | undefined {
  return openings.find((o) => o.id === id);
}

const trees = new Map<string, OpeningTree>();

/** Arbre de l'ouverture (construit une fois puis gardé en mémoire). */
export function openingTree(o: Opening): OpeningTree {
  let t = trees.get(o.id);
  if (!t) {
    t = parseOpeningPgn(o.pgn);
    trees.set(o.id, t);
  }
  return t;
}
