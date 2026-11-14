import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Square } from 'chess.js';
import type { BoardArrow, ExplanationPoint, MoveExplanation, SquareMark } from '../analysis/types';
import { MOVE_CLASS_LABELS, type MoveClass } from '../analysis/classify';
import { BADGE_SYMBOLS, moveNumberLabel } from './play/moveClass';

export interface ExplanationPanelProps {
  explanation: MoveExplanation;
  /** Appelé au survol / clic d'un point : flèches et cases à afficher sur l'échiquier ([] = revenir à l'affichage par défaut). */
  onFocusArrows?: (arrows: BoardArrow[], marks: SquareMark[]) => void;
  /** Titre optionnel au-dessus du coup (ex. « Indice », « Coup joué »). */
  title?: string;
  /** Masque la section des alternatives. */
  hideAlternatives?: boolean;
  /** Classification du coup (pastille dans l'en-tête). */
  cls?: MoveClass | null;
  /** Position AVANT le coup : sert à afficher le numéro (« 16. Qb8+ » / « 16… Nf6 »). */
  fenBefore?: string;
}

const CATEGORY: Record<ExplanationPoint['category'], { label: string; cls: string }> = {
  tactique: { label: 'Tactique', cls: 'warn' },
  menace: { label: 'Menace', cls: 'bad' },
  défense: { label: 'Défense', cls: 'good' },
  roi: { label: 'Roi', cls: 'bad' },
  positionnel: { label: 'Position', cls: 'idea' },
  structure: { label: 'Structure', cls: 'idea' },
  finale: { label: 'Finale', cls: 'good' },
  plan: { label: 'Plan', cls: '' },
};

/** « Ce que fait le coup » : tout ce qui décrit l'effet immédiat du coup. */
const DOES: ExplanationPoint['category'][] = ['tactique', 'défense', 'roi', 'positionnel', 'structure', 'finale'];

function lossText(cp: number): string {
  if (cp <= 0) return 'meilleur';
  const pawns = cp / 100;
  return `−${pawns.toFixed(1).replace('.', ',')} ${pawns >= 2 ? 'pions' : 'pion'}`;
}

function lossTone(cp: number): string {
  if (cp <= 0) return 'good';
  if (cp >= 120) return 'bad';
  if (cp >= 50) return 'warn';
  return '';
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="expl-block">
      <h4 className="expl-block-title">{title}</h4>
      {children}
    </section>
  );
}

/**
 * Explication d'un coup en trois temps : en-tête (coup, éval, classification), idée principale,
 * puis des blocs fixes (ce que fait le coup, ce que ça menace, plan, pourquoi pas…).
 */
export default function ExplanationPanel({ explanation: ex, onFocusArrows, title, hideAlternatives, cls, fenBefore }: ExplanationPanelProps) {
  const [pinned, setPinned] = useState<{ key: string; arrows: BoardArrow[]; marks: SquareMark[] } | null>(null);
  useEffect(() => setPinned(null), [ex]);
  const moveArrow: BoardArrow = { from: ex.uci.slice(0, 2) as Square, to: ex.uci.slice(2, 4) as Square, kind: 'good' };

  const restore = () => onFocusArrows?.(pinned?.arrows ?? [], pinned?.marks ?? []);
  const toggle = (key: string, arrows: BoardArrow[], marks: SquareMark[]) => {
    const next = pinned?.key === key ? null : { key, arrows, marks };
    setPinned(next);
    onFocusArrows?.(next?.arrows ?? [], next?.marks ?? []);
  };
  /** Survol / focus = aperçu des flèches ; clic / Entrée = épingler. */
  const focusable = (key: string, arrows: BoardArrow[] = [], marks: SquareMark[] = []) => ({
    tabIndex: 0,
    role: 'button' as const,
    'aria-pressed': pinned?.key === key,
    onMouseEnter: () => onFocusArrows?.(arrows, marks),
    onMouseLeave: restore,
    onFocus: () => onFocusArrows?.(arrows, marks),
    onBlur: restore,
    onClick: () => toggle(key, arrows, marks),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(key, arrows, marks);
      }
    },
  });

  const renderPoints = (points: ExplanationPoint[], prefix: string, showTag: boolean) => (
    <ul className="expl-points">
      {points.map((p, i) => {
        const key = `${prefix}-${i}`;
        const arrows = p.arrows?.length ? p.arrows : [moveArrow];
        return (
          <li key={key} className={`expl-point${pinned?.key === key ? ' pinned' : ''}`} {...focusable(key, arrows, p.marks ?? [])}>
            {showTag && <span className={`badge ${CATEGORY[p.category].cls}`}>{CATEGORY[p.category].label}</span>}
            <span className="expl-point-text">{p.text}</span>
          </li>
        );
      })}
    </ul>
  );

  const does = DOES.flatMap((cat) => ex.points.filter((p) => p.category === cat));
  const threats = ex.points.filter((p) => p.category === 'menace');
  const planPoints = ex.points.filter((p) => p.category === 'plan');
  const showAlts = !hideAlternatives && ex.alternatives.length > 0;

  return (
    <div className="expl">
      {title && <div className="eyebrow expl-title">{title}</div>}
      <div className="expl-head">
        <span className="expl-san">
          {fenBefore && <span className="expl-num">{moveNumberLabel(fenBefore)}</span>}
          {ex.san}
        </span>
        {cls && (
          <span className="expl-cls">
            <span className={`cls-chip cls-${cls}`} aria-hidden>
              {BADGE_SYMBOLS[cls]}
            </span>
            <span className={`expl-cls-label cls-${cls}`}>{MOVE_CLASS_LABELS[cls]}</span>
          </span>
        )}
        <span className="expl-eval" title="Évaluation après ce coup (point de vue des Blancs)">
          {ex.evalText}
        </span>
      </div>
      <p className="expl-headline">{ex.headline}</p>

      {does.length > 0 && <Block title="Ce que fait le coup">{renderPoints(does, 'does', true)}</Block>}

      {threats.length > 0 && <Block title="Ce que ça menace">{renderPoints(threats, 'threat', false)}</Block>}

      {(ex.plan || planPoints.length > 0) && (
        <Block title="Plan">
          {planPoints.length > 0 && renderPoints(planPoints, 'plan', false)}
          {ex.plan && (
            <div className={`expl-plan expl-point${pinned?.key === 'plan' ? ' pinned' : ''}`} {...focusable('plan', [moveArrow])}>
              <p className="expl-point-text">{ex.plan.text}</p>
              {ex.plan.line && <p className="expl-line">{ex.plan.line}</p>}
            </div>
          )}
        </Block>
      )}

      {showAlts && (
        <Block title="Pourquoi pas… ?">
          <div className="expl-alts">
            {ex.alternatives.map((a) => {
              const arrow: BoardArrow = { from: a.uci.slice(0, 2) as Square, to: a.uci.slice(2, 4) as Square, kind: a.lossCp <= 0 ? 'good' : 'idea' };
              const preview = () => onFocusArrows?.([arrow], []);
              return (
                <details key={a.uci} className="expl-alt" onMouseEnter={preview} onMouseLeave={restore}>
                  <summary onFocus={preview} onBlur={restore}>
                    <span className="expl-alt-q">
                      {a.lossCp <= 0 ? 'Meilleur : ' : 'Pourquoi pas '}
                      <strong className="expl-alt-san">{a.san}</strong>
                      {a.lossCp <= 0 ? '' : ' ?'}
                    </span>
                    <span className={`badge ${lossTone(a.lossCp)}`}>{lossText(a.lossCp)}</span>
                  </summary>
                  <p>{a.text}</p>
                  {a.line && <p className="expl-line">{a.line}</p>}
                </details>
              );
            })}
          </div>
        </Block>
      )}
    </div>
  );
}
