import { useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import Board from '../Board';
import { parseUci } from '../../lib/chessUtils';
import type { PositionSection } from '../../content/lessons/types';
import { RichText } from './RichText';

interface Step {
  fen: string;
  san: string;
  from: Square;
  to: Square;
  label: string;
}

/** Calcule les positions successives d'une suite de coups UCI (s'arrête au premier coup illégal). */
function buildSteps(fen: string, moves: { uci: string }[]): Step[] {
  const chess = new Chess(fen);
  const steps: Step[] = [];
  for (const m of moves) {
    const [, color, , , , full] = chess.fen().split(' ');
    try {
      const mv = chess.move(parseUci(m.uci));
      const label = color === 'w' ? `${full}. ${mv.san}` : `${full}… ${mv.san}`;
      steps.push({ fen: chess.fen(), san: mv.san, from: mv.from, to: mv.to, label });
    } catch {
      break;
    }
  }
  return steps;
}

export default function PositionViewer({ section, id }: { section: PositionSection; id: string }) {
  const moves = section.moves ?? [];
  const steps = useMemo(() => buildSteps(section.fen, section.moves ?? []), [section]);
  const [i, setI] = useState(0); // 0 = position de départ, k = après le k-ième coup
  const step = i > 0 ? steps[i - 1] : null;
  const turn = section.fen.split(' ')[1] === 'b' ? 'Les Noirs jouent' : 'Les Blancs jouent';

  return (
    <figure className="card lesson-pos">
      {section.title && <h3 className="lesson-pos-title">{section.title}</h3>}
      <div className="lesson-pos-grid">
        <div className="lesson-board">
          <Board
            id={id}
            fen={step ? step.fen : section.fen}
            orientation={section.orientation ?? 'white'}
            arrows={step ? [{ from: step.from, to: step.to, kind: 'idea' }] : section.arrows ?? []}
            marks={step ? [] : section.marks ?? []}
            lastMove={step ? { from: step.from, to: step.to } : null}
            maxWidth={480}
          />
          {steps.length > 0 && (
            <div className="btn-row lesson-stepper" role="group" aria-label="Rejouer les coups">
              <button className="btn" onClick={() => setI(0)} disabled={i === 0} aria-label="Début" title="Début">⏮</button>
              <button className="btn" onClick={() => setI(i - 1)} disabled={i === 0} aria-label="Coup précédent" title="Coup précédent">◀</button>
              <span className="lesson-step-count mono">{i}/{steps.length}</span>
              <button className="btn" onClick={() => setI(i + 1)} disabled={i >= steps.length} aria-label="Coup suivant" title="Coup suivant">▶</button>
              <button className="btn" onClick={() => setI(steps.length)} disabled={i >= steps.length} aria-label="Fin" title="Fin">⏭</button>
            </div>
          )}
        </div>
        <figcaption className="lesson-pos-text">
          <p className="muted lesson-turn">{i === 0 ? turn : step?.label}</p>
          <p>
            <RichText text={step ? moves[i - 1].comment : section.caption} />
          </p>
          {steps.length > 0 && (
            <div className="lesson-movelist mono">
              {steps.map((s, k) => (
                <button key={k} className={k + 1 === i ? 'current' : ''} onClick={() => setI(k + 1)}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
