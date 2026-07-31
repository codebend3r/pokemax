# Obtainment methods — design

Date: 2026-07-31
Status: approved for planning

## Goal

Show how to obtain every Pokémon in every main-series game it appears in: wild encounters
(route, method, level range, encounter rate, conditions), gifts, NPC in-game trades,
egg/breeding info, and derived paths (evolve / hatch / transfer) for games with no direct
source.

## Decisions (from brainstorming)

- **Detail level:** full encounter data — location + method + level range + encounter % +
  conditions (time of day, season, rod tier, etc.), not just a location line.
- **Fallbacks:** games with no direct source show derived methods — "EVOLVE from Kadabra
  (link trade)", "EGG — breed Raichu line, 10 cycles (2,560 steps)", or "TRANSFER only".
  No game is silently omitted.
- **Data strategy:** full static dataset built ahead of time by a script; the app never
  scrapes or hits PokéAPI encounters at runtime.
- **Sources:** PokéAPI (Gen 1–7 full encounter detail, breeding facts, evolution chain) +
  PokemonDB "Where to find" tables (per-game location lines for every game incl.
  SwSh/BDSP/PLA/SV, gift and availability flags) + Bulbapedia consolidated per-game
  in-game-trade lists (structured NPC trades).

## Part 1 — build-time data pipeline

`scripts/build-obtain-data.ts`, run manually with bun. Not part of the app build.

1. **PokéAPI** — for each Pokémon (including regional forms, which have their own ids):
   `/pokemon/{id}/encounters` for per-version wild data (location area, method, min/max
   level, chance, condition values). `pokemon-species` for egg groups, hatch cycles,
   gender rate, baby forms. Evolution chain for derived-method computation. Location-area
   names resolved to display names via the location endpoints (cached).
2. **PokemonDB** — scrape `/pokedex/{name}`'s "Where to find" table: one location line per
   game for every game, including Gen 8–9 where PokéAPI has nothing. Lines already encode
   gifts ("Gift from…"), trades, "Evolve", "Breed", and "Not available".
3. **Bulbapedia** — scrape the per-game "in-game trades" list pages (~10 trades per game)
   into structured entries: game, species given, species received, NPC location, nickname.
4. **Merge, per species per game:** prefer PokéAPI full-detail encounters (Gen 1–7); fall
   back to PokemonDB location text (Gen 8–9); overlay NPC trades; then, if a game still
   has no direct entry, derive: evolve-from (with trigger), egg/breeding (from egg groups
   + hatch cycles), else transfer-only.
5. **Output:** `public/obtain/{id}.json`, one file per Pokémon, committed. A few KB each;
   lazily fetched so the multi-MB total never enters the bundle.

Raw HTTP responses cache to a gitignored `scripts/.cache/`; requests are throttled. The
script fails loudly if any species in the national dex produced no file.

### Data model (`public/obtain/{id}.json`)

```ts
interface ObtainFile {
  pokemonId: number;
  name: string;
  breeding: {
    eggGroups: string[];
    hatchCycles: number;   // from species hatch_counter
    steps: number;         // cycles * 256 (display convenience)
    breedable: boolean;    // false for Undiscovered group / genderless-without-Ditto
  } | null;
  games: ObtainGame[];     // ordered by gen, then version group
}

interface ObtainGame {
  gen: number;             // 1–9
  versionGroup: string;    // e.g. 'red-blue'
  versions: string[];      // e.g. ['red'] — versions merged when entries are identical
  entries: ObtainEntry[];
}

interface ObtainEntry {
  method: 'grass' | 'surf' | 'fish' | 'cave' | 'static' | 'gift' | 'trade'
        | 'egg' | 'evolve' | 'transfer' | 'special';
  location?: string;       // "Route 4", "Vermilion City"
  minLevel?: number;
  maxLevel?: number;
  chance?: number;         // percent, when known (PokéAPI gens)
  conditions?: string[];   // 'night', 'winter', 'old-rod', 'swarm', …
  detail?: string;         // "Trade a SPEAROW to the NPC", "Evolve Kadabra (link trade)"
}
```

`method` maps from PokéAPI encounter methods (walk→grass, rock-smash/headbutt/dark-grass
etc. → nearest tag, only-one→static) and from PokemonDB/Bulbapedia line parsing.

## Part 2 — UI

- New collapsible `Section label="HOW TO OBTAIN"` in `PokemonCard.tsx`, between EVOLUTION
  and MOVES. `defaultOpen={false}`.
- Opening it runs `useObtainData(pokemonId)` — fetches `obtain/{id}.json` (respecting
  `import.meta.env.BASE_URL`), caches in a module-level map.
- New `ObtainMethods.tsx` renders: generation header → game(s) → entry rows. Generation
  groups are collapsible, collapsed by default except the currently selected generation
  (same pattern as trainer regions).
- Entry row anatomy: color-coded method tag (`GRASS`, `SURF`, `FISH`, `CAVE`, `GIFT`,
  `TRADE`, `STATIC`, `EGG`, `EVOLVE`, `TRANSFER`) using existing CRT palette variables →
  location → `L3–5 · 45%` when known → condition chips (`NIGHT`, `OLD ROD`, …) →
  `detail` free text for trades/gifts/derived methods.
- Transfer-only games render one dim `TRANSFER only` row.
- Regional forms use the displayed form's own Pokémon id, so Alolan/Galarian/Hisuian/
  Paldean variants show their actual games.
- Light-theme overrides for any new tinted elements go in `crt.css` under the existing
  `:root[data-theme="light"]` block.

## Error handling

- Missing file / failed fetch → single dim "OBTAIN DATA UNAVAILABLE" line in the section
  body. No crash, no retry UI.
- Pipeline: parse failures for a single species log and continue, then the final
  completeness check reports every species that ended up without a file.

## Testing

- Vitest unit tests for the pipeline's pure merge/derive functions (PokéAPI + PokemonDB +
  trade fixtures in, merged `ObtainFile` out), including the fallback derivation and
  version-merging logic.
- Component test for `ObtainMethods`: fixture JSON in, assert method tags, a trade line,
  level/rate text, and the unavailable state — role/label queries, no CSS-class asserts.
- Tests live in `src/__tests__/`, run with `bun run test`.

## Out of scope

- Event/distribution Pokémon (Mew truck rumors stay rumors).
- Side games (Colosseum, XD, GO, Mystery Dungeon).
- Exact Gen 8–9 encounter percentages where sources only give locations.
- Auto-refreshing the dataset; re-running the script is a manual chore.
