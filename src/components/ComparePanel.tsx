import { useEffect, useMemo, useState } from 'react';
import { fetchPokemon } from '@/api';
import type { Gen8Species, PokemonResponse } from '@/types';
import { TYPE_COLORS, TYPES, type PokeType } from '@/typeChart';

interface Props {
  base: PokemonResponse;
  species: Gen8Species[];
  onClose: () => void;
}

const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;
const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};

const SHOWDOWN_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown';

function pretty(name: string): string {
  return name
    .split('-')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ''))
    .join(' ');
}

function statByName(p: PokemonResponse, key: string): number {
  return p.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
}

function TypeChip({ name }: { name: string }) {
  const isKnown = (TYPES as readonly string[]).includes(name);
  const color = isKnown ? TYPE_COLORS[name as PokeType] : 'var(--primary)';
  return (
    <span
      className="crt-type"
      style={{ color, borderColor: color, textShadow: `0 0 4px ${color}66` }}
    >
      {name}
    </span>
  );
}

export default function ComparePanel({ base, species, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<Gen8Species | null>(null);
  const [targetData, setTargetData] = useState<PokemonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return species.filter((s) => s.name !== base.name && s.name.includes(q)).slice(0, 10);
  }, [query, species, base.name]);

  useEffect(() => {
    if (!target) return;
    let active = true;
    setError(null);
    fetchPokemon(target.id)
      .then((p) => {
        if (active) setTargetData(p);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [target]);

  const pick = (s: Gen8Species) => {
    setTarget(s);
    setTargetData(null);
    setQuery('');
  };

  if (!target) {
    return (
      <div className="crt-compare">
        <div className="crt-compare-header">
          <span className="crt-compare-label">▶ COMPARE WITH</span>
          <button type="button" className="crt-compare-close" onClick={onClose}>
            [ × ]
          </button>
        </div>
        <input
          className="crt-compare-input"
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
                  #{String(s.id).padStart(3, '0')} {pretty(s.name)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="crt-compare">
        <div className="crt-compare-header">
          <span className="crt-compare-label">
            ▶ ERR LOADING {pretty(target.name).toUpperCase()}
          </span>
          <button type="button" className="crt-compare-close" onClick={onClose}>
            [ × ]
          </button>
        </div>
      </div>
    );
  }

  if (!targetData) {
    return (
      <div className="crt-compare">
        <div className="crt-compare-header">
          <span className="crt-compare-label">▶ FETCHING {pretty(target.name).toUpperCase()}…</span>
          <button type="button" className="crt-compare-close" onClick={onClose}>
            [ × ]
          </button>
        </div>
      </div>
    );
  }

  const baseTotal = STAT_ORDER.reduce((n, k) => n + statByName(base, k), 0);
  const targetTotal = STAT_ORDER.reduce((n, k) => n + statByName(targetData, k), 0);

  return (
    <div className="crt-compare">
      <div className="crt-compare-header">
        <span className="crt-compare-label">▶ COMPARING</span>
        <button
          type="button"
          className="crt-compare-change"
          onClick={() => {
            setTarget(null);
            setTargetData(null);
          }}
        >
          [ change ]
        </button>
        <button type="button" className="crt-compare-close" onClick={onClose}>
          [ × ]
        </button>
      </div>

      <div className="crt-compare-row crt-compare-names">
        <div className="crt-compare-col">
          <img
            src={`${SHOWDOWN_BASE}/${base.id}.gif`}
            alt={base.name}
            className="crt-compare-sprite"
          />
          <div className="crt-compare-name">{pretty(base.name).toUpperCase()}</div>
          <div className="crt-compare-types">
            {base.types.map((t) => (
              <TypeChip key={t.type.name} name={t.type.name} />
            ))}
          </div>
        </div>
        <div className="crt-compare-vs">VS</div>
        <div className="crt-compare-col">
          <img
            src={`${SHOWDOWN_BASE}/${targetData.id}.gif`}
            alt={targetData.name}
            className="crt-compare-sprite"
          />
          <div className="crt-compare-name">{pretty(targetData.name).toUpperCase()}</div>
          <div className="crt-compare-types">
            {targetData.types.map((t) => (
              <TypeChip key={t.type.name} name={t.type.name} />
            ))}
          </div>
        </div>
      </div>

      <div className="crt-compare-stats">
        {STAT_ORDER.map((key) => {
          const a = statByName(base, key);
          const b = statByName(targetData, key);
          const diff = a - b;
          return (
            <div key={key} className="crt-compare-stat-row">
              <span
                className={'crt-compare-stat-num' + (diff > 0 ? ' win' : diff < 0 ? ' lose' : '')}
              >
                {a}
              </span>
              <span className="crt-compare-stat-label">
                {STAT_LABELS[key] ?? key.toUpperCase()}
              </span>
              <span
                className={'crt-compare-stat-num' + (diff < 0 ? ' win' : diff > 0 ? ' lose' : '')}
              >
                {b}
              </span>
            </div>
          );
        })}
        <div className="crt-compare-stat-row total">
          <span
            className={
              'crt-compare-stat-num' +
              (baseTotal > targetTotal ? ' win' : baseTotal < targetTotal ? ' lose' : '')
            }
          >
            {baseTotal}
          </span>
          <span className="crt-compare-stat-label">TOTAL</span>
          <span
            className={
              'crt-compare-stat-num' +
              (targetTotal > baseTotal ? ' win' : targetTotal < baseTotal ? ' lose' : '')
            }
          >
            {targetTotal}
          </span>
        </div>
      </div>

      <div className="crt-compare-vitals-row">
        <div className="crt-compare-vital-cell">
          <span className="crt-compare-vital-label">HT</span> {(base.height / 10).toFixed(1)}m
          &nbsp;
          <span className="crt-compare-vital-label">WT</span> {(base.weight / 10).toFixed(1)}kg
        </div>
        <div className="crt-compare-vital-cell">
          <span className="crt-compare-vital-label">HT</span> {(targetData.height / 10).toFixed(1)}m
          &nbsp;
          <span className="crt-compare-vital-label">WT</span> {(targetData.weight / 10).toFixed(1)}
          kg
        </div>
      </div>
    </div>
  );
}
