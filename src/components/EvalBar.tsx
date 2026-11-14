import { winProbability } from '../lib/chessUtils';

/** Barre d'évaluation verticale. whiteCp : score du point de vue des Blancs (mat = ±10000). */
export default function EvalBar({ whiteCp, label, orientation = 'white', height = 400 }: { whiteCp: number; label: string; orientation?: 'white' | 'black'; height?: number }) {
  const pWhite = Math.abs(whiteCp) >= 9000 ? (whiteCp > 0 ? 1 : 0) : winProbability(whiteCp);
  const whitePct = Math.round(pWhite * 100);
  const flipped = orientation === 'black';
  return (
    <div className="evalbar" style={{ height, flexDirection: flipped ? 'column' : 'column-reverse' }} title={`Évaluation : ${label}`}>
      <div className="evalbar-white" style={{ height: `${whitePct}%` }} />
      <span className="evalbar-label" style={{ [whiteCp >= 0 !== flipped ? 'bottom' : 'top']: 4 }}>{label}</span>
    </div>
  );
}
