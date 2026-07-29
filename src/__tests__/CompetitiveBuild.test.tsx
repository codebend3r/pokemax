import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompetitiveBuild from '@/components/CompetitiveBuild';
import type { ResolvedBuild } from '@/competitive';
import type { GameId } from '@/trainers';

const GAMES: GameId[] = ['firered-leafgreen', 'scarlet-violet'];

const BUILD: ResolvedBuild = {
  pokemonKey: 'Charizard',
  tier: 'ou',
  buildName: 'Mixed Attacker',
  sourceGen: 3,
  set: {
    moves: ['Flamethrower', ['Fire Blast', 'Overheat']],
    item: 'Choice Band',
    nature: 'Naive',
    evs: { atk: 252, spa: 4, spe: 252 },
  },
};

function renderBuild(overrides: Partial<Parameters<typeof CompetitiveBuild>[0]> = {}) {
  const onSelectGame = vi.fn();
  render(
    <CompetitiveBuild
      build={BUILD}
      loading={false}
      error={null}
      games={GAMES}
      selectedGame={null}
      onSelectGame={onSelectGame}
      {...overrides}
    />,
  );
  return onSelectGame;
}

describe('CompetitiveBuild', () => {
  it('renders the set with tier, build name, and gen-accurate source', () => {
    renderBuild();
    expect(screen.getByText('[OU]')).toBeInTheDocument();
    expect(screen.getByText('Mixed Attacker')).toBeInTheDocument();
    expect(screen.getByText(/smogon\.com\/dex\/rs/)).toBeInTheDocument(); // gen 3 → rs
  });

  it('offers LATEST plus every game the Pokémon appears in', () => {
    renderBuild();
    const select = screen.getByLabelText(/game for competitive build/i);
    const options = [...select.querySelectorAll('option')].map((o) => o.textContent);
    expect(options[0]).toMatch(/latest/i);
    expect(options).toContain('FIRERED / LEAFGREEN');
    expect(options).toContain('SCARLET / VIOLET');
  });

  it('reports a picked game and switching back to LATEST', async () => {
    const onSelectGame = renderBuild();
    const user = userEvent.setup();
    const select = screen.getByLabelText(/game for competitive build/i);
    await user.selectOptions(select, 'firered-leafgreen');
    expect(onSelectGame).toHaveBeenCalledWith('firered-leafgreen');
  });

  it('shows a game-specific empty state when a pinned gen has no set', () => {
    renderBuild({ build: null, selectedGame: 'firered-leafgreen' });
    expect(
      screen.getByText(/no Smogon set for this entry in FireRed \/ LeafGreen/),
    ).toBeInTheDocument();
    // the selector stays available so the user can escape the empty state
    expect(screen.getByLabelText(/game for competitive build/i)).toBeInTheDocument();
  });
});
