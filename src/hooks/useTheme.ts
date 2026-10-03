import { useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';

export type Theme = 'dark' | 'light';

const decode = (raw: string): Theme | null => (raw === 'light' || raw === 'dark' ? raw : null);
const encode = (theme: Theme) => theme;
const systemTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = usePersistentState('pokemax.theme', decode, encode, systemTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) };
}
