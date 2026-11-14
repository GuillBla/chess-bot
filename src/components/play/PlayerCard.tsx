// Carte joueur au-dessus / au-dessous de l'échiquier (comme sur chess.com) : nom, Elo, pièces prises, état.
import type { ReactNode } from 'react';
import { PieceIcon, type PieceCode } from '../pieces';
import { PIECE_VALUES } from '../../lib/chessUtils';

const START_COUNT: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const ORDER = ['q', 'r', 'b', 'n', 'p'] as const;

/** Pièces prises par chaque camp et avance matérielle (points), à partir de la FEN. */
export function materialInfo(fen: string) {
  const board = fen.split(' ')[0] ?? '';
  const count = { w: {} as Record<string, number>, b: {} as Record<string, number> };
  for (const ch of board) {
    if (!/[pnbrqk]/i.test(ch)) continue;
    const side = ch === ch.toUpperCase() ? 'w' : 'b';
    const t = ch.toLowerCase();
    count[side][t] = (count[side][t] ?? 0) + 1;
  }
  const points = (s: 'w' | 'b') => ORDER.reduce((acc, t) => acc + (count[s][t] ?? 0) * PIECE_VALUES[t], 0);
  /** Pièces adverses prises par `s`. */
  const captured = (s: 'w' | 'b') => {
    const o = s === 'w' ? 'b' : 'w';
    return ORDER.flatMap((t) => Array.from({ length: Math.max(0, START_COUNT[t] - (count[o][t] ?? 0)) }, () => `${o}${t.toUpperCase()}` as PieceCode));
  };
  const diff = points('w') - points('b');
  return { captured, diff };
}

export interface PlayerCardProps {
  side: 'w' | 'b';
  name: string;
  /** Ligne secondaire : Elo, niveau… */
  detail?: ReactNode;
  fen: string;
  /** C'est à ce camp de jouer (liseré laiton). */
  active?: boolean;
  /** État affiché à droite (ex. « réfléchit… »). */
  status?: ReactNode;
  you?: boolean;
}

export default function PlayerCard({ side, name, detail, fen, active, status, you }: PlayerCardProps) {
  const { captured, diff } = materialInfo(fen);
  const lead = side === 'w' ? diff : -diff;
  const pieces = captured(side);
  return (
    <div className={`player-card${active ? ' active' : ''}${you ? ' you' : ''}`}>
      <span className="player-avatar" aria-hidden>
        <PieceIcon piece={side === 'w' ? 'wK' : 'bK'} size={30} />
      </span>
      <div className="player-id">
        <div className="player-name">
          {name}
          {detail && <span className="player-detail">{detail}</span>}
        </div>
        <div className="player-captured" aria-label={`Pièces prises : ${pieces.length}`}>
          {pieces.map((p, i) => (
            <span key={i} className="player-capt">
              <PieceIcon piece={p} size={16} />
            </span>
          ))}
          {lead > 0 && <span className="player-lead">+{lead}</span>}
        </div>
      </div>
      {status && <div className="player-status">{status}</div>}
    </div>
  );
}
