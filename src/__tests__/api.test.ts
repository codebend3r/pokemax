import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGen8List,
  fetchPokemon,
  fetchSpecies,
  fetchEvolutionChain,
} from '../api';

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

describe('fetchGen8List', () => {
  it('returns species with name and id, sorted by id', async () => {
    fetchMock.mockReturnValue(
      ok({
        pokemon_species: [
          { name: 'scorbunny', url: 'https://pokeapi.co/api/v2/pokemon-species/813/' },
          { name: 'grookey', url: 'https://pokeapi.co/api/v2/pokemon-species/810/' },
        ],
      }),
    );
    const list = await fetchGen8List();
    expect(list).toEqual([
      { name: 'grookey', id: 810, gen: 8 },
      { name: 'scorbunny', id: 813, gen: 8 },
    ]);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/generation/8');
  });

  it('throws on non-2xx', async () => {
    fetchMock.mockReturnValue(notOk(500));
    await expect(fetchGen8List()).rejects.toThrow();
  });
});

describe('fetchPokemon', () => {
  it('hits /pokemon/{name} and returns parsed JSON', async () => {
    const body = { id: 813, name: 'scorbunny' };
    fetchMock.mockReturnValue(ok(body));
    const result = await fetchPokemon('scorbunny');
    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/scorbunny');
  });
});

describe('fetchSpecies', () => {
  it('hits /pokemon-species/{name}', async () => {
    fetchMock.mockReturnValue(ok({ name: 'scorbunny', evolution_chain: { url: 'X' } }));
    const result = await fetchSpecies('scorbunny');
    expect(result.evolution_chain.url).toBe('X');
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/scorbunny');
  });
});

describe('fetchEvolutionChain', () => {
  it('fetches the given URL', async () => {
    fetchMock.mockReturnValue(ok({ chain: { species: { name: 'scorbunny' }, evolution_details: [], evolves_to: [] } }));
    const result = await fetchEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/123');
    expect(result.chain.species.name).toBe('scorbunny');
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/evolution-chain/123');
  });
});
