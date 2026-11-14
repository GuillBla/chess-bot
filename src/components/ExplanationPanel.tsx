import { useEffect, useState } from 'react';
import type { Square } from 'chess.js';
import type { BoardArrow, ExplanationPoint, MoveExplanation, SquareMark } from '../analysis/types';

export interface ExplanationPanelProps {
  explanation: MoveExplanation;
  /** Appelé au survol / clic d'un point : flèches et cases à afficher sur l'échiquier ([] = revenir à l'affichage par défaut). */
  onFocusArrows?: (arrows: BoardArrow[], marks: SquareMark[]) => void;
  /** Titre optionnel au-dessus du coup (ex. « Indice », « Coup joué »). */
  title?: string;
  /** Masque la section des alternatives. */
  hideAlternatives?: boolean;
}

const CATEGORY: Record<ExplanationPoint['category'], { label: string; cls: string }> = {
  tactique: { label: 'Tactique', cls: 'warn' },
  menace: { label: 'Menace', cls: 'bad' },
  défense: { label: 'Défense', cls: 'good' },
  roi: { label: 'Sécurité du roi', cls: 'bad' },
  positionnel: { label: 'Positionnel', cls: 'idea' },
  structure: { label: 'Structure de pions', cls: 'idea' },
  finale: { label: 'Finale', cls: 'good' },
  plan: { label: 'Plan', cls: '' },
};
const ORDER: ExplanationPoint['category'][] = ['tactique', 'menace', 'défense', 'roi', 'positionnel', 'structure', 'finale', 'plan'];

function lossText(cp: number): string {
  if (cp <= 0) return 'meilleur';
  return `−${(cp / 100).toFixed(1).replace('.', ',')}`;
}

/** Affiche l'explication d'un coup : idée principale, raisons par catégorie, plan, alternatives. */
export default function ExplanationPanel({ explanation: ex, onFocusArrows, title, hideAlternatives }: ExplanationPanelProps) {
  const [pinned, setPinned] = useState<{ key: string; arrows: BoardArrow[]; marks: SquareMark[] } | null>(null);
  useEffect(() => setPinned(null), [ex]);
  const moveArrow: BoardArrow = { from: ex.uci.slice(0, 2) as Square, to: ex.uci.slice(2, 4) as Square, kind: 'good' };

  const focus = (key: string, arrows: BoardArrow[] = [], marks: SquareMark[] = []) => ({
    onMouseEnter: () => onFocusArrows?.(arrows, marks),
    onMouseLeave: () => onFocusArrows?.(pinned?.arrows ?? [], pinned?.marks ?? []),
    onClick: () => {
      const next = pinned?.key === key ? null : { key, arrows, marks };
      setPinned(next);
      onFocusArrows?.(next?.arrows ?? [], next?.marks ?? []);
    },
  });

  const groups = ORDER.map((cat) => ({ cat, points: ex.points.filter((p) => p.category === cat) })).filter((g) => g.points.length);

  return (
    <div className="expl">
      {title && <div className="expl-title muted">{title}</div>}
      <div className="expl-head">
        <span className="expl-san">{ex.san}</span>
        <span className="badge" title="Évaluation après ce coup (point de vue des Blancs)">{ex.evalText}</span>
      </div>
      <p className="expl-headline">{ex.headline}</p>

      {groups.map((g) => (
        <div className="expl-group" key={g.cat}>
          <span className={`badge ${CATEGORY[g.cat].cls}`}>{CATEGORY[g.cat].label}</span>
          <ul>
            {g.points.map((p, i) => {
              const key = `${g.cat}-${i}`;
              const arrows = p.arrows?.length ? p.arrows : [moveArrow];
              return (
                <li key={key} className={`expl-point${pinned?.key === key ? ' pinned' : ''}`} {...focus(key, arrows, p.marks ?? [])}>
                  {p.text}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {ex.plan && (
        <div className="expl-plan" {...focus('plan', [moveArrow])}>
          <span className="badge">Plan</span>
          <p>{ex.plan.text}</p>
          <p className="mono muted">{ex.plan.line}</p>
        </div>
      )}

      {!hideAlternatives && ex.alternatives.length > 0 && (
        <div className="expl-alts">
          <h4>Et les autres coups ?</h4>
          {ex.alternatives.map((a) => {
            const arrow: BoardArrow = { from: a.uci.slice(0, 2) as Square, to: a.uci.slice(2, 4) as Square, kind: a.lossCp <= 0 ? 'good' : 'idea' };
            return (
              <details key={a.uci} className="expl-alt" onMouseEnter={() => onFocusArrows?.([arrow], [])} onMouseLeave={() => onFocusArrows?.(pinned?.arrows ?? [], pinned?.marks ?? [])}>
                <summary>
                  {a.lossCp <= 0 ? 'Meilleur : ' : 'Pourquoi pas '}
                  <strong>{a.san}</strong>
                  {a.lossCp <= 0 ? '' : ' ?'} <span className={`badge ${a.lossCp <= 0 ? 'good' : a.lossCp >= 120 ? 'bad' : a.lossCp >= 50 ? 'warn' : ''}`}>{lossText(a.lossCp)}</span>
                </summary>
                <p>{a.text}</p>
                {a.line && <p className="mono muted">{a.line}</p>}
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
