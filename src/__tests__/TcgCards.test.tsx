import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TcgCards from '@/components/TcgCards';
import type { TcgCard } from '@/types';

const CARD: TcgCard = {
  id: 'xy1-1',
  name: 'Pikachu',
  number: '1',
  rarity: 'Common',
  images: { small: 'https://images.pokemontcg.io/xy1/1.png', large: 'x' },
  set: { id: 'xy1', name: 'XY', releaseDate: '2014/02/05' },
  tcgplayer: { url: 'https://tcgplayer.com/x', prices: { holofoil: { market: 2.5 } } },
};

describe('TcgCards', () => {
  it('shows a loading indicator while loading', () => {
    render(<TcgCards cards={[]} loading={true} error={null} />);
    expect(screen.getByText(/scanning/i)).toBeInTheDocument();
  });

  it('shows an error message on failure', () => {
    render(<TcgCards cards={[]} loading={false} error="boom" />);
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  it('shows an empty message when no cards are found', () => {
    render(<TcgCards cards={[]} loading={false} error={null} />);
    expect(screen.getByText(/no cards found/i)).toBeInTheDocument();
  });

  it('renders each card with image, set name, and lowest market price', () => {
    render(<TcgCards cards={[CARD]} loading={false} error={null} />);
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute('src', CARD.images.small);
    expect(screen.getByText('XY')).toBeInTheDocument();
    expect(screen.getByText('$2.50')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://tcgplayer.com/x');
  });
});
