import { describe, expect, it } from 'vitest';
import { categorizeForm, formLabel } from '@/forms';

describe('formLabel', () => {
  it('uses curated labels where the suffix alone reads badly', () => {
    expect(formLabel('alola')).toBe('Alolan');
    expect(formLabel('gmax')).toBe('Gigantamax');
    expect(formLabel('single-strike-gmax')).toBe('Gmax Single Strike');
  });

  it('title-cases everything else, without repeating the species', () => {
    expect(formLabel('black')).toBe('Black');
    expect(formLabel('rock-star')).toBe('Rock Star');
  });
});

describe('categorizeForm', () => {
  it('files suffixes into the grid filter categories', () => {
    expect(categorizeForm('mega-x')).toBe('mega');
    expect(categorizeForm('rapid-strike-gmax')).toBe('gmax');
    expect(categorizeForm('galar-zen')).toBe('regional');
    expect(categorizeForm('therian')).toBe('other');
  });
});
