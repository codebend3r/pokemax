import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '@/hooks/useTheme';

const prefersLight = (light: boolean) =>
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: light && q.includes('light') }));

describe('useTheme', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('follows the OS theme without freezing it into storage', () => {
    prefersLight(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('pokemax.theme')).toBeNull();
  });

  it('persists an explicit toggle, which then beats the OS theme', () => {
    prefersLight(true);
    const { result, unmount } = renderHook(() => useTheme());
    act(() => result.current.toggle());
    expect(window.localStorage.getItem('pokemax.theme')).toBe('dark');
    unmount();
    expect(renderHook(() => useTheme()).result.current.theme).toBe('dark');
  });

  it('ignores an unrecognized stored value', () => {
    prefersLight(false);
    window.localStorage.setItem('pokemax.theme', 'sepia');
    expect(renderHook(() => useTheme()).result.current.theme).toBe('dark');
  });
});
