import { useMemo, useState } from 'react';
import TrainerFilters from '@/components/TrainerFilters';
import { GAME_LABELS, GAMES_BY_REGION, type GameId, type Trainer } from '@/trainers';
import { showdownSpriteUrl } from '@/showdownSprite';
import { useExpandedRegions } from '@/hooks/useExpandedRegions';

interface Props {
  trainers: Trainer[];
  onSelect: (trainer: Trainer) => void;
}

// Region-grouped chronological order — same organization as the TEAMS page.
const GAME_ORDER: GameId[] = GAMES_BY_REGION.flatMap((r) => r.games);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_]/g, ' ');
}

export default function TrainerGrid({ trainers, onSelect }: Props) {
  const [selectedGames, setSelectedGames] = useState<Set<GameId>>(new Set());
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [nameQuery, setNameQuery] = useState('');
  const [pokemonQuery, setPokemonQuery] = useState('');
  const { expanded, toggle, expandAll, collapseAll } = useExpandedRegions(
    'pokemax.trainersExpanded',
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

  const regionGroups = useMemo(
    () =>
      GAMES_BY_REGION.map(({ region, note, games }) => ({
        region,
        note,
        trainers: games.flatMap((g) => filtered.filter((t) => t.game === g)),
      })).filter((r) => r.trainers.length > 0),
    [filtered],
  );

  return (
    <>
      <TrainerFilters
        selectedGames={selectedGames}
        selectedClasses={selectedClasses}
        nameQuery={nameQuery}
        pokemonQuery={pokemonQuery}
        allGames={allGames}
        allClasses={allClasses}
        onToggleGame={(g) =>
          setSelectedGames((prev) => {
            const next = new Set(prev);
            if (next.has(g)) next.delete(g);
            else next.add(g);
            return next;
          })
        }
        onToggleClass={(c) =>
          setSelectedClasses((prev) => {
            const next = new Set(prev);
            if (next.has(c)) next.delete(c);
            else next.add(c);
            return next;
          })
        }
        onClearGames={() => setSelectedGames(new Set())}
        onClearClasses={() => setSelectedClasses(new Set())}
        onNameChange={setNameQuery}
        onPokemonChange={setPokemonQuery}
      />

      <div className="crt-teams-fold-controls crt-trainers-fold">
        <button
          type="button"
          className="crt-trainer-chip"
          onClick={() => expandAll(GAMES_BY_REGION.map((r) => r.region))}
        >
          ▼ EXPAND ALL
        </button>
        <button type="button" className="crt-trainer-chip" onClick={collapseAll}>
          ▶ COLLAPSE ALL
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
                <span className="crt-team-region-caret">{isCollapsed ? '▶' : '▼'}</span>
                {region.toUpperCase()}
                {note && <span className="crt-team-region-note">◂ {note.toUpperCase()}</span>}
              </button>
            </h2>
            {!isCollapsed && (
              <div className="crt-trainer-grid">
                {regionTrainers.map((t) => (
                  <button
                    key={t.id}
                    className="crt-trainer-list-card"
                    type="button"
                    onClick={() => onSelect(t)}
                  >
                    {t.spriteUrl && (
                      <img
                        className="crt-trainer-list-card-portrait"
                        src={t.spriteUrl}
                        alt={t.name}
                        loading="lazy"
                      />
                    )}
                    <div className="crt-trainer-list-card-name">{t.name}</div>
                    <div className="crt-trainer-list-card-class">
                      {t.trainerClass.toUpperCase()}
                    </div>
                    <div className="crt-trainer-list-card-game">{GAME_LABELS[t.game]}</div>
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
