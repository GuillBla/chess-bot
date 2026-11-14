import { useEffect, useState } from 'react';

type Theme = 'auto' | 'light' | 'dark';

function load(): Theme {
  try {
    return (localStorage.getItem('theme') as Theme) || 'auto';
  } catch {
    return 'auto';
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(load);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* stockage indisponible */
    }
  }, [theme]);
  const next: Record<Theme, Theme> = { auto: 'light', light: 'dark', dark: 'auto' };
  const icon = { auto: '◐', light: '☀', dark: '☾' }[theme];
  return (
    <button className="btn ghost theme-toggle" onClick={() => setTheme(next[theme])} title={`Thème : ${theme}`}>
      {icon}
    </button>
  );
}
