import { usePersistentState } from '@/hooks/usePersistentState';

function decode(raw: string): Set<string> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((r): r is string => typeof r === 'string'));
  } catch {
    return null;
  }
}
const encode = (expanded: Set<string>) => JSON.stringify([...expanded]);

/**
 * Collapsible-section state persisted in `localStorage`. Tracks EXPANDED
 * region names; a missing/corrupted key falls back to `defaultExpanded`
 * (empty = everything collapsed).
 */
export function useExpandedRegions(
  key: string,
  defaultExpanded: readonly string[] = [],
): {
  expanded: Set<string>;
  toggle: (region: string) => void;
  expandAll: (regions: readonly string[]) => void;
  collapseAll: () => void;
} {
  const [expanded, setExpanded] = usePersistentState(
    key,
    decode,
    encode,
    () => new Set(defaultExpanded),
  );
  return {
    expanded,
    toggle: (region) =>
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(region)) next.delete(region);
        else next.add(region);
        return next;
      }),
    expandAll: (regions) => setExpanded(new Set(regions)),
    collapseAll: () => setExpanded(new Set()),
  };
}
