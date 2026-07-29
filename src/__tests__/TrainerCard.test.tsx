import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainerCard from '@/components/TrainerCard';
import type { Trainer } from '@/trainers';

const BROCK: Trainer = {
  id: 'rb-brock',
  name: 'Brock',
  trainerClass: 'Gym Leader',
  game: 'red-blue',
  location: 'Pewter City Gym',
  team: [
    { species: 'geodude', level: 12 },
    { species: 'onix', level: 14 },
  ],
};

describe('TrainerCard', () => {
  it('renders name, class, game, location, and the roster', () => {
    render(
      <TrainerCard
        trainer={BROCK}
        onBack={() => {}}
        onSelectPokemon={() => {}}
        speciesIndex={[]}
      />,
    );
    expect(screen.getByText('BROCK')).toBeInTheDocument();
    expect(screen.getByText('GYM LEADER')).toBeInTheDocument();
    expect(screen.getByText('Red / Blue')).toBeInTheDocument();
    expect(screen.getByText('Pewter City Gym')).toBeInTheDocument();
    expect(screen.getByText('Lv 14')).toBeInTheDocument();
  });

  it('clicking a roster member reports its species slug', async () => {
    const onSelectPokemon = vi.fn();
    render(
      <TrainerCard
        trainer={BROCK}
        onBack={() => {}}
        onSelectPokemon={onSelectPokemon}
        speciesIndex={[]}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /onix/i }));
    expect(onSelectPokemon).toHaveBeenCalledWith('onix');
  });

  it('back button fires onBack', async () => {
    const onBack = vi.fn();
    render(
      <TrainerCard trainer={BROCK} onBack={onBack} onSelectPokemon={() => {}} speciesIndex={[]} />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
