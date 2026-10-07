import type { AltForm, FormCategory } from '@/types';

const FORM_CATEGORIES: { key: FormCategory; label: string }[] = [
  { key: 'mega', label: 'MEGA / PRIMAL' },
  { key: 'gmax', label: 'GIGANTAMAX' },
  { key: 'regional', label: 'REGIONAL' },
  { key: 'other', label: 'BATTLE FORMS' },
];

interface Props {
  active: Set<FormCategory>;
  /** Every alternate form loaded so far — drives the per-category counts. */
  forms: AltForm[];
  loading: boolean;
  onToggle: (category: FormCategory) => void;
  onClear: () => void;
}

export default function FormFilter({ active, forms, loading, onToggle, onClear }: Props) {
  return (
    <div className="crt-extra-toggle">
      <div className="crt-extra-title">▶ INCLUDE ALT FORMS</div>
      <div className="crt-extra-chips">
        {FORM_CATEGORIES.map(({ key, label }) => {
          const on = active.has(key);
          const count = forms.filter((f) => f.formCategory === key).length;
          return (
            <button
              key={key}
              type="button"
              className={'crt-extra-chip' + (on ? ' active' : '')}
              aria-pressed={on}
              onClick={() => onToggle(key)}
            >
              {label}
              {count > 0 && <span className="crt-extra-chip-count"> · {count}</span>}
            </button>
          );
        })}
        {active.size > 0 && (
          <button
            type="button"
            className="crt-extra-chip clear"
            onClick={onClear}
            title="Clear all"
          >
            [ clear ]
          </button>
        )}
      </div>
      {loading && (
        <span className="crt-extra-status" role="status">
          ▶ FETCHING FORMS
          <span className="crt-cursor" aria-hidden="true">
            &nbsp;
          </span>
        </span>
      )}
    </div>
  );
}
