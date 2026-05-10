import { useEffect, useState } from 'react';
import { fetchGen8List } from '../api';
import type { Gen8Species } from '../types';

let cached: Gen8Species[] | null = null;
let inflight: Promise<Gen8Species[]> | null = null;

export interface Gen8ListState {
  species: Gen8Species[];
  names: string[];
  loading: boolean;
  error: string | null;
}

export function useGen8List(): Gen8ListState {
  const [species, setSpecies] = useState<Gen8Species[]>(cached ?? []);
  const [loading, setLoading] = useState<boolean>(cached === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) return;
    let active = true;
    if (!inflight) inflight = fetchGen8List();
    inflight
      .then((list) => {
        cached = list;
        if (active) {
          setSpecies(list);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { species, names: species.map((s) => s.name), loading, error };
}
