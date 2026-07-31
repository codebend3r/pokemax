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
    const { container } = render(
      <ObtainMethods data={FILE} loading={false} error={null} currentGen={1} enabled />,
    );
    expect(screen.getByText(/FIELD\/FAIRY/)).toBeInTheDocument();
    expect(screen.getByText(/2,560 STEPS/)).toBeInTheDocument();
    // Gen 1 expanded: entries visible
    expect(screen.getByText('Viridian Forest')).toBeInTheDocument();
    // Scope to game entries — the legend also glosses each method tag.
    const gameTags = [...container.querySelectorAll('.crt-obtain-game .crt-obtain-tag')];
    expect(gameTags.some((el) => el.textContent === 'GIFT')).toBe(true);
    expect(screen.getByText(/L3–5 · 45%/)).toBeInTheDocument();
    // Condition slugs render prettified (with a leading icon glyph), not as
    // raw dataset text
    expect(screen.getByText(/NIGHT/)).toBeInTheDocument();
    expect(screen.getByText(/INTENSE SUN/)).toBeInTheDocument();
    expect(screen.getByText(/GBA: FIRERED/)).toBeInTheDocument();
    expect(screen.queryByText(/WEATHER INTENSE SUN/)).not.toBeInTheDocument();
  });

  it('gives a weather condition chip its icon', () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} enabled />);
    // weather-intense-sun renders with the sun-specific weather glyph
    // (U+2600 + U+FE0E text-presentation selector)
    const sunIcon = '☀︎';
    expect(screen.getByText(`${sunIcon} INTENSE SUN`)).toBeInTheDocument();
  });

  it('labels the special method OTHER, not SPECIAL', () => {
    const file: ObtainFile = {
      ...FILE,
      games: [
        {
          gen: 1,
          versionGroup: 'red-blue',
          versions: ['red', 'blue'],
          entries: [{ method: 'special', detail: 'Headbutt a tree' }],
        },
      ],
    };
    const { container } = render(
      <ObtainMethods data={file} loading={false} error={null} currentGen={1} enabled />,
    );
    // The legend also glosses OTHER for `special`, so scope to the entry chip.
    const entryTag = container.querySelector('.crt-obtain-entries .crt-obtain-tag');
    expect(entryTag).toHaveTextContent('OTHER');
    expect(screen.queryByText('SPECIAL')).not.toBeInTheDocument();
  });

  it('renders a collapsible legend that expands to show glosses', async () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} enabled />);
    const summary = screen.getByText(/LEGEND/);
    expect(summary).not.toHaveTextContent('?');
    const details = summary.closest('details');
    expect(details).not.toBeNull();
    expect(screen.getByText(/breed & hatch/)).not.toBeVisible();
    await userEvent.click(summary);
    expect(details?.open).toBe(true);
    expect(screen.getByText(/breed & hatch/)).toBeVisible();
    expect(screen.getByText(/time of day/)).toBeVisible();
  });

  it('groups games under region tabs, not generations', async () => {
    const mixed: ObtainFile = {
      pokemonId: 1,
      name: 'testmon',
      breeding: null,
      games: [
        {
          gen: 8,
          versionGroup: 'sword-shield',
          versions: ['sword', 'shield'],
          entries: [{ method: 'wild', location: 'Wild Area' }],
        },
        {
          gen: 8,
          versionGroup: 'brilliant-diamond-shining-pearl',
          versions: ['brilliant-diamond', 'shining-pearl'],
          entries: [{ method: 'wild', location: 'Route 201' }],
        },
        {
          gen: 8,
          versionGroup: 'legends-arceus',
          versions: ['legends-arceus'],
          entries: [{ method: 'wild', location: 'Obsidian Fieldlands' }],
        },
      ],
    };
    render(<ObtainMethods data={mixed} loading={false} error={null} currentGen={8} enabled />);
    // Region tabs, no generation numbers; Hisui is its own tab right after
    // Sinnoh, labeled as ancient Sinnoh
    expect(screen.getByRole('button', { name: /GALAR/ })).toBeInTheDocument();
    expect(screen.queryByText(/GEN VIII/)).not.toBeInTheDocument();
    const sinnoh = screen.getByRole('button', { name: /^▶ SINNOH$/ });
    const hisui = screen.getByRole('button', { name: /HISUI · ANCIENT SINNOH/ });
    expect(sinnoh.compareDocumentPosition(hisui) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // currentGen 8 → home region Galar expanded; the others start collapsed
    expect(screen.getByText('Wild Area')).toBeInTheDocument();
    expect(screen.queryByText('Route 201')).not.toBeInTheDocument();
    await userEvent.click(sinnoh);
    expect(screen.getByText('Route 201')).toBeInTheDocument();
    await userEvent.click(hisui);
    expect(screen.getByText('Obsidian Fieldlands')).toBeInTheDocument();
  });

  it('collapses other gens until toggled', async () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} enabled />);
    expect(screen.queryByText(/Trade\/migrate/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /UNOVA/ }));
    expect(screen.getByText(/Trade\/migrate/)).toBeInTheDocument();
  });

  it('renders the unavailable state on error', () => {
    render(
      <ObtainMethods
        data={null}
        loading={false}
        error="No obtain data (404)"
        currentGen={1}
        enabled
      />,
    );
    expect(screen.getByText('OBTAIN DATA UNAVAILABLE')).toBeInTheDocument();
  });

  it('renders a loading line', () => {
    render(<ObtainMethods data={null} loading error={null} currentGen={1} enabled />);
    expect(screen.getByText(/LOADING/)).toBeInTheDocument();
  });

  it('shows loading, not unavailable, the instant it is enabled but data has not arrived', () => {
    render(<ObtainMethods data={null} loading={false} error={null} currentGen={1} enabled />);
    expect(screen.getByText(/LOADING/)).toBeInTheDocument();
    expect(screen.queryByText('OBTAIN DATA UNAVAILABLE')).not.toBeInTheDocument();
  });

  it('stays unavailable (not loading) when disabled with no data', () => {
    render(
      <ObtainMethods data={null} loading={false} error={null} currentGen={1} enabled={false} />,
    );
    expect(screen.getByText('OBTAIN DATA UNAVAILABLE')).toBeInTheDocument();
  });

  it('default-expands the first gen present when currentGen is not in the file', () => {
    const gen7Only: ObtainFile = {
      pokemonId: 37,
      name: 'vulpix',
      breeding: null,
      games: [
        {
          gen: 7,
          versionGroup: 'sun-moon',
          versions: ['sun', 'moon'],
          entries: [{ method: 'wild', location: 'Mount Lanakila' }],
        },
      ],
    };
    // Alolan Vulpix: currentGen is 1 (its national dex gen) but the file
    // only has gen-7-and-later games.
    render(<ObtainMethods data={gen7Only} loading={false} error={null} currentGen={1} enabled />);
    expect(screen.getByText('Mount Lanakila')).toBeInTheDocument();
  });
});
