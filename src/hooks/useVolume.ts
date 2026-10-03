import { usePersistentState } from '@/hooks/usePersistentState';

function decode(raw: string): number | null {
  const n = parseFloat(raw);
  return Number.isNaN(n) ? null : Math.max(0, Math.min(1, n));
}
const encode = String;

/** Slider-friendly 0-1 volume, persisted so the user's choice survives reloads. */
export function useVolume(key: string, defaultValue: number): [number, (v: number) => void] {
  return usePersistentState(key, decode, encode, () => defaultValue);
}
