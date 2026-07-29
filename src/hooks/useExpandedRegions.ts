import { useEffect, useRef, useState } from 'react';

function initialExpanded(key: string, defaultExpanded: readonly string[]): Set<string> {
  if (typeof window === 'undefined') return new Set(defaultExpanded);
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((r): r is string => typeof r === 'string'));
      }
    }
  } catch {
    // Corrupted value — fall through to the default.
  }
  return new Set(defaultExpanded);
}

/**
 * Collapsible-section state persisted in `localStorage`. Tracks EXPANDED
 * region names; a missing/corrupted key falls back to `defaultExpanded`
 * (empty = everything collapsed). Nothing is written until the user actually
 * toggles — otherwise the mount write would freeze the current default into
 * storage and future default changes would never apply.
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
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    initialExpanded(key, defaultExpanded),
  );
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) return;
    window.localStorage.setItem(key, JSON.stringify([...expanded]));
  }, [key, expanded]);

  const update = (next: Set<string>) => {
    dirty.current = true;
    setExpanded(next);
  };

  return {
    expanded,
    toggle: (region) => {
      dirty.current = true;
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(region)) {
          next.delete(region);
        } else {
          next.add(region);
        }
        return next;
      });
    },
    expandAll: (regions) => update(new Set(regions)),
    collapseAll: () => update(new Set()),
  };
}
