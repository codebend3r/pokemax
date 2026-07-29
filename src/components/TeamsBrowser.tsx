import { useEffect, useState } from 'react';
import { TEAM_BUILDS, TEAM_REGIONS, type TeamPick } from '@/teams';
import { GAME_LABELS, type GameId } from '@/trainers';
import { showdownAnimSpriteUrl, showdownSpriteUrl } from '@/showdownSprite';

interface Props {
  onSelectPokemon: (speciesSlug: string) => void;
}

const COLLAPSED_KEY = 'pokemax.teamsCollapsed';

function initialCollapsed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(COLLAPSED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((r): r is string => typeof r === 'string'));
    }
  } catch {
    // Corrupted value — fall through to all-expanded.
  }
  return new Set();
}

export default function TeamsBrowser({ onSelectPokemon }: Props) {
  const [filter, setFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(initialCollapsed);
  const q = filter.trim().toLowerCase();

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsed]));
  }, [collapsed]);

  const toggleRegion = (region: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

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
        <div className="crt-teams-fold-controls">
          <button
            type="button"
            className="crt-trainer-chip"
            onClick={() => setCollapsed(new Set())}
          >
            ▼ EXPAND ALL
          </button>
          <button
            type="button"
            className="crt-trainer-chip"
            onClick={() => setCollapsed(new Set(TEAM_REGIONS.map((r) => r.region)))}
          >
            ▶ COLLAPSE ALL
          </button>
        </div>
      </div>

      {visible.length === 0 && <div className="crt-trainer-empty">▶ NO TEAMS MATCH FILTER</div>}

      {visible.map(({ region, note, games }) => {
        // An active search auto-expands so matches are never hidden.
        const isCollapsed = !q && collapsed.has(region);
        return (
          <section key={region} className="crt-team-region">
            <h2 className="crt-team-region-heading">
              <button
                type="button"
                className="crt-team-region-toggle"
                aria-expanded={!isCollapsed}
                onClick={() => toggleRegion(region)}
              >
                <span className="crt-team-region-caret">{isCollapsed ? '▶' : '▼'}</span>
                {region.toUpperCase()}
                {note && <span className="crt-team-region-note">◂ {note.toUpperCase()}</span>}
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
                      onSelect={onSelectPokemon}
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

/**
 * Species with a locally-built 2D pixel GIF in `public/sprites/anim/` —
 * built from PokeRogue / GBA fan spritesheets for Pokémon that Showdown only
 * covers with 3D-model-style `ani` GIFs (or, like `iron-bundle`, not at all).
 */
const LOCAL_ANIM_SLUGS = new Set([
  'arcanine-hisui',
  'cinderace',
  'decidueye',
  'decidueye-hisui',
  'garganacl',
  'iron-bundle',
  'meowscarada',
  'salazzle',
  'sneasler',
  'tinkaton',
  'typhlosion-hisui',
]);

/** Animated-GIF sources in preference order: local 2D → gen5ani → ani (3D-style). */
function animSources(species: string): string[] {
  const sources: string[] = [];
  if (LOCAL_ANIM_SLUGS.has(species)) {
    sources.push(`${import.meta.env.BASE_URL}sprites/anim/${species}.gif`);
  }
  sources.push(showdownAnimSpriteUrl(species), showdownAnimSpriteUrl(species, 'ani'));
  return sources;
}

function TeamPickButton({ pick, onSelect }: { pick: TeamPick; onSelect: (slug: string) => void }) {
  // Walk the source chain on load errors; past the end, CSS bounce takes over.
  const [animLevel, setAnimLevel] = useState(0);
  const animSrc = animSources(pick.species)[animLevel] ?? null;
  return (
    <button
      type="button"
      className={'crt-team-pick' + (animSrc ? ' has-anim' : ' no-anim')}
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
        {animSrc && (
          <img
            className="team-pick-anim"
            src={animSrc}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            onError={() => setAnimLevel((l) => l + 1)}
          />
        )}
      </span>
      <div className="crt-team-pick-name">{pick.species.replace(/-/g, ' ').toUpperCase()}</div>
      <div className="crt-team-pick-role">{pick.role.toUpperCase()}</div>
      <div className="crt-team-pick-why">{pick.why}</div>
    </button>
  );
}
