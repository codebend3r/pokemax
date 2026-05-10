import { useState } from 'react';
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
const BW_ANIM_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
const SHOWDOWN_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';

const MAX_BW_ID = 649;

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
  const [animOk, setAnimOk] = useState(true);
  const animUrl = animOk
    ? s.id <= MAX_BW_ID
      ? `${BW_ANIM_BASE}/${s.id}.gif`
      : `${SHOWDOWN_BASE}/${s.id}.gif`
    : null;

  return (
    <button
      type="button"
      className={'crt-grid-cell' + (selected ? ' active' : '') + (animUrl ? ' has-anim' : ' no-anim')}
      onClick={() => onSelect(s.name)}
    >
      <span className="crt-grid-dex">#{String(s.id).padStart(3, '0')}</span>
      <span className="crt-grid-sprite">
        <img
          className="grid-still"
          src={`${PIXEL_BASE}/${s.id}.png`}
          alt={s.name}
          loading="lazy"
          decoding="async"
        />
        {animUrl && (
          <img
            className="grid-anim"
            src={animUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={() => setAnimOk(false)}
          />
        )}
      </span>
      <span className="crt-grid-name">{pretty(s.name)}</span>
    </button>
  );
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
      const matchesAll = [...selectedTypes].every((t) => types.includes(t));
      if (!matchesAll) return false;
    }
    return true;
  });

  if (species.length === 0) return null;

  return (
    <div className="crt-grid-wrap">
      <TypeFilter selected={selectedTypes} onToggle={onToggleType} onClear={onClearTypes} />

      {visible.length === 0 ? (
        <div className="crt-grid-empty">▶ NO MATCHES</div>
      ) : (
        <>
          <div className="crt-grid-count">
            ▶ {visible.length} / {species.length} ENTRIES
          </div>
          <div className="crt-grid">
            {visible.map((s) => (
              <GridCell
                key={s.name}
                s={s}
                selected={s.name === selected}
                onSelect={onSelect}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
