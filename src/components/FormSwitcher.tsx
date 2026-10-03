import { formLabel } from '@/forms';

interface Props {
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
  speciesName: string;
  active: string;
  onChange: (name: string) => void;
}

function labelForVariety(varietyName: string, speciesName: string): string {
  if (varietyName === speciesName) return 'BASE';
  const suffix = varietyName.startsWith(speciesName + '-')
    ? varietyName.slice(speciesName.length + 1)
    : varietyName;
  return formLabel(suffix).toUpperCase();
}

export default function FormSwitcher({ varieties, speciesName, active, onChange }: Props) {
  if (!varieties || varieties.length <= 1) return null;
  return (
    <div className="crt-forms">
      <div className="crt-forms-label">▶ FORMS</div>
      <div className="crt-forms-row">
        {varieties.map((v) => {
          const label = labelForVariety(v.pokemon.name, speciesName);
          const isActive = v.pokemon.name === active;
          return (
            <button
              key={v.pokemon.name}
              type="button"
              className={'crt-form-chip' + (isActive ? ' active' : '')}
              onClick={() => onChange(v.pokemon.name)}
              aria-pressed={isActive}
              title={v.pokemon.name}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
