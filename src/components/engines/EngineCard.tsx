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

/** Fiche moteur dépliable, façon fiche de catalogue de bibliothèque. */
export default function EngineCard({
  engine,
  index,
  open,
  onToggle,
}: {
  engine: EngineSheet;
  /** Rang dans le catalogue, affiché comme une cote (« MOT·01 »). */
  index?: number;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  const cote = index !== undefined ? `MOT·${String(index + 1).padStart(2, '0')}` : null;
  return (
    <details
      className="eng-card"
      open={open}
      onToggle={(e) => {
        const isOpen = (e.currentTarget as HTMLDetailsElement).open;
        if (isOpen !== open) onToggle(isOpen);
      }}
    >
      <summary>
        <span className="eng-card-top">
          {cote && <span className="eng-card-cote">{cote}</span>}
          <span className="eng-card-badges">
            <span className={`badge ${engine.openSource ? 'good' : 'warn'}`}>{engine.openSource ? 'Open source' : 'Propriétaire'}</span>
            {engine.historical && <span className="badge">Historique</span>}
          </span>
        </span>
        <strong className="eng-card-name">{engine.name}</strong>
        <span className="eng-card-tagline">{engine.tagline}</span>
        <span className="eng-card-toggle" aria-hidden>
          {open ? 'Replier la fiche' : 'Lire la fiche'}
        </span>
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
