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

const BW_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
const MAX_BW_ID = 649;

interface SpritePick {
  url: string;
  /** true when the rendered image is a real frame-animated GIF */
  animated: boolean;
}

function pickSprite(p: PokemonResponse, shiny: boolean, view: SpriteView, fallbackLevel: number): SpritePick {
  if (view === '2d') {
    // Tier 0: Black/White animated GIF (true flat pixel animation, IDs 1-649)
    if (fallbackLevel === 0 && p.id <= MAX_BW_ID) {
      const url = shiny ? `${BW_BASE}/shiny/${p.id}.gif` : `${BW_BASE}/${p.id}.gif`;
      return { url, animated: true };
    }
    // Tier 1: static flat pixel sprite (Box-style)
    const fallback = shiny
      ? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
      : p.sprites.front_default ?? '';
    return { url: fallback, animated: false };
  }

  // 3D view
  if (fallbackLevel === 0) {
    const home = p.sprites.other.home;
    if (home) {
      const url = shiny ? home.front_shiny : home.front_default;
      if (url) return { url, animated: false };
    }
  }
  // Tier 1+: official artwork → pixel
  const art = p.sprites.other['official-artwork'];
  const url = shiny
    ? art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
    : art.front_default ?? p.sprites.front_default ?? '';
  return { url, animated: false };
}

function CardSprite({
  pokemon,
  shiny,
  view,
}: {
  pokemon: PokemonResponse;
  shiny: boolean;
  view: SpriteView;
}) {
  const [fallback, setFallback] = useState(0);
  const sprite = pickSprite(pokemon, shiny, view, fallback);
  const className =
    'crt-sprite-' + view + (sprite.animated ? ' is-anim' : ' is-static');

  return (
    <img
      key={`${view}-${shiny}-${pokemon.name}-${fallback}`}
      className={className}
      src={sprite.url}
      alt={pokemon.name}
      onError={() => setFallback((f) => (f < 2 ? f + 1 : f))}
    />
  );
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
  const meta = getGen(gen);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => STAT_ORDER.indexOf(a.stat.name) - STAT_ORDER.indexOf(b.stat.name),
  );
  const moveCount = Object.values(groupMoves(pokemon.moves, meta.primaryVersionGroup)).reduce(
    (n, g) => n + g.length,
    0,
  );
  const competitive = useCompetitiveSet(pokemon.name, gen);

  const movesLabel = meta.primaryVersionGroup.toUpperCase().replace(/-/g, '/');

  return (
    <div className="crt-card">
      <div className="crt-card-top">
        <div className="crt-card-art">
          <CardSprite pokemon={pokemon} shiny={shiny} view={view} />
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
