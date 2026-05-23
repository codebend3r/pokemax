import { useMemo, useState } from 'react';
import TrainerFilters from '@/components/TrainerFilters';
import { GAME_LABELS, type GameId, type Trainer } from '@/trainers';
import { showdownSpriteUrl } from '@/showdownSprite';

interface Props {
  trainers: Trainer[];
  onSelect: (trainer: Trainer) => void;
}

// `GameId` is a union type, so its declaration order is the canonical
// chronological order we want for game-chip sorting.
const GAME_ORDER: GameId[] = [
  'red-blue',
  'yellow',
  'gold-silver',
  'crystal',
  'ruby-sapphire',
  'emerald',
  'firered-leafgreen',
  'diamond-pearl',
  'platinum',
  'heartgold-soulsilver',
  'black-white',
  'black-2-white-2',
  'x-y',
  'omega-ruby-alpha-sapphire',
  'sun-moon',
  'ultra-sun-ultra-moon',
  'lets-go',
  'sword-shield',
  'brilliant-diamond-shining-pearl',
  'legends-arceus',
  'scarlet-violet',
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[-_]/g, ' ');
}

export default function TrainerGrid({ trainers, onSelect }: Props) {
  const [selectedGames, setSelectedGames] = useState<Set<GameId>>(new Set());
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [nameQuery, setNameQuery] = useState('');
  const [pokemonQuery, setPokemonQuery] = useState('');

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

      {filtered.length === 0 ? (
        <div className="crt-trainer-empty">▶ NO TRAINERS MATCH FILTERS</div>
      ) : (
        <div className="crt-trainer-grid">
          {filtered.map((t) => (
            <button
              key={t.id}
              className="crt-trainer-list-card"
              type="button"
              onClick={() => onSelect(t)}
            >
              <div className="crt-trainer-list-card-name">{t.name}</div>
              <div className="crt-trainer-list-card-class">{t.trainerClass.toUpperCase()}</div>
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
    </>
  );
}
