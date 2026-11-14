// Briques communes des graphiques (recharts) : couleurs par rôle (variables --viz-* de
// src/styles/stats.css, déclinées en clair/sombre), infobulle, axes discrets, sélecteur segmenté.
import type { ReactNode } from 'react';
import type { Outcome, TimeClass } from '../../api/chesscom';

/** Couleurs catégorielles par cadence : la couleur suit l'entité, jamais son rang. */
export const TIME_CLASS_COLORS: Record<TimeClass, string> = {
  rapid: 'var(--viz-1)',
  blitz: 'var(--viz-2)',
  bullet: 'var(--viz-3)',
  daily: 'var(--viz-4)',
};

export const WDL_COLORS = { win: 'var(--viz-win)', draw: 'var(--viz-draw)', loss: 'var(--viz-loss)' };
/** Encre lisible posée sur chaque couleur V/N/D (étiquettes directes). */
export const WDL_INK = { win: 'var(--viz-on-win)', draw: 'var(--viz-on-draw)', loss: 'var(--viz-on-loss)' };

export const AXIS_PROPS = {
  stroke: 'var(--viz-axis-line)',
  tick: { fill: 'var(--viz-axis)', fontSize: 12 },
  tickLine: false,
} as const;

export const GRID_PROPS = { stroke: 'var(--viz-grid)', strokeDasharray: '0', vertical: false } as const;

export function ChartCard({
  title,
  subtitle,
  children,
  actions,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card viz-card ${className}`}>
      <div className="viz-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="muted viz-sub">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function TooltipBox({ title, rows }: { title?: ReactNode; rows: { color?: string; label: ReactNode; value: ReactNode }[] }) {
  return (
    <div className="viz-tooltip">
      {title && <div className="viz-tooltip-title">{title}</div>}
      {rows.map((r, i) => (
        <div key={i} className="viz-tooltip-row">
          {r.color && <span className="viz-swatch" style={{ background: r.color }} />}
          <span className="viz-tooltip-label">{r.label}</span>
          <span className="viz-tooltip-value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="viz-legend">
      {items.map((it) => (
        <span key={it.label} className="viz-legend-item">
          <span className="viz-swatch" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** Sélecteur segmenté (période, cadence…). */
export function Seg<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="viz-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className={value === o.id ? 'active' : ''} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const RESULT_LETTER: Record<Outcome, string> = { win: 'V', draw: 'N', loss: 'D' };
const RESULT_LABEL: Record<Outcome, string> = { win: 'Victoire', draw: 'Nulle', loss: 'Défaite' };

/** Pastille de résultat V / N / D (lettre + couleur : jamais la couleur seule). */
export function ResultPill({ outcome, title, small }: { outcome: Outcome; title?: string; small?: boolean }) {
  return (
    <span className={`res-pill ${outcome}${small ? ' sm' : ''}`} title={title ?? RESULT_LABEL[outcome]} aria-label={title ?? RESULT_LABEL[outcome]} role="img">
      {RESULT_LETTER[outcome]}
    </span>
  );
}

export const fmtPct = (x: number) => `${Math.round(x)} %`;
export const fmtSigned = (x: number) => (x > 0 ? `+${x}` : x < 0 ? `−${Math.abs(x)}` : '±0');
