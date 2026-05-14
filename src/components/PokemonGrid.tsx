import { useEffect, useState } from 'react';
import type { Gen8Species } from '@/types';
import type { PokeType } from '@/typeChart';
import type { ViewMode } from '@/hooks/useViewMode';
import type { PageSize } from '@/hooks/usePageSize';
import TypeFilter from '@/components/TypeFilter';
import ViewModeToggle from '@/components/ViewModeToggle';
import PageSizeSelector from '@/components/PageSizeSelector';
import Pagination from '@/components/Pagination';

interface Props {
  species: Gen8Species[];
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

const PIXEL_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const BW_ANIM_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
const SHOWDOWN_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';

const MAX_BW_ID = 649;

function pretty(name: string): string {
  return name.replace(/-/g, ' ');
}

function cellLabel(s: Gen8Species): string {
  if (s.formLabel && s.speciesName) {
    return `${pretty(s.speciesName)} · ${s.formLabel}`;
  }
  return pretty(s.name);
}

function GridCell({
  s,
  parentId,
  selected,
  onSelect,
}: {
  s: Gen8Species;
  /** Base species' national-dex ID — used as the sprite fallback if this form has none */
  parentId?: number;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  const [stillOk, setStillOk] = useState(true);
  const [animOk, setAnimOk] = useState(true);
  const stillSrc = stillOk
    ? `${PIXEL_BASE}/${s.id}.png`
    : parentId
      ? `${PIXEL_BASE}/${parentId}.png`
      : null;
  const animSrc = animOk
    ? s.id <= MAX_BW_ID
      ? `${BW_ANIM_BASE}/${s.id}.gif`
      : `${SHOWDOWN_BASE}/${s.id}.gif`
    : parentId
      ? `${SHOWDOWN_BASE}/${parentId}.gif`
      : null;

  return (
    <button
      type="button"
      className={
        'crt-grid-cell' + (selected ? ' active' : '') + (animSrc ? ' has-anim' : ' no-anim')
      }
      onClick={() => onSelect(s.name)}
    >
      <span className="crt-grid-dex">#{String(s.id).padStart(3, '0')}</span>
      <span className="crt-grid-sprite">
        {stillSrc && (
          <img
            className="grid-still"
            src={stillSrc}
            alt={s.name}
            loading="lazy"
            decoding="async"
            onError={() => setStillOk(false)}
          />
        )}
        {animSrc && (
          <img
            className="grid-anim"
            src={animSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={() => setAnimOk(false)}
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
  // Lookup parent species's national-dex ID so alt forms whose own sprite is missing
  // fall back to their parent's sprite instead of showing a broken image.
  const parentIdByName = new Map<string, number>();
  for (const s of species) {
    if (!s.speciesName) parentIdByName.set(s.name, s.id);
  }

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
  useEffect(() => {
    setPage(0);
  }, [species, query, selectedTypes, pageSize]);

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
                parentId={s.speciesName ? parentIdByName.get(s.speciesName) : undefined}
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
