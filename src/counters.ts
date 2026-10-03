import { memoAsync } from '@/async';
import { isRecord } from '@/guards';
import { effectiveness, type PokeType } from '@/typeChart';

interface PSDexEntry {
  num: number;
  prevo?: string;
  evoLevel?: number;
  evoType?: string;
  forme?: string;
  baseSpecies?: string;
}

function isPSDexEntry(v: unknown): v is PSDexEntry {
  return typeof v === 'object' && v !== null && 'num' in v;
}

function toPSId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Trade / stone / friendship evolutions have no evo level; mid-game is the
 * earliest they're realistically accessible in most games.
 */
const SPECIAL_EVO_MIN_LEVEL = 25;

/**
 * Earliest level a species can realistically exist at: 0 for base species,
 * the evo level (chained through prevos) for level evolutions, and a
 * mid-game floor for trade/stone/friendship evolutions.
 */
export function buildMinLevelMap(dex: Record<string, unknown>): Map<number, number> {
  const memo = new Map<string, number>();
  const minLevel = (key: string): number => {
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    memo.set(key, 0); // cycle guard
    const e = dex[key];
    let level = 0;
    if (isPSDexEntry(e) && e.prevo) {
      const parent = minLevel(toPSId(e.prevo));
      level = Math.max(e.evoLevel ?? SPECIAL_EVO_MIN_LEVEL, parent);
    }
    memo.set(key, level);
    return level;
  };

  const byNum = new Map<number, number>();
  for (const [key, e] of Object.entries(dex)) {
    if (!isPSDexEntry(e) || e.num <= 0) continue;
    // Base species only — forms carry `forme`/`baseSpecies` and share the num.
    if (e.forme || e.baseSpecies) continue;
    byNum.set(e.num, minLevel(key));
  }
  return byNum;
}

/** Dex num → earliest level the species can exist at, from Showdown's dex. */
export const minLevels = memoAsync(async (): Promise<Map<number, number>> => {
  const r = await fetch('https://play.pokemonshowdown.com/data/pokedex.json');
  if (!r.ok) throw new Error('pokedex data unavailable');
  const dex: unknown = await r.json();
  if (!isRecord(dex)) throw new Error('Malformed pokedex data');
  return buildMinLevelMap(dex);
});

export interface CounterPick {
  /** PokeAPI numeric id. */
  id: number;
  /** Species slug. */
  name: string;
  types: PokeType[];
  /** Score against the opponent it was picked to counter — higher is better. */
  score: number;
  /** Index into the trainer's roster of the opponent this pick counters. */
  countersIndex: number;
  /** Slug of the opponent it counters. */
  countersSpecies: string;
  /** Short reason (e.g. `resists Water · hits with Electric STAB`). */
  rationale: string;
}

export interface CounterContext {
  /** From `typeIndex` (`dex.ts`) — Pokémon id → its types. */
  typeIndex: Map<number, PokeType[]>;
  /** Species slug → numeric id. */
  nameToId: Map<string, number>;
  /** Numeric id → species slug (for display). */
  idToName: Map<number, string>;
  /** Optional gate restricting the candidate pool (e.g. gen cap). */
  candidateFilter?: (id: number) => boolean;
}

function scoreMatchup(
  candidateTypes: PokeType[],
  oppTypes: PokeType[],
): { score: number; immune: boolean } {
  if (oppTypes.length === 0 || candidateTypes.length === 0) {
    return { score: 0, immune: false };
  }

  // Defensive: average multiplier the candidate *takes* from opp's STAB.
  // Lower is better.
  let defSum = 0;
  let defMin = Infinity;
  for (const oppType of oppTypes) {
    const m = effectiveness(oppType, candidateTypes);
    defSum += m;
    if (m < defMin) defMin = m;
  }
  const defAvg = defSum / oppTypes.length;

  // Offensive: average multiplier candidate's STAB deals to opp.
  // Higher is better.
  let offSum = 0;
  let offMax = 0;
  for (const candType of candidateTypes) {
    const m = effectiveness(candType, oppTypes);
    offSum += m;
    if (m > offMax) offMax = m;
  }
  const offAvg = offSum / candidateTypes.length;

  let score = offAvg / Math.max(defAvg, 0.0625);
  // Bonuses for clean reads
  if (defMin === 0) score += 4; // immune to at least one of opp's STABs
  if (offMax >= 2) score += 1; // has at least one super-effective STAB
  return { score, immune: defMin === 0 };
}

function rationale(candidateTypes: PokeType[], oppTypes: PokeType[]): string {
  const immune = oppTypes.filter((t) => effectiveness(t, candidateTypes) === 0);
  const resists = oppTypes.filter((t) => {
    const m = effectiveness(t, candidateTypes);
    return m > 0 && m < 1;
  });
  const se = candidateTypes.filter((t) => effectiveness(t, oppTypes) >= 2);

  const parts: string[] = [];
  if (immune.length) parts.push(`immune to ${immune.join('/')}`);
  if (resists.length) parts.push(`resists ${resists.join('/')}`);
  if (se.length) parts.push(`hits with ${se.join('/')} STAB`);
  return parts.length ? parts.join(' · ') : 'neutral matchup';
}

/**
 * Greedy team-builder: for each opposing roster slot, pick the highest-scoring
 * unused candidate. Stops at `maxTeamSize` (default 6). Skips opponents whose
 * types we can't resolve (e.g. forms not in the type index).
 */
export function pickCounterTeam(
  opponents: { species: string }[],
  ctx: CounterContext,
  maxTeamSize = 6,
): CounterPick[] {
  const candidateIds: number[] = [];
  for (const id of ctx.typeIndex.keys()) {
    if (ctx.candidateFilter && !ctx.candidateFilter(id)) continue;
    candidateIds.push(id);
  }

  const used = new Set<number>();
  const team: CounterPick[] = [];

  opponents.forEach((opp, idx) => {
    if (team.length >= maxTeamSize) return;
    const oppId = ctx.nameToId.get(opp.species);
    const oppTypes = oppId != null ? (ctx.typeIndex.get(oppId) ?? []) : [];
    if (oppTypes.length === 0) return;

    let bestId = -1;
    let bestScore = -Infinity;
    let bestTypes: PokeType[] = [];
    for (const id of candidateIds) {
      if (used.has(id)) continue;
      const types = ctx.typeIndex.get(id);
      if (!types || types.length === 0) continue;
      const { score } = scoreMatchup(types, oppTypes);
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
        bestTypes = types;
      }
    }
    if (bestId === -1) return;
    used.add(bestId);
    team.push({
      id: bestId,
      name: ctx.idToName.get(bestId) ?? `pokemon-${bestId}`,
      types: bestTypes,
      score: bestScore,
      countersIndex: idx,
      countersSpecies: opp.species,
      rationale: rationale(bestTypes, oppTypes),
    });
  });

  return team;
}
