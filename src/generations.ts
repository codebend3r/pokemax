// Static metadata for the 9 main-series generations.

export interface GenerationMeta {
  num: number;
  roman: string;
  region: string;
  versionGroups: string[];
  // The version group used to source the move list (most recent canonical pair).
  primaryVersionGroup: string;
}

// prettier-ignore
export const GENERATIONS: GenerationMeta[] = [
  { num: 1, roman: 'I',    region: 'Kanto',   versionGroups: ['red-blue', 'yellow'],                               primaryVersionGroup: 'red-blue' },
  { num: 2, roman: 'II',   region: 'Johto',   versionGroups: ['gold-silver', 'crystal'],                           primaryVersionGroup: 'gold-silver' },
  { num: 3, roman: 'III',  region: 'Hoenn',   versionGroups: ['ruby-sapphire', 'emerald', 'firered-leafgreen'],    primaryVersionGroup: 'ruby-sapphire' },
  { num: 4, roman: 'IV',   region: 'Sinnoh',  versionGroups: ['diamond-pearl', 'platinum', 'heartgold-soulsilver'], primaryVersionGroup: 'diamond-pearl' },
  { num: 5, roman: 'V',    region: 'Unova',   versionGroups: ['black-white', 'black-2-white-2'],                   primaryVersionGroup: 'black-white' },
  { num: 6, roman: 'VI',   region: 'Kalos',   versionGroups: ['x-y', 'omega-ruby-alpha-sapphire'],                 primaryVersionGroup: 'x-y' },
  { num: 7, roman: 'VII',  region: 'Alola',   versionGroups: ['sun-moon', 'ultra-sun-ultra-moon', 'lets-go-pikachu-lets-go-eevee'], primaryVersionGroup: 'sun-moon' },
  { num: 8, roman: 'VIII', region: 'Galar',   versionGroups: ['sword-shield', 'brilliant-diamond-shining-pearl', 'legends-arceus'], primaryVersionGroup: 'sword-shield' },
  { num: 9, roman: 'IX',   region: 'Paldea',  versionGroups: ['scarlet-violet'],                                   primaryVersionGroup: 'scarlet-violet' },
];

export function getGen(num: number): GenerationMeta {
  return GENERATIONS.find((g) => g.num === num) ?? GENERATIONS[7];
}

export interface RegionMeta {
  name: string;
  /** Shown beside the name when the region needs context ("Ancient Sinnoh"). */
  note?: string;
  /** Version groups set in this region, in release order. */
  versionGroups: string[];
}

/**
 * The canonical region model: every version group grouped by the region it is
 * SET in, regions in first-appearance order. This is deliberately not the same
 * as `GenerationMeta.region` — a remake belongs to its setting, not to the
 * generation that shipped it (BDSP is Sinnoh, not Galar). Hisui is its own
 * region placed right after Sinnoh, since it's Sinnoh's ancient past.
 *
 * `GAMES_BY_REGION` (`trainers.ts`) and the obtain panel both derive from this
 * — `obtainTypes.test.ts` pins the coverage against `GENERATIONS`.
 */
// prettier-ignore
export const REGIONS: RegionMeta[] = [
  { name: 'Kanto',  versionGroups: ['red-blue', 'yellow', 'firered-leafgreen', 'lets-go-pikachu-lets-go-eevee'] },
  { name: 'Johto',  versionGroups: ['gold-silver', 'crystal', 'heartgold-soulsilver'] },
  { name: 'Hoenn',  versionGroups: ['ruby-sapphire', 'emerald', 'omega-ruby-alpha-sapphire'] },
  { name: 'Sinnoh', versionGroups: ['diamond-pearl', 'platinum', 'brilliant-diamond-shining-pearl'] },
  { name: 'Hisui',  note: 'Ancient Sinnoh', versionGroups: ['legends-arceus'] },
  { name: 'Unova',  versionGroups: ['black-white', 'black-2-white-2'] },
  { name: 'Kalos',  versionGroups: ['x-y'] },
  { name: 'Alola',  versionGroups: ['sun-moon', 'ultra-sun-ultra-moon'] },
  { name: 'Galar',  versionGroups: ['sword-shield'] },
  { name: 'Paldea', versionGroups: ['scarlet-violet'] },
];

export const REGION_OF_VERSION_GROUP: Record<string, string> = Object.fromEntries(
  REGIONS.flatMap((r) => r.versionGroups.map((vg) => [vg, r.name])),
);
