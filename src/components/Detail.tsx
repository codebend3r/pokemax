import { useState, type ReactNode } from 'react';
import { memoAsync, useAsync, type AsyncState } from '@/async';
import { fetchAbility, fetchItem, fetchMove, fetchNature } from '@/api';
import { cleanFlavorText } from '@/textUtil';
import {
  defensiveMatchups,
  effectiveness,
  groupMatchups,
  isPokeType,
  TYPES,
  TYPE_COLORS,
  type PokeType,
} from '@/typeChart';
import { ITEM_SOURCES, formatSourceLine, type ItemSource } from '@/itemSources';
import type { EffectEntry, ItemResponse, MoveResponse, NatureResponse } from '@/types';

export type DetailKind = 'move' | 'ability' | 'item' | 'nature' | 'type';

const moves = memoAsync(fetchMove);
const abilities = memoAsync(fetchAbility);
const items = memoAsync(fetchItem);
const natures = memoAsync(fetchNature);

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

function pickEffect(entries: EffectEntry[]): string {
  const en = entries.find((e) => e.language.name === 'en');
  return en?.short_effect ?? en?.effect ?? '';
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

/** Renders a lookup's data once ready; the shared scanning / error lines otherwise. */
function Loaded<T>({
  state,
  children,
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
}) {
  if (state.status === 'ready') return children(state.data);
  if (state.status === 'error')
    return <span className="crt-detail-error">err: {state.message}</span>;
  return <span className="crt-detail-loading">scanning...</span>;
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

function ItemObtain({ slug }: { slug: string }) {
  const sources = ITEM_SOURCES[slug];
  if (!sources || sources.length === 0) return null;
  return (
    <div className="crt-item-obtain">
      <div className="crt-item-obtain-label">▶ HOW TO OBTAIN</div>
      <ul className="crt-item-obtain-list">
        {sources.map((src, i) => (
          <li key={i} className="crt-item-obtain-row">
            <span className="crt-item-obtain-game">{formatSourceLine(src)}</span>
            {src.where && <span className="crt-item-obtain-where">{src.where}</span>}
            {typeof src.buy === 'number' && (
              <span className="crt-item-obtain-price">${src.buy.toLocaleString()}</span>
            )}
            {src.crafting && <CraftingRecipe recipe={src.crafting} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CraftingRecipe({ recipe }: { recipe: NonNullable<ItemSource['crafting']> }) {
  return (
    <div className="crt-item-craft">
      <span className="crt-item-craft-lp">{recipe.lp.toLocaleString()} LP</span>
      <ul className="crt-item-craft-mats">
        {recipe.materials.map((m, i) => (
          <li key={i}>
            <span className="crt-item-craft-mat-count">×{m.count}</span> {m.item.replace(/-/g, ' ')}
          </li>
        ))}
      </ul>
    </div>
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

function MatchupRow({
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

function TypeBody({ name }: { name: string }) {
  if (!isPokeType(name)) {
    return <div className="crt-detail-effect">Unknown type.</div>;
  }
  // Defensive matchups: how this type takes damage (single-type)
  const def = groupMatchups(defensiveMatchups([name]));
  // Offensive: this type's effectiveness AGAINST every other type
  const offense = TYPES.map((t) => ({ type: t, multiplier: effectiveness(name, [t]) }));
  const off = {
    super2: offense.filter((o) => o.multiplier === 2).map((o) => ({ type: o.type })),
    not: offense.filter((o) => o.multiplier === 0.5).map((o) => ({ type: o.type })),
    none: offense.filter((o) => o.multiplier === 0).map((o) => ({ type: o.type })),
  };

  return (
    <div>
      <div className="crt-detail-section">OFFENSIVE</div>
      <div className="crt-mu">
        <MatchupRow label="STRONG vs" items={off.super2} mult="×2" />
        <MatchupRow label="WEAK vs" items={off.not} mult="×½" />
        <MatchupRow label="NO EFFECT" items={off.none} mult="×0" />
        {off.super2.length === 0 && off.not.length === 0 && off.none.length === 0 && (
          <div style={{ color: 'var(--dim)' }}>· neutral against all types</div>
        )}
      </div>
      <div className="crt-detail-section">DEFENSIVE</div>
      <div className="crt-mu">
        <MatchupRow label="WEAK TO" items={def.weak2x} mult="×2" />
        <MatchupRow label="RESISTS" items={def.resist2x} mult="×½" />
        <MatchupRow label="IMMUNE" items={def.immune} mult="×0" />
        {def.weak2x.length === 0 && def.resist2x.length === 0 && def.immune.length === 0 && (
          <div style={{ color: 'var(--dim)' }}>· perfectly neutral</div>
        )}
      </div>
    </div>
  );
}

function MovePanel({ name }: { name: string }) {
  const move = useAsync(moves, true, name);
  return <Loaded state={move}>{(data) => <MoveBody data={data} />}</Loaded>;
}

function AbilityPanel({ name }: { name: string }) {
  const ability = useAsync(abilities, true, name);
  return (
    <Loaded state={ability}>
      {(data) => (
        <div className="crt-detail-effect">
          {pickEffect(data.effect_entries) || 'no description.'}
        </div>
      )}
    </Loaded>
  );
}

function ItemPanel({ name }: { name: string }) {
  const item = useAsync(items, true, name);
  return (
    <>
      <Loaded state={item}>
        {(data) => (
          <div className="crt-detail-effect">
            <span style={{ color: 'var(--dim)' }}>{data.category.name.replace(/-/g, ' ')}</span>
            {': '}
            {pickItemText(data) || 'no description.'}
          </div>
        )}
      </Loaded>
      <ItemObtain slug={name} />
    </>
  );
}

function NaturePanel({ name }: { name: string }) {
  const nature = useAsync(natures, true, name);
  return <Loaded state={nature}>{(data) => <NatureBody data={data} />}</Loaded>;
}

// Each panel mounts only while its detail is open, so it fetches only then.
const PANELS: Record<DetailKind, (props: { name: string }) => ReactNode> = {
  move: MovePanel,
  ability: AbilityPanel,
  item: ItemPanel,
  nature: NaturePanel,
  type: TypeBody,
};

export default function Detail({ kind, name, label, triggerStyle, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const Panel = PANELS[kind];

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
          <Panel name={name} />
        </span>
      )}
    </span>
  );
}
