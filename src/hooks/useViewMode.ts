import { usePersistentState } from '@/hooks/usePersistentState';

export type ViewMode = 'grid' | 'list';

const decode = (raw: string): ViewMode | null => (raw === 'list' || raw === 'grid' ? raw : null);
const encode = (view: ViewMode) => view;
const grid = (): ViewMode => 'grid';

export function useViewMode(): { view: ViewMode; toggle: () => void } {
  const [view, setView] = usePersistentState('pokemax.view', decode, encode, grid);
  return { view, toggle: () => setView((v) => (v === 'grid' ? 'list' : 'grid')) };
}
