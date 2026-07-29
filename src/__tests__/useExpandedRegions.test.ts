import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useExpandedRegions } from '@/hooks/useExpandedRegions';

const KEY = 'test.regions';

describe('useExpandedRegions', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts all-collapsed with no default', () => {
    const { result } = renderHook(() => useExpandedRegions(KEY));
    expect(result.current.expanded.size).toBe(0);
  });

  it('honours defaultExpanded when nothing is stored', () => {
    const { result } = renderHook(() => useExpandedRegions(KEY, ['Kanto', 'Johto']));
    expect([...result.current.expanded]).toEqual(['Kanto', 'Johto']);
  });

  it('does not write to localStorage until the user toggles', () => {
    renderHook(() => useExpandedRegions(KEY, ['Kanto']));
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it('toggle persists and a stored value beats the default', () => {
    const { result, unmount } = renderHook(() => useExpandedRegions(KEY));
    act(() => result.current.toggle('Hoenn'));
    expect(window.localStorage.getItem(KEY)).toBe('["Hoenn"]');
    unmount();
    const { result: again } = renderHook(() => useExpandedRegions(KEY, ['Kanto']));
    expect([...again.current.expanded]).toEqual(['Hoenn']);
  });

  it('expandAll and collapseAll replace the whole set', () => {
    const { result } = renderHook(() => useExpandedRegions(KEY));
    act(() => result.current.expandAll(['Kanto', 'Johto']));
    expect(result.current.expanded.size).toBe(2);
    act(() => result.current.collapseAll());
    expect(result.current.expanded.size).toBe(0);
    expect(window.localStorage.getItem(KEY)).toBe('[]');
  });

  it('falls back to the default on a corrupted stored value', () => {
    window.localStorage.setItem(KEY, 'not json');
    const { result } = renderHook(() => useExpandedRegions(KEY, ['Kanto']));
    expect([...result.current.expanded]).toEqual(['Kanto']);
  });
});
