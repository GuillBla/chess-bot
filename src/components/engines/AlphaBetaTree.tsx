import { useMemo, useState } from 'react';

// Arbre de démonstration : racine Max → 3 nœuds Min → 2 nœuds Max chacun → 2 feuilles chacun.
type Kind = 'max' | 'min' | 'leaf';
interface TreeNode {
  id: string;
  kind: Kind;
  value?: number;
  children?: TreeNode[];
}

const LEAVES = [5, 6, 7, 4, 3, 2, 8, 9, 8, 2, 9, 1];

function buildTree(): TreeNode {
  let li = 0;
  const mins = ['A', 'B', 'C'].map((m) => ({
    id: m,
    kind: 'min' as Kind,
    children: [1, 2].map((k) => ({
      id: `${m}${k}`,
      kind: 'max' as Kind,
      children: [0, 1].map(() => {
        const v = LEAVES[li];
        return { id: `f${li++}`, kind: 'leaf' as Kind, value: v };
      }),
    })),
  }));
  return { id: 'R', kind: 'max', children: mins };
}

interface Step {
  active: string | null;
  values: Record<string, number>;
  bounds: Record<string, { a: number; b: number }>;
  visited: string[];
  pruned: string[];
  cutAt?: string;
  leaves: number;
  msg: string;
}

const fmt = (x: number) => (x === Infinity ? '+∞' : x === -Infinity ? '−∞' : String(x));
const label = (n: TreeNode) => (n.kind === 'leaf' ? `feuille ${n.value}` : n.id === 'R' ? 'la racine' : `le nœud ${n.id}`);

function buildSteps(root: TreeNode): Step[] {
  const steps: Step[] = [];
  const values: Record<string, number> = {};
  const bounds: Record<string, { a: number; b: number }> = {};
  const visited = new Set<string>();
  const pruned = new Set<string>();
  let leaves = 0;
  const snap = (active: string | null, msg: string, cutAt?: string) =>
    steps.push({ active, values: { ...values }, bounds: { ...bounds }, visited: [...visited], pruned: [...pruned], leaves, msg, cutAt });
  const prune = (n: TreeNode) => {
    pruned.add(n.id);
    n.children?.forEach(prune);
  };

  function search(n: TreeNode, a: number, b: number): number {
    visited.add(n.id);
    bounds[n.id] = { a, b };
    if (n.kind === 'leaf') {
      leaves++;
      values[n.id] = n.value!;
      snap(n.id, `On évalue une feuille : ${n.value}.`);
      return n.value!;
    }
    const isMax = n.kind === 'max';
    snap(
      n.id,
      `On descend dans ${label(n)} (${isMax ? 'Max, les Blancs choisissent' : 'Min, les Noirs choisissent'}). Fenêtre reçue : α = ${fmt(a)}, β = ${fmt(b)}.`,
    );
    let best = isMax ? -Infinity : Infinity;
    const kids = n.children!;
    for (let i = 0; i < kids.length; i++) {
      const v = search(kids[i], a, b);
      if (isMax) {
        best = Math.max(best, v);
        a = Math.max(a, best);
      } else {
        best = Math.min(best, v);
        b = Math.min(b, best);
      }
      values[n.id] = best;
      bounds[n.id] = { a, b };
      if (a >= b && i < kids.length - 1) {
        kids.slice(i + 1).forEach(prune);
        snap(
          n.id,
          isMax
            ? `Coupure β ! ${label(n)} vaut déjà au moins ${best}, or Min (au-dessus) peut déjà se garantir ${fmt(b)} ailleurs. Min n'ira jamais ici : inutile d'examiner les branches restantes.`
            : `Coupure α ! ${label(n)} vaut déjà au plus ${best}, or Max (au-dessus) s'est déjà assuré ${fmt(a)} ailleurs. Max évitera ce coup : les branches restantes sont élaguées.`,
          n.id,
        );
        return best;
      }
      snap(
        n.id,
        `${label(n)[0].toUpperCase()}${label(n).slice(1)} prend le ${isMax ? 'maximum' : 'minimum'} de ses enfants vus jusqu'ici : ${best}. Fenêtre : α = ${fmt(a)}, β = ${fmt(b)}.`,
      );
    }
    return best;
  }

  snap(null, 'Départ : les Blancs (Max) cherchent leur meilleur coup, en supposant que les Noirs (Min) répondent toujours au mieux.');
  const v = search(root, -Infinity, Infinity);
  snap('R', `Terminé : la racine vaut ${v}, le meilleur coup est la branche C. Seules ${leaves} feuilles sur ${LEAVES.length} ont été évaluées, et le résultat est identique à celui de minimax.`);
  return steps;
}

// --- Géométrie -------------------------------------------------------------
const W = 740;
const LEVEL_Y = [36, 116, 196, 276];
interface Placed {
  node: TreeNode;
  x: number;
  y: number;
  parent?: Placed;
}

function layout(root: TreeNode): Placed[] {
  const out: Placed[] = [];
  let leafIdx = 0;
  const place = (n: TreeNode, depth: number, parent?: Placed): Placed => {
    const p: Placed = { node: n, x: 0, y: LEVEL_Y[depth], parent };
    out.push(p);
    if (!n.children) {
      p.x = 34 + leafIdx++ * ((W - 68) / (LEAVES.length - 1));
    } else {
      const kids = n.children.map((c) => place(c, depth + 1, p));
      p.x = kids.reduce((s, k) => s + k.x, 0) / kids.length;
    }
    return p;
  };
  place(root, 0);
  return out;
}

export default function AlphaBetaTree() {
  const root = useMemo(buildTree, []);
  const steps = useMemo(() => buildSteps(root), [root]);
  const placed = useMemo(() => layout(root), [root]);
  const [i, setI] = useState(0);
  const step = steps[i];
  const visited = new Set(step.visited);
  const pruned = new Set(step.pruned);
  const activeBounds = step.active ? step.bounds[step.active] : undefined;

  return (
    <figure className="eng-figure">
      <div className="eng-svg-scroll">
      <svg className="eng-svg" viewBox={`0 0 ${W} 312`} role="img" aria-label="Arbre minimax avec coupures alpha-bêta">
        {placed
          .filter((p) => p.parent)
          .map((p) => (
            <line
              key={`e-${p.node.id}`}
              x1={p.parent!.x}
              y1={p.parent!.y + 14}
              x2={p.x}
              y2={p.y - 14}
              className={`ab-edge${pruned.has(p.node.id) ? ' pruned' : visited.has(p.node.id) ? ' visited' : ''}`}
            />
          ))}
        {placed.map((p) => {
          const n = p.node;
          const v = step.values[n.id];
          const cls = [
            'ab-node',
            n.kind,
            visited.has(n.id) ? 'visited' : '',
            pruned.has(n.id) ? 'pruned' : '',
            step.active === n.id ? 'active' : '',
            step.cutAt === n.id ? 'cut' : '',
          ].join(' ');
          const text = n.kind === 'leaf' ? String(n.value) : v !== undefined ? String(v) : '?';
          return (
            <g key={n.id} className={cls} transform={`translate(${p.x},${p.y})`}>
              {n.kind === 'max' && <polygon points="0,-16 17,12 -17,12" />}
              {n.kind === 'min' && <polygon points="0,16 17,-12 -17,-12" />}
              {n.kind === 'leaf' && <rect x={-14} y={-13} width={28} height={26} rx={5} />}
              <text y={n.kind === 'max' ? 7 : n.kind === 'min' ? 1 : 5} textAnchor="middle">
                {text}
              </text>
              {n.kind !== 'leaf' && (
                <text className="ab-id" x={n.id === 'R' ? 26 : 22} y={n.kind === 'max' ? -6 : -10}>
                  {n.id}
                </text>
              )}
              {pruned.has(n.id) && n.kind === 'leaf' && (
                <line className="ab-x" x1={-10} y1={-10} x2={10} y2={10} />
              )}
            </g>
          );
        })}
      </svg>
      </div>
      <div className="ab-panel">
        <div className="ab-msg" aria-live="polite">
          <strong>
            Étape {i + 1}/{steps.length}
          </strong>{' '}
          — {step.msg}
        </div>
        <div className="ab-meta muted">
          {activeBounds && (
            <span>
              α = {fmt(activeBounds.a)} · β = {fmt(activeBounds.b)} ·{' '}
            </span>
          )}
          Feuilles évaluées : {step.leaves} / {LEAVES.length} (minimax pur : {LEAVES.length})
        </div>
        <div className="btn-row">
          <button className="btn" onClick={() => setI(0)} disabled={i === 0}>
            ⟲ Début
          </button>
          <button className="btn" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
            ← Précédent
          </button>
          <button className="btn primary" onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i === steps.length - 1}>
            Suivant →
          </button>
          <button className="btn" onClick={() => setI(steps.length - 1)} disabled={i === steps.length - 1}>
            Fin
          </button>
        </div>
        <p className="ab-legend muted">
          ▲ Max (les Blancs, prennent le plus grand) · ▼ Min (les Noirs, prennent le plus petit) · ■ feuilles = évaluation statique.
          Les nœuds grisés et barrés ont été élagués : le moteur ne les calcule jamais.
        </p>
      </div>
    </figure>
  );
}
