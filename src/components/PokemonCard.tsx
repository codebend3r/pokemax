import { useEffect, useRef, useState } from 'react';
import type {
  EvolutionChainResponse,
  Gen8Species,
  PokemonResponse,
  SpeciesResponse,
} from '@/types';
import { groupMoves } from '@/moves';
import { getGen } from '@/generations';
import { fetchPokemon } from '@/api';
import { CRY_VOLUME_SCALE, cleanFlavorText } from '@/textUtil';
import StatBar from '@/components/StatBar';
import AbilityList from '@/components/AbilityList';
import EvolutionChain from '@/components/EvolutionChain';
import MoveList from '@/components/MoveList';
import ShinyToggle from '@/components/ShinyToggle';
import SpriteToggle, { type SpriteView } from '@/components/SpriteToggle';
import FormSwitcher from '@/components/FormSwitcher';
import Section from '@/components/Section';
import ComparePanel from '@/components/ComparePanel';
import CompetitiveBuild from '@/components/CompetitiveBuild';
import Detail from '@/components/Detail';
import { useCompetitiveSet } from '@/hooks/useCompetitiveSet';
import { TYPE_COLORS, TYPES, type PokeType } from '@/typeChart';
import { varietyFromForm, formFromVariety } from '@/routes';

interface Props {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
  shiny: boolean;
  onShinyChange: (v: boolean) => void;
  view: SpriteView;
  onViewChange: (view: SpriteView) => void;
  /** `base` or a variety-slug suffix (`mega-x`, `gmax`, `alola`, etc.). */
  form: string;
  onFormChange: (form: string) => void;
  onSelectEvolution?: (name: string) => void;
  /** Navigates back to the Pokédex grid. */
  onBack?: () => void;
  gen: number;
  cryAudioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  cryVolume?: number;
  onCryVolumeChange?: (v: number) => void;
  /** Pool of species the compare picker can choose from */
  speciesPool?: Gen8Species[];
}

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
const BW_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated';
const SHOWDOWN_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';
const MAX_BW_ID = 649;

interface SpritePick {
  url: string;
  /** true when the rendered image is a real frame-animated GIF */
  animated: boolean;
}

/** Variety suffixes whose Showdown sprite is a 3D-style render, not pixel-art animation. */
const NO_PIXEL_2D_SUFFIXES = ['-gmax', '-eternamax'];

/** A pokemon has a pixel-art animated 2D sprite UNLESS its variety is render-only. */
function hasPixelArt2D(name: string): boolean {
  return !NO_PIXEL_2D_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

function pickSprite(
  p: PokemonResponse,
  shiny: boolean,
  view: SpriteView,
  fallbackLevel: number,
): SpritePick {
  if (view === '2d') {
    if (fallbackLevel === 0) {
      // Gen 1-5 base species: BW animated pixel art — iconic 2D experience.
      if (p.id <= MAX_BW_ID) {
        const url = shiny ? `${BW_BASE}/shiny/${p.id}.gif` : `${BW_BASE}/${p.id}.gif`;
        return { url, animated: true };
      }
      // Everything else: Showdown animated GIF (pixel art for base species and
      // most forms — cosplay Pikachu, Mega evolutions, Alolan / Galarian /
      // Hisuian / Paldean forms). Gigantamax + Eternamax are excluded
      // upstream via `hasPixelArt2D`, so we never reach this code path for
      // those varieties in 2D mode.
      const url = shiny ? `${SHOWDOWN_BASE}/shiny/${p.id}.gif` : `${SHOWDOWN_BASE}/${p.id}.gif`;
      return { url, animated: true };
    }
    if (fallbackLevel === 1) {
      // Tier-1 fallback for the pixel chain: high-res official artwork
      const art = p.sprites.other['official-artwork'];
      const url = shiny ? art.front_shiny : art.front_default;
      if (url) return { url, animated: false };
    }
    return {
      url: shiny
        ? (p.sprites.front_shiny ?? p.sprites.front_default ?? '')
        : (p.sprites.front_default ?? ''),
      animated: false,
    };
  }
  // 3D = Pokémon HOME render. Smooth modeled artwork — distinctly NOT pixel art.
  // Falls back to official artwork for the handful of varieties without HOME.
  if (fallbackLevel === 0) {
    const home = p.sprites.other.home;
    const url = home ? (shiny ? home.front_shiny : home.front_default) : null;
    if (url) return { url, animated: false };
  }
  const art = p.sprites.other['official-artwork'];
  return {
    url: shiny
      ? (art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? '')
      : (art.front_default ?? p.sprites.front_default ?? ''),
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
  expectedVariety,
}: {
  pokemon: PokemonResponse;
  shiny: boolean;
  view: SpriteView;
  preloadedAudio: React.MutableRefObject<HTMLAudioElement | null>;
  cryVolume: number;
  onCryVolumeChange?: (v: number) => void;
  /** The variety the URL says should be displayed. We're mid-transition when
   * `pokemon.name !== expectedVariety`; auto-play should sit out those frames
   * to avoid playing the base cry over a Mega/Gmax/regional pre-warm. */
  expectedVariety: string;
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
  // the grid cell, so this should fire near-instantly. When switching to an
  // alternate form whose `cries` URL differs from the preloaded source (e.g. a
  // form with its own unique cry), swap the cached audio to the form's cry.
  useEffect(() => {
    // Stay silent while React is still resolving the form. Without this, the
    // base species's cry plays during the brief window between URL canonicalize
    // and the variety fetch landing — and clobbers the pre-warmed Mega/Gmax/
    // regional audio with a fresh base-cry `Audio()` instance.
    if (pokemon.name !== expectedVariety) return;
    const a = preloadedAudio.current;
    if (a && a.src && (!cryUrl || a.src === cryUrl)) {
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
  }, [pokemon.id, pokemon.name, cryUrl, expectedVariety]);

  const playCry = () => {
    const a = preloadedAudio.current;
    if (a && a.src && (!cryUrl || a.src === cryUrl)) {
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
      delay: Math.random() * 180, // staggered launch
      rotate: (Math.random() - 0.5) * 120,
    }));
    setParticles((p) => [...p, ...newParticles]);
    window.setTimeout(() => setReacting(false), 720);
    window.setTimeout(() => {
      setParticles((p) => p.filter((x) => !newParticles.includes(x)));
    }, 1300);
  };

  const className =
    'crt-sprite-' +
    view +
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
  view,
  onViewChange,
  form,
  onFormChange,
  onSelectEvolution,
  onBack,
  gen,
  cryAudioRef,
  cryVolume = 0.25,
  onCryVolumeChange,
  speciesPool,
}: Props) {
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeVariety, setActiveVariety] = useState<string>(() =>
    varietyFromForm(species.name, form),
  );
  const [varietyData, setVarietyData] = useState<PokemonResponse | null>(null);
  const localCryRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = cryAudioRef ?? localCryRef;

  // On species (route) change, snap the active variety to whatever the URL says.
  useEffect(() => {
    setActiveVariety(varietyFromForm(species.name, form));
    setVarietyData(null);
  }, [species.name, form]);

  // Fetch alternate variety data when user picks a different form
  useEffect(() => {
    if (activeVariety === defaultPokemon.name) {
      setVarietyData(null);
      return;
    }
    let active = true;
    fetchPokemon(activeVariety)
      .then((p) => {
        if (active) setVarietyData(p);
      })
      .catch(() => {
        /* leave defaults */
      });
    return () => {
      active = false;
    };
  }, [activeVariety, defaultPokemon.name]);

  const pokemon = varietyData ?? defaultPokemon;
  // Cosmetic variants (Gigantamax / Mega / regional) often ship empty `moves`
  // arrays from PokeAPI — they inherit the base species's learnset. Fall back
  // so the MOVES section isn't blank when viewing those forms.
  const movesPokemon = pokemon.moves.length > 0 ? pokemon : defaultPokemon;
  // 2D mode needs a true pixel-art animated GIF. Gen 1-5 base species always
  // have one (BW animated, indexed by id). Gigantamax / Eternamax forms ship
  // 3D-style renders even on the Showdown mirror, so we exclude them by name.
  // Everything else: probe the Showdown URL — newer additions like Terapagos
  // (id 1024) and a handful of other entries 404 there, and we hide the toggle
  // for those rather than offer a static-only "2D" experience.
  const namePermits2D = hasPixelArt2D(pokemon.name);
  const [showdownExists, setShowdownExists] = useState(true);
  useEffect(() => {
    if (!namePermits2D || pokemon.id <= MAX_BW_ID) {
      setShowdownExists(true);
      return;
    }
    setShowdownExists(true);
    const probe = new Image();
    let cancelled = false;
    probe.onload = () => {
      if (!cancelled) setShowdownExists(true);
    };
    probe.onerror = () => {
      if (!cancelled) setShowdownExists(false);
    };
    probe.src = `${SHOWDOWN_BASE}/${pokemon.id}.gif`;
    return () => {
      cancelled = true;
    };
  }, [pokemon.id, namePermits2D]);
  const has2D = namePermits2D && showdownExists;
  useEffect(() => {
    if (!has2D && view === '2d') onViewChange('3d');
  }, [has2D, view, onViewChange]);
  const meta = getGen(gen);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => STAT_ORDER.indexOf(a.stat.name) - STAT_ORDER.indexOf(b.stat.name),
  );
  const moveCount = Object.values(groupMoves(movesPokemon.moves, meta.primaryVersionGroup)).reduce(
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
      {onBack && (
        <button type="button" className="crt-card-back" onClick={onBack}>
          ← BACK TO POKéDEX
        </button>
      )}
      <div className="crt-card-top">
        <div className="crt-card-art">
          <CardSprite
            pokemon={pokemon}
            shiny={shiny}
            view={view}
            preloadedAudio={audioRef}
            cryVolume={cryVolume}
            onCryVolumeChange={onCryVolumeChange}
            expectedVariety={activeVariety}
          />
          <SpriteToggle value={view} onChange={onViewChange} has2D={has2D} />
          <ShinyToggle value={shiny} onChange={onShinyChange} />
        </div>
        <div className="crt-card-meta">
          <div className="crt-card-dex">#{String(pokemon.id).padStart(3, '0')}</div>
          <div className="crt-card-name">{pokemon.name.toUpperCase()}</div>
          <div className="crt-card-gen">
            GEN {meta.roman} · {meta.region.toUpperCase()}
            {genus ? ` · ${genus.toUpperCase()}` : ''}
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
            <span>
              <span className="crt-card-vitals-label">HT</span> {heightStr}
            </span>
            <span>
              <span className="crt-card-vitals-label">WT</span> {weightStr}
            </span>
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

      <FormSwitcher
        varieties={species.varieties}
        speciesName={species.name}
        active={activeVariety}
        onChange={(varietyName) => {
          setActiveVariety(varietyName);
          onFormChange(formFromVariety(species.name, varietyName));
          // Pre-warm + play the new variety's cry synchronously inside this
          // user-gesture handler. The variety data fetch is async — by the
          // time `CardSprite`'s auto-play effect would run, browsers no
          // longer count the click as a user gesture and `play()` rejects.
          const v = species.varieties.find((x) => x.pokemon.name === varietyName);
          const idMatch = v?.pokemon.url.match(/\/pokemon\/(\d+)\/?$/);
          if (idMatch) {
            const id = parseInt(idMatch[1], 10);
            const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = '';
            }
            const audio = new Audio(cryUrl);
            audio.volume = cryVolume * CRY_VOLUME_SCALE;
            audio.play().catch(() => {});
            audioRef.current = audio;
          }
        }}
      />

      {compareOpen && speciesPool && speciesPool.length > 0 && (
        <ComparePanel base={pokemon} species={speciesPool} onClose={() => setCompareOpen(false)} />
      )}

      {dedupedEntries.length > 0 && (
        <Section label="POKéDEX ENTRIES" count={dedupedEntries.length} defaultOpen={false}>
          <div className="crt-pokedex-entries">
            {dedupedEntries.map((entry, i) => (
              <div key={i} className="crt-pokedex-entry-item">
                <div className="crt-pokedex-versions">
                  {entry.versions.map((v) => v.toUpperCase().replace(/-/g, '/')).join(' · ')}
                </div>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section label="BASE STATS">
        {sortedStats.map((s) => (
          <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
        ))}
      </Section>

      <Section label="ABILITIES">
        <AbilityList abilities={pokemon.abilities} />
      </Section>

      <Section label="EVOLUTION">
        <EvolutionChain chain={chain.chain} active={pokemon.name} onSelect={onSelectEvolution} />
      </Section>

      <Section label={`MOVES (${movesLabel})`} count={moveCount}>
        <MoveList moves={movesPokemon.moves} versionGroup={meta.primaryVersionGroup} />
      </Section>

      <Section
        label="COMPETITIVE BUILD"
        count={
          competitive.build
            ? `GEN ${competitive.build.sourceGen ?? '?'} · ${competitive.build.tier.toUpperCase()}`
            : undefined
        }
      >
        <CompetitiveBuild
          build={competitive.build}
          loading={competitive.loading}
          error={competitive.error}
          pokemon={pokemon}
        />
      </Section>
    </div>
  );
}
