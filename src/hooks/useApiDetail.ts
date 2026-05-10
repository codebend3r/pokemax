import { useEffect, useState } from 'react';

const BASE = 'https://pokeapi.co/api/v2';
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export interface DetailState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiDetail<T>(
  endpoint: string,
  name: string | null,
  enabled: boolean,
): DetailState<T> {
  const key = name ? `${endpoint}/${name}` : '';
  const [state, setState] = useState<DetailState<T>>(() => ({
    data: key && cache.has(key) ? (cache.get(key) as T) : null,
    loading: false,
    error: null,
  }));

  useEffect(() => {
    if (!enabled || !name) return;
    if (cache.has(key)) {
      setState({ data: cache.get(key) as T, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ data: null, loading: true, error: null });

    let p = inflight.get(key);
    if (!p) {
      p = fetch(`${BASE}/${endpoint}/${name}`)
        .then((r) => {
          if (!r.ok) throw new Error(`Lookup failed (${r.status})`);
          return r.json();
        })
        .then((data) => {
          cache.set(key, data);
          inflight.delete(key);
          return data;
        });
      inflight.set(key, p);
    }

    p.then((data) => {
      if (active) setState({ data: data as T, loading: false, error: null });
    }).catch((e: Error) => {
      if (active) setState({ data: null, loading: false, error: e.message });
    });

    return () => {
      active = false;
    };
  }, [endpoint, name, enabled, key]);

  return state;
}
