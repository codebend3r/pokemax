import type { PokeType } from '@/typeChart';
import {
  isAbilityResponse,
  isEvolutionChainResponse,
  isGenerationResponse,
  isItemResponse,
  isMoveResponse,
  isNatureResponse,
  isPokemonListResponse,
  isPokemonResponse,
  isSpeciesResponse,
  isTypeResponse,
  type AbilityResponse,
  type EvolutionChainResponse,
  type BaseSpecies,
  type ItemResponse,
  type MoveResponse,
  type NatureResponse,
  type PokemonResponse,
  type SpeciesResponse,
} from '@/types';

const BASE = 'https://pokeapi.co/api/v2';

/** Fetches JSON and checks it against `isT` — the one place PokeAPI data enters the app. */
async function getJson<T>(url: string, isT: (v: unknown) => v is T): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Lookup failed (${res.status})`);
  }
  const body: unknown = await res.json();
  if (!isT(body)) throw new Error(`Malformed response from ${url}`);
  return body;
}

/** Trailing numeric id of a resource URL (`…/pokemon/25/` → 25); 0 when there is none. */
export function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : 0;
}

export async function fetchGenerationList(gen: number): Promise<BaseSpecies[]> {
  const data = await getJson(`${BASE}/generation/${gen}`, isGenerationResponse);
  return data.pokemon_species
    .map((s): BaseSpecies => ({ kind: 'species', name: s.name, id: idFromUrl(s.url), gen }))
    .sort((a, b) => a.id - b.id);
}

/** Every Pokémon variety PokeAPI knows — base species and alternate forms alike. */
export async function fetchPokemonList(): Promise<{ name: string; id: number }[]> {
  const data = await getJson(`${BASE}/pokemon?limit=20000`, isPokemonListResponse);
  return data.results.map((r) => ({ name: r.name, id: idFromUrl(r.url) }));
}

/** The Pokémon of one type, each with the type slot (1 or 2) it fills. */
export async function fetchTypeMembers(type: PokeType): Promise<{ id: number; slot: number }[]> {
  const data = await getJson(`${BASE}/type/${type}`, isTypeResponse);
  return data.pokemon.map((p) => ({ id: idFromUrl(p.pokemon.url), slot: p.slot }));
}

export function fetchPokemon(idOrName: string | number): Promise<PokemonResponse> {
  return getJson(`${BASE}/pokemon/${idOrName}`, isPokemonResponse);
}

export function fetchSpecies(name: string): Promise<SpeciesResponse> {
  return getJson(`${BASE}/pokemon-species/${name}`, isSpeciesResponse);
}

export function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse> {
  return getJson(url, isEvolutionChainResponse);
}

export function fetchMove(name: string): Promise<MoveResponse> {
  return getJson(`${BASE}/move/${name}`, isMoveResponse);
}

export function fetchAbility(name: string): Promise<AbilityResponse> {
  return getJson(`${BASE}/ability/${name}`, isAbilityResponse);
}

export function fetchItem(name: string): Promise<ItemResponse> {
  return getJson(`${BASE}/item/${name}`, isItemResponse);
}

export function fetchNature(name: string): Promise<NatureResponse> {
  return getJson(`${BASE}/nature/${name}`, isNatureResponse);
}
