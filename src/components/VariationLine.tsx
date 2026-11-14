import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { MoveSequence } from '../analysis/types';
import { parseUci } from '../lib/chessUtils';
import { sanToFrench } from '../lib/frenchMoves';

/** Position simulée affichée sur l'échiquier pendant l'exploration d'une variation. */
export interface BoardPreview {
  fen: string;
  lastMove: { from: string; to: string };
  /** Libellé du coup affiché (ex. « 25. g3 »). */
  label: string;
  /** Numéro du demi-coup dans la variation (1 = premier coup) et longueur totale. */
  step: number;
  total: number;
}

interface Step {
  san: string;
  label: string;
  /** Préfixe de numéro à afficher devant le coup (« 24. », « 24… » ou rien). */
  num: string;
  preview: BoardPreview;
}

function buildSteps(seq: MoveSequence, max: number, french = false): Step[] {
  const chess = new Chess(seq.fen);
  const parts = seq.fen.split(' ');
  let moveNo = parseInt(parts[5] ?? '1', 10);
  let white = parts[1] !== 'b';
  const uci = seq.uci.slice(0, max);
  const steps: Step[] = [];
  for (let i = 0; i < uci.length; i++) {
    let m;
    try {
      m = chess.move(parseUci(uci[i]));
    } catch {
      break;
    }
    const num = white ? `${moveNo}.` : i === 0 ? `${moveNo}…` : '';
    const san = french ? sanToFrench(m.san) : m.san;
    const label = `${white ? `${moveNo}.` : `${moveNo}…`} ${san}`;
    steps.push({ san, num, label, preview: { fen: chess.fen(), lastMove: { from: m.from, to: m.to }, label, step: i + 1, total: 0 } });
    if (!white) moveNo++;
    white = !white;
  }
  steps.forEach((s) => (s.preview.total = steps.length));
  return steps;
}

export interface VariationLineProps {
  seq: MoveSequence;
  /** Position simulée à afficher (null = revenir à la vraie position). */
  onPreview: (p: BoardPreview | null) => void;
  max?: number;
  className?: string;
  /** Notation française (R, D, T, F, C) comme dans les leçons. */
  french?: boolean;
}

/**
 * Variation interactive : survoler (ou toucher) un coup montre sur l'échiquier la position après ce coup,
 * comme si on rejouait la suite. Le bouton ▶ rejoue toute la séquence ; quitter la ligne rend la vraie position.
 */
export default function VariationLine({ seq, onPreview, max = 12, className = '', french = false }: VariationLineProps) {
  const steps = useMemo(() => buildSteps(seq, max, french), [seq, max, french]);
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const show = (i: number | null) => {
    setActive(i);
    onPreview(i === null ? null : steps[i].preview);
  };
  const stopPlay = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };

  // Nettoyage : si la variation change ou disparaît, l'échiquier revient à la vraie position.
  useEffect(() => {
    setActive(null);
    setPinned(null);
    stopPlay();
    return () => {
      stopPlay();
      onPreview(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq]);

  const play = () => {
    if (playing) {
      stopPlay();
      return;
    }
    setPlaying(true);
    let i = 0;
    show(0);
    setPinned(0);
    timer.current = window.setInterval(() => {
      i++;
      if (i >= steps.length) {
        stopPlay();
        return;
      }
      show(i);
      setPinned(i);
    }, 900);
  };

  if (!steps.length) return null;

  return (
    <div
      className={`varline ${className}`}
      onMouseLeave={() => {
        if (playing) return;
        show(pinned);
      }}
    >
      <button
        type="button"
        className={`varline-play${playing ? ' on' : ''}`}
        onClick={play}
        title={playing ? 'Arrêter' : 'Rejouer la séquence sur l’échiquier'}
        aria-label={playing ? 'Arrêter la lecture' : 'Rejouer la séquence sur l’échiquier'}
      >
        {playing ? (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <rect x="3" y="3" width="10" height="10" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
            <path d="M4 2.5v11l9.5-5.5z" fill="currentColor" />
          </svg>
        )}
      </button>
      <span className="varline-moves">
        {steps.map((s, i) => (
          <span key={i} className="varline-item">
            {s.num && <span className="varline-num">{s.num}</span>}
            <button
              type="button"
              className={`varline-move${active === i ? ' active' : ''}${pinned === i ? ' pinned' : ''}`}
              onMouseEnter={() => !playing && show(i)}
              onFocus={() => !playing && show(i)}
              onClick={() => {
                stopPlay();
                const next = pinned === i ? null : i;
                setPinned(next);
                show(next);
              }}
              aria-pressed={pinned === i}
              title={`Voir la position après ${s.label}`}
            >
              {s.san}
            </button>
          </span>
        ))}
      </span>
      {pinned !== null && !playing && (
        <button
          type="button"
          className="varline-reset"
          onClick={() => {
            setPinned(null);
            show(null);
          }}
          title="Revenir à la position réelle"
        >
          ✕
        </button>
      )}
    </div>
  );
}
