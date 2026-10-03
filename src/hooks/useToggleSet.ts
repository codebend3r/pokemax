import { useState } from 'react';

/** A `Set` in state with toggle and clear — the shape every chip filter uses. */
export function useToggleSet<T>(initial: Iterable<T> = []): {
  set: Set<T>;
  toggle: (item: T) => void;
  clear: () => void;
} {
  const [set, setSet] = useState(() => new Set(initial));
  return {
    set,
    toggle: (item) =>
      setSet((prev) => {
        const next = new Set(prev);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        return next;
      }),
    clear: () => setSet(new Set()),
  };
}
