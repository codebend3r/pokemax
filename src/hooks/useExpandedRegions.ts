import { useEffect, useState } from 'react';

function initialExpanded(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((r): r is string => typeof r === 'string'));
      }
    }
  } catch {
    // Corrupted value — fall through to the all-collapsed default.
  }
  return new Set();
}

/**
 * Collapsible-section state persisted in `localStorage`. Tracks EXPANDED
 * region names (empty set = the all-collapsed default) so a fresh visitor,
 * a corrupted value, and a missing key all land on everything-collapsed.
 */
export function useExpandedRegions(key: string): {
  expanded: Set<string>;
  toggle: (region: string) => void;
  expandAll: (regions: readonly string[]) => void;
  collapseAll: () => void;
} {
  const [expanded, setExpanded] = useState<Set<string>>(() => initialExpanded(key));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify([...expanded]));
  }, [key, expanded]);

  return {
    expanded,
    toggle: (region) =>
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(region)) {
          next.delete(region);
        } else {
          next.add(region);
        }
        return next;
      }),
    expandAll: (regions) => setExpanded(new Set(regions)),
    collapseAll: () => setExpanded(new Set()),
  };
}
