import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrollBehavior } from '@/motion';

function prefersReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce') }));
}

describe('scrollBehavior', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('scrolls smoothly by default', () => {
    prefersReducedMotion(false);
    expect(scrollBehavior()).toBe('smooth');
  });

  it('jumps instead when the OS asks for reduced motion', () => {
    prefersReducedMotion(true);
    expect(scrollBehavior()).toBe('auto');
  });
});
