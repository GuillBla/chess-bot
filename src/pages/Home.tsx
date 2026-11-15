import { Link } from 'react-router-dom';
import Board from '../components/Board';
import { PieceIcon, type PieceCode } from '../components/pieces';
import LiveGame from '../components/home/LiveGame';
import { OPERA_KEY_TEXT } from '../content/famousGames';
import { MAX_ELO, MIN_ELO } from '../engine/strength';

interface Section {
  to: string;
  piece: PieceCode;
  title: string;
  text: string;
  detail: string;
}

// Chiffres vérifiés le 14/11/2026 : 11 leçons et 34 exercices (content/lessons), 10 fiches moteurs (content/engines).
const SECTIONS: Section[] = [
  {
    to: '/play',
    piece: 'wN',
    title: 'Jouer',
    text: 'Affronte Stockfish au niveau de ton choix ; chaque indice dit pourquoi le coup est bon.',
    detail: `${MIN_ELO} → ${MAX_ELO} Elo`,
  },
  {
    to: '/analyze',
    piece: 'wQ',
    title: 'Analyse',
    text: 'Colle une position ou un PGN : menaces, plans, et la réponse à « pourquoi pas ce coup ? ».',
    detail: 'FEN · PGN · Stockfish 17.1',
  },
  {
    to: '/openings',
    piece: 'wB',
    title: 'Ouvertures',
    text: 'Le Londres et un répertoire noir cohérent : chaque coup expliqué, à tester soi-même, puis mémorisé par répétition espacée.',
    detail: '4 répertoires · 4 ouvertures « culture »',
  },
  {
    to: '/teacher',
    piece: 'wK',
    title: 'Professeur',
    text: 'Structures de pions, prophylaxie, finales de tours… puis la revue de tes parties chess.com.',
    detail: '11 leçons · 34 exercices',
  },
  {
    to: '/engines',
    piece: 'wR',
    title: 'Moteurs',
    text: 'Comment pensent Stockfish, Leela, AlphaZero ou Maia, et ce qui les distingue vraiment.',
    detail: '10 moteurs · de 1950 à aujourd’hui',
  },
  {
    to: '/profile',
    piece: 'wP',
    title: 'Mes stats',
    text: 'Ton Elo dans le temps, tes ouvertures et tes résultats par couleur et par cadence.',
    detail: 'Données chess.com',
  },
];

// Position de la partie de l'Opéra après 15…Cxd7, Blancs au trait.
const OPERA_16_FEN = '4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16';

export default function Home() {
  return (
    <div className="page home">
      <section className="home-hero">
        <div className="home-hero-text">
          <span className="eyebrow">Entraînement aux échecs · en français</span>
          <h1>
            Chaque coup a <em>une raison</em>.
          </h1>
          <p className="home-hero-lead">
            Joue contre Stockfish à ton niveau, analyse tes parties et comprends enfin pourquoi un coup est bon : menaces, plans et tactiques,
            expliqués en phrases claires plutôt qu’en simples flèches.
          </p>
          <div className="btn-row home-hero-actions">
            <Link to="/play" className="btn primary">
              <PieceIcon piece="wN" size={22} />
              Jouer contre le bot
            </Link>
            <Link to="/analyze" className="btn">
              <PieceIcon piece="wQ" size={22} />
              Analyser une position
            </Link>
          </div>
          <p className="home-hero-note muted">Gratuit, sans compte : le moteur tourne dans ton navigateur.</p>
        </div>
        <div className="home-hero-board">
          <LiveGame />
        </div>
      </section>

      <section className="home-index" aria-labelledby="home-index-title">
        <header className="home-index-head">
          <span className="eyebrow">Au sommaire</span>
          <h2 id="home-index-title">Cinq salles, un même club</h2>
          <p className="muted">De la partie d’entraînement à la revue de tes erreurs, tout parle la même langue : la notation française et des explications concrètes.</p>
        </header>
        <ol className="home-index-list">
          {SECTIONS.map((s) => (
            <li key={s.to}>
              <Link to={s.to} className="home-index-item">
                <span className="home-index-icon">
                  <PieceIcon piece={s.piece} size={40} />
                </span>
                <span className="home-index-body">
                  <span className="home-index-title">{s.title}</span>
                  <span className="home-index-text">{s.text}</span>
                </span>
                <span className="home-index-detail mono">{s.detail}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-why" aria-labelledby="home-why-title">
        <div className="home-why-intro">
          <span className="eyebrow">Ce qui rend ce site différent</span>
          <h2 id="home-why-title">Une flèche montre le coup. Ici, on te dit pourquoi.</h2>
          <p>
            Ailleurs, le moteur trace une flèche de b3 à b8 et passe à la suite. Ici, chaque suggestion arrive avec son idée tactique, la suite
            forcée et ce que l’adversaire ne peut plus faire.
          </p>
        </div>
        <div className="home-why-demo">
          <div className="home-why-board">
            <Board id="home-why" fen={OPERA_16_FEN} arrows={[{ from: 'b3', to: 'b8', kind: 'good' }]} sound={false} maxWidth={260} />
            <span className="home-why-caption mono">Morphy, Opéra 1858 · Blancs au trait</span>
          </div>
          <article className="home-why-card">
            <div className="home-why-tags">
              <span className="cls-chip cls-brilliant">!!</span>
              <span className="badge good">Mat en 2</span>
              <span className="badge idea">Déviation</span>
            </div>
            <h3 className="mono">16. Db8+!!</h3>
            <p>{OPERA_KEY_TEXT}</p>
            <dl className="home-why-points">
              <dt>Tactique</dt>
              <dd>Déviation, puis mat sur la colonne d</dd>
              <dt>Suite forcée</dt>
              <dd className="mono">16…Cxb8 17. Td8#</dd>
            </dl>
          </article>
        </div>
      </section>
    </div>
  );
}
