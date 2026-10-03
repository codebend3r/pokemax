import { describe, expect, it } from 'vitest';
import { defensiveMatchups, effectiveness } from '@/typeChart';

describe('effectiveness', () => {
  it('multiplies across both defending types', () => {
    expect(effectiveness('electric', ['water', 'flying'])).toBe(4);
    expect(effectiveness('ground', ['flying'])).toBe(0);
    expect(effectiveness('fire', ['water', 'rock'])).toBe(0.25);
    expect(effectiveness('normal', ['fire'])).toBe(1);
  });

  it('agrees with the full defensive matchup list', () => {
    const list = defensiveMatchups(['grass', 'poison']);
    for (const { type, multiplier } of list) {
      expect(effectiveness(type, ['grass', 'poison'])).toBe(multiplier);
    }
  });
});
