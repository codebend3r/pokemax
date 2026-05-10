import { useEffect, useState } from 'react';
import { fetchGenerationList } from '../api';
import type { Gen8Species } from '../types';

const cache = new Map<number, Gen8Species[]>();
const inflight = new Map<number, Promise<Gen8Species[]>>();

export interface GenerationListState {
  species: Gen8Species[];
  names: string[];
  loading: boolean;
  error: string | null;
}

export function useGenerationList(gen: number): GenerationListState {
  const [species, setSpecies] = useState<Gen8Species[]>(cache.get(gen) ?? []);
  const [loading, setLoading] = useState<boolean>(!cache.has(gen));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(gen)) {
      setSpecies(cache.get(gen)!);
      setLoading(false);
      setError(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    let p = inflight.get(gen);
    if (!p) {
      p = fetchGenerationList(gen).then((list) => {
        cache.set(gen, list);
        inflight.delete(gen);
        return list;
      });
      inflight.set(gen, p);
    }
    p.then((list) => {
      if (active) {
        setSpecies(list);
        setLoading(false);
      }
    }).catch((e: Error) => {
      if (active) {
        setError(e.message);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [gen]);

  return { species, names: species.map((s) => s.name), loading, error };
}
