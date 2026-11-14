// Contrat partagé du moteur d'explication (implémenté dans explain.ts).
import type { Square } from 'chess.js';

export type ArrowColor = 'good' | 'bad' | 'threat' | 'idea';

export interface BoardArrow {
  from: Square;
  to: Square;
  kind: ArrowColor;
}

export interface SquareMark {
  square: Square;
  kind: 'weak' | 'strong' | 'target' | 'hanging';
}

/** Une raison expliquant un coup (tactique, positionnelle, menace…). */
export interface ExplanationPoint {
  category: 'tactique' | 'menace' | 'positionnel' | 'roi' | 'structure' | 'finale' | 'plan' | 'défense';
  /** Phrase en français, complète, compréhensible par un joueur ~1200. */
  text: string;
  arrows?: BoardArrow[];
  marks?: SquareMark[];
}

export interface AlternativeExplanation {
  uci: string;
  san: string;
  /** Perte par rapport au meilleur coup, en centipions (>= 0). */
  lossCp: number;
  /** Variation de réfutation formatée (ex. "12. Nf3 Bxf3 13. gxf3"). */
  line: string;
  text: string;
}

export interface MoveExplanation {
  uci: string;
  san: string;
  /** Évaluation après le coup, point de vue des Blancs : "+1.25" / "#3". */
  evalText: string;
  /** Résumé en une phrase : l'idée principale. */
  headline: string;
  points: ExplanationPoint[];
  /** Plan : variation principale commentée. */
  plan?: { line: string; text: string };
  /** « Pourquoi pas X ? » */
  alternatives: AlternativeExplanation[];
}
