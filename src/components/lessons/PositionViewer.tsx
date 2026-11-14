import { Fragment, useMemo, useState, type KeyboardEvent } from 'react';
import { Chess, type Square } from 'chess.js';
import Board from '../Board';
import { parseUci } from '../../lib/chessUtils';
import type { PositionSection } from '../../content/lessons/types';
import MoveText from '../MoveText';
import type { BoardPreview } from '../VariationLine';
import { NavIcon, TurnIndicator, splitSource } from './book';

interface Step {
  fen: string;
  san: string;
  from: Square;
  to: Square;
  /** Numéro de coup et camp, pour la feuille de notation. */
  moveNo: number;
  color: 'w' | 'b';
}

/** Calcule les positions successives d'une suite de coups UCI (s'arrête au premier coup illégal). */
function buildSteps(fen: string, moves: { uci: string }[]): Step[] {
  const chess = new Chess(fen);
  const steps: Step[] = [];
  for (const m of moves) {
    const [, color, , , , full] = chess.fen().split(' ');
    try {
      const mv = chess.move(parseUci(m.uci));
      steps.push({ fen: chess.fen(), san: mv.san, from: mv.from, to: mv.to, moveNo: parseInt(full, 10) || 1, color: color === 'b' ? 'b' : 'w' });
    } catch {
      break;
    }
  }
  return steps;
}

/** Lignes de la feuille : [n°, coup blanc (index), coup noir (index)] ; -1 = case vide (« … »). */
function sheetRows(steps: Step[]): { no: number; w: number; b: number }[] {
  const rows: { no: number; w: number; b: number }[] = [];
  steps.forEach((s, k) => {
    const last = rows[rows.length - 1];
    if (s.color === 'w' || !last || last.no !== s.moveNo || last.b !== -1) {
      rows.push({ no: s.moveNo, w: s.color === 'w' ? k : -1, b: s.color === 'b' ? k : -1 });
    } else {
      last.b = k;
    }
  });
  return rows;
}

function stepLabel(s: Step) {
  return s.color === 'w' ? `${s.moveNo}.${s.san}` : `${s.moveNo}…${s.san}`;
}

interface Props {
  section: PositionSection;
  id: string;
  /** Numéro du diagramme dans le chapitre. */
  number: number;
}

/** Diagramme commenté, numéroté, avec rejeu des coups sur une feuille de notation. */
export default function PositionViewer({ section, id, number }: Props) {
  const moves = section.moves ?? [];
  const steps = useMemo(() => buildSteps(section.fen, section.moves ?? []), [section]);
  const rows = useMemo(() => sheetRows(steps), [steps]);
  const [i, setI] = useState(0); // 0 = position de départ, k = après le k-ième coup
  // Coups cités dans le commentaire : aperçu sur l'échiquier du diagramme
  const [preview, setPreview] = useState<BoardPreview | null>(null);
  const mainline = useMemo(() => (section.moves ?? []).map((m) => m.uci), [section]);
  const step = i > 0 ? steps[i - 1] : null;
  const { title, source } = splitSource(section.title);

  const go = (k: number) => {
    setPreview(null);
    setI(Math.max(0, Math.min(steps.length, k)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(i + 1);
    else if (e.key === 'ArrowLeft') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(steps.length);
    else return;
    e.preventDefault();
  };

  const cell = (k: number) =>
    k < 0 ? (
      <span className="sheet-empty">…</span>
    ) : (
      <button className={k + 1 === i ? 'current' : ''} onClick={() => go(k + 1)} aria-current={k + 1 === i ? 'step' : undefined}>
        {steps[k].san}
      </button>
    );

  return (
    <figure className="diagram" aria-labelledby={`${id}-cap`}>
      <div className="diagram-plate">
        <Board
          id={id}
          fen={step ? step.fen : section.fen}
          orientation={section.orientation ?? 'white'}
          arrows={step ? [{ from: step.from, to: step.to, kind: 'idea' }] : section.arrows ?? []}
          marks={step ? [] : section.marks ?? []}
          lastMove={step ? { from: step.from, to: step.to } : null}
          maxWidth={460}
          preview={preview}
        />
        <figcaption id={`${id}-cap`} className="diagram-caption">
          <span className="diagram-num">Diagramme {number}</span>
          {title && <em className="diagram-title">{title}</em>}
          {source && <span className="diagram-source">{source}</span>}
        </figcaption>
      </div>

      <div className="diagram-commentary">
        <p className="diagram-turn">
          {step ? <span className="diagram-move mono">{stepLabel(step)}</span> : <TurnIndicator fen={section.fen} />}
        </p>
        <p className="diagram-text" aria-live="polite">
          <MoveText text={step ? moves[i - 1].comment : section.caption} startFen={section.fen} mainline={mainline} onPreview={setPreview} />
        </p>

        {steps.length > 0 && (
          <div className="diagram-replay" onKeyDown={onKey}>
            <div className="replay-controls" role="group" aria-label="Rejouer les coups">
              <button className="replay-btn" onClick={() => go(0)} disabled={i === 0} aria-label="Position de départ" title="Position de départ">
                <NavIcon kind="first" />
              </button>
              <button className="replay-btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Coup précédent" title="Coup précédent (←)">
                <NavIcon kind="prev" />
              </button>
              <span className="replay-count mono" aria-live="off">
                {i}/{steps.length}
              </span>
              <button className="replay-btn" onClick={() => go(i + 1)} disabled={i >= steps.length} aria-label="Coup suivant" title="Coup suivant (→)">
                <NavIcon kind="next" />
              </button>
              <button className="replay-btn" onClick={() => go(steps.length)} disabled={i >= steps.length} aria-label="Fin de la ligne" title="Fin de la ligne">
                <NavIcon kind="last" />
              </button>
            </div>
            <div className="movelist diagram-sheet" aria-label="Feuille de notation">
              {rows.map((r) => (
                <Fragment key={`${r.no}-${r.w}-${r.b}`}>
                  <span className="num">{r.no}.</span>
                  {cell(r.w)}
                  {cell(r.b)}
                </Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </figure>
  );
}
