# Routing with Wouter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy `?p=<name>` deeplink with real path-based routing. Add top-level routes for `/pokedex`, `/trainers`, and `/teams`; add a sub-route `/pokedex/:name` for the Pokémon detail page; layer query params `dimension`, `variant`, and `form` onto the Pokémon detail route.

**Architecture:** Wouter as the router. Wrap `<App />` with `<Router base={import.meta.env.BASE_URL}>` so dev (`/`) and GH-Pages (`/pokemax/`) base paths Just Work. `appMode` and `selected` state in `App.tsx` get removed in favor of route-derived values via `useLocation` / `useRoute`. Per-pokemon prefs (`shiny`, `view`, `activeVariety`) read from `?dimension`, `?variant`, `?form` and write back via `navigate(..., { replace: true })`. GH-Pages SPA fallback via `public/404.html` + a decoder in `index.html` so deep links survive a hard refresh. Legacy `?p=foo` URLs are redirected to `/pokedex/foo` on first load for back-compat.

**Tech Stack:** React 19 + TypeScript + Vite + Wouter

## URL ↔ State Mapping (locked contract)

| Route                            | Component                            | Notes                                                                                            |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `/`                              | redirect → `/pokedex` (replace)      |                                                                                                  |
| `/pokedex`                       | App in `pokedex` mode, no card open  | Grid view                                                                                        |
| `/pokedex/:name`                 | App in `pokedex` mode, `selected=name` | `:name` is any PokeAPI Pokémon slug (`pikachu`, `charizard-mega-x`, etc.)                       |
| `/trainers`                      | App in `trainers` mode               | Trainer grid + inline selected trainer (state, not URL)                                          |
| `/teams`                         | App in `teams` mode                  | Curated teams browser                                                                            |
| `?dimension=2d` / `?dimension=3d` | `PokemonCard.view` sprite dim       | URL param overrides default `2d`. Toggle calls `navigate({ replace: true })`.                    |
| `?variant=normal` / `?variant=shiny` | `App.shiny` boolean              | Default `normal`. `shiny` → `variant=shiny`; normal → param omitted.                             |
| `?form=base` / `?form=<suffix>`  | `PokemonCard.activeVariety`          | `form=base` (or omitted) → default variety. `form=mega-x` → variety slug `<name>-mega-x`.        |

**Defaults are omitted from URL** — `/pokedex/charizard` is equivalent to `/pokedex/charizard?dimension=2d&variant=normal&form=base`. Toggle handlers write a param only when non-default.

**Form ambiguity rule:** if `:name` is already an alt-form slug (`charizard-mega-x`) AND `?form=<suffix>` is set, the path wins (form is ignored). This avoids `/pokedex/pikachu-belle?form=rock-star` confusion.

---

## File Structure

**Create:**
- `src/routes.ts` — route path constants, `pokedexPath(name?, query?)`, `trainersPath()`, `teamsPath()`, `parsePokedexSearch(search)`, `buildPokedexSearch(state)`
- `src/__tests__/routes.test.ts` — vitest covering path builders + search parser
- `public/404.html` — GH-Pages SPA fallback (rafgraph pattern)

**Modify:**
- `package.json` — add `wouter` dep
- `src/main.tsx` — wrap `<App />` in `<Router base={…}>`
- `src/App.tsx` — replace `appMode`/`selected` state with route-derived values; replace `?p=` URL-sync effect with route navigation; legacy `?p=foo` redirect on mount; thread URL-driven `shiny` and `dimension` down to `PokemonCard`
- `src/components/PokemonCard.tsx` — accept `view` + `setView` as props (lift to App); read `activeVariety` initial value from URL `form` param; on variety change, push `?form=...`
- `src/components/ShareButton.tsx` — share `window.location.href` directly (path already canonical)
- `index.html` — add rafgraph SPA-redirect decoder script in `<head>`

**Untouched (intentionally):**
- `src/components/TrainerCard.tsx`, `TrainerGrid.tsx`, `TeamsBrowser.tsx` — no URL state added; selected-trainer remains inline state
- Filter UI state (gens, types, form categories, `pageSize`, theme) — stays in React state / `localStorage` exactly as today

---

## Task 1: Install `wouter` and wrap with `<Router>`

**Files:**
- Modify: `package.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install wouter**

```bash
npm install wouter
```

Expected: `wouter` added to `dependencies` in `package.json`. No peer-dep warnings.

- [ ] **Step 2: Wrap `<App />` in `<Router base=…>`**

Edit `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from 'wouter';
import App from '@/App';
import './styles/crt.css';

// Strip the trailing slash so wouter's pattern matching works on `/pokedex`.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router base={BASE}>
      <App />
    </Router>
  </StrictMode>,
);
```

- [ ] **Step 3: Verify the app still loads with no router-aware code yet**

Run: `npm run dev`
Open `http://localhost:5173/`
Expected: app renders normally, no console errors. `useLocation()` would return `/` if you called it (but we haven't yet).

- [ ] **Step 4: Run the verify pipeline**

Run: `npm run format:check && npm run lint && npm test && npx tsc -b --pretty false`
Expected: all green. Tests: same count as before (40 passing).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/main.tsx
git commit -m "$(cat <<'EOF'
Wrap `App` with wouter `Router` using Vite `BASE_URL`

- add `wouter` runtime dep
- wrap render tree with `<Router base="…">` derived from
  `import.meta.env.BASE_URL` so dev (`/`) and GH-Pages
  (`/pokemax/`) base paths both work
- no behavior change yet — `useLocation` not consumed
EOF
)"
```

---

## Task 2: `routes.ts` — path builders and query parser (TDD)

**Files:**
- Create: `src/routes.ts`
- Create: `src/__tests__/routes.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/routes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  pokedexPath,
  trainersPath,
  teamsPath,
  parsePokedexSearch,
  buildPokedexSearch,
  varietyFromForm,
  formFromVariety,
} from '@/routes';

describe('routes', () => {
  describe('pokedexPath', () => {
    it('returns /pokedex with no args', () => {
      expect(pokedexPath()).toBe('/pokedex');
    });
    it('appends the pokemon slug', () => {
      expect(pokedexPath('charizard')).toBe('/pokedex/charizard');
    });
    it('omits empty query', () => {
      expect(pokedexPath('charizard', {})).toBe('/pokedex/charizard');
    });
    it('builds query for non-default params', () => {
      expect(
        pokedexPath('charizard', { dimension: '3d', variant: 'shiny', form: 'gmax' }),
      ).toBe('/pokedex/charizard?dimension=3d&variant=shiny&form=gmax');
    });
    it('omits default-valued params', () => {
      expect(
        pokedexPath('charizard', { dimension: '2d', variant: 'normal', form: 'base' }),
      ).toBe('/pokedex/charizard');
    });
  });

  describe('trainersPath / teamsPath', () => {
    it('returns the literals', () => {
      expect(trainersPath()).toBe('/trainers');
      expect(teamsPath()).toBe('/teams');
    });
  });

  describe('parsePokedexSearch', () => {
    it('returns defaults for empty search', () => {
      expect(parsePokedexSearch('')).toEqual({
        dimension: '2d',
        variant: 'normal',
        form: 'base',
      });
    });
    it('reads non-default values', () => {
      expect(parsePokedexSearch('dimension=3d&variant=shiny&form=mega-x')).toEqual({
        dimension: '3d',
        variant: 'shiny',
        form: 'mega-x',
      });
    });
    it('ignores garbage values and falls back to defaults', () => {
      expect(parsePokedexSearch('dimension=cube&variant=ultra&form=')).toEqual({
        dimension: '2d',
        variant: 'normal',
        form: 'base',
      });
    });
    it('tolerates a leading ?', () => {
      expect(parsePokedexSearch('?dimension=3d')).toEqual({
        dimension: '3d',
        variant: 'normal',
        form: 'base',
      });
    });
  });

  describe('buildPokedexSearch', () => {
    it('returns empty string when all defaults', () => {
      expect(buildPokedexSearch({ dimension: '2d', variant: 'normal', form: 'base' })).toBe('');
    });
    it('serializes non-defaults', () => {
      expect(buildPokedexSearch({ dimension: '3d', variant: 'shiny', form: 'gmax' })).toBe(
        'dimension=3d&variant=shiny&form=gmax',
      );
    });
  });

  describe('variety mapping', () => {
    it('varietyFromForm: base returns the species name', () => {
      expect(varietyFromForm('pikachu', 'base')).toBe('pikachu');
    });
    it('varietyFromForm: non-base joins with a hyphen', () => {
      expect(varietyFromForm('charizard', 'mega-x')).toBe('charizard-mega-x');
    });
    it('formFromVariety: matching species returns base', () => {
      expect(formFromVariety('pikachu', 'pikachu')).toBe('base');
    });
    it('formFromVariety: alt variety strips the species prefix', () => {
      expect(formFromVariety('charizard', 'charizard-mega-x')).toBe('mega-x');
    });
    it('formFromVariety: unrelated slug returns base (defensive)', () => {
      expect(formFromVariety('charizard', 'pikachu')).toBe('base');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/__tests__/routes.test.ts`
Expected: all tests fail with `Cannot find module '@/routes'`.

- [ ] **Step 3: Implement `src/routes.ts`**

```ts
export type Dimension = '2d' | '3d';
export type Variant = 'normal' | 'shiny';
/** Form key — `base` means the default variety; anything else is the variety-slug suffix. */
export type Form = string;

export interface PokedexSearch {
  dimension: Dimension;
  variant: Variant;
  form: Form;
}

const DEFAULTS: PokedexSearch = {
  dimension: '2d',
  variant: 'normal',
  form: 'base',
};

export function pokedexPath(name?: string, query?: Partial<PokedexSearch>): string {
  const base = name ? `/pokedex/${name}` : '/pokedex';
  if (!query) return base;
  const search = buildPokedexSearch({ ...DEFAULTS, ...query });
  return search ? `${base}?${search}` : base;
}

export function trainersPath(): string {
  return '/trainers';
}

export function teamsPath(): string {
  return '/teams';
}

export function parsePokedexSearch(search: string): PokedexSearch {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const rawDim = params.get('dimension');
  const dimension: Dimension = rawDim === '3d' ? '3d' : '2d';

  const rawVar = params.get('variant');
  const variant: Variant = rawVar === 'shiny' ? 'shiny' : 'normal';

  const rawForm = params.get('form');
  const form: Form = rawForm && rawForm.trim() ? rawForm : 'base';

  return { dimension, variant, form };
}

export function buildPokedexSearch(state: PokedexSearch): string {
  const params = new URLSearchParams();
  if (state.dimension !== DEFAULTS.dimension) params.set('dimension', state.dimension);
  if (state.variant !== DEFAULTS.variant) params.set('variant', state.variant);
  if (state.form !== DEFAULTS.form) params.set('form', state.form);
  return params.toString();
}

/** `(species='charizard', form='mega-x')` → `'charizard-mega-x'`; `form='base'` → `'charizard'`. */
export function varietyFromForm(species: string, form: Form): string {
  if (form === 'base' || form === '') return species;
  return `${species}-${form}`;
}

/** Inverse: `(species='charizard', variety='charizard-mega-x')` → `'mega-x'`. */
export function formFromVariety(species: string, variety: string): Form {
  if (variety === species) return 'base';
  const prefix = `${species}-`;
  if (variety.startsWith(prefix)) return variety.slice(prefix.length);
  return 'base';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/routes.test.ts`
Expected: all 14 tests pass.

- [ ] **Step 5: Run full verify**

Run: `npm run format:check && npm run lint && npm test && npx tsc -b --pretty false`
Expected: all green, total test count up by 14.

- [ ] **Step 6: Commit**

```bash
git add src/routes.ts src/__tests__/routes.test.ts
git commit -m "$(cat <<'EOF'
Add `routes.ts` path builders + `?dimension`/`?variant`/`?form` parser

- `pokedexPath`, `trainersPath`, `teamsPath` build canonical URLs
- `parsePokedexSearch` / `buildPokedexSearch` round-trip the
  per-pokemon query state with defaults omitted from the URL
- `varietyFromForm` / `formFromVariety` map between PokeAPI
  variety slugs and the short `form=` query value
- vitest covers builders, parser, and round-trip
EOF
)"
```

---

## Task 3: Migrate top-level mode + selected pokemon to routes

**Files:**
- Modify: `src/App.tsx` (broad changes — see below)

The current code:

- `App.tsx:42` — `const [appMode, setAppMode] = useState<'pokedex' | 'trainers' | 'teams'>('pokedex');`
- `App.tsx:46` — `const initialSelected = …` reads `?p=` once
- `App.tsx:46` — `const [selected, setSelected] = useState<string | null>(initialSelected);`
- `App.tsx:114-133` — useEffect that writes `?p=` to URL on selection change
- `App.tsx:217-232` — mode-toggle buttons calling `setAppMode(...)`
- `App.tsx:135` — `handleSelect(name)` calls `setSelected(name)`
- `App.tsx:158` — `goHome()` calls `setSelected(null)`

All of these get replaced with route-derived values + `navigate(...)` calls.

- [ ] **Step 1: Add wouter imports and route-derived state**

In `src/App.tsx`, near the top of the file (alongside the existing React imports):

```ts
import { useLocation, useRoute, useSearch } from 'wouter';
import {
  pokedexPath,
  trainersPath,
  teamsPath,
  parsePokedexSearch,
  formFromVariety,
} from '@/routes';
```

Inside the `App` component, **delete** these lines:

```ts
const [appMode, setAppMode] = useState<'pokedex' | 'trainers' | 'teams'>('pokedex');
…
// Deeplink: read ?p=name on first mount so URLs like /pokemax/?p=charizard work
const initialSelected = (() => {
  if (typeof window === 'undefined') return null;
  const params = new globalThis.URLSearchParams(window.location.search);
  const p = params.get('p');
  return p && p.trim() ? p.trim().toLowerCase() : null;
})();
const [selected, setSelected] = useState<string | null>(initialSelected);
```

**Add** in their place:

```ts
const [, navigate] = useLocation();
const search = useSearch(); // reactive — re-renders when ?query changes
const pokedexSearch = useMemo(() => parsePokedexSearch(search), [search]);

const [matchPokemonDetail, pokemonDetailParams] = useRoute('/pokedex/:name');
const [matchPokedex] = useRoute('/pokedex');
const [matchTrainers] = useRoute('/trainers');
const [matchTeams] = useRoute('/teams');
const [matchRoot] = useRoute('/');

const appMode: 'pokedex' | 'trainers' | 'teams' = matchTrainers
  ? 'trainers'
  : matchTeams
    ? 'teams'
    : 'pokedex';

const selected: string | null = matchPokemonDetail
  ? (pokemonDetailParams.name?.toLowerCase() ?? null)
  : null;
```

(`useMemo` requires adding it to the existing `react` import line.)

- [ ] **Step 2: Replace the `?p=` URL-sync effect with route-aware title sync**

Find `App.tsx:114-133` (the useEffect that syncs the URL `?p=` and the document title). Replace with:

```ts
// Keep document.title in sync with the selected Pokemon. URL is owned by the router.
useEffect(() => {
  const base = 'Pokemax';
  if (result.data) {
    const raw = result.data.pokemon.name;
    const pretty = raw
      .split('-')
      .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
      .join(' ');
    document.title = `${base} | ${pretty}`;
  } else {
    document.title = base;
  }
}, [result.data]);
```

- [ ] **Step 3: Add legacy `?p=` redirect AND alt-form path canonicalization**

Just after the route-derived state declarations, add a one-shot redirect for the legacy deeplink:

```ts
// Legacy back-compat: ?p=charizard → /pokedex/charizard (one-shot on mount)
useEffect(() => {
  if (typeof window === 'undefined') return;
  const params = new globalThis.URLSearchParams(window.location.search);
  const legacy = params.get('p');
  if (legacy && legacy.trim() && !matchPokemonDetail) {
    navigate(pokedexPath(legacy.trim().toLowerCase()), { replace: true });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Add the `/` → `/pokedex` redirect:

```ts
useEffect(() => {
  if (matchRoot) navigate(pokedexPath(), { replace: true });
}, [matchRoot, navigate]);
```

Add the canonicalization effect AFTER `result` is computed (so it sees `result.data.species.name`). This handles direct visits to alt-form paths like `/pokedex/charizard-mega-x`:

```ts
// Canonicalize alt-form path slugs to base-species + ?form=<suffix>.
// `/pokedex/charizard-mega-x` → `/pokedex/charizard?form=mega-x`
useEffect(() => {
  if (!result.data || !selected) return;
  const baseName = result.data.species.name;
  if (selected !== baseName) {
    const suffix = formFromVariety(baseName, selected);
    if (suffix !== 'base') {
      navigate(
        pokedexPath(baseName, { ...pokedexSearch, form: suffix }),
        { replace: true },
      );
    }
  }
}, [result.data, selected, pokedexSearch, navigate]);
```

- [ ] **Step 4: Rewire mode-toggle buttons**

Find the `<div className="crt-mode-toggle">` block (around `App.tsx:211`). Replace each `onClick={() => setAppMode('…')}` with a `navigate` call:

```tsx
<button
  type="button"
  role="tab"
  aria-selected={appMode === 'pokedex'}
  className={'crt-mode-tab' + (appMode === 'pokedex' ? ' active' : '')}
  onClick={() => navigate(pokedexPath())}
>
  POKÉDEX
</button>
<button
  type="button"
  role="tab"
  aria-selected={appMode === 'trainers'}
  className={'crt-mode-tab' + (appMode === 'trainers' ? ' active' : '')}
  onClick={() => {
    setSelectedTrainer(null);
    navigate(trainersPath());
  }}
>
  TRAINERS
</button>
<button
  type="button"
  role="tab"
  aria-selected={appMode === 'teams'}
  className={'crt-mode-tab' + (appMode === 'teams' ? ' active' : '')}
  onClick={() => navigate(teamsPath())}
>
  TEAMS
</button>
```

- [ ] **Step 5: Rewire `handleSelect` and `goHome`**

`handleSelect(name)` is called from grid clicks, search submissions, and evolution links. Replace `setSelected(name)` with `navigate(pokedexPath(name))`. Drop the `setShiny(false)` line — variant defaults to `normal` since the URL won't carry `?variant=shiny` after a navigation.

```ts
const handleSelect = (name: string) => {
  setAttempt((n) => n + 1);
  setQuery('');

  // Pre-warm cry…  (keep existing cry preload block unchanged)
  const sp = fullSpeciesIndex.find((s) => s.name === name);
  if (sp) {
    const cryId =
      sp.id >= 10000 && sp.speciesName
        ? (list.species.find((b) => b.name === sp.speciesName)?.id ?? sp.id)
        : sp.id;
    const url = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${cryId}.ogg`;
    if (cryAudioRef.current) {
      cryAudioRef.current.pause();
      cryAudioRef.current.src = '';
    }
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
    audio.volume = cryVolume * CRY_VOLUME_SCALE;
    cryAudioRef.current = audio;
  }

  navigate(pokedexPath(name));
};
```

`goHome` (the header POKEMAX button): replace `setSelected(null)` with `navigate(pokedexPath())`.

```ts
const goHome = () => {
  navigate(pokedexPath());
};
```

- [ ] **Step 6: Lift `shiny` from `?variant=` query param**

Replace `const [shiny, setShiny] = useState(false);` with:

```ts
const shiny = pokedexSearch.variant === 'shiny';
const setShiny = (v: boolean) => {
  if (!result.data) return;
  const baseName = result.data.species.name;
  navigate(
    pokedexPath(baseName, {
      ...pokedexSearch,
      variant: v ? 'shiny' : 'normal',
    }),
    { replace: true },
  );
};
```

(`pokedexSearch` is the memoized parser output from Step 1. Using `result.data.species.name` instead of `selected` makes the URL canonical — if the user is on `/pokedex/charizard-mega-x` momentarily before canonicalization fires, the shiny toggle still pushes the canonical `/pokedex/charizard` path.)

> **NOTE for next task:** `dimension` and `form` are NOT plumbed yet — that's Task 4. For this task, just verify mode + selected + shiny work.

- [ ] **Step 7: Run the verify pipeline**

Run: `npm run format:check && npm run lint && npm test && npx tsc -b --pretty false`
Expected: all green. No new test failures.

- [ ] **Step 8: Smoke test in the browser**

Run: `npm run dev`
Manually verify:
1. `http://localhost:5173/` → redirects to `/pokedex`
2. Click `TRAINERS` → URL becomes `/trainers`, trainer grid renders
3. Click `TEAMS` → URL becomes `/teams`
4. Click `POKÉDEX` → URL becomes `/pokedex`
5. Click a Pokémon → URL becomes `/pokedex/<name>`
6. Refresh on `/pokedex/charizard` → still loads Charizard's card
7. Toggle shiny on Charizard → URL becomes `/pokedex/charizard?variant=shiny`
8. Browser back button → returns to grid
9. Open `http://localhost:5173/?p=pikachu` → redirects to `/pokedex/pikachu`

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
Drive top-level mode + selected Pokémon from wouter routes

- `appMode` + `selected` derived from `useRoute` instead of state
- mode-toggle buttons and `handleSelect` call `navigate(...)`
- legacy `?p=foo` URLs auto-redirect to `/pokedex/foo` on mount
- `/` redirects to `/pokedex`
- `shiny` now reads from `?variant=shiny`; toggle uses
  `navigate(..., { replace: true })` so back button skips toggles
- `document.title` sync split out of the old `?p=` writer effect
EOF
)"
```

---

## Task 4: Plumb `?dimension` and `?form` into `PokemonCard`

**Files:**
- Modify: `src/App.tsx` — pass `dimension` + `form` down
- Modify: `src/components/PokemonCard.tsx` — accept them as controlled props; navigate on toggle

`PokemonCard` currently owns two pieces of state we need to lift:

- `view: SpriteView` (line ~292) — sprite dimension
- `activeVariety: string` (line ~298) — current form/variety

- [ ] **Step 1: Compute `dimension` and `form` in `App.tsx`**

Just after the `shiny` computation from Task 3, add:

```ts
const dimension = pokedexSearch.dimension;
const formKey = pokedexSearch.form;

const setDimension = (next: '2d' | '3d') => {
  if (!result.data) return;
  const baseName = result.data.species.name;
  navigate(
    pokedexPath(baseName, { ...pokedexSearch, dimension: next }),
    { replace: true },
  );
};

const setFormKey = (next: string) => {
  if (!result.data) return;
  const baseName = result.data.species.name;
  navigate(
    pokedexPath(baseName, { ...pokedexSearch, form: next }),
    { replace: true },
  );
};
```

(Both use `result.data.species.name` for the same canonicalization reason as `setShiny` in Task 3.)

- [ ] **Step 2: Thread the props into `<PokemonCard>`**

Find the `<PokemonCard …/>` instantiation in `App.tsx` (around line 297). Add four props:

```tsx
<PokemonCard
  pokemon={result.data.pokemon}
  species={result.data.species}
  chain={result.data.chain}
  shiny={shiny}
  onShinyChange={setShiny}
  view={dimension}
  onViewChange={setDimension}
  form={formKey}
  onFormChange={setFormKey}
  onSelectEvolution={handleSelect}
  gen={selectedGen}
  cryAudioRef={cryAudioRef}
  cryVolume={cryVolume}
  onCryVolumeChange={setCryVolume}
  speciesPool={fullSpeciesIndex}
/>
```

- [ ] **Step 3: Make `PokemonCard` controlled for `view` and `activeVariety`**

In `src/components/PokemonCard.tsx`:

Update the `Props` interface (around line 30):

```ts
interface Props {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
  shiny: boolean;
  onShinyChange: (shiny: boolean) => void;
  view: SpriteView;
  onViewChange: (view: SpriteView) => void;
  /** `base` or a variety-slug suffix (`mega-x`, `gmax`, `alola`, etc.). */
  form: string;
  onFormChange: (form: string) => void;
  onSelectEvolution: (name: string) => void;
  gen: number;
  cryAudioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  cryVolume?: number;
  onCryVolumeChange?: (v: number) => void;
  speciesPool?: Gen8Species[];
}
```

Add the import for `varietyFromForm`/`formFromVariety` at the top of the file:

```ts
import { varietyFromForm, formFromVariety } from '@/routes';
```

Delete the local `view` state (line ~292):

```ts
// DELETE THIS:
const [view, setView] = useState<SpriteView>('2d');
```

Destructure the new props in the function signature:

```tsx
export default function PokemonCard({
  pokemon: defaultPokemon,
  species,
  chain,
  shiny,
  onShinyChange,
  view,
  onViewChange,
  form,
  onFormChange,
  onSelectEvolution,
  gen,
  cryAudioRef,
  cryVolume = 0.25,
  onCryVolumeChange,
  speciesPool,
}: Props) {
  // …
}
```

- [ ] **Step 4: Wire `form` ↔ `activeVariety`**

Find `const [activeVariety, setActiveVariety] = useState<string>(defaultPokemon.name);` (around line ~298).

Replace with:

```ts
const [activeVariety, setActiveVariety] = useState<string>(() =>
  varietyFromForm(species.name, form),
);
```

Find the `useEffect` that resets variety on species change (around line ~304):

```ts
useEffect(() => {
  setActiveVariety(defaultPokemon.name);
  setVarietyData(null);
  setView('2d');
}, [defaultPokemon.name]);
```

Replace with:

```ts
// On species (route) change, snap the active variety to whatever the URL says.
useEffect(() => {
  setActiveVariety(varietyFromForm(species.name, form));
  setVarietyData(null);
}, [species.name, form]);
```

Note: the `setView('2d')` reset is dropped because `view` is now controlled by App and reflects the URL. The default-`2d` behavior is preserved because the URL omits the param on first navigation and `parsePokedexSearch` defaults to `2d`.

- [ ] **Step 5: Mirror `activeVariety` writes back into the URL**

Find every callsite that calls `setActiveVariety(name)` (search the file). They look like:

```tsx
<FormSwitcher
  varieties={species.varieties}
  speciesName={species.name}
  active={activeVariety}
  onChange={setActiveVariety}
/>
```

Replace `onChange={setActiveVariety}` with:

```tsx
<FormSwitcher
  varieties={species.varieties}
  speciesName={species.name}
  active={activeVariety}
  onChange={(varietyName) => {
    setActiveVariety(varietyName);
    onFormChange(formFromVariety(species.name, varietyName));
  }}
/>
```

- [ ] **Step 6: Replace `SpriteToggle` handler**

Find `<SpriteToggle value={view} onChange={setView} />` (around line ~382). Replace with:

```tsx
<SpriteToggle value={view} onChange={onViewChange} />
```

- [ ] **Step 7: Run the verify pipeline**

Run: `npm run format:check && npm run lint && npm test && npx tsc -b --pretty false`
Expected: all green.

- [ ] **Step 8: Smoke test in the browser**

Run: `npm run dev`
Manually verify:
1. `/pokedex/charizard` — Charizard loads, no query params in URL
2. Click 3D toggle → URL becomes `?dimension=3d`
3. Reload → still 3D
4. Click Mega Charizard X in `FormSwitcher` → URL becomes `?dimension=3d&form=mega-x` (and sprite changes)
5. Click 2D toggle → URL becomes `?form=mega-x` (dimension dropped, since it's default)
6. Visit `/pokedex/pikachu?form=original-cap` directly → loads the OG cap variety
7. Visit `/pokedex/charizard?dimension=3d&variant=shiny&form=gmax` → 3D shiny Gigantamax Charizard

- [ ] **Step 9: Commit**

```bash
git add src/App.tsx src/components/PokemonCard.tsx
git commit -m "$(cat <<'EOF'
Drive `dimension` + `form` from URL on Pokémon detail pages

- `PokemonCard` becomes controlled for `view` and `activeVariety`
- `App.tsx` reads `?dimension` and `?form` from `URLSearchParams`
  via `parsePokedexSearch` and pushes new values via
  `navigate(..., { replace: true })`
- `FormSwitcher.onChange` mirrors variety changes back into
  `?form=<suffix>` using `formFromVariety`
- variety reset on species change snaps to the URL's `form`
  param instead of always reverting to the default variety
EOF
)"
```

---

## Task 5: Refresh `ShareButton` to share the current canonical URL

**Files:**
- Modify: `src/components/ShareButton.tsx`

The current `ShareButton` builds the share URL by writing `?p=selected` into `window.location.href`. Since the URL is now path-based and already canonical, simplify.

- [ ] **Step 1: Replace `ShareButton.handle`'s URL-building**

Edit `src/components/ShareButton.tsx`. Replace the entire `handle` function with:

```ts
const handle = async () => {
  const text = window.location.href;

  const nav = navigator as Navigator & {
    share?: (data: { title?: string; url?: string }) => Promise<void>;
  };
  if (nav.share) {
    try {
      await nav.share({
        title: selected ? `Pokemax | ${selected}` : 'Pokemax',
        url: text,
      });
      return;
    } catch {
      /* user dismissed — fall through to clipboard */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  } catch {
    window.prompt('Copy this link:', text);
  }
};
```

The `Props.selected` prop is now only used for the share title — no URL construction needed.

- [ ] **Step 2: Run the verify pipeline**

Run: `npm run format:check && npm run lint && npm test && npx tsc -b --pretty false`
Expected: all green.

- [ ] **Step 3: Smoke test**

Run `npm run dev`, navigate to `/pokedex/charizard?dimension=3d&variant=shiny`, click SHARE. Verify the copied link is exactly that URL (including query params).

- [ ] **Step 4: Commit**

```bash
git add src/components/ShareButton.tsx
git commit -m "$(cat <<'EOF'
Share the current canonical URL directly from `ShareButton`

- drop `?p=` injection — URL is now path-based and already canonical
- `window.location.href` carries `/pokedex/<name>?…` plus current
  `dimension`, `variant`, `form` params
EOF
)"
```

---

## Task 6: GH Pages SPA fallback

GitHub Pages serves `404.html` for any path that isn't a real file. Without a fallback, `/pokemax/pokedex/charizard` would 404 on hard refresh. The rafgraph spa-github-pages pattern routes the path through `404.html` → `index.html` while preserving the original URL.

**Files:**
- Create: `public/404.html`
- Modify: `index.html`

- [ ] **Step 1: Create `public/404.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pokemax</title>
    <script type="text/javascript">
      // rafgraph/spa-github-pages — single Page Apps for GitHub Pages
      // MIT License — https://github.com/rafgraph/spa-github-pages
      //
      // 1 path segment is the project name (`pokemax`) — keep it as-is so
      // the redirect lands at `https://codebend3r.github.io/pokemax/` and
      // index.html can decode the rest of the path.
      var segmentCount = 1;
      var l = window.location;
      l.replace(
        l.protocol +
          '//' +
          l.hostname +
          (l.port ? ':' + l.port : '') +
          l.pathname
            .split('/')
            .slice(0, 1 + segmentCount)
            .join('/') +
          '/?/' +
          l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
          l.hash,
      );
    </script>
  </head>
  <body></body>
</html>
```

- [ ] **Step 2: Add the decoder snippet to `index.html`**

In `index.html`, add a `<script>` block at the very top of `<head>`, BEFORE the meta tags:

```html
<script type="text/javascript">
  // rafgraph/spa-github-pages — decoder
  // If the URL contains `/?/foo/bar`, rewrite it to `/foo/bar` so the SPA
  // router sees the real path.
  (function (l) {
    if (l.search[1] === '/') {
      var decoded = l.search
        .slice(1)
        .split('&')
        .map(function (s) {
          return s.replace(/~and~/g, '&');
        })
        .join('?');
      window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash);
    }
  })(window.location);
</script>
```

- [ ] **Step 3: Verify dev build is unaffected**

Run: `npm run dev`
Expected: `localhost:5173/pokedex/charizard` still loads (Vite dev server already does SPA fallback). The 404.html script doesn't run in dev because Vite serves index.html for any unmatched path.

- [ ] **Step 4: Verify production build includes 404.html**

Run: `npm run build`
Expected: `dist/404.html` exists (Vite copies everything in `public/` into `dist/`).
Run: `ls dist/404.html && ls dist/index.html`
Expected: both files exist.

- [ ] **Step 5: Smoke test the build with `npm run preview`**

Run: `npm run preview`
Open `http://localhost:4173/pokemax/pokedex/charizard`
Expected: Charizard loads. (Note: `preview` already handles the base path correctly so this is mostly verifying the build succeeded.)

- [ ] **Step 6: Commit**

```bash
git add public/404.html index.html
git commit -m "$(cat <<'EOF'
Add SPA fallback for GH Pages deep links

- `public/404.html` (rafgraph pattern) redirects unknown paths
  through `index.html` with the original path encoded in `?/...`
- `index.html` decoder restores the real path before React mounts
- `segmentCount = 1` accounts for the `/pokemax/` base path
- dev (`vite dev`) is unaffected — Vite already SPA-falls-back
EOF
)"
```

---

## Task 7: Final cleanup + manual smoke pass

**Files:**
- Modify: any leftover callsites that still reference removed exports (if any)

- [ ] **Step 1: Grep for dead references**

```bash
grep -rn "setAppMode\|setSelected\b\|initialSelected\|searchParams.set('p'" src/
```
Expected: zero matches. (`selectedTrainer`/`setSelectedTrainer` are different identifiers and stay.)

- [ ] **Step 2: Grep for orphan `setShiny` from outside `App.tsx`**

```bash
grep -rn "setShiny" src/
```
Expected: matches are local to `PokemonCard.tsx` or removed. The prop name `onShinyChange` is the public API.

- [ ] **Step 3: Final verify pass**

Run: `npm run format:check && npm run lint && npm test && npx tsc -b --pretty false`
Expected: all green. Total tests = previous count + 14 (new `routes.test.ts`).

- [ ] **Step 4: Manual smoke checklist**

Run `npm run dev`. Verify each:

- [ ] `/` → redirects to `/pokedex`
- [ ] `/pokedex` → grid renders, no card visible
- [ ] `/pokedex/charizard` → card renders, URL stays exact
- [ ] `/pokedex/charizard?dimension=3d` → 3D sprite shown
- [ ] `/pokedex/charizard?variant=shiny` → shiny sprite, ShinyToggle shows ON
- [ ] `/pokedex/charizard?form=mega-x` → Mega X variety loaded
- [ ] `/pokedex/charizard?dimension=3d&variant=shiny&form=gmax` → 3D shiny Gigantamax
- [ ] Toggle dimension → URL updates without adding history entries (back button skips it)
- [ ] Click a roster Pokémon from `/trainers` → navigates to `/pokedex/<that-name>`
- [ ] Browser back from `/pokedex/charizard` → returns to `/pokedex` (or wherever you came from)
- [ ] `/trainers` → trainer grid
- [ ] `/teams` → teams browser
- [ ] `/?p=pikachu` → redirects to `/pokedex/pikachu`

- [ ] **Step 5: If anything failed, fix the single failure and re-run from Step 3**

- [ ] **Step 6: No commit if no changes**

If grep/smoke surfaced no fixes, no commit needed — Tasks 1–6 already produced the right state. Otherwise, commit any cleanup as `Clean up routing migration`.

---

## Acceptance Criteria

- [ ] `npm run verify` (format + lint + tests) passes cleanly
- [ ] `npx tsc -b --pretty false` produces no output
- [ ] `npm test` count = old count + 14 (new `routes.test.ts`)
- [ ] `npm run build` succeeds
- [ ] Every URL in the **Manual smoke checklist** behaves as specified
- [ ] Legacy `?p=foo` URL redirects to `/pokedex/foo`
- [ ] No reference to removed exports (`setAppMode`, `initialSelected`, `?p=` writing) remains in `src/`
- [ ] `package.json` lists `wouter` under `dependencies`
- [ ] `public/404.html` exists and is included in `dist/`

## Out of Scope (explicit)

- `/trainers/:slug` per-trainer routes — selected trainer remains inline state
- `/teams/:game` per-game routes — same reason
- Filter state (gens, types, form categories, `pageSize`) in URL — stays in React state / localStorage
- Switching `ViewMode` ('grid' / 'list') to URL — stays in localStorage
- Animation / transitions on route change
- Removing the legacy `?p=` parsing entirely (kept as a back-compat redirect indefinitely)
