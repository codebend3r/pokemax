// The canonical game catalog. A game is a PokéAPI version group, and every id
// below is its version-group slug — so obtain data, trainer rosters, curated
// teams, and item sources all speak one vocabulary. Every other per-game or
// per-region table in the app is derived from this file.

export const REGION_NAMES = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Hisui',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea',
] as const;

export type RegionName = (typeof REGION_NAMES)[number];

export interface GameMeta {
  label: string;
  /** Core-series generation the game shipped in — keys Smogon set lookups. */
  gen: number;
  /** Newest generation whose Pokémon the game's dex holds — caps counter picks. */
  dexGen: number;
  /** Region the game is SET in — a remake belongs to its setting (BDSP is Sinnoh). */
  region: RegionName;
  /** PokéAPI version slugs, in release order. */
  versions: readonly string[];
}

// Generation order, release order within a generation.
// prettier-ignore
export const GAMES = {
  'red-blue':                        { label: 'Red / Blue',                       gen: 1, dexGen: 1, region: 'Kanto',  versions: ['red', 'blue'] },
  'yellow':                          { label: 'Yellow',                           gen: 1, dexGen: 1, region: 'Kanto',  versions: ['yellow'] },
  'gold-silver':                     { label: 'Gold / Silver',                    gen: 2, dexGen: 2, region: 'Johto',  versions: ['gold', 'silver'] },
  'crystal':                         { label: 'Crystal',                          gen: 2, dexGen: 2, region: 'Johto',  versions: ['crystal'] },
  'ruby-sapphire':                   { label: 'Ruby / Sapphire',                  gen: 3, dexGen: 3, region: 'Hoenn',  versions: ['ruby', 'sapphire'] },
  'emerald':                         { label: 'Emerald',                          gen: 3, dexGen: 3, region: 'Hoenn',  versions: ['emerald'] },
  'firered-leafgreen':               { label: 'FireRed / LeafGreen',              gen: 3, dexGen: 3, region: 'Kanto',  versions: ['firered', 'leafgreen'] },
  'diamond-pearl':                   { label: 'Diamond / Pearl',                  gen: 4, dexGen: 4, region: 'Sinnoh', versions: ['diamond', 'pearl'] },
  'platinum':                        { label: 'Platinum',                         gen: 4, dexGen: 4, region: 'Sinnoh', versions: ['platinum'] },
  'heartgold-soulsilver':            { label: 'HeartGold / SoulSilver',           gen: 4, dexGen: 4, region: 'Johto',  versions: ['heartgold', 'soulsilver'] },
  'black-white':                     { label: 'Black / White',                    gen: 5, dexGen: 5, region: 'Unova',  versions: ['black', 'white'] },
  'black-2-white-2':                 { label: 'Black 2 / White 2',                gen: 5, dexGen: 5, region: 'Unova',  versions: ['black-2', 'white-2'] },
  'x-y':                             { label: 'X / Y',                            gen: 6, dexGen: 6, region: 'Kalos',  versions: ['x', 'y'] },
  'omega-ruby-alpha-sapphire':       { label: 'Omega Ruby / Alpha Sapphire',      gen: 6, dexGen: 6, region: 'Hoenn',  versions: ['omega-ruby', 'alpha-sapphire'] },
  'sun-moon':                        { label: 'Sun / Moon',                       gen: 7, dexGen: 7, region: 'Alola',  versions: ['sun', 'moon'] },
  'ultra-sun-ultra-moon':            { label: 'Ultra Sun / Ultra Moon',           gen: 7, dexGen: 7, region: 'Alola',  versions: ['ultra-sun', 'ultra-moon'] },
  'lets-go-pikachu-lets-go-eevee':   { label: "Let's Go Pikachu / Eevee",         gen: 7, dexGen: 1, region: 'Kanto',  versions: ['lets-go-pikachu', 'lets-go-eevee'] },
  'sword-shield':                    { label: 'Sword / Shield',                   gen: 8, dexGen: 8, region: 'Galar',  versions: ['sword', 'shield'] },
  'brilliant-diamond-shining-pearl': { label: 'Brilliant Diamond / Shining Pearl', gen: 8, dexGen: 4, region: 'Sinnoh', versions: ['brilliant-diamond', 'shining-pearl'] },
  'legends-arceus':                  { label: 'Legends: Arceus',                  gen: 8, dexGen: 8, region: 'Hisui',  versions: ['legends-arceus'] },
  'scarlet-violet':                  { label: 'Scarlet / Violet',                 gen: 9, dexGen: 9, region: 'Paldea', versions: ['scarlet', 'violet'] },
} as const satisfies Record<string, GameMeta>;

export type GameId = keyof typeof GAMES;

const GAME_ID_SET: ReadonlySet<string> = new Set(Object.keys(GAMES));

export function isGameId(v: string): v is GameId {
  return GAME_ID_SET.has(v);
}

/** Every game, generation order. */
export const GAME_IDS: GameId[] = Object.keys(GAMES).filter(isGameId);

const REGION_NOTES: Partial<Record<RegionName, string>> = { Hisui: 'Ancient Sinnoh' };

export interface Region {
  name: RegionName;
  /** Shown beside the name when the region needs context ("Ancient Sinnoh"). */
  note?: string;
  /** Games set in this region, release order. */
  games: GameId[];
}

/** Regions in first-appearance order — Hisui sits right after Sinnoh, its ancient past. */
export const REGIONS: Region[] = REGION_NAMES.map((name) => ({
  name,
  note: REGION_NOTES[name],
  games: GAME_IDS.filter((g) => GAMES[g].region === name),
}));

/** Region-grouped release order — the order every game picker lists games in. */
export const GAME_ORDER: GameId[] = REGIONS.flatMap((r) => r.games);

/** Every PokéAPI version, release order. */
export const VERSION_ORDER: string[] = GAME_IDS.flatMap((g) => GAMES[g].versions);

export const GAME_OF_VERSION: Record<string, GameId> = Object.fromEntries(
  GAME_IDS.flatMap((g) => GAMES[g].versions.map((v): [string, GameId] => [v, g])),
);
