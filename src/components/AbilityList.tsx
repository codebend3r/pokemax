import type { PokemonResponse } from '../types';

interface Props {
  abilities: PokemonResponse['abilities'];
}

function pretty(name: string) {
  return name.replace(/-/g, ' ').toUpperCase();
}

export default function AbilityList({ abilities }: Props) {
  const sorted = [...abilities].sort((a, b) => a.slot - b.slot);
  return (
    <div className="crt-section">
      <div className="crt-section-label">▶ ABILITIES</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sorted.map((a) => (
          <li key={a.ability.name}>
            · {pretty(a.ability.name)}
            {a.is_hidden && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>(HIDDEN)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
