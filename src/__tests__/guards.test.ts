import { describe, expect, it } from 'vitest';
import { isNullable, isNumber, isOptional, isString, isStringList } from '@/guards';

describe('isString / isNumber', () => {
  it('accept only their own primitive', () => {
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
    expect(isNumber(1)).toBe(true);
    expect(isNumber('1')).toBe(false);
  });
});

describe('isStringList', () => {
  it('accepts arrays made only of strings', () => {
    expect(isStringList([])).toBe(true);
    expect(isStringList(['a', 'b'])).toBe(true);
  });

  it('rejects non-arrays and mixed arrays', () => {
    expect(isStringList('a')).toBe(false);
    expect(isStringList(undefined)).toBe(false);
    expect(isStringList(['a', 1])).toBe(false);
  });
});

describe('isNullable', () => {
  it('accepts null or a value the inner guard accepts', () => {
    expect(isNullable(null, isString)).toBe(true);
    expect(isNullable('a', isString)).toBe(true);
    expect(isNullable(undefined, isString)).toBe(false);
    expect(isNullable(1, isString)).toBe(false);
  });
});

describe('isOptional', () => {
  it('accepts undefined or a value the inner guard accepts', () => {
    expect(isOptional(undefined, isString)).toBe(true);
    expect(isOptional('a', isString)).toBe(true);
    expect(isOptional(null, isString)).toBe(false);
    expect(isOptional(1, isString)).toBe(false);
  });
});
