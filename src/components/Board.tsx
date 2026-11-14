import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Square } from 'chess.js';
import type { BoardArrow, SquareMark } from '../analysis/types';
import { customPieces } from './pieces';
import { usePreferences } from '../lib/preferences';
import { playSound, soundForTransition } from '../lib/sound';

export const ARROW_COLORS: Record<BoardArrow['kind'], string> = {
  good: 'rgba(62, 140, 58, 0.85)',
  bad: 'rgba(196, 64, 44, 0.85)',
  threat: 'rgba(214, 140, 30, 0.88)',
  idea: 'rgba(47, 102, 168, 0.85)',
};

const MARK_STYLES: Record<SquareMark['kind'], CSSProperties> = {
  weak: { boxShadow: 'inset 0 0 0 4px rgba(196,64,44,0.75)' },
  strong: { boxShadow: 'inset 0 0 0 4px rgba(62,140,58,0.75)' },
  target: { background: 'radial-gradient(circle, rgba(214,140,30,0.6) 26%, transparent 28%)' },
  hanging: { background: 'rgba(196,64,44,0.38)' },
};

/** Pastille de classification posée sur une case (ex. « ?? » sur la case d'arrivée d'une gaffe). */
export interface BoardBadge {
  square: string;
  /** Classe de coup : brilliant, great, best, excellent, good, inaccuracy, mistake, blunder, miss. */
  cls: string;
  symbol: string;
  title?: string;
}

export interface BoardProps {
  fen: string;
  orientation?: 'white' | 'black';
  /** Retourne true si le coup a été accepté. Absent = échiquier non interactif. */
  onMove?: (from: Square, to: Square, promotion?: string) => boolean;
  arrows?: BoardArrow[];
  marks?: SquareMark[];
  lastMove?: { from: string; to: string } | null;
  badge?: BoardBadge | null;
  /** Largeur max en px, cadre compris (l'échiquier s'adapte à son conteneur). */
  maxWidth?: number;
  /** Sons à chaque nouveau coup (défaut : oui, selon la préférence utilisateur). */
  sound?: boolean;
  /** Cadre en bois autour de l'échiquier (défaut : oui). */
  framed?: boolean;
  id?: string;
}

/** Échiquier commun à toutes les pages (jeu, analyse, leçons, parties). */
export default function Board({
  fen,
  orientation = 'white',
  onMove,
  arrows = [],
  marks = [],
  lastMove,
  badge,
  maxWidth = 600,
  sound = true,
  framed = true,
  id = 'board',
}: BoardProps) {
  const prefs = usePreferences();
  const innerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(400);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(160, Math.floor(el.clientWidth)));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // Son au changement de coup (uniquement quand le dernier coup change réellement)
  const prev = useRef<{ fen: string; key: string } | null>(null);
  useEffect(() => {
    const key = lastMove ? `${lastMove.from}${lastMove.to}` : '';
    const before = prev.current;
    prev.current = { fen, key };
    if (!sound || !before || !lastMove || before.fen === fen || before.key === key) return;
    try {
      const c = new Chess(fen);
      playSound(soundForTransition(before.fen, fen, c.inCheck(), c.isGameOver()));
    } catch {
      /* FEN invalide : pas de son */
    }
  }, [fen, lastMove, sound]);

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(214, 170, 60, 0.38)' };
    squareStyles[lastMove.to] = { background: 'rgba(214, 170, 60, 0.5)' };
  }
  for (const m of marks) squareStyles[m.square] = { ...squareStyles[m.square], ...MARK_STYLES[m.kind] };

  // Position de la pastille (coin supérieur droit de la case)
  let badgeStyle: CSSProperties | null = null;
  if (badge && /^[a-h][1-8]$/.test(badge.square)) {
    const f = badge.square.charCodeAt(0) - 97;
    const r = parseInt(badge.square[1], 10) - 1;
    const col = orientation === 'white' ? f : 7 - f;
    const row = orientation === 'white' ? 7 - r : r;
    const sq = width / 8;
    badgeStyle = { left: (col + 1) * sq, top: row * sq };
  }

  return (
    <div className="board-wrap" style={{ maxWidth }}>
      <div className={framed ? 'board-frame' : 'board-frame bare'}>
        <div ref={innerRef} style={{ position: 'relative' }}>
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
            customPieces={customPieces}
            customArrows={arrows.map((a) => [a.from, a.to, ARROW_COLORS[a.kind]])}
            customSquareStyles={squareStyles}
            customDarkSquareStyle={{ backgroundColor: 'var(--sq-dark)' }}
            customLightSquareStyle={{ backgroundColor: 'var(--sq-light)' }}
            customDropSquareStyle={{ boxShadow: 'inset 0 0 0 3px rgba(214, 170, 60, 0.9)' }}
            customBoardStyle={{ borderRadius: 2 }}
            customNotationStyle={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: Math.max(9, Math.round(width / 50)) }}
            showBoardNotation={prefs.coordinates}
            animationDuration={180}
          />
          {badge && badgeStyle && (
            <span className={`board-badge cls-${badge.cls}`} style={badgeStyle} title={badge.title}>
              {badge.symbol}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
