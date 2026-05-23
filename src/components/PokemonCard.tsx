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
import { pokeapiToShowdownSlug } from '@/showdownSprite';
import { cryOverrideFor } from '@/cryOverrides';
import { playGmaxCryWithEffects } from '@/gmaxAudio';

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
// Frame-animated fan sprites in 5th-gen BW pixel-art style, mirrored by
// Pokémon Showdown. `ani/` is the main Smogon Sprite Project set; `gen5ani/`
// is an older alternate set that covers some newer DLC/legendary additions
// (e.g. Terapagos, Miraidon) that `ani/` doesn't have yet.
const SD_ANI = 'https://play.pokemonshowdown.com/sprites/ani';
const SD_ANI_SHINY = 'https://play.pokemonshowdown.com/sprites/ani-shiny';
const SD_GEN5_ANI = 'https://play.pokemonshowdown.com/sprites/gen5ani';
const SD_GEN5_ANI_SHINY = 'https://play.pokemonshowdown.com/sprites/gen5ani-shiny';
const MAX_BW_ID = 649;

function isGmaxVariety(name: string): boolean {
  return /-(g|eterna)max$/.test(name);
}

/**
 * Plays a Pokémon cry.
 * - Non-Gmax: direct `<audio>` play.
 * - Gmax with override (every Gmax form has one): the override clip already
 *   contains the Dynamax jingle + per-form cry baked together — play as-is.
 * - Gmax without override (fallback only): route through
 *   `playGmaxCryWithEffects` for the Web Audio pitch/reverb/bass chain.
 */
function playCryWithIntro(
  cryAudio: HTMLAudioElement,
  pokemonName: string,
  volume: number,
): void {
  const playDirect = () => {
    cryAudio.currentTime = 0;
    cryAudio.volume = volume * CRY_VOLUME_SCALE;
    cryAudio.play().catch(() => {});
  };
  if (!isGmaxVariety(pokemonName) || cryOverrideFor(pokemonName) !== null) {
    playDirect();
    return;
  }
  if (cryAudio.src) {
    playGmaxCryWithEffects(cryAudio.src, volume * CRY_VOLUME_SCALE).then((ok) => {
      if (!ok) playDirect();
    });
  } else {
    playDirect();
  }
}

interface SpritePick {
  url: string;
  /** true when the rendered image is a real frame-animated GIF */
  animated: boolean;
}

function pickSprite(
  p: PokemonResponse,
  shiny: boolean,
  view: SpriteView,
  fallbackLevel: number,
): SpritePick {
  const sdSlug = pokeapiToShowdownSlug(p.name);
  if (view === '2d') {
    // 2D shows ONLY frame-animated pixel art. All three tiers below are
    // animated GIFs; the parent probes them before rendering and hides the 2D
    // toggle entirely if none resolves, so there's no static fallback here.
    if (fallbackLevel === 0) {
      // Gen 1-5 base species: BW animated pixel art — iconic 2D experience.
      if (p.id <= MAX_BW_ID) {
        const url = shiny ? `${BW_BASE}/shiny/${p.id}.gif` : `${BW_BASE}/${p.id}.gif`;
        return { url, animated: true };
      }
      // Gen 6+ official: PokeAPI's Showdown mirror, indexed by id.
      const url = shiny ? `${SHOWDOWN_BASE}/shiny/${p.id}.gif` : `${SHOWDOWN_BASE}/${p.id}.gif`;
      return { url, animated: true };
    }
    if (fallbackLevel === 1) {
      // Smogon Sprite Project fan animation — covers most Gen 6-9 forms
      // including Gmax / Eternamax that the PokeAPI mirror is missing.
      const dir = shiny ? SD_ANI_SHINY : SD_ANI;
      return { url: `${dir}/${sdSlug}.gif`, animated: true };
    }
    // Showdown's older `gen5ani/` set — has fan animations for newer DLC
    // additions (Terapagos, Miraidon, Terapagos-Terastal) that the main
    // `ani/` directory hasn't picked up yet.
    const dir = shiny ? SD_GEN5_ANI_SHINY : SD_GEN5_ANI;
    return { url: `${dir}/${sdSlug}.gif`, animated: true };
  }
  // 3D mode: always a frame-animated Showdown GIF. For Gmax / Eternamax it's
  // a true 3D-render animation; for everything else it's pixel art that
  // animates. CSS scales the GIF smoothly (no `image-rendering: pixelated`)
  // so the upscale reads as a soft 3D-ish render rather than chunky pixels.
  if (fallbackLevel === 0) {
    const url = shiny ? `${SHOWDOWN_BASE}/shiny/${p.id}.gif` : `${SHOWDOWN_BASE}/${p.id}.gif`;
    return { url, animated: true };
  }
  if (fallbackLevel === 1) {
    // PokeAPI mirror missing — try Showdown's direct ani as another animated source.
    const dir = shiny ? SD_ANI_SHINY : SD_ANI;
    return { url: `${dir}/${sdSlug}.gif`, animated: true };
  }
  // Last resort — official artwork. Stays truly static (no CSS bob); should
  // only ever appear for the handful of forms with no animated source at all.
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
  const cryUrl =
    cryOverrideFor(pokemon.name) ?? pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null;

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
      playCryWithIntro(a, pokemon.name, cryVolume);
      return;
    }
    if (cryUrl) {
      const fallbackAudio = new Audio(cryUrl);
      preloadedAudio.current = fallbackAudio;
      playCryWithIntro(fallbackAudio, pokemon.name, cryVolume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon.id, pokemon.name, cryUrl, expectedVariety]);

  const playCry = () => {
    const a = preloadedAudio.current;
    if (a && a.src && (!cryUrl || a.src === cryUrl)) {
      playCryWithIntro(a, pokemon.name, cryVolume);
      return;
    }
    if (cryUrl) {
      const fresh = new Audio(cryUrl);
      preloadedAudio.current = fresh;
      playCryWithIntro(fresh, pokemon.name, cryVolume);
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
  // 2D shows only frame-animated pixel art. Gen 1-5 base species always have
  // a BW animation. For everything else, probe in priority order: PokeAPI's
  // Showdown mirror by id → Smogon's fan animation by slug. If neither URL
  // resolves, hide the 2D toggle and force the view to 3D. 3D always has
  // something — its static fallback gets a CSS bob, which 2D does not.
  const [has2D, setHas2D] = useState(true);
  useEffect(() => {
    if (pokemon.id <= MAX_BW_ID) {
      setHas2D(true);
      return;
    }
    let cancelled = false;
    setHas2D(true);
    const probe = (url: string) =>
      new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    (async () => {
      const slug = pokeapiToShowdownSlug(pokemon.name);
      const found =
        (await probe(`${SHOWDOWN_BASE}/${pokemon.id}.gif`)) ||
        (await probe(`${SD_ANI}/${slug}.gif`)) ||
        (await probe(`${SD_GEN5_ANI}/${slug}.gif`));
      if (!cancelled) setHas2D(found);
    })();
    return () => {
      cancelled = true;
    };
  }, [pokemon.id, pokemon.name]);
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
            const cryUrl =
              cryOverrideFor(varietyName) ??
              `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = '';
            }
            const audio = new Audio(cryUrl);
            audioRef.current = audio;
            playCryWithIntro(audio, varietyName, cryVolume);
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
