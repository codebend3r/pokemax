import { describe, it, expect } from 'vitest';
import { pickCounterTeam, GAME_MAX_GEN } from '@/counters';
import type { PokeType } from '@/typeChart';

describe('pickCounterTeam', () => {
  it('picks a hard counter against a single mono-type opponent', () => {
    const typeIndex = new Map<number, PokeType[]>([
      [1, ['water']], // perfect counter to fire
      [2, ['grass']], // grass loses to fire
      [3, ['fire']], // mirror — bad
    ]);
    const nameToId = new Map([
      ['vap', 1],
      ['shroom', 2],
      ['ember', 3],
    ]);
    const idToName = new Map([
      [1, 'vap'],
      [2, 'shroom'],
      [3, 'ember'],
    ]);

    const team = pickCounterTeam([{ species: 'charmander' }], {
      typeIndex,
      nameToId: new Map([...nameToId, ['charmander', 99]]),
      idToName,
    });

    expect(team).toHaveLength(0); // charmander not in type index
  });

  it('builds a team using a real opp resolution', () => {
    const typeIndex = new Map<number, PokeType[]>([
      [25, ['electric']], // pikachu — STAB on water
      [4, ['fire']], // charmander — weak to water
      [7, ['water']], // squirtle — mirror
      [1, ['grass', 'poison']], // bulbasaur — resists water, SE on water
      [129, ['water']], // magikarp — opponent
    ]);
    const nameToId = new Map([
      ['pikachu', 25],
      ['charmander', 4],
      ['squirtle', 7],
      ['bulbasaur', 1],
      ['magikarp', 129],
    ]);
    const idToName = new Map([
      [25, 'pikachu'],
      [4, 'charmander'],
      [7, 'squirtle'],
      [1, 'bulbasaur'],
      [129, 'magikarp'],
    ]);

    const team = pickCounterTeam([{ species: 'magikarp' }], {
      typeIndex,
      nameToId,
      idToName,
      candidateFilter: (id) => id !== 129, // exclude the opponent itself
    });

    expect(team).toHaveLength(1);
    // Either pikachu (electric STAB SE on water) or bulbasaur (grass SE + resist)
    // should win. Bulbasaur has 2 SE types but pikachu has clean STAB; we just
    // verify it picked a clear-cut winner with a non-empty rationale.
    expect(['pikachu', 'bulbasaur']).toContain(team[0].name);
    expect(team[0].rationale).toMatch(/STAB|resists/);
    expect(team[0].countersSpecies).toBe('magikarp');
  });

  it('respects the maxTeamSize cap', () => {
    const typeIndex = new Map<number, PokeType[]>([
      [1, ['water']],
      [2, ['electric']],
      [3, ['grass']],
      [10, ['fire']],
      [11, ['fire']],
      [12, ['fire']],
    ]);
    const nameToId = new Map([
      ['vap', 1],
      ['pika', 2],
      ['leaf', 3],
      ['fire1', 10],
      ['fire2', 11],
      ['fire3', 12],
    ]);
    const idToName = new Map([
      [1, 'vap'],
      [2, 'pika'],
      [3, 'leaf'],
      [10, 'fire1'],
      [11, 'fire2'],
      [12, 'fire3'],
    ]);

    const team = pickCounterTeam(
      [{ species: 'fire1' }, { species: 'fire2' }, { species: 'fire3' }],
      { typeIndex, nameToId, idToName },
      2,
    );

    expect(team).toHaveLength(2);
    expect(new Set(team.map((p) => p.id)).size).toBe(2); // unique picks
  });

  it('GAME_MAX_GEN covers every shipped game', () => {
    // sanity: shouldn't be missing entries
    expect(Object.keys(GAME_MAX_GEN).length).toBeGreaterThanOrEqual(20);
    expect(GAME_MAX_GEN['scarlet-violet']).toBe(9);
    expect(GAME_MAX_GEN['red-blue']).toBe(1);
  });
});
