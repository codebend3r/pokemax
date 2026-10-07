import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PokemonGrid from '@/components/PokemonGrid';
import type { DexEntry } from '@/types';
import type { PokeType } from '@/typeChart';

const SPECIES: DexEntry[] = [
  { kind: 'species', name: 'bulbasaur', id: 1, gen: 1 },
  { kind: 'species', name: 'ivysaur', id: 2, gen: 1 },
  { kind: 'species', name: 'charmander', id: 4, gen: 1 },
];
const NO_TYPES = new Set<PokeType>();

function renderGrid({ query, selected }: { query: string; selected: string | null }) {
  render(
    <PokemonGrid
      species={SPECIES}
      query={query}
      selected={selected}
      onSelect={() => {}}
      view="grid"
      onToggleView={() => {}}
      pageSize={50}
      onPageSizeChange={() => {}}
      typeIndex={null}
      selectedTypes={NO_TYPES}
      onToggleType={() => {}}
      onClearTypes={() => {}}
    />,
  );
}

describe('PokemonGrid', () => {
  it('announces how many entries the filters leave', () => {
    renderGrid({ query: 'saur', selected: null });
    expect(screen.getByRole('status')).toHaveTextContent('2 of 3 entries shown');
  });

  it('announces when nothing matches', () => {
    renderGrid({ query: 'mewtwo', selected: null });
    expect(screen.getByRole('status')).toHaveTextContent('No matches');
  });

  it('marks the selected cell as current', () => {
    renderGrid({ query: '', selected: 'ivysaur' });
    expect(screen.getByRole('button', { name: /ivysaur/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: /bulbasaur/ })).toHaveAttribute(
      'aria-current',
      'false',
    );
  });
});
