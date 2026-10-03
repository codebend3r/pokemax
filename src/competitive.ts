import { memoAsync } from '@/async';
import { isRecord } from '@/guards';

type StatSpread = Partial<Record<'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe', number>>;

export interface SmogonSet {
  moves: (string | string[])[];
  ability?: string | string[];
  item?: string | string[];
  nature?: string | string[];
  /** A list when the set offers alternative spreads. */
  evs?: StatSpread | StatSpread[];
  ivs?: StatSpread | StatSpread[];
  teratypes?: string | string[];
}

type SmogonData = Record<string, Record<string, Record<string, SmogonSet>>>;

const isStringOrList = (v: unknown): boolean =>
  v === undefined ||
  typeof v === 'string' ||
  (Array.isArray(v) && v.every((x) => typeof x === 'string'));

const isSpreads = (v: unknown): boolean =>
  v === undefined || isRecord(v) || (Array.isArray(v) && v.every(isRecord));

function isSmogonSet(v: unknown): v is SmogonSet {
  return (
    isRecord(v) &&
    Array.isArray(v.moves) &&
    v.moves.every(isStringOrList) &&
    isStringOrList(v.ability) &&
    isStringOrList(v.item) &&
    isStringOrList(v.nature) &&
    isStringOrList(v.teratypes) &&
    isSpreads(v.evs) &&
    isSpreads(v.ivs)
  );
}

/** Species → format → set name → set. */
function isSmogonData(v: unknown): v is SmogonData {
  return (
    isRecord(v) &&
    Object.values(v).every(
      (formats) =>
        isRecord(formats) &&
        Object.values(formats).every(
          (sets) => isRecord(sets) && Object.values(sets).every(isSmogonSet),
        ),
    )
  );
}

const TIER_PRIORITY = [
  'ou',
  'ubers',
  'ag',
  'uu',
  'ru',
  'nu',
  'pu',
  'zu',
  'lc',
  'vgc2022',
  'vgc2023',
  'vgc2024',
  'doubles',
  '2v2doubles',
  'monotype',
];

/** Every Smogon set for one gen — one sizeable JSON per gen, fetched on demand. */
export const smogonSets = memoAsync(async (gen: number): Promise<SmogonData> => {
  const r = await fetch(`https://pkmn.github.io/smogon/data/sets/gen${gen}.json`);
  if (!r.ok) throw new Error('Smogon data unavailable');
  const data: unknown = await r.json();
  if (!isSmogonData(data)) throw new Error('Malformed Smogon data');
  return data;
});

function pokeapiToSmogon(name: string): string {
  return name
    .split('-')
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join('-');
}

/**
 * Walk Smogon gens from latest to oldest and return the first complete-ish set
 * for the given Pokémon. Older gens (1-2) had no abilities/items/natures/EVs, so
 * preferring the latest gen surfaces the richer modern competitive build.
 * A failed fetch rejects — `null` strictly means "Smogon has no set".
 */
export const bestBuilds = memoAsync(async (name: string): Promise<ResolvedBuild | null> => {
  for (const gen of [9, 8, 7, 6, 5, 4, 3, 2, 1]) {
    const build = pickBuild(await smogonSets.get(gen), name, gen);
    if (build) return build;
  }
  return null;
});

/** Smogon strategy-dex slug for a gen (`smogon.com/dex/<slug>`). */
export const SMOGON_DEX_SLUGS: Record<number, string> = {
  1: 'rb',
  2: 'gs',
  3: 'rs',
  4: 'dp',
  5: 'bw',
  6: 'xy',
  7: 'sm',
  8: 'ss',
  9: 'sv',
};

export interface ResolvedBuild {
  pokemonKey: string;
  tier: string;
  buildName: string;
  set: SmogonSet;
  /** Which Smogon gen JSON the set came from (1..9). */
  sourceGen: number;
}

export function pickBuild(
  data: SmogonData,
  pokeapiName: string,
  sourceGen: number,
): ResolvedBuild | null {
  const candidates = [pokeapiToSmogon(pokeapiName)];
  const baseName = pokeapiName.split('-')[0];
  if (baseName !== pokeapiName) candidates.push(pokeapiToSmogon(baseName));

  for (const key of candidates) {
    const tiers = data[key];
    if (!tiers) continue;
    for (const tier of TIER_PRIORITY) {
      const builds = tiers[tier];
      if (!builds) continue;
      const buildName = Object.keys(builds)[0];
      return { pokemonKey: key, tier, buildName, set: builds[buildName], sourceGen };
    }
    const fallbackTier = Object.keys(tiers)[0];
    if (fallbackTier) {
      const builds = tiers[fallbackTier];
      const buildName = Object.keys(builds)[0];
      return {
        pokemonKey: key,
        tier: fallbackTier,
        buildName,
        set: builds[buildName],
        sourceGen,
      };
    }
  }
  return null;
}

const SPREAD_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

function formatSpread(spread: StatSpread): string {
  return Object.entries(spread)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k, v]) => `${v} ${SPREAD_LABELS[k] ?? k}`)
    .join(' / ');
}

export function formatEVs(evs?: SmogonSet['evs']): string {
  if (!evs) return '—';
  const spreads = (Array.isArray(evs) ? evs : [evs]).map(formatSpread).filter(Boolean);
  return spreads.length > 0 ? spreads.join(' or ') : '—';
}
