// Static metadata for the 9 main-series generations. Which games shipped in
// each generation lives on the games themselves (`GAMES[id].gen` in `games.ts`).
import type { GameId, RegionName } from '@/games';

export interface GenerationMeta {
  num: number;
  roman: string;
  region: RegionName;
  // The version group used to source the move list (most recent canonical pair).
  primaryVersionGroup: GameId;
}

// prettier-ignore
export const GENERATIONS: GenerationMeta[] = [
  { num: 1, roman: 'I',    region: 'Kanto',  primaryVersionGroup: 'red-blue' },
  { num: 2, roman: 'II',   region: 'Johto',  primaryVersionGroup: 'gold-silver' },
  { num: 3, roman: 'III',  region: 'Hoenn',  primaryVersionGroup: 'ruby-sapphire' },
  { num: 4, roman: 'IV',   region: 'Sinnoh', primaryVersionGroup: 'diamond-pearl' },
  { num: 5, roman: 'V',    region: 'Unova',  primaryVersionGroup: 'black-white' },
  { num: 6, roman: 'VI',   region: 'Kalos',  primaryVersionGroup: 'x-y' },
  { num: 7, roman: 'VII',  region: 'Alola',  primaryVersionGroup: 'sun-moon' },
  { num: 8, roman: 'VIII', region: 'Galar',  primaryVersionGroup: 'sword-shield' },
  { num: 9, roman: 'IX',   region: 'Paldea', primaryVersionGroup: 'scarlet-violet' },
];

export function getGen(num: number): GenerationMeta {
  return GENERATIONS.find((g) => g.num === num) ?? GENERATIONS[7];
}
