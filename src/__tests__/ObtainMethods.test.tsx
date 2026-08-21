import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ObtainMethods from '@/components/ObtainMethods';
import type { ObtainState } from '@/hooks/useObtainData';
import type { ObtainFile } from '@/obtain/types';

const ready = (file: ObtainFile): ObtainState => ({ status: 'ready', file });

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
    const { container } = render(<ObtainMethods state={ready(FILE)} currentGen={1} />);
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
    render(<ObtainMethods state={ready(FILE)} currentGen={1} />);
    // weather-intense-sun renders with the sun-specific weather glyph
    // (U+2600 + U+FE0E text-presentation selector)
    const sunIcon = '☀︎';
    expect(screen.getByText(`${sunIcon} INTENSE SUN`)).toBeInTheDocument();
  });

  it('renders each condition family with its own icon and label', () => {
    const file: ObtainFile = {
      pokemonId: 1,
      name: 'testmon',
      breeding: null,
      games: [
        {
          gen: 1,
          versionGroup: 'red-blue',
          versions: ['red'],
          entries: [
            {
              method: 'grass',
              location: 'Route 1',
              conditions: [
                'time-night',
                'season-winter',
                'weather-snow',
                'old-rod',
                'story-progress-hall-of-fame',
                'trade-machoke',
                'slot2-emerald',
                'radio-hoenn',
                'starter-bulbasaur',
                'weekday-tuesday',
                'no-such-family-here',
              ],
            },
          ],
        },
      ],
    };
    render(<ObtainMethods state={ready(file)} currentGen={1} />);
    // Prefix-stripping families
    expect(screen.getByText('◔︎ NIGHT')).toBeInTheDocument();
    expect(screen.getByText('✿︎ WINTER')).toBeInTheDocument();
    expect(screen.getByText('❄︎ SNOW')).toBeInTheDocument();
    expect(screen.getByText('⚑︎ AFTER HALL OF FAME')).toBeInTheDocument();
    expect(screen.getByText('✧︎ TUESDAY')).toBeInTheDocument();
    // Prefix-replacing families
    expect(screen.getByText('⇄︎ GIVE MACHOKE')).toBeInTheDocument();
    expect(screen.getByText('◎︎ GBA: EMERALD')).toBeInTheDocument();
    expect(screen.getByText('✧︎ RADIO: HOENN')).toBeInTheDocument();
    expect(screen.getByText('✧︎ STARTER: BULBASAUR')).toBeInTheDocument();
    // Exact-slug family with no common prefix
    expect(screen.getByText('≈︎ OLD ROD')).toBeInTheDocument();
    // Unknown slug falls back to the generic chip, slug preserved
    expect(screen.getByText('✧︎ NO SUCH FAMILY HERE')).toBeInTheDocument();
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
    const { container } = render(<ObtainMethods state={ready(file)} currentGen={1} />);
    // The legend also glosses OTHER for `special`, so scope to the entry chip.
    const entryTag = container.querySelector('.crt-obtain-entries .crt-obtain-tag');
    expect(entryTag).toHaveTextContent('OTHER');
    expect(screen.queryByText('SPECIAL')).not.toBeInTheDocument();
  });

  it('renders a collapsible legend that expands to show glosses', async () => {
    render(<ObtainMethods state={ready(FILE)} currentGen={1} />);
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
    render(<ObtainMethods state={ready(mixed)} currentGen={8} />);
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
    render(<ObtainMethods state={ready(FILE)} currentGen={1} />);
    expect(screen.queryByText(/Trade\/migrate/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /UNOVA/ }));
    expect(screen.getByText(/Trade\/migrate/)).toBeInTheDocument();
  });

  it('renders the unavailable state on error', () => {
    render(
      <ObtainMethods state={{ status: 'error', message: 'No obtain data (404)' }} currentGen={1} />,
    );
    expect(screen.getByText('OBTAIN DATA UNAVAILABLE')).toBeInTheDocument();
  });

  it('renders a loading line', () => {
    render(<ObtainMethods state={{ status: 'loading' }} currentGen={1} />);
    expect(screen.getByText(/LOADING/)).toBeInTheDocument();
    expect(screen.queryByText('OBTAIN DATA UNAVAILABLE')).not.toBeInTheDocument();
  });

  it('renders nothing useful before anything has been asked for', () => {
    render(<ObtainMethods state={{ status: 'idle' }} currentGen={1} />);
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
    render(<ObtainMethods state={ready(gen7Only)} currentGen={1} />);
    expect(screen.getByText('Mount Lanakila')).toBeInTheDocument();
  });
});
