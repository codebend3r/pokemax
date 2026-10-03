import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { formatEVs, pickBuild, smogonSets } from '@/competitive';
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
