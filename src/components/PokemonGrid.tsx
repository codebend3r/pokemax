import { useState } from 'react';
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

function GridCell({
  s,
  selected,
  onSelect,
}: {
  s: Gen8Species;
  selected: boolean;
  onSelect: (name: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const src = hover ? `${ANIM_BASE}/${s.id}.gif` : `${PIXEL_BASE}/${s.id}.png`;
  return (
    <button
      type="button"
      className={'crt-grid-cell' + (selected ? ' active' : '')}
      onClick={() => onSelect(s.name)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <span className="crt-grid-dex">№{String(s.id).padStart(3, '0')}</span>
      <img
        className={hover ? 'animated' : ''}
        src={src}
        alt={s.name}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = `${PIXEL_BASE}/${s.id}.png`;
        }}
      />
      <span className="crt-grid-name">{pretty(s.name)}</span>
    </button>
  );
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
          <GridCell key={s.name} s={s} selected={s.name === selected} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
