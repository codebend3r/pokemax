import { useEffect, useMemo, useRef, useState } from 'react';
import TrainerFilters from '@/components/TrainerFilters';
import { GAMES, GAME_ORDER, REGIONS, type GameId } from '@/games';
import { trainerPortraitUrl, type Trainer } from '@/trainers';
import { showdownSpriteUrl } from '@/sprites';
import { useExpandedRegions } from '@/hooks/useExpandedRegions';
import { useToggleSet } from '@/hooks/useToggleSet';

interface Props {
  trainers: Trainer[];
  onSelect: (trainer: Trainer) => void;
  /** The trainer whose page was just closed; their card gets focus back on return. */
  returnFocusTo?: string | null;
}

const ALL_REGIONS: readonly string[] = REGIONS.map((r) => r.name);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_]/g, ' ');
}

export default function TrainerGrid({ trainers, onSelect, returnFocusTo = null }: Props) {
  const games = useToggleSet<GameId>();
  const classes = useToggleSet<string>();
  const selectedGames = games.set;
  const selectedClasses = classes.set;
  const [nameQuery, setNameQuery] = useState('');
  const [pokemonQuery, setPokemonQuery] = useState('');
  // Trainers default to everything expanded (unlike TEAMS, which starts collapsed).
  const { expanded, toggle, expandAll, collapseAll } = useExpandedRegions(
    'pokemax.trainerRegions',
    ALL_REGIONS,
  );

  const allGames = useMemo(() => {
    const present = new Set(trainers.map((t) => t.game));
    return GAME_ORDER.filter((g) => present.has(g));
  }, [trainers]);

  const allClasses = useMemo(() => {
    const present = new Set(trainers.map((t) => t.trainerClass));
    return [...present].sort((a, b) => a.localeCompare(b));
  }, [trainers]);

  const filtered = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    const mon = normalize(pokemonQuery.trim());
    return trainers.filter((t) => {
      if (selectedGames.size > 0 && !selectedGames.has(t.game)) return false;
      if (selectedClasses.size > 0 && !selectedClasses.has(t.trainerClass)) return false;
      if (name && !t.name.toLowerCase().includes(name)) return false;
      if (mon && !t.team.some((m) => normalize(m.species).includes(mon))) return false;
      return true;
    });
  }, [trainers, selectedGames, selectedClasses, nameQuery, pokemonQuery]);

  // Any active filter auto-expands every region so matches are never hidden.
  const filtersActive =
    selectedGames.size > 0 ||
    selectedClasses.size > 0 ||
    nameQuery.trim() !== '' ||
    pokemonQuery.trim() !== '';

  const returnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    returnRef.current?.focus();
  }, []);

  const regionGroups = useMemo(
    () =>
      REGIONS.map(({ name: region, note, games }) => ({
        region,
        note,
        trainers: games.flatMap((g) => filtered.filter((t) => t.game === g)),
      })).filter((r) => r.trainers.length > 0),
    [filtered],
  );

  return (
    <>
      <h1 className="crt-visually-hidden">Trainers</h1>
      <TrainerFilters
        selectedGames={selectedGames}
        selectedClasses={selectedClasses}
        nameQuery={nameQuery}
        pokemonQuery={pokemonQuery}
        allGames={allGames}
        allClasses={allClasses}
        onToggleGame={games.toggle}
        onToggleClass={classes.toggle}
        onClearGames={games.clear}
        onClearClasses={classes.clear}
        onNameChange={setNameQuery}
        onPokemonChange={setPokemonQuery}
      />

      <div className="crt-teams-fold-controls crt-trainers-fold">
        <button type="button" className="crt-trainer-chip" onClick={() => expandAll(ALL_REGIONS)}>
          <span aria-hidden="true">▼</span> EXPAND ALL
        </button>
        <button type="button" className="crt-trainer-chip" onClick={collapseAll}>
          <span aria-hidden="true">▶</span> COLLAPSE ALL
        </button>
      </div>

      {regionGroups.length === 0 && (
        <div className="crt-trainer-empty">▶ NO TRAINERS MATCH FILTERS</div>
      )}

      {regionGroups.map(({ region, note, trainers: regionTrainers }) => {
        const isCollapsed = !filtersActive && !expanded.has(region);
        return (
          <section key={region} className="crt-team-region crt-trainer-region">
            <h2 className="crt-team-region-heading">
              <button
                type="button"
                className="crt-team-region-toggle"
                aria-expanded={!isCollapsed}
                onClick={() => toggle(region)}
              >
                <span className="crt-team-region-caret" aria-hidden="true">
                  {isCollapsed ? '▶' : '▼'}
                </span>
                {region.toUpperCase()}
                {note && (
                  <span className="crt-team-region-note">
                    <span aria-hidden="true">◂</span> {note.toUpperCase()}
                  </span>
                )}
              </button>
            </h2>
            {!isCollapsed && (
              <div className="crt-trainer-grid">
                {regionTrainers.map((t) => (
                  <button
                    key={t.id}
                    ref={t.id === returnFocusTo ? returnRef : null}
                    className="crt-trainer-list-card"
                    type="button"
                    onClick={() => onSelect(t)}
                  >
                    {trainerPortraitUrl(t) && (
                      <img
                        className="crt-trainer-list-card-portrait"
                        src={trainerPortraitUrl(t)}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <div className="crt-trainer-list-card-name">{t.name}</div>
                    <div className="crt-trainer-list-card-class">
                      {t.trainerClass.toUpperCase()}
                    </div>
                    <div className="crt-trainer-list-card-game">{GAMES[t.game].label}</div>
                    <div className="crt-trainer-list-card-roster-mini">
                      {t.team.map((m, i) => (
                        <img
                          key={`${t.id}-${i}-${m.species}`}
                          src={showdownSpriteUrl(m.species)}
                          alt={m.species}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
