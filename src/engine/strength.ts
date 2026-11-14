// Calibration de la force du bot en fonction d'un Elo cible.
//
// Stockfish 17.1 accepte UCI_LimitStrength + UCI_Elo dans la plage [1320, 3190]
// (Elo calibré sur l'échelle CCRL 40/4, cadence lente). En dessous de 1320, on
// combine « Skill Level » faible, profondeur réduite et un choix aléatoire parmi
// les meilleurs coups MultiPV pour simuler des erreurs humaines.
//
// Ces valeurs sont approximatives : l'Elo Stockfish n'est pas l'Elo chess.com.

import type { EngineLine } from './stockfish';

export const MIN_ELO = 400;
export const MAX_ELO = 3000;

export interface StrengthConfig {
  options: Record<string, string | number | boolean>;
  depth?: number;
  movetime: number;
  /** Nombre de lignes à demander pour pouvoir choisir un coup sous-optimal. */
  multipv: number;
  /** Probabilité de jouer un coup autre que le meilleur. */
  errorRate: number;
  /** Perte max (centipions) tolérée pour un coup « erreur ». */
  maxErrorLoss: number;
}

export function strengthForElo(elo: number): StrengthConfig {
  const e = Math.max(MIN_ELO, Math.min(MAX_ELO, Math.round(elo)));
  if (e >= 1320) {
    return {
      options: { UCI_LimitStrength: true, UCI_Elo: e, 'Skill Level': 20 },
      movetime: e >= 2200 ? 1000 : 600,
      multipv: 1,
      errorRate: 0,
      maxErrorLoss: 0,
    };
  }
  // 400 -> 1319 : interpolation linéaire t ∈ [0, 1]
  const t = (e - MIN_ELO) / (1320 - MIN_ELO);
  return {
    options: { UCI_LimitStrength: false, 'Skill Level': Math.round(t * 4) },
    depth: Math.round(1 + t * 5), // 1 -> 6
    movetime: 300,
    multipv: 5,
    errorRate: 0.45 - t * 0.3, // 45% -> 15%
    maxErrorLoss: Math.round(600 - t * 400), // 600 -> 200 cp
  };
}

export function eloLabel(elo: number): string {
  if (elo < 800) return 'Débutant';
  if (elo < 1200) return 'Joueur de club occasionnel';
  if (elo < 1600) return 'Joueur de club';
  if (elo < 2000) return 'Joueur de club confirmé';
  if (elo < 2300) return 'Expert / candidat maître';
  if (elo < 2500) return 'Maître international';
  if (elo < 2800) return 'Grand maître';
  return 'Super grand maître';
}

/** Choisit le coup du bot parmi les lignes MultiPV selon la config. */
export function pickBotMove(lines: EngineLine[], bestMove: string | null, cfg: StrengthConfig, rng = Math.random): string | null {
  if (!lines.length || cfg.errorRate <= 0 || rng() >= cfg.errorRate) return bestMove ?? lines[0]?.pv[0] ?? null;
  const best = lineScore(lines[0]);
  const candidates = lines.slice(1).filter((l) => l.pv.length && best - lineScore(l) <= cfg.maxErrorLoss);
  if (!candidates.length) return bestMove ?? lines[0].pv[0];
  return candidates[Math.floor(rng() * candidates.length)].pv[0];
}

function lineScore(l: EngineLine): number {
  if (l.mate !== null) return l.mate > 0 ? 100000 - l.mate : -100000 - l.mate;
  return l.cp ?? 0;
}
