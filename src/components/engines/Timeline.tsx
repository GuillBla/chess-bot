import { useState } from 'react';
import { ERA_LABELS, HISTORY, type Era } from '../../content/engines';
import { rich } from './RichText';

const ERAS = Object.keys(ERA_LABELS) as Era[];

/** Frise chronologique verticale (années en marge, filet de laiton), filtrable par époque. */
export default function Timeline() {
  const [era, setEra] = useState<Era | 'all'>('all');
  const events = HISTORY.filter((e) => era === 'all' || e.era === era);
  return (
    <div className="eng-tl-wrap">
      <div className="eng-chips" role="group" aria-label="Filtrer par époque">
        <button className={`eng-chip${era === 'all' ? ' active' : ''}`} aria-pressed={era === 'all'} onClick={() => setEra('all')}>
          Toutes les époques
        </button>
        {ERAS.map((e) => (
          <button key={e} className={`eng-chip era-${e}${era === e ? ' active' : ''}`} aria-pressed={era === e} onClick={() => setEra(e)}>
            <span className="eng-dot" aria-hidden /> {ERA_LABELS[e]}
          </button>
        ))}
      </div>
      <ol className="eng-timeline">
        {events.map((e) => (
          <li key={e.year + e.title} className={`era-${e.era}`}>
            <div className="eng-tl-year">{e.year}</div>
            <span className="eng-tl-marker" aria-hidden />
            <div className="eng-tl-body">
              <span className="eng-tl-era">{ERA_LABELS[e.era]}</span>
              <h3>{e.title}</h3>
              <p>{rich(e.text)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
