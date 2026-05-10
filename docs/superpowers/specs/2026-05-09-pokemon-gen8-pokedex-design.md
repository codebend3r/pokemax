# Gen 8 Pokédex — Design

**Date:** 2026-05-09
**Status:** Approved for implementation

## Overview

A single-page React app that lets the user search any Generation VIII Pokémon (Pokémon Sword/Shield, 96 species) and view a full stat sheet: sprite (with shiny toggle), types, base stats, abilities, evolution chain, and moves learned in Sword/Shield. The visual style is **CRT terminal** — phosphor green on black, scanline overlay, magenta highlights, monospace font, blinking cursor.

## Goals

- Search by name (Gen 8 only — other generations return "not found")
- Show full stat profile: HP / ATK / DEF / SP.ATK / SP.DEF / SPD as bar graphs
- Show abilities, including the hidden ability (marked)
- Show evolution chain with evolution conditions (level / item / branching)
- Show moves learned in Sword/Shield, grouped by learn method
- Toggle between normal and shiny artwork
- All UI in CRT terminal aesthetic

## Non-Goals (explicitly out of scope)

- Other generations
- Pokémon locations / encounter data
- Type-effectiveness charts / damage calculators
- Move details (power, accuracy, effect text) — name + learn method only
- Form variants (Gigantamax, Galarian) beyond what the default `/pokemon/{name}` returns
- User accounts, favorites, or persistence
- Light mode / theme switching
- Mobile-specific layout (responsive is fine; mobile-first is not a goal)

## Tech Stack

- **Vite + React 18 + TypeScript** — scaffolded via `npm create vite@latest pokemon-gen8 -- --template react-ts`
- **Plain CSS** in a single `crt.css` — Tailwind would fight the bespoke retro aesthetic
- **No router, no state library** — single page, local component state via `useState`
- **No HTTP client library** — `fetch` is sufficient
- **Vitest + @testing-library/react** for tests
- **Data:** [PokeAPI](https://pokeapi.co) — free, no auth, has Gen 8

## Data Flow

### On mount

1. `GET https://pokeapi.co/api/v2/generation/8`
2. Extract `pokemon_species[].name` → cache the 96-name list in module-scoped variable
3. Used for: validating the search input, powering autocomplete suggestions

### On search submit

1. **Validate**: lowercase + trim. If name not in the Gen 8 list → show `ERR: NOT FOUND IN GEN VIII`
2. **Fetch Pokémon**: `GET /api/v2/pokemon/{name}` → sprites, stats, types, abilities, moves
3. **Fetch species**: `GET /api/v2/pokemon-species/{name}` → `evolution_chain.url`
4. **Fetch evolution chain**: `GET {evolution_chain.url}` → recursive evolution tree
5. Render the full card

Steps 2–4 fire **in parallel** where possible: fetch pokemon and species concurrently; the evolution chain depends on the species response so it follows.

### Loading and error states

- **Loading** — `> SCANNING...` with a blinking cursor
- **Not in Gen 8** — `ERR: NOT FOUND IN GEN VIII` (validation, no API call)
- **API failure** — `ERR: TRANSMISSION LOST [retry]`
- **Empty (initial)** — instructions: `▶ ENTER POKéMON NAME AND PRESS RETURN`

## UI Layout

Single column, max-width ~720px, centered. From top:

1. **Header bar** — `▶ POKéDEX // GEN VIII` in magenta with phosphor glow, small status line beneath (e.g. `[ READY ]` or `[ SCANNING... ]`)
2. **Search input** — full-width, monospace, `> ` prompt prefix, blinking cursor when focused. Submits on Enter. Optional autocomplete dropdown showing matching Gen 8 names as the user types.
3. **Result card** (when a Pokémon is loaded) — bordered with single-line ASCII-style border, divided into sections:
   - **Top section**: official artwork sprite (left), name + dex number + types as colored chips (right), shiny toggle button `[NORMAL] | [SHINY]` below the sprite
   - **Stats section**: six rows, each with label + bar graph + numeric value. Bar uses block characters (`█████░░░░░`).
   - **Abilities section**: bullet list. Hidden ability suffixed with `(HIDDEN)`.
   - **Evolutions section**: horizontal chain with `→` arrows and condition labels (`Lv 16`, `Use: Thunder Stone`, etc.). Branching evolutions render as a fork.
   - **Moves section**: collapsible groups by learn method (Level-up / TM / TR / Egg / Tutor) for **version group `sword-shield`**. Within each group, sorted by level (level-up) or alphabetically (others). Default-collapsed except Level-up.

## Visual Theme (`crt.css`)

- **Colors**: bg `#0a0e27`, primary `#00ff9f` (phosphor green), accent `#ff00aa` (magenta), dim `rgba(0, 255, 159, 0.6)`
- **Font**: `'VT323', 'Courier New', monospace` — load VT323 from Google Fonts for authentic CRT feel
- **Glow**: `text-shadow: 0 0 4px currentColor` on text, slightly stronger on the heading
- **Scanlines**: full-screen `::after` overlay with `repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.3) 3px)`, `pointer-events: none`
- **Cursor**: `▮` block, CSS keyframe animation `@keyframes blink { 50% { opacity: 0; } }`
- **Borders**: 1px solid phosphor green, no rounded corners
- **No animations beyond cursor blink and a brief CRT power-on flash on first load** (single 400ms scaleY animation)

## Component Structure

```
src/
  App.tsx                    # top-level: header, search, result orchestration
  main.tsx                   # Vite entry
  api.ts                     # fetchGen8List, fetchPokemon, fetchSpecies, fetchEvolutionChain
  types.ts                   # Pokemon, Stat, Ability, EvolutionNode, Move, etc.
  hooks/
    useGen8List.ts           # fetches and caches the 96-name list
    usePokemon.ts            # orchestrates the 3 fetches for a queried name
  components/
    SearchBar.tsx            # input + autocomplete dropdown + submit
    PokemonCard.tsx          # composes the sections below
    StatBar.tsx              # one stat row (label, bar, value)
    AbilityList.tsx
    EvolutionChain.tsx       # renders recursive chain, handles branches
    MoveList.tsx             # collapsible groups by learn method
    ShinyToggle.tsx
    StatusLine.tsx           # the [READY] / [SCANNING...] / [ERR] line
  styles/
    crt.css                  # the whole theme
  __tests__/                 # Vitest tests (see Testing)
```

### Component responsibilities

- **App** — owns the queried Pokémon name and shiny flag in state; renders header, SearchBar, StatusLine, and PokemonCard.
- **SearchBar** — controlled input. Filters Gen 8 list on each keystroke for autocomplete. On submit, calls `onSearch(name)`.
- **PokemonCard** — pure presentational. Receives the full Pokémon/species/evolution data. Composes sub-components.
- **EvolutionChain** — recursive: each node renders itself, then its children with arrows. Branches render as a vertical fork.
- **MoveList** — filters `pokemon.moves[].version_group_details` to `version_group.name === 'sword-shield'`. Groups by `move_learn_method.name`.

## API Module (`api.ts`)

```ts
const BASE = 'https://pokeapi.co/api/v2';

export async function fetchGen8List(): Promise<string[]>
export async function fetchPokemon(name: string): Promise<PokemonResponse>
export async function fetchSpecies(name: string): Promise<SpeciesResponse>
export async function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse>
```

Each wraps `fetch`, throws on non-2xx, returns parsed JSON. No retry logic in v1 — the error UI's `[retry]` button just re-runs the search.

## Testing

**Unit (Vitest):**
- `api.ts` — mock `fetch` global, assert correct URLs and error throwing
- Gen 8 filter logic — given a name list, validate "in Gen 8" and "not in Gen 8" cases
- Move grouping — given a `pokemon.moves` array, assert correct grouping by learn method and filtering to sword-shield

**Component (@testing-library/react):**
- `SearchBar` — typing filters autocomplete; Enter calls `onSearch` with the typed name
- `PokemonCard` — renders all stat values, abilities (hidden marker present), evolution chain, move list
- `ShinyToggle` — clicking switches the sprite URL prop passed to the image
- `EvolutionChain` — renders a 3-stage linear chain and a branching chain (Toxel) correctly

**Skipped:** E2E tests, visual regression. Project size doesn't justify it.

## Risks and Open Questions

- **PokeAPI rate limits** — generous (no auth required), but if the user spams searches we could hit cache layers. Acceptable for v1.
- **Sprite gaps** — some Pokémon may lack official-artwork shinies. Fallback chain: `other.official-artwork.front_shiny` → `sprites.front_shiny` → normal sprite with a `[shiny unavailable]` note.
- **Branching evolutions in Gen 8** — Toxel→Toxtricity, Galarian Yamask→Runerigus, Applin→Flapple/Appletun. Evolution chain rendering must handle these.
- **Form variants** — Galarian forms come back from `/pokemon/{name}` with name like `meowth-galar`. Search by canonical species name returns the default form; alternate forms are not surfaced in v1.

## Implementation Phases (rough)

1. Scaffold Vite + TS, set up base CRT styles, render the empty header + search input
2. `api.ts` + `useGen8List` hook + autocomplete + Gen 8 validation
3. `usePokemon` hook + PokemonCard with sprite, name, types, base stats, abilities
4. ShinyToggle
5. EvolutionChain
6. MoveList
7. Loading + error states polish, CRT power-on animation
8. Tests
