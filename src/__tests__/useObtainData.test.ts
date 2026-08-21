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
    const { result } = renderHook(() => useObtainData(25, false));
    expect(result.current.status).toBe('idle');
    expect(spy).not.toHaveBeenCalled();
  });

  it('reports loading on the very render that enables it', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    const { result } = renderHook(() => useObtainData(4242, true));
    // The fetch effect has not run yet — this must not read as an error state.
    expect(result.current.status).toBe('loading');
  });

  it('fetches once enabled and caches per id', async () => {
    const spy = vi.fn().mockResolvedValue(okResponse(FILE));
    vi.stubGlobal('fetch', spy);
    const { result } = renderHook(() => useObtainData(25, true));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.status === 'ready' && result.current.file.name).toBe('pikachu');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toContain('obtain/25.json');

    const again = renderHook(() => useObtainData(25, true));
    await waitFor(() => expect(again.result.current.status).toBe('ready'));
    expect(spy).toHaveBeenCalledTimes(1); // served from module cache
  });

  it('serves a cached file even while disabled', () => {
    vi.stubGlobal('fetch', vi.fn());
    // Id 25 was cached by the previous test.
    const { result } = renderHook(() => useObtainData(25, false));
    expect(result.current.status).toBe('ready');
  });

  it('reports an error on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    const { result } = renderHook(() => useObtainData(31337, true));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.status === 'error' && result.current.message).toContain('404');
  });

  it('never surfaces one id error under another id', async () => {
    const spy = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValue(okResponse({ ...FILE, pokemonId: 77, name: 'seaking' }));
    vi.stubGlobal('fetch', spy);
    const { result, rerender } = renderHook(({ id }) => useObtainData(id, true), {
      initialProps: { id: 6001 },
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
    rerender({ id: 6002 });
    expect(result.current.status).not.toBe('error');
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});
