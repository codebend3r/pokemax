import { useState } from 'react';
import { TEAM_BUILDS, TEAM_GAMES } from '@/teams';
import { GAME_LABELS, type GameId } from '@/trainers';
import { showdownSpriteUrl } from '@/showdownSprite';

interface Props {
  onSelectPokemon: (speciesSlug: string) => void;
}

export default function TeamsBrowser({ onSelectPokemon }: Props) {
  const [filter, setFilter] = useState('');
  const q = filter.trim().toLowerCase();

  const visible = TEAM_GAMES.filter((g) => {
    if (!q) return true;
    const build = TEAM_BUILDS[g];
    if (!build) return false;
    if (GAME_LABELS[g].toLowerCase().includes(q)) return true;
    if (build.title.toLowerCase().includes(q)) return true;
    return build.team.some((p) => p.species.includes(q) || p.role.toLowerCase().includes(q));
  });

  return (
    <div className="crt-teams-page">
      <div className="crt-teams-search">
        <span className="crt-search-prompt">&gt;</span>
        <input
          aria-label="search game or species"
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setFilter('');
          }}
          placeholder="Search game, species, or role (ESC to clear)"
          className="crt-trainer-search-input"
        />
      </div>

      {visible.length === 0 && <div className="crt-trainer-empty">▶ NO TEAMS MATCH FILTER</div>}

      {visible.map((gameId) => {
        const build = TEAM_BUILDS[gameId];
        if (!build) return null;
        return (
          <GameTeamCard key={gameId} gameId={gameId} build={build} onSelect={onSelectPokemon} />
        );
      })}
    </div>
  );
}

function GameTeamCard({
  gameId,
  build,
  onSelect,
}: {
  gameId: GameId;
  build: NonNullable<(typeof TEAM_BUILDS)[GameId]>;
  onSelect: (slug: string) => void;
}) {
  return (
    <section className="crt-team-card">
      <header className="crt-team-card-header">
        <div className="crt-team-card-game">{GAME_LABELS[gameId]}</div>
        <div className="crt-team-card-title">{build.title}</div>
        {build.note && <div className="crt-team-card-note">{build.note}</div>}
      </header>
      <div className="crt-team-card-roster">
        {build.team.map((pick) => (
          <button
            key={pick.species}
            type="button"
            className="crt-team-pick"
            onClick={() => onSelect(pick.species)}
            title={`View ${pick.species}`}
          >
            <img
              className="crt-team-pick-sprite"
              src={showdownSpriteUrl(pick.species)}
              alt={pick.species}
            />
            <div className="crt-team-pick-name">
              {pick.species.replace(/-/g, ' ').toUpperCase()}
            </div>
            <div className="crt-team-pick-role">{pick.role.toUpperCase()}</div>
            <div className="crt-team-pick-why">{pick.why}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
