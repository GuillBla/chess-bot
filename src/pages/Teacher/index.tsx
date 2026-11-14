import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Lessons from './Lessons';
import MyGames from './MyGames';

export default function Teacher() {
  const { pathname } = useLocation();
  // Dans un chapitre, l'en-tête se fait discret : le titre du chapitre prend le relais.
  const inChapter = /\/teacher\/lessons\/[^/]+/.test(pathname);

  return (
    <div className={`page teacher-page${inChapter ? ' is-reading' : ''}`}>
      <header className="page-head teacher-head">
        <span className="eyebrow">Le Professeur</span>
        <h1>Leçons &amp; analyse de tes parties</h1>
        {!inChapter && (
          <p className="lead">
            Un cours qui se lit comme un livre d’échecs : des chapitres commentés, des diagrammes à rejouer, des exercices vérifiés par Stockfish. Et la
            relecture de tes propres parties, coup par coup.
          </p>
        )}
      </header>
      <nav className="tabs teacher-tabs" aria-label="Sections du Professeur">
        <NavLink to="lessons" className={({ isActive }) => (isActive ? 'active' : '')}>
          Leçons
        </NavLink>
        <NavLink to="my-games" className={({ isActive }) => (isActive ? 'active' : '')}>
          Analyse de mes parties
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<Navigate to="lessons" replace />} />
        <Route path="lessons/*" element={<Lessons />} />
        <Route path="my-games/*" element={<MyGames />} />
      </Routes>
    </div>
  );
}
