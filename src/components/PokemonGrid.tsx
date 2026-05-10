import type { Gen8Species } from '../types';
import type { PokeType } from '../typeChart';
import TypeFilter from './TypeFilter';

interface Props {
  species: Gen8Species[];
  query: string;
  selected: string | null;
  onSelect: (name: string) => void;
  typeIndex: Map<number, PokeType[]> | null;
  selectedTypes: Set<PokeType>;
  onToggleType: (t: PokeType) => void;
  onClearTypes: () => void;
}

const PIXEL_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const ANIM_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';

function pretty(name: string): string {
  return name.replace(/-/g, ' ');
}

export default function PokemonGrid({
  species,
  query,
  selected,
  onSelect,
  typeIndex,
  selectedTypes,
  onToggleType,
  onClearTypes,
}: Props) {
  const q = query.trim().toLowerCase();
  const visible = species.filter((s) => {
    if (q && !s.name.includes(q)) return false;
    if (selectedTypes.size > 0) {
      const types = typeIndex?.get(s.id) ?? [];
      const matches = types.some((t) => selectedTypes.has(t));
      if (!matches) return false;
    }
    return true;
  });

  if (species.length === 0) return null;

  return (
    <div className="crt-grid-wrap">
      <TypeFilter selected={selectedTypes} onToggle={onToggleType} onClear={onClearTypes} />

      {visible.length === 0 ? (
        <div className="crt-grid-empty">▶ NO MATCHES IN GEN VIII</div>
      ) : (
        <>
          <div className="crt-grid-count">
            ▶ {visible.length} / {species.length} ENTRIES
          </div>
          <div className="crt-grid">
            {visible.map((s) => (
              <button
                key={s.name}
                type="button"
                className={'crt-grid-cell' + (s.name === selected ? ' active' : '')}
                onClick={() => onSelect(s.name)}
              >
                <span className="crt-grid-dex">№{String(s.id).padStart(3, '0')}</span>
                <span className="crt-grid-sprite">
                  <img
                    className="grid-still"
                    src={`${PIXEL_BASE}/${s.id}.png`}
                    alt={s.name}
                    loading="lazy"
                    decoding="async"
                  />
                  <img
                    className="grid-anim"
                    src={`${ANIM_BASE}/${s.id}.gif`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="crt-grid-name">{pretty(s.name)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
