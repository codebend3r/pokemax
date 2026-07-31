import { describe, expect, it } from 'vitest';
import { assembleObtainFile, type AssembleInput } from '@/obtain/assemble';
import type { ObtainEntry } from '@/obtain/types';

const WILD_R4: ObtainEntry = {
  method: 'grass',
  location: 'Route 4',
  minLevel: 3,
  maxLevel: 5,
  chance: 45,
};

function base(): AssembleInput {
  return {
    pokemonId: 999,
    name: 'testmon',
    isDefaultForm: true,
    debutGen: 1,
    apiEntries: new Map(),
    pdbEntries: new Map(),
    trades: [],
    breeding: { eggGroups: ['field'], hatchCycles: 10, steps: 2560, breedable: true },
    evolvesFrom: null,
  };
}

describe('assembleObtainFile', () => {
  it('prefers PokéAPI entries over PokemonDB for the same version', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.pdbEntries.set('red', [{ method: 'wild', location: 'Somewhere Vague' }]);
    const file = assembleObtainFile(input);
    const red = file.games.find((g) => g.versions.includes('red'));
    expect(red?.entries).toEqual([WILD_R4]);
  });

  it('folds versions with identical entries into one game row', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.apiEntries.set('blue', [WILD_R4]);
    const file = assembleObtainFile(input);
    const rb = file.games.find((g) => g.versionGroup === 'red-blue');
    expect(rb?.versions).toEqual(['red', 'blue']);
  });

  it('keeps differing versions of one group separate', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.apiEntries.set('blue', [{ ...WILD_R4, location: 'Route 5' }]);
    const file = assembleObtainFile(input);
    const rows = file.games.filter((g) => g.versionGroup === 'red-blue');
    expect(rows).toHaveLength(2);
  });

  it('appends NPC trades to direct entries', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.trades = [
      { versions: ['red', 'blue'], give: 'abra', receive: 'testmon', location: 'Cerulean City' },
    ];
    const file = assembleObtainFile(input);
    const red = file.games.find((g) => g.versions.includes('red'));
    expect(
      red?.entries.some((e) => e.method === 'trade' && e.detail === 'Trade a ABRA to an NPC'),
    ).toBe(true);
  });

  it('derives evolve, then egg, then transfer for empty versions', () => {
    const evolver = base();
    evolver.evolvesFrom = { name: 'premon', trigger: 'level 26' };
    const evFile = assembleObtainFile(evolver);
    const evRed = evFile.games.find((g) => g.versions.includes('red'));
    expect(evRed?.entries[0]).toEqual({ method: 'evolve', detail: 'Evolve premon (level 26)' });

    const breeder = base();
    const eggFile = assembleObtainFile(breeder);
    const eggRed = eggFile.games.find((g) => g.versions.includes('red'));
    expect(eggRed?.entries[0].method).toBe('egg');

    const loner = base();
    loner.breeding = { eggGroups: ['no-eggs'], hatchCycles: 120, steps: 30720, breedable: false };
    const trFile = assembleObtainFile(loner);
    const trRed = trFile.games.find((g) => g.versions.includes('red'));
    expect(trRed?.entries[0].method).toBe('transfer');
  });

  it('starts at the debut gen and never before', () => {
    const input = base();
    input.debutGen = 4;
    const file = assembleObtainFile(input);
    expect(file.games.every((g) => g.gen >= 4)).toBe(true);
    expect(file.games.some((g) => g.versionGroup === 'diamond-pearl')).toBe(true);
  });

  it('omits padding for non-default forms', () => {
    const input = base();
    input.isDefaultForm = false;
    input.debutGen = 1;
    input.apiEntries.set('sun', [
      { method: 'grass', location: 'Route 1', minLevel: 2, maxLevel: 4, chance: 30 },
    ]);
    const file = assembleObtainFile(input);
    expect(file.games).toHaveLength(1);
    expect(file.games[0].versions).toEqual(['sun']);
  });
});
