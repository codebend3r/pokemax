import { useEffect, useRef, useState } from 'react';
import type { EvolutionChainResponse, Gen8Species, PokemonResponse, SpeciesResponse } from '../types';
import { groupMoves } from '../moves';
import { getGen } from '../generations';
import { fetchPokemon } from '../api';
import { CRY_VOLUME_SCALE, cleanFlavorText } from '../textUtil';
import StatBar from './StatBar';
import AbilityList from './AbilityList';
import EvolutionChain from './EvolutionChain';
import MoveList from './MoveList';
import ShinyToggle from './ShinyToggle';
import SpriteToggle, { type SpriteView } from './SpriteToggle';
import FormSwitcher from './FormSwitcher';
import Section from './Section';
import ComparePanel from './ComparePanel';
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
  cryAudioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  cryVolume?: number;
  onCryVolumeChange?: (v: number) => void;
  /** Pool of species the compare picker can choose from */
  speciesPool?: Gen8Species[];
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
    // 2D = flat pixel art. Real BW animation for Gen 1-5; static flat for Gen 6+ (no
    // flat animated source exists for those — Showdown is shaded pixel and lives in 3D).
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
  // 3D = animated Showdown GIF (real frame-by-frame pixel animation, shaded so it
  // reads as a 3D-rendered model). This is the actual animated source for every Pokémon.
  if (fallbackLevel === 0) {
    const url = shiny ? `${SHOWDOWN_BASE}/shiny/${p.id}.gif` : `${SHOWDOWN_BASE}/${p.id}.gif`;
    return { url, animated: true };
  }
  // Showdown missing → Pokémon HOME render
  if (fallbackLevel === 1) {
    const home = p.sprites.other.home;
    const url = home ? (shiny ? home.front_shiny : home.front_default) : null;
    if (url) return { url, animated: false };
  }
  // Final fallback — official artwork
  const art = p.sprites.other['official-artwork'];
  return {
    url: shiny
      ? art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? ''
      : art.front_default ?? p.sprites.front_default ?? '',
    animated: false,
  };
}

interface Particle {
  id: number;
  type: 'heart' | 'star' | 'sparkle';
  x: number;
  delay: number;
  rotate: number;
}

function CardSprite({
  pokemon,
  shiny,
  view,
  preloadedAudio,
  cryVolume,
  onCryVolumeChange,
}: {
  pokemon: PokemonResponse;
  shiny: boolean;
  view: SpriteView;
  preloadedAudio: React.MutableRefObject<HTMLAudioElement | null>;
  cryVolume: number;
  onCryVolumeChange?: (v: number) => void;
}) {
  const [fallbacks, setFallbacks] = useState<Record<SpriteView, number>>({ '2d': 0, '3d': 0 });
  const [reacting, setReacting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const fallback = fallbacks[view];
  const bumpFallback = () =>
    setFallbacks((prev) => ({ ...prev, [view]: Math.min(2, prev[view] + 1) }));
  const sprite = pickSprite(pokemon, shiny, view, fallback);

  // Reset the per-view fallback ladder whenever the Pokemon changes — the new species
  // might have sprites in places the previous one didn't.
  useEffect(() => {
    setFallbacks({ '2d': 0, '3d': 0 });
  }, [pokemon.id]);
  const cryUrl = pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null;

  // Keep the live audio element in sync with the volume slider
  useEffect(() => {
    if (preloadedAudio.current) preloadedAudio.current.volume = cryVolume * CRY_VOLUME_SCALE;
  }, [cryVolume, preloadedAudio]);

  // Auto-play cry once on mount. The audio was pre-warmed when the user clicked
  // the grid cell, so this should fire near-instantly.
  useEffect(() => {
    const a = preloadedAudio.current;
    if (a && a.src) {
      a.currentTime = 0;
      a.volume = cryVolume * CRY_VOLUME_SCALE;
      a.play().catch(() => {});
      return;
    }
    if (cryUrl) {
      const fallbackAudio = new Audio(cryUrl);
      fallbackAudio.volume = cryVolume * CRY_VOLUME_SCALE;
      fallbackAudio.play().catch(() => {});
      preloadedAudio.current = fallbackAudio;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon.id]);

  const playCry = () => {
    const a = preloadedAudio.current;
    if (a && a.src) {
      a.currentTime = 0;
      a.volume = cryVolume * CRY_VOLUME_SCALE;
      a.play().catch(() => {});
      return;
    }
    if (cryUrl) {
      const fresh = new Audio(cryUrl);
      fresh.volume = cryVolume * CRY_VOLUME_SCALE;
      fresh.play().catch(() => {});
      preloadedAudio.current = fresh;
    }
  };

  const handleSpriteClick = () => {
    playCry();
    setReacting(true);
    const types: Particle['type'][] = ['heart', 'star', 'sparkle', 'heart', 'sparkle'];
    const newParticles: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      type: types[i] ?? 'heart',
      x: (Math.random() - 0.5) * 120, // -60 to +60 px
      delay: Math.random() * 180,     // staggered launch
      rotate: (Math.random() - 0.5) * 120,
    }));
    setParticles((p) => [...p, ...newParticles]);
    window.setTimeout(() => setReacting(false), 720);
    window.setTimeout(() => {
      setParticles((p) => p.filter((x) => !newParticles.includes(x)));
    }, 1300);
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
        onError={bumpFallback}
        title="click to play cry"
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className={`crt-card-particle ${p.type}`}
          aria-hidden="true"
          style={{
            ['--x' as string]: `${p.x}px`,
            ['--rotate' as string]: `${p.rotate}deg`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.type === 'heart' ? '♥' : p.type === 'star' ? '★' : '✦'}
        </span>
      ))}
      {cryUrl && (
        <div className="crt-cry-row">
          <button
            type="button"
            className="crt-cry-button"
            onClick={playCry}
            aria-label={`play ${pokemon.name} cry`}
            title="play cry"
          >
            ♪ CRY
          </button>
          {onCryVolumeChange && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={cryVolume}
              aria-label="Cry volume"
              title="Cry volume"
              onChange={(e) => onCryVolumeChange(parseFloat(e.target.value))}
              className="crt-volume-slider crt-cry-slider"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function PokemonCard({
  pokemon: defaultPokemon,
  species,
  chain,
  shiny,
  onShinyChange,
  onSelectEvolution,
  gen,
  cryAudioRef,
  cryVolume = 0.25,
  onCryVolumeChange,
  speciesPool,
}: Props) {
  const [view, setView] = useState<SpriteView>('2d');
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeVariety, setActiveVariety] = useState<string>(defaultPokemon.name);
  const [varietyData, setVarietyData] = useState<PokemonResponse | null>(null);
  const localCryRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = cryAudioRef ?? localCryRef;

  // Reset to the default variety AND default to 2D view whenever the species changes
  useEffect(() => {
    setActiveVariety(defaultPokemon.name);
    setVarietyData(null);
    setView('2d');
  }, [defaultPokemon.name]);

  // Fetch alternate variety data when user picks a different form
  useEffect(() => {
    if (activeVariety === defaultPokemon.name) {
      setVarietyData(null);
      return;
    }
    let active = true;
    fetchPokemon(activeVariety)
      .then((p) => { if (active) setVarietyData(p); })
      .catch(() => { /* leave defaults */ });
    return () => { active = false; };
  }, [activeVariety, defaultPokemon.name]);

  const pokemon = varietyData ?? defaultPokemon;
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

  // Height (decimetres → m + ft′in″)
  const meters = pokemon.height / 10;
  const totalInches = meters * 39.3701;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - ft * 12);
  const heightStr = `${meters.toFixed(1)} m  (${ft}'${String(inches).padStart(2, '0')}")`;

  // Weight (hectograms → kg + lbs)
  const kg = pokemon.weight / 10;
  const lbs = (kg * 2.20462).toFixed(1);
  const weightStr = `${kg.toFixed(1)} kg  (${lbs} lbs)`;

  // Genus ("Mouse Pokémon", "Lizard Pokémon", etc.)
  const genus = species.genera.find((g) => g.language.name === 'en')?.genus ?? '';

  // All unique English Pokédex entries, with the version groups that share each text.
  const dedupedEntries: { text: string; versions: string[] }[] = (() => {
    const cleaned = species.flavor_text_entries
      .filter((e) => e.language.name === 'en')
      .map((e) => ({
        text: cleanFlavorText(e.flavor_text),
        version: e.version.name,
      }));
    const byText = new Map<string, string[]>();
    for (const e of cleaned) {
      const existing = byText.get(e.text);
      if (existing) existing.push(e.version);
      else byText.set(e.text, [e.version]);
    }
    return Array.from(byText, ([text, versions]) => ({ text, versions }));
  })();

  return (
    <div className="crt-card">
      <div className="crt-card-top">
        <div className="crt-card-art">
          <CardSprite
            pokemon={pokemon}
            shiny={shiny}
            view={view}
            preloadedAudio={audioRef}
            cryVolume={cryVolume}
            onCryVolumeChange={onCryVolumeChange}
          />
          <SpriteToggle value={view} onChange={setView} />
          <ShinyToggle value={shiny} onChange={onShinyChange} />
          <FormSwitcher
            varieties={species.varieties}
            speciesName={species.name}
            active={activeVariety}
            onChange={setActiveVariety}
          />
        </div>
        <div className="crt-card-meta">
          <div className="crt-card-dex">#{String(pokemon.id).padStart(3, '0')}</div>
          <div className="crt-card-name">{pokemon.name.toUpperCase()}</div>
          <div className="crt-card-gen">
            GEN {meta.roman} · {meta.region.toUpperCase()}{genus ? ` · ${genus.toUpperCase()}` : ''}
          </div>
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
          <div className="crt-card-vitals">
            <span><span className="crt-card-vitals-label">HT</span> {heightStr}</span>
            <span><span className="crt-card-vitals-label">WT</span> {weightStr}</span>
          </div>
          <button
            type="button"
            className="crt-compare-btn"
            onClick={() => setCompareOpen((v) => !v)}
            aria-pressed={compareOpen}
          >
            ⇄ {compareOpen ? 'CLOSE COMPARE' : 'COMPARE'}
          </button>
        </div>
      </div>

      {compareOpen && speciesPool && speciesPool.length > 0 && (
        <ComparePanel
          base={pokemon}
          species={speciesPool}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {dedupedEntries.length > 0 && (
        <Section label="▶ POKéDEX ENTRIES" count={dedupedEntries.length} defaultOpen={false}>
          <div className="crt-pokedex-entries">
            {dedupedEntries.map((entry, i) => (
              <div key={i} className="crt-pokedex-entry-item">
                <div className="crt-pokedex-versions">
                  {entry.versions
                    .map((v) => v.toUpperCase().replace(/-/g, '/'))
                    .join(' · ')}
                </div>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

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
