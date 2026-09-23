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
  const [state, setState] = useState<{ data: T | null; error: string | null }>(() => ({
    data: key && cache.has(key) ? (cache.get(key) as T) : null,
    error: null,
  }));

  // A key change means the previous fetch's result no longer applies to what
  // we're about to render — clear it synchronously so stale data can't flash.
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setState({ data: key && cache.has(key) ? (cache.get(key) as T) : null, error: null });
  }

  useEffect(() => {
    if (!enabled || !name) return;
    if (cache.has(key)) return;
    let active = true;

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
      if (active) setState({ data: data as T, error: null });
    }).catch((e: Error) => {
      if (active) setState({ data: null, error: e.message });
    });

    return () => {
      active = false;
    };
  }, [endpoint, name, enabled, key]);

  if (enabled && key && cache.has(key)) {
    return { data: cache.get(key) as T, loading: false, error: null };
  }
  return {
    data: state.data,
    loading: Boolean(enabled && name && !cache.has(key)),
    error: state.error,
  };
}
