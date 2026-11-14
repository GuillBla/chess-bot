import { useEffect, useRef } from 'react';

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
}

/** Liste des coups par paires (1. e4 e5 2. Cf3…), cliquable pour naviguer. */
export default function MoveList({ sans, current, onSelect, startTurn = 'w', startMoveNumber = 1 }: MoveListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector('button.current');
    if (el && 'scrollIntoView' in el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
  }, [current]);

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

  const cell = (i?: number) =>
    i === undefined ? (
      <span />
    ) : (
      <button type="button" className={current === i + 1 ? 'current' : ''} onClick={() => onSelect(i + 1)}>
        {sans[i]}
      </button>
    );

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
