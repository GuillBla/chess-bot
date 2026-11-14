import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { findMoves, frenchPlyLabel, sanToFrench, type MoveRef } from '../lib/frenchMoves';
import type { BoardPreview } from './VariationLine';

export interface MoveTextProps {
  /** Texte avec `**gras**` et `*italique*`, coups en notation française. */
  text: string;
  /** Position à partir de laquelle les coups du texte se rejouent. */
  startFen: string;
  /** Ligne principale (UCI), utilisée quand le texte saute directement à un coup plus loin. */
  mainline?: string[];
  onPreview: (p: BoardPreview | null) => void;
}

function toPreview(ref: MoveRef, startFen: string): BoardPreview {
  const label = ref.threat ? `menace ${sanToFrench(ref.move.san)}` : frenchPlyLabel(startFen, ref.ply, ref.move.san);
  return { fen: ref.fen, lastMove: { from: ref.move.from, to: ref.move.to }, label, step: 0, total: 0 };
}

/**
 * Texte d'explication dont les coups (« 23.gxh4 Td2!! ») sont survolables :
 * la position correspondante s'affiche sur l'échiquier. Un clic garde la position affichée.
 */
export default function MoveText({ text, startFen, mainline = [], onPreview }: MoveTextProps) {
  const refs = useMemo(() => findMoves(text, startFen, mainline), [text, startFen, mainline]);
  const [pinned, setPinned] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    setPinned(null);
    setActive(null);
    return () => onPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startFen]);

  const show = (i: number | null) => {
    setActive(i);
    onPreview(i === null ? null : toPreview(refs[i], startFen));
  };

  // Découpe : segments markdown (gras / italique / texte) puis liens de coups à l'intérieur.
  const nodes: ReactNode[] = [];
  const md = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let key = 0;
  const renderRange = (from: number, to: number): ReactNode[] => {
    const out: ReactNode[] = [];
    let pos = from;
    refs.forEach((r, i) => {
      if (r.start < from || r.end > to) return;
      if (r.start > pos) out.push(<Fragment key={key++}>{text.slice(pos, r.start)}</Fragment>);
      out.push(
        <button
          key={key++}
          type="button"
          className={`mv-link${r.threat ? ' threat' : ''}${active === i ? ' active' : ''}${pinned === i ? ' pinned' : ''}`}
          onMouseEnter={() => show(i)}
          onFocus={() => show(i)}
          onClick={() => {
            const next = pinned === i ? null : i;
            setPinned(next);
            show(next);
          }}
          aria-pressed={pinned === i}
          title={r.threat ? 'Voir la menace sur l’échiquier' : 'Voir la position après ce coup'}
        >
          {text.slice(r.start, r.end)}
        </button>,
      );
      pos = r.end;
    });
    if (pos < to) out.push(<Fragment key={key++}>{text.slice(pos, to)}</Fragment>);
    return out;
  };

  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = md.exec(text))) {
    if (m.index > last) nodes.push(...renderRange(last, m.index));
    const bold = m[0].startsWith('**');
    const inner = bold ? [m.index + 2, m.index + m[0].length - 2] : [m.index + 1, m.index + m[0].length - 1];
    const children = renderRange(inner[0], inner[1]);
    nodes.push(bold ? <strong key={key++}>{children}</strong> : <em key={key++}>{children}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(...renderRange(last, text.length));

  return (
    <span className="mv-text" onMouseLeave={() => show(pinned)}>
      {nodes}
    </span>
  );
}
