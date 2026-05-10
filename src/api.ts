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

export async function fetchGenerationList(gen: number): Promise<Gen8Species[]> {
  const data = await getJson<Gen8ListResponse>(`${BASE}/generation/${gen}`);
  return data.pokemon_species
    .map((s) => ({ name: s.name, id: speciesIdFromUrl(s.url), gen }))
    .sort((a, b) => a.id - b.id);
}

// Backwards-compat alias
export const fetchGen8List = () => fetchGenerationList(8);

export function fetchPokemon(idOrName: string | number): Promise<PokemonResponse> {
  return getJson<PokemonResponse>(`${BASE}/pokemon/${idOrName}`);
}

export function fetchSpecies(name: string): Promise<SpeciesResponse> {
  return getJson<SpeciesResponse>(`${BASE}/pokemon-species/${name}`);
}

export function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse> {
  return getJson<EvolutionChainResponse>(url);
}
