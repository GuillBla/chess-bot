// Graphe d'évaluation de la partie (SVG maison) : part des Blancs en clair sous la courbe,
// part des Noirs en foncé au-dessus ; cliquable pour aller au coup, point courant en laiton.
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { MOVE_CLASS_LABELS, MATE_CP, type MoveClass } from '../../analysis/classify';
import { winProbability } from '../../lib/chessUtils';

export interface EvalGraphProps {
  /** Éval de chaque position (index 0 = départ), point de vue des Blancs ; null = pas encore analysée. */
  evals: (number | null)[];
  /** Demi-coup affiché (0 = départ). */
  current: number;
  onSelect: (ply: number) => void;
  /** Classification de chaque demi-coup : les erreurs sont marquées d'un point coloré. */
  classes?: (MoveClass | null)[];
  sans?: string[];
  startTurn?: 'w' | 'b';
  startMoveNumber?: number;
  height?: number;
}

const PAD = 6;
const MARKED: MoveClass[] = ['inaccuracy', 'mistake', 'blunder', 'miss'];

function share(cp: number): number {
  if (Math.abs(cp) >= MATE_CP - 1000) return cp > 0 ? 1 : 0;
  return winProbability(cp);
}

export function formatCp(cp: number): string {
  if (Math.abs(cp) >= MATE_CP - 1000) {
    const n = MATE_CP - Math.abs(cp);
    if (n <= 0) return cp > 0 ? '1-0' : '0-1';
    return `#${cp > 0 ? '' : '-'}${n}`;
  }
  const v = cp / 100;
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1).replace('.', ',')}`;
}

export default function EvalGraph({ evals, current, onSelect, classes, sans, startTurn = 'w', startMoveNumber = 1, height = 96 }: EvalGraphProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(120, Math.floor(el.clientWidth)));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const n = evals.length - 1;
  if (n < 1) return null;

  const h = height;
  const x = (i: number) => PAD + (i / n) * (width - 2 * PAD);
  const y = (cp: number) => 3 + (1 - share(cp)) * (h - 6);

  // Points analysés consécutifs depuis le départ (l'analyse progresse dans l'ordre).
  const pts: { i: number; x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const e = evals[i];
    if (e === null || e === undefined) break;
    pts.push({ i, x: x(i), y: y(e) });
  }
  const last = pts[pts.length - 1];
  const line = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = pts.length > 1 ? `M${pts[0].x.toFixed(1)},${h} ${line.replace(/^M/, 'L')} L${last.x.toFixed(1)},${h} Z` : '';

  const plyAt = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 0;
    const r = (clientX - rect.left - PAD) / Math.max(1, rect.width - 2 * PAD);
    return Math.max(0, Math.min(n, Math.round(r * n)));
  };

  const label = (ply: number) => {
    if (ply === 0) return 'Position de départ';
    const slot = ply - 1 + (startTurn === 'b' ? 1 : 0);
    const num = startMoveNumber + Math.floor(slot / 2);
    const san = sans?.[ply - 1] ?? '';
    return `${num}${slot % 2 === 0 ? '.' : '…'} ${san}`;
  };

  const shown = hover;
  const shownEval = shown !== null ? evals[shown] : null;
  const shownCls = shown !== null && shown > 0 ? classes?.[shown - 1] ?? null : null;
  const curEval = evals[current];

  return (
    <div
      className="evalgraph"
      ref={ref}
      style={{ height: h }}
      onPointerMove={(e: PointerEvent) => setHover(plyAt(e.clientX))}
      onPointerLeave={() => setHover(null)}
      onClick={(e) => onSelect(plyAt(e.clientX))}
    >
      <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} role="img" aria-label="Courbe d’évaluation de la partie (cliquer pour aller au coup)">
        {last && <rect className="evalgraph-black" x={PAD} y={0} width={Math.max(0, last.x - PAD)} height={h} />}
        {area && <path className="evalgraph-area" d={area} />}
        <line className="evalgraph-mid" x1={0} x2={width} y1={h / 2} y2={h / 2} />
        {pts.length > 1 && <path className="evalgraph-line" d={line} />}
        {classes?.map((c, i) => {
          const e = evals[i + 1];
          if (!c || !MARKED.includes(c) || e === null || e === undefined) return null;
          return (
            <circle key={i} className={`evalgraph-dot cls-${c}`} cx={x(i + 1)} cy={y(e)} r={c === 'inaccuracy' ? 2.5 : 3.5}>
              <title>{`${label(i + 1)} : ${MOVE_CLASS_LABELS[c]}`}</title>
            </circle>
          );
        })}
        {hover !== null && <line className="evalgraph-hover" x1={x(hover)} x2={x(hover)} y1={0} y2={h} />}
        <line className="evalgraph-cursor" x1={x(Math.min(current, n))} x2={x(Math.min(current, n))} y1={0} y2={h} />
        {curEval !== null && curEval !== undefined && current <= n && <circle className="evalgraph-current" cx={x(current)} cy={y(curEval)} r={4.5} />}
      </svg>
      {shown !== null && (
        <div className="evalgraph-tip" style={{ left: Math.min(Math.max(x(shown), 70), width - 70) }}>
          <span>{label(shown)}</span>
          {shownEval !== null && shownEval !== undefined && <strong>{formatCp(shownEval)}</strong>}
          {shownCls && MARKED.includes(shownCls) && <span className={`cls-chip cls-${shownCls}`}>{MOVE_CLASS_LABELS[shownCls]}</span>}
        </div>
      )}
    </div>
  );
}
