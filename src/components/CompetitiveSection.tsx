import { useEffect, useRef, useState } from 'react';
import CompetitiveBuild from '@/components/CompetitiveBuild';
import Section from '@/components/Section';
import { GAMES, GAME_ORDER, type GameId } from '@/games';
import { useCompetitiveSet } from '@/hooks/useCompetitiveSet';
import { scrollBehavior } from '@/motion';
import type { PokemonResponse } from '@/types';

interface Props {
  pokemon: PokemonResponse;
  /** The species' generation — the build picker offers games from it onward. */
  gen: number;
  /** A fresh object per pick; its `buildGame` preselects that game's build and scrolls here. */
  pick?: { buildGame: GameId | null } | null;
}

export default function CompetitiveSection({ pokemon, gen, pick }: Props) {
  const games = GAME_ORDER.filter((g) => GAMES[g].gen >= gen);
  const [buildGame, setBuildGame] = useState<GameId | null>(pick?.buildGame ?? null);
  const [prevTarget, setPrevTarget] = useState({ name: pokemon.name, pick });
  if (prevTarget.name !== pokemon.name || prevTarget.pick !== pick) {
    setPrevTarget({ name: pokemon.name, pick });
    setBuildGame(pick?.buildGame ?? null);
  }

  const summaryRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // Arriving from a TEAMS pick — jump straight to the build for that game.
    if (!pick?.buildGame) return;
    summaryRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    summaryRef.current?.focus({ preventScroll: true });
  }, [pokemon.name, pick]);

  const competitive = useCompetitiveSet(pokemon.name, buildGame ? GAMES[buildGame].gen : null);
  const build = competitive.status === 'ready' ? competitive.data : null;

  return (
    <Section
      label="COMPETITIVE BUILD"
      summaryRef={summaryRef}
      count={build ? `GEN ${build.sourceGen} · ${build.tier.toUpperCase()}` : undefined}
    >
      <CompetitiveBuild
        state={competitive}
        pokemon={pokemon}
        games={games}
        selectedGame={buildGame}
        onSelectGame={setBuildGame}
      />
    </Section>
  );
}
