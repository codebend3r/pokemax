import { useEffect, useState } from 'react';
import { fetchGen8List } from '../api';

let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

export interface Gen8ListState {
  names: string[];
  loading: boolean;
  error: string | null;
}

export function useGen8List(): Gen8ListState {
  const [names, setNames] = useState<string[]>(cached ?? []);
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
          setNames(list);
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

  return { names, loading, error };
}
