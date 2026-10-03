import { useEffect, useState } from 'react';

export interface AsyncMemo<K, V> {
  /**
   * Concurrent callers share one in-flight promise per key; a success is
   * cached for the session, a failure is evicted so the next call retries.
   */
  get(key: K): Promise<V>;
  /** The cached value, when this key has already resolved. */
  peek(key: K): V | undefined;
}

/**
 * Wraps a loader in a per-key session cache. Keys are compared with `===` and
 * values must never be `undefined` (that is what `peek` uses for "not yet").
 */
export function memoAsync<V>(load: () => Promise<V>): AsyncMemo<void, V>;
export function memoAsync<K, V>(load: (key: K) => Promise<V>): AsyncMemo<K, V>;
export function memoAsync<K, V>(load: (key: K) => Promise<V>): AsyncMemo<K, V> {
  const done = new Map<K, V>();
  const pending = new Map<K, Promise<V>>();
  return {
    get(key) {
      const hit = done.get(key);
      if (hit !== undefined) return Promise.resolve(hit);
      let p = pending.get(key);
      if (!p) {
        p = load(key).then(
          (value) => {
            done.set(key, value);
            pending.delete(key);
            return value;
          },
          (e: unknown) => {
            pending.delete(key);
            throw e;
          },
        );
        pending.set(key, p);
      }
      return p;
    },
    peek: (key) => done.get(key),
  };
}

/** `idle` means nobody has asked yet — distinct from `error`, which means we asked and it failed. */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; data: T };

/**
 * Reads `memo` for `key`, fetching once `enabled`. A success lands in the
 * memo, which the render path reads directly, so state only records THAT a
 * fetch settled and whether it failed — scoped to its key, so a key change
 * can never surface a stale outcome. Keys must be primitives; a keyless memo
 * takes `undefined`.
 */
export function useAsync<K, V>(memo: AsyncMemo<K, V>, enabled: boolean, key: K): AsyncState<V> {
  // Always a fresh object — a same-value `setState` would bail out of the
  // re-render that reveals the cached value.
  const [settled, setSettled] = useState<{ key: K; message: string | null } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || memo.peek(key) !== undefined) return;
    let active = true;
    memo.get(key).then(
      () => {
        if (active) setSettled({ key, message: null });
      },
      (e: unknown) => {
        if (active) setSettled({ key, message: e instanceof Error ? e.message : String(e) });
      },
    );
    return () => {
      active = false;
    };
  }, [memo, enabled, key, attempt]);

  const cached = memo.peek(key);
  if (cached !== undefined) return { status: 'ready', data: cached };
  if (settled !== null && settled.key === key && settled.message !== null) {
    return {
      status: 'error',
      message: settled.message,
      retry: () => {
        setSettled(null);
        setAttempt((n) => n + 1);
      },
    };
  }
  // `enabled` flipping true and the effect's first run are a frame apart —
  // report loading from the render that turned it on, not the one after.
  return enabled ? { status: 'loading' } : { status: 'idle' };
}

export function dataOf<T>(state: AsyncState<T>): T | null {
  return state.status === 'ready' ? state.data : null;
}

export type Pending = Exclude<AsyncState<never>, { status: 'ready' }>;

/**
 * The combined not-yet-ready status of several lookups — the first failure
 * (whose `retry` retries every failed one), else loading, else idle. Callers
 * build their ready value themselves, memoized, so its identity is stable.
 */
export function pendingOf(...states: AsyncState<unknown>[]): Pending {
  const failed = states.filter((s) => s.status === 'error');
  if (failed.length > 0) {
    return {
      status: 'error',
      message: failed[0].message,
      retry: () => failed.forEach((s) => s.retry()),
    };
  }
  return states.every((s) => s.status === 'idle') ? { status: 'idle' } : { status: 'loading' };
}
