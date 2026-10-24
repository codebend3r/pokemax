import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { formatEVs, isSmogonData, pickBuild, smogonSets } from '@/competitive';
import { useCompetitiveSet } from '@/hooks/useCompetitiveSet';

const DATA = {
  Charizard: { ou: { 'Dragon Dance': { moves: ['Dragon Dance', 'Flare Blitz'] } } },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('pickBuild', () => {
  it('stamps the gen the set came from', () => {
    expect(pickBuild(DATA, 'charizard', 6)?.sourceGen).toBe(6);
  });

  it('resolves null when Smogon has no set', () => {
    expect(pickBuild(DATA, 'magikarp', 6)).toBeNull();
  });
});

describe('pickBuild with empty tiers', () => {
  it('skips an empty priority tier for the next populated one', () => {
    const data = {
      Garchomp: { ou: {}, uu: { Scarf: { moves: ['Earthquake'] } } },
    };
    const build = pickBuild(data, 'garchomp', 9);
    expect(build?.tier).toBe('uu');
    expect(build?.buildName).toBe('Scarf');
    expect(build?.set.moves).toEqual(['Earthquake']);
  });

  it('skips an empty non-priority tier for a populated one', () => {
    const data = { Garchomp: { custom: {}, other: { Odd: { moves: ['Outrage'] } } } };
    expect(pickBuild(data, 'garchomp', 9)?.tier).toBe('other');
  });

  it('returns null when every tier is empty instead of an undefined set', () => {
    expect(pickBuild({ Garchomp: { ou: {}, uu: {} } }, 'garchomp', 9)).toBeNull();
    expect(pickBuild({ Garchomp: {} }, 'garchomp', 9)).toBeNull();
  });

  it('falls through to the base-species key when the form key has no usable set', () => {
    const data = {
      'Charizard-Mega-X': { ou: {} },
      Charizard: { ou: { Bulky: { moves: ['Roost'] } } },
    };
    expect(pickBuild(data, 'charizard-mega-x', 6)?.pokemonKey).toBe('Charizard');
  });
});

describe('isSmogonData', () => {
  const data = (set: unknown) => ({ Garchomp: { ou: { Scarf: set } } });

  it('accepts alternatives in moves and spreads', () => {
    expect(
      isSmogonData(
        data({
          moves: ['Earthquake', ['Outrage', 'Dragon Claw']],
          ability: ['Rough Skin', 'Sand Veil'],
          nature: 'Jolly',
          evs: [{ atk: 252, spe: 252 }, { hp: 252 }],
          ivs: { atk: 0 },
          teratypes: ['Steel'],
        }),
      ),
    ).toBe(true);
  });

  it('accepts a set that leaves every optional field out', () => {
    expect(isSmogonData(data({ moves: ['Earthquake'] }))).toBe(true);
  });

  it('rejects a move slot that is missing, numeric, or a mixed list', () => {
    expect(isSmogonData(data({ moves: [undefined] }))).toBe(false);
    expect(isSmogonData(data({ moves: [7] }))).toBe(false);
    expect(isSmogonData(data({ moves: ['Earthquake', ['Outrage', 7]] }))).toBe(false);
    expect(isSmogonData(data({ moves: 'Earthquake' }))).toBe(false);
    expect(isSmogonData(data({}))).toBe(false);
  });

  it('rejects malformed optional string fields', () => {
    expect(isSmogonData(data({ moves: [], ability: 7 }))).toBe(false);
    expect(isSmogonData(data({ moves: [], item: [1] }))).toBe(false);
    expect(isSmogonData(data({ moves: [], nature: null }))).toBe(false);
    expect(isSmogonData(data({ moves: [], teratypes: {} }))).toBe(false);
  });

  it('rejects spreads that are not stat-to-number records', () => {
    expect(isSmogonData(data({ moves: [], evs: { atk: '252' } }))).toBe(false);
    expect(isSmogonData(data({ moves: [], evs: { luck: 252 } }))).toBe(false);
    expect(isSmogonData(data({ moves: [], evs: [{ atk: 252 }, 'x'] }))).toBe(false);
    expect(isSmogonData(data({ moves: [], evs: [{ atk: 252 }, { spe: null }] }))).toBe(false);
    expect(isSmogonData(data({ moves: [], ivs: 0 }))).toBe(false);
  });
});

describe('smogonSets', () => {
  it('rejects on a failed fetch instead of reporting "no set"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(smogonSets.get(2)).rejects.toThrow();
  });
});

describe('useCompetitiveSet', () => {
  it('settles to "no set" rather than loading forever', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(DATA), { status: 200 })),
    );
    const { result } = renderHook(() => useCompetitiveSet('magikarp', 4));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.status === 'ready' && result.current.data).toBeNull();
  });
});

describe('formatEVs', () => {
  it('formats a single spread', () => {
    expect(formatEVs({ atk: 252, spd: 4, spe: 252 })).toBe('252 Atk / 4 SpD / 252 Spe');
  });

  it('lists every alternative when a set offers several spreads', () => {
    expect(
      formatEVs([
        { hp: 252, def: 252 },
        { atk: 252, spe: 252 },
      ]),
    ).toBe('252 HP / 252 Def or 252 Atk / 252 Spe');
  });
});

describe('smogonSets validation', () => {
  it('rejects data whose spreads are malformed', async () => {
    const bad = { Garchomp: { ou: { Scarf: { moves: ['Earthquake'], evs: { atk: 'max' } } } } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(bad))));
    await expect(smogonSets.get(7)).rejects.toThrow('Malformed');
  });
});
