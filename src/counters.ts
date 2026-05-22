import { defensiveMatchups, type PokeType } from '@/typeChart';
import type { GameId } from '@/trainers';

/**
 * Maps a `GameId` to the latest generation whose Pokédex was canonically
 * available in that game. Used to cap the candidate pool when picking a
 * counter team — recommending a Gen 9 Fairy against Brock would be silly.
 */
export const GAME_MAX_GEN: Record<GameId, number> = {
  'red-blue': 1,
  yellow: 1,
  'gold-silver': 2,
  crystal: 2,
  'ruby-sapphire': 3,
  emerald: 3,
  'firered-leafgreen': 3,
  'diamond-pearl': 4,
  platinum: 4,
  'heartgold-soulsilver': 4,
  'black-white': 5,
  'black-2-white-2': 5,
  'x-y': 6,
  'omega-ruby-alpha-sapphire': 6,
  'sun-moon': 7,
  'ultra-sun-ultra-moon': 7,
  'lets-go': 1,
  'sword-shield': 8,
  'brilliant-diamond-shining-pearl': 4,
  'legends-arceus': 8,
  'scarlet-violet': 9,
};

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
  /** From `useTypeIndex` — Pokémon id → its types. */
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
  const candidateDef = defensiveMatchups(candidateTypes);
  let defSum = 0;
  let defMin = Infinity;
  for (const oppType of oppTypes) {
    const m = candidateDef.find((d) => d.type === oppType)?.multiplier ?? 1;
    defSum += m;
    if (m < defMin) defMin = m;
  }
  const defAvg = defSum / oppTypes.length;

  // Offensive: average multiplier candidate's STAB deals to opp.
  // Higher is better.
  const oppDef = defensiveMatchups(oppTypes);
  let offSum = 0;
  let offMax = 0;
  for (const candType of candidateTypes) {
    const m = oppDef.find((d) => d.type === candType)?.multiplier ?? 1;
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
  const candidateDef = defensiveMatchups(candidateTypes);
  const oppDef = defensiveMatchups(oppTypes);

  const immune: PokeType[] = [];
  const resists: PokeType[] = [];
  for (const t of oppTypes) {
    const m = candidateDef.find((d) => d.type === t)?.multiplier ?? 1;
    if (m === 0) immune.push(t);
    else if (m < 1) resists.push(t);
  }
  const se: PokeType[] = [];
  for (const t of candidateTypes) {
    const m = oppDef.find((d) => d.type === t)?.multiplier ?? 1;
    if (m >= 2) se.push(t);
  }

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
