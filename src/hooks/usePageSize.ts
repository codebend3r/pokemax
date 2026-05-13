import { useEffect, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200, Infinity] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const KEY = 'pokemax.pageSize';
const DEFAULT: PageSize = 50;

function detectInitial(): PageSize {
  if (typeof window === 'undefined') return DEFAULT;
  const stored = window.localStorage.getItem(KEY);
  if (stored === 'all') return Infinity;
  const n = Number(stored);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? (n as PageSize) : DEFAULT;
}

export function usePageSize(): { pageSize: PageSize; setPageSize: (s: PageSize) => void } {
  const [pageSize, setPageSize] = useState<PageSize>(detectInitial);

  useEffect(() => {
    window.localStorage.setItem(KEY, pageSize === Infinity ? 'all' : String(pageSize));
  }, [pageSize]);

  return { pageSize, setPageSize };
}
