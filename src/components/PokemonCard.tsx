import { useState } from 'react';
import type { EvolutionChainResponse, PokemonResponse, SpeciesResponse } from '../types';
import { groupMoves } from '../moves';
import { getGen } from '../generations';
import StatBar from './StatBar';
import AbilityList from './AbilityList';
import EvolutionChain from './EvolutionChain';
import MoveList from './MoveList';
import ShinyToggle from './ShinyToggle';
import SpriteToggle, { type SpriteView } from './SpriteToggle';
import Section from './Section';
import CompetitiveBuild from './CompetitiveBuild';
import Detail from './Detail';
import { useCompetitiveSet } from '../hooks/useCompetitiveSet';
import { TYPE_COLORS, TYPES, type PokeType } from '../typeChart';

interface Props {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
  shiny: boolean;
  onShinyChange: (v: boolean) => void;
  onSelectEvolution?: (name: string) => void;
  gen: number;
}

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

function pickSprite(p: PokemonResponse, shiny: boolean, view: SpriteView): string {
  if (view === '2d') {
    const sd = p.sprites.other.showdown;
    if (sd) {
      const url = shiny ? sd.front_shiny : sd.front_default;
      if (url) return url;
    }
    return shiny
      ? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
      : p.sprites.front_default ?? '';
  }
  // 3D
  const home = p.sprites.other.home;
  if (home) {
    const url = shiny ? home.front_shiny : home.front_default;
    if (url) return url;
  }
  const art = p.sprites.other['official-artwork'];
  return shiny
    ? art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
    : art.front_default ?? p.sprites.front_default ?? '';
}

export default function PokemonCard({
  pokemon,
  chain,
  shiny,
  onShinyChange,
  onSelectEvolution,
  gen,
}: Props) {
  const [view, setView] = useState<SpriteView>('3d');
  const sprite = pickSprite(pokemon, shiny, view);
  const meta = getGen(gen);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => STAT_ORDER.indexOf(a.stat.name) - STAT_ORDER.indexOf(b.stat.name),
  );
  const moveCount = Object.values(groupMoves(pokemon.moves, meta.primaryVersionGroup)).reduce(
    (n, g) => n + g.length,
    0,
  );
  const competitive = useCompetitiveSet(pokemon.name, gen);

  const movesLabel = meta.primaryVersionGroup
    .toUpperCase()
    .replace(/-/g, '/');

  return (
    <div className="crt-card">
      <div className="crt-card-top">
        <div className="crt-card-art">
          <img
            key={`${view}-${shiny}-${pokemon.name}`}
            className={'crt-sprite-' + view}
            src={sprite}
            alt={pokemon.name}
          />
          <SpriteToggle value={view} onChange={setView} />
          <ShinyToggle value={shiny} onChange={onShinyChange} />
        </div>
        <div className="crt-card-meta">
          <div className="crt-card-dex">#{String(pokemon.id).padStart(3, '0')}</div>
          <div className="crt-card-name">{pokemon.name.toUpperCase()}</div>
          <div className="crt-card-gen">GEN {meta.roman} · {meta.region.toUpperCase()}</div>
          <div className="crt-types">
            {pokemon.types.map((t) => {
              const isPoke = (TYPES as readonly string[]).includes(t.type.name);
              const color = isPoke ? TYPE_COLORS[t.type.name as PokeType] : 'var(--primary)';
              return (
                <Detail
                  key={t.type.name}
                  kind="type"
                  name={t.type.name}
                  label={t.type.name}
                  triggerClassName="crt-type"
                  triggerStyle={{ color, borderColor: color, textShadow: `0 0 4px ${color}66` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <Section label="▶ BASE STATS">
        {sortedStats.map((s) => (
          <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
        ))}
      </Section>

      <Section label="▶ ABILITIES">
        <AbilityList abilities={pokemon.abilities} />
      </Section>

      <Section label="▶ EVOLUTION">
        <EvolutionChain chain={chain.chain} active={pokemon.name} onSelect={onSelectEvolution} />
      </Section>

      <Section label={`▶ MOVES (${movesLabel})`} count={moveCount}>
        <MoveList moves={pokemon.moves} versionGroup={meta.primaryVersionGroup} />
      </Section>

      <Section
        label="▶ COMPETITIVE BUILD"
        count={competitive.build ? competitive.build.tier.toUpperCase() : undefined}
      >
        <CompetitiveBuild
          build={competitive.build}
          loading={competitive.loading}
          error={competitive.error}
        />
      </Section>
    </div>
  );
}
