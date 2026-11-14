import { useState } from 'react';
import { COMPARISON, CONCEPTS, ENGINES, SOURCES, TIPS } from '../content/engines';
import AlphaBetaTree from '../components/engines/AlphaBetaTree';
import { MctsDiagram, NnueDiagram } from '../components/engines/Diagrams';
import DepthDemo from '../components/engines/DepthDemo';
import EngineCard from '../components/engines/EngineCard';
import Timeline from '../components/engines/Timeline';
import { rich } from '../components/engines/RichText';

const SECTIONS = [
  { id: 'eng-histoire', label: 'Petite histoire' },
  { id: 'eng-fiches', label: 'Fiches moteurs' },
  { id: 'eng-comparatif', label: 'Tableau comparatif' },
  { id: 'eng-concepts', label: 'Comment ça marche' },
  { id: 'eng-demo', label: 'Voir le moteur réfléchir' },
  { id: 'eng-pour-toi', label: 'Ce que ça change pour toi' },
  { id: 'eng-sources', label: 'Sources' },
];

// HashRouter : pas de liens "#id" (ils changeraient la route) → défilement programmatique.
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ConceptVisual({ kind }: { kind: NonNullable<(typeof CONCEPTS)[number]['visual']> }) {
  switch (kind) {
    case 'alphabeta':
      return <AlphaBetaTree />;
    case 'nnue':
      return <NnueDiagram />;
    case 'mcts':
      return <MctsDiagram />;
    case 'demo':
      return (
        <p className="muted">
          ↓ Essaie-le dans la{' '}
          <button className="eng-link" onClick={() => scrollToId('eng-demo')}>
            démo « Voir le moteur réfléchir »
          </button>
          .
        </p>
      );
  }
}

export default function Engines() {
  const [openCards, setOpenCards] = useState<Set<string>>(() => new Set(['stockfish']));
  const allOpen = openCards.size === ENGINES.length;
  const toggle = (id: string, open: boolean) =>
    setOpenCards((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="page eng-page">
      <header>
        <h1>Les moteurs d'échecs</h1>
        <p className="lead">
          Comment un programme peut-il battre le champion du monde sans rien « comprendre » ? Histoire, fiches des principaux moteurs, algorithmes
          expliqués avec des schémas, et une démo où tu regardes Stockfish réfléchir en direct.
        </p>
      </header>

      <nav className="card eng-toc" aria-label="Sommaire">
        <strong>Sommaire</strong>
        <ol>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button className="eng-link" onClick={() => scrollToId(s.id)}>
                {s.label}
              </button>
              {s.id === 'eng-concepts' && (
                <ul>
                  {CONCEPTS.map((c) => (
                    <li key={c.id}>
                      <button className="eng-link" onClick={() => scrollToId(`eng-c-${c.id}`)}>
                        {c.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <section id="eng-histoire" className="eng-section">
        <h2>Petite histoire des moteurs</h2>
        <p className="prose">
          Soixante-quinze ans d'histoire en deux grandes idées : <strong>chercher</strong> (explorer l'arbre des coups le plus loin et le plus
          intelligemment possible) et <strong>évaluer</strong> (juger une position sans aller jusqu'au mat). Les progrès viennent tour à tour de l'une et de
          l'autre.
        </p>
        <Timeline />
      </section>

      <section id="eng-fiches" className="eng-section">
        <div className="eng-section-head">
          <h2>Fiches moteurs</h2>
          <button className="btn" onClick={() => setOpenCards(allOpen ? new Set() : new Set(ENGINES.map((e) => e.id)))}>
            {allOpen ? 'Tout replier' : 'Tout déplier'}
          </button>
        </div>
        <div className="eng-cards">
          {ENGINES.map((e) => (
            <EngineCard key={e.id} engine={e} open={openCards.has(e.id)} onToggle={(o) => toggle(e.id, o)} />
          ))}
        </div>
      </section>

      <section id="eng-comparatif" className="eng-section">
        <h2>Tableau comparatif</h2>
        <p className="muted prose">
          Forces indicatives (classements CCRL/TCEC, fin 2026). Au sommet, les écarts sont minimes : une vingtaine de points Elo séparent une quinzaine de
          moteurs, et l'ordre change selon la cadence et le matériel.
        </p>
        <div className="table-scroll">
          <table className="eng-table">
            <thead>
              <tr>
                <th>Moteur</th>
                <th>Recherche</th>
                <th>Évaluation</th>
                <th>Matériel</th>
                <th>Open source</th>
                <th>Force</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.name}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.search}</td>
                  <td>{r.evaluation}</td>
                  <td>
                    <span className={`badge ${r.hardware === 'GPU' || r.hardware === 'TPU' ? 'idea' : ''}`}>{r.hardware}</span>
                  </td>
                  <td>
                    <span className={`badge ${r.openSource === 'Oui' ? 'good' : r.openSource === 'Non' ? 'warn' : ''}`}>{r.openSource}</span>
                  </td>
                  <td>{r.strength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="eng-concepts" className="eng-section">
        <h2>Comment ça marche</h2>
        <p className="prose muted">
          Les deux familles de moteurs : <strong>alpha-bêta + NNUE</strong> (Stockfish, Torch, Berserk…) qui calculent des millions de positions avec un
          jugement rapide, et <strong>MCTS + réseau profond</strong> (AlphaZero, Leela) qui en calculent mille fois moins mais les jugent bien mieux.
        </p>
        {CONCEPTS.map((c) => (
          <article key={c.id} id={`eng-c-${c.id}`} className="card eng-concept eng-section">
            <h3>{c.title}</h3>
            <div className="prose">
              {c.body.map((p, i) => (
                <p key={i}>{rich(p)}</p>
              ))}
            </div>
            {c.takeaway && <p className="eng-takeaway">{rich(c.takeaway)}</p>}
            {c.visual && <ConceptVisual kind={c.visual} />}
          </article>
        ))}
      </section>

      <section id="eng-demo" className="eng-section">
        <h2>Voir le moteur réfléchir</h2>
        <p className="prose muted">
          Lance Stockfish et regarde l'approfondissement itératif : à chaque profondeur, une nouvelle ligne s'ajoute au tableau. Les lignes surlignées
          marquent un <strong>changement d'avis</strong> du moteur — la preuve qu'une évaluation à faible profondeur peut être trompeuse.
        </p>
        <div className="card">
          <DepthDemo />
        </div>
      </section>

      <section id="eng-pour-toi" className="eng-section">
        <h2>Ce que ça change pour toi</h2>
        <p className="prose">
          Un moteur est un <strong>oracle qui ne s'explique pas</strong>. Bien utilisé, c'est le meilleur entraîneur du monde ; mal utilisé, il te donne
          l'illusion de comprendre. Quelques règles pour progresser :
        </p>
        <div className="card-grid">
          {TIPS.map((t) => (
            <div key={t.title} className="card">
              <h3>{t.title}</h3>
              <p>{rich(t.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="eng-sources" className="eng-section">
        <h2>Sources</h2>
        <p className="muted">Informations vérifiées en novembre 2026 ; les classements de moteurs évoluent vite.</p>
        <ul className="eng-sources">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
