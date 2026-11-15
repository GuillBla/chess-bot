import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import PreferencesMenu from './components/PreferencesMenu';
import { PieceIcon, type PieceCode } from './components/pieces';

// Pages chargées à la demande (recharts, contenu des leçons… ne pèsent pas sur l'accueil)
const Play = lazy(() => import('./pages/Play'));
const Analyze = lazy(() => import('./pages/Analyze'));
const Teacher = lazy(() => import('./pages/Teacher'));
const Openings = lazy(() => import('./pages/Openings'));
const Engines = lazy(() => import('./pages/Engines'));
const Profile = lazy(() => import('./pages/Profile'));

const NAV: { to: string; label: string; piece: PieceCode }[] = [
  { to: '/play', label: 'Jouer', piece: 'wN' },
  { to: '/analyze', label: 'Analyse', piece: 'wQ' },
  { to: '/openings', label: 'Ouvertures', piece: 'wB' },
  { to: '/teacher', label: 'Professeur', piece: 'wK' },
  { to: '/engines', label: 'Moteurs', piece: 'wR' },
  { to: '/profile', label: 'Mes stats', piece: 'wP' },
];

function NavLinks() {
  return (
    <>
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <PieceIcon piece={n.piece} />
          <span>{n.label}</span>
        </NavLink>
      ))}
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <PieceIcon piece="wN" size={30} />
          Chess Bot
        </NavLink>
        <nav aria-label="Navigation principale">
          <NavLinks />
        </nav>
        <div className="tools">
          <PreferencesMenu />
        </div>
      </header>
      <main className="content">
        <Suspense
          fallback={
            <p className="muted">
              <span className="spinner" /> Chargement…
            </p>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/openings/*" element={<Openings />} />
            <Route path="/teacher/*" element={<Teacher />} />
            <Route path="/engines" element={<Engines />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="footer">
        Moteur : Stockfish 17.1 (WASM, GPLv3) · Pièces : cburnett (GPLv2+) · Données : API publique chess.com
      </footer>
      <nav className="bottom-nav" aria-label="Navigation mobile">
        <NavLinks />
      </nav>
    </div>
  );
}
