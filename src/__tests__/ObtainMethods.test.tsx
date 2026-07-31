import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ObtainMethods from '@/components/ObtainMethods';
import type { ObtainFile } from '@/obtain/types';

const FILE: ObtainFile = {
  pokemonId: 25,
  name: 'pikachu',
  breeding: {
    eggGroups: ['field', 'fairy'],
    hatchCycles: 10,
    steps: 2560,
    breedable: true,
  },
  games: [
    {
      gen: 1,
      versionGroup: 'red-blue',
      versions: ['red', 'blue'],
      entries: [
        {
          method: 'grass',
          location: 'Viridian Forest',
          minLevel: 3,
          maxLevel: 5,
          chance: 45,
          conditions: ['time-night', 'weather-intense-sun', 'slot2-firered'],
        },
      ],
    },
    {
      gen: 1,
      versionGroup: 'yellow',
      versions: ['yellow'],
      entries: [
        {
          method: 'gift',
          location: 'Pallet Town',
          detail: 'Starter from Professor Oak',
        },
      ],
    },
    {
      gen: 5,
      versionGroup: 'black-white',
      versions: ['black', 'white'],
      entries: [{ method: 'transfer', detail: 'Trade/migrate from another game' }],
    },
  ],
};

describe('ObtainMethods', () => {
  it('shows breeding info and the current gen expanded', () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} />);
    expect(screen.getByText(/FIELD\/FAIRY/)).toBeInTheDocument();
    expect(screen.getByText(/2,560 STEPS/)).toBeInTheDocument();
    // Gen 1 expanded: entries visible
    expect(screen.getByText('Viridian Forest')).toBeInTheDocument();
    expect(screen.getByText('GIFT')).toBeInTheDocument();
    expect(screen.getByText(/L3–5 · 45%/)).toBeInTheDocument();
    // Condition slugs render prettified, not as raw dataset text
    expect(screen.getByText('NIGHT')).toBeInTheDocument();
    expect(screen.getByText('INTENSE SUN')).toBeInTheDocument();
    expect(screen.getByText('GBA: FIRERED')).toBeInTheDocument();
    expect(screen.queryByText('WEATHER INTENSE SUN')).not.toBeInTheDocument();
  });

  it('collapses other gens until toggled', async () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} />);
    expect(screen.queryByText(/Trade\/migrate/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /GEN V/ }));
    expect(screen.getByText(/Trade\/migrate/)).toBeInTheDocument();
  });

  it('renders the unavailable state on error', () => {
    render(
      <ObtainMethods data={null} loading={false} error="No obtain data (404)" currentGen={1} />,
    );
    expect(screen.getByText('OBTAIN DATA UNAVAILABLE')).toBeInTheDocument();
  });

  it('renders a loading line', () => {
    render(<ObtainMethods data={null} loading error={null} currentGen={1} />);
    expect(screen.getByText(/LOADING/)).toBeInTheDocument();
  });
});
