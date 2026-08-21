import { useState, type SyntheticEvent } from 'react';
import { getGen, REGIONS, REGION_OF_VERSION_GROUP } from '@/generations';
import type { ObtainState } from '@/hooks/useObtainData';
import { ROD_METHODS } from '@/obtain/pokeapi';
import type { ObtainEntry, ObtainFile, ObtainGame } from '@/obtain/types';
import { TYPE_COLORS } from '@/typeChart';

interface Props {
  state: ObtainState;
  currentGen: number;
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

// Text-presentation selector — keeps these glyphs flat/monochrome instead of
// letting a platform render an emoji-colored version.
const VS = '︎';

interface ConditionMeta {
  icon: string;
  color: string;
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

interface ConditionFamily {
  /** Slug prefixes this family owns. */
  prefixes?: string[];
  /** Exact slugs, for families with no common prefix. */
  slugs?: ReadonlySet<string>;
  icon?: string;
  /** Swaps the icon when the slug contains one of these fragments. */
  variants?: { when: string; icon: string }[];
  color?: string;
  /** Replaces the matched prefix in the display label; `''` strips it. */
  strip?: string;
  /** Legend gloss. Families without one get no legend row. */
  legend?: string;
}

// One table per condition family — the display label, the chip icon/color, and
// the legend row all read from here, so a new family is one entry, not three.
// Order matters: the first matching family wins.
const CONDITION_FAMILIES: ConditionFamily[] = [
  {
    prefixes: ['time-'],
    icon: `◔${VS}`,
    color: TYPE_COLORS.electric,
    strip: '',
    legend: 'time of day',
  },
  { prefixes: ['season-'], icon: `✿${VS}`, color: TYPE_COLORS.fairy, strip: '', legend: 'season' },
  {
    prefixes: ['weather-'],
    icon: `☂${VS}`,
    variants: [
      { when: 'intense-sun', icon: `☀${VS}` },
      { when: 'snow', icon: `❄${VS}` },
      { when: 'thunderstorm', icon: `⚡${VS}` },
    ],
    color: TYPE_COLORS.water,
    strip: '',
    legend: 'weather',
  },
  { slugs: ROD_METHODS, icon: `≈${VS}`, color: TYPE_COLORS.ice, legend: 'fishing rod' },
  {
    prefixes: ['max-raid', 'max-den-'],
    icon: `★${VS}`,
    color: TYPE_COLORS.fire,
    legend: 'raid den',
  },
  {
    prefixes: ['story-progress-'],
    icon: `⚑${VS}`,
    color: TYPE_COLORS.psychic,
    strip: '',
    legend: 'story progress',
  },
  {
    prefixes: ['trade-'],
    icon: `⇄${VS}`,
    color: TYPE_COLORS.psychic,
    strip: 'GIVE ',
    legend: 'required trade',
  },
  {
    prefixes: ['slot2-'],
    icon: `◎${VS}`,
    color: TYPE_COLORS.steel,
    strip: 'GBA: ',
    legend: 'GBA cartridge',
  },
  { prefixes: ['weekday-'], strip: '' },
  { prefixes: ['other-'], strip: '' },
  { prefixes: ['item-'], strip: '' },
  { prefixes: ['radio-'], strip: 'RADIO: ' },
  { prefixes: ['starter-'], strip: 'STARTER: ' },
];

const DEFAULT_CONDITION: ConditionMeta = { icon: `✧${VS}`, color: 'var(--dim)' };

function familyOf(slug: string): ConditionFamily | undefined {
  return CONDITION_FAMILIES.find(
    (f) => f.slugs?.has(slug) ?? f.prefixes?.some((p) => slug.startsWith(p)),
  );
}

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
  const family = familyOf(slug);
  if (family?.strip !== undefined) {
    const prefix = family.prefixes?.find((p) => slug.startsWith(p));
    if (prefix !== undefined) {
      return (family.strip + slug.slice(prefix.length)).toUpperCase().replace(/-/g, ' ');
    }
  }
  return slug.toUpperCase().replace(/-/g, ' ');
}

function conditionMeta(slug: string): ConditionMeta {
  const family = familyOf(slug);
  if (!family?.icon || !family.color) return DEFAULT_CONDITION;
  const variant = family.variants?.find((v) => slug.includes(v.when));
  return { icon: variant?.icon ?? family.icon, color: family.color };
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

// Derived from `CONDITION_FAMILIES` so a new family shows up in the legend for
// free — the fallback row is appended last because it matches nothing directly.
const LEGEND_CONDITIONS: { icon: string; color: string; label: string }[] = [
  ...CONDITION_FAMILIES.filter((f) => f.legend && f.icon && f.color).map((f) => ({
    icon: f.icon ?? '',
    color: f.color ?? '',
    label: f.legend ?? '',
  })),
  {
    ...DEFAULT_CONDITION,
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

// Mounted only once the file is loaded, so the default open region is known at
// mount and expansion is plain, non-nullable state. Deliberately NOT persisted
// via `useExpandedRegions` — that hook's stored value would carry one Pokémon's
// open region onto the next, whose regions are a different set entirely.
function ObtainRegions({ file, currentGen }: { file: ObtainFile; currentGen: number }) {
  const regions = REGIONS.filter((r) => file.games.some((g) => regionOf(g) === r.name));
  // Regional forms can carry a `currentGen` whose home region the file's
  // games never reach (e.g. Alolan Vulpix is gen 1, but its file starts in
  // Alola) — default to the first region actually present.
  const homeRegion = getGen(currentGen).region;
  const defaultRegion = regions.some((r) => r.name === homeRegion) ? homeRegion : regions[0]?.name;
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultRegion === undefined ? [] : [defaultRegion]),
  );
  const toggle = (region: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });

  return (
    <div className="crt-obtain">
      {file.breeding && (
        <div className="crt-obtain-breeding">
          EGG GROUPS: {file.breeding.eggGroups.map((g) => g.toUpperCase()).join('/')}
          {file.breeding.breedable
            ? ` · HATCH: ${file.breeding.hatchCycles} CYCLES (${file.breeding.steps.toLocaleString('en-US')} STEPS)`
            : ' · CANNOT BREED'}
        </div>
      )}
      <Legend />
      {regions.map((region) => {
        const open = expanded.has(region.name);
        const gamesInRegion = file.games.filter((g) => regionOf(g) === region.name);
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

export default function ObtainMethods({ state, currentGen }: Props) {
  if (state.status === 'loading') {
    return <div className="crt-obtain-status">LOADING OBTAIN DATA…</div>;
  }
  if (state.status !== 'ready') {
    return <div className="crt-obtain-status">OBTAIN DATA UNAVAILABLE</div>;
  }
  return <ObtainRegions file={state.file} currentGen={currentGen} />;
}
