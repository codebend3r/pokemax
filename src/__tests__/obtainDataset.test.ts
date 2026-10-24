import { describe, expect, it } from 'vitest';
import { isObtainFile } from '@/obtain/types';

const files = import.meta.glob<unknown>('/public/obtain/*.json', {
  eager: true,
  import: 'default',
});

describe('committed obtain dataset', () => {
  it('passes the obtain guard in every file', () => {
    const invalid = Object.entries(files)
      .filter(([, file]) => !isObtainFile(file))
      .map(([path]) => path);
    expect(Object.keys(files).length).toBeGreaterThan(0);
    expect(invalid).toEqual([]);
  });
});
