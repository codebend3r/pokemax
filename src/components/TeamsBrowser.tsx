import { useState } from 'react';
import { TEAM_BUILDS, TEAM_REGIONS, type TeamPick } from '@/teams';
import { GAME_LABELS, type GameId } from '@/trainers';
import { showdownAnimSpriteUrl, showdownSpriteUrl } from '@/showdownSprite';

interface Props {
  onSelectPokemon: (speciesSlug: string) => void;
}

export default function TeamsBrowser({ onSelectPokemon }: Props) {
  const [filter, setFilter] = useState('');
  const q = filter.trim().toLowerCase();

  const matches = (region: string, g: GameId) => {
    if (!q) return true;
    const build = TEAM_BUILDS[g];
    if (!build) return false;
    if (region.toLowerCase().includes(q)) return true;
    if (GAME_LABELS[g].toLowerCase().includes(q)) return true;
    if (build.title.toLowerCase().includes(q)) return true;
    return build.team.some((p) => p.species.includes(q) || p.role.toLowerCase().includes(q));
  };

  const visible = TEAM_REGIONS.map(({ region, note, games }) => ({
    region,
    note,
    games: games.filter((g) => matches(region, g)),
  })).filter(({ games }) => games.length > 0);

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

      {visible.map(({ region, note, games }) => (
        <section key={region} className="crt-team-region">
          <h2 className="crt-team-region-heading">
            {region.toUpperCase()}
            {note && <span className="crt-team-region-note">◂ {note.toUpperCase()}</span>}
          </h2>
          <div className="crt-team-region-games">
            {games.map((gameId) => {
              const build = TEAM_BUILDS[gameId];
              if (!build) return null;
              return (
                <GameTeamCard
                  key={gameId}
                  gameId={gameId}
                  build={build}
                  onSelect={onSelectPokemon}
                />
              );
            })}
          </div>
        </section>
      ))}
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
          <TeamPickButton key={pick.species} pick={pick} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function TeamPickButton({ pick, onSelect }: { pick: TeamPick; onSelect: (slug: string) => void }) {
  const [animOk, setAnimOk] = useState(true);
  return (
    <button
      type="button"
      className={'crt-team-pick' + (animOk ? ' has-anim' : '')}
      onClick={() => onSelect(pick.species)}
      title={`View ${pick.species}`}
    >
      <span className="crt-team-pick-sprite">
        <img
          className="team-pick-still"
          src={showdownSpriteUrl(pick.species)}
          alt={pick.species}
          loading="lazy"
          decoding="async"
        />
        {animOk && (
          <img
            className="team-pick-anim"
            src={showdownAnimSpriteUrl(pick.species)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={() => setAnimOk(false)}
          />
        )}
      </span>
      <div className="crt-team-pick-name">{pick.species.replace(/-/g, ' ').toUpperCase()}</div>
      <div className="crt-team-pick-role">{pick.role.toUpperCase()}</div>
      <div className="crt-team-pick-why">{pick.why}</div>
    </button>
  );
}
