import { useEffect, useState } from 'react';
import { fetchEvolutionChain, fetchPokemon, fetchSpecies } from '@/api';
import type {
  EvolutionChainResponse,
  Gen8Species,
  PokemonResponse,
  SpeciesResponse,
} from '@/types';

export type PokemonError = { kind: 'not-in-gen-8' } | { kind: 'transmission' };

export interface PokemonBundle {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
}

export interface UsePokemonState {
  data: PokemonBundle | null;
  loading: boolean;
  error: PokemonError | null;
}

export function usePokemon(
  name: string | null,
  gen8Species: Gen8Species[],
  attempt: number,
): UsePokemonState {
  const entry = name ? gen8Species.find((s) => s.name === name) : undefined;
  const notInGen8 = Boolean(name) && gen8Species.length > 0 && !entry;

  const [state, setState] = useState<{ data: PokemonBundle | null; error: PokemonError | null }>({
    data: null,
    error: null,
  });

  // A new name/attempt invalidates whatever we last fetched — clear it synchronously
  // so the previous Pokémon's data can't flash while the new one loads.
  const [prevKey, setPrevKey] = useState({ name, attempt });
  if (prevKey.name !== name || prevKey.attempt !== attempt) {
    setPrevKey({ name, attempt });
    setState({ data: null, error: null });
  }

  useEffect(() => {
    if (!name || notInGen8) return;
    let active = true;

    (async () => {
      try {
        // Form entries (e.g. charizard-mega-x) carry their parent species name; use it
        // for the species fetch since /pokemon-species/charizard-mega-x doesn't exist.
        const speciesNameForFetch = entry?.speciesName ?? name;
        const [pokemon, species] = await Promise.all([
          fetchPokemon(entry ? entry.id : name),
          fetchSpecies(speciesNameForFetch),
        ]);
        const chain = await fetchEvolutionChain(species.evolution_chain.url);
        if (active) {
          setState({ data: { pokemon, species, chain }, error: null });
        }
      } catch {
        if (active) {
          setState({ data: null, error: { kind: 'transmission' } });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [name, notInGen8, entry, attempt]);

  if (!name) {
    return { data: null, loading: false, error: null };
  }
  if (notInGen8) {
    return { data: null, loading: false, error: { kind: 'not-in-gen-8' } };
  }
  return { data: state.data, loading: !state.data && !state.error, error: state.error };
}
