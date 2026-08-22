import { describe, expect, it } from 'vitest';
import { GENERATIONS, REGIONS, REGION_OF_VERSION_GROUP } from '@/generations';
import { GAMES_BY_REGION, GAME_LABELS } from '@/trainers';

describe('REGIONS', () => {
  it('assigns every version group in GENERATIONS to exactly one region', () => {
    const assigned = REGIONS.flatMap((r) => r.versionGroups);
    expect(new Set(assigned).size).toBe(assigned.length);
    for (const g of GENERATIONS) {
      for (const vg of g.versionGroups) {
        expect(REGION_OF_VERSION_GROUP[vg], vg).toBeDefined();
      }
    }
  });

  it('lists no version group that GENERATIONS does not know about', () => {
    const known = new Set(GENERATIONS.flatMap((g) => g.versionGroups));
    for (const vg of REGIONS.flatMap((r) => r.versionGroups)) {
      expect(known.has(vg), vg).toBe(true);
    }
  });

  it('places Hisui directly after Sinnoh', () => {
    const names = REGIONS.map((r) => r.name);
    expect(names.indexOf('Hisui')).toBe(names.indexOf('Sinnoh') + 1);
    expect(REGIONS.find((r) => r.name === 'Hisui')?.note).toBe('Ancient Sinnoh');
  });
});

describe('GAMES_BY_REGION', () => {
  it('derives from REGIONS in the same order', () => {
    expect(GAMES_BY_REGION.map((r) => r.region)).toEqual(REGIONS.map((r) => r.name));
  });

  it('covers every GameId exactly once', () => {
    const games = GAMES_BY_REGION.flatMap((r) => r.games);
    expect(new Set(games).size).toBe(games.length);
    expect(games.sort()).toEqual(Object.keys(GAME_LABELS).sort());
  });
});
