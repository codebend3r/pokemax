import { useMemo } from 'react';
import { pendingOf, useAsync, type AsyncState } from '@/async';
import { pokemonData, speciesDetails } from '@/dex';
import type {
  EvolutionChainResponse,
  Gen8Species,
  PokemonResponse,
  SpeciesResponse,
} from '@/types';

export interface PokemonBundle {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
}

/** `not-found`: the index has loaded and holds no such name — nothing to fetch. */
export type PokemonLookup = AsyncState<PokemonBundle> | { status: 'not-found' };

export function usePokemon(name: string | null, index: Gen8Species[]): PokemonLookup {
  const entry = name ? index.find((s) => s.name === name) : undefined;
  const notFound = name !== null && index.length > 0 && !entry;
  const enabled = name !== null && !notFound;

  const pokemon = useAsync(pokemonData, enabled, entry?.id ?? name ?? '');
  // Form entries carry their parent species name — /pokemon-species/charizard-mega-x doesn't exist.
  const details = useAsync(speciesDetails, enabled, entry?.speciesName ?? name ?? '');

  const p = pokemon.status === 'ready' ? pokemon.data : null;
  const d = details.status === 'ready' ? details.data : null;
  const bundle = useMemo(() => (p && d ? { pokemon: p, ...d } : null), [p, d]);

  if (notFound) return { status: 'not-found' };
  if (bundle) return { status: 'ready', data: bundle };
  return pendingOf(pokemon, details);
}
