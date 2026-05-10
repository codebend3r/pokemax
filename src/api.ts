import type {
  EvolutionChainResponse,
  Gen8ListResponse,
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

export async function fetchGen8List(): Promise<string[]> {
  const data = await getJson<Gen8ListResponse>(`${BASE}/generation/8`);
  return data.pokemon_species.map((s) => s.name);
}

export function fetchPokemon(name: string): Promise<PokemonResponse> {
  return getJson<PokemonResponse>(`${BASE}/pokemon/${name}`);
}

export function fetchSpecies(name: string): Promise<SpeciesResponse> {
  return getJson<SpeciesResponse>(`${BASE}/pokemon-species/${name}`);
}

export function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse> {
  return getJson<EvolutionChainResponse>(url);
}
