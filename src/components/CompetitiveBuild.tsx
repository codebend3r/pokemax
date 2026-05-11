import type { ResolvedBuild, SmogonSet } from '../competitive';
import { formatEVs } from '../competitive';
import type { PokemonResponse } from '../types';
import Detail from './Detail';

interface Props {
  build: ResolvedBuild | null;
  loading: boolean;
  error: string | null;
  /** Default ability fallback when the Smogon set omits it (single-ability species). */
  pokemon?: PokemonResponse;
}

function smogonToApi(name: string): string {
  return name.toLowerCase().replace(/[\s.]+/g, '-').replace(/[^a-z0-9-]/g, '');
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

export default function CompetitiveBuild({ build, loading, error, pokemon }: Props) {
  if (loading) {
    return <div className="crt-build-empty">▶ FETCHING COMPETITIVE DATA<span className="crt-cursor">&nbsp;</span></div>;
  }
  if (error) {
    return <div className="crt-build-empty">ERR: {error}</div>;
  }
  if (!build) {
    return (
      <div className="crt-build-empty">
        · no competitive data on Smogon for this entry
        <div style={{ fontSize: 14, marginTop: 4, color: 'var(--dim)' }}>
          (not every Gen 8 Pokémon has a published analysis)
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
      <div className="crt-build-tier">
        <span className="crt-build-tier-label">[{tier.toUpperCase()}]</span>
        <span className="crt-build-tier-name">{buildName}</span>
      </div>

      <span className="crt-build-label">ABILITY</span>
      <span className="crt-build-value"><DetailValues kind="ability" value={ability} /></span>

      <span className="crt-build-label">ITEM</span>
      <span className="crt-build-value"><DetailValues kind="item" value={set.item} /></span>

      <span className="crt-build-label">NATURE</span>
      <span className="crt-build-value"><DetailValues kind="nature" value={set.nature} /></span>

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
      <div className="crt-build-source">data: smogon.com/dex/ss</div>
    </div>
  );
}
