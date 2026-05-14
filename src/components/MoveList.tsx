import { groupMoves } from '@/moves';
import type { PokemonResponse } from '@/types';
import Detail from '@/components/Detail';

const ORDER: Array<{ key: string; label: string; openByDefault?: boolean }> = [
  { key: 'level-up', label: 'LEVEL-UP', openByDefault: true },
  { key: 'machine', label: 'TM / TR / HM' },
  { key: 'egg', label: 'EGG' },
  { key: 'tutor', label: 'TUTOR' },
];

interface Props {
  moves: PokemonResponse['moves'];
  versionGroup: string;
}

function pretty(name: string) {
  return name.replace(/-/g, ' ');
}

export default function MoveList({ moves, versionGroup }: Props) {
  const groups = groupMoves(moves, versionGroup);
  const totalCount = Object.values(groups).reduce((n, g) => n + g.length, 0);

  if (totalCount === 0) {
    return <div style={{ color: 'var(--dim)' }}>· no moves recorded for this game</div>;
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
              {list.map((m) => {
                const prefix =
                  key === 'level-up' && m.level > 0
                    ? `Lv ${String(m.level).padStart(2, '0')} · `
                    : '· ';
                return (
                  <li key={m.name}>
                    {prefix}
                    <Detail kind="move" name={m.name} label={pretty(m.name)} />
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
