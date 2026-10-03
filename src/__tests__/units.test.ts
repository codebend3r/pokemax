import { describe, expect, it } from 'vitest';
import { dedupeEntries } from '@/textUtil';
import type { SpeciesResponse } from '@/types';
import { formatHeight, formatWeight } from '@/units';

describe('units', () => {
  it('formats decimetres as metres plus feet and inches', () => {
    expect(formatHeight(17)).toBe(`1.7 m  (5'07")`);
  });

  it('formats hectograms as kilograms plus pounds', () => {
    expect(formatWeight(905)).toBe('90.5 kg  (199.5 lbs)');
  });
});

describe('dedupeEntries', () => {
  it('merges versions that share text and drops other languages', () => {
    const entry = (text: string, version: string, lang = 'en') => ({
      flavor_text: text,
      language: { name: lang },
      version: { name: version },
    });
    const species: SpeciesResponse = {
      name: 'x',
      generation: { name: 'generation-i', url: '' },
      evolution_chain: { url: '' },
      varieties: [],
      genera: [],
      flavor_text_entries: [
        entry('Same\ntext.', 'red'),
        entry('Same text.', 'blue'),
        entry('Other.', 'yellow'),
        entry('Autre.', 'x', 'fr'),
      ],
    };
    expect(dedupeEntries(species)).toEqual([
      { text: 'Same text.', versions: ['red', 'blue'] },
      { text: 'Other.', versions: ['yellow'] },
    ]);
  });
});
