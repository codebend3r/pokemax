import { useEffect, useState } from 'react';
import { isObtainFile, type ObtainFile } from '@/obtain/types';

const cache = new Map<number, ObtainFile>();
const inflight = new Map<number, Promise<ObtainFile>>();

interface ObtainState {
  data: ObtainFile | null;
  loading: boolean;
  error: string | null;
}

export function useObtainData(pokemonId: number, enabled: boolean): ObtainState {
  const [state, setState] = useState<ObtainState>(() => ({
    data: cache.get(pokemonId) ?? null,
    loading: false,
    error: null,
  }));

  useEffect(() => {
    if (!enabled) return;
    const cached = cache.get(pokemonId);
    if (cached) {
      setState({ data: cached, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ data: null, loading: true, error: null });

    let p = inflight.get(pokemonId);
    if (!p) {
      p = fetch(`${import.meta.env.BASE_URL}obtain/${pokemonId}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`No obtain data (${r.status})`);
          return r.json();
        })
        .then((json: unknown) => {
          if (!isObtainFile(json)) throw new Error('Malformed obtain data');
          cache.set(pokemonId, json);
          inflight.delete(pokemonId);
          return json;
        });
      inflight.set(pokemonId, p);
    }

    p.then((data) => {
      if (active) setState({ data, loading: false, error: null });
    }).catch((e: Error) => {
      inflight.delete(pokemonId);
      if (active) setState({ data: null, loading: false, error: e.message });
    });

    return () => {
      active = false;
    };
  }, [pokemonId, enabled]);

  return state;
}
