import { groupMoves } from '../moves';
import type { PokemonResponse } from '../types';

const ORDER: Array<{ key: string; label: string; openByDefault?: boolean }> = [
  { key: 'level-up', label: 'LEVEL-UP', openByDefault: true },
  { key: 'machine', label: 'TM / TR' },
  { key: 'egg', label: 'EGG' },
  { key: 'tutor', label: 'TUTOR' },
];

interface Props {
  moves: PokemonResponse['moves'];
}

function pretty(name: string) {
  return name.replace(/-/g, ' ');
}

export default function MoveList({ moves }: Props) {
  const groups = groupMoves(moves);
  const totalCount = Object.values(groups).reduce((n, g) => n + g.length, 0);

  if (totalCount === 0) {
    return <div style={{ color: 'var(--dim)' }}>· no moves recorded</div>;
  }

  return (
    <div className="crt-moves">
      {ORDER.map(({ key, label, openByDefault }) => {
        const list = groups[key];
        if (!list || list.length === 0) return null;
        return (
          <details key={key} open={openByDefault}>
            <summary>
              {label} ({list.length})
            </summary>
            <ul>
              {list.map((m) => (
                <li key={m.name}>
                  {key === 'level-up' && m.level > 0 ? `Lv ${String(m.level).padStart(2, '0')} · ` : '· '}
                  {pretty(m.name)}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
