import type { ObtainEntry, ObtainMethod } from '@/obtain/types';

export interface ApiEncounterArea {
  location_area: { name: string };
  version_details: {
    version: { name: string };
    encounter_details: {
      min_level: number;
      max_level: number;
      chance: number;
      method: { name: string };
      condition_values: { name: string }[];
    }[];
  }[];
}

// prettier-ignore
const METHOD_MAP: Record<string, ObtainMethod> = {
  'walk': 'grass', 'dark-grass': 'grass', 'grass-spots': 'grass',
  'yellow-flowers': 'grass', 'purple-flowers': 'grass', 'red-flowers': 'grass',
  'rough-terrain': 'grass',
  'surf': 'surf', 'surf-spots': 'surf', 'seaweed': 'surf',
  'old-rod': 'fish', 'good-rod': 'fish', 'super-rod': 'fish', 'super-rod-spots': 'fish',
  'rock-smash': 'cave', 'cave-spots': 'cave',
  'gift': 'gift', 'gift-egg': 'gift',
  'only-one': 'static', 'roaming-grass': 'static', 'roaming-water': 'static',
  'npc-trade': 'trade',
};

const ROD_METHODS = new Set(['old-rod', 'good-rod', 'super-rod', 'super-rod-spots']);

export function prettyLocation(slug: string): string {
  return slug
    .replace(/-area$/, '')
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function mapMethod(slug: string): ObtainMethod {
  // Anything unmapped (headbutt trees, island-scan, honey trees…) surfaces as
  // 'special' with the raw slug preserved in conditions by the caller.
  return METHOD_MAP[slug] ?? 'special';
}

export function encountersToEntries(areas: ApiEncounterArea[]): Map<string, ObtainEntry[]> {
  const byVersion = new Map<string, Map<string, ObtainEntry>>();
  for (const area of areas) {
    const location = prettyLocation(area.location_area.name);
    for (const vd of area.version_details) {
      const version = vd.version.name;
      let slots = byVersion.get(version);
      if (!slots) {
        slots = new Map<string, ObtainEntry>();
        byVersion.set(version, slots);
      }
      for (const d of vd.encounter_details) {
        const method = mapMethod(d.method.name);
        const conditions = d.condition_values.map((c) => c.name).sort();
        if (ROD_METHODS.has(d.method.name)) conditions.unshift(d.method.name);
        if (method === 'special' && !METHOD_MAP[d.method.name]) conditions.unshift(d.method.name);
        const key = `${location}|${method}|${conditions.join(',')}`;
        const prev = slots.get(key);
        if (prev) {
          prev.minLevel = Math.min(prev.minLevel ?? d.min_level, d.min_level);
          prev.maxLevel = Math.max(prev.maxLevel ?? d.max_level, d.max_level);
          prev.chance = Math.min(100, (prev.chance ?? 0) + d.chance);
        } else {
          slots.set(key, {
            method,
            location,
            minLevel: d.min_level,
            maxLevel: d.max_level,
            chance: Math.min(100, d.chance),
            ...(conditions.length > 0 ? { conditions } : {}),
          });
        }
      }
    }
  }
  const out = new Map<string, ObtainEntry[]>();
  for (const [version, slots] of byVersion) out.set(version, [...slots.values()]);
  return out;
}
