import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGenerationList, fetchPokemon, fetchSpecies, fetchEvolutionChain } from '@/api';

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

describe('fetchGenerationList', () => {
  it('returns species with name and id, sorted by id', async () => {
    fetchMock.mockReturnValue(
      ok({
        pokemon_species: [
          { name: 'scorbunny', url: 'https://pokeapi.co/api/v2/pokemon-species/813/' },
          { name: 'grookey', url: 'https://pokeapi.co/api/v2/pokemon-species/810/' },
        ],
      }),
    );
    const list = await fetchGenerationList(8);
    expect(list).toEqual([
      { kind: 'species', name: 'grookey', id: 810, gen: 8 },
      { kind: 'species', name: 'scorbunny', id: 813, gen: 8 },
    ]);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/generation/8');
  });

  it('throws on non-2xx', async () => {
    fetchMock.mockReturnValue(notOk(500));
    await expect(fetchGenerationList(8)).rejects.toThrow();
  });
});

const SPRITES = { front_default: null, front_shiny: null };
const POKEMON = {
  id: 813,
  name: 'scorbunny',
  height: 3,
  weight: 45,
  sprites: { ...SPRITES, other: { 'official-artwork': SPRITES } },
  types: [{ slot: 1, type: { name: 'fire' } }],
  stats: [{ base_stat: 50, stat: { name: 'hp' } }],
  abilities: [{ ability: { name: 'blaze' }, is_hidden: false, slot: 1 }],
  moves: [],
};

describe('fetchPokemon', () => {
  it('hits /pokemon/{name} and returns parsed JSON', async () => {
    fetchMock.mockReturnValue(ok(POKEMON));
    const result = await fetchPokemon('scorbunny');
    expect(result).toEqual(POKEMON);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/scorbunny');
  });

  it('rejects a response missing the fields the card reads', async () => {
    fetchMock.mockReturnValue(ok({ id: 813, name: 'scorbunny' }));
    await expect(fetchPokemon('scorbunny')).rejects.toThrow(/Malformed/);
  });
});

describe('fetchSpecies', () => {
  it('hits /pokemon-species/{name}', async () => {
    fetchMock.mockReturnValue(
      ok({
        name: 'scorbunny',
        generation: { name: 'generation-viii', url: 'https://pokeapi.co/api/v2/generation/8/' },
        evolution_chain: { url: 'X' },
        varieties: [],
        flavor_text_entries: [],
        genera: [],
      }),
    );
    const result = await fetchSpecies('scorbunny');
    expect(result.evolution_chain.url).toBe('X');
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/scorbunny');
  });
});

describe('fetchEvolutionChain', () => {
  it('fetches the given URL', async () => {
    fetchMock.mockReturnValue(
      ok({ chain: { species: { name: 'scorbunny' }, evolution_details: [], evolves_to: [] } }),
    );
    const result = await fetchEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/123');
    expect(result.chain.species.name).toBe('scorbunny');
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/evolution-chain/123');
  });
});
