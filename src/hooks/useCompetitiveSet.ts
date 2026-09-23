import { useEffect, useState } from 'react';
import { findBestBuild, findBuildForGen, type ResolvedBuild } from '@/competitive';

export interface CompetitiveState {
  build: ResolvedBuild | null;
  loading: boolean;
  error: string | null;
}

/**
 * `gen` pins the lookup to one Smogon gen (the game the user is playing);
 * `null` walks latest → oldest for the richest modern build. Older gens for
 * old Pokémon (e.g. Gen 1 Mewtwo) lack abilities/items/natures/EVs because
 * those mechanics didn't exist yet, so the walk is the better default.
 */
export function useCompetitiveSet(name: string | null, gen: number | null): CompetitiveState {
  const [state, setState] = useState<{ build: ResolvedBuild | null; error: string | null }>({
    build: null,
    error: null,
  });

  // A new name/gen invalidates whatever build we last resolved — clear it synchronously
  // so the previous Pokémon's set can't flash while the new one loads.
  const [prevKey, setPrevKey] = useState({ name, gen });
  if (prevKey.name !== name || prevKey.gen !== gen) {
    setPrevKey({ name, gen });
    setState({ build: null, error: null });
  }

  useEffect(() => {
    if (!name) return;
    let active = true;
    (gen === null ? findBestBuild(name) : findBuildForGen(name, gen))
      .then((build) => {
        if (active) setState({ build, error: null });
      })
      .catch((e: Error) => {
        if (active) setState({ build: null, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [name, gen]);

  if (!name) {
    return { build: null, loading: false, error: null };
  }
  return { build: state.build, loading: !state.build && !state.error, error: state.error };
}
