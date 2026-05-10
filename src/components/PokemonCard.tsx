import { useEffect, useRef, useState } from 'react';
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
const SHOWDOWN_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';
const MAX_BW_ID = 649;

interface SpritePick {
  url: string;
  /** true when the rendered image is a real frame-animated GIF */
  animated: boolean;
}

function pickSprite(p: PokemonResponse, shiny: boolean, view: SpriteView, fallbackLevel: number): SpritePick {
  if (view === '2d') {
    if (fallbackLevel === 0 && p.id <= MAX_BW_ID) {
      const url = shiny ? `${BW_BASE}/shiny/${p.id}.gif` : `${BW_BASE}/${p.id}.gif`;
      return { url, animated: true };
    }
    return {
      url: shiny
        ? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
        : p.sprites.front_default ?? '',
      animated: false,
    };
  }
  // 3D — prefer the animated Showdown GIF (real frame animation)
  if (fallbackLevel === 0) {
    const url = shiny ? `${SHOWDOWN_BASE}/shiny/${p.id}.gif` : `${SHOWDOWN_BASE}/${p.id}.gif`;
    return { url, animated: true };
  }
  // Tier 1: HOME static 3D render
  if (fallbackLevel === 1) {
    const home = p.sprites.other.home;
    const url = home ? (shiny ? home.front_shiny : home.front_default) : null;
    if (url) return { url, animated: false };
  }
  // Final fallback: official artwork
  const art = p.sprites.other['official-artwork'];
  return {
    url: shiny
      ? art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
      : art.front_default ?? p.sprites.front_default ?? '',
    animated: false,
  };
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
  const [reacting, setReacting] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sprite = pickSprite(pokemon, shiny, view, fallback);
  const cryUrl = pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null;

  // Auto-play cry once when this card mounts (user-gesture chain from the click that loaded it)
  useEffect(() => {
    if (!cryUrl) return;
    const audio = new Audio(cryUrl);
    audio.volume = 0.45;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // re-run for each new pokemon
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon.id]);

  const playCry = () => {
    if (!cryUrl) return;
    if (!audioRef.current) audioRef.current = new Audio(cryUrl);
    audioRef.current.currentTime = 0;
    audioRef.current.volume = 0.45;
    audioRef.current.play().catch(() => {});
  };

  const handleSpriteClick = () => {
    playCry();
    setReacting(true);
    setShowHeart(true);
    window.setTimeout(() => setReacting(false), 700);
    window.setTimeout(() => setShowHeart(false), 900);
  };

  const className =
    'crt-sprite-' + view +
    (sprite.animated ? ' is-anim' : ' is-static') +
    (reacting ? ' reacting' : '');

  return (
    <div className="crt-card-sprite-wrap">
      <img
        key={`${view}-${shiny}-${pokemon.name}-${fallback}`}
        className={className}
        src={sprite.url}
        alt={pokemon.name}
        onClick={handleSpriteClick}
        onError={() => setFallback((f) => (f < 2 ? f + 1 : f))}
        title="click to play cry"
      />
      {showHeart && <span className="crt-card-heart" aria-hidden="true">♥</span>}
      {cryUrl && (
        <button
          type="button"
          className="crt-cry-button"
          onClick={playCry}
          aria-label={`play ${pokemon.name} cry`}
          title="play cry"
        >
          ♪ CRY
        </button>
      )}
    </div>
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
