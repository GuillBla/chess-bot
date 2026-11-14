import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';
import Analyze from './pages/Analyze';
import Teacher from './pages/Teacher';
import Engines from './pages/Engines';
import Profile from './pages/Profile';
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/teacher/*" element={<Teacher />} />
          <Route path="/engines" element={<Engines />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <footer className="footer">Moteur : Stockfish 17.1 (WASM, GPLv3) · Données : API publique chess.com</footer>
    </div>
  );
}
