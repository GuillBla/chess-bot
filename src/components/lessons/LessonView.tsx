import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../../content/lessons/types';
import PositionViewer from './PositionViewer';
import ExercisePlayer from './ExercisePlayer';
import { Paragraphs } from './RichText';
import { LEVEL_LABELS } from './LessonList';
import { markSolved, useProgress } from './progress';

const BASE = '/teacher/lessons';

interface Props {
  lesson: Lesson;
  prev?: Lesson;
  next?: Lesson;
}

export default function LessonView({ lesson, prev, next }: Props) {
  const progress = useProgress();
  const solved = new Set(progress[lesson.id] ?? []);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    window.scrollTo?.(0, 0);
  }, [lesson.id]);

  const ex = lesson.exercises[current];

  return (
    <article className="lesson">
      <nav className="lesson-breadcrumb">
        <Link to={BASE}>← Toutes les leçons</Link>
      </nav>
      <header className="lesson-header">
        <span className="badge idea">{LEVEL_LABELS[lesson.level]}</span>
        <h2 className="lesson-title">{lesson.title}</h2>
        <p className="lead">{lesson.summary}</p>
      </header>

      {lesson.sections.map((s, i) =>
        s.type === 'text' ? (
          <section key={i} className="prose lesson-text">
            {s.title && <h3>{s.title}</h3>}
            <Paragraphs items={s.paragraphs} />
          </section>
        ) : (
          <PositionViewer key={`${lesson.id}-${i}`} section={s} id={`${lesson.id}-pos-${i}`} />
        ),
      )}

      {lesson.exercises.length > 0 && (
        <section className="lesson-exercises">
          <h3>
            Exercices{' '}
            <span className="muted small">
              ({[...solved].filter((k) => k < lesson.exercises.length).length}/{lesson.exercises.length} réussis)
            </span>
          </h3>
          <div className="lesson-ex-tabs" role="tablist">
            {lesson.exercises.map((_, k) => (
              <button
                key={k}
                role="tab"
                aria-selected={k === current}
                className={`btn ${k === current ? 'primary' : ''}`}
                onClick={() => setCurrent(k)}
              >
                {solved.has(k) ? '✓ ' : ''}
                {k + 1}
              </button>
            ))}
          </div>
          <div className="card">
            <ExercisePlayer
              key={`${lesson.id}-${current}`}
              exercise={ex}
              index={current}
              solvedBefore={solved.has(current)}
              onSolved={() => markSolved(lesson.id, current)}
            />
            {current < lesson.exercises.length - 1 && (
              <div className="btn-row lesson-ex-next">
                <button className="btn" onClick={() => setCurrent(current + 1)}>
                  Exercice suivant →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <nav className="lesson-pager">
        {prev ? (
          <Link className="card link-card" to={`${BASE}/${prev.id}`}>
            <span className="muted small">← Leçon précédente</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="card link-card lesson-pager-next" to={`${BASE}/${next.id}`}>
            <span className="muted small">Leçon suivante →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
