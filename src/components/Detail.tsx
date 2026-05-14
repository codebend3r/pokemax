import { useState, type ReactNode } from 'react';
import { useApiDetail } from '@/hooks/useApiDetail';
import { cleanFlavorText } from '@/textUtil';
import { defensiveMatchups, groupMatchups, TYPES, TYPE_COLORS, type PokeType } from '@/typeChart';

export type DetailKind = 'move' | 'ability' | 'item' | 'nature' | 'type';

const ENDPOINT: Record<Exclude<DetailKind, 'type'>, string> = {
  move: 'move',
  ability: 'ability',
  item: 'item',
  nature: 'nature',
};

interface Props {
  kind: DetailKind;
  name: string;
  label?: ReactNode;
  triggerStyle?: React.CSSProperties;
  triggerClassName?: string;
}

function pretty(name: string) {
  return name.replace(/-/g, ' ');
}

function isPokeType(t: string): t is PokeType {
  return (TYPES as readonly string[]).includes(t);
}

function pickEffect(
  entries: { short_effect?: string; effect?: string; language: { name: string } }[] | undefined,
): string {
  if (!entries) return '';
  const en = entries.find((e) => e.language.name === 'en');
  return en?.short_effect ?? en?.effect ?? '';
}

interface MoveResponse {
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damage_class: { name: string };
  type: { name: string };
  effect_entries: { short_effect: string; effect: string; language: { name: string } }[];
}
interface AbilityResponse {
  effect_entries: { short_effect: string; effect: string; language: { name: string } }[];
}
interface ItemResponse {
  effect_entries: { short_effect: string; effect: string; language: { name: string } }[];
  flavor_text_entries: {
    text: string;
    language: { name: string };
    version_group?: { name: string };
  }[];
  category: { name: string };
}

function pickItemText(data: ItemResponse): string {
  // PokeAPI items often have English text only in flavor_text_entries (effect_entries is sometimes localized to other languages or empty).
  const fromEffect = pickEffect(data.effect_entries);
  if (fromEffect) return fromEffect;
  const enFlavors = data.flavor_text_entries.filter((e) => e.language.name === 'en');
  if (enFlavors.length === 0) return '';
  // Use the most recent description for clarity
  return cleanFlavorText(enFlavors[enFlavors.length - 1].text);
}
interface NatureResponse {
  increased_stat: { name: string } | null;
  decreased_stat: { name: string } | null;
}

function MoveBody({ data }: { data: MoveResponse }) {
  return (
    <>
      <div className="crt-detail-grid">
        <span className="crt-detail-k">TYPE</span>
        <span className="crt-detail-v">{data.type.name}</span>
        <span className="crt-detail-k">CLASS</span>
        <span className="crt-detail-v">{data.damage_class.name}</span>
        <span className="crt-detail-k">POWER</span>
        <span className="crt-detail-v">{data.power ?? '—'}</span>
        <span className="crt-detail-k">ACCURACY</span>
        <span className="crt-detail-v">{data.accuracy ?? '—'}</span>
        <span className="crt-detail-k">PP</span>
        <span className="crt-detail-v">{data.pp ?? '—'}</span>
        <span className="crt-detail-k">PRIORITY</span>
        <span className="crt-detail-v">{data.priority}</span>
      </div>
      <div className="crt-detail-effect">{pickEffect(data.effect_entries)}</div>
    </>
  );
}

function NatureBody({ data }: { data: NatureResponse }) {
  const inc = data.increased_stat?.name;
  const dec = data.decreased_stat?.name;
  if (!inc && !dec)
    return <div className="crt-detail-effect">Neutral nature — no stat changes.</div>;
  return (
    <div className="crt-detail-effect">
      <span style={{ color: 'var(--accent)' }}>+10% {pretty(inc ?? '')}</span>
      {' · '}
      <span style={{ color: 'var(--error)' }}>−10% {pretty(dec ?? '')}</span>
    </div>
  );
}

function TypeChip({ type }: { type: PokeType }) {
  return (
    <span
      className="crt-mu-chip"
      style={{ borderColor: TYPE_COLORS[type], color: TYPE_COLORS[type] }}
    >
      {type}
    </span>
  );
}

function TypeBody({ name }: { name: string }) {
  if (!isPokeType(name)) {
    return <div className="crt-detail-effect">Unknown type.</div>;
  }
  // Defensive matchups: how this type takes damage (single-type)
  const def = groupMatchups(defensiveMatchups([name]));
  // Offensive: this type's effectiveness AGAINST every other type
  // We can compute by taking the row of effectiveness — i.e. for each defending type T,
  // what is `name`'s multiplier when attacking T?
  const offense: Array<{ type: PokeType; multiplier: number }> = TYPES.map((t) => {
    // multiplier of `name` attacking T = defensiveMatchups([T]) where attacker == name
    const m = defensiveMatchups([t]).find((x) => x.type === name)?.multiplier ?? 1;
    return { type: t, multiplier: m };
  });
  const off = {
    super2: offense.filter((o) => o.multiplier === 2).map((o) => ({ type: o.type })),
    not: offense.filter((o) => o.multiplier === 0.5).map((o) => ({ type: o.type })),
    none: offense.filter((o) => o.multiplier === 0).map((o) => ({ type: o.type })),
  };

  function Row({
    label,
    items,
    mult,
  }: {
    label: string;
    items: { type: PokeType }[];
    mult: string;
  }) {
    if (items.length === 0) return null;
    return (
      <div className="crt-mu-row">
        <span className="crt-mu-label">
          {label} <span className="crt-mu-mult">{mult}</span>
        </span>
        <span className="crt-mu-chips">
          {items.map((m) => (
            <TypeChip key={m.type} type={m.type} />
          ))}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="crt-detail-section">OFFENSIVE</div>
      <div className="crt-mu">
        <Row label="STRONG vs" items={off.super2} mult="×2" />
        <Row label="WEAK vs" items={off.not} mult="×½" />
        <Row label="NO EFFECT" items={off.none} mult="×0" />
        {off.super2.length === 0 && off.not.length === 0 && off.none.length === 0 && (
          <div style={{ color: 'var(--dim)' }}>· neutral against all types</div>
        )}
      </div>
      <div className="crt-detail-section">DEFENSIVE</div>
      <div className="crt-mu">
        <Row label="WEAK TO" items={def.weak2x} mult="×2" />
        <Row label="RESISTS" items={def.resist2x} mult="×½" />
        <Row label="IMMUNE" items={def.immune} mult="×0" />
        {def.weak2x.length === 0 && def.resist2x.length === 0 && def.immune.length === 0 && (
          <div style={{ color: 'var(--dim)' }}>· perfectly neutral</div>
        )}
      </div>
    </div>
  );
}

export default function Detail({ kind, name, label, triggerStyle, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);

  const move = useApiDetail<MoveResponse>(
    'move',
    kind === 'move' && open ? name : null,
    kind === 'move' && open,
  );
  const ability = useApiDetail<AbilityResponse>(
    'ability',
    kind === 'ability' && open ? name : null,
    kind === 'ability' && open,
  );
  const item = useApiDetail<ItemResponse>(
    'item',
    kind === 'item' && open ? name : null,
    kind === 'item' && open,
  );
  const nature = useApiDetail<NatureResponse>(
    'nature',
    kind === 'nature' && open ? name : null,
    kind === 'nature' && open,
  );

  return (
    <span className="crt-detail">
      <button
        type="button"
        className={'crt-detail-trigger ' + (triggerClassName ?? '')}
        style={triggerStyle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label ?? pretty(name)}
      </button>
      {open && (
        <span className="crt-detail-panel">
          {kind === 'type' && <TypeBody name={name} />}
          {kind === 'move' && (
            <>
              {move.loading && <span className="crt-detail-loading">scanning...</span>}
              {move.error && <span className="crt-detail-error">err: {move.error}</span>}
              {move.data && <MoveBody data={move.data} />}
            </>
          )}
          {kind === 'ability' && (
            <>
              {ability.loading && <span className="crt-detail-loading">scanning...</span>}
              {ability.error && <span className="crt-detail-error">err: {ability.error}</span>}
              {ability.data && (
                <div className="crt-detail-effect">
                  {pickEffect(ability.data.effect_entries) || 'no description.'}
                </div>
              )}
            </>
          )}
          {kind === 'item' && (
            <>
              {item.loading && <span className="crt-detail-loading">scanning...</span>}
              {item.error && <span className="crt-detail-error">err: {item.error}</span>}
              {item.data && (
                <div className="crt-detail-effect">
                  <span style={{ color: 'var(--dim)' }}>
                    {item.data.category.name.replace(/-/g, ' ')}
                  </span>
                  {': '}
                  {pickItemText(item.data) || 'no description.'}
                </div>
              )}
            </>
          )}
          {kind === 'nature' && (
            <>
              {nature.loading && <span className="crt-detail-loading">scanning...</span>}
              {nature.error && <span className="crt-detail-error">err: {nature.error}</span>}
              {nature.data && <NatureBody data={nature.data} />}
            </>
          )}
        </span>
      )}
    </span>
  );
}
// Re-export for callers that need to render endpoint paths
export { ENDPOINT };
