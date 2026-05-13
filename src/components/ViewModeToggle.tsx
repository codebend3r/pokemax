import type { ViewMode } from '@/hooks/useViewMode';

interface Props {
  view: ViewMode;
  onToggle: () => void;
}

export default function ViewModeToggle({ view, onToggle }: Props) {
  const isGrid = view === 'grid';
  return (
    <button
      type="button"
      className="crt-theme-toggle crt-view-toggle"
      onClick={onToggle}
      aria-label={isGrid ? 'Switch to list view' : 'Switch to grid view'}
      title={isGrid ? 'List view' : 'Grid view'}
    >
      {isGrid ? '☰' : '▦'}
    </button>
  );
}
