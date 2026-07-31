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

function entriesForVersion(input: AssembleInput, version: string): ObtainEntry[] {
  const api = input.apiEntries.get(version) ?? [];
  const entries: ObtainEntry[] =
    api.length > 0 ? [...api] : [...(input.pdbEntries.get(version) ?? [])];
  for (const t of input.trades) {
    if (t.versions.includes(version)) {
      entries.push({
        method: 'trade',
        location: t.location,
        detail: `Trade a ${t.give.toUpperCase()} to an NPC`,
      });
    }
  }
  const obtainable = entries.some((e) => !INDIRECT.has(e.method));
  if (!obtainable && input.isDefaultForm) {
    if (input.evolvesFrom) {
      entries.unshift({
        method: 'evolve',
        detail: `Evolve ${input.evolvesFrom.name} (${input.evolvesFrom.trigger})`,
      });
    } else if (input.breeding?.breedable) {
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
