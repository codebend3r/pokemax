import { describe, expect, it } from 'vitest';
import { encountersToEntries, prettyLocation } from '@/obtain/pokeapi';

const AREAS = [
  {
    location_area: { name: 'kanto-route-2-south-towards-viridian-city' },
    version_details: [
      {
        version: { name: 'heartgold' },
        encounter_details: [
          {
            min_level: 3,
            max_level: 3,
            chance: 25,
            method: { name: 'walk' },
            condition_values: [{ name: 'time-morning' }],
          },
          {
            min_level: 5,
            max_level: 5,
            chance: 20,
            method: { name: 'walk' },
            condition_values: [{ name: 'time-morning' }],
          },
          {
            min_level: 4,
            max_level: 4,
            chance: 30,
            method: { name: 'walk' },
            condition_values: [{ name: 'time-night' }],
          },
        ],
      },
    ],
  },
  {
    location_area: { name: 'vermilion-city-area' },
    version_details: [
      {
        version: { name: 'heartgold' },
        encounter_details: [
          {
            min_level: 10,
            max_level: 20,
            chance: 40,
            method: { name: 'old-rod' },
            condition_values: [],
          },
        ],
      },
      {
        version: { name: 'yellow' },
        encounter_details: [
          {
            min_level: 5,
            max_level: 10,
            chance: 100,
            method: { name: 'gift' },
            condition_values: [],
          },
        ],
      },
    ],
  },
];

describe('encountersToEntries', () => {
  it('groups by version and merges same location+method+conditions slots', () => {
    const byVersion = encountersToEntries(AREAS);
    const hg = byVersion.get('heartgold');
    expect(hg).toBeDefined();
    if (!hg) return;
    const morning = hg.find((e) => e.conditions?.includes('time-morning'));
    expect(morning).toMatchObject({ method: 'grass', minLevel: 3, maxLevel: 5, chance: 45 });
    const night = hg.find((e) => e.conditions?.includes('time-night'));
    expect(night).toMatchObject({ minLevel: 4, maxLevel: 4, chance: 30 });
    const rod = hg.find((e) => e.method === 'fish');
    expect(rod).toMatchObject({ location: 'Vermilion City', conditions: ['old-rod'] });
  });

  it('maps gift method and keeps versions separate', () => {
    const byVersion = encountersToEntries(AREAS);
    expect(byVersion.get('yellow')?.[0]).toMatchObject({ method: 'gift', chance: 100 });
  });
});

describe('prettyLocation', () => {
  it('strips -area and title-cases', () => {
    expect(prettyLocation('vermilion-city-area')).toBe('Vermilion City');
    expect(prettyLocation('kanto-route-2-south-towards-viridian-city')).toBe(
      'Kanto Route 2 South Towards Viridian City',
    );
  });
});
