import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTcgCards } from '@/hooks/useTcgCards';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
}

describe('useTcgCards', () => {
  it('returns an empty, non-loading state when name is null', () => {
    const { result } = renderHook(() => useTcgCards(null));
    expect(result.current).toEqual({ cards: [], loading: false, error: null });
  });

  it('loads cards for a given name', async () => {
    const card = {
      id: 'xy1-1',
      name: 'Pikachu',
      number: '1',
      rarity: 'Common',
      images: { small: 'x', large: 'y' },
      set: { id: 'xy1', name: 'XY', releaseDate: '2014/02/05' },
    };
    fetchMock.mockReturnValue(ok({ data: [card] }));

    const { result } = renderHook(() => useTcgCards('pikachu-unique-1'));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cards).toEqual([card]);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a fetch error', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) }),
    );

    const { result } = renderHook(() => useTcgCards('pikachu-unique-2'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.cards).toEqual([]);
  });
});
