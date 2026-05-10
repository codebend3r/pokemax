import type { Gen8Species } from '../types';

interface Props {
  species: Gen8Species[];
  query: string;
  selected: string | null;
  onSelect: (name: string) => void;
}

const PIXEL_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const ANIM_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';

function pretty(name: string): string {
  return name.replace(/-/g, ' ');
}

export default function PokemonGrid({ species, query, selected, onSelect }: Props) {
  const q = query.trim().toLowerCase();
  const visible = q ? species.filter((s) => s.name.includes(q)) : species;

  if (species.length === 0) return null;

  if (visible.length === 0) {
    return (
      <div className="crt-grid-empty">
        ▶ NO MATCHES FOR "{query}" IN GEN VIII
      </div>
    );
  }

  return (
    <div className="crt-grid-wrap">
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
    </div>
  );
}
