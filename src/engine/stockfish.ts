// Wrapper UCI autour de Stockfish 17.1 (WASM lite single-thread) exécuté dans un Web Worker.
// Chaque instance = un worker indépendant (ex. un pour l'adversaire, un pour l'analyse).
// Les commandes sont sérialisées : une seule recherche à la fois par instance.

export interface EngineLine {
  multipv: number;
  depth: number;
  /** Score en centipions du point de vue du camp au trait (null si mat). */
  cp: number | null;
  /** Mat en N coups du point de vue du camp au trait (positif = le camp au trait mate). */
  mate: number | null;
  /** Variation principale en notation UCI (ex. "e2e4"). */
  pv: string[];
}

export interface AnalysisResult {
  fen: string;
  depth: number;
  bestMove: string | null;
  lines: EngineLine[]; // triées par multipv (1 = meilleure)
}

export interface SearchOptions {
  depth?: number;
  movetime?: number; // ms
  nodes?: number;
  multipv?: number;
  /** Appelé à chaque info intermédiaire (pour affichage progressif). */
  onInfo?: (lines: EngineLine[], depth: number) => void;
}

type Task = () => Promise<void>;

export class StockfishEngine {
  private worker: Worker;
  private listeners = new Set<(line: string) => void>();
  private ready: Promise<void>;
  private queue: Promise<void> = Promise.resolve();
  private currentMultiPv = 1;
  private options: Record<string, string | number | boolean> = {};

  constructor() {
    this.worker = new Worker(`${import.meta.env.BASE_URL}stockfish/stockfish.js`);
    this.worker.onmessage = (e: MessageEvent) => {
      const text = String(e.data);
      for (const l of this.listeners) l(text);
    };
    this.ready = this.handshake();
  }

  private send(cmd: string) {
    this.worker.postMessage(cmd);
  }

  private waitFor(predicate: (line: string) => boolean, onLine?: (line: string) => void): Promise<string> {
    return new Promise((resolve) => {
      const fn = (line: string) => {
        onLine?.(line);
        if (predicate(line)) {
          this.listeners.delete(fn);
          resolve(line);
        }
      };
      this.listeners.add(fn);
    });
  }

  private async handshake() {
    const ok = this.waitFor((l) => l === 'uciok');
    this.send('uci');
    await ok;
    await this.isReady();
  }

  private async isReady() {
    const ok = this.waitFor((l) => l === 'readyok');
    this.send('isready');
    await ok;
  }

  private enqueue(task: Task): Promise<void> {
    const run = this.queue.then(task, task);
    this.queue = run.catch(() => undefined);
    return run;
  }

  /** Définit des options UCI (ex. { 'Skill Level': 5, UCI_LimitStrength: true, UCI_Elo: 1500 }). */
  setOptions(opts: Record<string, string | number | boolean>): Promise<void> {
    return this.enqueue(async () => {
      await this.ready;
      for (const [name, value] of Object.entries(opts)) {
        if (this.options[name] === value) continue;
        this.options[name] = value;
        this.send(`setoption name ${name} value ${value}`);
      }
      await this.isReady();
    });
  }

  newGame(): Promise<void> {
    return this.enqueue(async () => {
      await this.ready;
      this.send('ucinewgame');
      await this.isReady();
    });
  }

  /** Analyse une position. Sans depth/movetime/nodes : profondeur 14 par défaut. */
  analyse(fen: string, opts: SearchOptions = {}): Promise<AnalysisResult> {
    let result!: AnalysisResult;
    return this.enqueue(async () => {
      await this.ready;
      const multipv = opts.multipv ?? 1;
      if (multipv !== this.currentMultiPv) {
        this.send(`setoption name MultiPV value ${multipv}`);
        this.currentMultiPv = multipv;
      }
      const lines = new Map<number, EngineLine>();
      let maxDepth = 0;
      const done = this.waitFor(
        (l) => l.startsWith('bestmove'),
        (l) => {
          const info = parseInfo(l);
          if (!info) return;
          // On ne garde que des infos de profondeur cohérente (évite les lignes partielles mélangées).
          if (info.depth < maxDepth && info.multipv === 1) return;
          if (info.multipv === 1) maxDepth = info.depth;
          lines.set(info.multipv, info);
          opts.onInfo?.(sortedLines(lines), maxDepth);
        },
      );
      this.send(`position fen ${fen}`);
      let go = 'go';
      if (opts.depth) go += ` depth ${opts.depth}`;
      if (opts.movetime) go += ` movetime ${opts.movetime}`;
      if (opts.nodes) go += ` nodes ${opts.nodes}`;
      if (go === 'go') go += ' depth 14';
      this.send(go);
      const bestLine = await done;
      const bm = bestLine.split(/\s+/)[1];
      result = {
        fen,
        depth: maxDepth,
        bestMove: bm && bm !== '(none)' ? bm : null,
        lines: sortedLines(lines),
      };
    }).then(() => result);
  }

  /** Interrompt la recherche en cours (la promesse d'analyse se résout avec le meilleur coup trouvé). */
  stop() {
    this.send('stop');
  }

  terminate() {
    this.worker.terminate();
    this.listeners.clear();
  }
}

function sortedLines(map: Map<number, EngineLine>): EngineLine[] {
  return [...map.values()].sort((a, b) => a.multipv - b.multipv);
}

/** Parse une ligne "info ... score ... pv ..." de Stockfish. */
export function parseInfo(line: string): EngineLine | null {
  if (!line.startsWith('info') || !line.includes(' pv ') || !line.includes(' score ')) return null;
  const tokens = line.split(/\s+/);
  let depth = 0;
  let multipv = 1;
  let cp: number | null = null;
  let mate: number | null = null;
  let pv: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'depth') depth = parseInt(tokens[++i], 10);
    else if (t === 'multipv') multipv = parseInt(tokens[++i], 10);
    else if (t === 'score') {
      const kind = tokens[++i];
      const val = parseInt(tokens[++i], 10);
      if (kind === 'cp') cp = val;
      else if (kind === 'mate') mate = val;
      // ignore lowerbound/upperbound
    } else if (t === 'pv') {
      pv = tokens.slice(i + 1);
      break;
    }
  }
  if (line.includes('lowerbound') || line.includes('upperbound')) return null;
  return { depth, multipv, cp, mate, pv };
}

// --- Instances partagées -------------------------------------------------
let analysisEngine: StockfishEngine | null = null;
let playEngine: StockfishEngine | null = null;

/** Moteur dédié à l'analyse / aux explications (force maximale). */
export function getAnalysisEngine(): StockfishEngine {
  if (!analysisEngine) analysisEngine = new StockfishEngine();
  return analysisEngine;
}

/** Moteur dédié au bot adversaire (force bridée). */
export function getPlayEngine(): StockfishEngine {
  if (!playEngine) playEngine = new StockfishEngine();
  return playEngine;
}
