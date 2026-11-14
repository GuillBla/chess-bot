import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../../content/lessons/types';
import PositionViewer from './PositionViewer';
import ExercisePlayer from './ExercisePlayer';
import { RichText } from './RichText';
import { BASE, partLabel } from './book';
import { markSolved, setLastLesson, solvedCount, useProgress } from './progress';

interface Props {
  lesson: Lesson;
  /** Catalogue complet : numérotation des chapitres et pages précédente/suivante. */
  lessons: Lesson[];
}

/** Un chapitre, mis en page comme un livre d'échecs. */
export default function LessonView({ lesson, lessons }: Props) {
  const progress = useProgress();
  const solved = new Set((progress[lesson.id] ?? []).filter((k) => k < lesson.exercises.length));
  const nSolved = solvedCount(progress, lesson.id, lesson.exercises.length);
  const allDone = lesson.exercises.length > 0 && nSolved === lesson.exercises.length;
  const [current, setCurrent] = useState(0);

  const idx = lessons.indexOf(lesson);
  const chapter = idx + 1;
  const prev = idx > 0 ? lessons[idx - 1] : undefined;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : undefined;

  useEffect(() => {
    setCurrent(0);
    setLastLesson(lesson.id);
    window.scrollTo?.(0, 0);
  }, [lesson.id]);

  const ex = lesson.exercises[current];
  // Numérotation continue des diagrammes ; lettrine sur le tout premier paragraphe du chapitre.
  let diagram = 0;
  let firstParagraph = true;

  return (
    <article className="book book-sheet" lang="fr">
      <nav className="book-crumb" aria-label="Fil d’Ariane">
        <Link to={BASE}>← Table des matières</Link>
        <span className="book-crumb-part">{partLabel(lesson.level)}</span>
      </nav>

      <header className="chapter-head">
        <span className="chapter-kicker">Chapitre {chapter}</span>
        <h2 className="chapter-title">{lesson.title}</h2>
        <p className="chapter-standfirst">{lesson.summary}</p>
        <span className="chapter-ornament" aria-hidden>
          <i />
        </span>
      </header>

      {lesson.sections.map((s, i) => {
        if (s.type === 'text') {
          const dropcap = firstParagraph;
          firstParagraph = false;
          return (
            <section key={i} className="book-text">
              {s.title && <h3>{s.title}</h3>}
              {s.paragraphs.map((p, k) => (
                <p key={k} className={dropcap && k === 0 ? 'has-dropcap' : undefined}>
                  <RichText text={p} />
                </p>
              ))}
            </section>
          );
        }
        diagram += 1;
        return <PositionViewer key={`${lesson.id}-${i}`} section={s} id={`${lesson.id}-pos-${i}`} number={diagram} />;
      })}

      {lesson.exercises.length > 0 && (
        <section className="book-exercises" aria-labelledby="ex-heading">
          <header className="ex-section-head">
            <h3 id="ex-heading">Exercices</h3>
            <span className="muted">
              <strong className="mono">{nSolved}</strong> / {lesson.exercises.length} résolus
            </span>
          </header>
          <div className="ex-tabs" role="tablist" aria-label="Exercices du chapitre">
            {lesson.exercises.map((_, k) => (
              <button
                key={k}
                role="tab"
                aria-selected={k === current}
                aria-label={`Exercice ${k + 1}${solved.has(k) ? ' (résolu)' : ''}`}
                className={`ex-tab${k === current ? ' is-current' : ''}${solved.has(k) ? ' is-solved' : ''}`}
                onClick={() => setCurrent(k)}
              >
                {k + 1}
                {solved.has(k) && (
                  <svg className="ex-tab-check" width="10" height="10" viewBox="0 0 10 10" aria-hidden focusable="false">
                    <path d="M1.5 5.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <ExercisePlayer
            key={`${lesson.id}-${current}`}
            exercise={ex}
            index={current}
            total={lesson.exercises.length}
            solvedBefore={solved.has(current)}
            onSolved={() => markSolved(lesson.id, current)}
            footer={
              current < lesson.exercises.length - 1 ? (
                <div className="ex-next">
                  <button className="btn" onClick={() => setCurrent(current + 1)}>
                    Exercice suivant →
                  </button>
                </div>
              ) : null
            }
          />

          {allDone && (
            <aside className="chapter-done" role="status">
              <span className="chapter-done-seal" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 20 20" focusable="false">
                  <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <strong>Leçon terminée</strong>
                <p>
                  Tu as résolu les {lesson.exercises.length} exercices du chapitre {chapter}.
                  {next ? ' La suite t’attend.' : ' C’était le dernier chapitre du livre : bravo.'}
                </p>
              </div>
              {next && (
                <Link className="btn primary" to={`${BASE}/${next.id}`}>
                  Chapitre {chapter + 1} →
                </Link>
              )}
            </aside>
          )}
        </section>
      )}

      <nav className="book-pager" aria-label="Chapitres">
        {prev ? (
          <Link className="book-pager-link is-prev" to={`${BASE}/${prev.id}`} rel="prev">
            <span className="book-pager-dir">← Chapitre {chapter - 1}</span>
            <span className="book-pager-title">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="book-pager-link is-next" to={`${BASE}/${next.id}`} rel="next">
            <span className="book-pager-dir">Chapitre {chapter + 1} →</span>
            <span className="book-pager-title">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
