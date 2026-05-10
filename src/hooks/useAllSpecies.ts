import { useEffect, useState } from 'react';
import { fetchGenerationList } from '../api';
import { GENERATIONS } from '../generations';
import type { Gen8Species } from '../types';

let cache: Gen8Species[] | null = null;
let inflight: Promise<Gen8Species[]> | null = null;

async function fetchAll(): Promise<Gen8Species[]> {
  const lists = await Promise.all(GENERATIONS.map((g) => fetchGenerationList(g.num)));
  return lists.flat().sort((a, b) => a.id - b.id);
}

export interface AllSpeciesState {
  species: Gen8Species[];
  names: string[];
  loading: boolean;
  error: string | null;
}

export function useAllSpecies(): AllSpeciesState {
  const [state, setState] = useState<AllSpeciesState>({
    species: cache ?? [],
    names: cache ? cache.map((s) => s.name) : [],
    loading: cache === null,
    error: null,
  });

  useEffect(() => {
    if (cache) return;
    let active = true;
    if (!inflight) inflight = fetchAll();
    inflight
      .then((list) => {
        cache = list;
        if (active) {
          setState({
            species: list,
            names: list.map((s) => s.name),
            loading: false,
            error: null,
          });
        }
      })
      .catch((e: Error) => {
        if (active) {
          setState((s) => ({ ...s, loading: false, error: e.message }));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
