import { describe, expect, it } from 'vitest';
import { isObtainBreeding, isObtainFile } from '@/obtain/types';

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

describe('isObtainFile optional fields', () => {
  const file = (game: object) => ({
    pokemonId: 25,
    name: 'pikachu',
    breeding: null,
    games: [{ gen: 1, versionGroup: 'red-blue', versions: ['red'], entries: [], ...game }],
  });
  const entry = (extra: object) => file({ entries: [{ method: 'grass', ...extra }] });

  it('accepts every optional entry field when well-formed', () => {
    expect(
      isObtainFile(
        entry({
          location: 'Route 1',
          minLevel: 2,
          maxLevel: 5,
          chance: 30,
          conditions: ['night'],
          detail: 'Trade a SPEAROW',
        }),
      ),
    ).toBe(true);
  });

  it('rejects malformed optional entry fields', () => {
    expect(isObtainFile(entry({ conditions: 42 }))).toBe(false);
    expect(isObtainFile(entry({ conditions: ['night', 7] }))).toBe(false);
    expect(isObtainFile(entry({ location: 7 }))).toBe(false);
    expect(isObtainFile(entry({ minLevel: '2' }))).toBe(false);
    expect(isObtainFile(entry({ maxLevel: '5' }))).toBe(false);
    expect(isObtainFile(entry({ chance: '30' }))).toBe(false);
    expect(isObtainFile(entry({ detail: 7 }))).toBe(false);
  });

  it('rejects non-string version names', () => {
    expect(isObtainFile(file({ versions: [1, 2] }))).toBe(false);
    expect(isObtainFile(file({ versions: 'red' }))).toBe(false);
  });
});

describe('isObtainBreeding', () => {
  const breeding = { eggGroups: ['field'], hatchCycles: 5, steps: 1280, breedable: true };

  it('accepts a well-formed breeding record', () => {
    expect(isObtainBreeding(breeding)).toBe(true);
  });

  it('rejects malformed breeding records', () => {
    expect(isObtainBreeding(42)).toBe(false);
    expect(isObtainBreeding({ ...breeding, eggGroups: 'field' })).toBe(false);
    expect(isObtainBreeding({ ...breeding, eggGroups: [1] })).toBe(false);
    expect(isObtainBreeding({ ...breeding, hatchCycles: '5' })).toBe(false);
    expect(isObtainBreeding({ ...breeding, steps: undefined })).toBe(false);
    expect(isObtainBreeding({ ...breeding, breedable: 1 })).toBe(false);
  });

  it('is enforced on the file: breeding must be null or a real record', () => {
    const base = { pokemonId: 25, name: 'pikachu', games: [] };
    expect(isObtainFile({ ...base, breeding })).toBe(true);
    expect(isObtainFile({ ...base, breeding: 42 })).toBe(false);
    expect(isObtainFile({ ...base, breeding: {} })).toBe(false);
    expect(isObtainFile(base)).toBe(false);
  });
});
