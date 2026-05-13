import { useEffect, useState } from 'react';

export type ViewMode = 'grid' | 'list';

const KEY = 'pokemax.view';

function detectInitial(): ViewMode {
  if (typeof window === 'undefined') return 'grid';
  const stored = window.localStorage.getItem(KEY);
  return stored === 'list' ? 'list' : 'grid';
}

export function useViewMode(): { view: ViewMode; toggle: () => void; set: (v: ViewMode) => void } {
  const [view, setView] = useState<ViewMode>(detectInitial);

  useEffect(() => {
    window.localStorage.setItem(KEY, view);
  }, [view]);

  return {
    view,
    set: setView,
    toggle: () => setView((v) => (v === 'grid' ? 'list' : 'grid')),
  };
}
