import { useState } from 'react';
import { useFallbackSrc } from '@/hooks/useFallbackSrc';
import { gridAnimations, gridStills } from '@/sprites';
import type { DexEntry } from '@/types';
import type { PokeType } from '@/typeChart';
import type { ViewMode } from '@/hooks/useViewMode';
import type { PageSize } from '@/hooks/usePageSize';
import TypeFilter from '@/components/TypeFilter';
import ViewModeToggle from '@/components/ViewModeToggle';
import PageSizeSelector from '@/components/PageSizeSelector';
import Pagination from '@/components/Pagination';
import { spaced } from '@/textUtil';

interface Props {
  species: DexEntry[];
  query: string;
  selected: string | null;
  onSelect: (name: string) => void;
  view: ViewMode;
  onToggleView: () => void;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  typeIndex: Map<number, PokeType[]> | null;
  selectedTypes: Set<PokeType>;
  onToggleType: (t: PokeType) => void;
  onClearTypes: () => void;
}

function cellLabel(s: DexEntry): string {
  return s.kind === 'form' ? `${spaced(s.speciesName)} · ${s.formLabel}` : spaced(s.name);
}

function GridCell({
  s,
  parentId,
  selected,
  onSelect,
}: {
  s: DexEntry;
  /** Base species' national-dex ID — used as the sprite fallback if this form has none */
  parentId?: number;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  const still = useFallbackSrc(gridStills(s.id, parentId));
  const anim = useFallbackSrc(gridAnimations(s.id, parentId));

  return (
    <button
      type="button"
      className={
        'crt-grid-cell' + (selected ? ' active' : '') + (anim.src ? ' has-anim' : ' no-anim')
      }
      onClick={() => onSelect(s.name)}
    >
      <span className="crt-grid-dex">#{String(s.id).padStart(3, '0')}</span>
      <span className="crt-grid-sprite">
        {still.src && (
          <img
            className="grid-still"
            src={still.src}
            alt={s.name}
            loading="lazy"
            decoding="async"
            onError={still.next}
          />
        )}
        {anim.src && (
          <img
            className="grid-anim"
            src={anim.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={anim.next}
          />
        )}
      </span>
      <span className="crt-grid-name">{cellLabel(s)}</span>
    </button>
  );
}

export default function PokemonGrid({
  species,
  query,
  selected,
  onSelect,
  view,
  onToggleView,
  pageSize,
  onPageSizeChange,
  typeIndex,
  selectedTypes,
  onToggleType,
  onClearTypes,
}: Props) {
  const [page, setPage] = useState(0);

  const q = query.trim().toLowerCase();
  const visible = species.filter((s) => {
    if (q && !s.name.includes(q)) return false;
    if (selectedTypes.size > 0) {
      const types = typeIndex?.get(s.id) ?? [];
      const matchesAll = [...selectedTypes].every((t) => types.includes(t));
      if (!matchesAll) return false;
    }
    return true;
  });

  const totalPages = pageSize === Infinity ? 1 : Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = pageSize === Infinity ? 0 : safePage * pageSize;
  const pageEnd = pageSize === Infinity ? visible.length : pageStart + pageSize;
  const pageItems = visible.slice(pageStart, pageEnd);

  // Reset to page 1 whenever the underlying filtered set changes — keeps the user
  // from landing on a stale out-of-range page after they narrow results.
  const [prevFilters, setPrevFilters] = useState({ species, query, selectedTypes, pageSize });
  if (
    prevFilters.species !== species ||
    prevFilters.query !== query ||
    prevFilters.selectedTypes !== selectedTypes ||
    prevFilters.pageSize !== pageSize
  ) {
    setPrevFilters({ species, query, selectedTypes, pageSize });
    setPage(0);
  }

  if (species.length === 0) return null;

  return (
    <div className="crt-grid-wrap">
      <TypeFilter selected={selectedTypes} onToggle={onToggleType} onClear={onClearTypes} />

      {visible.length === 0 ? (
        <div className="crt-grid-empty">▶ NO MATCHES</div>
      ) : (
        <>
          <div className="crt-grid-toolbar">
            <div className="crt-grid-count">
              ▶ {visible.length} / {species.length} ENTRIES
            </div>
            <div className="crt-grid-toolbar-right">
              <PageSizeSelector pageSize={pageSize} onChange={onPageSizeChange} />
              <ViewModeToggle view={view} onToggle={onToggleView} />
            </div>
          </div>
          <div className={'crt-grid' + (view === 'list' ? ' list' : '')}>
            {pageItems.map((s) => (
              <GridCell
                key={s.id}
                s={s}
                parentId={s.kind === 'form' ? s.speciesId : undefined}
                selected={s.name === selected}
                onSelect={onSelect}
              />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
