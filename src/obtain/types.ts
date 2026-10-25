import { isGameId, type GameId } from '@/games';
import {
  isBoolean,
  isNullable,
  isNumber,
  isOptional,
  isRecord,
  isString,
  isStringList,
} from '@/guards';

// Single source for the method vocabulary — the union, the runtime guard, and
// the label/color tables in `@/obtain/labels` all derive from this list.
export const OBTAIN_METHODS = [
  'grass',
  'surf',
  'fish',
  'cave',
  'wild',
  'static',
  'gift',
  'trade',
  'egg',
  'evolve',
  'transfer',
  'unavailable',
  'special',
] as const;

export type ObtainMethod = (typeof OBTAIN_METHODS)[number];

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
  versionGroup: GameId;
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

const METHOD_SET: ReadonlySet<string> = new Set(OBTAIN_METHODS);

function isObtainEntry(v: unknown): v is ObtainEntry {
  return (
    isRecord(v) &&
    isString(v.method) &&
    METHOD_SET.has(v.method) &&
    isOptional(v.location, isString) &&
    isOptional(v.minLevel, isNumber) &&
    isOptional(v.maxLevel, isNumber) &&
    isOptional(v.chance, isNumber) &&
    isOptional(v.conditions, isStringList) &&
    isOptional(v.detail, isString)
  );
}

function isObtainGame(v: unknown): v is ObtainGame {
  return (
    isRecord(v) &&
    isNumber(v.gen) &&
    isString(v.versionGroup) &&
    isGameId(v.versionGroup) &&
    isStringList(v.versions) &&
    Array.isArray(v.entries) &&
    v.entries.every(isObtainEntry)
  );
}

export function isObtainBreeding(v: unknown): v is ObtainBreeding {
  return (
    isRecord(v) &&
    isStringList(v.eggGroups) &&
    isNumber(v.hatchCycles) &&
    isNumber(v.steps) &&
    isBoolean(v.breedable)
  );
}

export function isObtainFile(v: unknown): v is ObtainFile {
  return (
    isRecord(v) &&
    isNumber(v.pokemonId) &&
    isString(v.name) &&
    isNullable(v.breeding, isObtainBreeding) &&
    Array.isArray(v.games) &&
    v.games.every(isObtainGame)
  );
}
