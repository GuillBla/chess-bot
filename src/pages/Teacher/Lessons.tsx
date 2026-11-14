import { Link, Route, Routes, useParams } from 'react-router-dom';
import { lessons, getLesson } from '../../content/lessons';
import LessonList from '../../components/lessons/LessonList';
import LessonView from '../../components/lessons/LessonView';

function LessonRoute() {
  const { id } = useParams();
  const lesson = id ? getLesson(id) : undefined;
  if (!lesson) {
    return (
      <div className="card">
        <p>Leçon introuvable.</p>
        <Link to="/teacher/lessons">← Retour aux leçons</Link>
      </div>
    );
  }
  const i = lessons.indexOf(lesson);
  return <LessonView lesson={lesson} prev={lessons[i - 1]} next={lessons[i + 1]} />;
}

/** Monté par la page Professeur sous `lessons/*` : `/teacher/lessons` (liste) et `/teacher/lessons/:id`. */
export default function Lessons() {
  return (
    <Routes>
      <Route index element={<LessonList lessons={lessons} />} />
      <Route path=":id" element={<LessonRoute />} />
    </Routes>
  );
}
