import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PokemonCard from '../components/PokemonCard';
import type { ChainLink, PokemonResponse, SpeciesResponse, EvolutionChainResponse } from '../types';

const pokemon: PokemonResponse = {
  id: 887,
  name: 'dragapult',
  sprites: {
    front_default: 'normal.png',
    front_shiny: 'shiny.png',
    other: { 'official-artwork': { front_default: 'art-normal.png', front_shiny: 'art-shiny.png' } },
  },
  types: [{ slot: 1, type: { name: 'dragon' } }, { slot: 2, type: { name: 'ghost' } }],
  stats: [
    { base_stat: 88, stat: { name: 'hp' } },
    { base_stat: 120, stat: { name: 'attack' } },
    { base_stat: 75, stat: { name: 'defense' } },
    { base_stat: 100, stat: { name: 'special-attack' } },
    { base_stat: 75, stat: { name: 'special-defense' } },
    { base_stat: 142, stat: { name: 'speed' } },
  ],
  abilities: [
    { ability: { name: 'clear-body' }, is_hidden: false, slot: 1 },
    { ability: { name: 'infiltrator' }, is_hidden: false, slot: 2 },
    { ability: { name: 'cursed-body' }, is_hidden: true, slot: 3 },
  ],
  moves: [
    { move: { name: 'dragon-darts' }, version_group_details: [{ level_learned_at: 48, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } }] },
  ],
};

const chainLink: ChainLink = {
  species: { name: 'dreepy' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'drakloak' },
      evolution_details: [
        { min_level: 50, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [
        {
          species: { name: 'dragapult' },
          evolution_details: [
            { min_level: 60, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
          ],
          evolves_to: [],
        },
      ],
    },
  ],
};

const species: SpeciesResponse = {
  name: 'dragapult',
  evolution_chain: { url: 'X' },
  varieties: [{ is_default: true, pokemon: { name: 'dragapult', url: '' } }],
};
const chain: EvolutionChainResponse = { chain: chainLink };

describe('PokemonCard', () => {
  it('renders all stat values', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} gen={8} />);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
  });

  it('marks the hidden ability', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} gen={8} />);
    const item = screen.getByText(/cursed body/i).closest('li');
    expect(item).not.toBeNull();
    expect(item).toHaveTextContent(/HIDDEN/i);
  });

  it('renders types as chips', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} gen={8} />);
    expect(screen.getAllByText('dragon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ghost').length).toBeGreaterThan(0);
  });

  it('renders the showdown animated sprite in default 3D view', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} gen={8} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/showdown/887.gif'));
  });

  it('renders the showdown shiny sprite in 3D view when shiny is true', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={true} onShinyChange={() => {}} gen={8} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('/showdown/shiny/887.gif'));
  });

  it('renders the evolution chain', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} gen={8} />);
    expect(screen.getByText('DREEPY')).toBeInTheDocument();
    expect(screen.getByText('DRAKLOAK')).toBeInTheDocument();
    expect(screen.getAllByText('DRAGAPULT').length).toBe(2);
  });

  it('renders the move list (level-up open by default)', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} gen={8} />);
    expect(screen.getByText(/dragon darts/i)).toBeInTheDocument();
  });
});
