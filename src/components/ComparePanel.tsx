import { useId, useMemo, useRef, useState } from 'react';
import { dataOf, useAsync, type AsyncState } from '@/async';
import { pokemonData } from '@/dex';
import type { DexEntry, PokemonResponse } from '@/types';
import { pokeapiShowdownGif } from '@/sprites';
import { STAT_ORDER, statLabel } from '@/stats';
import { tintStyle, typeColor } from '@/typeChart';
import { titleCase } from '@/textUtil';

interface Props {
  base: PokemonResponse;
  species: DexEntry[];
  onClose: () => void;
}

function statByName(p: PokemonResponse, key: string): number {
  return p.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

function TypeChip({ name }: { name: string }) {
  return (
    <span className="crt-type" style={tintStyle(typeColor(name))}>
      {name}
    </span>
  );
}

/** One side of a stat row. The higher value gets a ▲ as well as its color. */
function StatNum({ value, other }: { value: number; other: number }) {
  const higher = value > other;
  return (
    <span className={'crt-compare-stat-num' + (higher ? ' win' : value < other ? ' lose' : '')}>
      {higher && <span aria-hidden="true">▲ </span>}
      {value}
      {higher && <span className="crt-visually-hidden"> (higher)</span>}
    </span>
  );
}

/** The header line, which doubles as the panel's live status. */
function headerLabel({
  target,
  state,
}: {
  target: DexEntry | null;
  state: AsyncState<PokemonResponse>;
}): string {
  if (!target) return 'COMPARE WITH';
  const name = titleCase(target.name).toUpperCase();
  if (state.status === 'error') return `ERR LOADING ${name}`;
  return state.status === 'ready' ? 'COMPARING' : `FETCHING ${name}…`;
}

function Comparison({ base, target }: { base: PokemonResponse; target: PokemonResponse }) {
  const baseTotal = STAT_ORDER.reduce((n, k) => n + statByName(base, k), 0);
  const targetTotal = STAT_ORDER.reduce((n, k) => n + statByName(target, k), 0);

  return (
    <>
      <div className="crt-compare-row crt-compare-names">
        <div className="crt-compare-col">
          <img src={pokeapiShowdownGif(base.id)} alt={base.name} className="crt-compare-sprite" />
          <div className="crt-compare-name">{titleCase(base.name).toUpperCase()}</div>
          <div className="crt-compare-types">
            {base.types.map((t) => (
              <TypeChip key={t.type.name} name={t.type.name} />
            ))}
          </div>
        </div>
        <div className="crt-compare-vs">VS</div>
        <div className="crt-compare-col">
          <img
            src={pokeapiShowdownGif(target.id)}
            alt={target.name}
            className="crt-compare-sprite"
          />
          <div className="crt-compare-name">{titleCase(target.name).toUpperCase()}</div>
          <div className="crt-compare-types">
            {target.types.map((t) => (
              <TypeChip key={t.type.name} name={t.type.name} />
            ))}
          </div>
        </div>
      </div>

      <div className="crt-compare-stats">
        {STAT_ORDER.map((key) => {
          const a = statByName(base, key);
          const b = statByName(target, key);
          return (
            <div key={key} className="crt-compare-stat-row">
              <StatNum value={a} other={b} />
              <span className="crt-compare-stat-label">{statLabel(key)}</span>
              <StatNum value={b} other={a} />
            </div>
          );
        })}
        <div className="crt-compare-stat-row total">
          <StatNum value={baseTotal} other={targetTotal} />
          <span className="crt-compare-stat-label">TOTAL</span>
          <StatNum value={targetTotal} other={baseTotal} />
        </div>
      </div>

      <div className="crt-compare-vitals-row">
        <div className="crt-compare-vital-cell">
          <span className="crt-compare-vital-label">HT</span> {(base.height / 10).toFixed(1)}m
          &nbsp;
          <span className="crt-compare-vital-label">WT</span> {(base.weight / 10).toFixed(1)}kg
        </div>
        <div className="crt-compare-vital-cell">
          <span className="crt-compare-vital-label">HT</span> {(target.height / 10).toFixed(1)}m
          &nbsp;
          <span className="crt-compare-vital-label">WT</span> {(target.weight / 10).toFixed(1)}
          kg
        </div>
      </div>
    </>
  );
}

export default function ComparePanel({ base, species, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<DexEntry | null>(null);
  const targetState = useAsync(pokemonData, target !== null, target?.id ?? 0);
  const targetData = dataOf(targetState);
  const panelRef = useRef<HTMLElement>(null);
  const labelId = useId();

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return species.filter((s) => s.name !== base.name && s.name.includes(q)).slice(0, 10);
  }, [query, species, base.name]);

  const pick = (s: DexEntry) => {
    setTarget(s);
    setQuery('');
    // The clicked suggestion unmounts with the picker; keep focus in the panel.
    panelRef.current?.focus();
  };

  return (
    <section ref={panelRef} className="crt-compare" aria-labelledby={labelId} tabIndex={-1}>
      <div className="crt-compare-header">
        <span id={labelId} className="crt-compare-label" role="status">
          <span aria-hidden="true">▶</span> {headerLabel({ target, state: targetState })}
        </span>
        {targetData && (
          <button type="button" className="crt-compare-change" onClick={() => setTarget(null)}>
            [ change ]
          </button>
        )}
        <button
          type="button"
          className="crt-compare-close"
          onClick={onClose}
          aria-label="Close compare"
        >
          [ × ]
        </button>
      </div>
      {!target && (
        <>
          <input
            className="crt-compare-input"
            aria-label="Pokémon to compare with"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search for a pokémon to compare..."
          />
          {suggestions.length > 0 && (
            <ul className="crt-compare-suggestions">
              {suggestions.map((s) => (
                <li key={s.name}>
                  <button type="button" onClick={() => pick(s)}>
                    #{String(s.id).padStart(3, '0')} {titleCase(s.name)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {targetData && <Comparison base={base} target={targetData} />}
    </section>
  );
}
