import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useObtainData } from '@/hooks/useObtainData';

const FILE = { pokemonId: 25, name: 'pikachu', breeding: null, games: [] };

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('useObtainData', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not fetch until enabled', () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    renderHook(() => useObtainData(25, false));
    expect(spy).not.toHaveBeenCalled();
  });

  it('fetches once enabled and caches per id', async () => {
    const spy = vi.fn().mockResolvedValue(okResponse(FILE));
    vi.stubGlobal('fetch', spy);
    const { result } = renderHook(() => useObtainData(25, true));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.name).toBe('pikachu');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toContain('obtain/25.json');

    const again = renderHook(() => useObtainData(25, true));
    await waitFor(() => expect(again.result.current.data).not.toBeNull());
    expect(spy).toHaveBeenCalledTimes(1); // served from module cache
  });

  it('reports an error on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    const { result } = renderHook(() => useObtainData(31337, true));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toBeNull();
  });
});
