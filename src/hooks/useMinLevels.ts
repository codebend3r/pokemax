import { useEffect, useState } from 'react';
import { fetchMinLevels } from '@/counters';

/** Lazy dex-num → earliest-obtainable-level map; empty map on fetch failure (gate off). */
export function useMinLevels(enabled: boolean): Map<number, number> | null {
  const [levels, setLevels] = useState<Map<number, number> | null>(null);

  useEffect(() => {
    if (!enabled || levels) return;
    let active = true;
    fetchMinLevels()
      .then((m) => {
        if (active) setLevels(m);
      })
      .catch(() => {
        if (active) setLevels(new Map());
      });
    return () => {
      active = false;
    };
  }, [enabled, levels]);

  return levels;
}
