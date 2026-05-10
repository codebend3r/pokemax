import type { ResolvedBuild } from '../competitive';
import { formatEVs, formatMaybeArray } from '../competitive';

interface Props {
  build: ResolvedBuild | null;
  loading: boolean;
  error: string | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="crt-build-row">
      <span className="crt-build-label">{label}</span>
      <span className="crt-build-value">{value}</span>
    </div>
  );
}

export default function CompetitiveBuild({ build, loading, error }: Props) {
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

  return (
    <div className="crt-build">
      <div className="crt-build-tier">
        <span className="crt-build-tier-label">[{tier.toUpperCase()}]</span>
        <span className="crt-build-tier-name">{buildName}</span>
      </div>
      <Row label="ABILITY" value={formatMaybeArray(set.ability)} />
      <Row label="ITEM" value={formatMaybeArray(set.item)} />
      <Row label="NATURE" value={formatMaybeArray(set.nature)} />
      <Row label="EVS" value={formatEVs(set.evs)} />
      {set.ivs && Object.keys(set.ivs).length > 0 && (
        <Row label="IVS" value={formatEVs(set.ivs)} />
      )}
      <div className="crt-build-moves">
        <span className="crt-build-label">MOVES</span>
        <ul>
          {set.moves.map((m, i) => (
            <li key={i}>· {Array.isArray(m) ? m.join(' / ') : m}</li>
          ))}
        </ul>
      </div>
      <div className="crt-build-source">data: smogon.com/dex/ss</div>
    </div>
  );
}
