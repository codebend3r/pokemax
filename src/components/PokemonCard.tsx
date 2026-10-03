import { useEffect, useRef, useState } from 'react';
import type { EvolutionChainResponse, DexEntry, PokemonResponse, SpeciesResponse } from '@/types';
import { groupMoves } from '@/moves';
import { getGen } from '@/generations';
import { idFromUrl } from '@/api';
import { cleanFlavorText } from '@/textUtil';
import StatBar from '@/components/StatBar';
import AbilityList from '@/components/AbilityList';
import EvolutionChain from '@/components/EvolutionChain';
import MoveList from '@/components/MoveList';
import ShinyToggle from '@/components/ShinyToggle';
import SpriteToggle from '@/components/SpriteToggle';
import FormSwitcher from '@/components/FormSwitcher';
import Section from '@/components/Section';
import ComparePanel from '@/components/ComparePanel';
import CompetitiveBuild from '@/components/CompetitiveBuild';
import Detail from '@/components/Detail';
import ObtainMethods from '@/components/ObtainMethods';
import { useAsync } from '@/async';
import { useCompetitiveSet } from '@/hooks/useCompetitiveSet';
import { obtainFiles } from '@/obtain/files';
import { GAMES, GAME_ORDER, type GameId } from '@/games';
import { TYPE_COLORS, TYPES, type PokeType } from '@/typeChart';
import { varietyFromForm, formFromVariety, type Dimension } from '@/routes';
import { cardSprites } from '@/sprites';
import { useAnyLoads, useFallbackSrc } from '@/hooks/useFallbackSrc';
import { cryUrlById, cryUrlOf, playCry } from '@/cry';

interface Props {
  /** The variety on screen. */
  pokemon: PokemonResponse;
  /** The species' default variety. */
  base: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
  shiny: boolean;
  onShinyChange: (v: boolean) => void;
  view: Dimension;
  onViewChange: (view: Dimension) => void;
  /** `base` or a variety-slug suffix (`mega-x`, `gmax`, `alola`, etc.). */
  form: string;
  onFormChange: (form: string) => void;
  onSelectEvolution?: (name: string) => void;
  /** Navigates back to the Pokédex grid. */
  onBack?: () => void;
  cryVolume?: number;
  onCryVolumeChange?: (v: number) => void;
  /** Pool of species the compare picker can choose from */
  speciesPool?: DexEntry[];
  /**
   * The pick that opened the card — a fresh object per pick. A `buildGame`
   * (TEAMS / trainer picks) preselects that game's build and scrolls to it.
   */
  pick?: { buildGame: GameId | null } | null;
}

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
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
  cryVolume,
  onCryVolumeChange,
}: {
  pokemon: PokemonResponse;
  shiny: boolean;
  view: Dimension;
  cryVolume: number;
  onCryVolumeChange?: (v: number) => void;
}) {
  const [reacting, setReacting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const candidates = cardSprites(pokemon, shiny, view);
  const { src, next } = useFallbackSrc(candidates.map((c) => c.url));
  // Past the last candidate, keep showing it rather than an empty frame.
  const sprite = candidates.find((c) => c.url === src) ?? candidates[candidates.length - 1];
  const cryUrl = cryUrlOf(pokemon);
  const replayCry = () => {
    if (cryUrl) playCry(pokemon.name, cryUrl);
  };

  const handleSpriteClick = () => {
    replayCry();
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
        key={sprite.url}
        className={className}
        src={sprite.url}
        alt={pokemon.name}
        onClick={handleSpriteClick}
        onError={next}
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
            onClick={replayCry}
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
  pokemon,
  base,
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
  cryVolume = 0.25,
  onCryVolumeChange,
  speciesPool,
  pick,
}: Props) {
  const [compareOpen, setCompareOpen] = useState(false);
  // The variety the URL names — `pokemon` until that variety's data lands.
  const activeVariety = form === 'base' ? base.name : varietyFromForm(species.name, form);

  // Auto-play once per species shown — and again on every fresh pick — after
  // the URL's variety has loaded. A form switch plays from its own click, so
  // the form's data landing must not play it a second time.
  const autoplayed = useRef<{ species: string; pick: Props['pick'] } | null>(null);
  useEffect(() => {
    if (pokemon.name !== activeVariety) return;
    const last = autoplayed.current;
    if (last && last.species === species.name && last.pick === pick) return;
    autoplayed.current = { species: species.name, pick };
    const url = cryUrlOf(pokemon);
    if (url) playCry(pokemon.name, url);
  }, [pokemon, activeVariety, species.name, pick]);

  // Cosmetic variants (Gigantamax / Mega / regional) often ship empty `moves`
  // arrays from PokeAPI — they inherit the base species's learnset. Fall back
  // so the MOVES section isn't blank when viewing those forms.
  const movesPokemon = pokemon.moves.length > 0 ? pokemon : base;
  // 2D shows only frame-animated pixel art. When none of the 2D candidates
  // loads, hide the 2D toggle and force 3D — 3D always has something.
  const has2D = useAnyLoads(cardSprites(pokemon, false, '2d').map((c) => c.url));
  useEffect(() => {
    if (!has2D && view === '2d') onViewChange('3d');
  }, [has2D, view, onViewChange]);
  const gen = idFromUrl(species.generation.url);
  const meta = getGen(gen);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => STAT_ORDER.indexOf(a.stat.name) - STAT_ORDER.indexOf(b.stat.name),
  );
  const moveCount = Object.values(groupMoves(movesPokemon.moves, meta.primaryVersionGroup)).reduce(
    (n, g) => n + g.length,
    0,
  );
  // Games this Pokémon can appear in — everything from its home gen onward.
  const buildGames = GAME_ORDER.filter((g) => GAMES[g].gen >= gen);
  const [buildGame, setBuildGame] = useState<GameId | null>(pick?.buildGame ?? null);
  const [obtainOpen, setObtainOpen] = useState(false);
  const obtain = useAsync(obtainFiles, obtainOpen, pokemon.id);
  const buildSectionRef = useRef<HTMLDivElement | null>(null);
  const [prevBuildTarget, setPrevBuildTarget] = useState({ name: pokemon.name, pick });
  if (prevBuildTarget.name !== pokemon.name || prevBuildTarget.pick !== pick) {
    setPrevBuildTarget({ name: pokemon.name, pick });
    setBuildGame(pick?.buildGame ?? null);
  }
  useEffect(() => {
    // Arriving from a TEAMS pick — jump straight to the build for that game.
    if (pick?.buildGame) {
      buildSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pokemon.name, pick]);
  const competitive = useCompetitiveSet(pokemon.name, buildGame ? GAMES[buildGame].gen : null);

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

  const handleVarietyChange = (varietyName: string) => {
    onFormChange(varietyName === base.name ? 'base' : formFromVariety(species.name, varietyName));
    // Pre-warm + play the new variety's cry synchronously inside this
    // user-gesture handler. The variety data fetch is async — by the
    // time `CardSprite`'s auto-play effect would run, browsers no
    // longer count the click as a user gesture and `play()` rejects.
    const v = species.varieties.find((x) => x.pokemon.name === varietyName);
    const id = v ? idFromUrl(v.pokemon.url) : 0;
    if (id) playCry(varietyName, cryUrlById(varietyName, id));
  };

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
            cryVolume={cryVolume}
            onCryVolumeChange={onCryVolumeChange}
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
        onChange={handleVarietyChange}
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

      <Section
        label="HOW TO OBTAIN"
        count={obtain.status === 'ready' ? obtain.data.games.length : undefined}
        defaultOpen={false}
        onToggle={setObtainOpen}
      >
        <ObtainMethods key={pokemon.id} state={obtain} currentGen={gen} />
      </Section>

      <Section label={`MOVES (${movesLabel})`} count={moveCount}>
        <MoveList moves={movesPokemon.moves} versionGroup={meta.primaryVersionGroup} />
      </Section>

      <div ref={buildSectionRef}>
        <Section
          label="COMPETITIVE BUILD"
          count={
            competitive.status === 'ready' && competitive.data
              ? `GEN ${competitive.data.sourceGen} · ${competitive.data.tier.toUpperCase()}`
              : undefined
          }
        >
          <CompetitiveBuild
            state={competitive}
            pokemon={pokemon}
            games={buildGames}
            selectedGame={buildGame}
            onSelectGame={setBuildGame}
          />
        </Section>
      </div>
    </div>
  );
}
