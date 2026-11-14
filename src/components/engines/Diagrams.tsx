// Schémas d'architecture : NNUE (Stockfish & co.) et réseau policy/value + MCTS (AlphaZero, Leela).
// Toutes les couleurs passent par des classes CSS (bloc « Engines » de styles.css) pour le thème clair/sombre.

function ArrowDefs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
      </marker>
    </defs>
  );
}

export function NnueDiagram() {
  // 40 petites cases représentant les entrées (quelques-unes actives)
  const active = new Set([3, 11, 17, 26, 34]);
  const changed = { off: 11, on: 29 };
  return (
    <figure className="eng-figure">
      <svg className="eng-svg" viewBox="0 0 760 330" role="img" aria-label="Architecture NNUE">
        <ArrowDefs id="nnue-arrow" />
        {/* Entrées */}
        <text className="dg-title" x={70} y={22} textAnchor="middle">Entrées HalfKA</text>
        <rect className="dg-box" x={30} y={34} width={80} height={250} rx={8} />
        {Array.from({ length: 40 }, (_, k) => {
          const col = k % 4;
          const row = Math.floor(k / 4);
          const cls = k === changed.on ? 'dg-cell on new' : k === changed.off ? 'dg-cell off' : active.has(k) ? 'dg-cell on' : 'dg-cell';
          return <rect key={k} className={cls} x={40 + col * 16} y={44 + row * 23.5} width={12} height={18} rx={2} />;
        })}
        <text className="dg-small" x={70} y={302} textAnchor="middle">des dizaines de milliers</text>
        <text className="dg-small" x={70} y={316} textAnchor="middle">d'entrées 0/1, ~30 actives</text>

        {/* Accumulateurs */}
        <line className="dg-arrow" x1={112} y1={110} x2={196} y2={95} markerEnd="url(#nnue-arrow)" />
        <line className="dg-arrow" x1={112} y1={210} x2={196} y2={225} markerEnd="url(#nnue-arrow)" />
        <text className="dg-title" x={290} y={22} textAnchor="middle">Accumulateur (couche 1)</text>
        <rect className="dg-box accent" x={200} y={50} width={180} height={90} rx={8} />
        <text className="dg-label" x={290} y={82} textAnchor="middle">Point de vue du trait</text>
        <text className="dg-small" x={290} y={104} textAnchor="middle">~1 024 neurones</text>
        <text className="dg-small" x={290} y={122} textAnchor="middle">(mon roi + toutes les pièces)</text>
        <rect className="dg-box accent" x={200} y={180} width={180} height={90} rx={8} />
        <text className="dg-label" x={290} y={212} textAnchor="middle">Point de vue adverse</text>
        <text className="dg-small" x={290} y={234} textAnchor="middle">~1 024 neurones</text>
        <text className="dg-small" x={290} y={252} textAnchor="middle">(son roi + toutes les pièces)</text>
        <text className="dg-note" x={290} y={162} textAnchor="middle">Cg1–f3 : −w[C,g1] +w[C,f3]</text>

        {/* Couches denses */}
        <line className="dg-arrow" x1={382} y1={95} x2={436} y2={150} markerEnd="url(#nnue-arrow)" />
        <line className="dg-arrow" x1={382} y1={225} x2={436} y2={170} markerEnd="url(#nnue-arrow)" />
        <text className="dg-title" x={560} y={22} textAnchor="middle">Petites couches denses</text>
        {[
          { x: 440, h: 110, label: '≈16' },
          { x: 520, h: 150, label: '≈32' },
          { x: 600, h: 40, label: '1' },
        ].map((l, k, arr) => (
          <g key={k}>
            <rect className="dg-box" x={l.x} y={160 - l.h / 2} width={40} height={l.h} rx={6} />
            <text className="dg-small" x={l.x + 20} y={164} textAnchor="middle">{l.label}</text>
            {k < arr.length - 1 && (
              <line className="dg-arrow" x1={l.x + 42} y1={160} x2={arr[k + 1].x - 2} y2={160} markerEnd="url(#nnue-arrow)" />
            )}
          </g>
        ))}
        <text className="dg-small" x={560} y={262} textAnchor="middle">entiers 8/16 bits + SIMD</text>
        <text className="dg-small" x={560} y={278} textAnchor="middle">(tailles indicatives)</text>
        <line className="dg-arrow" x1={642} y1={160} x2={672} y2={160} markerEnd="url(#nnue-arrow)" />
        <rect className="dg-box good" x={676} y={136} width={70} height={48} rx={8} />
        <text className="dg-label" x={711} y={157} textAnchor="middle">Éval</text>
        <text className="dg-small" x={711} y={175} textAnchor="middle">(cp)</text>
      </svg>
      <figcaption className="muted">
        NNUE : quand une pièce bouge, seules 2 à 4 entrées changent (case barrée → case verte). L'accumulateur est mis à jour en ajoutant/soustrayant
        quelques colonnes de poids, au lieu de recalculer toute la couche : c'est ce qui rend le réseau assez rapide pour des millions de positions par seconde sur CPU.
      </figcaption>
    </figure>
  );
}

export function MctsDiagram() {
  const cx = 560;
  const cy = 165;
  const r = 105;
  const steps = [
    { a: -90, t: '1. Sélection', s: 'PUCT' },
    { a: 0, t: '2. Expansion', s: 'nouvelle position' },
    { a: 90, t: '3. Évaluation', s: 'par le réseau' },
    { a: 180, t: '4. Rétropropagation', s: 'mise à jour des Q' },
  ];
  const pt = (deg: number, rad = r) => [cx + rad * Math.cos((deg * Math.PI) / 180), cy + rad * Math.sin((deg * Math.PI) / 180)];
  return (
    <figure className="eng-figure">
      <svg className="eng-svg" viewBox="0 0 760 330" role="img" aria-label="Réseau policy/value et boucle MCTS">
        <ArrowDefs id="mcts-arrow" />
        {/* Réseau */}
        <text className="dg-title" x={150} y={22} textAnchor="middle">Réseau profond (Leela, AlphaZero)</text>
        <rect className="dg-box" x={20} y={40} width={90} height={70} rx={8} />
        <text className="dg-label" x={65} y={70} textAnchor="middle">Échiquier</text>
        <text className="dg-small" x={65} y={88} textAnchor="middle">plans 8×8</text>
        <line className="dg-arrow" x1={112} y1={75} x2={146} y2={75} markerEnd="url(#mcts-arrow)" />
        <rect className="dg-box accent" x={150} y={34} width={130} height={150} rx={8} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} className="dg-layer" x={162} y={46 + k * 26} width={106} height={18} rx={4} />
        ))}
        <text className="dg-small" x={215} y={160} textAnchor="middle">dizaines de blocs</text>
        <text className="dg-small" x={215} y={175} textAnchor="middle">ResNet → Transformer</text>
        <line className="dg-arrow" x1={215} y1={186} x2={110} y2={238} markerEnd="url(#mcts-arrow)" />
        <line className="dg-arrow" x1={215} y1={186} x2={300} y2={238} markerEnd="url(#mcts-arrow)" />
        <rect className="dg-box idea" x={20} y={242} width={170} height={70} rx={8} />
        <text className="dg-label" x={105} y={268} textAnchor="middle">Policy</text>
        <text className="dg-small" x={105} y={288} textAnchor="middle">P(coup) : « Cf3 41 %, e4 22 %… »</text>
        <rect className="dg-box good" x={210} y={242} width={170} height={70} rx={8} />
        <text className="dg-label" x={295} y={268} textAnchor="middle">Value</text>
        <text className="dg-small" x={295} y={288} textAnchor="middle">V/N/D : 38 % / 55 % / 7 %</text>

        {/* Boucle MCTS */}
        <text className="dg-title" x={cx} y={22} textAnchor="middle">Boucle MCTS (× des milliers)</text>
        <circle className="dg-ring" cx={cx} cy={cy} r={r} />
        {steps.map((s, k) => {
          const [x, y] = pt(s.a);
          const [ax1, ay1] = pt(s.a + 28);
          const [ax2, ay2] = pt(s.a + 62);
          return (
            <g key={k}>
              <path className="dg-arrow" d={`M${ax1},${ay1} A${r},${r} 0 0 1 ${ax2},${ay2}`} fill="none" markerEnd="url(#mcts-arrow)" />
              <rect className="dg-box" x={x - 72} y={y - 22} width={144} height={44} rx={8} />
              <text className="dg-label" x={x} y={y - 3} textAnchor="middle">{s.t}</text>
              <text className="dg-small" x={x} y={y + 14} textAnchor="middle">{s.s}</text>
            </g>
          );
        })}
        <text className="dg-note" x={cx} y={cy - 4} textAnchor="middle">score(coup) =</text>
        <text className="dg-note" x={cx} y={cy + 14} textAnchor="middle">Q + c·P·√N / (1+n)</text>
        <line className="dg-arrow dashed" x1={382} y1={277} x2={cx - 76} y2={cy + r + 4} markerEnd="url(#mcts-arrow)" />
        <text className="dg-small" x={cx} y={318} textAnchor="middle">Coup joué = le plus visité</text>
      </svg>
      <figcaption className="muted">
        Q = valeur moyenne observée du coup, P = probabilité donnée par la policy, N = visites du parent, n = visites du coup. Les coups que la policy juge
        prometteurs sont explorés en premier, puis l'exploration se rééquilibre selon les résultats.
      </figcaption>
    </figure>
  );
}
