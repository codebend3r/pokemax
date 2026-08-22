import { describe, expect, it } from 'vitest';
import { LEGEND_METHODS, METHOD_COLOR, METHOD_LABEL, levelRate } from '@/obtain/labels';
import { OBTAIN_METHODS } from '@/obtain/types';

describe('obtain labels', () => {
  it('labels, colors, and glosses every method in OBTAIN_METHODS', () => {
    const glossed = LEGEND_METHODS.map(([m]) => m);
    for (const m of OBTAIN_METHODS) {
      expect(METHOD_LABEL[m], m).toBeTruthy();
      expect(METHOD_COLOR[m], m).toBeTruthy();
      expect(glossed, m).toContain(m);
    }
    expect(glossed).toHaveLength(OBTAIN_METHODS.length);
  });

  it('formats level and rate, omitting what is unknown', () => {
    expect(levelRate({ method: 'grass', minLevel: 3, maxLevel: 5, chance: 45 })).toBe('L3–5 · 45%');
    expect(levelRate({ method: 'grass', minLevel: 7, maxLevel: 7 })).toBe('L7');
    expect(levelRate({ method: 'grass', chance: 10 })).toBe('10%');
    expect(levelRate({ method: 'egg' })).toBe('');
  });
});
