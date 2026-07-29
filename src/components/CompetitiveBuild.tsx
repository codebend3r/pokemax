import type { ResolvedBuild, SmogonSet } from '@/competitive';
import { formatEVs, SMOGON_DEX_SLUGS } from '@/competitive';
import type { PokemonResponse } from '@/types';
import { GAME_LABELS, type GameId } from '@/trainers';
import Detail from '@/components/Detail';

interface Props {
  build: ResolvedBuild | null;
  loading: boolean;
  error: string | null;
  /** Default ability fallback when the Smogon set omits it (single-ability species). */
  pokemon?: PokemonResponse;
  /** Games this Pokémon can appear in — the per-game build options. */
  games: GameId[];
  /** null = latest gen with a published set (the richest modern build). */
  selectedGame: GameId | null;
  onSelectGame: (game: GameId | null) => void;
}

function isGameId(v: string): v is GameId {
  return v in GAME_LABELS;
}

function smogonToApi(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s.]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function DetailValues({
  kind,
  value,
}: {
  kind: 'ability' | 'item' | 'nature';
  value: string | string[] | undefined;
}) {
  if (!value) return <>—</>;
  const list = Array.isArray(value) ? value : [value];
  return (
    <>
      {list.map((v, i) => (
        <span key={`${v}-${i}`}>
          {i > 0 && <span style={{ color: 'var(--dim)' }}> / </span>}
          <Detail kind={kind} name={smogonToApi(v)} label={v} />
        </span>
      ))}
    </>
  );
}

function MoveCell({ move }: { move: SmogonSet['moves'][number] }) {
  const list = Array.isArray(move) ? move : [move];
  return (
    <li>
      ·{' '}
      {list.map((m, i) => (
        <span key={`${m}-${i}`}>
          {i > 0 && <span style={{ color: 'var(--dim)' }}> / </span>}
          <Detail kind="move" name={smogonToApi(m)} label={m} />
        </span>
      ))}
    </li>
  );
}

function defaultAbility(p: PokemonResponse | undefined): string | undefined {
  if (!p) return undefined;
  const visible = p.abilities.filter((a) => !a.is_hidden).sort((a, b) => a.slot - b.slot);
  const a = visible[0] ?? p.abilities[0];
  if (!a) return undefined;
  return a.ability.name
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join(' ');
}

export default function CompetitiveBuild({
  build,
  loading,
  error,
  pokemon,
  games,
  selectedGame,
  onSelectGame,
}: Props) {
  const gameSelect = (
    <div className="crt-build-game-row">
      <span className="crt-build-label">FOR GAME</span>
      <select
        className="crt-pagesize-select"
        aria-label="game for competitive build"
        value={selectedGame ?? ''}
        onChange={(e) => onSelectGame(isGameId(e.target.value) ? e.target.value : null)}
      >
        <option value="">LATEST (BEST AVAILABLE)</option>
        {games.map((g) => (
          <option key={g} value={g}>
            {GAME_LABELS[g].toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div>
        {gameSelect}
        <div className="crt-build-empty">
          ▶ FETCHING COMPETITIVE DATA<span className="crt-cursor">&nbsp;</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        {gameSelect}
        <div className="crt-build-empty">ERR: {error}</div>
      </div>
    );
  }
  if (!build) {
    return (
      <div>
        {gameSelect}
        <div className="crt-build-empty">
          {selectedGame
            ? `· no Smogon set for this entry in ${GAME_LABELS[selectedGame]}`
            : '· no competitive data on Smogon for this entry'}
          <div style={{ fontSize: 14, marginTop: 4, color: 'var(--dim)' }}>
            {selectedGame
              ? '(try LATEST, or a game from a different generation)'
              : '(not every Pokémon has a published analysis)'}
          </div>
        </div>
      </div>
    );
  }

  const { tier, buildName, set } = build;
  // Smogon omits ability when the Pokémon has a single competitive choice. Backfill
  // from PokeAPI so the field doesn't render as an em-dash.
  const ability = set.ability ?? defaultAbility(pokemon);

  return (
    <div className="crt-build">
      {gameSelect}
      <div className="crt-build-tier">
        <span className="crt-build-tier-label">[{tier.toUpperCase()}]</span>
        <span className="crt-build-tier-name">{buildName}</span>
      </div>

      <span className="crt-build-label">ABILITY</span>
      <span className="crt-build-value">
        <DetailValues kind="ability" value={ability} />
      </span>

      <span className="crt-build-label">ITEM</span>
      <span className="crt-build-value">
        <DetailValues kind="item" value={set.item} />
      </span>

      <span className="crt-build-label">NATURE</span>
      <span className="crt-build-value">
        <DetailValues kind="nature" value={set.nature} />
      </span>

      <span className="crt-build-label">EVS</span>
      <span className="crt-build-value">{formatEVs(set.evs)}</span>

      {set.ivs && Object.keys(set.ivs).length > 0 && (
        <>
          <span className="crt-build-label">IVS</span>
          <span className="crt-build-value">{formatEVs(set.ivs)}</span>
        </>
      )}

      <div className="crt-build-moves">
        <span className="crt-build-label">MOVES</span>
        <ul>
          {set.moves.map((m, i) => (
            <MoveCell key={i} move={m} />
          ))}
        </ul>
      </div>
      <div className="crt-build-source">
        data: smogon.com/dex/{SMOGON_DEX_SLUGS[build.sourceGen ?? 9] ?? 'sv'}
      </div>
    </div>
  );
}
