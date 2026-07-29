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
  const [state, setState] = useState<CompetitiveState>({
    build: null,
    loading: !!name,
    error: null,
  });

  useEffect(() => {
    if (!name) {
      setState({ build: null, loading: false, error: null });
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    (gen === null ? findBestBuild(name) : findBuildForGen(name, gen))
      .then((build) => {
        if (active) setState({ build, loading: false, error: null });
      })
      .catch((e: Error) => {
        if (active) setState({ build: null, loading: false, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [name, gen]);

  return state;
}
