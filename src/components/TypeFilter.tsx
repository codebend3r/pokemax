import { TYPES, TYPE_COLORS, type PokeType } from '@/typeChart';

interface Props {
  selected: Set<PokeType>;
  onToggle: (type: PokeType) => void;
  onClear: () => void;
}

export default function TypeFilter({ selected, onToggle, onClear }: Props) {
  return (
    <div className="crt-typefilter">
      <div className="crt-typefilter-label">▶ FILTER BY TYPE</div>
      <div className="crt-typefilter-chips">
        {TYPES.map((t) => {
          const active = selected.has(t);
          return (
            <button
              key={t}
              type="button"
              className={'crt-tf-chip' + (active ? ' active' : '')}
              style={{ ['--type-color' as string]: TYPE_COLORS[t] }}
              onClick={() => onToggle(t)}
              aria-pressed={active}
            >
              {t}
            </button>
          );
        })}
        {selected.size > 0 && (
          <button type="button" className="crt-tf-clear" onClick={onClear}>
            [ clear ]
          </button>
        )}
      </div>
    </div>
  );
}
