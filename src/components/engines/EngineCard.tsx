import type { EngineSheet } from '../../content/engines';
import { rich } from './RichText';

const FIELDS: [keyof EngineSheet, string][] = [
  ['origin', 'Origine'],
  ['license', 'Licence'],
  ['search', 'Recherche'],
  ['evaluation', 'Évaluation'],
  ['hardware', 'Matériel'],
  ['strength', 'Force'],
  ['style', 'Style de jeu'],
  ['specifics', 'Particularités'],
  ['whereToMeet', 'Où le croiser'],
];

/** Fiche moteur dépliable. */
export default function EngineCard({ engine, open, onToggle }: { engine: EngineSheet; open: boolean; onToggle: (open: boolean) => void }) {
  return (
    <details
      className="card eng-card"
      open={open}
      onToggle={(e) => {
        const isOpen = (e.currentTarget as HTMLDetailsElement).open;
        if (isOpen !== open) onToggle(isOpen);
      }}
    >
      <summary>
        <span className="eng-card-head">
          <strong className="eng-card-name">{engine.name}</strong>
          <span className="eng-card-badges">
            <span className={`badge ${engine.openSource ? 'good' : 'warn'}`}>{engine.openSource ? 'Open source' : 'Propriétaire'}</span>
            {engine.historical && <span className="badge">Historique</span>}
          </span>
        </span>
        <span className="muted eng-card-tagline">{engine.tagline}</span>
      </summary>
      <dl className="eng-dl">
        {FIELDS.map(([k, label]) => (
          <div key={k}>
            <dt>{label}</dt>
            <dd>{rich(String(engine[k]))}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
