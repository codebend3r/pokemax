import { useEffect, useRef, useState } from 'react';
import type { EvolutionChainResponse, DexEntry, PokemonResponse, SpeciesResponse } from '@/types';
import { groupMoves } from '@/moves';
import { getGen } from '@/generations';
import { idFromUrl } from '@/api';
import StatBar from '@/components/StatBar';
import AbilityList from '@/components/AbilityList';
import CardArt from '@/components/CardArt';
import EvolutionChain from '@/components/EvolutionChain';
import MoveList from '@/components/MoveList';
import FormSwitcher from '@/components/FormSwitcher';
import Section from '@/components/Section';
import ComparePanel from '@/components/ComparePanel';
import CompetitiveSection from '@/components/CompetitiveSection';
import Detail from '@/components/Detail';
import ObtainMethods from '@/components/ObtainMethods';
import PokedexEntries from '@/components/PokedexEntries';
import { useAsync } from '@/async';
import { obtainFiles } from '@/obtain/files';
import type { GameId } from '@/games';
import { tintStyle, typeColor } from '@/typeChart';
import { varietyFromForm, formFromVariety, type Dimension } from '@/routes';
import { STAT_ORDER } from '@/stats';
import { formatHeight, formatWeight } from '@/units';
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
  const compareButtonRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
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

  // A fresh pick moves focus to the card the page scrolls to, so keyboard and
  // screen-reader users land on it too. Someone typing in the search box keeps
  // their place, and a TEAMS pick lands on its build (`CompetitiveSection`).
  useEffect(() => {
    if (pick?.buildGame || document.activeElement instanceof HTMLInputElement) return;
    nameRef.current?.focus({ preventScroll: true });
  }, [species.name, pick]);

  const closeCompare = () => {
    setCompareOpen(false);
    // The panel's close button unmounts with it; hand focus back to the toggle.
    compareButtonRef.current?.focus();
  };

  // Cosmetic variants (Gigantamax / Mega / regional) often ship empty `moves`
  // arrays from PokeAPI — they inherit the base species's learnset. Fall back
  // so the MOVES section isn't blank when viewing those forms.
  const movesPokemon = pokemon.moves.length > 0 ? pokemon : base;
  const gen = idFromUrl(species.generation.url);
  const meta = getGen(gen);
  const statRank = (name: string) => STAT_ORDER.findIndex((s) => s === name);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => statRank(a.stat.name) - statRank(b.stat.name),
  );
  const moveCount = Object.values(groupMoves(movesPokemon.moves, meta.primaryVersionGroup)).reduce(
    (n, g) => n + g.length,
    0,
  );
  const [obtainOpen, setObtainOpen] = useState(false);
  const obtain = useAsync(obtainFiles, obtainOpen, pokemon.id);

  const movesLabel = meta.primaryVersionGroup.toUpperCase().replace(/-/g, '/');

  // Genus ("Mouse Pokémon", "Lizard Pokémon", etc.)
  const genus = species.genera.find((g) => g.language.name === 'en')?.genus ?? '';

  const handleVarietyChange = (varietyName: string) => {
    onFormChange(varietyName === base.name ? 'base' : formFromVariety(species.name, varietyName));
    // Play the new variety's cry synchronously inside this user-gesture
    // handler. Its data loads async — by the time it lands, browsers no
    // longer count the click as a gesture and `play()` can reject.
    const v = species.varieties.find((x) => x.pokemon.name === varietyName);
    const id = v ? idFromUrl(v.pokemon.url) : 0;
    if (id) playCry(varietyName, cryUrlById(varietyName, id));
  };

  return (
    <div className="crt-card">
      {onBack && (
        <button type="button" className="crt-card-back" onClick={onBack}>
          <span aria-hidden="true">←</span> BACK TO POKéDEX
        </button>
      )}
      <div className="crt-card-top">
        <CardArt
          pokemon={pokemon}
          shiny={shiny}
          onShinyChange={onShinyChange}
          view={view}
          onViewChange={onViewChange}
          cryVolume={cryVolume}
          onCryVolumeChange={onCryVolumeChange}
        />
        <div className="crt-card-meta">
          <div className="crt-card-dex">#{String(pokemon.id).padStart(3, '0')}</div>
          <h1 ref={nameRef} className="crt-card-name" tabIndex={-1}>
            {pokemon.name.toUpperCase()}
          </h1>
          <div className="crt-card-gen">
            GEN {meta.roman} · {meta.region.toUpperCase()}
            {genus ? ` · ${genus.toUpperCase()}` : ''}
          </div>
          <div className="crt-types">
            {pokemon.types.map((t) => (
              <Detail
                key={t.type.name}
                kind="type"
                name={t.type.name}
                label={t.type.name}
                triggerClassName="crt-type"
                triggerStyle={tintStyle(typeColor(t.type.name))}
              />
            ))}
          </div>
          <div className="crt-card-vitals">
            <span>
              <span className="crt-card-vitals-label">HT</span> {formatHeight(pokemon.height)}
            </span>
            <span>
              <span className="crt-card-vitals-label">WT</span> {formatWeight(pokemon.weight)}
            </span>
          </div>
          <button
            ref={compareButtonRef}
            type="button"
            className="crt-compare-btn"
            onClick={() => setCompareOpen((v) => !v)}
            aria-pressed={compareOpen}
          >
            <span aria-hidden="true">⇄</span> {compareOpen ? 'CLOSE COMPARE' : 'COMPARE'}
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
        <ComparePanel base={pokemon} species={speciesPool} onClose={closeCompare} />
      )}

      <PokedexEntries species={species} />

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

      <CompetitiveSection pokemon={pokemon} gen={gen} pick={pick} />
    </div>
  );
}
