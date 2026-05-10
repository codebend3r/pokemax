import { useState, type ReactNode } from 'react';
import { useApiDetail } from '../hooks/useApiDetail';

type Kind = 'move' | 'ability' | 'item' | 'nature';

const ENDPOINT: Record<Kind, string> = {
  move: 'move',
  ability: 'ability',
  item: 'item',
  nature: 'nature',
};

interface Props {
  kind: Kind;
  name: string;
  label?: ReactNode;
}

function pretty(name: string) {
  return name.replace(/-/g, ' ');
}

function pickEffect(entries: { short_effect?: string; effect?: string; language: { name: string } }[] | undefined): string {
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
  category: { name: string };
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
  if (!inc && !dec) return <div className="crt-detail-effect">Neutral nature — no stat changes.</div>;
  return (
    <div className="crt-detail-effect">
      <span style={{ color: 'var(--accent)' }}>+10% {pretty(inc ?? '')}</span>
      {' · '}
      <span style={{ color: 'var(--error)' }}>−10% {pretty(dec ?? '')}</span>
    </div>
  );
}

export default function Detail({ kind, name, label }: Props) {
  const [open, setOpen] = useState(false);
  const move = useApiDetail<MoveResponse>(ENDPOINT.move, kind === 'move' && open ? name : null, kind === 'move' && open);
  const ability = useApiDetail<AbilityResponse>(ENDPOINT.ability, kind === 'ability' && open ? name : null, kind === 'ability' && open);
  const item = useApiDetail<ItemResponse>(ENDPOINT.item, kind === 'item' && open ? name : null, kind === 'item' && open);
  const nature = useApiDetail<NatureResponse>(ENDPOINT.nature, kind === 'nature' && open ? name : null, kind === 'nature' && open);

  const state =
    kind === 'move' ? move : kind === 'ability' ? ability : kind === 'item' ? item : nature;

  return (
    <span className="crt-detail">
      <button
        type="button"
        className="crt-detail-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label ?? pretty(name)}
      </button>
      {open && (
        <span className="crt-detail-panel">
          {state.loading && <span className="crt-detail-loading">scanning...</span>}
          {state.error && <span className="crt-detail-error">err: {state.error}</span>}
          {state.data && kind === 'move' && <MoveBody data={state.data as MoveResponse} />}
          {state.data && kind === 'ability' && (
            <div className="crt-detail-effect">{pickEffect((state.data as AbilityResponse).effect_entries) || 'no description.'}</div>
          )}
          {state.data && kind === 'item' && (
            <div className="crt-detail-effect">
              <span style={{ color: 'var(--dim)' }}>{(state.data as ItemResponse).category.name.replace(/-/g, ' ')}</span>
              {': '}
              {pickEffect((state.data as ItemResponse).effect_entries) || 'no description.'}
            </div>
          )}
          {state.data && kind === 'nature' && <NatureBody data={state.data as NatureResponse} />}
        </span>
      )}
    </span>
  );
}
