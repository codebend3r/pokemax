# pokemax

A retro CRT-terminal-styled Pokédex for **Generation VIII** (Pokémon Sword/Shield, 96 species). Browse the whole gen as a sprite grid, search by name, and inspect every stat, ability, evolution, and move — plus the canonical competitive build sourced live from Smogon.

Built with Vite + React 18 + TypeScript. Phosphor green on navy, scanline overlay, magenta accents, VT323 monospace, blinking cursor — the whole CRT aesthetic.

---

## Screenshots

### Desktop · home (browse + filter)

The full Gen 8 grid renders below the search input. Typing instantly hides non-matching entries; hovering a cell swaps the static pixel sprite for the animated showdown sprite.

![Desktop home](docs/screenshots/desktop-home.png)

### Desktop · Pokémon card

Click any cell to open the full card: official artwork (with `2D ⇄ 3D` toggle and `NORMAL ⇄ SHINY` toggle), color-coded type chips, base stats with bar graphs, abilities (hidden ability marked), full evolution chain with conditions, every move learned in Sword/Shield grouped by learn method, and a Smogon-sourced competitive build with tier, item, ability, nature, EVs, and recommended moves.

![Pokémon card](docs/screenshots/desktop-card.png)

### Click any type chip for matchups

Each colored type chip is clickable. Expands inline to show that type's offensive matchups (super effective vs / not very effective vs / no effect) and defensive matchups (weak to / resists / immune).

![Type matchup expansion](docs/screenshots/desktop-type-matchup.png)

### Mobile

The whole layout is responsive. Card top stacks (image full-width above name + types), stat bars compress, type chips wrap, move list goes single-column, and the build summary collapses.

| Mobile · home | Mobile · card |
|:--:|:--:|
| ![Mobile home](docs/screenshots/mobile-home.png) | ![Mobile card](docs/screenshots/mobile-card.png) |

---

## Features

- **Browseable Gen 8 grid** — all 96 species with pixel sprites, sorted by Pokédex number
- **Live filter** — typing in the search bar hides non-matching cells in real time; Enter jumps to the first match; Esc clears
- **Hover-animated sprites** — flat 2D pixel sprite by default; on hover, the animated Showdown sprite plays. Only the hovered cell animates, never all at once.
- **Full Pokémon card** with collapsible sections:
  - Six base stats (HP / ATK / DEF / SP.ATK / SP.DEF / SPD) as block-character bar graphs
  - Abilities, hidden ability marked
  - Evolution chain with conditions and branching support (Toxel → Toxtricity Amped/Low Key, Applin → Flapple/Appletun, etc.) — every node clickable to jump
  - Every Sword/Shield move grouped by learn method (Level-up / TM / TR / Egg / Tutor)
  - Smogon competitive build (tier, item, ability, nature, EVs, moves) — fetched live from `pkmn.github.io`
- **Click for details** — moves, abilities, items, natures, and types are all clickable. Each expands inline:
  - **Move** → type · class · power · accuracy · PP · priority · effect text
  - **Ability** → effect description
  - **Item** → category + effect
  - **Nature** → `+10% SpAtk · −10% Atk` style summary
  - **Type** → offensive + defensive matchup chart
- **2D / 3D sprite toggle** — swap between the animated 2D pixel sprite and the Pokémon HOME 3D render (with continuous CSS bob)
- **Shiny toggle** — official-artwork shiny variant with graceful fallback to pixel shiny when unavailable
- **CRT aesthetic** — VT323 font, phosphor green on dark navy, magenta accents, scanline overlay, power-on flash, blinking cursor
- **Mobile responsive** — single-column card on phone, compressed stat layout, wrapping type chips
- **Accessible interactions** — keyboard navigation, ARIA roles, focus rings on tab-only

---

## Tech stack

- **Vite 6** + **React 18** + **TypeScript** (strict)
- **Plain CSS** — no Tailwind, no styled-components; one `crt.css` file with CSS variables and media queries
- **Native `fetch`** — no Axios or similar
- **Vitest** + **@testing-library/react** + **jsdom** for tests
- **VT323** Google Font for the bitmap-style typography
- **Data sources:**
  - [PokeAPI](https://pokeapi.co) — species, stats, abilities, evolutions, moves, sprites
  - [Smogon Gen 8 sets](https://pkmn.github.io/smogon/data/sets/gen8.json) — competitive builds
  - [PokeAPI sprites repo](https://github.com/PokeAPI/sprites) — pixel + animated showdown GIFs

---

## Run it

```bash
npm install
npm run dev      # vite dev server
```

Pass `--host` to expose on your LAN (great for testing on a phone):

```bash
npm run dev -- --host
```

## Test

```bash
npm test         # vitest run
```

23 tests across 6 files cover the API client, move grouping, search bar, evolution chain (linear + branching), shiny toggle, and the composed Pokémon card.

## Build

```bash
npm run build    # production bundle to dist/
```

---

## Project layout

```
src/
├── App.tsx                   # top-level orchestration
├── api.ts                    # PokeAPI fetch helpers
├── competitive.ts            # Smogon set fetcher + tier-priority pick
├── moves.ts                  # group & sort moves by learn method (Sword/Shield)
├── typeChart.ts              # static 18-type effectiveness matrix
├── types.ts                  # API response types
├── hooks/
│   ├── useGen8List.ts        # 96-species cache (single fetch)
│   ├── usePokemon.ts         # parallel pokemon + species + chain fetch
│   ├── useCompetitiveSet.ts  # Smogon set lookup
│   └── useApiDetail.ts       # generic /endpoint/{name} cache for click-to-detail
├── components/
│   ├── PokemonGrid.tsx       # browseable grid with hover-swap animated sprites
│   ├── SearchBar.tsx         # controlled input, Enter/Escape handlers
│   ├── PokemonCard.tsx       # composes all sections
│   ├── StatBar.tsx           # one stat row with bar graph
│   ├── AbilityList.tsx       # abilities with hidden marker
│   ├── EvolutionChain.tsx    # recursive renderer, branches, click-to-jump
│   ├── MoveList.tsx          # collapsible groups (level-up / TM / egg / tutor)
│   ├── ShinyToggle.tsx
│   ├── SpriteToggle.tsx      # 2D ⇄ 3D
│   ├── StatusLine.tsx        # [READY] / [SCANNING…] / [ERR …]
│   ├── Section.tsx           # collapsible <details>-based section wrapper
│   ├── CompetitiveBuild.tsx  # Smogon set renderer
│   ├── Detail.tsx            # generic click-for-detail expander (move/ability/item/nature/type)
│   └── TypeMatchup.tsx       # combined-types defensive matchup grouping
├── styles/crt.css            # the entire retro theme
└── __tests__/                # Vitest tests
docs/
├── screenshots/              # screenshots for this README
├── superpowers/specs/        # design spec
└── superpowers/plans/        # implementation plan
scripts/
└── screenshot.mjs            # Playwright script that produced the screenshots above
```

## Re-generating the screenshots

```bash
npm run dev &                                    # in one shell
npx playwright install chromium                  # one-time
node scripts/screenshot.mjs                      # writes to docs/screenshots/
```

---

## Credits

- **PokeAPI** for the entire data backend
- **Smogon University** + **pkmn.cc** for Gen 8 competitive analyses
- **Pokémon HOME** team for the 3D renders
- **Pokémon Showdown** for animated pixel sprites
- **VT323** font by Peter Hull
