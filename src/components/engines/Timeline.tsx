import { useState } from 'react';
import { ERA_LABELS, HISTORY, type Era } from '../../content/engines';
import { rich } from './RichText';

const ERAS = Object.keys(ERA_LABELS) as Era[];

/** Frise chronologique verticale, filtrable par époque. */
export default function Timeline() {
  const [era, setEra] = useState<Era | 'all'>('all');
  const events = HISTORY.filter((e) => era === 'all' || e.era === era);
  return (
    <div>
      <div className="eng-chips" role="group" aria-label="Filtrer par époque">
        <button className={`eng-chip${era === 'all' ? ' active' : ''}`} onClick={() => setEra('all')}>
          Tout
        </button>
        {ERAS.map((e) => (
          <button key={e} className={`eng-chip era-${e}${era === e ? ' active' : ''}`} onClick={() => setEra(e)}>
            <span className="eng-dot" aria-hidden /> {ERA_LABELS[e]}
          </button>
        ))}
      </div>
      <ol className="eng-timeline">
        {events.map((e) => (
          <li key={e.year + e.title} className={`era-${e.era}`}>
            <span className="eng-tl-marker" aria-hidden />
            <div className="eng-tl-year">{e.year}</div>
            <div className="eng-tl-body">
              <h3>{e.title}</h3>
              <p>{rich(e.text)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
