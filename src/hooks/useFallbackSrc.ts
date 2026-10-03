import { useEffect, useState } from 'react';

/**
 * Walks `urls` on load errors: wire `next` to the `<img>`'s `onError`. `src`
 * is null once every candidate has failed. A different list starts over.
 */
export function useFallbackSrc(urls: readonly string[]): { src: string | null; next: () => void } {
  const key = urls.join('\n');
  const [failed, setFailed] = useState({ key, count: 0 });
  const index = failed.key === key ? failed.count : 0;
  return {
    src: urls[index] ?? null,
    next: () => setFailed({ key, count: index + 1 }),
  };
}

function loads(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Probes `urls` in order without rendering them. True until every one has
 * failed to load — so a toggle that depends on it stays visible meanwhile.
 */
export function useAnyLoads(urls: readonly string[]): boolean {
  const key = urls.join('\n');
  const [deadKey, setDeadKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const url of key.split('\n')) {
        if (await loads(url)) return;
      }
      if (!cancelled) setDeadKey(key);
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  return deadKey !== key;
}
