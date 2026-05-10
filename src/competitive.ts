export interface SmogonSet {
  moves: (string | string[])[];
  ability?: string | string[];
  item?: string | string[];
  nature?: string | string[];
  evs?: Partial<Record<'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe', number>>;
  ivs?: Partial<Record<'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe', number>>;
  teratypes?: string | string[];
}

type SmogonData = Record<string, Record<string, Record<string, SmogonSet>>>;

const URL = 'https://pkmn.github.io/smogon/data/sets/gen8.json';

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
  'doubles',
  '2v2doubles',
  'monotype',
];

let cached: SmogonData | null = null;
let inflight: Promise<SmogonData> | null = null;

export async function fetchSmogonData(): Promise<SmogonData> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetch(URL)
      .then((r) => {
        if (!r.ok) throw new Error('Smogon data unavailable');
        return r.json() as Promise<SmogonData>;
      })
      .then((d) => {
        cached = d;
        return d;
      });
  }
  return inflight;
}

function pokeapiToSmogon(name: string): string {
  return name
    .split('-')
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join('-');
}

export interface ResolvedBuild {
  pokemonKey: string;
  tier: string;
  buildName: string;
  set: SmogonSet;
}

export function pickBuild(data: SmogonData, pokeapiName: string): ResolvedBuild | null {
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
      return { pokemonKey: key, tier, buildName, set: builds[buildName] };
    }
    const fallbackTier = Object.keys(tiers)[0];
    if (fallbackTier) {
      const builds = tiers[fallbackTier];
      const buildName = Object.keys(builds)[0];
      return { pokemonKey: key, tier: fallbackTier, buildName, set: builds[buildName] };
    }
  }
  return null;
}

export function formatEVs(evs?: SmogonSet['evs']): string {
  if (!evs) return '—';
  const labels: Record<string, string> = {
    hp: 'HP',
    atk: 'Atk',
    def: 'Def',
    spa: 'SpA',
    spd: 'SpD',
    spe: 'Spe',
  };
  const parts = Object.entries(evs)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k, v]) => `${v} ${labels[k] ?? k}`);
  return parts.length > 0 ? parts.join(' / ') : '—';
}

export function formatMaybeArray(value: string | string[] | undefined): string {
  if (!value) return '—';
  if (Array.isArray(value)) return value.join(' / ');
  return value;
}
