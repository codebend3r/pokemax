import { useState } from 'react';
import { TEAM_BUILDS, TEAM_REGIONS, type TeamPick } from '@/teams';
import { GAMES, type GameId } from '@/games';
import { useFallbackSrc } from '@/hooks/useFallbackSrc';
import { showdownSpriteUrl, teamPickAnimations } from '@/sprites';
import { useExpandedRegions } from '@/hooks/useExpandedRegions';
import { spaced } from '@/textUtil';

interface Props {
  /** `game` is the team card the pick came from — used to preselect the competitive build. */
  onSelectPokemon: (speciesSlug: string, game: GameId) => void;
}

export default function TeamsBrowser({ onSelectPokemon }: Props) {
  const [filter, setFilter] = useState('');
  const { expanded, toggle, expandAll, collapseAll } = useExpandedRegions('pokemax.teamsExpanded');
  const q = filter.trim().toLowerCase();

  const matches = (region: string, g: GameId) => {
    if (!q) return true;
    const build = TEAM_BUILDS[g];
    if (!build) return false;
    if (region.toLowerCase().includes(q)) return true;
    if (GAMES[g].label.toLowerCase().includes(q)) return true;
    if (build.title.toLowerCase().includes(q)) return true;
    return build.team.some((p) => p.species.includes(q) || p.role.toLowerCase().includes(q));
  };

  const visible = TEAM_REGIONS.map((r) => ({
    ...r,
    games: r.games.filter((g) => matches(r.name, g)),
  })).filter(({ games }) => games.length > 0);

  return (
    <div className="crt-teams-page">
      <h1 className="crt-visually-hidden">Teams</h1>
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
        <div className="crt-teams-fold-controls">
          <button
            type="button"
            className="crt-trainer-chip"
            onClick={() => expandAll(TEAM_REGIONS.map((r) => r.name))}
          >
            <span aria-hidden="true">▼</span> EXPAND ALL
          </button>
          <button type="button" className="crt-trainer-chip" onClick={collapseAll}>
            <span aria-hidden="true">▶</span> COLLAPSE ALL
          </button>
        </div>
      </div>

      {visible.length === 0 && <div className="crt-trainer-empty">▶ NO TEAMS MATCH FILTER</div>}

      {visible.map(({ name: region, note, games }) => {
        // An active search auto-expands so matches are never hidden.
        const isCollapsed = !q && !expanded.has(region);
        return (
          <section key={region} className="crt-team-region">
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
              <div className="crt-team-region-games">
                {games.map((gameId) => {
                  const build = TEAM_BUILDS[gameId];
                  if (!build) return null;
                  return (
                    <GameTeamCard
                      key={gameId}
                      gameId={gameId}
                      build={build}
                      onSelect={(slug) => onSelectPokemon(slug, gameId)}
                    />
                  );
                })}
              </div>
            )}
          </section>
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
        <div className="crt-team-card-game">{GAMES[gameId].label}</div>
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
  // Past the end of the chain, CSS bounce on the still takes over.
  const anim = useFallbackSrc(teamPickAnimations(pick.species));
  return (
    <button
      type="button"
      className={'crt-team-pick' + (anim.src ? ' has-anim' : ' no-anim')}
      onClick={() => onSelect(pick.species)}
      title={`View ${pick.species}`}
    >
      <span className="crt-team-pick-sprite">
        <img
          className="team-pick-still"
          src={showdownSpriteUrl(pick.species)}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {anim.src && (
          <img
            className="team-pick-anim"
            src={anim.src}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={anim.next}
          />
        )}
      </span>
      <div className="crt-team-pick-name">{spaced(pick.species).toUpperCase()}</div>
      <div className="crt-team-pick-role">{pick.role.toUpperCase()}</div>
      <div className="crt-team-pick-why">{pick.why}</div>
    </button>
  );
}
