import { useEffect, useState } from 'react';
import { fetchSmogonData, pickBuild, type ResolvedBuild } from '../competitive';

export interface CompetitiveState {
  build: ResolvedBuild | null;
  loading: boolean;
  error: string | null;
}

export function useCompetitiveSet(name: string | null, gen: number): CompetitiveState {
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

    fetchSmogonData(gen)
      .then((data) => {
        if (!active) return;
        const build = pickBuild(data, name);
        setState({ build, loading: false, error: null });
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
