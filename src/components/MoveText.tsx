import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Board from './Board';
import { START_FEN } from '../lib/chessUtils';
import { findMoves, frenchPlyLabel, sanToFrench, type MoveRef } from '../lib/frenchMoves';
import type { BoardPreview } from './VariationLine';

export interface MoveContext {
  fen: string;
  mainline?: string[];
  /** Coups isolés sans numéro acceptés s'ils sont jouables depuis `fen` (défaut : non). */
  standalone?: boolean;
  /** « …Fg7 » sans numéro = prochain coup noir depuis `fen` (défaut : oui). */
  bareDots?: boolean;
}

type Ref = MoveRef & { startFen: string };

export interface MoveTextProps {
  /** Texte avec `**gras**` et `*italique*`, coups en notation française. */
  text: string;
  /** Position à partir de laquelle les coups du texte se rejouent. */
  startFen?: string;
  /** Ligne principale (UCI), utilisée quand le texte saute directement à un coup plus loin. */
  mainline?: string[];
  /** Plusieurs positions de départ possibles : on garde celle qui rend le plus de coups jouables. */
  contexts?: MoveContext[];
  /** Combiner les contextes (chaque coup pris dans le premier contexte qui l'explique) au lieu de garder le meilleur. */
  merge?: boolean;
  /** Position simulée à afficher sur l'échiquier voisin. Absent : un petit échiquier apparaît sous le coup survolé. */
  onPreview?: (p: BoardPreview | null) => void;
}

const NO_LINE: string[] = [];

/** Choisit la position de départ qui explique le plus de coups du texte. */
function resolve(text: string, contexts: MoveContext[], standalone: boolean, merge: boolean): { key: string; refs: Ref[] } {
  if (merge) {
    const refs: Ref[] = [];
    for (const c of contexts) {
      for (const r of findMoves(text, c.fen, c.mainline ?? NO_LINE, { standalone: c.standalone ?? false, bareDots: c.bareDots ?? true })) {
        if (!refs.some((x) => x.start < r.end && r.start < x.end)) refs.push({ ...r, startFen: c.fen });
      }
    }
    refs.sort((a, b) => a.start - b.start);
    return { key: contexts.map((c) => c.fen).join('|'), refs };
  }
  let best = { key: contexts[0]?.fen ?? START_FEN, refs: [] as Ref[] };
  for (const c of contexts) {
    const refs = findMoves(text, c.fen, c.mainline ?? NO_LINE, { standalone });
    if (refs.length > best.refs.length) best = { key: c.fen, refs: refs.map((r) => ({ ...r, startFen: c.fen })) };
  }
  return best;
}

function toPreview(ref: Ref): BoardPreview {
  const label = ref.threat ? `menace ${sanToFrench(ref.move.san)}` : frenchPlyLabel(ref.startFen, ref.ply, ref.move.san);
  return { fen: ref.fen, lastMove: { from: ref.move.from, to: ref.move.to }, label, step: 0, total: 0 };
}

/**
 * Texte d'explication dont les coups (« 23.gxh4 Td2!! ») sont survolables :
 * la position correspondante s'affiche sur l'échiquier. Un clic garde la position affichée.
 */
export default function MoveText({ text, startFen: fixedFen, mainline = NO_LINE, contexts, merge = false, onPreview }: MoveTextProps) {
  const { key: startFen, refs } = useMemo(
    // Sans position imposée (paragraphe de leçon), un coup isolé sans numéro est une idée générale : pas de lien.
    () => resolve(text, contexts ?? [{ fen: fixedFen ?? START_FEN, mainline }], !contexts, merge),
    [text, contexts, fixedFen, mainline, merge],
  );
  const [pinned, setPinned] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  // Mode « bulle » : petit échiquier positionné sous le coup survolé
  const popover = !onPreview;
  const [bubble, setBubble] = useState<{ preview: BoardPreview; style: CSSProperties } | null>(null);
  const linkEls = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setPinned(null);
    setActive(null);
    setBubble(null);
    return () => onPreview?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startFen]);

  // La bulle se ferme quand on fait défiler la page
  useEffect(() => {
    if (!popover || !bubble) return;
    const close = () => {
      setBubble(null);
      setActive(null);
      setPinned(null);
    };
    window.addEventListener('scroll', close, { passive: true, once: true });
    return () => window.removeEventListener('scroll', close);
  }, [popover, bubble]);

  const show = (i: number | null) => {
    setActive(i);
    const p = i === null ? null : toPreview(refs[i]);
    if (!popover) {
      onPreview?.(p);
      return;
    }
    const el = i === null ? null : linkEls.current[i];
    if (!p || !el) {
      setBubble(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const size = Math.min(240, window.innerWidth - 32);
    const left = Math.max(16, Math.min(r.left + r.width / 2 - size / 2, window.innerWidth - size - 16));
    const below = window.innerHeight - r.bottom > size + 40;
    const style: CSSProperties = below ? { left, top: r.bottom + 10, width: size } : { left, top: Math.max(8, r.top - size - 16), width: size };
    setBubble({ preview: p, style });
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
          ref={(el) => (linkEls.current[i] = el)}
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
      {popover &&
        bubble &&
        createPortal(
          <div className="mv-bubble" style={bubble.style} role="status">
            <Board id="mv-bubble" fen={bubble.preview.fen} preview={bubble.preview} maxWidth={240} sound={false} />
          </div>,
          document.body,
        )}
    </span>
  );
}
