import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useViewMode } from '@/hooks/useViewMode';

describe('useViewMode', () => {
  beforeEach(() => {
    window.localStorage.removeItem('pokemax.view');
  });

  it('defaults to grid when nothing is stored', () => {
    const { result } = renderHook(() => useViewMode());
    expect(result.current.view).toBe('grid');
  });

  it('toggle flips between grid and list and persists to localStorage', () => {
    const { result } = renderHook(() => useViewMode());
    act(() => result.current.toggle());
    expect(result.current.view).toBe('list');
    expect(window.localStorage.getItem('pokemax.view')).toBe('list');
    act(() => result.current.toggle());
    expect(result.current.view).toBe('grid');
  });

  it('reads the previously stored view on mount', () => {
    window.localStorage.setItem('pokemax.view', 'list');
    const { result } = renderHook(() => useViewMode());
    expect(result.current.view).toBe('list');
  });
});
