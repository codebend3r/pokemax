import type { PokemonResponse } from '@/types';
import Detail from '@/components/Detail';

interface Props {
  abilities: PokemonResponse['abilities'];
}

function pretty(name: string) {
  return name.replace(/-/g, ' ').toUpperCase();
}

export default function AbilityList({ abilities }: Props) {
  const sorted = [...abilities].sort((a, b) => a.slot - b.slot);
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {sorted.map((a) => (
        <li key={a.ability.name}>
          · <Detail kind="ability" name={a.ability.name} label={pretty(a.ability.name)} />
          {a.is_hidden && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>(HIDDEN)</span>}
        </li>
      ))}
    </ul>
  );
}
