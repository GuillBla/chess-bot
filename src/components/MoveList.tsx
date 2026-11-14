import { useEffect, useRef } from 'react';
import { MOVE_CLASS_LABELS, type MoveClass } from '../analysis/classify';
import { sheetSymbol } from './play/moveClass';

export interface MoveListProps {
  /** Coups en notation SAN, dans l'ordre. */
  sans: string[];
  /** Nombre de demi-coups joués jusqu'à la position affichée (0 ou -1 = position de départ). */
  current: number;
  onSelect: (ply: number) => void;
  /** Camp au trait dans la position de départ (défaut : Blancs). */
  startTurn?: 'w' | 'b';
  /** Numéro du premier coup (défaut : 1). */
  startMoveNumber?: number;
  /** Classification de chaque demi-coup (même index que `sans`) : pastille ?!, ?, ?? à côté du coup. */
  classes?: (MoveClass | null | undefined)[];
}

/** Feuille de notation (1. e4 e5 2. Cf3…), cliquable pour naviguer, avec défilement vers le coup courant. */
export default function MoveList({ sans, current, onSelect, startTurn = 'w', startMoveNumber = 1, classes }: MoveListProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Défilement interne à la feuille (sans faire défiler toute la page).
  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>('button.current');
    if (!box) return;
    if (!el) {
      if (current <= 0) box.scrollTop = 0;
      return;
    }
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = Math.max(0, top - el.offsetHeight);
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + el.offsetHeight;
  }, [current, sans.length]);

  // Décalage si la partie commence avec les Noirs au trait.
  const offset = startTurn === 'b' ? 1 : 0;
  const rows: { num: number; white?: number; black?: number }[] = [];
  for (let i = 0; i < sans.length; i++) {
    const slot = i + offset;
    const row = Math.floor(slot / 2);
    if (!rows[row]) rows[row] = { num: startMoveNumber + row };
    if (slot % 2 === 0) rows[row].white = i;
    else rows[row].black = i;
  }

  const cell = (i?: number) => {
    if (i === undefined) return <span />;
    const cls = classes?.[i] ?? null;
    const sym = sheetSymbol(cls);
    return (
      <button
        type="button"
        className={current === i + 1 ? 'current' : ''}
        onClick={() => onSelect(i + 1)}
        aria-current={current === i + 1 ? 'step' : undefined}
        title={cls ? MOVE_CLASS_LABELS[cls] : undefined}
      >
        <span className="ml-san">{sans[i]}</span>
        {sym && cls && (
          <span className={`cls-chip cls-${cls}`} aria-label={MOVE_CLASS_LABELS[cls]}>
            {sym}
          </span>
        )}
      </button>
    );
  };

  if (!sans.length) return <p className="muted" style={{ margin: 0 }}>Aucun coup joué.</p>;

  return (
    <div className="movelist" ref={ref}>
      {rows.map((r, k) =>
        r ? (
          <div key={k} style={{ display: 'contents' }}>
            <span className="num">{r.num}.</span>
            {r.white === undefined && k === 0 && offset ? <span className="muted">…</span> : cell(r.white)}
            {cell(r.black)}
          </div>
        ) : null,
      )}
    </div>
  );
}
