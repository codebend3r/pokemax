import {
  defensiveMatchups,
  groupMatchups,
  TYPES,
  TYPE_COLORS,
  type PokeType,
} from '@/typeChart';

interface Props {
  types: string[];
}

function isPokeType(t: string): t is PokeType {
  return (TYPES as readonly string[]).includes(t);
}

function Chip({ type }: { type: PokeType }) {
  return (
    <span
      className="crt-mu-chip"
      style={{ borderColor: TYPE_COLORS[type], color: TYPE_COLORS[type] }}
    >
      {type}
    </span>
  );
}

function Row({ label, items, mult }: { label: string; items: { type: PokeType }[]; mult: string }) {
  if (items.length === 0) return null;
  return (
    <div className="crt-mu-row">
      <span className="crt-mu-label">
        {label} <span className="crt-mu-mult">{mult}</span>
      </span>
      <span className="crt-mu-chips">
        {items.map((m) => (
          <Chip key={m.type} type={m.type} />
        ))}
      </span>
    </div>
  );
}

export default function TypeMatchup({ types }: Props) {
  const valid = types.filter(isPokeType);
  if (valid.length === 0) return <div style={{ color: 'var(--dim)' }}>· no matchup data</div>;

  const groups = groupMatchups(defensiveMatchups(valid));

  return (
    <div className="crt-mu">
      <Row label="WEAK TO" items={groups.weak4x} mult="×4" />
      <Row label="WEAK TO" items={groups.weak2x} mult="×2" />
      <Row label="RESISTS" items={groups.resist2x} mult="×½" />
      <Row label="RESISTS" items={groups.resist4x} mult="×¼" />
      <Row label="IMMUNE" items={groups.immune} mult="×0" />
      {groups.weak4x.length === 0 &&
        groups.weak2x.length === 0 &&
        groups.resist2x.length === 0 &&
        groups.resist4x.length === 0 &&
        groups.immune.length === 0 && (
          <div style={{ color: 'var(--dim)' }}>· perfectly neutral against every type</div>
        )}
    </div>
  );
}
