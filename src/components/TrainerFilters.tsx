import { GAME_LABELS, type GameId } from '@/trainers';

interface Props {
  selectedGames: Set<GameId>;
  selectedClasses: Set<string>;
  nameQuery: string;
  pokemonQuery: string;
  allGames: GameId[];
  allClasses: string[];
  onToggleGame: (g: GameId) => void;
  onToggleClass: (c: string) => void;
  onClearGames: () => void;
  onClearClasses: () => void;
  onNameChange: (v: string) => void;
  onPokemonChange: (v: string) => void;
}

export default function TrainerFilters({
  selectedGames,
  selectedClasses,
  nameQuery,
  pokemonQuery,
  allGames,
  allClasses,
  onToggleGame,
  onToggleClass,
  onClearGames,
  onClearClasses,
  onNameChange,
  onPokemonChange,
}: Props) {
  const allGamesActive = selectedGames.size === 0;
  const allClassesActive = selectedClasses.size === 0;

  return (
    <div className="crt-trainer-filters">
      <div className="crt-trainer-filter-section">
        <div className="crt-trainer-filter-label">▶ FILTER BY GAME</div>
        <div className="crt-trainer-filter-chips">
          <button
            type="button"
            className={'crt-trainer-chip all' + (allGamesActive ? ' active' : '')}
            onClick={onClearGames}
            aria-pressed={allGamesActive}
          >
            ALL
          </button>
          {allGames.map((g) => {
            const active = selectedGames.has(g);
            return (
              <button
                key={g}
                type="button"
                className={'crt-trainer-chip' + (active ? ' active' : '')}
                onClick={() => onToggleGame(g)}
                aria-pressed={active}
              >
                {GAME_LABELS[g]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="crt-trainer-filter-section">
        <div className="crt-trainer-filter-label">▶ FILTER BY CLASS</div>
        <div className="crt-trainer-filter-chips">
          <button
            type="button"
            className={'crt-trainer-chip all' + (allClassesActive ? ' active' : '')}
            onClick={onClearClasses}
            aria-pressed={allClassesActive}
          >
            ALL
          </button>
          {allClasses.map((c) => {
            const active = selectedClasses.has(c);
            return (
              <button
                key={c}
                type="button"
                className={'crt-trainer-chip' + (active ? ' active' : '')}
                onClick={() => onToggleClass(c)}
                aria-pressed={active}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="crt-trainer-filter-section">
        <div className="crt-trainer-filter-label">▶ SEARCH NAME</div>
        <input
          className="crt-trainer-search-input"
          type="text"
          value={nameQuery}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onNameChange('');
          }}
          placeholder="Search trainer name (ESC to clear)"
          aria-label="search trainer name"
        />
      </div>

      <div className="crt-trainer-filter-section">
        <div className="crt-trainer-filter-label">▶ SEARCH BY POKéMON ON ROSTER</div>
        <input
          className="crt-trainer-search-input"
          type="text"
          value={pokemonQuery}
          onChange={(e) => onPokemonChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onPokemonChange('');
          }}
          placeholder="Pokémon species (ESC to clear)"
          aria-label="search by pokemon on roster"
        />
      </div>
    </div>
  );
}
