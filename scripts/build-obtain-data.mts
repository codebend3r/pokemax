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
