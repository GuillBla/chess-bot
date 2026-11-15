import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import Board from '../Board';
import MoveText from '../MoveText';
import type { BoardPreview } from '../VariationLine';
import { sideColor, variationName, type OpeningNode } from '../../lib/openingTree';
import { START_FEN } from '../../lib/chessUtils';
import { sanToFrench } from '../../lib/frenchMoves';
import { getCard, grade } from '../../lib/openingSrs';
import { lineCardIds, type TrainLine } from '../../lib/openingSession';
import type { BoardArrow, SquareMark } from '../../analysis/types';
import { commentContexts, nodeLabel, sideName } from './shared';

interface Props {
  /** File de lignes à travailler (calculée au lancement de la séance). */
  queue: TrainLine[];
  /** Titre de la séance (« Révision du jour », « Système de Londres »…). */
  title: string;
  onExplore?: (t: TrainLine, nodeId: string) => void;
  onClose: () => void;
}

type Phase = 'learn' | 'recall';
type Result = 'good' | 'hard' | 'again';

interface LogEntry {
  node: OpeningNode;
  /** ours = notre coup ; opp = coup adverse ; learn = coup à apprendre (montré) ; miss = erreur de notre part. */
  kind: 'ours' | 'opp' | 'learn' | 'miss';
  text: string;
  result?: Result;
}

const OPP_DELAY = 650;

export default function OpeningTrainer({ queue, title, onExplore, onClose }: Props) {
  const [li, setLi] = useState(0);
  const t = queue[li] as TrainLine | undefined;
  const [phase, setPhase] = useState<Phase>('recall');
  const [k, setK] = useState(0); // prochain coup de la ligne à jouer
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(0);
  const [message, setMessage] = useState<{ kind: 'bad' | 'info'; text: string } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [session, setSession] = useState({ good: 0, total: 0, lines: 0 });
  const [preview, setPreview] = useState<BoardPreview | null>(null);
  const logEnd = useRef<HTMLDivElement>(null);

  const side = t?.opening.side ?? 'white';
  const color = sideColor(side);
  const line = t?.line ?? [];
  const current = line[k] as OpeningNode | undefined;
  const fen = k === 0 ? (t?.tree.root.fen ?? START_FEN) : line[k - 1].fen;
  const done = !!t && k >= line.length;
  const ourTurn = !!current && current.color === color;

  // Début d'une ligne : phase « apprendre » si elle contient des positions jamais vues
  const startLine = (index: number, forcePhase?: Phase) => {
    const next = queue[index];
    setLi(index);
    setK(0);
    setAttempts(0);
    setHint(0);
    setMessage(null);
    setLog([]);
    setResults([]);
    setPreview(null);
    if (!next) return;
    const unseen = lineCardIds(next.line, next.opening.side).some((id) => !getCard(next.opening.id, id));
    setPhase(forcePhase ?? (unseen ? 'learn' : 'recall'));
  };
  useEffect(() => {
    startLine(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  // Coup adverse joué automatiquement
  useEffect(() => {
    if (!current || ourTurn) return;
    const id = window.setTimeout(() => {
      setLog((l) => [...l, { node: current, kind: 'opp', text: current.comment }]);
      setK((x) => x + 1);
    }, OPP_DELAY);
    return () => window.clearTimeout(id);
  }, [current, ourTurn]);

  useEffect(() => {
    logEnd.current?.scrollIntoView?.({ block: 'nearest' });
  }, [log.length, message]);

  const ourMoves = useMemo(() => line.filter((n) => n.color === color).length, [line, color]);

  if (!t) {
    return (
      <div className="card op-trainer-empty">
        <p>Rien à travailler pour l’instant.</p>
        <button className="btn" onClick={onClose}>
          Retour
        </button>
      </div>
    );
  }

  const finishMove = (node: OpeningNode, result: Result | null) => {
    setLog((l) => [...l, { node, kind: phase === 'learn' ? 'learn' : 'ours', text: node.comment, result: result ?? undefined }]);
    if (result) {
      grade(t.opening.id, node.parent!.id, result);
      setResults((r) => [...r, result]);
      setSession((s) => ({ ...s, total: s.total + 1, good: s.good + (result === 'good' ? 1 : 0) }));
    }
    setAttempts(0);
    setHint(0);
    setMessage(null);
    setK(k + 1);
  };

  const onMove = (from: Square, to: Square, promotion?: string): boolean => {
    if (!current || !ourTurn) return false;
    const chess = new Chess(fen);
    let mv;
    try {
      mv = chess.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    const uci = mv.from + mv.to + (mv.promotion ?? '');
    setPreview(null);
    if (uci === current.uci) {
      if (phase === 'learn') finishMove(current, null);
      else finishMove(current, attempts > 0 ? 'again' : hint > 0 ? 'hard' : 'good');
      return true;
    }
    const sibling = current.parent?.children.find((c) => c.uci === uci);
    if (phase === 'learn') {
      setMessage({ kind: 'info', text: 'Joue le coup indiqué par la flèche verte : c’est celui qu’on apprend ici.' });
      return false;
    }
    if (sibling && !sibling.dubious) {
      setMessage({ kind: 'info', text: `${nodeLabel(sibling)} fait aussi partie du répertoire, mais cette ligne étudie un autre coup. Essaie encore.` });
      return false;
    }
    const n = attempts + 1;
    setAttempts(n);
    if (n >= 2) setHint(2);
    if (sibling?.dubious) {
      setLog((l) => [...l, { node: sibling, kind: 'miss', text: sibling.comment }]);
      setMessage({ kind: 'bad', text: `${nodeLabel(sibling)} est une erreur connue (expliquée ci-dessus). Cherche mieux.` });
    } else {
      setMessage({
        kind: 'bad',
        text: n >= 2 ? 'Ce n’est toujours pas le coup du répertoire : la flèche te le montre. Joue-le pour continuer.' : `${sanToFrench(mv.san)} n’est pas le coup du répertoire. Réessaie (ou demande un indice).`,
      });
    }
    return false;
  };

  // Aides visuelles
  const arrows: BoardArrow[] = [];
  const marks: SquareMark[] = [];
  if (current && ourTurn && !done) {
    if (phase === 'learn' || hint >= 2) arrows.push({ from: current.uci.slice(0, 2) as Square, to: current.uci.slice(2, 4) as Square, kind: 'good' });
    else if (hint === 1) marks.push({ square: current.uci.slice(0, 2) as Square, kind: 'target' });
  }
  const last = k > 0 ? line[k - 1] : null;
  const name = variationName(current ?? line[line.length - 1]);
  const lineResults = { good: results.filter((r) => r === 'good').length, total: results.length };

  return (
    <div className="board-layout two-col op-trainer">
      <div className="board-col">
        <Board
          id="opening-trainer"
          fen={fen}
          orientation={side}
          onMove={ourTurn && !done ? onMove : undefined}
          arrows={arrows}
          marks={marks}
          lastMove={last ? { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) } : null}
          preview={preview}
          maxWidth={720}
        />
        <div className="op-progress" aria-label="Progression dans la ligne">
          <span style={{ width: `${(k / Math.max(1, line.length)) * 100}%` }} />
        </div>
      </div>

      <div className="side-col op-side">
        <header className="op-train-head">
          <div>
            <span className="eyebrow">{title}</span>
            <h3>
              {t.opening.name}
              {name ? <small> · {name}</small> : null}
            </h3>
          </div>
          <span className="muted mono op-train-count">
            ligne {li + 1}/{queue.length}
          </span>
        </header>

        <p className={`op-phase ${phase}`}>
          {phase === 'learn' ? (
            <>
              <strong>Découverte.</strong> Nouvelle ligne : lis pourquoi chaque coup est joué, puis joue-le (flèche verte). Tu la rejoueras ensuite de mémoire.
            </>
          ) : (
            <>
              <strong>De mémoire.</strong> Tu joues {sideName(side)} : retrouve chaque coup du répertoire. L’adversaire répond tout seul.
            </>
          )}
        </p>

        <div className="op-log" aria-live="polite">
          {log.map((e, i) => (
            <div key={i} className={`op-log-entry ${e.kind}${e.result ? ` r-${e.result}` : ''}`}>
              <span className="op-log-move mono">
                {e.kind === 'miss' ? '✗ ' : e.result === 'good' ? '✓ ' : e.result ? '• ' : ''}
                {nodeLabel(e.node)}
              </span>
              {e.text && (
                <span className="op-log-text">
                  <MoveText text={e.text} contexts={commentContexts(e.node)} merge onPreview={setPreview} />
                </span>
              )}
            </div>
          ))}
          {!done && ourTurn && phase === 'learn' && current && (
            <div className="op-log-entry learn upcoming">
              <span className="op-log-move mono">À jouer : {nodeLabel(current)}</span>
              {current.comment && (
                <span className="op-log-text">
                  <MoveText text={current.comment} contexts={commentContexts(current)} merge onPreview={setPreview} />
                </span>
              )}
            </div>
          )}
          {message && <p className={`op-msg ${message.kind}`}>{message.text}</p>}
          <div ref={logEnd} />
        </div>

        {!done && ourTurn && phase === 'recall' && (
          <div className="btn-row">
            <button className="btn btn-sm" onClick={() => setHint(Math.min(2, hint + 1))} disabled={hint >= 2}>
              {hint === 0 ? 'Indice : quelle pièce ?' : 'Montrer le coup'}
            </button>
            <span className="muted op-hint-note">{hint > 0 || attempts > 0 ? 'Cette position reviendra plus tôt.' : ''}</span>
          </div>
        )}
        {!done && !ourTurn && (
          <p className="muted">
            <span className="spinner" /> L’adversaire joue…
          </p>
        )}

        {done && (
          <section className="card op-line-done" role="status">
            {phase === 'learn' ? (
              <>
                <h3>Ligne découverte</h3>
                <p>Maintenant, rejoue-la de mémoire : c’est l’effort de rappel qui fixe les coups, pas la relecture.</p>
                <div className="btn-row">
                  <button className="btn primary" onClick={() => startLine(li, 'recall')}>
                    La rejouer de mémoire
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>
                  Ligne terminée : {lineResults.good}/{ourMoves} du premier coup
                </h3>
                <p className="muted">
                  {lineResults.good === ourMoves
                    ? 'Parfait. Ces positions reviendront dans quelques jours pour vérifier qu’elles sont bien ancrées.'
                    : 'Les positions ratées reviendront dès aujourd’hui, puis de plus en plus espacées quand tu les trouveras.'}
                </p>
                <div className="btn-row">
                  {li + 1 < queue.length ? (
                    <button className="btn primary" onClick={() => { setSession((s) => ({ ...s, lines: s.lines + 1 })); startLine(li + 1); }}>
                      Ligne suivante →
                    </button>
                  ) : null}
                  <button className="btn" onClick={() => startLine(li, 'recall')}>
                    Recommencer
                  </button>
                  {onExplore && (
                    <button className="btn" onClick={() => onExplore(t, line[line.length - 1].id)}>
                      Explorer cette ligne
                    </button>
                  )}
                  <button className="btn ghost" onClick={onClose}>
                    Terminer
                  </button>
                </div>
                {li + 1 >= queue.length && (
                  <p className="op-session-end">
                    Séance terminée : {session.good}/{session.total} positions trouvées du premier coup.
                  </p>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
