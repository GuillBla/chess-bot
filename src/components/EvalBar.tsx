import { winProbability } from '../lib/chessUtils';

export interface EvalBarProps {
  /** Score du point de vue des Blancs (mat = ±10000). */
  whiteCp: number;
  label: string;
  /** Sens de l'échiquier : la part des Blancs est toujours du côté des Blancs (en bas si orientation « white »). */
  orientation?: 'white' | 'black';
  /** Hauteur en px. Absente : la barre s'étire à la hauteur de son conteneur flex (cf. .board-row). */
  height?: number;
}

/** Libellé compact pour tenir dans la barre : « +1.25 » → « 1.3 », « -0.40 » → « -0.4 » (le libellé complet reste dans l'infobulle). */
function shortLabel(label: string): string {
  const m = /^([+\-−]?)(\d+)[.,](\d+)$/.exec(label.trim());
  if (!m) return label;
  const v = Math.abs(parseFloat(`${m[2]}.${m[3]}`));
  const neg = m[1] === '-' || m[1] === '−';
  return `${neg && v >= 0.05 ? '-' : ''}${v >= 10 ? Math.round(v) : v.toFixed(1)}`;
}

/**
 * Barre d'évaluation verticale. Le libellé se place du côté du camp qui mène,
 * sur sa propre couleur (texte foncé sur la part blanche, clair sur la part noire).
 */
export default function EvalBar({ whiteCp, label, orientation = 'white', height }: EvalBarProps) {
  const pWhite = Math.abs(whiteCp) >= 9000 ? (whiteCp > 0 ? 1 : 0) : winProbability(whiteCp);
  const whitePct = Math.round(pWhite * 100);
  const flipped = orientation === 'black';
  const whiteLeads = whiteCp >= 0;
  // Bas de la barre = côté du joueur en bas de l'échiquier.
  const labelAtBottom = whiteLeads !== flipped;
  return (
    <div
      className="evalbar"
      style={{ height, flexDirection: flipped ? 'column' : 'column-reverse' }}
      title={`Évaluation : ${label} (point de vue des Blancs)`}
      role="img"
      aria-label={`Évaluation ${label}`}
    >
      <div className="evalbar-white" style={{ height: `${whitePct}%` }} />
      <span className={`evalbar-label ${whiteLeads ? 'on-white' : 'on-black'}`} style={{ [labelAtBottom ? 'bottom' : 'top']: 4 }}>
        {shortLabel(label)}
      </span>
    </div>
  );
}
