// Briques communes des graphiques (recharts) : couleurs par rôle (variables CSS du bloc
// « Stats/MyGames » de styles.css, déclinées en clair/sombre), infobulle, axes discrets.
import type { ReactNode } from 'react';
import type { TimeClass } from '../../api/chesscom';

/** Couleurs catégorielles par cadence : la couleur suit l'entité, jamais son rang. */
export const TIME_CLASS_COLORS: Record<TimeClass, string> = {
  rapid: 'var(--viz-1)',
  blitz: 'var(--viz-2)',
  bullet: 'var(--viz-3)',
  daily: 'var(--viz-4)',
};

export const WDL_COLORS = { win: 'var(--viz-win)', draw: 'var(--viz-draw)', loss: 'var(--viz-loss)' };

export const AXIS_PROPS = {
  stroke: 'var(--viz-axis-line)',
  tick: { fill: 'var(--viz-axis)', fontSize: 12 },
  tickLine: false,
} as const;

export const GRID_PROPS = { stroke: 'var(--viz-grid)', strokeDasharray: '0', vertical: false } as const;

export function ChartCard({ title, subtitle, children, actions }: { title: string; subtitle?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="card viz-card">
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

export const fmtPct = (x: number) => `${Math.round(x)} %`;
