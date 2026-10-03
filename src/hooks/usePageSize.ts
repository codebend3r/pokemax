import { usePersistentState } from '@/hooks/usePersistentState';

/** `Infinity` is "ALL", stored as `'all'`. */
export const PAGE_SIZE_OPTIONS: readonly number[] = [25, 50, 100, 200, Infinity];
export type PageSize = number;

function decode(raw: string): PageSize | null {
  const n = raw === 'all' ? Infinity : Number(raw);
  return PAGE_SIZE_OPTIONS.includes(n) ? n : null;
}
const encode = (size: PageSize) => (size === Infinity ? 'all' : String(size));
const fifty = (): PageSize => 50;

export function usePageSize(): { pageSize: PageSize; setPageSize: (s: PageSize) => void } {
  const [pageSize, setPageSize] = usePersistentState('pokemax.pageSize', decode, encode, fifty);
  return { pageSize, setPageSize };
}
