import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * State mirrored to `localStorage[key]` (keys live under `pokemax.*`). A
 * missing, unreadable, or unrecognized value falls back to `fallback()`.
 * Nothing is written until the value is first set: a write on mount would
 * freeze today's default — or the OS theme — into storage, so a later change
 * to it would never apply. `decode` / `encode` must be stable (module-level).
 */
export function usePersistentState<T>(
  key: string,
  decode: (raw: string) => T | null,
  encode: (value: T) => string,
  fallback: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return (raw === null ? null : decode(raw)) ?? fallback();
    } catch {
      return fallback();
    }
  });
  const dirty = useRef(false);

  useEffect(() => {
    if (dirty.current) window.localStorage.setItem(key, encode(value));
  }, [key, value, encode]);

  const set: Dispatch<SetStateAction<T>> = (next) => {
    dirty.current = true;
    setValue(next);
  };
  return [value, set];
}
