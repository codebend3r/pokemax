import { useEffect, useState } from 'react';

/**
 * Slider-friendly volume state, persisted to localStorage so the user's choice
 * survives reloads. Returns a [value, setter] tuple.
 */
export function useVolume(key: string, defaultValue: number): [number, (v: number) => void] {
  const [value, setValue] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultValue;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return defaultValue;
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return defaultValue;
    return Math.max(0, Math.min(1, n));
  });

  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue];
}
