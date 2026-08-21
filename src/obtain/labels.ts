// Display vocabulary for the obtain dataset: how each method, condition slug,
// and level/rate reads on screen. Kept out of `ObtainMethods.tsx` so the
// component is rendering logic and this is the table it renders from.
import type { ObtainEntry } from '@/obtain/types';
import { ROD_METHODS } from '@/obtain/pokeapi';
import { TYPE_COLORS } from '@/typeChart';

export const METHOD_LABEL: Record<ObtainEntry['method'], string> = {
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
export const METHOD_COLOR: Record<ObtainEntry['method'], string> = {
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

// Text-presentation selector — keeps these glyphs flat/monochrome instead of
// letting a platform render an emoji-colored version.
const VS = '︎';

export interface ConditionMeta {
  icon: string;
  color: string;
}
// Raw PokéAPI condition slugs read badly on chips ("weather-intense-sun",
// "story-progress-hall-of-fame"); shorten the noisy families before the
// generic uppercase fallback.
export const CONDITION_LABELS: Record<string, string> = {
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

export function prettyCondition(slug: string): string {
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

export function conditionMeta(slug: string): ConditionMeta {
  const family = familyOf(slug);
  if (!family?.icon || !family.color) return DEFAULT_CONDITION;
  const variant = family.variants?.find((v) => slug.includes(v.when));
  return { icon: variant?.icon ?? family.icon, color: family.color };
}

export function levelRate(e: ObtainEntry): string {
  const bits: string[] = [];
  if (e.minLevel !== undefined && e.maxLevel !== undefined) {
    bits.push(e.minLevel === e.maxLevel ? `L${e.minLevel}` : `L${e.minLevel}–${e.maxLevel}`);
  }
  if (e.chance !== undefined) bits.push(`${e.chance}%`);
  return bits.join(' · ');
}

export const LEGEND_METHODS: [ObtainEntry['method'], string][] = [
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
export const LEGEND_CONDITIONS: { icon: string; color: string; label: string }[] = [
  ...CONDITION_FAMILIES.flatMap((f) =>
    f.legend && f.icon && f.color ? [{ icon: f.icon, color: f.color, label: f.legend }] : [],
  ),
  {
    ...DEFAULT_CONDITION,
    label:
      'special requirement — the chip says which (swarms, honey trees, safari zones, SOS calls, hidden grottoes…)',
  },
];
