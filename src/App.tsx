import { useEffect, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import StatusLine from './components/StatusLine';
import PokemonCard from './components/PokemonCard';
import PokemonGrid from './components/PokemonGrid';
import GenTabs from './components/GenTabs';
import { useGenerationList } from './hooks/useGenerationList';
import { usePokemon } from './hooks/usePokemon';
import { useTypeIndex } from './hooks/useTypeIndex';
import { getGen } from './generations';
import type { PokeType } from './typeChart';

export default function App() {
  const [gen, setGen] = useState(8);
  const list = useGenerationList(gen);
  const typeIndex = useTypeIndex();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<PokeType>>(new Set());
  const [shiny, setShiny] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const result = usePokemon(selected, list.species, attempt);
  const cardRef = useRef<HTMLDivElement>(null);

  const meta = getGen(gen);

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
  };

  const handleGenChange = (n: number) => {
    setGen(n);
    setSelected(null);
    setQuery('');
    setSelectedTypes(new Set());
  };

  const handleSubmit = (typed: string) => {
    const q = typed.trim().toLowerCase();
    if (!q) return;
    if (list.names.includes(q)) {
      handleSelect(q);
      return;
    }
    const visible = list.species.filter((s) => s.name.includes(q));
    if (visible.length > 0) handleSelect(visible[0].name);
  };

  return (
    <div className="crt">
      <header className="crt-header">▶ POKEMAX // GEN {meta.roman}</header>
      <div className="crt-subheader">{meta.region.toUpperCase()} REGION</div>
      <StatusLine state={status} />
      <GenTabs active={gen} onChange={handleGenChange} />
      <SearchBar
        names={list.names}
        value={query}
        onValueChange={setQuery}
        onSearch={handleSubmit}
        disabled={list.loading}
      />

      {list.error && (
        <div className="crt-error">
          ERR: COULD NOT LOAD GEN {meta.roman} INDEX
          <button type="button" onClick={() => window.location.reload()}>[ reload ]</button>
        </div>
      )}

      {result.error?.kind === 'not-in-gen-8' && (
        <div className="crt-error">ERR: "{selected}" NOT FOUND IN GEN {meta.roman}</div>
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
            gen={gen}
          />
        </div>
      )}

      <PokemonGrid
        species={list.species}
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
