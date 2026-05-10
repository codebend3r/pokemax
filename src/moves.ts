import type { GroupedMove, PokemonResponse } from './types';

export function groupMoves(
  moves: PokemonResponse['moves'],
  versionGroup = 'sword-shield',
): Record<string, GroupedMove[]> {
  const groups: Record<string, GroupedMove[]> = {};

  for (const m of moves) {
    for (const d of m.version_group_details) {
      if (d.version_group.name !== versionGroup) continue;
      const method = d.move_learn_method.name;
      if (!groups[method]) groups[method] = [];
      groups[method].push({
        name: m.move.name,
        level: d.level_learned_at,
        method,
      });
    }
  }

  for (const method of Object.keys(groups)) {
    if (method === 'level-up') {
      groups[method].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    } else {
      groups[method].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return groups;
}
