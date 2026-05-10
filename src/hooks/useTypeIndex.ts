import { useEffect, useState } from 'react';
import { TYPES, type PokeType } from '../typeChart';

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
      // Sort by slot so the primary type comes first
      const list = map.get(id) ?? [];
      list[entry.slot - 1] = type;
      map.set(id, list);
    }
  }
  // Compact arrays (in case slot-2 only entries left holes)
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

export function useTypeIndex(): TypeIndexState {
  const [state, setState] = useState<TypeIndexState>({
    index: cache,
    loading: cache === null,
    error: null,
  });

  useEffect(() => {
    if (cache) return;
    let active = true;
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
  }, []);

  return state;
}
