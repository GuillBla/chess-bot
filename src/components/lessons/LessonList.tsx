import { Link } from 'react-router-dom';
import type { Lesson, LessonLevel } from '../../content/lessons/types';
import { useProgress } from './progress';

export const LEVEL_LABELS: Record<LessonLevel, string> = {
  '1200-1500': '1200 → 1500',
  '1500-1800': '1500 → 1800',
  '1800+': '1800 et plus',
};

const LEVEL_INTRO: Record<LessonLevel, string> = {
  '1200-1500': 'Les outils qui font la différence dès maintenant : calcul, tactique combinée, pièces, finales de pions.',
  '1500-1800': 'Plans de milieu de partie, attaque, finales de tours, conversion et défense.',
  '1800+': 'Penser comme un fort joueur : prophylaxie, dynamique contre statique.',
};

export default function LessonList({ lessons }: { lessons: Lesson[] }) {
  const progress = useProgress();
  const levels: LessonLevel[] = ['1200-1500', '1500-1800', '1800+'];
  const total = lessons.reduce((n, l) => n + l.exercises.length, 0);
  const solved = lessons.reduce((n, l) => n + Math.min(l.exercises.length, progress[l.id]?.length ?? 0), 0);

  return (
    <div className="lessons">
      <p className="lead">
        Des leçons de niveau livre (Nimzowitsch, Silman, Dvoretsky, Yusupov) : positions commentées à rejouer, puis exercices
        vérifiés par Stockfish. Progression : <strong>{solved}</strong> / {total} exercices.
      </p>
      {levels.map((lv) => {
        const group = lessons.filter((l) => l.level === lv);
        if (!group.length) return null;
        return (
          <section key={lv} className="lesson-level">
            <h2>
              <span className="badge idea">{LEVEL_LABELS[lv]}</span>
            </h2>
            <p className="muted">{LEVEL_INTRO[lv]}</p>
            <div className="card-grid">
              {group.map((l) => {
                const n = Math.min(l.exercises.length, progress[l.id]?.length ?? 0);
                const pct = l.exercises.length ? Math.round((100 * n) / l.exercises.length) : 0;
                return (
                  <Link key={l.id} to={l.id} className="card link-card lesson-card">
                    <h3>{l.title}</h3>
                    <p>{l.summary}</p>
                    <div className="lesson-progress" aria-label={`${n} exercices réussis sur ${l.exercises.length}`}>
                      <div className="lesson-progress-bar">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`badge ${n === l.exercises.length && n > 0 ? 'good' : ''}`}>
                        {n}/{l.exercises.length}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
