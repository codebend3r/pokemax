import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EvolutionChain from '../components/EvolutionChain';
import type { ChainLink } from '../types';

const linear: ChainLink = {
  species: { name: 'scorbunny' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'raboot' },
      evolution_details: [
        { min_level: 16, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [
        {
          species: { name: 'cinderace' },
          evolution_details: [
            { min_level: 35, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
          ],
          evolves_to: [],
        },
      ],
    },
  ],
};

const branching: ChainLink = {
  species: { name: 'toxel' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'toxtricity-amped' },
      evolution_details: [
        { min_level: 30, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [],
    },
    {
      species: { name: 'toxtricity-low-key' },
      evolution_details: [
        { min_level: 30, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [],
    },
  ],
};

describe('EvolutionChain', () => {
  it('renders a 3-stage linear chain with conditions', () => {
    render(<EvolutionChain chain={linear} active="raboot" />);
    expect(screen.getByText(/scorbunny/i)).toBeInTheDocument();
    expect(screen.getByText(/raboot/i)).toBeInTheDocument();
    expect(screen.getByText(/cinderace/i)).toBeInTheDocument();
    expect(screen.getAllByText(/lv 16/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/lv 35/i).length).toBeGreaterThan(0);
  });

  it('renders branches for Toxel→Toxtricity', () => {
    render(<EvolutionChain chain={branching} active="toxel" />);
    expect(screen.getByText(/toxel/i)).toBeInTheDocument();
    expect(screen.getByText(/toxtricity amped/i)).toBeInTheDocument();
    expect(screen.getByText(/toxtricity low key/i)).toBeInTheDocument();
  });
});
