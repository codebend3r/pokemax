import { describe, expect, it } from 'vitest';
import { GENERATIONS } from '@/generations';
import {
  GROUP_GEN,
  isObtainFile,
  VERSION_GROUP_VERSIONS,
  VERSION_ORDER,
  VERSION_TO_GROUP,
} from '@/obtain/types';

describe('obtain version tables', () => {
  it('covers every version group in GENERATIONS', () => {
    for (const g of GENERATIONS) {
      for (const vg of g.versionGroups) {
        expect(VERSION_GROUP_VERSIONS[vg], vg).toBeDefined();
        expect(GROUP_GEN[vg], vg).toBe(g.num);
      }
    }
  });

  it('maps every version back to its group', () => {
    for (const [group, versions] of Object.entries(VERSION_GROUP_VERSIONS)) {
      for (const v of versions) expect(VERSION_TO_GROUP[v]).toBe(group);
    }
    expect(VERSION_ORDER[0]).toBe('red');
    expect(VERSION_ORDER[VERSION_ORDER.length - 1]).toBe('violet');
  });
});

describe('isObtainFile', () => {
  it('accepts a minimal valid file and rejects junk', () => {
    expect(isObtainFile({ pokemonId: 25, name: 'pikachu', breeding: null, games: [] })).toBe(true);
    expect(isObtainFile(null)).toBe(false);
    expect(isObtainFile({ pokemonId: 'x' })).toBe(false);
  });

  it('accepts a file whose games carry known methods', () => {
    const game = {
      gen: 1,
      versionGroup: 'red-blue',
      versions: ['red'],
      entries: [{ method: 'grass', location: 'Route 1' }],
    };
    expect(isObtainFile({ pokemonId: 25, name: 'pikachu', breeding: null, games: [game] })).toBe(
      true,
    );
  });

  it('rejects a file whose entries carry an unknown method', () => {
    const game = {
      gen: 1,
      versionGroup: 'red-blue',
      versions: ['red'],
      entries: [{ method: 'teleported-in', location: 'Route 1' }],
    };
    expect(isObtainFile({ pokemonId: 25, name: 'pikachu', breeding: null, games: [game] })).toBe(
      false,
    );
  });

  it('rejects a file whose games are missing required fields', () => {
    const game = { versionGroup: 'red-blue', entries: [] };
    expect(isObtainFile({ pokemonId: 25, name: 'pikachu', breeding: null, games: [game] })).toBe(
      false,
    );
  });
});
