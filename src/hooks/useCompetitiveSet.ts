import { useAsync, type AsyncState } from '@/async';
import { bestBuilds, pickBuild, smogonSets, type ResolvedBuild } from '@/competitive';

/**
 * `gen` pins the lookup to one Smogon gen (the game the user is playing);
 * `null` walks latest → oldest for the richest modern build. Older gens for
 * old Pokémon (e.g. Gen 1 Mewtwo) lack abilities/items/natures/EVs because
 * those mechanics didn't exist yet, so the walk is the better default.
 * Ready with `null` means Smogon has no set.
 */
export function useCompetitiveSet(
  name: string,
  gen: number | null,
): AsyncState<ResolvedBuild | null> {
  const best = useAsync(bestBuilds, gen === null, name);
  const sets = useAsync(smogonSets, gen !== null, gen ?? 0);
  if (gen === null) return best;
  if (sets.status !== 'ready') return sets;
  return { status: 'ready', data: pickBuild(sets.data, name, gen) };
}
