import { useEffect, useState } from 'react';
import { TYPES, type PokeType } from '@/typeChart';

const BASE = 'https://pokeapi.co/api/v2';

let cache: Map<number, PokeType[]> | null = null;
let inflight: Promise<Map<number, PokeType[]>> | null = null;

interface TypeResponse {
  pokemon: { slot: number; pokemon: { name: string; url: string } }[];
}

async function fetchTypeIndex(): Promise<Map<number, PokeType[]>> {
  const responses = await Promise.all(
    TYPES.map(async (t) => {
      const r = await fetch(`${BASE}/type/${t}`);
      if (!r.ok) throw new Error(`type/${t} failed`);
      const j = (await r.json()) as TypeResponse;
      return { type: t, body: j };
    }),
  );
  const map = new Map<number, PokeType[]>();
  for (const { type, body } of responses) {
    for (const entry of body.pokemon) {
      const m = entry.pokemon.url.match(/\/pokemon\/(\d+)\/?$/);
      if (!m) continue;
      const id = parseInt(m[1], 10);
      const list = map.get(id) ?? [];
      list[entry.slot - 1] = type;
      map.set(id, list);
    }
  }
  for (const [k, v] of map) {
    map.set(k, v.filter((t): t is PokeType => Boolean(t)));
  }
  return map;
}

export interface TypeIndexState {
  index: Map<number, PokeType[]> | null;
  loading: boolean;
  error: string | null;
}

/**
 * Lazy: pass `enabled=false` (default) and the hook stays idle. Pass `enabled=true`
 * once the user interacts with anything that needs the index (e.g. clicks a type filter
 * chip) and the 18 type endpoints are fetched in parallel exactly once across the app.
 */
export function useTypeIndex(enabled = false): TypeIndexState {
  const [state, setState] = useState<TypeIndexState>({
    index: cache,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;
    if (cache) {
      setState({ index: cache, loading: false, error: null });
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    if (!inflight) inflight = fetchTypeIndex();
    inflight
      .then((m) => {
        cache = m;
        if (active) setState({ index: m, loading: false, error: null });
      })
      .catch((e: Error) => {
        if (active) setState({ index: null, loading: false, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return state;
}
