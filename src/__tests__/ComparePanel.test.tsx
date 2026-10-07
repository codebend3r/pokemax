import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparePanel from '@/components/ComparePanel';
import type { DexEntry, PokemonResponse } from '@/types';

function mon({ id, name, hp }: { id: number; name: string; hp: number }): PokemonResponse {
  return {
    id,
    name,
    height: 10,
    weight: 100,
    sprites: {
      front_default: null,
      front_shiny: null,
      other: { 'official-artwork': { front_default: null, front_shiny: null } },
    },
    types: [{ slot: 1, type: { name: 'normal' } }],
    stats: [{ base_stat: hp, stat: { name: 'hp' } }],
    abilities: [],
    moves: [],
  };
}

const BASE = mon({ id: 9001, name: 'basemon', hp: 50 });
const TARGET = mon({ id: 9002, name: 'targetmon', hp: 80 });
const SPECIES: DexEntry[] = [
  { kind: 'species', name: 'basemon', id: 9001, gen: 1 },
  { kind: 'species', name: 'targetmon', id: 9002, gen: 1 },
];

describe('ComparePanel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(TARGET))),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('names its search field and close button', async () => {
    const onClose = vi.fn();
    render(<ComparePanel base={BASE} species={SPECIES} onClose={onClose} />);
    expect(screen.getByRole('textbox', { name: 'Pokémon to compare with' })).toHaveFocus();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Close compare' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps focus in the panel after a pick and marks the higher stat in text', async () => {
    render(<ComparePanel base={BASE} species={SPECIES} onClose={() => {}} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Pokémon to compare with' }), 'target');
    await user.click(screen.getByRole('button', { name: /targetmon/i }));

    expect(screen.getByRole('region')).toHaveFocus();
    expect(await screen.findByRole('status')).toHaveTextContent('COMPARING');
    expect(screen.getAllByText('(higher)')).toHaveLength(2);
  });
});
