import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import type { BoardArrow, SquareMark } from '../analysis/types';

export const ARROW_COLORS: Record<BoardArrow['kind'], string> = {
  good: 'rgba(34, 160, 90, 0.85)',
  bad: 'rgba(214, 60, 60, 0.85)',
  threat: 'rgba(230, 140, 20, 0.85)',
  idea: 'rgba(60, 120, 220, 0.85)',
};

const MARK_STYLES: Record<SquareMark['kind'], CSSProperties> = {
  weak: { boxShadow: 'inset 0 0 0 4px rgba(214,60,60,0.7)' },
  strong: { boxShadow: 'inset 0 0 0 4px rgba(34,160,90,0.7)' },
  target: { background: 'radial-gradient(circle, rgba(230,140,20,0.55) 30%, transparent 32%)' },
  hanging: { background: 'rgba(214,60,60,0.35)' },
};

export interface BoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  /** Retourne true si le coup a été accepté. Absent = échiquier non interactif. */
  onMove?: (from: Square, to: Square, promotion?: string) => boolean;
  arrows?: BoardArrow[];
  marks?: SquareMark[];
  lastMove?: { from: string; to: string } | null;
  /** Largeur max en px (l'échiquier s'adapte à son conteneur). */
  maxWidth?: number;
  id?: string;
}

/** Échiquier commun à toutes les pages (jeu, analyse, leçons, parties). */
export default function Board({ fen, orientation = 'white', onMove, arrows = [], marks = [], lastMove, maxWidth = 560, id = 'board' }: BoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.min(maxWidth, el.clientWidth)));
    ro.observe(el);
    setWidth(Math.min(maxWidth, el.clientWidth));
    return () => ro.disconnect();
  }, [maxWidth]);

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(255, 213, 0, 0.35)' };
    squareStyles[lastMove.to] = { background: 'rgba(255, 213, 0, 0.45)' };
  }
  for (const m of marks) squareStyles[m.square] = { ...squareStyles[m.square], ...MARK_STYLES[m.kind] };

  return (
    <div ref={ref} className="board-wrap" style={{ maxWidth }}>
      <Chessboard
        id={id}
        position={fen}
        boardWidth={width}
        boardOrientation={orientation}
        arePiecesDraggable={!!onMove}
        onPieceDrop={(from, to, piece) => {
          if (!onMove) return false;
          // Après le choix de promotion, react-chessboard rappelle onPieceDrop avec la pièce choisie (ex. "wQ").
          // chess.js ignore le champ promotion pour un coup qui n'en est pas une.
          const p = piece[1].toLowerCase();
          return onMove(from as Square, to as Square, 'qrbn'.includes(p) ? p : 'q');
        }}
        customArrows={arrows.map((a) => [a.from, a.to, ARROW_COLORS[a.kind]])}
        customSquareStyles={squareStyles}
        customDarkSquareStyle={{ backgroundColor: 'var(--sq-dark)' }}
        customLightSquareStyle={{ backgroundColor: 'var(--sq-light)' }}
        animationDuration={200}
      />
    </div>
  );
}
