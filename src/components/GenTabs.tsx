import { GENERATIONS } from '../generations';

interface Props {
  active: number;
  onChange: (gen: number) => void;
}

export default function GenTabs({ active, onChange }: Props) {
  return (
    <div className="crt-tabs" role="tablist" aria-label="Generation">
      {GENERATIONS.map((g) => (
        <button
          key={g.num}
          type="button"
          role="tab"
          aria-selected={active === g.num}
          className={'crt-tab' + (active === g.num ? ' active' : '')}
          onClick={() => onChange(g.num)}
        >
          <span className="crt-tab-roman">{g.roman}</span>
          <span className="crt-tab-region">{g.region}</span>
        </button>
      ))}
    </div>
  );
}
