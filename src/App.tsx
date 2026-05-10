import { useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import StatusLine from './components/StatusLine';
import PokemonCard from './components/PokemonCard';
import PokemonGrid from './components/PokemonGrid';
import GenFilter from './components/GenFilter';
import { useAllSpecies } from './hooks/useAllSpecies';
import { usePokemon } from './hooks/usePokemon';
import { useTypeIndex } from './hooks/useTypeIndex';
import type { PokeType } from './typeChart';

export default function App() {
  const list = useAllSpecies();
  const typeIndex = useTypeIndex();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedGens, setSelectedGens] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<PokeType>>(new Set());
  const [shiny, setShiny] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const result = usePokemon(selected, list.species, attempt);
  const cardRef = useRef<HTMLDivElement>(null);
  const cryAudioRef = useRef<HTMLAudioElement | null>(null);

  // Filter the master species list down to whatever generations are selected
  const filteredSpecies = useMemo(() => {
    if (selectedGens.size === 0) return list.species;
    return list.species.filter((s) => selectedGens.has(s.gen));
  }, [list.species, selectedGens]);

  const selectedEntry = selected ? list.species.find((s) => s.name === selected) ?? null : null;
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
    const sp = list.species.find((s) => s.name === name);
    if (sp) {
      const url = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${sp.id}.ogg`;
      if (cryAudioRef.current) {
        cryAudioRef.current.pause();
        cryAudioRef.current.src = '';
      }
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.45;
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
      <button type="button" className="crt-header crt-header-link" onClick={goHome} aria-label="Go to top">
        ▶ POKEMAX
      </button>
      <div className="crt-subheader">ALL POKéMON · GEN I — IX</div>
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
          <PokemonCard
            pokemon={result.data.pokemon}
            species={result.data.species}
            chain={result.data.chain}
            shiny={shiny}
            onShinyChange={setShiny}
            onSelectEvolution={handleSelect}
            gen={selectedGen}
            cryAudioRef={cryAudioRef}
          />
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

      <PokemonGrid
        species={filteredSpecies}
        query={query}
        selected={selected}
        onSelect={handleSelect}
        typeIndex={typeIndex.index}
        selectedTypes={selectedTypes}
        onToggleType={(t) =>
          setSelectedTypes((prev) => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t);
            else next.add(t);
            return next;
          })
        }
        onClearTypes={() => setSelectedTypes(new Set())}
      />
    </div>
  );
}
