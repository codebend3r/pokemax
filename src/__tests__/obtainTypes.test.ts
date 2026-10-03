import { describe, expect, it } from 'vitest';
import { isObtainFile } from '@/obtain/types';

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

  it('rejects a file whose game is not a known version group', () => {
    const game = { gen: 7, versionGroup: 'lets-go', versions: ['lets-go-pikachu'], entries: [] };
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
