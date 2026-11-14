import { useEffect, useRef, useState } from 'react';
import { BOARD_THEMES, setPreferences, usePreferences, type ThemePref } from '../lib/preferences';
import { playSound } from '../lib/sound';

const THEMES: { id: ThemePref; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'light', label: 'Clair' },
  { id: 'dark', label: 'Sombre' },
];

/** Menu « Réglages » du bandeau : thème, échiquier, sons, coordonnées. */
export default function PreferencesMenu() {
  const prefs = usePreferences();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="prefs" ref={ref}>
      <button className="btn ghost" aria-expanded={open} aria-label="Réglages d'affichage" title="Réglages" onClick={() => setOpen((o) => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      </button>
      {open && (
        <div className="prefs-panel" role="dialog" aria-label="Réglages d'affichage">
          <div>
            <h4>Thème</h4>
            <div className="seg">
              {THEMES.map((t) => (
                <button key={t.id} className={`btn ${prefs.theme === t.id ? 'on' : ''}`} onClick={() => setPreferences({ theme: t.id })}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4>Échiquier</h4>
            <div className="board-swatches">
              {BOARD_THEMES.map((b) => (
                <button key={b.id} className={prefs.board === b.id ? 'on' : ''} onClick={() => setPreferences({ board: b.id })} aria-pressed={prefs.board === b.id}>
                  <i>
                    <span style={{ background: b.light }} />
                    <span style={{ background: b.dark }} />
                    <span style={{ background: b.dark }} />
                    <span style={{ background: b.light }} />
                  </i>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={prefs.sound}
              onChange={(e) => {
                setPreferences({ sound: e.target.checked });
                if (e.target.checked) playSound('move');
              }}
            />
            Sons des coups
          </label>
          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="checkbox" checked={prefs.coordinates} onChange={(e) => setPreferences({ coordinates: e.target.checked })} />
            Coordonnées sur l'échiquier
          </label>
        </div>
      )}
    </div>
  );
}
