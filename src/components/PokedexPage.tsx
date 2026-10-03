import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { dataOf, useAsync } from '@/async';
import FormFilter from '@/components/FormFilter';
import GenFilter from '@/components/GenFilter';
import LoadingCard from '@/components/LoadingCard';
import PokemonGrid from '@/components/PokemonGrid';
import SearchBar from '@/components/SearchBar';
import StatusLine from '@/components/StatusLine';
import { filterDex, formIndex, resolveDexRoute, speciesIndex, typeIndex } from '@/dex';
import type { GameId } from '@/games';
import { usePageSize } from '@/hooks/usePageSize';
import { usePokemonView } from '@/hooks/usePokemonView';
import { useToggleSet } from '@/hooks/useToggleSet';
import { useViewMode } from '@/hooks/useViewMode';
import { parsePokedexSearch, pokedexPath, type PokedexSearch } from '@/routes';
import type { PokeType } from '@/typeChart';
import type { AltForm, BaseSpecies, DexEntry, FormCategory } from '@/types';
import { titleCase } from '@/textUtil';

const PokemonCard = lazy(() => import('@/components/PokemonCard'));

const NO_SPECIES: BaseSpecies[] = [];
const NO_FORMS: AltForm[] = [];

interface Props {
  /** The `/pokedex/:name` slug, lowercased; `null` on the bare grid. */
  name: string | null;
  query: string;
  onQueryChange: (q: string) => void;
  /** The pick that opened the current card — a fresh object per pick. */
  pick: { buildGame: GameId | null } | null;
  onSelect: (name: string) => void;
  onHome: () => void;
  cryVolume: number;
  onCryVolumeChange: (v: number) => void;
}

export default function PokedexPage({
  name,
  query,
  onQueryChange,
  pick,
  onSelect,
  onHome,
  cryVolume,
  onCryVolumeChange,
}: Props) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const pokedexSearch = useMemo(() => parsePokedexSearch(search), [search]);
  const { view, toggle: toggleView } = useViewMode();
  const { pageSize, setPageSize } = usePageSize();

  const gens = useToggleSet<number>();
  const types = useToggleSet<PokeType>();
  const formCategories = useToggleSet<FormCategory>();
  // The 18-endpoint type index loads on the first type-chip click, then stays.
  const [typeIndexWanted, setTypeIndexWanted] = useState(false);

  const speciesState = useAsync(speciesIndex, true, undefined);
  const species = dataOf(speciesState) ?? NO_SPECIES;
  const names = useMemo(() => species.map((s) => s.name), [species]);
  const formState = useAsync(formIndex, formCategories.set.size > 0, undefined);
  const forms = dataOf(formState) ?? NO_FORMS;
  const typeMap = dataOf(useAsync(typeIndex, typeIndexWanted, undefined));
  const allEntries = useMemo((): DexEntry[] => [...species, ...forms], [species, forms]);
  const gridEntries = useMemo(
    () => filterDex(species, forms, formCategories.set, gens.set),
    [species, forms, formCategories.set, gens.set],
  );

  const route = useMemo(
    () => resolveDexRoute(name, pokedexSearch.form, species),
    [name, pokedexSearch.form, species],
  );
  const result = usePokemonView(route);
  const card = result.status === 'ready' ? result.data : null;
  // Keyed on the species, not `card`: a form switch must not re-scroll or retitle.
  const shownSpecies = card?.species ?? null;
  const shownName = card?.base.name ?? null;

  const updateSearch = (patch: Partial<PokedexSearch>) => {
    if (!card) return;
    navigate(pokedexPath(card.species.name, { ...pokedexSearch, ...patch }), { replace: true });
  };

  // Canonicalize alt-form path slugs to base-species + ?form=<suffix>.
  // `/pokedex/charizard-mega-x` → `/pokedex/charizard?form=mega-x`
  useEffect(() => {
    if (route.status === 'found' && !route.canonical) {
      navigate(pokedexPath(route.species, { ...pokedexSearch, form: route.form }), {
        replace: true,
      });
    }
  }, [route, pokedexSearch, navigate]);

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // A TEAMS pick scrolls to the competitive-build section instead (`CompetitiveSection`).
    if (shownSpecies && cardRef.current && !pick?.buildGame) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [shownSpecies, pick]);

  // Keep document.title in sync with the selected Pokemon. URL is owned by the router.
  useEffect(() => {
    const base = 'Pokemax';
    if (shownName) {
      document.title = `${base} | ${titleCase(shownName)}`;
    } else {
      document.title = base;
    }
  }, [shownName]);

  const handleSubmit = (typed: string) => {
    const q = typed.trim().toLowerCase();
    if (!q) return;
    if (names.includes(q)) {
      onSelect(q);
      return;
    }
    const visible = gridEntries.filter((s) => s.name.includes(q));
    if (visible.length > 0) onSelect(visible[0].name);
  };

  let status: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex' = 'ready';
  if (speciesState.status === 'loading') status = 'loading-dex';
  else if (speciesState.status === 'error') status = 'err-api';
  else if (result.status === 'loading') status = 'scanning';
  else if (result.status === 'not-found') status = 'err-not-found';
  else if (result.status === 'error') status = 'err-api';

  return (
    <>
      <StatusLine state={status} />
      <SearchBar
        value={query}
        onValueChange={onQueryChange}
        onSearch={handleSubmit}
        disabled={speciesState.status === 'loading'}
      />

      {speciesState.status === 'error' && (
        <div className="crt-error">
          ERR: COULD NOT LOAD POKéDEX INDEX
          <button type="button" onClick={() => window.location.reload()}>
            [ reload ]
          </button>
        </div>
      )}

      {result.status === 'not-found' && <div className="crt-error">ERR: "{name}" NOT FOUND</div>}

      {result.status === 'error' && (
        <div className="crt-error">
          ERR: TRANSMISSION LOST
          <button type="button" onClick={result.retry}>
            [ retry ]
          </button>
        </div>
      )}

      {card && (
        <div ref={cardRef}>
          <Suspense fallback={<LoadingCard what="CARD" />}>
            <PokemonCard
              pokemon={card.pokemon}
              base={card.base}
              species={card.species}
              chain={card.chain}
              shiny={pokedexSearch.variant === 'shiny'}
              onShinyChange={(shiny) => updateSearch({ variant: shiny ? 'shiny' : 'normal' })}
              view={pokedexSearch.dimension}
              onViewChange={(dimension) => updateSearch({ dimension })}
              form={route.status === 'found' ? route.form : 'base'}
              onFormChange={(form) => updateSearch({ form })}
              onSelectEvolution={onSelect}
              onBack={onHome}
              cryVolume={cryVolume}
              onCryVolumeChange={onCryVolumeChange}
              speciesPool={allEntries}
              pick={pick}
            />
          </Suspense>
        </div>
      )}

      <GenFilter selected={gens.set} onToggle={gens.toggle} onClear={gens.clear} />

      <FormFilter
        active={formCategories.set}
        forms={forms}
        loading={formState.status === 'loading'}
        onToggle={formCategories.toggle}
        onClear={formCategories.clear}
      />

      <PokemonGrid
        species={gridEntries}
        query={query}
        selected={name}
        onSelect={onSelect}
        view={view}
        onToggleView={toggleView}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        typeIndex={typeMap}
        selectedTypes={types.set}
        onToggleType={(t) => {
          setTypeIndexWanted(true);
          types.toggle(t);
        }}
        onClearTypes={types.clear}
      />
    </>
  );
}
