import { useMemo } from 'react';
import { dataOf, pendingOf, useAsync, type AsyncState } from '@/async';
import { pokemonData, speciesDetails, type DexRoute } from '@/dex';
import { varietyFromForm } from '@/routes';
import type { EvolutionChainResponse, PokemonResponse, SpeciesResponse } from '@/types';

export interface PokemonView {
  /** On screen: the variety the URL names once it loads, the default one until then. */
  pokemon: PokemonResponse;
  /** The species' default variety — forms often ship an empty learnset and borrow its moves. */
  base: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
}

export type PokemonViewState = AsyncState<PokemonView> | { status: 'not-found' };

const IDLE: AsyncState<never> = { status: 'idle' };

/**
 * Everything the Pokémon card shows for a resolved route, fetched in
 * parallel. Switching forms keeps the view ready — the default variety stands
 * in until the form's data lands — so the card never unmounts mid-switch. A
 * form the species doesn't have falls back to the default variety.
 */
export function usePokemonView(route: DexRoute): PokemonViewState {
  const found = route.status === 'found' ? route : null;
  const species = found?.species ?? '';
  const form = found?.form ?? 'base';
  const variety = varietyFromForm(species, form);

  const details = useAsync(speciesDetails, found !== null, species);
  // By dex number when known: a species name is not always a variety name
  // (`deoxys` vs `deoxys-normal`).
  const base = useAsync(pokemonData, found !== null, found?.baseId ?? species);
  const shown = useAsync(pokemonData, found !== null && form !== 'base', variety);

  const d = dataOf(details);
  const b = dataOf(base);
  const knownForm =
    form === 'base' || !d || d.species.varieties.some((v) => v.pokemon.name === variety);
  const v = knownForm ? dataOf(shown) : null;
  const view = useMemo(() => (d && b ? { ...d, base: b, pokemon: v ?? b } : null), [d, b, v]);

  if (route.status === 'none') return { status: 'idle' };
  if (route.status === 'not-found') return { status: 'not-found' };
  const pending = pendingOf(details, base, knownForm && form !== 'base' ? shown : IDLE);
  if (pending.status === 'error' || !view) return pending;
  return { status: 'ready', data: view };
}
