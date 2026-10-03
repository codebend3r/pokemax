import { describe, expect, it } from 'vitest';
import { resolveDexRoute } from '@/dex';
import type { BaseSpecies } from '@/types';

const INDEX: BaseSpecies[] = [
  { kind: 'species', name: 'charizard', id: 6, gen: 1 },
  { kind: 'species', name: 'mr-mime', id: 122, gen: 1 },
  { kind: 'species', name: 'deoxys', id: 386, gen: 3 },
];

describe('resolveDexRoute', () => {
  it('resolves a species slug as canonical, with its dex number', () => {
    expect(resolveDexRoute('charizard', 'mega-x', INDEX)).toEqual({
      status: 'found',
      species: 'charizard',
      form: 'mega-x',
      baseId: 6,
      canonical: true,
    });
  });

  it('splits a form slug by the longest species prefix and flags it for rewrite', () => {
    expect(resolveDexRoute('mr-mime-galar', 'base', INDEX)).toMatchObject({
      species: 'mr-mime',
      form: 'galar',
      canonical: false,
    });
  });

  it('takes the name as a species until the index loads', () => {
    expect(resolveDexRoute('charizard-mega-x', 'base', [])).toMatchObject({
      species: 'charizard-mega-x',
      baseId: null,
      canonical: true,
    });
  });

  it('reports unknown names and no selection', () => {
    expect(resolveDexRoute('missingno', 'base', INDEX).status).toBe('not-found');
    expect(resolveDexRoute(null, 'base', INDEX).status).toBe('none');
  });
});
