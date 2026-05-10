import { useState } from 'react';
import SearchBar from './components/SearchBar';
import StatusLine from './components/StatusLine';
import PokemonCard from './components/PokemonCard';
import { useGen8List } from './hooks/useGen8List';
import { usePokemon } from './hooks/usePokemon';

export default function App() {
  const list = useGen8List();
  const [query, setQuery] = useState<string | null>(null);
  const [shiny, setShiny] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const result = usePokemon(query, list.names, attempt);

  let status: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex' = 'ready';
  if (list.loading) status = 'loading-dex';
  else if (result.loading) status = 'scanning';
  else if (result.error?.kind === 'not-in-gen-8') status = 'err-not-found';
  else if (result.error?.kind === 'transmission') status = 'err-api';

  const handleSearch = (name: string) => {
    setShiny(false);
    setQuery(name);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="crt">
      <header className="crt-header">▶ POKéDEX // GEN VIII</header>
      <StatusLine state={status} />
      <SearchBar names={list.names} onSearch={handleSearch} disabled={list.loading} />

      {!query && !result.loading && (
        <div className="crt-empty">▶ ENTER POKéMON NAME AND PRESS RETURN</div>
      )}

      {result.error?.kind === 'not-in-gen-8' && (
        <div className="crt-error">ERR: "{query}" NOT FOUND IN GEN VIII</div>
      )}

      {result.error?.kind === 'transmission' && (
        <div className="crt-error">
          ERR: TRANSMISSION LOST
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>[ retry ]</button>
        </div>
      )}

      {result.data && (
        <PokemonCard
          pokemon={result.data.pokemon}
          species={result.data.species}
          chain={result.data.chain}
          shiny={shiny}
          onShinyChange={setShiny}
        />
      )}
    </div>
  );
}
