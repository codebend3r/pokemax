import type { NpcTrade } from '@/obtain/bulbapedia';
import type { ObtainBreeding, ObtainEntry, ObtainFile, ObtainGame } from '@/obtain/types';
import { GROUP_GEN, VERSION_ORDER, VERSION_TO_GROUP } from '@/obtain/types';

export interface AssembleInput {
  pokemonId: number;
  name: string;
  isDefaultForm: boolean;
  debutGen: number;
  apiEntries: Map<string, ObtainEntry[]>;
  pdbEntries: Map<string, ObtainEntry[]>;
  trades: NpcTrade[];
  breeding: ObtainBreeding | null;
  evolvesFrom: { name: string; trigger: string } | null;
}

const INDIRECT = new Set(['transfer', 'unavailable', 'special']);

// No breeding mechanic (gen 1) or breeding present but off-limits to the
// player (Let's Go / Legends: Arceus have no Day Care) — the EGG fallback
// would otherwise imply a hatch path that doesn't exist in these games.
const NO_BREEDING_GROUPS = new Set([
  'red-blue',
  'yellow',
  'lets-go-pikachu-lets-go-eevee',
  'legends-arceus',
]);

// Regional-dex-only games — absence of any entry means "not in this game's
// Pokédex," not "obtain it some other way."
const LIMITED_DEX_GROUPS = new Set(['lets-go-pikachu-lets-go-eevee', 'legends-arceus']);

function entriesForVersion(input: AssembleInput, version: string): ObtainEntry[] {
  const group = VERSION_TO_GROUP[version];
  const api = input.apiEntries.get(version) ?? [];
  const entries: ObtainEntry[] =
    api.length > 0 ? [...api] : [...(input.pdbEntries.get(version) ?? [])];
  // PokéAPI's npc-trade encounter slots are richer than a Bulbapedia trade-list
  // scrape — don't double up when the API already covers this version's trade.
  const hasApiTrade = api.some((e) => e.method === 'trade');
  for (const t of input.trades) {
    if (!t.versions.includes(version) || hasApiTrade) continue;
    entries.push({
      method: 'trade',
      location: t.location,
      detail: `Trade a ${t.give.toUpperCase()} to an NPC`,
    });
  }
  // An explicit `unavailable` entry (e.g. "not obtainable in this game") is
  // authoritative — don't layer a derived EGG/EVOLVE/TRANSFER row on top of it.
  if (entries.some((e) => e.method === 'unavailable')) return entries;
  const obtainable = entries.some((e) => !INDIRECT.has(e.method));
  if (!obtainable && input.isDefaultForm) {
    if (entries.length === 0 && LIMITED_DEX_GROUPS.has(group)) {
      entries.push({ method: 'unavailable', detail: "Not in this game's Pokédex" });
    } else if (input.evolvesFrom) {
      entries.unshift({
        method: 'evolve',
        detail: `Evolve ${input.evolvesFrom.name} (${input.evolvesFrom.trigger})`,
      });
    } else if (input.breeding?.breedable && !NO_BREEDING_GROUPS.has(group)) {
      entries.unshift({
        method: 'egg',
        detail: `Breed and hatch — ${input.breeding.hatchCycles} cycles (${input.breeding.steps.toLocaleString('en-US')} steps)`,
      });
    } else if (entries.length === 0) {
      entries.push({ method: 'transfer', detail: 'Transfer from another game' });
    }
  }
  return entries;
}

export function assembleObtainFile(input: AssembleInput): ObtainFile {
  const games: ObtainGame[] = [];
  for (const version of VERSION_ORDER) {
    const group = VERSION_TO_GROUP[version];
    const gen = GROUP_GEN[group];
    if (gen < input.debutGen) continue;
    const entries = entriesForVersion(input, version);
    if (entries.length === 0) continue; // non-default forms with no data
    const prev = games[games.length - 1];
    if (
      prev &&
      prev.versionGroup === group &&
      JSON.stringify(prev.entries) === JSON.stringify(entries)
    ) {
      prev.versions.push(version);
      continue;
    }
    games.push({ gen, versionGroup: group, versions: [version], entries });
  }
  return {
    pokemonId: input.pokemonId,
    name: input.name,
    breeding: input.breeding,
    games,
  };
}
