import { GENERATIONS } from '@/generations';

export type ObtainMethod =
  | 'grass'
  | 'surf'
  | 'fish'
  | 'cave'
  | 'wild'
  | 'static'
  | 'gift'
  | 'trade'
  | 'egg'
  | 'evolve'
  | 'transfer'
  | 'unavailable'
  | 'special';

export interface ObtainEntry {
  method: ObtainMethod;
  location?: string;
  minLevel?: number;
  maxLevel?: number;
  chance?: number; // percent, when known (PokéAPI gens)
  conditions?: string[]; // 'night', 'old-rod', 'swarm', …
  detail?: string; // "Trade a SPEAROW to an NPC", "Evolve Pikachu/Pichu"
}

export interface ObtainGame {
  gen: number;
  versionGroup: string;
  versions: string[]; // merged when entry lists are identical
  entries: ObtainEntry[];
}

export interface ObtainBreeding {
  eggGroups: string[];
  hatchCycles: number; // species hatch_counter
  steps: number; // hatchCycles * 256, display convenience
  breedable: boolean; // false when egg group is no-eggs
}

export interface ObtainFile {
  pokemonId: number;
  name: string;
  breeding: ObtainBreeding | null;
  games: ObtainGame[];
}

// PokéAPI version names per version group, canonical release order.
// prettier-ignore
export const VERSION_GROUP_VERSIONS: Record<string, string[]> = {
  'red-blue': ['red', 'blue'],
  'yellow': ['yellow'],
  'gold-silver': ['gold', 'silver'],
  'crystal': ['crystal'],
  'ruby-sapphire': ['ruby', 'sapphire'],
  'emerald': ['emerald'],
  'firered-leafgreen': ['firered', 'leafgreen'],
  'diamond-pearl': ['diamond', 'pearl'],
  'platinum': ['platinum'],
  'heartgold-soulsilver': ['heartgold', 'soulsilver'],
  'black-white': ['black', 'white'],
  'black-2-white-2': ['black-2', 'white-2'],
  'x-y': ['x', 'y'],
  'omega-ruby-alpha-sapphire': ['omega-ruby', 'alpha-sapphire'],
  'sun-moon': ['sun', 'moon'],
  'ultra-sun-ultra-moon': ['ultra-sun', 'ultra-moon'],
  'lets-go-pikachu-lets-go-eevee': ['lets-go-pikachu', 'lets-go-eevee'],
  'sword-shield': ['sword', 'shield'],
  'brilliant-diamond-shining-pearl': ['brilliant-diamond', 'shining-pearl'],
  'legends-arceus': ['legends-arceus'],
  'scarlet-violet': ['scarlet', 'violet'],
};

export const VERSION_ORDER: string[] = GENERATIONS.flatMap((g) =>
  g.versionGroups.flatMap((vg) => VERSION_GROUP_VERSIONS[vg] ?? []),
);

export const VERSION_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(VERSION_GROUP_VERSIONS).flatMap(([group, versions]) =>
    versions.map((v) => [v, group]),
  ),
);

export const GROUP_GEN: Record<string, number> = Object.fromEntries(
  GENERATIONS.flatMap((g) => g.versionGroups.map((vg) => [vg, g.num])),
);

export function isObtainFile(v: unknown): v is ObtainFile {
  if (typeof v !== 'object' || v === null) return false;
  const o: Record<string, unknown> = { ...v };
  return (
    typeof o.pokemonId === 'number' &&
    typeof o.name === 'string' &&
    Array.isArray(o.games) &&
    'breeding' in o
  );
}
