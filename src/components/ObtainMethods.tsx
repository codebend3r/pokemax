import { useState } from 'react';
import { getGen } from '@/generations';
import type { ObtainEntry, ObtainFile, ObtainGame } from '@/obtain/types';

interface Props {
  data: ObtainFile | null;
  loading: boolean;
  error: string | null;
  currentGen: number;
  /** Whether the HOW TO OBTAIN section is open (data fetch is gated on this). */
  enabled: boolean;
}

const METHOD_LABEL: Record<ObtainEntry['method'], string> = {
  grass: 'GRASS',
  surf: 'SURF',
  fish: 'FISH',
  cave: 'CAVE',
  wild: 'WILD',
  static: 'STATIC',
  gift: 'GIFT',
  trade: 'TRADE',
  egg: 'EGG',
  evolve: 'EVOLVE',
  transfer: 'TRANSFER',
  unavailable: 'N/A',
  special: 'SPECIAL',
};

// Tint groups map onto existing palette vars in crt.css.
const METHOD_TINT: Record<ObtainEntry['method'], string> = {
  grass: 'primary',
  surf: 'tertiary',
  fish: 'tertiary',
  cave: 'primary',
  wild: 'primary',
  static: 'accent',
  gift: 'accent',
  trade: 'accent',
  egg: 'tertiary',
  evolve: 'tertiary',
  transfer: 'dim',
  unavailable: 'dim',
  special: 'primary',
};

function prettyVersions(versions: string[]): string {
  return versions.map((v) => v.toUpperCase().replace(/-/g, ' ')).join(' / ');
}

// Raw PokéAPI condition slugs read badly on chips ("weather-intense-sun",
// "story-progress-hall-of-fame"); shorten the noisy families before the
// generic uppercase fallback.
const CONDITION_LABELS: Record<string, string> = {
  'weather-normal': 'CLEAR WEATHER',
  'slot2-none': 'NO GBA CART',
  'swarm-yes': 'SWARM',
  'swarm-no': 'NO SWARM',
  'radar-on': 'POKéRADAR',
  'radar-off': 'NO POKéRADAR',
  'radio-off': 'NO RADIO',
  'bug-catching-contest-yes': 'BUG CONTEST',
  'bug-catching-contest-no': 'NO BUG CONTEST',
  'max-den-rarity-common': 'COMMON DEN',
  'max-den-rarity-rare': 'RARE DEN',
  'max-den-rarity-special': 'SPECIAL DEN',
  'story-progress-before-hall-of-fame': 'BEFORE HALL OF FAME',
  'story-progress-hall-of-fame': 'AFTER HALL OF FAME',
};

const CONDITION_PREFIXES: [RegExp, string][] = [
  [/^time-/, ''],
  [/^season-/, ''],
  [/^weather-/, ''],
  [/^weekday-/, ''],
  [/^story-progress-/, ''],
  [/^other-/, ''],
  [/^item-/, ''],
  [/^slot2-/, 'GBA: '],
  [/^radio-/, 'RADIO: '],
  [/^trade-/, 'GIVE '],
  [/^starter-/, 'STARTER: '],
];

function prettyCondition(slug: string): string {
  const mapped = CONDITION_LABELS[slug];
  if (mapped) return mapped;
  const star = slug.match(/^max-den-rating-(\d)-star$/);
  if (star) return `${star[1]}★ DEN`;
  const coins = slug.match(/^coins-(\d+)$/);
  if (coins) return `${parseInt(coins[1], 10).toLocaleString('en-US')} COINS`;
  let s = slug;
  for (const [re, repl] of CONDITION_PREFIXES) {
    if (re.test(s)) {
      s = s.replace(re, repl);
      break;
    }
  }
  return s.toUpperCase().replace(/-/g, ' ');
}

function levelRate(e: ObtainEntry): string {
  const bits: string[] = [];
  if (e.minLevel !== undefined && e.maxLevel !== undefined) {
    bits.push(e.minLevel === e.maxLevel ? `L${e.minLevel}` : `L${e.minLevel}–${e.maxLevel}`);
  }
  if (e.chance !== undefined) bits.push(`${e.chance}%`);
  return bits.join(' · ');
}

function EntryRow({ entry }: { entry: ObtainEntry }) {
  const meta = levelRate(entry);
  return (
    <li className={`crt-obtain-row crt-obtain-row--${METHOD_TINT[entry.method]}`}>
      <span className="crt-obtain-tag">{METHOD_LABEL[entry.method]}</span>
      {entry.location && <span className="crt-obtain-loc">{entry.location}</span>}
      {meta && <span className="crt-obtain-meta">{meta}</span>}
      {entry.conditions?.map((c) => (
        <span key={c} className="crt-obtain-cond">
          {prettyCondition(c)}
        </span>
      ))}
      {entry.detail && <span className="crt-obtain-detail">{entry.detail}</span>}
    </li>
  );
}

function GameRow({ game }: { game: ObtainGame }) {
  return (
    <div className="crt-obtain-game">
      <div className="crt-obtain-game-name">{prettyVersions(game.versions)}</div>
      <ul className="crt-obtain-entries">
        {game.entries.map((e, i) => (
          <EntryRow key={i} entry={e} />
        ))}
      </ul>
    </div>
  );
}

export default function ObtainMethods({ data, loading, error, currentGen, enabled }: Props) {
  const [userExpanded, setUserExpanded] = useState<Set<number> | null>(null);
  // Between `enabled` flipping true and the fetch effect's first state update,
  // `loading` is still false — treat that gap as loading too so there's no
  // one-frame "UNAVAILABLE" flash before the request even starts.
  if (loading || (enabled && !data && !error)) {
    return <div className="crt-obtain-status">LOADING OBTAIN DATA…</div>;
  }
  if (error || !data) return <div className="crt-obtain-status">OBTAIN DATA UNAVAILABLE</div>;

  const gens = [...new Set(data.games.map((g) => g.gen))];
  // Regional forms can carry a `currentGen` the file's games never reach
  // (e.g. Alolan Vulpix is gen 1, but its file starts at gen 7) — default to
  // the first gen actually present instead of expanding nothing.
  const defaultGen = gens.includes(currentGen) ? currentGen : gens[0];
  const expanded = userExpanded ?? new Set(defaultGen === undefined ? [] : [defaultGen]);
  const toggle = (gen: number) =>
    setUserExpanded((prev) => {
      const next = new Set(prev ?? expanded);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });

  return (
    <div className="crt-obtain">
      {data.breeding && (
        <div className="crt-obtain-breeding">
          EGG GROUPS: {data.breeding.eggGroups.map((g) => g.toUpperCase()).join('/')}
          {data.breeding.breedable
            ? ` · HATCH: ${data.breeding.hatchCycles} CYCLES (${data.breeding.steps.toLocaleString('en-US')} STEPS)`
            : ' · CANNOT BREED'}
        </div>
      )}
      {gens.map((gen) => {
        const meta = getGen(gen);
        const open = expanded.has(gen);
        return (
          <div key={gen} className="crt-obtain-gen">
            <button
              type="button"
              className="crt-obtain-gen-toggle"
              aria-expanded={open}
              onClick={() => toggle(gen)}
            >
              {open ? '▼' : '▶'} GEN {meta.roman} · {meta.region.toUpperCase()}
            </button>
            {open &&
              data.games.filter((g) => g.gen === gen).map((g, i) => <GameRow key={i} game={g} />)}
          </div>
        );
      })}
    </div>
  );
}
