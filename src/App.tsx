import { NavLink, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from './pages/Home';

// Pages chargées à la demande (recharts, contenu des leçons… ne pèsent pas sur l'accueil)
const Play = lazy(() => import('./pages/Play'));
const Analyze = lazy(() => import('./pages/Analyze'));
const Teacher = lazy(() => import('./pages/Teacher'));
const Engines = lazy(() => import('./pages/Engines'));
const Profile = lazy(() => import('./pages/Profile'));
import ThemeToggle from './components/ThemeToggle';

const NAV = [
  { to: '/play', label: 'Jouer' },
  { to: '/analyze', label: 'Analyse' },
  { to: '/teacher', label: 'Professeur' },
  { to: '/engines', label: 'Moteurs' },
  { to: '/profile', label: 'Mes stats' },
];

export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span aria-hidden>♞</span> Chess Bot
        </NavLink>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <ThemeToggle />
      </header>
      <main className="content">
        <Suspense fallback={<p className="muted"><span className="spinner" /> Chargement…</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/teacher/*" element={<Teacher />} />
          <Route path="/engines" element={<Engines />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        </Suspense>
      </main>
      <footer className="footer">Moteur : Stockfish 17.1 (WASM, GPLv3) · Données : API publique chess.com</footer>
    </div>
  );
}
