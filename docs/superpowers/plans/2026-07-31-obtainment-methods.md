# Obtainment Methods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show how to obtain every Pokémon in every main-series game — wild encounters with levels/rates/conditions, gifts, NPC trades, breeding info, and derived fallbacks — via a build-time dataset rendered in a new HOW TO OBTAIN section.

**Architecture:** Pure parse/merge logic lives in `src/obtain/` (unit-testable, imported by both the build script and tests; never imported by the app bundle except `types.ts`). A bun script `scripts/build-obtain-data.mts` fetches PokéAPI + PokemonDB + Bulbapedia (disk-cached, throttled), assembles one JSON per Pokémon into `public/obtain/{id}.json`, committed. The app lazy-fetches a file when the section opens.

**Tech Stack:** TypeScript (strict), React 19, vitest + @testing-library/react, bun as script runner, `node-html-parser` (devDependency, script-side only).

**Spec:** `docs/superpowers/specs/2026-07-31-obtainment-methods-design.md`. Two deliberate deviations from the spec's data model, both additive: `method` gains `'wild'` (PokemonDB Gen 8–9 rows say *where* but not *how*, and guessing `grass` would be wrong for caves) and `'unavailable'` (PokemonDB's "Not available in this game" — distinct from transfer-only).

## Global Constraints

- NO TypeScript type assertions of any kind (`as X`, `as unknown as`, `@ts-ignore`). `as const` is allowed. Narrow or write type guards instead.
- Imports under `src/` use the `@/` alias — never `../` across directories.
- Tests: `bun run test <path>` (vitest). NEVER `bun test`.
- Run `npx tsc -b --pretty false` before every commit that touches types.
- Commit messages: title-case imperative verb subject ≤72 chars, `-` bullets, backticks on every identifier/path/command, ZERO AI/agent attribution anywhere (per `pokemax-commit-format` skill). Commit after every task. **NEVER `git push`** — the user pushes manually.
- Known repo bug: `.husky/pre-commit` pipes ALL staged files to `oxfmt`, which hard-fails when a commit stages only files it excludes (`.md`, `.json`). For commits that stage only such files, use `git commit --no-verify`.
- CSS: pull from existing variables in `src/styles/crt.css` (`--primary`, `--accent`, `--tertiary`, `--dim`, `--font-body`); no hardcoded hex; add light-theme overrides under the existing `:root[data-theme="light"]` block.
- Two known pre-existing `PokemonCard` sprite-source test failures exist. Do not fix them; do not let them block a task — the bar is "no NEW failures".

## File Structure

```
src/obtain/types.ts            data model + version/version-group tables (app + script)
src/obtain/pokeapi.ts          PokéAPI encounters JSON → per-version entries (script-only)
src/obtain/pokemondb.ts        PokemonDB "Where to find" HTML → per-version entries (script-only)
src/obtain/bulbapedia.ts       Bulbapedia in-game-trades HTML → NpcTrade[] (script-only)
src/obtain/assemble.ts         merge + derived fallbacks + version merging → ObtainFile (script-only)
scripts/build-obtain-data.mts  fetch/cache/throttle orchestrator, writes public/obtain/{id}.json
public/obtain/{id}.json        committed dataset, one file per Pokémon id
src/hooks/useObtainData.ts     lazy fetch + module cache for obtain JSON
src/components/ObtainMethods.tsx  section body renderer
src/components/Section.tsx     + optional onToggle prop
src/components/PokemonCard.tsx + HOW TO OBTAIN section wiring
src/styles/crt.css             + .crt-obtain-* styles + light overrides
```

---

### Task 1: Data model and version tables

**Files:**
- Create: `src/obtain/types.ts`
- Test: `src/__tests__/obtainTypes.test.ts`

**Interfaces:**
- Consumes: `GENERATIONS` from `@/generations`
- Produces: types `ObtainMethod`, `ObtainEntry`, `ObtainGame`, `ObtainBreeding`, `ObtainFile`; constants `VERSION_GROUP_VERSIONS: Record<string, string[]>`, `VERSION_ORDER: string[]`, `VERSION_TO_GROUP: Record<string, string>`, `GROUP_GEN: Record<string, number>`; helper `isObtainFile(v: unknown): v is ObtainFile`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/obtainTypes.test.ts
import { describe, expect, it } from 'vitest';
import { GENERATIONS } from '@/generations';
import {
  GROUP_GEN,
  isObtainFile,
  VERSION_GROUP_VERSIONS,
  VERSION_ORDER,
  VERSION_TO_GROUP,
} from '@/obtain/types';

describe('obtain version tables', () => {
  it('covers every version group in GENERATIONS', () => {
    for (const g of GENERATIONS) {
      for (const vg of g.versionGroups) {
        expect(VERSION_GROUP_VERSIONS[vg], vg).toBeDefined();
        expect(GROUP_GEN[vg], vg).toBe(g.num);
      }
    }
  });

  it('maps every version back to its group', () => {
    for (const [group, versions] of Object.entries(VERSION_GROUP_VERSIONS)) {
      for (const v of versions) expect(VERSION_TO_GROUP[v]).toBe(group);
    }
    expect(VERSION_ORDER[0]).toBe('red');
    expect(VERSION_ORDER[VERSION_ORDER.length - 1]).toBe('violet');
  });
});

describe('isObtainFile', () => {
  it('accepts a minimal valid file and rejects junk', () => {
    expect(
      isObtainFile({ pokemonId: 25, name: 'pikachu', breeding: null, games: [] }),
    ).toBe(true);
    expect(isObtainFile(null)).toBe(false);
    expect(isObtainFile({ pokemonId: 'x' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/obtainTypes.test.ts`
Expected: FAIL — cannot resolve `@/obtain/types`

- [ ] **Step 3: Write the implementation**

```ts
// src/obtain/types.ts
import { GENERATIONS } from '@/generations';

export type ObtainMethod =
  | 'grass'
  | 'surf'
  | 'fish'
  | 'cave'
  | 'wild'
  | 'static'
  | 'gift'
  | 'trade'
  | 'egg'
  | 'evolve'
  | 'transfer'
  | 'unavailable'
  | 'special';

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
  versionGroup: string;
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

// PokéAPI version names per version group, canonical release order.
// prettier-ignore
export const VERSION_GROUP_VERSIONS: Record<string, string[]> = {
  'red-blue': ['red', 'blue'],
  'yellow': ['yellow'],
  'gold-silver': ['gold', 'silver'],
  'crystal': ['crystal'],
  'ruby-sapphire': ['ruby', 'sapphire'],
  'emerald': ['emerald'],
  'firered-leafgreen': ['firered', 'leafgreen'],
  'diamond-pearl': ['diamond', 'pearl'],
  'platinum': ['platinum'],
  'heartgold-soulsilver': ['heartgold', 'soulsilver'],
  'black-white': ['black', 'white'],
  'black-2-white-2': ['black-2', 'white-2'],
  'x-y': ['x', 'y'],
  'omega-ruby-alpha-sapphire': ['omega-ruby', 'alpha-sapphire'],
  'sun-moon': ['sun', 'moon'],
  'ultra-sun-ultra-moon': ['ultra-sun', 'ultra-moon'],
  'lets-go-pikachu-lets-go-eevee': ['lets-go-pikachu', 'lets-go-eevee'],
  'sword-shield': ['sword', 'shield'],
  'brilliant-diamond-shining-pearl': ['brilliant-diamond', 'shining-pearl'],
  'legends-arceus': ['legends-arceus'],
  'scarlet-violet': ['scarlet', 'violet'],
};

export const VERSION_ORDER: string[] = GENERATIONS.flatMap((g) =>
  g.versionGroups.flatMap((vg) => VERSION_GROUP_VERSIONS[vg] ?? []),
);

export const VERSION_TO_GROUP: Record<string, string> = Object.fromEntries(
  Object.entries(VERSION_GROUP_VERSIONS).flatMap(([group, versions]) =>
    versions.map((v) => [v, group]),
  ),
);

export const GROUP_GEN: Record<string, number> = Object.fromEntries(
  GENERATIONS.flatMap((g) => g.versionGroups.map((vg) => [vg, g.num])),
);

export function isObtainFile(v: unknown): v is ObtainFile {
  if (typeof v !== 'object' || v === null) return false;
  const o: Record<string, unknown> = { ...v };
  return (
    typeof o.pokemonId === 'number' &&
    typeof o.name === 'string' &&
    Array.isArray(o.games) &&
    'breeding' in o
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/obtainTypes.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/obtain/types.ts src/__tests__/obtainTypes.test.ts
git commit -m "$(cat <<'EOF'
Add obtain data model and version tables

- `src/obtain/types.ts`: `ObtainFile`/`ObtainGame`/`ObtainEntry` schema
- `VERSION_GROUP_VERSIONS`, `VERSION_TO_GROUP`, `GROUP_GEN` derived from `GENERATIONS`
- `isObtainFile` guard for runtime JSON validation
EOF
)"
```

---

### Task 2: PokéAPI encounters transform

**Files:**
- Create: `src/obtain/pokeapi.ts`
- Test: `src/__tests__/obtainPokeapi.test.ts`

**Interfaces:**
- Consumes: `ObtainEntry`, `ObtainMethod` from `@/obtain/types`
- Produces: `interface ApiEncounterArea` (shape of one element of PokéAPI `/pokemon/{id}/encounters`), `encountersToEntries(areas: ApiEncounterArea[]): Map<string, ObtainEntry[]>` (key = PokéAPI version name), `prettyLocation(slug: string): string`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/obtainPokeapi.test.ts
import { describe, expect, it } from 'vitest';
import { encountersToEntries, prettyLocation } from '@/obtain/pokeapi';

const AREAS = [
  {
    location_area: { name: 'kanto-route-2-south-towards-viridian-city' },
    version_details: [
      {
        version: { name: 'heartgold' },
        encounter_details: [
          { min_level: 3, max_level: 3, chance: 25, method: { name: 'walk' }, condition_values: [{ name: 'time-morning' }] },
          { min_level: 5, max_level: 5, chance: 20, method: { name: 'walk' }, condition_values: [{ name: 'time-morning' }] },
          { min_level: 4, max_level: 4, chance: 30, method: { name: 'walk' }, condition_values: [{ name: 'time-night' }] },
        ],
      },
    ],
  },
  {
    location_area: { name: 'vermilion-city-area' },
    version_details: [
      {
        version: { name: 'heartgold' },
        encounter_details: [
          { min_level: 10, max_level: 20, chance: 40, method: { name: 'old-rod' }, condition_values: [] },
        ],
      },
      {
        version: { name: 'yellow' },
        encounter_details: [
          { min_level: 5, max_level: 10, chance: 100, method: { name: 'gift' }, condition_values: [] },
        ],
      },
    ],
  },
];

describe('encountersToEntries', () => {
  it('groups by version and merges same location+method+conditions slots', () => {
    const byVersion = encountersToEntries(AREAS);
    const hg = byVersion.get('heartgold');
    expect(hg).toBeDefined();
    if (!hg) return;
    const morning = hg.find((e) => e.conditions?.includes('time-morning'));
    expect(morning).toMatchObject({ method: 'grass', minLevel: 3, maxLevel: 5, chance: 45 });
    const night = hg.find((e) => e.conditions?.includes('time-night'));
    expect(night).toMatchObject({ minLevel: 4, maxLevel: 4, chance: 30 });
    const rod = hg.find((e) => e.method === 'fish');
    expect(rod).toMatchObject({ location: 'Vermilion City', conditions: ['old-rod'] });
  });

  it('maps gift method and keeps versions separate', () => {
    const byVersion = encountersToEntries(AREAS);
    expect(byVersion.get('yellow')?.[0]).toMatchObject({ method: 'gift', chance: 100 });
  });
});

describe('prettyLocation', () => {
  it('strips -area and title-cases', () => {
    expect(prettyLocation('vermilion-city-area')).toBe('Vermilion City');
    expect(prettyLocation('kanto-route-2-south-towards-viridian-city')).toBe(
      'Kanto Route 2 South Towards Viridian City',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/obtainPokeapi.test.ts`
Expected: FAIL — cannot resolve `@/obtain/pokeapi`

- [ ] **Step 3: Write the implementation**

```ts
// src/obtain/pokeapi.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/obtainPokeapi.test.ts`
Expected: PASS

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/obtain/pokeapi.ts src/__tests__/obtainPokeapi.test.ts
git commit -m "$(cat <<'EOF'
Add PokéAPI encounters transform

- `encountersToEntries` groups `/pokemon/{id}/encounters` by version
- merges same location+method+condition slots: level span, summed `chance`
- rod tier and unmapped method slugs preserved as `conditions`
EOF
)"
```

---

### Task 3: PokemonDB "Where to find" parser

**Files:**
- Create: `src/obtain/pokemondb.ts`
- Test: `src/__tests__/obtainPokemondb.test.ts`
- Modify: `package.json` (add `node-html-parser` devDependency)

**Interfaces:**
- Consumes: `ObtainEntry` from `@/obtain/types`
- Produces: `parseWhereToFind(html: string): Map<string, ObtainEntry[]>` — key is the PokemonDB `igame` slug, which equals the PokéAPI version name for every main-series game

- [ ] **Step 1: Install the parser**

Run: `bun add -d node-html-parser`

- [ ] **Step 2: Write the failing test**

The fixture is real markup captured from pokemondb.net (structure verified 2026-07-31): rows are `<tr><th><span class="igame {slug}">…</span>…</th><td>links or <small>note</small></td></tr>` inside the `table.vitals-table` after `<h2>Where to find …</h2>`.

```ts
// src/__tests__/obtainPokemondb.test.ts
import { describe, expect, it } from 'vitest';
import { parseWhereToFind } from '@/obtain/pokemondb';

const HTML = `
<h2>Where to find Testmon</h2>
<div class="resp-scroll">
<table class="vitals-table"><tbody>
<tr>
  <th><span class="igame red">Red</span><br><span class="igame blue">Blue</span></th>
  <td><a href="/location/kanto-power-plant">Power Plant</a>, <a href="/location/kanto-viridian-forest">Viridian Forest</a></td>
</tr>
<tr>
  <th><span class="igame black">Black</span><br><span class="igame white">White</span></th>
  <td><small>Trade/migrate from another game</small></td>
</tr>
<tr>
  <th><span class="igame sword">Sword</span></th>
  <td><small>Evolve <a href="/pokedex/pikachu">Pikachu</a>/<a href="/pokedex/pichu">Pichu</a></small></td>
</tr>
<tr>
  <th><span class="igame scarlet">Scarlet</span><br><span class="igame violet">Violet</span></th>
  <td><small>Not available in this game</small></td>
</tr>
<tr>
  <th><span class="igame legends-arceus">Legends: Arceus</span></th>
  <td><small>Location data not yet available</small></td>
</tr>
</tbody></table>
</div>
<h2>Other</h2>
<table class="vitals-table"><tbody><tr><th>Ignore me</th><td>x</td></tr></tbody></table>`;

describe('parseWhereToFind', () => {
  it('yields wild entries per version from location links', () => {
    const rows = parseWhereToFind(HTML);
    expect(rows.get('red')).toEqual([
      { method: 'wild', location: 'Power Plant' },
      { method: 'wild', location: 'Viridian Forest' },
    ]);
    expect(rows.get('blue')).toEqual(rows.get('red'));
  });

  it('classifies note rows', () => {
    const rows = parseWhereToFind(HTML);
    expect(rows.get('black')?.[0].method).toBe('transfer');
    expect(rows.get('sword')?.[0]).toEqual({ method: 'evolve', detail: 'Evolve Pikachu/Pichu' });
    expect(rows.get('scarlet')?.[0].method).toBe('unavailable');
    expect(rows.get('legends-arceus')?.[0]).toEqual({
      method: 'special',
      detail: 'Location data not yet available',
    });
  });

  it('ignores tables without igame rows', () => {
    expect(parseWhereToFind(HTML).has('Ignore me')).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun run test src/__tests__/obtainPokemondb.test.ts`
Expected: FAIL — cannot resolve `@/obtain/pokemondb`

- [ ] **Step 4: Write the implementation**

```ts
// src/obtain/pokemondb.ts
import { parse } from 'node-html-parser';
import type { ObtainEntry } from '@/obtain/types';

function classifyNote(text: string): ObtainEntry {
  const detail = text.replace(/\s+/g, ' ').trim();
  if (/^trade\/migrate/i.test(detail)) return { method: 'transfer', detail };
  if (/^not available/i.test(detail)) return { method: 'unavailable', detail };
  if (/^evolve/i.test(detail)) return { method: 'evolve', detail };
  if (/^breed/i.test(detail)) return { method: 'egg', detail };
  return { method: 'special', detail };
}

/**
 * Parses the "Where to find" vitals table on a pokemondb.net pokedex page.
 * Returns entries keyed by the `igame` class slug, which matches PokéAPI
 * version names ('red', 'black-2', 'lets-go-pikachu', 'legends-arceus', …).
 */
export function parseWhereToFind(html: string): Map<string, ObtainEntry[]> {
  const out = new Map<string, ObtainEntry[]>();
  const root = parse(html);
  for (const table of root.querySelectorAll('table.vitals-table')) {
    for (const tr of table.querySelectorAll('tr')) {
      const games = tr
        .querySelectorAll('th span.igame')
        .map((s) => s.classNames.split(/\s+/).filter((c) => c !== 'igame').join(' '))
        .filter((slug) => slug.length > 0);
      if (games.length === 0) continue;
      const td = tr.querySelector('td');
      if (!td) continue;
      const entries: ObtainEntry[] = [];
      const links = td.querySelectorAll('a[href^="/location/"]');
      for (const a of links) {
        entries.push({ method: 'wild', location: a.text.trim() });
      }
      if (entries.length === 0) {
        const note = td.querySelector('small');
        if (note) entries.push(classifyNote(note.text));
      }
      if (entries.length === 0) continue;
      for (const g of games) out.set(g, entries);
    }
  }
  return out;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test src/__tests__/obtainPokemondb.test.ts`
Expected: PASS

- [ ] **Step 6: Typecheck and commit**

Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/obtain/pokemondb.ts src/__tests__/obtainPokemondb.test.ts package.json bun.lock
git commit -m "$(cat <<'EOF'
Add PokemonDB where-to-find parser

- `parseWhereToFind` reads `table.vitals-table` rows keyed by `igame` slug
- location links become `wild` entries; `<small>` notes classify to `transfer`/`unavailable`/`evolve`/`egg`/`special`
- adds `node-html-parser` devDependency (script-side only)
EOF
)"
```

Note: if the lockfile is `package-lock.json` instead of `bun.lock`, stage that.

---

### Task 4: Bulbapedia NPC-trade parser

**Files:**
- Create: `src/obtain/bulbapedia.ts`
- Test: `src/__tests__/obtainBulbapedia.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks
- Produces: `interface NpcTrade { versions: string[]; give: string; receive: string; location: string }` (species as PokéAPI slugs), `parseTradeLists(html: string): NpcTrade[]`, `bulbaNameToSlug(name: string): string`

Source page: `https://bulbapedia.bulbagarden.net/wiki/In-game_trade` — one page, sections per game under `<span class="mw-headline" id="…">`, trades in tables whose header row contains "Player's Pokémon". In each data row: first `<td>` is the location; species appear as links whose `title` attribute ends with ` (Pokémon)` — first unique species is what the player gives, second is what they receive. (Structure verified 2026-07-31.)

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/obtainBulbapedia.test.ts
import { describe, expect, it } from 'vitest';
import { bulbaNameToSlug, parseTradeLists } from '@/obtain/bulbapedia';

const HTML = `
<h4><span class="mw-headline" id="Pokémon_X_and_Y">Pokémon X and Y</span></h4>
<table class="roundtable"><tbody>
<tr><th>Location</th><th colspan="2">Player's Pokémon</th><th colspan="2">NPC's Pokémon</th></tr>
<tr>
<td><a href="/wiki/Santalune_City" title="Santalune City">Santalune City</a></td>
<td><a href="/wiki/Bunnelby_(Pok%C3%A9mon)" title="Bunnelby (Pokémon)"><img alt="Bunnelby"></a></td>
<td><a href="/wiki/Bunnelby_(Pok%C3%A9mon)" title="Bunnelby (Pokémon)">Bunnelby</a></td>
<td><a href="/wiki/Farfetch%27d_(Pok%C3%A9mon)" title="Farfetch'd (Pokémon)"><img alt="Farfetch'd"></a></td>
<td><a href="/wiki/Farfetch%27d_(Pok%C3%A9mon)" title="Farfetch'd (Pokémon)">Farfetch'd</a></td>
</tr>
</tbody></table>
<h4><span class="mw-headline" id="Pokémon_Stadium_2">Pokémon Stadium 2</span></h4>
<table class="roundtable"><tbody>
<tr><th>Location</th><th>Player's Pokémon</th><th>NPC's Pokémon</th></tr>
<tr>
<td>Somewhere</td>
<td><a href="/wiki/Abra_(Pok%C3%A9mon)" title="Abra (Pokémon)">Abra</a></td>
<td><a href="/wiki/Alakazam_(Pok%C3%A9mon)" title="Alakazam (Pokémon)">Alakazam</a></td>
</tr>
</tbody></table>`;

describe('parseTradeLists', () => {
  it('extracts give/receive/location per mapped game section', () => {
    const trades = parseTradeLists(HTML);
    expect(trades).toEqual([
      {
        versions: ['x', 'y'],
        give: 'bunnelby',
        receive: 'farfetchd',
        location: 'Santalune City',
      },
    ]);
  });
});

describe('bulbaNameToSlug', () => {
  it('handles punctuation, gender marks, and accents', () => {
    expect(bulbaNameToSlug("Farfetch'd")).toBe('farfetchd');
    expect(bulbaNameToSlug('Mr. Mime')).toBe('mr-mime');
    expect(bulbaNameToSlug('Nidoran♀')).toBe('nidoran-f');
    expect(bulbaNameToSlug('Nidoran♂')).toBe('nidoran-m');
    expect(bulbaNameToSlug('Flabébé')).toBe('flabebe');
    expect(bulbaNameToSlug('Type: Null')).toBe('type-null');
    expect(bulbaNameToSlug('Mime Jr.')).toBe('mime-jr');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/obtainBulbapedia.test.ts`
Expected: FAIL — cannot resolve `@/obtain/bulbapedia`

- [ ] **Step 3: Write the implementation**

```ts
// src/obtain/bulbapedia.ts
import { parse } from 'node-html-parser';

export interface NpcTrade {
  versions: string[]; // PokéAPI version names
  give: string; // PokéAPI species slug the player hands over
  receive: string; // PokéAPI species slug the player gets
  location: string;
}

// Bulbapedia "List of in-game trades" section ids → affected versions.
// Sections not listed (Stadium, XD, Ranch, unused/debug trades, Yancy/Curtis
// repeatable trades, Legends Z-A placeholder) are deliberately skipped.
// prettier-ignore
const TRADE_SECTIONS: Record<string, string[]> = {
  'Pokémon_Red_and_Green_(Japan),_Pokémon_Red_and_Blue_(Western)': ['red', 'blue'],
  'Pokémon_Yellow': ['yellow'],
  'Pokémon_Gold,_Silver,_and_Crystal': ['gold', 'silver', 'crystal'],
  'Pokémon_Ruby_and_Sapphire': ['ruby', 'sapphire'],
  'Pokémon_FireRed_and_LeafGreen': ['firered', 'leafgreen'],
  'Pokémon_Emerald': ['emerald'],
  'Pokémon_Diamond,_Pearl,_and_Platinum': ['diamond', 'pearl', 'platinum'],
  'Pokémon_HeartGold_and_SoulSilver': ['heartgold', 'soulsilver'],
  'Pokémon_Black_and_White': ['black', 'white'],
  'Pokémon_Black_2_and_White_2': ['black-2', 'white-2'],
  'Pokémon_X_and_Y': ['x', 'y'],
  'Pokémon_Omega_Ruby_and_Alpha_Sapphire': ['omega-ruby', 'alpha-sapphire'],
  'Pokémon_Sun_and_Moon': ['sun', 'moon'],
  'Pokémon_Ultra_Sun_and_Ultra_Moon': ['ultra-sun', 'ultra-moon'],
  "Pokémon:_Let's_Go,_Pikachu!_and_Let's_Go,_Eevee!": ['lets-go-pikachu', 'lets-go-eevee'],
  'Pokémon_Sword_and_Shield': ['sword', 'shield'],
  'The_Isle_of_Armor': ['sword', 'shield'],
  'Pokémon_Brilliant_Diamond_and_Shining_Pearl': ['brilliant-diamond', 'shining-pearl'],
  'Pokémon_Scarlet_and_Violet': ['scarlet', 'violet'],
  'The_Indigo_Disk': ['scarlet', 'violet'],
};

// prettier-ignore
const SLUG_OVERRIDES: Record<string, string> = {
  'nidoran♀': 'nidoran-f', 'nidoran♂': 'nidoran-m',
  "farfetch'd": 'farfetchd', 'farfetch’d': 'farfetchd',
  "sirfetch'd": 'sirfetchd', 'sirfetch’d': 'sirfetchd',
  'mr. mime': 'mr-mime', 'mr. rime': 'mr-rime', 'mime jr.': 'mime-jr',
  'type: null': 'type-null', 'flabébé': 'flabebe',
};

export function bulbaNameToSlug(name: string): string {
  const lower = name.trim().toLowerCase();
  const override = SLUG_OVERRIDES[lower];
  if (override) return override;
  return lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.:'’]/g, '')
    .replace(/\s+/g, '-');
}

function speciesFromRow(rowHtml: string): string[] {
  const names: string[] = [];
  const re = /title="([^"]+) \(Pokémon\)"/g;
  let m = re.exec(rowHtml);
  while (m) {
    const slug = bulbaNameToSlug(m[1]);
    if (names[names.length - 1] !== slug) names.push(slug);
    m = re.exec(rowHtml);
  }
  return names;
}

export function parseTradeLists(html: string): NpcTrade[] {
  const trades: NpcTrade[] = [];
  // Split into sections on headline spans; the id attribute carries the key.
  const parts = html.split(/<span class="mw-headline" id="/);
  for (const part of parts.slice(1)) {
    const idEnd = part.indexOf('"');
    if (idEnd < 0) continue;
    const versions = TRADE_SECTIONS[part.slice(0, idEnd)];
    if (!versions) continue;
    const root = parse(part.slice(idEnd));
    for (const table of root.querySelectorAll('table')) {
      const headerText = table.querySelectorAll('th').map((th) => th.text).join(' ');
      if (!headerText.includes("Player's Pokémon")) continue;
      for (const tr of table.querySelectorAll('tr')) {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 3) continue;
        const species = speciesFromRow(tr.innerHTML);
        if (species.length < 2) continue;
        trades.push({
          versions,
          give: species[0],
          receive: species[1],
          location: tds[0].text.replace(/\s+/g, ' ').trim(),
        });
      }
    }
  }
  return trades;
}
```

Note: the `speciesFromRow` regex matches the literal `é` in `(Pokémon)` — the fetched HTML is UTF-8 decoded text, so no percent-encoding handling is needed on `title` attributes.

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/obtainBulbapedia.test.ts`
Expected: PASS. The Stadium 2 table must NOT produce a trade (unmapped section).

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/obtain/bulbapedia.ts src/__tests__/obtainBulbapedia.test.ts
git commit -m "$(cat <<'EOF'
Add Bulbapedia in-game-trade parser

- `parseTradeLists` walks mw-headline sections mapped in `TRADE_SECTIONS`
- give/receive species read in order from `(Pokémon)` title links per row
- `bulbaNameToSlug` normalizes names to PokéAPI slugs with overrides
EOF
)"
```

---

### Task 5: Assembly — merge, derive, version-fold

**Files:**
- Create: `src/obtain/assemble.ts`
- Test: `src/__tests__/obtainAssemble.test.ts`

**Interfaces:**
- Consumes: `ObtainEntry`, `ObtainFile`, `ObtainGame`, `ObtainBreeding`, `VERSION_ORDER`, `VERSION_TO_GROUP`, `GROUP_GEN` from `@/obtain/types`; `NpcTrade` from `@/obtain/bulbapedia`
- Produces:

```ts
export interface AssembleInput {
  pokemonId: number;
  name: string;
  isDefaultForm: boolean;
  debutGen: number;
  apiEntries: Map<string, ObtainEntry[]>;
  pdbEntries: Map<string, ObtainEntry[]>;
  trades: NpcTrade[]; // pre-filtered to trades where receive === this species
  breeding: ObtainBreeding | null;
  evolvesFrom: { name: string; trigger: string } | null;
}
export function assembleObtainFile(input: AssembleInput): ObtainFile;
```

**Merge rules (the heart of the feature):**
1. Only versions whose group's gen ≥ `debutGen` are considered.
2. Per version: PokéAPI entries win when non-empty; otherwise PokemonDB entries.
3. NPC trades for that version are always appended as `{ method: 'trade', location, detail: 'Trade a GIVE to an NPC' }`.
4. If after 2–3 the version has no *obtainable* entry (obtainable = any method except `transfer`/`unavailable`/`special`), derive: `evolve` if `evolvesFrom` (detail `Evolve NAME (trigger)`), else `egg` if `breeding?.breedable` (detail `Breed and hatch — N cycles (S steps)`), else keep what's there or a bare `{ method: 'transfer', detail: 'Transfer from another game' }` if empty.
5. Non-default forms get NO padding: versions with neither API entries nor trades are omitted entirely (prevents claiming Alolan Rattata roams Kanto Route 1).
6. Versions inside the same version group with identical entry JSON fold into one `ObtainGame` with both versions; order follows `VERSION_ORDER`.

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/obtainAssemble.test.ts
import { describe, expect, it } from 'vitest';
import { assembleObtainFile, type AssembleInput } from '@/obtain/assemble';
import type { ObtainEntry } from '@/obtain/types';

const WILD_R4: ObtainEntry = { method: 'grass', location: 'Route 4', minLevel: 3, maxLevel: 5, chance: 45 };

function base(): AssembleInput {
  return {
    pokemonId: 999,
    name: 'testmon',
    isDefaultForm: true,
    debutGen: 1,
    apiEntries: new Map(),
    pdbEntries: new Map(),
    trades: [],
    breeding: { eggGroups: ['field'], hatchCycles: 10, steps: 2560, breedable: true },
    evolvesFrom: null,
  };
}

describe('assembleObtainFile', () => {
  it('prefers PokéAPI entries over PokemonDB for the same version', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.pdbEntries.set('red', [{ method: 'wild', location: 'Somewhere Vague' }]);
    const file = assembleObtainFile(input);
    const red = file.games.find((g) => g.versions.includes('red'));
    expect(red?.entries).toEqual([WILD_R4]);
  });

  it('folds versions with identical entries into one game row', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.apiEntries.set('blue', [WILD_R4]);
    const file = assembleObtainFile(input);
    const rb = file.games.find((g) => g.versionGroup === 'red-blue');
    expect(rb?.versions).toEqual(['red', 'blue']);
  });

  it('keeps differing versions of one group separate', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.apiEntries.set('blue', [{ ...WILD_R4, location: 'Route 5' }]);
    const file = assembleObtainFile(input);
    const rows = file.games.filter((g) => g.versionGroup === 'red-blue');
    expect(rows).toHaveLength(2);
  });

  it('appends NPC trades to direct entries', () => {
    const input = base();
    input.apiEntries.set('red', [WILD_R4]);
    input.trades = [{ versions: ['red', 'blue'], give: 'abra', receive: 'testmon', location: 'Cerulean City' }];
    const file = assembleObtainFile(input);
    const red = file.games.find((g) => g.versions.includes('red'));
    expect(red?.entries.some((e) => e.method === 'trade' && e.detail === 'Trade a ABRA to an NPC')).toBe(true);
  });

  it('derives evolve, then egg, then transfer for empty versions', () => {
    const evolver = base();
    evolver.evolvesFrom = { name: 'premon', trigger: 'level 26' };
    const evFile = assembleObtainFile(evolver);
    const evRed = evFile.games.find((g) => g.versions.includes('red'));
    expect(evRed?.entries[0]).toEqual({ method: 'evolve', detail: 'Evolve premon (level 26)' });

    const breeder = base();
    const eggFile = assembleObtainFile(breeder);
    const eggRed = eggFile.games.find((g) => g.versions.includes('red'));
    expect(eggRed?.entries[0].method).toBe('egg');

    const loner = base();
    loner.breeding = { eggGroups: ['no-eggs'], hatchCycles: 120, steps: 30720, breedable: false };
    const trFile = assembleObtainFile(loner);
    const trRed = trFile.games.find((g) => g.versions.includes('red'));
    expect(trRed?.entries[0].method).toBe('transfer');
  });

  it('starts at the debut gen and never before', () => {
    const input = base();
    input.debutGen = 4;
    const file = assembleObtainFile(input);
    expect(file.games.every((g) => g.gen >= 4)).toBe(true);
    expect(file.games.some((g) => g.versionGroup === 'diamond-pearl')).toBe(true);
  });

  it('omits padding for non-default forms', () => {
    const input = base();
    input.isDefaultForm = false;
    input.debutGen = 1;
    input.apiEntries.set('sun', [{ method: 'grass', location: 'Route 1', minLevel: 2, maxLevel: 4, chance: 30 }]);
    const file = assembleObtainFile(input);
    expect(file.games).toHaveLength(1);
    expect(file.games[0].versions).toEqual(['sun']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/obtainAssemble.test.ts`
Expected: FAIL — cannot resolve `@/obtain/assemble`

- [ ] **Step 3: Write the implementation**

```ts
// src/obtain/assemble.ts
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
  const entries: ObtainEntry[] = api.length > 0 ? [...api] : [...(input.pdbEntries.get(version) ?? [])];
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/obtainAssemble.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Run the whole suite, typecheck, commit**

Run: `bun run test` — expect no NEW failures (the two known `PokemonCard` sprite failures may appear).
Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/obtain/assemble.ts src/__tests__/obtainAssemble.test.ts
git commit -m "$(cat <<'EOF'
Add obtain-file assembly with derived fallbacks

- `assembleObtainFile` merges PokéAPI-first, PokemonDB fallback, trades appended
- empty versions derive `evolve` → `egg` → `transfer` (default forms only)
- identical versions fold into one `ObtainGame` row per version group
EOF
)"
```

---

### Task 6: Build script with caching and throttling

**Files:**
- Create: `scripts/build-obtain-data.mts`
- Modify: `.gitignore` (add `scripts/.cache/`)

**Interfaces:**
- Consumes: everything from `src/obtain/*` via relative imports (`../src/obtain/…` — the `@/` alias rule governs `src/` code; `scripts/` has no alias and existing scripts are standalone)
- Produces: `public/obtain/{id}.json` files matching `ObtainFile`; CLI `bun scripts/build-obtain-data.mts [--only 25,26,150]`

No unit test (network orchestration); verified by the smoke run in Step 3 and the full run in Task 7.

- [ ] **Step 1: Add `scripts/.cache/` to `.gitignore`**

Append the line `scripts/.cache/` to `.gitignore`.

- [ ] **Step 2: Write the script**

```ts
// scripts/build-obtain-data.mts
// Builds public/obtain/{id}.json. Run: bun scripts/build-obtain-data.mts [--only 25,26]
// Sources: PokéAPI (encounters, species, evolution), PokemonDB (where-to-find),
// Bulbapedia (in-game trades). All responses cache to scripts/.cache/obtain/.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleObtainFile } from '../src/obtain/assemble';
import { parseTradeLists, type NpcTrade } from '../src/obtain/bulbapedia';
import { encountersToEntries, type ApiEncounterArea } from '../src/obtain/pokeapi';
import { parseWhereToFind } from '../src/obtain/pokemondb';
import type { ObtainBreeding, ObtainEntry } from '../src/obtain/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, 'scripts', '.cache', 'obtain');
const OUT = join(ROOT, 'public', 'obtain');
const MAX_SPECIES = 1025;
const UA = 'pokemax-build/0.1 (personal project; one-time dataset build)';

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const lastHit = new Map<string, number>();
async function throttled(host: string, ms: number): Promise<void> {
  const prev = lastHit.get(host) ?? 0;
  const wait = prev + ms - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHit.set(host, Date.now());
}

async function fetchCached(url: string, throttleMs: number): Promise<string | null> {
  const key = createHash('md5').update(url).digest('hex');
  const file = join(CACHE, key);
  if (existsSync(file)) {
    const cached = readFileSync(file, 'utf8');
    return cached === '__404__' ? null : cached;
  }
  await throttled(new URL(url).host, throttleMs);
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (res.status === 404) {
    writeFileSync(file, '__404__');
    return null;
  }
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  writeFileSync(file, text);
  return text;
}

const getJson = async (url: string): Promise<unknown> => {
  const text = await fetchCached(url, 120);
  return text === null ? null : JSON.parse(text);
};

// --- tolerant readers for external JSON (no type assertions) ---
function rec(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? { ...v } : {};
}
function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function num(v: unknown): number {
  return typeof v === 'number' ? v : 0;
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : 0;
}
function pretty(slug: string): string {
  return slug.replace(/-/g, ' ');
}

function readEncounterAreas(json: unknown): ApiEncounterArea[] {
  const out: ApiEncounterArea[] = [];
  for (const a of arr(json)) {
    const area = rec(a);
    out.push({
      location_area: { name: str(rec(area.location_area).name) },
      version_details: arr(area.version_details).map((vd) => {
        const v = rec(vd);
        return {
          version: { name: str(rec(v.version).name) },
          encounter_details: arr(v.encounter_details).map((ed) => {
            const e = rec(ed);
            return {
              min_level: num(e.min_level),
              max_level: num(e.max_level),
              chance: num(e.chance),
              method: { name: str(rec(e.method).name) },
              condition_values: arr(e.condition_values).map((c) => ({ name: str(rec(c).name) })),
            };
          }),
        };
      }),
    });
  }
  return out;
}

function humanizeTrigger(detail: Record<string, unknown>): string {
  const trigger = str(rec(detail.trigger).name);
  if (trigger === 'level-up') {
    const lvl = detail.min_level;
    if (typeof lvl === 'number') return `level ${lvl}`;
    if (typeof detail.min_happiness === 'number') return 'friendship';
    return 'level up';
  }
  if (trigger === 'use-item') return `use ${pretty(str(rec(detail.item).name))}`;
  if (trigger === 'trade') {
    const held = str(rec(detail.held_item).name);
    return held ? `trade holding ${pretty(held)}` : 'link trade';
  }
  return trigger ? pretty(trigger) : 'evolve';
}

function findTrigger(chainNode: unknown, speciesName: string): string {
  const node = rec(chainNode);
  for (const child of arr(node.evolves_to)) {
    const c = rec(child);
    if (str(rec(c.species).name) === speciesName) {
      return humanizeTrigger(rec(arr(c.evolution_details)[0]));
    }
    const deeper = findTrigger(child, speciesName);
    if (deeper) return deeper;
  }
  return '';
}

async function main(): Promise<void> {
  const onlyFlag = process.argv.indexOf('--only');
  const only =
    onlyFlag >= 0
      ? new Set(process.argv[onlyFlag + 1].split(',').map((s) => parseInt(s, 10)))
      : null;

  console.log('Fetching Bulbapedia trade lists…');
  const bulbaHtml = await fetchCached('https://bulbapedia.bulbagarden.net/wiki/In-game_trade', 500);
  const allTrades: NpcTrade[] = bulbaHtml ? parseTradeLists(bulbaHtml) : [];
  console.log(`  ${allTrades.length} NPC trades parsed`);

  const failures: string[] = [];
  let written = 0;

  for (let sid = 1; sid <= MAX_SPECIES; sid++) {
    if (only && !only.has(sid)) continue;
    try {
      const species = rec(await getJson(`https://pokeapi.co/api/v2/pokemon-species/${sid}`));
      const speciesName = str(species.name);
      const debutGen = idFromUrl(str(rec(species.generation).url));
      const eggGroups = arr(species.egg_groups).map((g) => str(rec(g).name));
      const hatchCycles = num(species.hatch_counter);
      const breeding: ObtainBreeding = {
        eggGroups,
        hatchCycles,
        steps: hatchCycles * 256,
        breedable: !eggGroups.includes('no-eggs'),
      };
      const evolvesFromName = str(rec(species.evolves_from_species).name);
      let evolvesFrom: { name: string; trigger: string } | null = null;
      if (evolvesFromName) {
        const chainJson = rec(await getJson(str(rec(species.evolution_chain).url)));
        const trigger = findTrigger(chainJson.chain, speciesName) || 'evolve';
        evolvesFrom = { name: evolvesFromName, trigger };
      }

      // PokemonDB page is per species; slugs match PokéAPI species names.
      let pdbEntries = new Map<string, ObtainEntry[]>();
      const pdbHtml = await fetchCached(`https://pokemondb.net/pokedex/${speciesName}`, 400);
      if (pdbHtml) pdbEntries = parseWhereToFind(pdbHtml);
      else failures.push(`pdb-404:${speciesName}`);

      const trades = allTrades.filter((t) => t.receive === speciesName);

      for (const v of arr(species.varieties)) {
        const variety = rec(v);
        const isDefault = variety.is_default === true;
        const pokemonName = str(rec(variety.pokemon).name);
        const pokemonId = idFromUrl(str(rec(variety.pokemon).url));
        if (!pokemonId) continue;
        const encJson = await getJson(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        const file = assembleObtainFile({
          pokemonId,
          name: pokemonName,
          isDefaultForm: isDefault,
          debutGen,
          apiEntries: encountersToEntries(readEncounterAreas(encJson)),
          pdbEntries: isDefault ? pdbEntries : new Map(),
          trades: isDefault ? trades : [],
          breeding,
          evolvesFrom,
        });
        writeFileSync(join(OUT, `${pokemonId}.json`), JSON.stringify(file));
        written++;
      }
      if (sid % 50 === 0) console.log(`  …species ${sid}/${MAX_SPECIES} (${written} files)`);
    } catch (e) {
      failures.push(`species-${sid}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`Done: ${written} files written to public/obtain/`);
  if (failures.length > 0) {
    console.error(`Failures (${failures.length}):`);
    for (const f of failures) console.error(`  ${f}`);
  }
  // Completeness gate: every default species file must exist (skip in --only runs).
  if (!only) {
    let missing = 0;
    for (let sid = 1; sid <= MAX_SPECIES; sid++) {
      if (!existsSync(join(OUT, `${sid}.json`))) {
        console.error(`MISSING public/obtain/${sid}.json`);
        missing++;
      }
    }
    if (missing > 0) process.exit(1);
  }
}

await main();
```

Caveat for the implementer: default-species Pokémon ids equal species ids for 1–1025, which is what the completeness gate relies on. Variety ids (10001+) are extra files on top.

- [ ] **Step 3: Smoke-run three species**

Run: `bun scripts/build-obtain-data.mts --only 25,26,52`
Expected: exits 0; `public/obtain/25.json`, `26.json`, `52.json` exist, plus variety files for the Alolan/Galarian forms of Raichu and Meowth. Inspect `26.json` by eye: `games` ordered by gen, `versions` folded (e.g. `["red","blue"]`), `breeding` present, and Gen 8–9 rows carrying `evolve` details parsed from PokemonDB.

- [ ] **Step 4: Typecheck and commit**

`tsc -b` does not cover `scripts/`; still run `npx tsc -b --pretty false` to confirm the `src/obtain` imports stayed clean. Commit script + gitignore + the three smoke JSON outputs (they'll be regenerated identically by the full run):

```bash
git add scripts/build-obtain-data.mts .gitignore
git commit -m "$(cat <<'EOF'
Add obtain-dataset build script

- `scripts/build-obtain-data.mts`: PokéAPI + PokemonDB + Bulbapedia → `public/obtain/{id}.json`
- disk cache in `scripts/.cache/obtain/` (gitignored), per-host throttling, `--only` flag
- completeness gate fails the run if any default species file is missing
EOF
)"
```

---

### Task 7: Full dataset run and commit

**Files:**
- Create: `public/obtain/*.json` (~1025 species + variety files)

- [ ] **Step 1: Run the full build in the background**

Run: `bun scripts/build-obtain-data.mts` (background; expect 20–60 min first run — PokemonDB is throttled at 400ms × ~1000 pages). Re-runs resume from cache. Monitor for `Done:` and a zero exit.

- [ ] **Step 2: Sanity-check the output**

- `ls public/obtain | wc -l` — expect ≥ 1025.
- Spot-check `public/obtain/1.json` (Bulbasaur: `gift` entries in Gen 1 from PokéAPI), `public/obtain/65.json` (Alakazam: `evolve` derived entries with `link trade` trigger), `public/obtain/83.json` (Farfetch'd: NPC `trade` entry in Gen 1 versions).
- `du -sh public/obtain` — expect single-digit MB.

- [ ] **Step 3: Commit the dataset**

JSON-only commit → the pre-commit hook will fail on it; use `--no-verify` (known hook bug, see Global Constraints).

```bash
git add public/obtain
git commit --no-verify -m "$(cat <<'EOF'
Add generated obtainment dataset

- `public/obtain/{id}.json` for every species and variety
- output of `scripts/build-obtain-data.mts` against PokéAPI/PokemonDB/Bulbapedia
EOF
)"
```

---

### Task 8: `useObtainData` hook

**Files:**
- Create: `src/hooks/useObtainData.ts`
- Test: `src/__tests__/useObtainData.test.ts`

**Interfaces:**
- Consumes: `ObtainFile`, `isObtainFile` from `@/obtain/types`
- Produces: `useObtainData(pokemonId: number, enabled: boolean): { data: ObtainFile | null; loading: boolean; error: string | null }`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/useObtainData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useObtainData } from '@/hooks/useObtainData';

const FILE = { pokemonId: 25, name: 'pikachu', breeding: null, games: [] };

function okResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('useObtainData', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not fetch until enabled', () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    renderHook(() => useObtainData(25, false));
    expect(spy).not.toHaveBeenCalled();
  });

  it('fetches once enabled and caches per id', async () => {
    const spy = vi.fn().mockResolvedValue(okResponse(FILE));
    vi.stubGlobal('fetch', spy);
    const { result } = renderHook(() => useObtainData(25, true));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.name).toBe('pikachu');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toContain('obtain/25.json');

    const again = renderHook(() => useObtainData(25, true));
    await waitFor(() => expect(again.result.current.data).not.toBeNull());
    expect(spy).toHaveBeenCalledTimes(1); // served from module cache
  });

  it('reports an error on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    const { result } = renderHook(() => useObtainData(31337, true));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/useObtainData.test.ts`
Expected: FAIL — cannot resolve `@/hooks/useObtainData`

- [ ] **Step 3: Write the implementation** (mirror `useApiDetail`'s cache/inflight pattern)

```ts
// src/hooks/useObtainData.ts
import { useEffect, useState } from 'react';
import { isObtainFile, type ObtainFile } from '@/obtain/types';

const cache = new Map<number, ObtainFile>();
const inflight = new Map<number, Promise<ObtainFile>>();

interface ObtainState {
  data: ObtainFile | null;
  loading: boolean;
  error: string | null;
}

export function useObtainData(pokemonId: number, enabled: boolean): ObtainState {
  const [state, setState] = useState<ObtainState>(() => ({
    data: cache.get(pokemonId) ?? null,
    loading: false,
    error: null,
  }));

  useEffect(() => {
    if (!enabled) return;
    const cached = cache.get(pokemonId);
    if (cached) {
      setState({ data: cached, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ data: null, loading: true, error: null });

    let p = inflight.get(pokemonId);
    if (!p) {
      p = fetch(`${import.meta.env.BASE_URL}obtain/${pokemonId}.json`)
        .then((r) => {
          if (!r.ok) throw new Error(`No obtain data (${r.status})`);
          return r.json();
        })
        .then((json: unknown) => {
          if (!isObtainFile(json)) throw new Error('Malformed obtain data');
          cache.set(pokemonId, json);
          inflight.delete(pokemonId);
          return json;
        });
      inflight.set(pokemonId, p);
    }

    p.then((data) => {
      if (active) setState({ data, loading: false, error: null });
    }).catch((e: Error) => {
      inflight.delete(pokemonId);
      if (active) setState({ data: null, loading: false, error: e.message });
    });

    return () => {
      active = false;
    };
  }, [pokemonId, enabled]);

  return state;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/useObtainData.test.ts`
Expected: PASS

- [ ] **Step 5: Typecheck and commit**

Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/hooks/useObtainData.ts src/__tests__/useObtainData.test.ts
git commit -m "$(cat <<'EOF'
Add `useObtainData` hook

- lazy-fetches `obtain/{id}.json` under `BASE_URL` when enabled
- module cache + inflight dedupe, mirrors `useApiDetail`
- validates payload with `isObtainFile` guard
EOF
)"
```

---

### Task 9: `ObtainMethods` component + styles

**Files:**
- Create: `src/components/ObtainMethods.tsx`
- Modify: `src/styles/crt.css` (append `.crt-obtain-*` block + light-theme overrides)
- Test: `src/__tests__/ObtainMethods.test.tsx`

**Interfaces:**
- Consumes: `ObtainFile`, `ObtainEntry`, `ObtainGame` from `@/obtain/types`; `GENERATIONS` from `@/generations`
- Produces: `default export function ObtainMethods(props: { data: ObtainFile | null; loading: boolean; error: string | null; currentGen: number })`

- [ ] **Step 1: Write the failing test**

```tsx
// src/__tests__/ObtainMethods.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ObtainMethods from '@/components/ObtainMethods';
import type { ObtainFile } from '@/obtain/types';

const FILE: ObtainFile = {
  pokemonId: 25,
  name: 'pikachu',
  breeding: { eggGroups: ['field', 'fairy'], hatchCycles: 10, steps: 2560, breedable: true },
  games: [
    {
      gen: 1,
      versionGroup: 'red-blue',
      versions: ['red', 'blue'],
      entries: [
        { method: 'grass', location: 'Viridian Forest', minLevel: 3, maxLevel: 5, chance: 45, conditions: ['night'] },
      ],
    },
    {
      gen: 1,
      versionGroup: 'yellow',
      versions: ['yellow'],
      entries: [{ method: 'gift', location: 'Pallet Town', detail: 'Starter from Professor Oak' }],
    },
    {
      gen: 5,
      versionGroup: 'black-white',
      versions: ['black', 'white'],
      entries: [{ method: 'transfer', detail: 'Trade/migrate from another game' }],
    },
  ],
};

describe('ObtainMethods', () => {
  it('shows breeding info and the current gen expanded', () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} />);
    expect(screen.getByText(/FIELD\/FAIRY/)).toBeInTheDocument();
    expect(screen.getByText(/2,560 STEPS/)).toBeInTheDocument();
    // Gen 1 expanded: entries visible
    expect(screen.getByText('Viridian Forest')).toBeInTheDocument();
    expect(screen.getByText('GIFT')).toBeInTheDocument();
    expect(screen.getByText(/L3–5 · 45%/)).toBeInTheDocument();
    expect(screen.getByText('NIGHT')).toBeInTheDocument();
  });

  it('collapses other gens until toggled', async () => {
    render(<ObtainMethods data={FILE} loading={false} error={null} currentGen={1} />);
    expect(screen.queryByText(/Trade\/migrate/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /GEN V/ }));
    expect(screen.getByText(/Trade\/migrate/)).toBeInTheDocument();
  });

  it('renders the unavailable state on error', () => {
    render(<ObtainMethods data={null} loading={false} error="No obtain data (404)" currentGen={1} />);
    expect(screen.getByText('OBTAIN DATA UNAVAILABLE')).toBeInTheDocument();
  });

  it('renders a loading line', () => {
    render(<ObtainMethods data={null} loading error={null} currentGen={1} />);
    expect(screen.getByText(/LOADING/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/ObtainMethods.test.tsx`
Expected: FAIL — cannot resolve `@/components/ObtainMethods`

- [ ] **Step 3: Write the component**

```tsx
// src/components/ObtainMethods.tsx
import { useState } from 'react';
import { getGen } from '@/generations';
import type { ObtainEntry, ObtainFile, ObtainGame } from '@/obtain/types';

interface Props {
  data: ObtainFile | null;
  loading: boolean;
  error: string | null;
  currentGen: number;
}

const METHOD_LABEL: Record<ObtainEntry['method'], string> = {
  grass: 'GRASS',
  surf: 'SURF',
  fish: 'FISH',
  cave: 'CAVE',
  wild: 'WILD',
  static: 'STATIC',
  gift: 'GIFT',
  trade: 'TRADE',
  egg: 'EGG',
  evolve: 'EVOLVE',
  transfer: 'TRANSFER',
  unavailable: 'N/A',
  special: 'SPECIAL',
};

// Tint groups map onto existing palette vars in crt.css.
const METHOD_TINT: Record<ObtainEntry['method'], string> = {
  grass: 'primary',
  surf: 'tertiary',
  fish: 'tertiary',
  cave: 'primary',
  wild: 'primary',
  static: 'accent',
  gift: 'accent',
  trade: 'accent',
  egg: 'tertiary',
  evolve: 'tertiary',
  transfer: 'dim',
  unavailable: 'dim',
  special: 'primary',
};

function prettyVersions(versions: string[]): string {
  return versions.map((v) => v.toUpperCase().replace(/-/g, ' ')).join(' / ');
}

function levelRate(e: ObtainEntry): string {
  const bits: string[] = [];
  if (e.minLevel !== undefined && e.maxLevel !== undefined) {
    bits.push(e.minLevel === e.maxLevel ? `L${e.minLevel}` : `L${e.minLevel}–${e.maxLevel}`);
  }
  if (e.chance !== undefined) bits.push(`${e.chance}%`);
  return bits.join(' · ');
}

function EntryRow({ entry }: { entry: ObtainEntry }) {
  const meta = levelRate(entry);
  return (
    <li className={`crt-obtain-row crt-obtain-row--${METHOD_TINT[entry.method]}`}>
      <span className="crt-obtain-tag">{METHOD_LABEL[entry.method]}</span>
      {entry.location && <span className="crt-obtain-loc">{entry.location}</span>}
      {meta && <span className="crt-obtain-meta">{meta}</span>}
      {entry.conditions?.map((c) => (
        <span key={c} className="crt-obtain-cond">
          {c.toUpperCase().replace(/-/g, ' ')}
        </span>
      ))}
      {entry.detail && <span className="crt-obtain-detail">{entry.detail}</span>}
    </li>
  );
}

function GameRow({ game }: { game: ObtainGame }) {
  return (
    <div className="crt-obtain-game">
      <div className="crt-obtain-game-name">{prettyVersions(game.versions)}</div>
      <ul className="crt-obtain-entries">
        {game.entries.map((e, i) => (
          <EntryRow key={i} entry={e} />
        ))}
      </ul>
    </div>
  );
}

export default function ObtainMethods({ data, loading, error, currentGen }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([currentGen]));
  if (loading) return <div className="crt-obtain-status">LOADING OBTAIN DATA…</div>;
  if (error || !data) return <div className="crt-obtain-status">OBTAIN DATA UNAVAILABLE</div>;

  const gens = [...new Set(data.games.map((g) => g.gen))];
  const toggle = (gen: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(gen)) next.delete(gen);
      else next.add(gen);
      return next;
    });

  return (
    <div className="crt-obtain">
      {data.breeding && (
        <div className="crt-obtain-breeding">
          EGG GROUPS: {data.breeding.eggGroups.map((g) => g.toUpperCase()).join('/')}
          {data.breeding.breedable
            ? ` · HATCH: ${data.breeding.hatchCycles} CYCLES (${data.breeding.steps.toLocaleString('en-US')} STEPS)`
            : ' · CANNOT BREED'}
        </div>
      )}
      {gens.map((gen) => {
        const meta = getGen(gen);
        const open = expanded.has(gen);
        return (
          <div key={gen} className="crt-obtain-gen">
            <button
              type="button"
              className="crt-obtain-gen-toggle"
              aria-expanded={open}
              onClick={() => toggle(gen)}
            >
              {open ? '▼' : '▶'} GEN {meta.roman} · {meta.region.toUpperCase()}
            </button>
            {open &&
              data.games.filter((g) => g.gen === gen).map((g, i) => <GameRow key={i} game={g} />)}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Append styles to `src/styles/crt.css`**

Append before the light-theme block (adjust position to wherever component styles live; follow neighboring patterns):

```css
/* HOW TO OBTAIN */
.crt-obtain-status {
  color: var(--dim);
  font-family: var(--font-body);
  font-size: 0.8rem;
  padding: 4px 0;
}
.crt-obtain-breeding {
  color: var(--tertiary);
  font-family: var(--font-body);
  font-size: 0.75rem;
  margin-bottom: 8px;
}
.crt-obtain-gen-toggle {
  background: none;
  border: none;
  color: var(--primary);
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  padding: 6px 0 2px;
  display: block;
  width: 100%;
  text-align: left;
}
.crt-obtain-game {
  margin: 4px 0 8px 14px;
}
.crt-obtain-game-name {
  color: var(--accent);
  font-size: 0.85rem;
  margin-bottom: 2px;
}
.crt-obtain-entries {
  list-style: none;
  margin: 0;
  padding: 0 0 0 10px;
}
.crt-obtain-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  padding: 2px 0;
  font-family: var(--font-body);
  font-size: 0.78rem;
}
.crt-obtain-tag {
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 0 4px;
  font-size: 0.68rem;
  letter-spacing: 0.5px;
}
.crt-obtain-row--tertiary .crt-obtain-tag {
  border-color: var(--tertiary);
  color: var(--tertiary);
}
.crt-obtain-row--accent .crt-obtain-tag {
  border-color: var(--accent);
  color: var(--accent);
}
.crt-obtain-row--dim .crt-obtain-tag,
.crt-obtain-row--dim .crt-obtain-detail {
  border-color: var(--dim);
  color: var(--dim);
}
.crt-obtain-loc {
  color: var(--primary);
}
.crt-obtain-meta {
  color: var(--tertiary);
}
.crt-obtain-cond {
  color: var(--dim);
  border: 1px dashed var(--dim);
  padding: 0 3px;
  font-size: 0.65rem;
}
.crt-obtain-detail {
  color: var(--primary);
  opacity: 0.9;
}
```

In the existing `:root[data-theme="light"]` overrides section, add matching rules only if the dark values rely on glow/shadow effects that need light equivalents; the block above uses palette variables throughout, which the light theme redefines — verify visually in Step 6 and add overrides only where contrast fails.

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test src/__tests__/ObtainMethods.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Typecheck and commit**

Run: `npx tsc -b --pretty false` — expect silence.

```bash
git add src/components/ObtainMethods.tsx src/__tests__/ObtainMethods.test.tsx src/styles/crt.css
git commit -m "$(cat <<'EOF'
Add `ObtainMethods` component

- generation groups collapsible, current gen expanded by default
- method tags tinted via palette vars; level/rate/condition chips per entry
- loading and `OBTAIN DATA UNAVAILABLE` states
EOF
)"
```

---

### Task 10: Wire the section into `PokemonCard`

**Files:**
- Modify: `src/components/Section.tsx` (optional `onToggle` prop)
- Modify: `src/components/PokemonCard.tsx` (new section between EVOLUTION and MOVES)
- Test: extend `src/__tests__/ObtainMethods.test.tsx`? No — add `src/__tests__/SectionToggle.test.tsx`

**Interfaces:**
- Consumes: `useObtainData` from `@/hooks/useObtainData`, `ObtainMethods` from `@/components/ObtainMethods`
- Produces: `Section` gains `onToggle?: (open: boolean) => void`

- [ ] **Step 1: Write the failing test for `Section` `onToggle`**

```tsx
// src/__tests__/SectionToggle.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Section from '@/components/Section';

describe('Section onToggle', () => {
  it('reports open state changes', async () => {
    const spy = vi.fn();
    render(
      <Section label="HOW TO OBTAIN" defaultOpen={false} onToggle={spy}>
        <div>body</div>
      </Section>,
    );
    await userEvent.click(screen.getByText('HOW TO OBTAIN'));
    expect(spy).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/__tests__/SectionToggle.test.tsx`
Expected: FAIL — `onToggle` prop does not exist / never called

- [ ] **Step 3: Extend `Section`**

```tsx
// src/components/Section.tsx — full replacement
import type { ReactNode, SyntheticEvent } from 'react';

interface Props {
  label: string;
  count?: number | string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
}

export default function Section({ label, count, defaultOpen = true, onToggle, children }: Props) {
  return (
    <details
      className="crt-section"
      open={defaultOpen}
      onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => onToggle?.(e.currentTarget.open)}
    >
      <summary className="crt-section-summary">
        <span className="crt-section-label">{label}</span>
        {count !== undefined && <span className="crt-section-count"> · {count}</span>}
      </summary>
      <div className="crt-section-body">{children}</div>
    </details>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test src/__tests__/SectionToggle.test.tsx`
Expected: PASS

- [ ] **Step 5: Wire into `PokemonCard.tsx`**

Add imports at the top with the other component/hook imports:

```tsx
import ObtainMethods from '@/components/ObtainMethods';
import { useObtainData } from '@/hooks/useObtainData';
```

Near the other `useState` calls in the card component body (around the `buildGame` state):

```tsx
const [obtainOpen, setObtainOpen] = useState(false);
const obtain = useObtainData(pokemon.id, obtainOpen);
```

Between the EVOLUTION and MOVES sections (currently `PokemonCard.tsx:602-608`):

```tsx
<Section
  label="HOW TO OBTAIN"
  count={obtain.data ? obtain.data.games.length : undefined}
  defaultOpen={false}
  onToggle={setObtainOpen}
>
  <ObtainMethods
    data={obtain.data}
    loading={obtain.loading}
    error={obtain.error}
    currentGen={gen}
  />
</Section>
```

(`gen` is the prop already in scope that `meta = getGen(gen)` uses.)

- [ ] **Step 6: Run the full suite and typecheck**

Run: `bun run test`
Expected: no NEW failures beyond the two known `PokemonCard` sprite-source failures. The new section is `defaultOpen={false}`, so existing `PokemonCard` tests trigger no fetch.

Run: `npx tsc -b --pretty false` — expect silence.

- [ ] **Step 7: Visual check**

Run `bun run dev`, open a Pokémon (Pikachu #25), expand HOW TO OBTAIN: current gen expanded, entries show tags/levels/rates, light theme legible (toggle theme). Check Alakazam (#65) shows `EVOLVE`/`TRADE` derivations and Farfetch'd (#83) shows the Gen 1 NPC trade.

- [ ] **Step 8: Commit**

```bash
git add src/components/Section.tsx src/components/PokemonCard.tsx src/__tests__/SectionToggle.test.tsx
git commit -m "$(cat <<'EOF'
Wire HOW TO OBTAIN section into `PokemonCard`

- `Section` gains optional `onToggle`; obtain data fetches on first open
- section sits between EVOLUTION and MOVES, `defaultOpen` false
- `count` shows number of game rows once loaded
EOF
)"
```

---

## Final verification

- [ ] `bun run test` — full suite, no new failures
- [ ] `npx tsc -b --pretty false` — silent
- [ ] `bun run build` — succeeds; confirm `dist/obtain/` contains the JSON files
- [ ] Do NOT push — leave that to the user
