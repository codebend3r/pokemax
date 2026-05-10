import { describe, expect, it } from 'vitest';
import { groupMoves } from '../moves';
import type { PokemonResponse } from '../types';

const moves: PokemonResponse['moves'] = [
  {
    move: { name: 'pyro-ball' },
    version_group_details: [
      { level_learned_at: 1, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } },
    ],
  },
  {
    move: { name: 'tackle' },
    version_group_details: [
      { level_learned_at: 1, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } },
    ],
  },
  {
    move: { name: 'flame-charge' },
    version_group_details: [
      { level_learned_at: 0, move_learn_method: { name: 'machine' }, version_group: { name: 'sword-shield' } },
    ],
  },
  {
    move: { name: 'old-move' },
    version_group_details: [
      { level_learned_at: 5, move_learn_method: { name: 'level-up' }, version_group: { name: 'red-blue' } },
    ],
  },
];

describe('groupMoves', () => {
  it('only includes sword-shield moves', () => {
    const groups = groupMoves(moves);
    const all = Object.values(groups).flat().map((m) => m.name);
    expect(all).not.toContain('old-move');
  });

  it('groups by learn method', () => {
    const groups = groupMoves(moves);
    expect(groups['level-up'].map((m) => m.name).sort()).toEqual(['pyro-ball', 'tackle']);
    expect(groups['machine'].map((m) => m.name)).toEqual(['flame-charge']);
  });

  it('sorts level-up by level then name; others alphabetical', () => {
    const sample: PokemonResponse['moves'] = [
      { move: { name: 'b' }, version_group_details: [{ level_learned_at: 10, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } }] },
      { move: { name: 'a' }, version_group_details: [{ level_learned_at: 5, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } }] },
      { move: { name: 'z' }, version_group_details: [{ level_learned_at: 0, move_learn_method: { name: 'egg' }, version_group: { name: 'sword-shield' } }] },
      { move: { name: 'm' }, version_group_details: [{ level_learned_at: 0, move_learn_method: { name: 'egg' }, version_group: { name: 'sword-shield' } }] },
    ];
    const groups = groupMoves(sample);
    expect(groups['level-up'].map((m) => m.name)).toEqual(['a', 'b']);
    expect(groups['egg'].map((m) => m.name)).toEqual(['m', 'z']);
  });
});
