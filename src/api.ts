import type {
  EvolutionChainResponse,
  Gen8ListResponse,
  Gen8Species,
  PokemonResponse,
  SpeciesResponse,
} from './types';

const BASE = 'https://pokeapi.co/api/v2';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`);
  }
  return (await res.json()) as T;
}

function speciesIdFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : 0;
}

export async function fetchGen8List(): Promise<Gen8Species[]> {
  const data = await getJson<Gen8ListResponse>(`${BASE}/generation/8`);
  return data.pokemon_species
    .map((s) => ({ name: s.name, id: speciesIdFromUrl(s.url) }))
    .sort((a, b) => a.id - b.id);
}

export function fetchPokemon(idOrName: string | number): Promise<PokemonResponse> {
  return getJson<PokemonResponse>(`${BASE}/pokemon/${idOrName}`);
}

export function fetchSpecies(name: string): Promise<SpeciesResponse> {
  return getJson<SpeciesResponse>(`${BASE}/pokemon-species/${name}`);
}

export function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse> {
  return getJson<EvolutionChainResponse>(url);
}
