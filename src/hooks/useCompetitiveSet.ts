import { useEffect, useState } from 'react';
import { findBestBuild, type ResolvedBuild } from '@/competitive';

export interface CompetitiveState {
  build: ResolvedBuild | null;
  loading: boolean;
  error: string | null;
}

export function useCompetitiveSet(name: string | null, _homeGen: number): CompetitiveState {
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
    // Always walk Smogon gens from latest → oldest. Older gens for old Pokémon
    // (e.g. Gen 1 Mewtwo) lack abilities/items/natures/EVs because those mechanics
    // didn't exist yet. The latest gen with the Pokémon listed gives the modern
    // competitive build the user expects.
    findBestBuild(name)
      .then((build) => {
        if (active) setState({ build, loading: false, error: null });
      })
      .catch((e: Error) => {
        if (active) setState({ build: null, loading: false, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [name]);

  return state;
}
