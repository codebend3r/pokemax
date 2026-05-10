import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import StatusLine from './components/StatusLine';
import PokemonGrid from './components/PokemonGrid';
import GenFilter from './components/GenFilter';
import ThemeToggle from './components/ThemeToggle';
import { useAllSpecies } from './hooks/useAllSpecies';
import { usePokemon } from './hooks/usePokemon';
import { useTypeIndex } from './hooks/useTypeIndex';
import { useTheme } from './hooks/useTheme';
import { useVolume } from './hooks/useVolume';
import { useExtraForms } from './hooks/useExtraForms';
import type { FormCategory } from './types';

const FORM_CATEGORIES: { key: FormCategory; label: string }[] = [
  { key: 'mega', label: 'MEGA / PRIMAL' },
  { key: 'gmax', label: 'GIGANTAMAX' },
  { key: 'regional', label: 'REGIONAL' },
  { key: 'other', label: 'BATTLE FORMS' },
];
import type { PokeType } from './typeChart';

// Lazy-loaded — only fetched when first needed
const PokemonCard = lazy(() => import('./components/PokemonCard'));
const MusicPlayer = lazy(() => import('./components/MusicPlayer'));

export default function App() {
  const list = useAllSpecies();
  const { theme, toggle: toggleTheme } = useTheme();
  const [cryVolume, setCryVolume] = useVolume('pokemax.cry.volume', 0.25);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedGens, setSelectedGens] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<PokeType>>(new Set());
  const [typeIndexEnabled, setTypeIndexEnabled] = useState(false);
  const typeIndex = useTypeIndex(typeIndexEnabled);
  const [activeFormCats, setActiveFormCats] = useState<Set<FormCategory>>(new Set());
  const extraForms = useExtraForms(list.species, activeFormCats.size > 0);
  const [shiny, setShiny] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const fullSpeciesIndex = useMemo(
    () => [...list.species, ...extraForms.forms],
    [list.species, extraForms.forms],
  );
  const result = usePokemon(selected, fullSpeciesIndex, attempt);
  const cardRef = useRef<HTMLDivElement>(null);
  const cryAudioRef = useRef<HTMLAudioElement | null>(null);

  // Combine base species with selected alternate-form categories, then apply gen filter
  const filteredSpecies = useMemo(() => {
    const filteredForms =
      activeFormCats.size > 0
        ? extraForms.forms.filter((f) => f.formCategory && activeFormCats.has(f.formCategory))
        : [];
    const merged = [...list.species, ...filteredForms];
    const sorted = merged.sort((a, b) => a.id - b.id);
    if (selectedGens.size === 0) return sorted;
    return sorted.filter((s) => selectedGens.has(s.gen));
  }, [list.species, extraForms.forms, selectedGens, activeFormCats]);

  const selectedEntry = selected ? fullSpeciesIndex.find((s) => s.name === selected) ?? null : null;
  const selectedGen = selectedEntry?.gen ?? 8;

  let status: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex' = 'ready';
  if (list.loading) status = 'loading-dex';
  else if (list.error) status = 'err-api';
  else if (result.loading) status = 'scanning';
  else if (result.error?.kind === 'not-in-gen-8') status = 'err-not-found';
  else if (result.error?.kind === 'transmission') status = 'err-api';

  useEffect(() => {
    if (result.data && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result.data]);

  const handleSelect = (name: string) => {
    setShiny(false);
    setSelected(name);
    setAttempt((n) => n + 1);
    setQuery('');

    // Pre-warm the cry audio while the pokemon data is still being fetched.
    // The cry URL is predictable from the species ID, so we don't need to wait.
    const sp = fullSpeciesIndex.find((s) => s.name === name);
    if (sp) {
      // For alt forms (id ≥ 10000), the cry endpoint usually only has the base species's cry
      const cryId = sp.id >= 10000 && sp.speciesName ? (list.species.find((b) => b.name === sp.speciesName)?.id ?? sp.id) : sp.id;
      const url = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${cryId}.ogg`;
      if (cryAudioRef.current) {
        cryAudioRef.current.pause();
        cryAudioRef.current.src = '';
      }
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = cryVolume;
      audio.load();
      cryAudioRef.current = audio;
    }
  };

  const goHome = () => {
    setSelected(null);
    setQuery('');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (typed: string) => {
    const q = typed.trim().toLowerCase();
    if (!q) return;
    if (list.names.includes(q)) {
      handleSelect(q);
      return;
    }
    const visible = filteredSpecies.filter((s) => s.name.includes(q));
    if (visible.length > 0) handleSelect(visible[0].name);
  };

  return (
    <div className="crt">
      <div className="crt-topbar">
        <button type="button" className="crt-header crt-header-link" onClick={goHome} aria-label="Go to top">
          ▶ POKEMAX
        </button>
        <div className="crt-topbar-controls">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
      <div className="crt-subheader">ALL POKéMON · GEN I — IX</div>
      <Suspense fallback={<div className="crt-music"><div className="crt-music-row"><span className="crt-music-track">♪ loading player…</span></div></div>}>
        <MusicPlayer />
      </Suspense>
      <StatusLine state={status} />
      <SearchBar
        names={list.names}
        value={query}
        onValueChange={setQuery}
        onSearch={handleSubmit}
        disabled={list.loading}
      />

      {list.error && (
        <div className="crt-error">
          ERR: COULD NOT LOAD POKéDEX INDEX
          <button type="button" onClick={() => window.location.reload()}>[ reload ]</button>
        </div>
      )}

      {result.error?.kind === 'not-in-gen-8' && (
        <div className="crt-error">ERR: "{selected}" NOT FOUND</div>
      )}

      {result.error?.kind === 'transmission' && (
        <div className="crt-error">
          ERR: TRANSMISSION LOST
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>[ retry ]</button>
        </div>
      )}

      {result.data && (
        <div ref={cardRef}>
          <Suspense fallback={<div className="crt-card crt-card-loading">▶ LOADING CARD<span className="crt-cursor">&nbsp;</span></div>}>
            <PokemonCard
              pokemon={result.data.pokemon}
              species={result.data.species}
              chain={result.data.chain}
              shiny={shiny}
              onShinyChange={setShiny}
              onSelectEvolution={handleSelect}
              gen={selectedGen}
              cryAudioRef={cryAudioRef}
              cryVolume={cryVolume}
              onCryVolumeChange={setCryVolume}
            />
          </Suspense>
        </div>
      )}

      <GenFilter
        selected={selectedGens}
        onToggle={(g) =>
          setSelectedGens((prev) => {
            const next = new Set(prev);
            if (next.has(g)) next.delete(g);
            else next.add(g);
            return next;
          })
        }
        onClear={() => setSelectedGens(new Set())}
      />

      <div className="crt-extra-toggle">
        <div className="crt-extra-title">▶ INCLUDE ALT FORMS</div>
        <div className="crt-extra-chips">
          {FORM_CATEGORIES.map(({ key, label }) => {
            const active = activeFormCats.has(key);
            const count = extraForms.forms.filter((f) => f.formCategory === key).length;
            return (
              <button
                key={key}
                type="button"
                className={'crt-extra-chip' + (active ? ' active' : '')}
                aria-pressed={active}
                onClick={() => {
                  setActiveFormCats((prev) => {
                    const next = new Set(prev);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                  });
                }}
              >
                {label}
                {count > 0 && <span className="crt-extra-chip-count"> · {count}</span>}
              </button>
            );
          })}
          {activeFormCats.size > 0 && (
            <button
              type="button"
              className="crt-extra-chip clear"
              onClick={() => setActiveFormCats(new Set())}
              title="Clear all"
            >
              [ clear ]
            </button>
          )}
        </div>
        {extraForms.loading && (
          <span className="crt-extra-status">▶ FETCHING FORMS<span className="crt-cursor">&nbsp;</span></span>
        )}
      </div>

      <PokemonGrid
        species={filteredSpecies}
        query={query}
        selected={selected}
        onSelect={handleSelect}
        typeIndex={typeIndex.index}
        selectedTypes={selectedTypes}
        onToggleType={(t) => {
          setTypeIndexEnabled(true);
          setSelectedTypes((prev) => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t);
            else next.add(t);
            return next;
          });
        }}
        onClearTypes={() => setSelectedTypes(new Set())}
      />
    </div>
  );
}
