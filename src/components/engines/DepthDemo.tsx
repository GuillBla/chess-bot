import { useEffect, useRef, useState } from 'react';
import type { Square } from 'chess.js';
import Board from '../Board';
import { getAnalysisEngine } from '../../engine/stockfish';
import { formatLine, formatScore, pvToSan, turnOf } from '../../lib/chessUtils';
import { DEMO_POSITIONS } from '../../content/engines';

interface Row {
  depth: number;
  uci: string;
  san: string;
  score: string;
  line: string;
}

/** « Voir le moteur réfléchir » : approfondissement itératif en direct. */
export default function DepthDemo() {
  const [posId, setPosId] = useState(DEMO_POSITIONS[0].id);
  const pos = DEMO_POSITIONS.find((p) => p.id === posId)!;
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const runId = useRef(0);
  const runningRef = useRef(false);

  // Chronomètre pendant l'analyse
  useEffect(() => {
    if (!running) return;
    const t0 = Date.now();
    const iv = window.setInterval(() => setElapsed((Date.now() - t0) / 1000), 250);
    return () => window.clearInterval(iv);
  }, [running]);

  // Arrête la recherche si on quitte la page
  useEffect(
    () => () => {
      runId.current++;
      if (runningRef.current) getAnalysisEngine().stop();
    },
    [],
  );

  const stop = () => {
    if (runningRef.current) getAnalysisEngine().stop();
  };

  const selectPosition = (id: string) => {
    stop();
    runId.current++;
    runningRef.current = false;
    setRunning(false);
    setRows([]);
    setFinished(false);
    setElapsed(0);
    setPosId(id);
  };

  const launch = async () => {
    const id = ++runId.current;
    const { fen, depth } = pos;
    const turn = turnOf(fen);
    setRows([]);
    setFinished(false);
    setElapsed(0);
    setRunning(true);
    runningRef.current = true;
    const engine = getAnalysisEngine();
    try {
      // Table de transposition vidée : résultat reproductible (et identique à notre vérification).
      await engine.newGame();
      if (id !== runId.current) return;
      await engine.analyse(fen, {
        depth,
        multipv: 1,
        onInfo: (lines) => {
          if (id !== runId.current) return;
          const l = lines[0];
          if (!l || l.pv.length === 0) return;
          const row: Row = {
            depth: l.depth,
            uci: l.pv[0],
            san: pvToSan(fen, l.pv, 1)[0] ?? l.pv[0],
            score: formatScore(l, turn),
            line: formatLine(fen, l.pv, 8),
          };
          setRows((prev) => {
            const others = prev.filter((r) => r.depth !== row.depth);
            return [...others, row].sort((a, b) => b.depth - a.depth);
          });
        },
      });
      if (id === runId.current) setFinished(true);
    } finally {
      if (id === runId.current) {
        runningRef.current = false;
        setRunning(false);
      }
    }
  };

  const best = rows[0];
  const arrows = best ? [{ from: best.uci.slice(0, 2) as Square, to: best.uci.slice(2, 4) as Square, kind: 'good' as const }] : [];
  const changes = rows.filter((r, i) => i < rows.length - 1 && rows[i + 1].uci !== r.uci).length;

  return (
    <div className="eng-demo">
      <div className="eng-demo-pick">
        <label htmlFor="eng-demo-pos">Position</label>
        <select id="eng-demo-pos" value={posId} onChange={(e) => selectPosition(e.target.value)} disabled={running}>
          {DEMO_POSITIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="eng-demo-grid">
        <div className="eng-demo-board">
          <Board id="engines-demo" fen={pos.fen} arrows={arrows} maxWidth={420} />
          <p className="muted eng-demo-caption">
            Trait aux {turnOf(pos.fen) === 'w' ? 'Blancs' : 'Noirs'}. Flèche verte : meilleur coup à la profondeur actuelle.
          </p>
        </div>
        <div className="eng-demo-side">
          <p>{pos.description}</p>
          <p className="muted">
            <strong>À observer :</strong> {pos.expectation}
          </p>
          <div className="btn-row">
            <button className="btn primary" onClick={launch} disabled={running}>
              ▶ Lancer (profondeur {pos.depth})
            </button>
            <button className="btn" onClick={stop} disabled={!running}>
              ■ Stop
            </button>
          </div>
          <div className="eng-demo-status muted" aria-live="polite">
            {running && <span className="spinner" aria-hidden />}
            {running && ` Analyse en cours… profondeur ${best?.depth ?? 0} / ${pos.depth} · ${elapsed.toFixed(0)} s`}
            {!running && rows.length > 0 &&
              `${finished ? 'Analyse terminée' : 'Analyse arrêtée'} : profondeur ${best?.depth} en ${elapsed.toFixed(0)} s · le meilleur coup a changé ${changes} fois.`}
            {!running && rows.length === 0 && 'Stockfish 17.1 tourne dans ton navigateur (un seul cœur) : il faut un peu de patience.'}
          </div>
          {rows.length > 0 && (
            <div className="table-scroll eng-demo-table">
              <table>
                <thead>
                  <tr>
                    <th>Prof.</th>
                    <th>Coup</th>
                    <th>Éval</th>
                    <th>Variation principale</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const changed = i < rows.length - 1 && rows[i + 1].uci !== r.uci;
                    return (
                      <tr key={r.depth} className={changed ? 'eng-changed' : ''}>
                        <td className="mono">{r.depth}</td>
                        <td className="mono">
                          <strong>{r.san}</strong> {changed && <span className="badge idea">nouveau</span>}
                        </td>
                        <td className="mono">{r.score}</td>
                        <td className="mono eng-pv">{r.line}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
