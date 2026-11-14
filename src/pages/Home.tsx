import { Link } from 'react-router-dom';

const CARDS = [
  { to: '/play', title: 'Jouer contre le bot', text: 'Stockfish réglable de 400 à 3000 Elo, avec indices expliqués en français.' },
  { to: '/analyze', title: 'Analyse expliquée', text: 'Colle une position ou un PGN : meilleurs coups, menaces, plans et « pourquoi pas ce coup ? ».' },
  { to: '/teacher', title: 'Professeur', text: 'Leçons avancées (structures, prophylaxie, finales…) et analyse de tes parties chess.com.' },
  { to: '/engines', title: 'Les moteurs d’échecs', text: 'Stockfish, Leela, AlphaZero, Torch, Maia… comment ils pensent et ce qui les distingue.' },
  { to: '/profile', title: 'Mes statistiques', text: 'Évolution de ton Elo, ouvertures, résultats par couleur et cadence.' },
];

export default function Home() {
  return (
    <div className="page">
      <h1>Jouer, comprendre, progresser</h1>
      <p className="lead">Un compagnon d’entraînement pour passer un cap après 1200 : chaque coup suggéré est accompagné d’une explication, pas seulement d’une flèche.</p>
      <div className="card-grid">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="card link-card">
            <h2>{c.title}</h2>
            <p>{c.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
