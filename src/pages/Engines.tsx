import { useState, type ReactNode } from 'react';
import { COMPARISON, CONCEPTS, ENGINES, HISTORY, SOURCES, TIPS } from '../content/engines';
import AlphaBetaTree from '../components/engines/AlphaBetaTree';
import { MctsDiagram, NnueDiagram } from '../components/engines/Diagrams';
import DepthDemo from '../components/engines/DepthDemo';
import EngineCard from '../components/engines/EngineCard';
import Timeline from '../components/engines/Timeline';
import { rich } from '../components/engines/RichText';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/** Sommaire : intitulé + repère à droite (à la place du numéro de page d'un livre). */
const SECTIONS = [
  { id: 'eng-histoire', label: 'Petite histoire', note: `${HISTORY.length} dates` },
  { id: 'eng-fiches', label: 'Fiches moteurs', note: `${ENGINES.length} fiches` },
  { id: 'eng-comparatif', label: 'Tableau comparatif', note: `${COMPARISON.length} moteurs` },
  { id: 'eng-concepts', label: 'Comment ça marche', note: `${CONCEPTS.length} notions` },
  { id: 'eng-demo', label: 'Voir le moteur réfléchir', note: 'démo' },
  { id: 'eng-pour-toi', label: 'Ce que ça change pour toi', note: `${TIPS.length} conseils` },
  { id: 'eng-sources', label: 'Sources', note: `${SOURCES.length} réf.` },
];

const sectionNum = (id: string) => ROMAN[SECTIONS.findIndex((s) => s.id === id)] ?? '';
const conceptsNum = sectionNum('eng-concepts');

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
        <p className="muted eng-see-also">
          Voir aussi :{' '}
          <button className="eng-link" onClick={() => scrollToId('eng-demo')}>
            {sectionNum('eng-demo')}. Voir le moteur réfléchir
          </button>
          .
        </p>
      );
  }
}

/** Titre de section numéroté, à la manière d'un livre. */
function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="eng-section-head">
      <h2>
        <span className="eng-h-num">{sectionNum(id)}</span>
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );
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
      <header className="page-head eng-head">
        <span className="eyebrow">Encyclopédie</span>
        <h1>Les moteurs d’échecs</h1>
        <p className="lead">
          Comment un programme peut-il battre le champion du monde sans rien « comprendre » ? Histoire, fiches des principaux moteurs, algorithmes
          expliqués avec des schémas, et une démo où tu regardes Stockfish réfléchir en direct.
        </p>
      </header>

      <nav className="eng-toc" aria-label="Sommaire">
        <h2 className="eng-toc-title">Sommaire</h2>
        <ol>
          {SECTIONS.map((s, k) => (
            <li key={s.id}>
              <button className="eng-toc-entry" onClick={() => scrollToId(s.id)}>
                <span className="eng-toc-num">{ROMAN[k]}</span>
                <span className="eng-toc-label">{s.label}</span>
                <span className="eng-toc-leader" aria-hidden />
                <span className="eng-toc-note">{s.note}</span>
              </button>
              {s.id === 'eng-concepts' && (
                <ol className="eng-toc-sub">
                  {CONCEPTS.map((c, j) => (
                    <li key={c.id}>
                      <button className="eng-toc-entry" onClick={() => scrollToId(`eng-c-${c.id}`)}>
                        <span className="eng-toc-num">
                          {ROMAN[k]}.{j + 1}
                        </span>
                        <span className="eng-toc-label">{c.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <section id="eng-histoire" className="eng-section">
        <SectionHead id="eng-histoire" title="Petite histoire des moteurs" />
        <p className="prose eng-intro">
          Soixante-quinze ans d'histoire en deux grandes idées : <strong>chercher</strong> (explorer l'arbre des coups le plus loin et le plus
          intelligemment possible) et <strong>évaluer</strong> (juger une position sans aller jusqu'au mat). Les progrès viennent tour à tour de l'une et de
          l'autre.
        </p>
        <Timeline />
      </section>

      <section id="eng-fiches" className="eng-section">
        <SectionHead id="eng-fiches" title="Fiches moteurs">
          <button className="btn" onClick={() => setOpenCards(allOpen ? new Set() : new Set(ENGINES.map((e) => e.id)))}>
            {allOpen ? 'Tout replier' : 'Tout déplier'}
          </button>
        </SectionHead>
        <p className="prose eng-intro muted">
          Une fiche par moteur, comme au catalogue d’une bibliothèque : origine, licence, méthode de recherche, évaluation, force et style.
        </p>
        <div className="eng-cards">
          {ENGINES.map((e, k) => (
            <EngineCard key={e.id} engine={e} index={k} open={openCards.has(e.id)} onToggle={(o) => toggle(e.id, o)} />
          ))}
        </div>
      </section>

      <section id="eng-comparatif" className="eng-section">
        <SectionHead id="eng-comparatif" title="Tableau comparatif" />
        <p className="muted prose eng-intro">
          Forces indicatives (classements CCRL/TCEC, fin 2026). Au sommet, les écarts sont minimes : une vingtaine de points Elo séparent une quinzaine de
          moteurs, et l'ordre change selon la cadence et le matériel.
        </p>
        <div className="table-scroll eng-table-wrap">
          <table className="eng-table">
            <thead>
              <tr>
                <th scope="col">Moteur</th>
                <th scope="col">Recherche</th>
                <th scope="col">Évaluation</th>
                <th scope="col">Matériel</th>
                <th scope="col">Open source</th>
                <th scope="col">Force</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.name}>
                  <th scope="row">{r.name}</th>
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
        <SectionHead id="eng-concepts" title="Comment ça marche" />
        <p className="prose eng-intro muted">
          Les deux familles de moteurs : <strong>alpha-bêta + NNUE</strong> (Stockfish, Torch, Berserk…) qui calculent des millions de positions avec un
          jugement rapide, et <strong>MCTS + réseau profond</strong> (AlphaZero, Leela) qui en calculent mille fois moins mais les jugent bien mieux.
        </p>
        {CONCEPTS.map((c, j) => (
          <article key={c.id} id={`eng-c-${c.id}`} className="eng-concept eng-section">
            <h3>
              <span className="eng-h-num">
                {conceptsNum}.{j + 1}
              </span>
              <span>{c.title}</span>
            </h3>
            <div className="prose eng-concept-body">
              {c.body.map((p, i) => (
                <p key={i}>{rich(p)}</p>
              ))}
            </div>
            {c.takeaway && (
              <p className="eng-takeaway">
                <span className="eng-takeaway-label">En une phrase</span>
                <span>{rich(c.takeaway)}</span>
              </p>
            )}
            {c.visual && <ConceptVisual kind={c.visual} />}
          </article>
        ))}
      </section>

      <section id="eng-demo" className="eng-section">
        <SectionHead id="eng-demo" title="Voir le moteur réfléchir" />
        <p className="prose eng-intro muted">
          Lance Stockfish et regarde l'approfondissement itératif : à chaque profondeur, une nouvelle ligne s'ajoute au tableau. Les lignes surlignées
          marquent un <strong>changement d'avis</strong> du moteur — la preuve qu'une évaluation à faible profondeur peut être trompeuse.
        </p>
        <div className="card eng-demo-card">
          <DepthDemo />
        </div>
      </section>

      <section id="eng-pour-toi" className="eng-section">
        <SectionHead id="eng-pour-toi" title="Ce que ça change pour toi" />
        <p className="prose eng-intro">
          Un moteur est un <strong>oracle qui ne s'explique pas</strong>. Bien utilisé, c'est le meilleur entraîneur du monde ; mal utilisé, il te donne
          l'illusion de comprendre. Quelques règles pour progresser :
        </p>
        <ol className="eng-tips">
          {TIPS.map((t) => (
            <li key={t.title}>
              <h3>{t.title}</h3>
              <p>{rich(t.text)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="eng-sources" className="eng-section">
        <SectionHead id="eng-sources" title="Sources" />
        <p className="muted eng-intro">Informations vérifiées en novembre 2026 ; les classements de moteurs évoluent vite.</p>
        <ol className="eng-sources">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
