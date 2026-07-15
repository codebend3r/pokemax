import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTcgCards } from '@/tcgApi';

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
function notOk(status: number) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
}

describe('fetchTcgCards', () => {
  it('queries the pokemontcg.io cards endpoint by name and returns the card list', async () => {
    const card = {
      id: 'xy1-1',
      name: 'Pikachu',
      number: '1',
      rarity: 'Common',
      images: { small: 'https://images.pokemontcg.io/xy1/1.png', large: 'x' },
      set: { id: 'xy1', name: 'XY', releaseDate: '2014/02/05' },
      tcgplayer: { url: 'https://tcgplayer.com/x', prices: { holofoil: { market: 2.5 } } },
    };
    fetchMock.mockReturnValue(ok({ data: [card] }));

    const result = await fetchTcgCards('pikachu');

    expect(result).toEqual([card]);
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('https://api.pokemontcg.io/v2/cards?q=');
    expect(calledUrl).toContain(encodeURIComponent('pikachu'));
  });

  it('converts hyphenated form names to spaces in the query', async () => {
    fetchMock.mockReturnValue(ok({ data: [] }));
    await fetchTcgCards('mr-mime');
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain(encodeURIComponent('mr mime'));
  });

  it('throws on non-2xx', async () => {
    fetchMock.mockReturnValue(notOk(500));
    await expect(fetchTcgCards('pikachu')).rejects.toThrow();
  });
});
