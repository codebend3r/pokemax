import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainerGrid from '@/components/TrainerGrid';
import type { Trainer } from '@/trainers';

const TRAINERS: Trainer[] = [
  {
    id: 'rb-brock',
    name: 'Brock',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    team: [{ species: 'onix', level: 14 }],
  },
  {
    id: 'frlg-misty',
    name: 'Misty',
    trainerClass: 'Gym Leader',
    game: 'firered-leafgreen',
    team: [{ species: 'starmie', level: 21 }],
  },
  {
    id: 'gs-falkner',
    name: 'Falkner',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    team: [{ species: 'pidgeotto', level: 9 }],
  },
];

function regionHeadings(): string[] {
  return screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent ?? '');
}

describe('TrainerGrid', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('groups trainers under regions, expanded by default', () => {
    render(<TrainerGrid trainers={TRAINERS} onSelect={() => {}} />);
    const headings = regionHeadings();
    expect(headings[0]).toContain('KANTO');
    expect(headings[1]).toContain('JOHTO');
    expect(screen.getByText('Brock')).toBeInTheDocument();
    expect(screen.getByText('Falkner')).toBeInTheDocument();
  });

  it('orders games within a region by release date', () => {
    render(<TrainerGrid trainers={TRAINERS} onSelect={() => {}} />);
    const cards = screen.getAllByRole('button', { name: /gym leader/i });
    const names = cards.map((c) => c.textContent);
    // Red/Blue (1996) before FireRed/LeafGreen (2004) inside Kanto
    expect(names.findIndex((n) => n?.includes('Brock'))).toBeLessThan(
      names.findIndex((n) => n?.includes('Misty')),
    );
  });

  it('collapse all hides the cards; a region toggle brings its own back', async () => {
    render(<TrainerGrid trainers={TRAINERS} onSelect={() => {}} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /collapse all/i }));
    expect(screen.queryByText('Brock')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^[▼▶]KANTO$/ }));
    expect(screen.getByText('Brock')).toBeInTheDocument();
    expect(screen.queryByText('Falkner')).not.toBeInTheDocument();
  });

  it('an active filter auto-expands collapsed regions', async () => {
    render(<TrainerGrid trainers={TRAINERS} onSelect={() => {}} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /collapse all/i }));
    await user.type(screen.getByLabelText(/search trainer name/i), 'falkner');
    expect(screen.getByText('Falkner')).toBeInTheDocument();
    expect(screen.queryByText('Brock')).not.toBeInTheDocument();
  });

  it('clicking a trainer card reports the trainer', async () => {
    const onSelect = vi.fn();
    render(<TrainerGrid trainers={TRAINERS} onSelect={onSelect} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /brock/i }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'rb-brock' }));
  });
});
