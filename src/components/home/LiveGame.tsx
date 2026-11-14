import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chess } from 'chess.js';
import Board, { type BoardBadge } from '../Board';
import { FAMOUS_GAMES, notePly, plyLabel, sanToFr, type FamousGame, type GameNote } from '../../content/famousGames';

const STEP_MS = 1600;
const RESTART_MS = 5000;

interface Replay {
  fens: string[];
  moves: { from: string; to: string; san: string }[];
  pgn: string;
  notes: Map<number, GameNote>;
}

function buildReplay(g: FamousGame): Replay {
  const c = new Chess();
  const headers: [string, string][] = [
    ['Event', g.title],
    ['Site', g.place],
    ['Date', `${g.year}.??.??`],
    ['White', g.white],
    ['Black', g.black],
    ['Result', g.result],
  ];
  for (const [k, v] of headers) c.setHeader(k, v);
  const fens = [c.fen()];
  const moves: Replay['moves'] = [];
  for (const san of g.moves) {
    const m = c.move(san);
    moves.push({ from: m.from, to: m.to, san: m.san });
    fens.push(c.fen());
  }
  return { fens, moves, pgn: c.pgn(), notes: new Map(g.notes.map((n) => [notePly(n), n])) };
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Petites icônes de lecture (SVG plutôt que ⏮ ⏸ qui s'affichent en emoji sur certains systèmes). */
function Icon({ name }: { name: 'first' | 'prev' | 'play' | 'pause' | 'next' | 'last' }) {
  const paths: Record<typeof name, string> = {
    first: 'M5 4h2v16H5zM19 4v16L8 12z',
    prev: 'M18 4v16L7 12z',
    play: 'M7 4v16l12-8z',
    pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
    next: 'M6 4v16l11-8z',
    last: 'M17 4h2v16h-2zM5 4v16l11-8z',
  };
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d={paths[name]} fill="currentColor" />
    </svg>
  );
}

/** Échiquier vivant de l'accueil : rejoue une partie célèbre, commentée en français. */
export default function LiveGame() {
  const [gameIdx, setGameIdx] = useState(0);
  const [ply, setPly] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);

  const game = FAMOUS_GAMES[gameIdx];
  const replay = useMemo(() => buildReplay(game), [game]);
  const total = replay.moves.length;

  // Lecture automatique : un coup toutes les 1,6 s, pause au survol, reprise du début après la fin.
  useEffect(() => {
    if (!playing || hovered) return;
    const t = window.setTimeout(() => setPly((p) => (p >= total ? 0 : p + 1)), ply >= total ? RESTART_MS : STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, hovered, ply, total]);

  const go = (p: number) => {
    setPlaying(false);
    setPly(Math.max(0, Math.min(total, p)));
  };

  const selectGame = (i: number) => {
    setGameIdx(i);
    setPly(0);
  };

  // Coup courant (ply - 1) et dernier commentaire pertinent
  const cur = ply - 1;
  const move = cur >= 0 ? replay.moves[cur] : null;
  const note = cur >= 0 ? replay.notes.get(cur) : undefined;
  let lastNote: GameNote | undefined;
  for (let i = cur; i >= 0 && !lastNote; i--) lastNote = replay.notes.get(i);
  const comment = lastNote?.text ?? game.intro;
  const commentPly = lastNote ? notePly(lastNote) : -1;

  const badge: BoardBadge | null =
    move && note?.glyph && (note.glyph === '!!' || note.glyph === '!')
      ? { square: move.to, cls: note.glyph === '!!' ? 'brilliant' : 'great', symbol: note.glyph, title: note.glyph === '!!' ? 'Coup brillant' : 'Très bon coup' }
      : null;

  // Ligne de la feuille : coup blanc + coup noir du numéro courant
  const rowStart = cur >= 0 ? cur - (cur % 2) : 0;
  const rowNum = rowStart / 2 + 1;
  const cell = (i: number) => {
    const m = replay.moves[i];
    if (!m) return <span className="home-sheet-move" />;
    const glyph = replay.notes.get(i)?.glyph ?? '';
    return (
      <span className={i === cur ? 'home-sheet-move current' : 'home-sheet-move'}>
        {i <= cur ? sanToFr(m.san) + glyph : '…'}
      </span>
    );
  };

  return (
    <figure
      className="home-live"
      aria-label={`${game.title} : ${game.white} – ${game.black}, ${game.year}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="home-live-games" role="group" aria-label="Choisir une partie">
        {FAMOUS_GAMES.map((g, i) => (
          <button key={g.id} type="button" className={i === gameIdx ? 'on' : ''} aria-pressed={i === gameIdx} onClick={() => selectGame(i)}>
            {g.label}
          </button>
        ))}
      </div>

      <Board
        id="home-live"
        fen={replay.fens[ply]}
        lastMove={move ? { from: move.from, to: move.to } : null}
        arrows={note?.arrows ?? []}
        badge={badge}
        sound={false}
        maxWidth={560}
      />

      <div className="home-live-controls" role="group" aria-label="Lecture de la partie">
        <button type="button" className="btn" onClick={() => go(0)} disabled={ply === 0} aria-label="Début de la partie" title="Début">
          <Icon name="first" />
        </button>
        <button type="button" className="btn" onClick={() => go(ply - 1)} disabled={ply === 0} aria-label="Coup précédent" title="Coup précédent">
          <Icon name="prev" />
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            if (!playing && ply >= total) setPly(0);
            setPlaying((p) => !p);
          }}
          aria-label={playing ? 'Mettre en pause' : 'Lecture automatique'}
          title={playing ? 'Pause' : 'Lecture'}
        >
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <button type="button" className="btn" onClick={() => go(ply + 1)} disabled={ply === total} aria-label="Coup suivant" title="Coup suivant">
          <Icon name="next" />
        </button>
        <button type="button" className="btn" onClick={() => go(total)} disabled={ply === total} aria-label="Fin de la partie" title="Fin">
          <Icon name="last" />
        </button>
        <span className="home-live-progress mono" aria-hidden="true">
          {ply}/{total}
          {playing && hovered && <em> · pause</em>}
        </span>
      </div>

      <figcaption className="home-sheet">
        <div className="home-sheet-head">
          <span className="home-sheet-players">
            <strong>{game.white}</strong> – <strong>{game.black}</strong>
          </span>
          <span className="home-sheet-meta mono">
            {game.place}, {game.year} · {game.result.replace('1/2', '½')}
          </span>
        </div>
        <div className="home-sheet-row" aria-live="off">
          <span className="home-sheet-num">{cur >= 0 ? rowNum : '—'}</span>
          {cur >= 0 ? (
            <>
              {cell(rowStart)}
              {cell(rowStart + 1)}
            </>
          ) : (
            <span className="home-sheet-move muted">Position de départ</span>
          )}
        </div>
        <p className="home-sheet-comment">
          {lastNote && commentPly !== cur && (
            <span className="home-sheet-ref mono">{plyLabel(commentPly, replay.moves[commentPly].san, lastNote.glyph)} · </span>
          )}
          {comment}
        </p>
        <Link className="home-sheet-link" to="/analyze" state={{ pgn: replay.pgn }}>
          Analyser cette partie coup par coup →
        </Link>
      </figcaption>
    </figure>
  );
}
