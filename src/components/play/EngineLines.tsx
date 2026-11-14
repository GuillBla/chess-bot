// Panneau « Moteur » compact (ergonomie « salle d'analyse ») : profondeur + lignes MultiPV avec score en pastille.
import type { EngineLine } from '../../engine/stockfish';
import { formatLine, formatScore } from '../../lib/chessUtils';

export interface EngineLinesProps {
  fen: string;
  lines: EngineLine[];
  depth: number;
  maxDepth: number;
  /** Recherche terminée (profondeur cible atteinte). */
  done: boolean;
  /** Recherche démarrée pour cette position. */
  started: boolean;
  /** Message à la place des lignes (ex. fin de partie). */
  status?: string | null;
  /** Nombre de lignes attendues (squelette pendant le calcul). */
  multipv?: number;
  selected: number;
  onSelect: (index: number) => void;
  onHover?: (index: number | null) => void;
}

export default function EngineLines({ fen, lines, depth, maxDepth, done, started, status, multipv = 3, selected, onSelect, onHover }: EngineLinesProps) {
  const turn = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const pct = Math.round((Math.min(depth, maxDepth) / maxDepth) * 100);
  return (
    <div className="engine">
      <div className="engine-head">
        <h3>Moteur</h3>
        <span className="engine-meta">Stockfish 17.1</span>
        {!status && (
          <span className="engine-depth" title={done ? 'Analyse terminée' : 'Analyse en cours'}>
            {!done && started && <span className="spinner" aria-hidden />}
            {started ? `prof. ${depth}/${maxDepth}` : 'en attente…'}
          </span>
        )}
      </div>
      {!status && (
        <div className="engine-progress" aria-hidden>
          <i style={{ width: `${started ? pct : 0}%` }} />
        </div>
      )}
      {status ? (
        <p className="engine-status">{status}</p>
      ) : (
        <ol className="engine-lines">
          {lines.map((l, i) => {
            const text = formatLine(fen, l.pv, 12);
            return (
              <li key={l.multipv}>
                <button
                  type="button"
                  className={`engine-line${i === 0 ? ' best' : ''}${selected === i ? ' selected' : ''}`}
                  onClick={() => onSelect(i)}
                  onMouseEnter={() => onHover?.(i)}
                  onMouseLeave={() => onHover?.(null)}
                  onFocus={() => onHover?.(i)}
                  onBlur={() => onHover?.(null)}
                  aria-pressed={selected === i}
                  title={text}
                >
                  <span className="engine-score">{formatScore(l, turn)}</span>
                  <span className="engine-pv">{text}</span>
                </button>
              </li>
            );
          })}
          {Array.from({ length: done ? 0 : Math.max(0, multipv - lines.length) }, (_, k) => (
            <li key={`sk-${k}`} aria-hidden>
              <div className="engine-line skeleton">
                <span className="engine-score">…</span>
                <span className="engine-pv" />
              </div>
            </li>
          ))}
        </ol>
      )}
      {!status && lines.length > 1 && <p className="engine-hint">Cliquez une ligne pour l’expliquer.</p>}
    </div>
  );
}
