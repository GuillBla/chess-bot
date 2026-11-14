import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import Lessons from './Lessons';
import MyGames from './MyGames';

export default function Teacher() {
  return (
    <div className="page">
      <h1>Professeur</h1>
      <div className="tabs">
        <NavLink to="lessons" className={({ isActive }) => (isActive ? 'active' : '')}>Leçons</NavLink>
        <NavLink to="my-games" className={({ isActive }) => (isActive ? 'active' : '')}>Analyse de mes parties</NavLink>
      </div>
      <Routes>
        <Route index element={<Navigate to="lessons" replace />} />
        <Route path="lessons/*" element={<Lessons />} />
        <Route path="my-games/*" element={<MyGames />} />
      </Routes>
    </div>
  );
}
