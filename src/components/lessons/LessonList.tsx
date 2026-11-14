import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lesson } from '../../content/lessons/types';
import { getLastLesson, solvedCount, useProgress, type Progress } from './progress';
import { PARTS, partLabel } from './book';

function exercisesLabel(n: number) {
  return `${n} exercice${n > 1 ? 's' : ''}`;
}

/** Fine barre de progression en laiton. */
function ProgressRule({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total ? Math.round((100 * value) / total) : 0;
  return (
    <span className="book-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}

/** Leçon à reprendre : la dernière ouverte si elle n'est pas finie, sinon la première entamée. */
function findResume(lessons: Lesson[], progress: Progress, lastId: string | null): Lesson | undefined {
  const unfinished = (l: Lesson) => solvedCount(progress, l.id, l.exercises.length) < l.exercises.length;
  const last = lastId ? lessons.find((l) => l.id === lastId) : undefined;
  if (last && unfinished(last)) return last;
  return lessons.find((l) => {
    const n = solvedCount(progress, l.id, l.exercises.length);
    return n > 0 && n < l.exercises.length;
  });
}

export default function LessonList({ lessons }: { lessons: Lesson[] }) {
  const progress = useProgress();
  const [lastId] = useState(getLastLesson);
  const total = lessons.reduce((n, l) => n + l.exercises.length, 0);
  const solved = lessons.reduce((n, l) => n + solvedCount(progress, l.id, l.exercises.length), 0);
  const resume = findResume(lessons, progress, lastId);

  return (
    <div className="book-toc">
      {resume && (() => {
        const n = solvedCount(progress, resume.id, resume.exercises.length);
        const ch = lessons.indexOf(resume) + 1;
        return (
          <Link to={resume.id} className="toc-resume">
            <span className="toc-resume-text">
              <span className="eyebrow">Continuer là où tu t’es arrêté</span>
              <span className="toc-resume-title">
                <span className="toc-resume-num">Chapitre {ch}</span> {resume.title}
              </span>
              <span className="toc-resume-meta">
                <ProgressRule value={n} total={resume.exercises.length} label={`${n} exercices résolus sur ${resume.exercises.length}`} />
                <span className="mono">
                  {n}/{resume.exercises.length}
                </span>
              </span>
            </span>
            <span className="btn primary toc-resume-cta" aria-hidden>
              Reprendre →
            </span>
          </Link>
        );
      })()}

      <div className="book-sheet toc-sheet">
        <header className="toc-head">
          <h2>Table des matières</h2>
          <p className="toc-lede">
            {lessons.length} chapitres de niveau livre, dans les pas de Nimzowitsch, Silman, Dvoretsky et Yusupov : des positions commentées à rejouer, puis des
            exercices vérifiés par Stockfish. Lis-les dans l’ordre : la numérotation suit la progression.
          </p>
          <div className="toc-overall">
            <ProgressRule value={solved} total={total} label={`${solved} exercices résolus sur ${total}`} />
            <span className="muted">
              <strong className="mono">{solved}</strong> / {total} exercices résolus
            </span>
          </div>
        </header>

        {PARTS.map((part) => {
          const group = lessons.filter((l) => l.level === part.level);
          if (!group.length) return null;
          return (
            <section key={part.level} className="toc-part" aria-labelledby={`part-${part.roman}`}>
              <header className="toc-part-head">
                <h3 id={`part-${part.roman}`}>{partLabel(part.level)}</h3>
                <p>{part.intro}</p>
              </header>
              <ol className="toc-list">
                {group.map((l) => {
                  const ch = lessons.indexOf(l) + 1;
                  const count = l.exercises.length;
                  const n = solvedCount(progress, l.id, count);
                  const done = count > 0 && n === count;
                  return (
                    <li key={l.id}>
                      <Link to={l.id} className={`toc-entry${done ? ' is-done' : ''}`}>
                        <span className="toc-num" aria-hidden>
                          {ch}
                        </span>
                        <span className="toc-body">
                          <span className="toc-title">
                            <span className="visually-hidden">Chapitre {ch} : </span>
                            {l.title}
                          </span>
                          <span className="toc-summary">{l.summary}</span>
                          <span className="toc-meta">
                            <span className="toc-count">{exercisesLabel(count)}</span>
                            {done ? (
                              <span className="badge good">Terminée</span>
                            ) : n > 0 ? (
                              <>
                                <ProgressRule value={n} total={count} label={`${n} exercices résolus sur ${count}`} />
                                <span className="mono toc-frac">
                                  {n}/{count}
                                </span>
                              </>
                            ) : null}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
