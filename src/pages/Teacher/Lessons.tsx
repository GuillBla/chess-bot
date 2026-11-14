import { Link, Route, Routes, useParams } from 'react-router-dom';
import { lessons, getLesson } from '../../content/lessons';
import LessonList from '../../components/lessons/LessonList';
import LessonView from '../../components/lessons/LessonView';
import { BASE } from '../../components/lessons/book';

function LessonRoute() {
  const { id } = useParams();
  const lesson = id ? getLesson(id) : undefined;
  if (!lesson) {
    return (
      <div className="card book-missing">
        <p>Ce chapitre est introuvable.</p>
        <Link to={BASE}>← Retour à la table des matières</Link>
      </div>
    );
  }
  return <LessonView lesson={lesson} lessons={lessons} />;
}

/** Monté par la page Professeur sous `lessons/*` : `/teacher/lessons` (table des matières) et `/teacher/lessons/:id`. */
export default function Lessons() {
  return (
    <Routes>
      <Route index element={<LessonList lessons={lessons} />} />
      <Route path=":id" element={<LessonRoute />} />
    </Routes>
  );
}
