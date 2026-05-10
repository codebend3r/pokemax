import { useEffect, useState } from 'react';
import {
  fetchEvolutionChain,
  fetchPokemon,
  fetchSpecies,
} from '../api';
import type {
  EvolutionChainResponse,
  Gen8Species,
  PokemonResponse,
  SpeciesResponse,
} from '../types';

export type PokemonError =
  | { kind: 'not-in-gen-8' }
  | { kind: 'transmission' };

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
  const [state, setState] = useState<UsePokemonState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!name) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const entry = gen8Species.find((s) => s.name === name);
    if (gen8Species.length > 0 && !entry) {
      setState({ data: null, loading: false, error: { kind: 'not-in-gen-8' } });
      return;
    }

    let active = true;
    setState({ data: null, loading: true, error: null });

    (async () => {
      try {
        const [pokemon, species] = await Promise.all([
          // Fetch by species ID — always returns the default Pokémon form,
          // works for species like Toxtricity that don't have a /pokemon/{name} endpoint
          fetchPokemon(entry ? entry.id : name),
          fetchSpecies(name),
        ]);
        const chain = await fetchEvolutionChain(species.evolution_chain.url);
        if (active) {
          setState({ data: { pokemon, species, chain }, loading: false, error: null });
        }
      } catch {
        if (active) {
          setState({ data: null, loading: false, error: { kind: 'transmission' } });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [name, gen8Species, attempt]);

  return state;
}
