import { useState, type SyntheticEvent } from 'react';
import { getGen, REGIONS, REGION_OF_VERSION_GROUP } from '@/generations';
import type { ObtainEntry, ObtainFile, ObtainGame } from '@/obtain/types';
import { TYPE_COLORS } from '@/typeChart';

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
  special: 'OTHER',
};

// Reuse the same type-color palette the type pills use elsewhere in the card
// (see `PokemonCard.tsx`'s `crt-type` styling) instead of the flat 4-tint set.
const METHOD_COLOR: Record<ObtainEntry['method'], string> = {
  grass: TYPE_COLORS.grass,
  surf: TYPE_COLORS.water,
  fish: TYPE_COLORS.ice,
  cave: TYPE_COLORS.ground,
  wild: TYPE_COLORS.normal,
  static: TYPE_COLORS.electric,
  gift: TYPE_COLORS.fairy,
  trade: TYPE_COLORS.psychic,
  egg: TYPE_COLORS.poison,
  evolve: TYPE_COLORS.dragon,
  transfer: 'var(--dim)',
  unavailable: 'var(--dim)',
  special: TYPE_COLORS.steel,
};

// Groups are by REGION, not generation — BDSP belongs with the other Sinnoh
// games regardless of when it shipped, and Hisui sits under Sinnoh. Both facts
// live in the canonical `REGIONS` model.
function regionLabel({ name, note }: { name: string; note?: string }): string {
  return note ? `${name.toUpperCase()} · ${note.toUpperCase()}` : name.toUpperCase();
}

function regionOf(game: ObtainGame): string {
  return REGION_OF_VERSION_GROUP[game.versionGroup];
}

function prettyVersions(versions: string[]): string {
  return versions.map((v) => v.toUpperCase().replace(/-/g, ' ')).join(' / ');
}

// Raw PokéAPI condition slugs read badly on chips ("weather-intense-sun",
// "story-progress-hall-of-fame"); shorten the noisy families before the
// generic uppercase fallback.
const CONDITION_LABELS: Record<string, string> = {
  'weather-normal': 'CLEAR WEATHER',
  'slot2-none': 'NO GBA CART',
  'swarm-yes': 'DAILY SWARM',
  'swarm-no': 'NO SWARM ACTIVE',
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
  overworld: 'VISIBLE SPAWN',
  'overworld-water': 'VISIBLE ON WATER',
  'overworld-flying': 'VISIBLE FLYING',
  'overworld-dirt': 'VISIBLE ON DIRT',
  'overworld-special': 'RARE VISIBLE SPAWN',
  'overworld-flying-special': 'RARE VISIBLE FLYING',
  'overworld-water-special': 'RARE VISIBLE ON WATER',
  wanderer: 'WANDERING SPAWN',
  'wanderer-water': 'WANDERING ON WATER',
  'bubbling-spots': 'BUBBLING SPOT',
  'super-rod-spots': 'SUPER ROD SPOT',
  'surf-spots': 'SURF SPOT',
  'grass-spots': 'GRASS SPOT',
  'cave-spots': 'CAVE SPOT',
  'bridge-spots': 'BRIDGE SPOT',
  'ceiling-ambush': 'CEILING AMBUSH',
  'ground-ambush': 'GROUND AMBUSH',
  'sky-ambush': 'SKY AMBUSH',
  'rustling-bush-ambush': 'RUSTLING BUSH',
  'trash-can-ambush': 'TRASH CAN AMBUSH',
  'berry-trees': 'SHAKING BERRY TREE',
  'feebas-tile-fishing': 'SPECIAL FISHING TILES',
  static: 'FIXED ENCOUNTER',
  'hidden-grotto': 'HIDDEN GROTTO',
  horde: 'HORDE ENCOUNTER',
  sos: 'SOS CALL',
  'sos-from-bubbling-spot': 'SOS AT BUBBLING SPOT',
  'island-scan': 'ISLAND SCAN',
  'honey-tree': 'HONEY TREE',
  headbutt: 'HEADBUTT TREE',
  'headbutt-low': 'HEADBUTT TREE (LOW RATE)',
  'headbutt-normal': 'HEADBUTT TREE (NORMAL RATE)',
  'headbutt-high': 'HEADBUTT TREE (HIGH RATE)',
  'headbutt-tree-common': 'HEADBUTT TREE (COMMON)',
  'headbutt-tree-rare': 'HEADBUTT TREE (RARE)',
  'headbutt-tree-secret': 'HEADBUTT TREE (SECRET)',
  'johto-safari-blocks-inactive': 'SAFARI ZONE: NO BLOCKS',
  'backlot-mentioned': 'MENTIONED BY MR. BACKLOT',
  'backlot-not-mentioned': 'NOT MENTIONED BY MR. BACKLOT',
  pokeflute: 'POKé FLUTE',
  'squirt-bottle': 'SQUIRT BOTTLE',
  'wailmer-pail': 'WAILMER PAIL',
  'devon-scope': 'DEVON SCOPE',
  'colosseum-bonus-disc-jpn': 'COLOSSEUM BONUS DISC (JP)',
  'colosseum-bonus-disc-us': 'COLOSSEUM BONUS DISC',
  'tv-option-red': 'TV SET TO RED',
  'tv-option-blue': 'TV SET TO BLUE',
  'save-data-from-lets-go-pikachu': "LET'S GO PIKACHU SAVE DATA",
  'save-data-from-lets-go-eevee': "LET'S GO EEVEE SAVE DATA",
  'max-raid': 'MAX RAID DEN',
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
  const berryType = slug.match(/^berry-tree-type-(\w+)$/);
  if (berryType) return `${berryType[1].toUpperCase()} BERRY TREE`;
  const honeyGroup = slug.match(/^honey-tree-group-(\w)$/);
  if (honeyGroup) return `HONEY TREE (GROUP ${honeyGroup[1].toUpperCase()})`;
  const safariSlot = slug.match(/^friend-safari-slot-(\d)$/);
  if (safariSlot) return `FRIEND SAFARI SLOT ${safariSlot[1]}`;
  if (slug.startsWith('great-marsh-daily-slot-')) return 'GREAT MARSH DAILY ROTATION';
  const johtoBlocks = slug.match(/^johto-safari-blocks-(\w+)-min-(\d+)$/);
  if (johtoBlocks) return `SAFARI ZONE: ${johtoBlocks[2]}+ ${johtoBlocks[1].toUpperCase()} BLOCKS`;
  let s = slug;
  for (const [re, repl] of CONDITION_PREFIXES) {
    if (re.test(s)) {
      s = s.replace(re, repl);
      break;
    }
  }
  return s.toUpperCase().replace(/-/g, ' ');
}

const RODS = new Set(['old-rod', 'good-rod', 'super-rod', 'super-rod-spots']);

// Text-presentation selector — keeps these glyphs flat/monochrome instead of
// letting a platform render an emoji-colored version.
const VS = '︎';

interface ConditionMeta {
  icon: string;
  color: string;
}

function conditionMeta(slug: string): ConditionMeta {
  if (slug.startsWith('time-')) return { icon: `◔${VS}`, color: TYPE_COLORS.electric };
  if (slug.startsWith('season-')) return { icon: `✿${VS}`, color: TYPE_COLORS.fairy };
  if (slug.startsWith('weather-')) {
    let icon = `☂${VS}`;
    if (slug.includes('intense-sun')) icon = `☀${VS}`;
    else if (slug.includes('snow')) icon = `❄${VS}`;
    else if (slug.includes('thunderstorm')) icon = `⚡${VS}`;
    return { icon, color: TYPE_COLORS.water };
  }
  if (RODS.has(slug)) return { icon: `≈${VS}`, color: TYPE_COLORS.ice };
  if (slug.startsWith('max-raid') || slug.startsWith('max-den-')) {
    return { icon: `★${VS}`, color: TYPE_COLORS.fire };
  }
  if (slug.startsWith('story-progress-')) return { icon: `⚑${VS}`, color: TYPE_COLORS.psychic };
  if (slug.startsWith('trade-')) return { icon: `⇄${VS}`, color: TYPE_COLORS.psychic };
  if (slug.startsWith('slot2-')) return { icon: `◎${VS}`, color: TYPE_COLORS.steel };
  return { icon: `✧${VS}`, color: 'var(--dim)' };
}

function levelRate(e: ObtainEntry): string {
  const bits: string[] = [];
  if (e.minLevel !== undefined && e.maxLevel !== undefined) {
    bits.push(e.minLevel === e.maxLevel ? `L${e.minLevel}` : `L${e.minLevel}–${e.maxLevel}`);
  }
  if (e.chance !== undefined) bits.push(`${e.chance}%`);
  return bits.join(' · ');
}

// Sanctioned colorful-chip pattern from `PokemonCard.tsx`'s type pills:
// palette color as text + border, plus a matching low-opacity glow.
function tintStyle(color: string): React.CSSProperties {
  return { color, borderColor: color, textShadow: `0 0 4px ${color}66` };
}

function EntryRow({ entry }: { entry: ObtainEntry }) {
  const meta = levelRate(entry);
  return (
    <li className="crt-obtain-row">
      <span className="crt-obtain-tag" style={tintStyle(METHOD_COLOR[entry.method])}>
        {METHOD_LABEL[entry.method]}
      </span>
      {entry.location && <span className="crt-obtain-loc">{entry.location}</span>}
      {meta && <span className="crt-obtain-meta">{meta}</span>}
      {entry.conditions?.map((c) => {
        const { icon, color } = conditionMeta(c);
        return (
          <span key={c} className="crt-obtain-cond" style={tintStyle(color)}>
            {icon} {prettyCondition(c)}
          </span>
        );
      })}
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

const LEGEND_METHODS: [ObtainEntry['method'], string][] = [
  ['grass', 'wild grass'],
  ['surf', 'while surfing'],
  ['fish', 'fishing rod'],
  ['cave', 'cave/rock smash'],
  ['wild', 'wild (method unknown)'],
  ['static', 'fixed encounter'],
  ['gift', 'from an NPC'],
  ['trade', 'in-game NPC trade'],
  ['egg', 'breed & hatch'],
  ['evolve', 'evolve pre-evolution'],
  ['transfer', 'from another game'],
  ['unavailable', 'not available'],
  ['special', 'special method (headbutt, island scan, honey tree…)'],
];

const LEGEND_CONDITIONS: { icon: string; color: string; label: string }[] = [
  { icon: `◔${VS}`, color: TYPE_COLORS.electric, label: 'time of day' },
  { icon: `✿${VS}`, color: TYPE_COLORS.fairy, label: 'season' },
  { icon: `☂${VS}`, color: TYPE_COLORS.water, label: 'weather' },
  { icon: `≈${VS}`, color: TYPE_COLORS.ice, label: 'fishing rod' },
  { icon: `★${VS}`, color: TYPE_COLORS.fire, label: 'raid den' },
  { icon: `⚑${VS}`, color: TYPE_COLORS.psychic, label: 'story progress' },
  { icon: `⇄${VS}`, color: TYPE_COLORS.psychic, label: 'required trade' },
  { icon: `◎${VS}`, color: TYPE_COLORS.steel, label: 'GBA cartridge' },
  {
    icon: `✧${VS}`,
    color: 'var(--dim)',
    label:
      'special requirement — the chip says which (swarms, honey trees, safari zones, SOS calls, hidden grottoes…)',
  },
];

function Legend() {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="crt-obtain-legend"
      onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => setOpen(e.currentTarget.open)}
    >
      <summary>{open ? '▼' : '▶'} LEGEND</summary>
      <div className="crt-obtain-legend-section">
        <div className="crt-obtain-legend-title">METHODS</div>
        <ul className="crt-obtain-legend-list">
          {LEGEND_METHODS.map(([method, gloss]) => (
            <li key={method}>
              <span className="crt-obtain-tag" style={tintStyle(METHOD_COLOR[method])}>
                {METHOD_LABEL[method]}
              </span>{' '}
              {gloss}
            </li>
          ))}
        </ul>
      </div>
      <div className="crt-obtain-legend-section">
        <div className="crt-obtain-legend-title">CONDITIONS</div>
        <ul className="crt-obtain-legend-list">
          {LEGEND_CONDITIONS.map(({ icon, color, label }) => (
            <li key={icon}>
              <span className="crt-obtain-cond" style={tintStyle(color)}>
                {icon}
              </span>{' '}
              {label}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export default function ObtainMethods({ data, loading, error, currentGen, enabled }: Props) {
  const [userExpanded, setUserExpanded] = useState<Set<string> | null>(null);
  // Between `enabled` flipping true and the fetch effect's first state update,
  // `loading` is still false — treat that gap as loading too so there's no
  // one-frame "UNAVAILABLE" flash before the request even starts.
  if (loading || (enabled && !data && !error)) {
    return <div className="crt-obtain-status">LOADING OBTAIN DATA…</div>;
  }
  if (error || !data) return <div className="crt-obtain-status">OBTAIN DATA UNAVAILABLE</div>;

  const regions = REGIONS.filter((r) => data.games.some((g) => regionOf(g) === r.name));
  // Regional forms can carry a `currentGen` whose home region the file's
  // games never reach (e.g. Alolan Vulpix is gen 1, but its file starts in
  // Alola) — default to the first region actually present.
  const homeRegion = getGen(currentGen).region;
  const defaultRegion = regions.some((r) => r.name === homeRegion) ? homeRegion : regions[0]?.name;
  const expanded = userExpanded ?? new Set(defaultRegion === undefined ? [] : [defaultRegion]);
  const toggle = (region: string) =>
    setUserExpanded((prev) => {
      const next = new Set(prev ?? expanded);
      if (next.has(region)) next.delete(region);
      else next.add(region);
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
      <Legend />
      {regions.map((region) => {
        const open = expanded.has(region.name);
        const gamesInRegion = data.games.filter((g) => regionOf(g) === region.name);
        return (
          <div key={region.name} className="crt-obtain-region">
            <button
              type="button"
              className="crt-obtain-region-toggle"
              aria-expanded={open}
              onClick={() => toggle(region.name)}
            >
              {open ? '▼' : '▶'} {regionLabel(region)}
            </button>
            {open && gamesInRegion.map((g, i) => <GameRow key={i} game={g} />)}
          </div>
        );
      })}
    </div>
  );
}
