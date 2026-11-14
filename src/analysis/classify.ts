// Classification des coups et précision, méthode type Lichess :
// tout passe par la probabilité de gain (win%) plutôt que par les centipions bruts,
// ce qui évite de sanctionner une « perte » de 2 pions dans une position déjà gagnée à +12.
import { winProbability } from '../lib/chessUtils';
import type { EngineLine } from '../engine/stockfish';

export type MoveClass = 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'miss';

export const MOVE_CLASS_LABELS: Record<MoveClass, string> = {
  best: 'Meilleur coup',
  excellent: 'Excellent',
  good: 'Bon',
  inaccuracy: 'Imprécision',
  mistake: 'Erreur',
  blunder: 'Gaffe',
  miss: 'Coup manqué',
};

export const MOVE_CLASS_SYMBOLS: Partial<Record<MoveClass, string>> = {
  inaccuracy: '?!',
  mistake: '?',
  blunder: '??',
  miss: '✗',
};

/** Seuils de perte de win% (0..100, point de vue du joueur). Lichess : 10/20/30 sur l'échelle −1..1 = 5/10/15 %. */
export const THRESHOLDS = {
  excellent: 2,
  good: 5,
  inaccuracy: 10,
  mistake: 15,
} as const;

export const MATE_CP = 10000;

/** Score d'une ligne moteur en centipions du point de vue du camp au trait (mat = ±(10000 − n)). */
export function lineCp(line: Pick<EngineLine, 'cp' | 'mate'>): number {
  if (line.mate !== null && line.mate !== undefined) {
    if (line.mate === 0) return -MATE_CP; // camp au trait maté
    return line.mate > 0 ? MATE_CP - line.mate : -MATE_CP - line.mate;
  }
  return line.cp ?? 0;
}

/** Win% (0..100) pour un score en centipions du point de vue d'un joueur. */
export function winPercent(cp: number): number {
  if (cp >= MATE_CP - 1000) return 100;
  if (cp <= -MATE_CP + 1000) return 0;
  return winProbability(cp) * 100;
}

export interface ClassifyInput {
  /** Éval avant le coup (meilleur coup), centipions, point de vue du joueur qui joue. */
  beforeCp: number;
  /** Éval après le coup joué, centipions, point de vue du même joueur. */
  afterCp: number;
  /** Le coup joué est le premier choix du moteur. */
  isBest?: boolean;
  /** L'adversaire venait de commettre une erreur ou une gaffe (pour détecter un « coup manqué »). */
  opponentErred?: boolean;
}

export interface Classification {
  cls: MoveClass;
  /** Perte de win% (>= 0). */
  winLoss: number;
  /** Précision du coup (0..100), formule Lichess. */
  accuracy: number;
}

/** Précision d'un coup à partir des win% avant/après (formule Lichess). */
export function moveAccuracy(winBefore: number, winAfter: number): number {
  if (winAfter >= winBefore) return 100;
  const diff = winBefore - winAfter;
  const raw = 103.1668100711649 * Math.exp(-0.04354415386753951 * diff) - 3.166924740191411;
  return clamp(raw + 1, 0, 100); // +1 : bonus d'incertitude Lichess
}

export function classifyMove(input: ClassifyInput): Classification {
  const wb = winPercent(input.beforeCp);
  const wa = winPercent(input.afterCp);
  const winLoss = Math.max(0, wb - wa);
  const accuracy = moveAccuracy(wb, wa);

  let cls: MoveClass;
  if (input.isBest || winLoss < 0.5) cls = 'best';
  else if (winLoss < THRESHOLDS.excellent) cls = 'excellent';
  else if (winLoss < THRESHOLDS.good) cls = 'good';
  else if (winLoss < THRESHOLDS.inaccuracy) cls = 'inaccuracy';
  else if (winLoss < THRESHOLDS.mistake) cls = 'mistake';
  else cls = 'blunder';

  // Mat raté ou laissé : un mat forcé perdu est au minimum une erreur.
  if (input.beforeCp >= MATE_CP - 1000 && input.afterCp < MATE_CP - 1000 && input.afterCp < 500 && cls !== 'blunder') cls = 'mistake';

  // Coup manqué : l'adversaire venait de se tromper et on lui rend l'avantage
  // (sans pour autant se mettre en position perdante, sinon c'est une gaffe tout court).
  if (input.opponentErred && (cls === 'mistake' || cls === 'blunder') && wb >= 60 && wa >= 35) cls = 'miss';

  return { cls, winLoss, accuracy };
}

export function isError(cls: MoveClass): boolean {
  return cls === 'mistake' || cls === 'blunder' || cls === 'miss';
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function stdDev(xs: number[]): number {
  if (xs.length === 0) return 0;
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
}

/**
 * Précision d'une partie pour une couleur, formule Lichess :
 * moyenne (pondérée par la volatilité) et moyenne harmonique des précisions par coup, puis moyenne des deux.
 * @param whiteCps évaluations successives des positions (point de vue des Blancs), index 0 = position initiale.
 * @param firstMover camp qui joue le premier coup de la liste.
 */
export function gameAccuracy(whiteCps: number[], color: 'white' | 'black', firstMover: 'white' | 'black' = 'white'): number | null {
  if (whiteCps.length < 2) return null;
  const wins = whiteCps.map((cp) => winPercent(cp)); // win% Blancs
  const nMoves = wins.length - 1;
  const windowSize = clamp(Math.floor(nMoves / 10), 2, 8);
  // Fenêtres glissantes (Lichess complète le début avec la première fenêtre).
  const windows: number[][] = [];
  const first = wins.slice(0, windowSize);
  for (let i = 0; i < Math.min(windowSize, wins.length) - 2; i++) windows.push(first);
  for (let i = 0; i + windowSize <= wins.length; i++) windows.push(wins.slice(i, i + windowSize));
  if (wins.length < windowSize) windows.push(wins);
  const weights = windows.map((w) => clamp(stdDev(w), 0.5, 12));

  const accs: { acc: number; weight: number }[] = [];
  for (let i = 0; i < nMoves; i++) {
    const moverWhite = (i % 2 === 0) === (firstMover === 'white');
    if ((color === 'white') !== moverWhite) continue;
    const before = moverWhite ? wins[i] : 100 - wins[i];
    const after = moverWhite ? wins[i + 1] : 100 - wins[i + 1];
    accs.push({ acc: moveAccuracy(before, after), weight: weights[Math.min(i, weights.length - 1)] ?? 1 });
  }
  if (accs.length === 0) return null;
  const wSum = accs.reduce((a, b) => a + b.weight, 0);
  const weighted = accs.reduce((a, b) => a + b.acc * b.weight, 0) / wSum;
  const harmonic = accs.length / accs.reduce((a, b) => a + 1 / Math.max(b.acc, 1e-3), 0);
  return clamp((weighted + harmonic) / 2, 0, 100);
}
