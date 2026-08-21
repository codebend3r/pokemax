import { useEffect, useState } from 'react';
import { isObtainFile, type ObtainFile } from '@/obtain/types';

const cache = new Map<number, ObtainFile>();
const inflight = new Map<number, Promise<ObtainFile>>();

/**
 * `idle` means nobody has asked yet (the section is closed) — distinct from
 * `error`, which means we asked and it didn't work.
 */
export type ObtainState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; file: ObtainFile };

function load(pokemonId: number): Promise<ObtainFile> {
  const existing = inflight.get(pokemonId);
  if (existing) return existing;
  const p = fetch(`${import.meta.env.BASE_URL}obtain/${pokemonId}.json`)
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
  return p;
}

export function useObtainData(pokemonId: number, enabled: boolean): ObtainState {
  // A success lands in `cache`, which the render path below reads directly, so
  // state only records THAT a fetch settled and whether it failed. `id` scopes
  // that to the Pokémon it happened to, so a change of `pokemonId` can never
  // surface a stale outcome. Always a fresh object — same-value `setState`
  // would bail out of the re-render that reveals the cached file.
  const [settled, setSettled] = useState<{ id: number; message: string | null } | null>(null);

  useEffect(() => {
    if (!enabled || cache.has(pokemonId)) return;
    let active = true;
    load(pokemonId)
      .then(() => {
        if (active) setSettled({ id: pokemonId, message: null });
      })
      .catch((e: Error) => {
        inflight.delete(pokemonId);
        if (active) setSettled({ id: pokemonId, message: e.message });
      });
    return () => {
      active = false;
    };
  }, [pokemonId, enabled]);

  const cached = cache.get(pokemonId);
  if (cached) return { status: 'ready', file: cached };
  if (settled?.id === pokemonId && settled.message !== null) {
    return { status: 'error', message: settled.message };
  }
  // `enabled` flipping true and the effect's first run are a frame apart —
  // report loading from the render that turned it on, not the one after.
  return enabled ? { status: 'loading' } : { status: 'idle' };
}
