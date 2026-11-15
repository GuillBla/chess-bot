import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess, type Square } from 'chess.js';
import Board from '../Board';
import MoveText from '../MoveText';
import ExplanationPanel from '../ExplanationPanel';
import type { BoardPreview } from '../VariationLine';
import type { Opening } from '../../content/openings/types';
import { pathTo, sideColor, turnAt, variationNames, type OpeningTree } from '../../lib/openingTree';
import { sanToFrench } from '../../lib/frenchMoves';
import { getAnalysisEngine } from '../../engine/stockfish';
import { explainMove } from '../../analysis/explain';
import type { BoardArrow, MoveExplanation } from '../../analysis/types';
import { KIND_LABEL, commentContexts, firstSentence, nodeKind, nodeLabel, nodePreview, sideName } from './shared';

interface Props {
  opening: Opening;
  tree: OpeningTree;
  /** Nœud de départ (id = chemin UCI). */
  initialNodeId?: string;
  /** Lance l'entraînement sur les lignes qui passent par ce nœud. */
  onTrain: (nodeId: string) => void;
}

interface OffBook {
  /** Coups joués hors du répertoire, à partir du nœud courant. */
  moves: { uci: string; san: string; fenBefore: string; fen: string }[];
}

/** Ordre d'affichage des coups suivants : répertoire d'abord, erreurs à la fin. */
const ORDER = { rep: 0, opp: 1, 'opp-mistake': 2, mistake: 3 } as const;

export default function OpeningExplorer({ opening, tree, initialNodeId, onTrain }: Props) {
  const navigate = useNavigate();
  const side = opening.side;
  const [nodeId, setNodeId] = useState(() => (initialNodeId && tree.byId.has(initialNodeId) ? initialNodeId : ''));
  const node = tree.byId.get(nodeId) ?? tree.root;
  const [off, setOff] = useState<OffBook>({ moves: [] });
  const [guess, setGuess] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [preview, setPreview] = useState<BoardPreview | null>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>(side);
  const [engine, setEngine] = useState<{ loading: boolean; ex: MoveExplanation | null; fenBefore: string } | null>(null);
  const [focus, setFocus] = useState<BoardArrow[] | null>(null);

  useEffect(() => {
    if (initialNodeId !== undefined && tree.byId.has(initialNodeId)) go(initialNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodeId]);

  const path = useMemo(() => pathTo(node), [node]);
  const ctx = useMemo(() => commentContexts(node), [node]);
  const lastOff = off.moves[off.moves.length - 1];
  const fen = lastOff ? lastOff.fen : node.fen;
  const ourTurn = turnAt(node) === sideColor(side);
  const children = useMemo(() => [...node.children].sort((a, b) => ORDER[nodeKind(a, side)] - ORDER[nodeKind(b, side)]), [node, side]);
  const hideOurs = guess && ourTurn && !revealed && !off.moves.length;
  const names = variationNames(node);

  function go(id: string) {
    setNodeId(id);
    setOff({ moves: [] });
    setRevealed(false);
    setPreview(null);
    setEngine(null);
    setFocus(null);
  }

  // Analyse du dernier coup hors répertoire : Stockfish + explication par règles
  const engineToken = useRef(0);
  useEffect(() => {
    if (!lastOff) return;
    const token = ++engineToken.current;
    setEngine({ loading: true, ex: null, fenBefore: lastOff.fenBefore });
    const eng = getAnalysisEngine();
    (async () => {
      try {
        const before = await eng.analyse(lastOff.fenBefore, { depth: 14, multipv: 3 });
        const uci = lastOff.uci;
        let afterLine;
        if (!before.lines.some((l) => l.pv[0] === uci) && !new Chess(lastOff.fen).isGameOver()) {
          afterLine = (await eng.analyse(lastOff.fen, { depth: 13, multipv: 1 })).lines[0];
        }
        if (token !== engineToken.current) return;
        setEngine({ loading: false, ex: explainMove(lastOff.fenBefore, uci, before, { afterLine }), fenBefore: lastOff.fenBefore });
      } catch {
        if (token === engineToken.current) setEngine({ loading: false, ex: null, fenBefore: lastOff.fenBefore });
      }
    })();
    return () => {
      engineToken.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOff?.fen]);
  useEffect(() => () => getAnalysisEngine().stop(), []);

  const onMove = (from: Square, to: Square, promotion?: string): boolean => {
    const chess = new Chess(fen);
    let mv;
    try {
      mv = chess.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    const uci = mv.from + mv.to + (mv.promotion ?? '');
    setPreview(null);
    setFocus(null);
    if (!off.moves.length) {
      const child = node.children.find((c) => c.uci === uci);
      if (child) {
        if (hideOurs) setFlash(nodeKind(child, side) === 'rep' ? `Bien vu : ${nodeLabel(child)} est le coup du répertoire.` : null);
        else setFlash(null);
        go(child.id);
        return true;
      }
    }
    setFlash(null);
    setOff({ moves: [...off.moves, { uci, san: mv.san, fenBefore: fen, fen: chess.fen() }] });
    return true;
  };

  const back = () => {
    if (off.moves.length) setOff({ moves: off.moves.slice(0, -1) });
    else if (node.parent) go(node.parent.id);
  };
  const forward = () => {
    if (off.moves.length) return;
    const next = children.find((c) => !c.dubious) ?? children[0];
    if (next && !(hideOurs && nodeKind(next, side) === 'rep')) go(next.id);
  };

  // Clavier : ← → pour naviguer dans l'arbre
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowLeft') back();
      else if (e.key === 'ArrowRight') forward();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Flèches : celles du commentaire (le plan) + les coups possibles depuis la position
  const arrows: BoardArrow[] = useMemo(() => {
    if (focus) return focus;
    if (off.moves.length) return [];
    const next: BoardArrow[] = children
      .filter((c) => !(hideOurs && nodeKind(c, side) === 'rep'))
      .map((c) => {
        const k = nodeKind(c, side);
        return { from: c.uci.slice(0, 2) as Square, to: c.uci.slice(2, 4) as Square, kind: k === 'rep' ? 'good' : k === 'mistake' ? 'bad' : 'idea' };
      });
    const seen = new Set(next.map((a) => a.from + a.to));
    return [...node.arrows.filter((a) => !seen.has(a.from + a.to)), ...next];
  }, [focus, off.moves.length, children, hideOurs, node, side]);

  const kind = node.parent ? nodeKind(node, side) : null;
  const repHere = children.filter((c) => nodeKind(c, side) === 'rep');

  return (
    <div className="board-layout two-col opening-explorer">
      <div className="board-col">
        <Board
          id="opening-board"
          fen={fen}
          orientation={orientation}
          onMove={onMove}
          arrows={arrows}
          marks={off.moves.length ? [] : node.marks}
          lastMove={lastOff ? { from: lastOff.uci.slice(0, 2), to: lastOff.uci.slice(2, 4) } : node.parent ? { from: node.uci.slice(0, 2), to: node.uci.slice(2, 4) } : null}
          preview={preview}
          maxWidth={720}
        />
        <div className="op-controls" role="group" aria-label="Navigation dans l’arbre">
          <button className="btn" onClick={() => go('')} disabled={!node.parent && !off.moves.length} title="Position de départ">
            ⏮
          </button>
          <button className="btn" onClick={back} disabled={!node.parent && !off.moves.length} title="Coup précédent (←)">
            ◀
          </button>
          <button className="btn" onClick={forward} disabled={!!off.moves.length || !children.length} title="Coup suivant du livre (→)">
            ▶
          </button>
          <button className="btn" onClick={() => setOrientation(orientation === 'white' ? 'black' : 'white')} title="Retourner l’échiquier">
            ⇅
          </button>
          <label className="op-guess" title="Le coup du répertoire est caché : à toi de le trouver sur l’échiquier">
            <input type="checkbox" checked={guess} onChange={(e) => setGuess(e.target.checked)} /> Devine le coup
          </label>
        </div>
      </div>

      <div className="side-col op-side">
        <nav className="op-path" aria-label="Coups joués">
          <button className={`op-path-move${!node.parent && !off.moves.length ? ' current' : ''}`} onClick={() => go('')}>
            Début
          </button>
          {path.map((n) => (
            <button key={n.id} className={`op-path-move${n === node && !off.moves.length ? ' current' : ''} k-${nodeKind(n, side)}`} onClick={() => go(n.id)}>
              {nodeLabel(n)}
            </button>
          ))}
          {off.moves.map((m, i) => (
            <span key={i} className="op-path-move off" title="Hors du répertoire">
              {sanToFrench(m.san)}
            </span>
          ))}
        </nav>

        {names.length > 0 && (
          <p className="op-names">
            {names.map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          </p>
        )}

        {flash && (
          <p className="op-flash" role="status">
            ✓ {flash}
          </p>
        )}

        {!off.moves.length && (
          <section className="card op-current" aria-live="polite">
            {node.parent ? (
              <>
                <header className="op-current-head">
                  <span className="op-current-move mono">{nodeLabel(node)}</span>
                  {kind && <span className={`badge ${KIND_LABEL[kind].cls}`}>{KIND_LABEL[kind].text}</span>}
                </header>
                {node.comment ? (
                  <p className="op-comment">
                    <MoveText text={node.comment} contexts={ctx} merge onPreview={setPreview} />
                  </p>
                ) : (
                  <p className="muted op-comment">Coup de transition, sans commentaire particulier.</p>
                )}
              </>
            ) : (
              <>
                <header className="op-current-head">
                  <span className="op-current-move">Position de départ</span>
                </header>
                <p className="op-comment">
                  {node.comment ? (
                    <MoveText text={node.comment} contexts={ctx} merge onPreview={setPreview} />
                  ) : (
                    <>
                      Tu joues <strong>{sideName(side)}</strong>. Joue les coups sur l’échiquier ou choisis-les ci-dessous : chaque coup est expliqué. Survole
                      un coup pour voir la position sans le jouer ; essaie aussi tes propres idées, Stockfish te dira ce qu’elles valent.
                    </>
                  )}
                </p>
              </>
            )}
          </section>
        )}

        {off.moves.length > 0 && (
          <section className="card op-offbook">
            <header className="op-current-head">
              <span className="op-current-move mono">{sanToFrench(lastOff.san)}</span>
              <span className="badge warn">Hors du livre</span>
            </header>
            {off.moves.length === 1 && ourTurn && repHere.length > 0 && (
              <p>
                Ce coup ne fait pas partie du répertoire. Ici, le répertoire joue{' '}
                {repHere.map((c, i) => (
                  <button
                    key={c.id}
                    className="mv-link"
                    onMouseEnter={() => setPreview(nodePreview(c))}
                    onMouseLeave={() => setPreview(null)}
                    onClick={() => go(c.id)}
                  >
                    {i > 0 ? ' ou ' : ''}
                    {nodeLabel(c)}
                  </button>
                ))}
                .
              </p>
            )}
            {off.moves.length === 1 && !ourTurn && (
              <p>Ce coup adverse n’est pas couvert par le répertoire : voici ce qu’en pense Stockfish. Continue la partie librement pour chercher la bonne réponse.</p>
            )}
            {engine?.loading && (
              <p className="muted">
                <span className="spinner" /> Stockfish analyse le coup…
              </p>
            )}
            {engine?.ex && (
              <ExplanationPanel
                explanation={engine.ex}
                fenBefore={engine.fenBefore}
                title="Ce que vaut ce coup"
                onPreview={setPreview}
                onFocusArrows={(a) => setFocus(a.length ? a : null)}
              />
            )}
            <div className="btn-row">
              <button className="btn" onClick={() => go(node.id)}>
                ← Revenir au livre
              </button>
              <button className="btn" onClick={() => navigate('/analyze', { state: { fen } })}>
                Analyser cette position
              </button>
            </div>
          </section>
        )}

        {!off.moves.length && (
          <section className="card op-next">
            <h3>{children.length ? (ourTurn ? `À toi : que jouent ${sideName(side)} ?` : 'Réponses possibles de l’adversaire') : 'Fin de la ligne'}</h3>
            {children.length === 0 && (
              <p className="muted">
                La théorie s’arrête ici : le dernier commentaire résume le plan à suivre. Rejoue la ligne à l’entraînement pour la graver en mémoire, ou continue la
                partie sur l’échiquier pour tester tes idées.
              </p>
            )}
            {hideOurs && repHere.length > 0 && (
              <div className="op-hidden">
                <p>
                  <strong>Trouve le coup du répertoire</strong> et joue-le sur l’échiquier.
                </p>
                <button className="btn btn-sm" onClick={() => setRevealed(true)}>
                  Révéler
                </button>
              </div>
            )}
            <ul className="op-children">
              {children
                .filter((c) => !(hideOurs && nodeKind(c, side) === 'rep'))
                .map((c) => {
                  const k = nodeKind(c, side);
                  return (
                    <li key={c.id}>
                      <button
                        className={`op-child k-${k}`}
                        onMouseEnter={() => setPreview(nodePreview(c))}
                        onFocus={() => setPreview(nodePreview(c))}
                        onMouseLeave={() => setPreview(null)}
                        onBlur={() => setPreview(null)}
                        onClick={() => {
                          setFlash(null);
                          go(c.id);
                        }}
                      >
                        <span className="op-child-move mono">{nodeLabel(c)}</span>
                        <span className={`badge ${KIND_LABEL[k].cls}`}>{KIND_LABEL[k].text}</span>
                        {c.name && <span className="op-child-name">{c.name}</span>}
                        {c.comment && <span className="op-child-text">{firstSentence(c.comment)}</span>}
                      </button>
                    </li>
                  );
                })}
            </ul>
            <div className="btn-row op-train-row">
              <button className="btn primary" onClick={() => onTrain(node.id)}>
                {node.parent ? 'M’entraîner sur cette variante' : 'M’entraîner sur toute l’ouverture'}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

