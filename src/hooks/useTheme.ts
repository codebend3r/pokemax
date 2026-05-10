import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const KEY = 'pokemax.theme';

function detectInitial(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function useTheme(): { theme: Theme; toggle: () => void; set: (t: Theme) => void } {
  const [theme, setTheme] = useState<Theme>(detectInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(KEY, theme);
  }, [theme]);

  return {
    theme,
    set: setTheme,
    toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
  };
}
