interface Props {
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
  speciesName: string;
  active: string;
  onChange: (name: string) => void;
}

const SUFFIX_LABEL: Record<string, string> = {
  alola: 'ALOLAN',
  galar: 'GALARIAN',
  hisui: 'HISUIAN',
  paldea: 'PALDEAN',
  'paldea-combat': 'PALDEAN COMBAT',
  'paldea-blaze': 'PALDEAN BLAZE',
  'paldea-aqua': 'PALDEAN AQUA',
  amped: 'AMPED',
  'low-key': 'LOW KEY',
  'single-strike': 'SINGLE STRIKE',
  'rapid-strike': 'RAPID STRIKE',
  male: 'MALE',
  female: 'FEMALE',
  hero: 'HERO',
  crowned: 'CROWNED',
  eternamax: 'ETERNAMAX',
  origin: 'ORIGIN',
  altered: 'ALTERED',
  sky: 'SKY',
  attack: 'ATTACK',
  defense: 'DEFENSE',
  speed: 'SPEED',
  plant: 'PLANT',
  sandy: 'SANDY',
  trash: 'TRASH',
  east: 'EAST',
  west: 'WEST',
  therian: 'THERIAN',
  incarnate: 'INCARNATE',
  black: 'BLACK',
  white: 'WHITE',
  resolute: 'RESOLUTE',
  pirouette: 'PIROUETTE',
  ash: 'ASH',
  zen: 'ZEN',
  'galar-zen': 'GALARIAN ZEN',
  busted: 'BUSTED',
  totem: 'TOTEM',
  small: 'SMALL',
  large: 'LARGE',
  super: 'SUPER',
  rock: 'ROCK STAR',
  belle: 'BELLE',
  'pop-star': 'POP STAR',
  phd: 'PH.D',
  libre: 'LIBRE',
  cosplay: 'COSPLAY',
};

function labelForVariety(varietyName: string, speciesName: string): string {
  if (varietyName === speciesName) return 'BASE';
  const suffix = varietyName.startsWith(speciesName + '-')
    ? varietyName.slice(speciesName.length + 1)
    : varietyName;
  return SUFFIX_LABEL[suffix] ?? suffix.replace(/-/g, ' ').toUpperCase();
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
