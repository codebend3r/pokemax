import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageSize } from '@/hooks/usePageSize';

describe('usePageSize', () => {
  beforeEach(() => {
    window.localStorage.removeItem('pokemax.pageSize');
  });

  it('defaults to 50 when nothing is stored', () => {
    const { result } = renderHook(() => usePageSize());
    expect(result.current.pageSize).toBe(50);
  });

  it('persists a numeric page size to localStorage', () => {
    const { result } = renderHook(() => usePageSize());
    act(() => result.current.setPageSize(100));
    expect(result.current.pageSize).toBe(100);
    expect(window.localStorage.getItem('pokemax.pageSize')).toBe('100');
  });

  it('persists Infinity (ALL) as the string "all"', () => {
    const { result } = renderHook(() => usePageSize());
    act(() => result.current.setPageSize(Infinity));
    expect(result.current.pageSize).toBe(Infinity);
    expect(window.localStorage.getItem('pokemax.pageSize')).toBe('all');
  });

  it('restores the stored page size on mount, including "all"', () => {
    window.localStorage.setItem('pokemax.pageSize', 'all');
    const { result } = renderHook(() => usePageSize());
    expect(result.current.pageSize).toBe(Infinity);
  });

  it('falls back to default for an unrecognized stored value', () => {
    window.localStorage.setItem('pokemax.pageSize', '37');
    const { result } = renderHook(() => usePageSize());
    expect(result.current.pageSize).toBe(50);
  });
});
