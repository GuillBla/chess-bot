import { useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { openings, getOpening, openingTree, type Opening } from '../../content/openings';
import { useSrs, statsFor, resetOpening, BOX_DAYS } from '../../lib/openingSrs';
import { cardIds, dueCount, linesToStudy, reviewQueue, type TrainLine } from '../../lib/openingSession';
import { variationName } from '../../lib/openingTree';
import OpeningExplorer from '../../components/openings/OpeningExplorer';
import OpeningTrainer from '../../components/openings/OpeningTrainer';
import PositionViewer from '../../components/lessons/PositionViewer';
import ExercisePlayer from '../../components/lessons/ExercisePlayer';
import MoveText, { type MoveContext } from '../../components/MoveText';
import { markSolved, useProgress } from '../../components/lessons/progress';
import { PieceIcon } from '../../components/pieces';
import { OPENINGS_BASE } from '../../components/openings/shared';
import { START_FEN } from '../../lib/chessUtils';
import type { LessonSection } from '../../content/lessons/types';

const ready = () => openings.filter((o) => o.pgn.trim());

const GROUPS: { title: string; note: string; match: (o: Opening) => boolean }[] = [
  { title: 'Avec les Blancs', note: 'Ton ouverture actuelle, cette fois comprise de l’intérieur.', match: (o) => o.family === 'repertoire' && o.side === 'white' },
  {
    title: 'Avec les Noirs',
    note: 'Une seule idée pour tout le répertoire : …c6 et …d5, le fou de cases blanches sorti en f5 avant …e6. Le même principe que ton Londres.',
    match: (o) => o.family === 'repertoire' && o.side === 'black',
  },
  { title: 'Culture d’ouvertures', note: 'Les grandes ouvertures que tu croiseras : leurs plans, leurs pièges, pour ne plus être surpris.', match: (o) => o.family === 'culture' },
];

function useOpeningStats() {
  const srs = useSrs();
  return useMemo(() => {
    const map = new Map<string, ReturnType<typeof statsFor>>();
    for (const o of ready()) map.set(o.id, statsFor(srs, o.id, cardIds(o, openingTree(o))));
    return { srs, map };
  }, [srs]);
}

function ProgressBar({ learned, mastered, total }: { learned: number; mastered: number; total: number }) {
  const pct = (n: number) => `${total ? (n / total) * 100 : 0}%`;
  return (
    <div className="op-bar" role="img" aria-label={`${learned} positions vues sur ${total}, ${mastered} maîtrisées`}>
      <span className="op-bar-learned" style={{ width: pct(learned) }} />
      <span className="op-bar-mastered" style={{ width: pct(mastered) }} />
    </div>
  );
}

// ---------------------------------------------------------------- Accueil

function OpeningsHome() {
  const { map } = useOpeningStats();
  const totalDue = [...map.values()].reduce((a, s) => a + s.due, 0);
  const list = ready();

  return (
    <div className="op-home">
      <header className="page-head">
        <span className="eyebrow">Ouvertures</span>
        <h1>Comprendre ses ouvertures, puis ne plus les oublier</h1>
        <p className="lead">
          Une ouverture ne s’apprend pas comme une liste de coups : chaque coup a une raison. Ici, tu découvres les idées, tu les testes toi-même sur
          l’échiquier, puis la répétition espacée les grave en mémoire.
        </p>
      </header>

      <section className={`card op-review${totalDue ? ' has-due' : ''}`}>
        <div>
          <h2>Révision du jour</h2>
          <p className="muted">
            {totalDue
              ? `${totalDue} position${totalDue > 1 ? 's' : ''} à revoir aujourd’hui. Quelques minutes suffisent : c’est la régularité qui compte.`
              : 'Rien à revoir pour l’instant. Apprends une nouvelle ligne ou reviens demain.'}
          </p>
        </div>
        <Link className={`btn ${totalDue ? 'primary' : ''}`} to={`${OPENINGS_BASE}/revision`} aria-disabled={!totalDue} onClick={(e) => !totalDue && e.preventDefault()}>
          {totalDue ? `Réviser ${totalDue} position${totalDue > 1 ? 's' : ''}` : 'À jour ✓'}
        </Link>
      </section>

      <section className="op-method" aria-label="La méthode">
        <div>
          <span className="op-step">1</span>
          <h3>Comprendre</h3>
          <p>La structure de pions, les plans, les cases importantes : ce qui reste quand on a oublié les coups.</p>
        </div>
        <div>
          <span className="op-step">2</span>
          <h3>Explorer</h3>
          <p>Joue les coups toi-même, survole les réponses adverses, essaie tes idées : Stockfish te dit ce qu’elles valent.</p>
        </div>
        <div>
          <span className="op-step">3</span>
          <h3>Mémoriser</h3>
          <p>
            Rejoue les lignes de mémoire. Une position trouvée revient après {BOX_DAYS[1]}, {BOX_DAYS[2]}, {BOX_DAYS[3]}, {BOX_DAYS[4]} jours… ; une position
            ratée revient aujourd’hui.
          </p>
        </div>
      </section>

      {GROUPS.map((g) => {
        const items = list.filter(g.match);
        if (!items.length) return null;
        return (
          <section key={g.title} className="op-group">
            <h2>{g.title}</h2>
            <p className="muted">{g.note}</p>
            <div className="card-grid op-cards">
              {items.map((o) => {
                const s = map.get(o.id)!;
                return (
                  <Link key={o.id} to={`${OPENINGS_BASE}/${o.id}`} className="card link-card op-card">
                    <span className="op-card-side">
                      <PieceIcon piece={o.side === 'white' ? 'wK' : 'bK'} size={22} />
                      {o.against}
                    </span>
                    <h3>{o.name}</h3>
                    <p>{o.summary}</p>
                    <ProgressBar {...s} />
                    <span className="op-card-stats muted">
                      {s.learned}/{s.total} positions vues · {s.mastered} maîtrisées
                      {s.due > 0 && <span className="badge warn">{s.due} à revoir</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- Une ouverture

function contextsFor(sections: LessonSection[], i: number): MoveContext[] {
  const ctx: MoveContext[] = [];
  const add = (s: LessonSection | undefined) => {
    if (s?.type === 'position') ctx.push({ fen: s.fen, mainline: (s.moves ?? []).map((m) => m.uci) });
  };
  add(sections.slice(i + 1).find((s) => s.type === 'position'));
  add([...sections.slice(0, i)].reverse().find((s) => s.type === 'position'));
  ctx.push({ fen: START_FEN });
  return ctx;
}

function Understand({ opening }: { opening: Opening }) {
  let diagram = 0;
  return (
    <div className="op-understand">
      <div className="op-understand-top">
        <section className="card op-why">
          <h3>Pourquoi cette ouverture ?</h3>
          <p>
            <MoveText text={opening.why} contexts={[{ fen: START_FEN }]} />
          </p>
        </section>
        <section className="card op-memo">
          <h3>Fiche mémo</h3>
          <ol>
            {opening.keyIdeas.map((k, i) => (
              <li key={i}>
                <MoveText text={k} contexts={[{ fen: START_FEN }]} />
              </li>
            ))}
          </ol>
        </section>
      </div>
      <article className="book book-sheet op-book" lang="fr">
        {opening.sections.map((s, i) => {
          if (s.type === 'text') {
            return (
              <section key={i} className="book-text">
                {s.title && <h3>{s.title}</h3>}
                {s.paragraphs.map((p, k) => (
                  <p key={k}>
                    <MoveText text={p} contexts={contextsFor(opening.sections, i)} />
                  </p>
                ))}
              </section>
            );
          }
          diagram += 1;
          return <PositionViewer key={`${opening.id}-${i}`} section={s} id={`${opening.id}-pos-${i}`} number={diagram} />;
        })}
      </article>
      <div className="op-next-step">
        <Link className="btn primary" to="explorer">
          Explorer l’arbre des coups →
        </Link>
      </div>
    </div>
  );
}

function Explore({ opening }: { opening: Opening }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tree = openingTree(opening);
  return (
    <OpeningExplorer
      opening={opening}
      tree={tree}
      initialNodeId={params.get('pos') ?? undefined}
      onTrain={(id) => navigate(id ? `../entrainement?from=${encodeURIComponent(id)}` : '../entrainement', { relative: 'path' })}
    />
  );
}

function Train({ opening }: { opening: Opening }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { srs, map } = useOpeningStats();
  const tree = openingTree(opening);
  const from = params.get('from') ?? '';
  const fromNode = from ? tree.byId.get(from) : undefined;
  const [queue, setQueue] = useState<TrainLine[] | null>(null);
  const s = map.get(opening.id)!;

  if (queue) {
    return (
      <OpeningTrainer
        queue={queue}
        title={fromNode ? `Entraînement · ${variationName(fromNode) ?? 'variante choisie'}` : 'Entraînement'}
        onExplore={(_, nodeId) => navigate(`../explorer?pos=${encodeURIComponent(nodeId)}`, { relative: 'path' })}
        onClose={() => setQueue(null)}
      />
    );
  }

  const due = dueCount(opening, tree, srs);
  const start = () => setQueue(linesToStudy(opening, tree, srs, fromNode ? from : ''));

  return (
    <div className="op-train-intro">
      <section className="card">
        <h3>Mémoriser {opening.name}</h3>
        <ProgressBar {...s} />
        <p className="op-train-stats">
          <strong>{s.learned}</strong>/{s.total} positions vues · <strong>{s.mastered}</strong> maîtrisées · <strong>{due}</strong> à revoir aujourd’hui
        </p>
        {fromNode && (
          <p className="op-train-scope">
            Seulement les lignes de la variante <strong>{variationName(fromNode) ?? 'choisie'}</strong>.{' '}
            <button className="btn btn-sm ghost" onClick={() => setParams({})}>
              Toute l’ouverture
            </button>
          </p>
        )}
        <ul className="op-train-howto">
          <li>
            <strong>Nouvelle ligne :</strong> d’abord une découverte guidée (chaque coup expliqué, flèche verte), puis tu la rejoues de mémoire.
          </li>
          <li>
            <strong>Ligne connue :</strong> directement de mémoire. L’adversaire joue ses réponses, tu dois retrouver les tiennes.
          </li>
          <li>
            <strong>Indices :</strong> d’abord la pièce à jouer, puis le coup. Une position trouvée avec aide ou ratée revient plus tôt.
          </li>
        </ul>
        <div className="btn-row">
          <button className="btn primary" onClick={start}>
            {s.learned < s.total ? 'Commencer' : due ? `Réviser (${due})` : 'S’entraîner quand même'}
          </button>
          {s.learned > 0 && (
            <button
              className="btn ghost"
              onClick={() => {
                if (window.confirm(`Effacer ta progression sur ${opening.name} ?`)) resetOpening(opening.id);
              }}
            >
              Remettre à zéro
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Traps({ opening }: { opening: Opening }) {
  const progress = useProgress();
  const key = `opening-${opening.id}`;
  const solved = new Set(progress[key] ?? []);
  const [current, setCurrent] = useState(0);
  const ex = opening.traps[current];
  if (!ex) return <p className="muted">Pas encore de piège pour cette ouverture.</p>;
  return (
    <section className="book-exercises op-traps">
      <p className="muted">
        Les pièges qu’on rencontre vraiment dans cette ouverture. Trouve le bon coup : pour punir l’erreur adverse, ou pour ne pas tomber dedans.
      </p>
      <div className="ex-tabs" role="tablist" aria-label="Pièges">
        {opening.traps.map((_, k) => (
          <button
            key={k}
            role="tab"
            aria-selected={k === current}
            className={`ex-tab${k === current ? ' is-current' : ''}${solved.has(k) ? ' is-solved' : ''}`}
            onClick={() => setCurrent(k)}
          >
            {k + 1}
          </button>
        ))}
      </div>
      <ExercisePlayer
        key={`${opening.id}-${current}`}
        exercise={ex}
        index={current}
        total={opening.traps.length}
        solvedBefore={solved.has(current)}
        onSolved={() => markSolved(key, current)}
        footer={
          current < opening.traps.length - 1 ? (
            <div className="ex-next">
              <button className="btn" onClick={() => setCurrent(current + 1)}>
                Piège suivant →
              </button>
            </div>
          ) : null
        }
      />
    </section>
  );
}

function OpeningPage() {
  const { id } = useParams();
  const opening = id ? getOpening(id) : undefined;
  const { map } = useOpeningStats();
  if (!opening || !opening.pgn.trim()) {
    return (
      <div className="card">
        <p>Cette ouverture est introuvable.</p>
        <Link to={OPENINGS_BASE}>← Toutes les ouvertures</Link>
      </div>
    );
  }
  const s = map.get(opening.id)!;
  const tab = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');
  return (
    <div className="op-page">
      <header className="op-head">
        <Link to={OPENINGS_BASE} className="op-back">
          ← Ouvertures
        </Link>
        <div className="op-head-title">
          <PieceIcon piece={opening.side === 'white' ? 'wK' : 'bK'} size={30} />
          <div>
            <h1>{opening.name}</h1>
            <p className="muted">
              {opening.against}
              {opening.eco ? ` · ${opening.eco}` : ''} · tu joues {opening.side === 'white' ? 'les Blancs' : 'les Noirs'}
            </p>
          </div>
        </div>
        <nav className="tabs op-tabs" aria-label="Sections de l’ouverture">
          <NavLink end to="" className={tab}>
            Comprendre
          </NavLink>
          <NavLink to="explorer" className={tab}>
            Explorer
          </NavLink>
          <NavLink to="entrainement" className={tab}>
            S’entraîner{s.due > 0 && <span className="op-tab-due">{s.due}</span>}
          </NavLink>
          <NavLink to="pieges" className={tab}>
            Pièges
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route index element={<Understand opening={opening} />} />
        <Route path="explorer" element={<Explore key={opening.id} opening={opening} />} />
        <Route path="entrainement" element={<Train key={opening.id} opening={opening} />} />
        <Route path="pieges" element={<Traps key={opening.id} opening={opening} />} />
      </Routes>
    </div>
  );
}

// ---------------------------------------------------------------- Révision du jour

function Review() {
  const navigate = useNavigate();
  const { srs } = useOpeningStats();
  // File calculée une fois à l'ouverture de la page (les réponses modifient l'état SRS pendant la séance)
  const [queue] = useState(() => reviewQueue(ready().map((o) => ({ opening: o, tree: openingTree(o) })), srs));
  return (
    <div className="op-page">
      <header className="op-head">
        <Link to={OPENINGS_BASE} className="op-back">
          ← Ouvertures
        </Link>
      </header>
      {queue.length ? (
        <OpeningTrainer
          queue={queue}
          title="Révision du jour"
          onExplore={(t, nodeId) => navigate(`${OPENINGS_BASE}/${t.opening.id}/explorer?pos=${encodeURIComponent(nodeId)}`)}
          onClose={() => navigate(OPENINGS_BASE)}
        />
      ) : (
        <div className="card">
          <p>Rien à réviser aujourd’hui. Reviens demain, ou apprends une nouvelle ligne.</p>
          <Link className="btn" to={OPENINGS_BASE}>
            ← Toutes les ouvertures
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Openings() {
  return (
    <div className="page openings-page">
      <Routes>
        <Route index element={<OpeningsHome />} />
        <Route path="revision" element={<Review />} />
        <Route path=":id/*" element={<OpeningPage />} />
      </Routes>
    </div>
  );
}
