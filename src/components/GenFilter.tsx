import { GENERATIONS } from '../generations';

interface Props {
  selected: Set<number>;
  onToggle: (gen: number) => void;
  onClear: () => void;
}

export default function GenFilter({ selected, onToggle, onClear }: Props) {
  const allActive = selected.size === 0;
  return (
    <div className="crt-genfilter">
      <div className="crt-genfilter-label">▶ FILTER BY GENERATION</div>
      <div className="crt-genfilter-chips">
        <button
          type="button"
          className={'crt-gen-chip all' + (allActive ? ' active' : '')}
          onClick={onClear}
          aria-pressed={allActive}
        >
          ALL
        </button>
        {GENERATIONS.map((g) => {
          const active = selected.has(g.num);
          return (
            <button
              key={g.num}
              type="button"
              className={'crt-gen-chip' + (active ? ' active' : '')}
              onClick={() => onToggle(g.num)}
              aria-pressed={active}
              title={g.region}
            >
              <span className="crt-gen-chip-roman">{g.roman}</span>
              <span className="crt-gen-chip-region">{g.region}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
