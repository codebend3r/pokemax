import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { memoAsync, pendingOf, useAsync } from '@/async';

describe('memoAsync', () => {
  it('shares one in-flight load per key and caches the result', async () => {
    const load = vi.fn(async (n: number) => n * 2);
    const memo = memoAsync(load);
    expect(await Promise.all([memo.get(2), memo.get(2)])).toEqual([4, 4]);
    expect(await memo.get(2)).toBe(4);
    expect(load).toHaveBeenCalledTimes(1);
    expect(memo.peek(2)).toBe(4);
    expect(memo.peek(3)).toBeUndefined();
  });

  it('evicts a failure so the next call retries', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue('up');
    const memo = memoAsync((_: string) => load());
    await expect(memo.get('k')).rejects.toThrow('down');
    expect(await memo.get('k')).toBe('up');
    expect(load).toHaveBeenCalledTimes(2);
  });
});

describe('useAsync', () => {
  it('stays idle and does not load until enabled', () => {
    const load = vi.fn(async () => 1);
    const { result } = renderHook(() => useAsync(memoAsync(load), false, undefined));
    expect(result.current.status).toBe('idle');
    expect(load).not.toHaveBeenCalled();
  });

  it('reports loading on the very render that enables it', () => {
    const memo = memoAsync(() => new Promise<number>(() => {}));
    const { result } = renderHook(() => useAsync(memo, true, undefined));
    expect(result.current.status).toBe('loading');
  });

  it('serves a cached value even while disabled', async () => {
    const memo = memoAsync(async (n: number) => n + 1);
    await memo.get(1);
    const { result } = renderHook(() => useAsync(memo, false, 1));
    expect(result.current.status === 'ready' && result.current.data).toBe(2);
  });

  it('never surfaces one key’s error under another key', async () => {
    const memo = memoAsync(async (n: number) => {
      if (n === 1) throw new Error('nope');
      return n;
    });
    const { result, rerender } = renderHook(({ k }) => useAsync(memo, true, k), {
      initialProps: { k: 1 },
    });
    await waitFor(() => expect(result.current.status).toBe('error'));
    rerender({ k: 2 });
    expect(result.current.status).not.toBe('error');
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('retry refetches after a failure', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue('up');
    const memo = memoAsync(() => load());
    const { result } = renderHook(() => useAsync(memo, true, undefined));
    await waitFor(() => expect(result.current.status).toBe('error'));
    act(() => {
      if (result.current.status === 'error') result.current.retry();
    });
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});

describe('pendingOf', () => {
  it('prefers an error, then loading, then idle', () => {
    const retry = vi.fn();
    expect(pendingOf({ status: 'loading' }, { status: 'error', message: 'x', retry }).status).toBe(
      'error',
    );
    expect(pendingOf({ status: 'idle' }, { status: 'loading' }).status).toBe('loading');
    expect(pendingOf({ status: 'idle' }, { status: 'idle' }).status).toBe('idle');
  });
});
