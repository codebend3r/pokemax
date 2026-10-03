import { describe, expect, it } from 'vitest';
import { filterDex, resolveDexRoute } from '@/dex';
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

describe('filterDex', () => {
  const species: BaseSpecies[] = [
    { kind: 'species', name: 'venusaur', id: 3, gen: 1 },
    { kind: 'species', name: 'charizard', id: 6, gen: 1 },
    { kind: 'species', name: 'meowth', id: 52, gen: 1 },
  ];
  const form = (
    name: string,
    id: number,
    speciesName: string,
    speciesId: number,
    cat: 'mega' | 'gmax' | 'regional',
  ) => ({
    kind: 'form' as const,
    name,
    id,
    gen: 1,
    speciesName,
    speciesId,
    formLabel: name,
    formCategory: cat,
  });
  const forms = [
    form('charizard-mega-x', 10034, 'charizard', 6, 'mega'),
    form('venusaur-mega', 10033, 'venusaur', 3, 'mega'),
    form('meowth-alola', 10107, 'meowth', 52, 'regional'),
  ];

  it('shows every base species when no form category is on', () => {
    expect(filterDex(species, forms, new Set(), new Set()).map((e) => e.name)).toEqual([
      'venusaur',
      'charizard',
      'meowth',
    ]);
  });

  it('keeps only species with a matching form, each followed by its forms', () => {
    expect(filterDex(species, forms, new Set(['mega']), new Set()).map((e) => e.name)).toEqual([
      'venusaur',
      'venusaur-mega',
      'charizard',
      'charizard-mega-x',
    ]);
  });

  it('applies the generation filter to species and forms alike', () => {
    expect(filterDex(species, forms, new Set(['regional']), new Set([2]))).toEqual([]);
  });
});
