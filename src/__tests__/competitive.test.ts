import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { findBuildForGen, pickBuild } from '@/competitive';
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

describe('findBuildForGen', () => {
  it('rejects on a failed fetch instead of reporting "no set"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    await expect(findBuildForGen('charizard', 2)).rejects.toThrow();
  });
});

describe('useCompetitiveSet', () => {
  it('settles to "no set" rather than loading forever', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(DATA), { status: 200 })),
    );
    const { result } = renderHook(() => useCompetitiveSet('magikarp', 4));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.build).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
