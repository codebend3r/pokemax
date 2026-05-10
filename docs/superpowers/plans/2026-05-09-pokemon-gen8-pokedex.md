# Gen 8 Pokédex Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React app that searches Generation VIII Pokémon and displays full stats, abilities, evolution chains, moves, and a shiny artwork toggle, all in a CRT-terminal retro aesthetic.

**Architecture:** Vite + React 18 + TypeScript SPA. Plain CSS (`crt.css`) for the retro theme. Module-scoped cache for the Gen-8 species list. Two custom hooks: `useGen8List` (fetches once on mount) and `usePokemon` (orchestrates the per-search fetches). Pure presentational components for the card sections.

**Tech Stack:** Vite, React 18, TypeScript, native `fetch`, Vitest, @testing-library/react, jsdom, VT323 (Google Fonts), PokeAPI.

---

## File Structure

```
pokemon-gen8/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── src/
│   ├── main.tsx                  # Vite entry
│   ├── App.tsx                   # search + result orchestration
│   ├── api.ts                    # PokeAPI fetch helpers
│   ├── types.ts                  # API response types
│   ├── hooks/
│   │   ├── useGen8List.ts        # cached gen-8 name list
│   │   └── usePokemon.ts         # 3-fetch orchestration per query
│   ├── components/
│   │   ├── SearchBar.tsx         # input + autocomplete + submit
│   │   ├── StatusLine.tsx        # [READY] / [SCANNING...] / [ERR]
│   │   ├── PokemonCard.tsx       # composes all sections
│   │   ├── StatBar.tsx           # one stat row with bar graph
│   │   ├── AbilityList.tsx
│   │   ├── EvolutionChain.tsx    # recursive, handles branches
│   │   ├── MoveList.tsx          # collapsible groups by learn method
│   │   └── ShinyToggle.tsx
│   ├── styles/
│   │   └── crt.css               # entire retro theme
│   └── __tests__/
│       ├── api.test.ts
│       ├── moveGrouping.test.ts
│       ├── SearchBar.test.tsx
│       ├── PokemonCard.test.tsx
│       ├── ShinyToggle.test.tsx
│       └── EvolutionChain.test.tsx
└── docs/superpowers/
    ├── specs/2026-05-09-pokemon-gen8-pokedex-design.md
    └── plans/2026-05-09-pokemon-gen8-pokedex.md  (this file)
```

---

## Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1: Scaffold Vite project in current directory**

Run from `/Users/snowball/pokemon-gen8`:
```bash
npm create vite@latest . -- --template react-ts
```
Answer "Ignore files and continue" if it complains about non-empty directory (we have docs/ and .gitignore already).

- [ ] **Step 2: Install scaffold dependencies**

```bash
npm install
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

- [ ] **Step 4: Add test script and Vitest config**

Edit `package.json` `"scripts"` to add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
```

Create `src/__tests__/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Verify the dev server starts**

Run:
```bash
npm run dev
```
Expected: dev server prints a localhost URL and starts without errors. Stop it (Ctrl-C).

- [ ] **Step 6: Verify the test runner works**

Run:
```bash
npm test
```
Expected: vitest reports "No test files found" (we haven't written any yet) and exits 0.

- [ ] **Step 7: Replace `App.tsx` and `main.tsx` with our shells, delete unused scaffold files**

Delete: `src/App.css`, `src/index.css`, `src/assets/react.svg`, `public/vite.svg`.

Replace `src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/crt.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Replace `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="crt">
      <header className="crt-header">▶ POKéDEX // GEN VIII</header>
    </div>
  );
}
```

Create empty `src/styles/crt.css` (next task fills it).

Replace `index.html` `<title>` with `Gen 8 Pokédex` and remove the `vite.svg` favicon link.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React + TS project with Vitest"
```

---

## Task 2: CRT theme and base layout

**Files:**
- Create: `src/styles/crt.css`
- Modify: `src/App.tsx`, `index.html`

- [ ] **Step 1: Add VT323 Google Font link**

Edit `index.html` and add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Write the full CRT stylesheet**

Replace contents of `src/styles/crt.css`:
```css
:root {
  --bg: #0a0e27;
  --primary: #00ff9f;
  --accent: #ff00aa;
  --dim: rgba(0, 255, 159, 0.6);
  --border: rgba(0, 255, 159, 0.7);
  --error: #ff4444;
}

* { box-sizing: border-box; }

html, body, #root {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--primary);
  font-family: 'VT323', 'Courier New', monospace;
  font-size: 20px;
  line-height: 1.4;
  text-shadow: 0 0 4px var(--primary);
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 2px,
    rgba(0, 0, 0, 0.3) 3px
  );
  pointer-events: none;
  z-index: 9999;
}

@keyframes power-on {
  0%   { transform: scaleY(0.001); opacity: 0; }
  60%  { transform: scaleY(1); opacity: 1; }
  80%  { opacity: 0.6; }
  100% { opacity: 1; }
}

.crt {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 20px 80px;
  animation: power-on 400ms ease-out;
}

.crt-header {
  color: var(--accent);
  text-shadow: 0 0 6px var(--accent);
  font-size: 28px;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.crt-status {
  color: var(--dim);
  font-size: 16px;
  margin-bottom: 24px;
}

.crt-status.err { color: var(--error); text-shadow: 0 0 4px var(--error); }
.crt-status.scanning { color: var(--accent); text-shadow: 0 0 4px var(--accent); }

@keyframes blink { 50% { opacity: 0; } }
.crt-cursor {
  display: inline-block;
  width: 0.6em;
  background: var(--primary);
  color: var(--primary);
  animation: blink 1s steps(2, start) infinite;
}

.crt-search {
  position: relative;
  margin-bottom: 24px;
}
.crt-search-row {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  padding: 8px 12px;
  background: rgba(0, 255, 159, 0.04);
}
.crt-search-prompt { color: var(--accent); margin-right: 8px; }
.crt-search input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--primary);
  font: inherit;
  text-shadow: inherit;
  caret-color: var(--primary);
}
.crt-search ul {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  border: 1px solid var(--border);
  border-top: 0;
  background: var(--bg);
  max-height: 220px;
  overflow-y: auto;
}
.crt-search li {
  padding: 4px 12px;
  cursor: pointer;
}
.crt-search li:hover, .crt-search li[data-active="true"] {
  background: rgba(0, 255, 159, 0.15);
  color: var(--accent);
}

.crt-card {
  border: 1px solid var(--border);
  padding: 16px;
  margin-top: 16px;
}
.crt-card-top {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.crt-card-top img {
  width: 160px;
  height: 160px;
  image-rendering: pixelated;
  border: 1px solid var(--border);
  background: rgba(0, 255, 159, 0.05);
}
.crt-card-meta { flex: 1; }
.crt-card-name { color: var(--accent); text-shadow: 0 0 6px var(--accent); font-size: 28px; }
.crt-card-dex { color: var(--dim); font-size: 16px; }
.crt-types { display: flex; gap: 6px; margin-top: 6px; }
.crt-type {
  padding: 2px 10px;
  border: 1px solid var(--primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 14px;
}

.crt-section {
  border-top: 1px dashed var(--border);
  padding-top: 12px;
  margin-top: 12px;
}
.crt-section-label {
  color: var(--accent);
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.crt-stat {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 8px;
  margin: 2px 0;
}
.crt-stat-bar { font-family: inherit; letter-spacing: -1px; }
.crt-stat-value { text-align: right; }

.crt-evo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.crt-evo-node { padding: 4px 8px; border: 1px solid var(--border); }
.crt-evo-node.active { color: var(--accent); border-color: var(--accent); }
.crt-evo-arrow { color: var(--dim); }
.crt-evo-cond { color: var(--dim); font-size: 14px; }
.crt-evo-branch { display: flex; flex-direction: column; gap: 4px; }

.crt-moves details { margin-bottom: 6px; }
.crt-moves summary {
  cursor: pointer;
  color: var(--accent);
  letter-spacing: 1px;
  padding: 2px 0;
}
.crt-moves ul { list-style: none; margin: 4px 0 4px 16px; padding: 0; columns: 2; }
.crt-moves li { padding: 1px 0; font-size: 16px; break-inside: avoid; }

.crt-shiny {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}
.crt-shiny button {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--primary);
  font: inherit;
  text-shadow: inherit;
  padding: 4px 8px;
  cursor: pointer;
  letter-spacing: 1px;
}
.crt-shiny button[aria-pressed="true"] {
  border-color: var(--accent);
  color: var(--accent);
  text-shadow: 0 0 4px var(--accent);
  background: rgba(255, 0, 170, 0.08);
}

.crt-empty {
  color: var(--dim);
  border: 1px dashed var(--border);
  padding: 24px;
  text-align: center;
  margin-top: 16px;
}

.crt-error {
  color: var(--error);
  text-shadow: 0 0 4px var(--error);
  border: 1px solid var(--error);
  padding: 16px;
  margin-top: 16px;
}
.crt-error button {
  margin-left: 8px;
  background: transparent;
  border: 1px solid var(--error);
  color: var(--error);
  font: inherit;
  cursor: pointer;
  padding: 2px 8px;
}
```

- [ ] **Step 3: Update `App.tsx` to render the empty shell with status line**

Replace `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="crt">
      <header className="crt-header">▶ POKéDEX // GEN VIII</header>
      <div className="crt-status">[ READY ]</div>
      <div className="crt-empty">▶ ENTER POKéMON NAME AND PRESS RETURN</div>
    </div>
  );
}
```

- [ ] **Step 4: Visually verify in the browser**

Run:
```bash
npm run dev
```
Open the printed URL. Expected: dark navy background, magenta `▶ POKéDEX // GEN VIII` heading with glow, green `[ READY ]` line, dashed-border empty state, scanlines visible across the whole page, brief power-on flash on first load. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add CRT theme stylesheet and base shell"
```

---

## Task 3: Define API types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write `types.ts`**

Create `src/types.ts`:
```ts
export interface Gen8ListResponse {
  pokemon_species: { name: string; url: string }[];
}

export interface PokemonResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean; slot: number }[];
  moves: {
    move: { name: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
      version_group: { name: string };
    }[];
  }[];
}

export interface SpeciesResponse {
  name: string;
  evolution_chain: { url: string };
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: { name: string };
  item: { name: string } | null;
  held_item: { name: string } | null;
  known_move: { name: string } | null;
  min_happiness: number | null;
  time_of_day: string;
  location: { name: string } | null;
  needs_overworld_rain: boolean;
  gender: number | null;
}

export interface ChainLink {
  species: { name: string };
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChainResponse {
  chain: ChainLink;
}

export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor' | string;

export interface GroupedMove {
  name: string;
  level: number;
  method: LearnMethod;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "Add PokeAPI response types"
```

---

## Task 4: API module (TDD)

**Files:**
- Create: `src/api.ts`, `src/__tests__/api.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/api.test.ts`:
```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchGen8List,
  fetchPokemon,
  fetchSpecies,
  fetchEvolutionChain,
} from '../api';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(body: unknown) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) });
}
function notOk(status: number) {
  return Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
}

describe('fetchGen8List', () => {
  it('returns the species name list', async () => {
    fetchMock.mockReturnValue(
      ok({ pokemon_species: [{ name: 'grookey', url: '' }, { name: 'scorbunny', url: '' }] }),
    );
    const names = await fetchGen8List();
    expect(names).toEqual(['grookey', 'scorbunny']);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/generation/8');
  });

  it('throws on non-2xx', async () => {
    fetchMock.mockReturnValue(notOk(500));
    await expect(fetchGen8List()).rejects.toThrow();
  });
});

describe('fetchPokemon', () => {
  it('hits /pokemon/{name} and returns parsed JSON', async () => {
    const body = { id: 813, name: 'scorbunny' };
    fetchMock.mockReturnValue(ok(body));
    const result = await fetchPokemon('scorbunny');
    expect(result).toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/scorbunny');
  });
});

describe('fetchSpecies', () => {
  it('hits /pokemon-species/{name}', async () => {
    fetchMock.mockReturnValue(ok({ name: 'scorbunny', evolution_chain: { url: 'X' } }));
    const result = await fetchSpecies('scorbunny');
    expect(result.evolution_chain.url).toBe('X');
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon-species/scorbunny');
  });
});

describe('fetchEvolutionChain', () => {
  it('fetches the given URL', async () => {
    fetchMock.mockReturnValue(ok({ chain: { species: { name: 'scorbunny' }, evolution_details: [], evolves_to: [] } }));
    const result = await fetchEvolutionChain('https://pokeapi.co/api/v2/evolution-chain/123');
    expect(result.chain.species.name).toBe('scorbunny');
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/evolution-chain/123');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- api.test
```
Expected: FAIL — module `../api` not found.

- [ ] **Step 3: Implement the API module**

Create `src/api.ts`:
```ts
import type {
  EvolutionChainResponse,
  Gen8ListResponse,
  PokemonResponse,
  SpeciesResponse,
} from './types';

const BASE = 'https://pokeapi.co/api/v2';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`);
  }
  return (await res.json()) as T;
}

export async function fetchGen8List(): Promise<string[]> {
  const data = await getJson<Gen8ListResponse>(`${BASE}/generation/8`);
  return data.pokemon_species.map((s) => s.name);
}

export function fetchPokemon(name: string): Promise<PokemonResponse> {
  return getJson<PokemonResponse>(`${BASE}/pokemon/${name}`);
}

export function fetchSpecies(name: string): Promise<SpeciesResponse> {
  return getJson<SpeciesResponse>(`${BASE}/pokemon-species/${name}`);
}

export function fetchEvolutionChain(url: string): Promise<EvolutionChainResponse> {
  return getJson<EvolutionChainResponse>(url);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- api.test
```
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/api.ts src/__tests__/api.test.ts
git commit -m "Add PokeAPI fetch helpers with tests"
```

---

## Task 5: `useGen8List` hook

**Files:**
- Create: `src/hooks/useGen8List.ts`

- [ ] **Step 1: Implement the hook**

Create `src/hooks/useGen8List.ts`:
```ts
import { useEffect, useState } from 'react';
import { fetchGen8List } from '../api';

let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

export interface Gen8ListState {
  names: string[];
  loading: boolean;
  error: string | null;
}

export function useGen8List(): Gen8ListState {
  const [names, setNames] = useState<string[]>(cached ?? []);
  const [loading, setLoading] = useState<boolean>(cached === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) return;
    let active = true;
    if (!inflight) inflight = fetchGen8List();
    inflight
      .then((list) => {
        cached = list;
        if (active) {
          setNames(list);
          setLoading(false);
        }
      })
      .catch((e: Error) => {
        if (active) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { names, loading, error };
}
```

- [ ] **Step 2: Manually verify in `App.tsx`**

Temporarily edit `src/App.tsx` to log the list:
```tsx
import { useGen8List } from './hooks/useGen8List';

export default function App() {
  const { names, loading, error } = useGen8List();
  console.log({ count: names.length, loading, error });
  return (
    <div className="crt">
      <header className="crt-header">▶ POKéDEX // GEN VIII</header>
      <div className="crt-status">
        [ {loading ? 'LOADING DEX...' : error ? 'ERROR' : `READY · ${names.length} ENTRIES`} ]
      </div>
    </div>
  );
}
```

Run `npm run dev`, open browser, expected: status line eventually shows `[ READY · 96 ENTRIES ]`. Stop the dev server.

- [ ] **Step 3: Revert `App.tsx` to the previous shell** (we'll wire it properly in Task 14)

Replace `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="crt">
      <header className="crt-header">▶ POKéDEX // GEN VIII</header>
      <div className="crt-status">[ READY ]</div>
      <div className="crt-empty">▶ ENTER POKéMON NAME AND PRESS RETURN</div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useGen8List.ts src/App.tsx
git commit -m "Add useGen8List hook with module-scoped cache"
```

---

## Task 6: `SearchBar` component (TDD)

**Files:**
- Create: `src/components/SearchBar.tsx`, `src/__tests__/SearchBar.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/SearchBar.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

const NAMES = ['scorbunny', 'cinderace', 'dragapult', 'grookey'];

describe('SearchBar', () => {
  it('shows autocomplete suggestions filtered by input', async () => {
    render(<SearchBar names={NAMES} onSearch={() => {}} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, 'sc');
    expect(screen.getByText('scorbunny')).toBeInTheDocument();
    expect(screen.queryByText('dragapult')).not.toBeInTheDocument();
  });

  it('calls onSearch with the typed name on Enter', async () => {
    const onSearch = vi.fn();
    render(<SearchBar names={NAMES} onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'dragapult{Enter}');
    expect(onSearch).toHaveBeenCalledWith('dragapult');
  });

  it('clicking a suggestion submits it', async () => {
    const onSearch = vi.fn();
    render(<SearchBar names={NAMES} onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'cin');
    await user.click(screen.getByText('cinderace'));
    expect(onSearch).toHaveBeenCalledWith('cinderace');
  });

  it('lowercases and trims the submitted value', async () => {
    const onSearch = vi.fn();
    render(<SearchBar names={NAMES} onSearch={onSearch} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), '  Dragapult  {Enter}');
    expect(onSearch).toHaveBeenCalledWith('dragapult');
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run:
```bash
npm test -- SearchBar
```
Expected: FAIL — component module missing.

- [ ] **Step 3: Implement `SearchBar`**

Create `src/components/SearchBar.tsx`:
```tsx
import { useMemo, useState } from 'react';

interface Props {
  names: string[];
  onSearch: (name: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ names, onSearch, disabled }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return names.filter((n) => n.includes(q)).slice(0, 8);
  }, [value, names]);

  const submit = (raw: string) => {
    const clean = raw.trim().toLowerCase();
    if (!clean) return;
    onSearch(clean);
    setValue(clean);
    setFocused(false);
  };

  return (
    <div className="crt-search">
      <div className="crt-search-row">
        <span className="crt-search-prompt">&gt;</span>
        <input
          aria-label="search pokemon"
          type="text"
          value={value}
          disabled={disabled}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit(value);
          }}
          placeholder="enter pokemon name..."
        />
        <span className="crt-cursor">&nbsp;</span>
      </div>
      {focused && suggestions.length > 0 && (
        <ul>
          {suggestions.map((name) => (
            <li key={name} onMouseDown={() => submit(name)}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run:
```bash
npm test -- SearchBar
```
Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchBar.tsx src/__tests__/SearchBar.test.tsx
git commit -m "Add SearchBar with autocomplete"
```

---

## Task 7: `usePokemon` hook

**Files:**
- Create: `src/hooks/usePokemon.ts`

- [ ] **Step 1: Implement the hook**

Create `src/hooks/usePokemon.ts`:
```ts
import { useEffect, useState } from 'react';
import {
  fetchEvolutionChain,
  fetchPokemon,
  fetchSpecies,
} from '../api';
import type {
  EvolutionChainResponse,
  PokemonResponse,
  SpeciesResponse,
} from '../types';

export type PokemonError =
  | { kind: 'not-in-gen-8' }
  | { kind: 'transmission' };

export interface PokemonBundle {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
}

export interface UsePokemonState {
  data: PokemonBundle | null;
  loading: boolean;
  error: PokemonError | null;
}

export function usePokemon(
  name: string | null,
  gen8Names: string[],
  attempt: number,
): UsePokemonState {
  const [state, setState] = useState<UsePokemonState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!name) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    if (gen8Names.length > 0 && !gen8Names.includes(name)) {
      setState({ data: null, loading: false, error: { kind: 'not-in-gen-8' } });
      return;
    }

    let active = true;
    setState({ data: null, loading: true, error: null });

    (async () => {
      try {
        const [pokemon, species] = await Promise.all([
          fetchPokemon(name),
          fetchSpecies(name),
        ]);
        const chain = await fetchEvolutionChain(species.evolution_chain.url);
        if (active) {
          setState({ data: { pokemon, species, chain }, loading: false, error: null });
        }
      } catch {
        if (active) {
          setState({ data: null, loading: false, error: { kind: 'transmission' } });
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [name, gen8Names, attempt]);

  return state;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/usePokemon.ts
git commit -m "Add usePokemon hook orchestrating 3 API calls"
```

---

## Task 8: `StatusLine` component

**Files:**
- Create: `src/components/StatusLine.tsx`

- [ ] **Step 1: Implement**

Create `src/components/StatusLine.tsx`:
```tsx
interface Props {
  state: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex';
}

const TEXT: Record<Props['state'], string> = {
  ready: '[ READY ]',
  scanning: '[ SCANNING... ]',
  'err-not-found': '[ ERR: NOT FOUND IN GEN VIII ]',
  'err-api': '[ ERR: TRANSMISSION LOST ]',
  'loading-dex': '[ LOADING DEX... ]',
};

export default function StatusLine({ state }: Props) {
  const className =
    'crt-status' +
    (state === 'scanning' || state === 'loading-dex' ? ' scanning' : '') +
    (state === 'err-not-found' || state === 'err-api' ? ' err' : '');
  return (
    <div className={className}>
      {TEXT[state]} {(state === 'scanning' || state === 'loading-dex') && <span className="crt-cursor">&nbsp;</span>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusLine.tsx
git commit -m "Add StatusLine component"
```

---

## Task 9: `StatBar` component

**Files:**
- Create: `src/components/StatBar.tsx`

- [ ] **Step 1: Implement**

Pokémon base stats max at 255. We'll bar-graph against a max of 200 for visual sanity (anything ≥200 fills the whole bar).

Create `src/components/StatBar.tsx`:
```tsx
const LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};
const BAR_WIDTH = 16;
const BAR_MAX = 200;

interface Props {
  name: string;
  value: number;
}

export default function StatBar({ name, value }: Props) {
  const filled = Math.min(BAR_WIDTH, Math.round((value / BAR_MAX) * BAR_WIDTH));
  const empty = BAR_WIDTH - filled;
  return (
    <div className="crt-stat">
      <span>{LABELS[name] ?? name.toUpperCase()}</span>
      <span className="crt-stat-bar">{'█'.repeat(filled)}{'░'.repeat(empty)}</span>
      <span className="crt-stat-value">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatBar.tsx
git commit -m "Add StatBar component"
```

---

## Task 10: `AbilityList` component

**Files:**
- Create: `src/components/AbilityList.tsx`

- [ ] **Step 1: Implement**

Create `src/components/AbilityList.tsx`:
```tsx
import type { PokemonResponse } from '../types';

interface Props {
  abilities: PokemonResponse['abilities'];
}

function pretty(name: string) {
  return name.replace(/-/g, ' ').toUpperCase();
}

export default function AbilityList({ abilities }: Props) {
  const sorted = [...abilities].sort((a, b) => a.slot - b.slot);
  return (
    <div className="crt-section">
      <div className="crt-section-label">▶ ABILITIES</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sorted.map((a) => (
          <li key={a.ability.name}>
            · {pretty(a.ability.name)}
            {a.is_hidden && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>(HIDDEN)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AbilityList.tsx
git commit -m "Add AbilityList component"
```

---

## Task 11: `ShinyToggle` component (TDD)

**Files:**
- Create: `src/components/ShinyToggle.tsx`, `src/__tests__/ShinyToggle.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/ShinyToggle.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShinyToggle from '../components/ShinyToggle';

describe('ShinyToggle', () => {
  it('marks NORMAL pressed when value is false', () => {
    render(<ShinyToggle value={false} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /normal/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /shiny/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange(true) when SHINY is clicked', async () => {
    const onChange = vi.fn();
    render(<ShinyToggle value={false} onChange={onChange} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /shiny/i }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
```

- [ ] **Step 2: Run tests, verify failure**

Run:
```bash
npm test -- ShinyToggle
```
Expected: FAIL — module missing.

- [ ] **Step 3: Implement**

Create `src/components/ShinyToggle.tsx`:
```tsx
interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function ShinyToggle({ value, onChange }: Props) {
  return (
    <div className="crt-shiny">
      <button type="button" aria-pressed={!value} onClick={() => onChange(false)}>
        [ NORMAL ]
      </button>
      <button type="button" aria-pressed={value} onClick={() => onChange(true)}>
        [ SHINY ]
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
npm test -- ShinyToggle
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ShinyToggle.tsx src/__tests__/ShinyToggle.test.tsx
git commit -m "Add ShinyToggle component with tests"
```

---

## Task 12: `EvolutionChain` component (TDD)

**Files:**
- Create: `src/components/EvolutionChain.tsx`, `src/__tests__/EvolutionChain.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/EvolutionChain.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EvolutionChain from '../components/EvolutionChain';
import type { ChainLink } from '../types';

const linear: ChainLink = {
  species: { name: 'scorbunny' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'raboot' },
      evolution_details: [
        { min_level: 16, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [
        {
          species: { name: 'cinderace' },
          evolution_details: [
            { min_level: 35, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
          ],
          evolves_to: [],
        },
      ],
    },
  ],
};

const branching: ChainLink = {
  species: { name: 'toxel' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'toxtricity-amped' },
      evolution_details: [
        { min_level: 30, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [],
    },
    {
      species: { name: 'toxtricity-low-key' },
      evolution_details: [
        { min_level: 30, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [],
    },
  ],
};

describe('EvolutionChain', () => {
  it('renders a 3-stage linear chain with conditions', () => {
    render(<EvolutionChain chain={linear} active="raboot" />);
    expect(screen.getByText(/scorbunny/i)).toBeInTheDocument();
    expect(screen.getByText(/raboot/i)).toBeInTheDocument();
    expect(screen.getByText(/cinderace/i)).toBeInTheDocument();
    expect(screen.getAllByText(/lv 16/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/lv 35/i).length).toBeGreaterThan(0);
  });

  it('renders branches for Toxel→Toxtricity', () => {
    render(<EvolutionChain chain={branching} active="toxel" />);
    expect(screen.getByText(/toxel/i)).toBeInTheDocument();
    expect(screen.getByText(/toxtricity-amped/i)).toBeInTheDocument();
    expect(screen.getByText(/toxtricity-low-key/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, verify failure**

Run:
```bash
npm test -- EvolutionChain
```
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/components/EvolutionChain.tsx`:
```tsx
import type { ChainLink, EvolutionDetail } from '../types';

interface Props {
  chain: ChainLink;
  active: string;
}

function describeCondition(d: EvolutionDetail): string {
  const parts: string[] = [];
  if (d.min_level != null) parts.push(`Lv ${d.min_level}`);
  if (d.item) parts.push(`use ${d.item.name.replace(/-/g, ' ')}`);
  if (d.held_item) parts.push(`hold ${d.held_item.name.replace(/-/g, ' ')}`);
  if (d.known_move) parts.push(`knows ${d.known_move.name.replace(/-/g, ' ')}`);
  if (d.min_happiness != null) parts.push(`happiness ${d.min_happiness}`);
  if (d.time_of_day) parts.push(d.time_of_day);
  if (d.needs_overworld_rain) parts.push('in rain');
  if (d.location) parts.push(`at ${d.location.name.replace(/-/g, ' ')}`);
  if (d.trigger.name === 'trade' && parts.length === 0) parts.push('trade');
  if (parts.length === 0) parts.push(d.trigger.name);
  return parts.join(' · ');
}

function pretty(name: string) {
  return name.replace(/-/g, ' ');
}

function Node({ link, active }: { link: ChainLink; active: string }) {
  const isActive = link.species.name === active;
  return (
    <span className={'crt-evo-node' + (isActive ? ' active' : '')}>{pretty(link.species.name)}</span>
  );
}

function Branch({ link, active }: { link: ChainLink; active: string }) {
  if (link.evolves_to.length === 0) {
    return <Node link={link} active={active} />;
  }
  if (link.evolves_to.length === 1) {
    const child = link.evolves_to[0];
    const cond = child.evolution_details[0];
    return (
      <>
        <Node link={link} active={active} />
        <span className="crt-evo-arrow">→</span>
        {cond && <span className="crt-evo-cond">{describeCondition(cond)}</span>}
        <span className="crt-evo-arrow">→</span>
        <Branch link={child} active={active} />
      </>
    );
  }
  return (
    <>
      <Node link={link} active={active} />
      <span className="crt-evo-arrow">→</span>
      <span className="crt-evo-branch">
        {link.evolves_to.map((child) => {
          const cond = child.evolution_details[0];
          return (
            <span key={child.species.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {cond && <span className="crt-evo-cond">{describeCondition(cond)}</span>}
              <span className="crt-evo-arrow">→</span>
              <Branch link={child} active={active} />
            </span>
          );
        })}
      </span>
    </>
  );
}

export default function EvolutionChain({ chain, active }: Props) {
  return (
    <div className="crt-section">
      <div className="crt-section-label">▶ EVOLUTION</div>
      <div className="crt-evo">
        <Branch link={chain} active={active} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
npm test -- EvolutionChain
```
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/EvolutionChain.tsx src/__tests__/EvolutionChain.test.tsx
git commit -m "Add EvolutionChain component with branching support"
```

---

## Task 13: Move grouping logic + `MoveList` component (TDD)

**Files:**
- Create: `src/moves.ts`, `src/components/MoveList.tsx`, `src/__tests__/moveGrouping.test.ts`

- [ ] **Step 1: Write failing test for `groupMoves`**

Create `src/__tests__/moveGrouping.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { groupMoves } from '../moves';
import type { PokemonResponse } from '../types';

const moves: PokemonResponse['moves'] = [
  {
    move: { name: 'pyro-ball' },
    version_group_details: [
      { level_learned_at: 1, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } },
    ],
  },
  {
    move: { name: 'tackle' },
    version_group_details: [
      { level_learned_at: 1, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } },
    ],
  },
  {
    move: { name: 'flame-charge' },
    version_group_details: [
      { level_learned_at: 0, move_learn_method: { name: 'machine' }, version_group: { name: 'sword-shield' } },
    ],
  },
  {
    move: { name: 'old-move' },
    version_group_details: [
      { level_learned_at: 5, move_learn_method: { name: 'level-up' }, version_group: { name: 'red-blue' } },
    ],
  },
];

describe('groupMoves', () => {
  it('only includes sword-shield moves', () => {
    const groups = groupMoves(moves);
    const all = Object.values(groups).flat().map((m) => m.name);
    expect(all).not.toContain('old-move');
  });

  it('groups by learn method', () => {
    const groups = groupMoves(moves);
    expect(groups['level-up'].map((m) => m.name).sort()).toEqual(['pyro-ball', 'tackle']);
    expect(groups['machine'].map((m) => m.name)).toEqual(['flame-charge']);
  });

  it('sorts level-up by level then name; others alphabetical', () => {
    const sample: PokemonResponse['moves'] = [
      { move: { name: 'b' }, version_group_details: [{ level_learned_at: 10, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } }] },
      { move: { name: 'a' }, version_group_details: [{ level_learned_at: 5, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } }] },
      { move: { name: 'z' }, version_group_details: [{ level_learned_at: 0, move_learn_method: { name: 'egg' }, version_group: { name: 'sword-shield' } }] },
      { move: { name: 'm' }, version_group_details: [{ level_learned_at: 0, move_learn_method: { name: 'egg' }, version_group: { name: 'sword-shield' } }] },
    ];
    const groups = groupMoves(sample);
    expect(groups['level-up'].map((m) => m.name)).toEqual(['a', 'b']);
    expect(groups['egg'].map((m) => m.name)).toEqual(['m', 'z']);
  });
});
```

- [ ] **Step 2: Run tests, verify failure**

Run:
```bash
npm test -- moveGrouping
```
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `groupMoves`**

Create `src/moves.ts`:
```ts
import type { GroupedMove, PokemonResponse } from './types';

export function groupMoves(
  moves: PokemonResponse['moves'],
): Record<string, GroupedMove[]> {
  const groups: Record<string, GroupedMove[]> = {};

  for (const m of moves) {
    for (const d of m.version_group_details) {
      if (d.version_group.name !== 'sword-shield') continue;
      const method = d.move_learn_method.name;
      if (!groups[method]) groups[method] = [];
      groups[method].push({
        name: m.move.name,
        level: d.level_learned_at,
        method,
      });
    }
  }

  for (const method of Object.keys(groups)) {
    if (method === 'level-up') {
      groups[method].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    } else {
      groups[method].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return groups;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
npm test -- moveGrouping
```
Expected: PASS — 3 tests green.

- [ ] **Step 5: Implement `MoveList` component**

Create `src/components/MoveList.tsx`:
```tsx
import { groupMoves } from '../moves';
import type { PokemonResponse } from '../types';

const ORDER: Array<{ key: string; label: string; openByDefault?: boolean }> = [
  { key: 'level-up', label: 'LEVEL-UP', openByDefault: true },
  { key: 'machine', label: 'TM / TR' },
  { key: 'egg', label: 'EGG' },
  { key: 'tutor', label: 'TUTOR' },
];

interface Props {
  moves: PokemonResponse['moves'];
}

function pretty(name: string) {
  return name.replace(/-/g, ' ');
}

export default function MoveList({ moves }: Props) {
  const groups = groupMoves(moves);
  const totalCount = Object.values(groups).reduce((n, g) => n + g.length, 0);

  if (totalCount === 0) {
    return (
      <div className="crt-section">
        <div className="crt-section-label">▶ MOVES (SWORD/SHIELD)</div>
        <div style={{ color: 'var(--dim)' }}>· no moves recorded</div>
      </div>
    );
  }

  return (
    <div className="crt-section crt-moves">
      <div className="crt-section-label">▶ MOVES (SWORD/SHIELD) · {totalCount}</div>
      {ORDER.map(({ key, label, openByDefault }) => {
        const list = groups[key];
        if (!list || list.length === 0) return null;
        return (
          <details key={key} open={openByDefault}>
            <summary>
              {label} ({list.length})
            </summary>
            <ul>
              {list.map((m) => (
                <li key={m.name}>
                  {key === 'level-up' && m.level > 0 ? `Lv ${String(m.level).padStart(2, '0')} · ` : '· '}
                  {pretty(m.name)}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/moves.ts src/components/MoveList.tsx src/__tests__/moveGrouping.test.ts
git commit -m "Add move grouping logic and MoveList component"
```

---

## Task 14: `PokemonCard` component (TDD)

**Files:**
- Create: `src/components/PokemonCard.tsx`, `src/__tests__/PokemonCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/PokemonCard.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PokemonCard from '../components/PokemonCard';
import type { ChainLink, PokemonResponse, SpeciesResponse, EvolutionChainResponse } from '../types';

const pokemon: PokemonResponse = {
  id: 887,
  name: 'dragapult',
  sprites: {
    front_default: 'normal.png',
    front_shiny: 'shiny.png',
    other: { 'official-artwork': { front_default: 'art-normal.png', front_shiny: 'art-shiny.png' } },
  },
  types: [{ slot: 1, type: { name: 'dragon' } }, { slot: 2, type: { name: 'ghost' } }],
  stats: [
    { base_stat: 88, stat: { name: 'hp' } },
    { base_stat: 120, stat: { name: 'attack' } },
    { base_stat: 75, stat: { name: 'defense' } },
    { base_stat: 100, stat: { name: 'special-attack' } },
    { base_stat: 75, stat: { name: 'special-defense' } },
    { base_stat: 142, stat: { name: 'speed' } },
  ],
  abilities: [
    { ability: { name: 'clear-body' }, is_hidden: false, slot: 1 },
    { ability: { name: 'infiltrator' }, is_hidden: false, slot: 2 },
    { ability: { name: 'cursed-body' }, is_hidden: true, slot: 3 },
  ],
  moves: [
    { move: { name: 'dragon-darts' }, version_group_details: [{ level_learned_at: 48, move_learn_method: { name: 'level-up' }, version_group: { name: 'sword-shield' } }] },
  ],
};

const chainLink: ChainLink = {
  species: { name: 'dreepy' },
  evolution_details: [],
  evolves_to: [
    {
      species: { name: 'drakloak' },
      evolution_details: [
        { min_level: 50, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
      ],
      evolves_to: [
        {
          species: { name: 'dragapult' },
          evolution_details: [
            { min_level: 60, trigger: { name: 'level-up' }, item: null, held_item: null, known_move: null, min_happiness: null, time_of_day: '', location: null, needs_overworld_rain: false, gender: null },
          ],
          evolves_to: [],
        },
      ],
    },
  ],
};

const species: SpeciesResponse = { name: 'dragapult', evolution_chain: { url: 'X' } };
const chain: EvolutionChainResponse = { chain: chainLink };

describe('PokemonCard', () => {
  it('renders all stat values', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} />);
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
  });

  it('marks the hidden ability', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} />);
    expect(screen.getByText(/cursed body/i).parentElement).toHaveTextContent(/HIDDEN/i);
  });

  it('renders types as chips', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} />);
    expect(screen.getByText(/dragon/i)).toBeInTheDocument();
    expect(screen.getByText(/ghost/i)).toBeInTheDocument();
  });

  it('renders the official artwork normal sprite', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'art-normal.png');
  });

  it('renders the shiny sprite when shiny is true', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={true} onShinyChange={() => {}} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'art-shiny.png');
  });

  it('falls back to pixel sprite if official-artwork shiny is missing', () => {
    const p: PokemonResponse = {
      ...pokemon,
      sprites: {
        ...pokemon.sprites,
        front_shiny: 'pixel-shiny.png',
        other: { 'official-artwork': { front_default: 'art-normal.png', front_shiny: null } },
      },
    };
    render(<PokemonCard pokemon={p} species={species} chain={chain} shiny={true} onShinyChange={() => {}} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'pixel-shiny.png');
  });

  it('renders the evolution chain', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} />);
    expect(screen.getByText(/dreepy/i)).toBeInTheDocument();
    expect(screen.getByText(/drakloak/i)).toBeInTheDocument();
    expect(screen.getByText(/dragapult/i)).toBeInTheDocument();
  });

  it('renders the move list (level-up open by default)', () => {
    render(<PokemonCard pokemon={pokemon} species={species} chain={chain} shiny={false} onShinyChange={() => {}} />);
    expect(screen.getByText(/dragon darts/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, verify failure**

Run:
```bash
npm test -- PokemonCard
```
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `src/components/PokemonCard.tsx`:
```tsx
import type { EvolutionChainResponse, PokemonResponse, SpeciesResponse } from '../types';
import StatBar from './StatBar';
import AbilityList from './AbilityList';
import EvolutionChain from './EvolutionChain';
import MoveList from './MoveList';
import ShinyToggle from './ShinyToggle';

interface Props {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
  shiny: boolean;
  onShinyChange: (v: boolean) => void;
}

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

function pickSprite(p: PokemonResponse, shiny: boolean): string {
  const art = p.sprites.other['official-artwork'];
  if (shiny) {
    return art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? '';
  }
  return art.front_default ?? p.sprites.front_default ?? '';
}

export default function PokemonCard({ pokemon, chain, shiny, onShinyChange }: Props) {
  const sprite = pickSprite(pokemon, shiny);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => STAT_ORDER.indexOf(a.stat.name) - STAT_ORDER.indexOf(b.stat.name),
  );

  return (
    <div className="crt-card">
      <div className="crt-card-top">
        <div>
          <img src={sprite} alt={pokemon.name} />
          <ShinyToggle value={shiny} onChange={onShinyChange} />
        </div>
        <div className="crt-card-meta">
          <div className="crt-card-name">{pokemon.name.toUpperCase()}</div>
          <div className="crt-card-dex">№ {String(pokemon.id).padStart(3, '0')}</div>
          <div className="crt-types">
            {pokemon.types.map((t) => (
              <span key={t.type.name} className="crt-type">{t.type.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="crt-section">
        <div className="crt-section-label">▶ BASE STATS</div>
        {sortedStats.map((s) => (
          <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
        ))}
      </div>

      <AbilityList abilities={pokemon.abilities} />

      <EvolutionChain chain={chain.chain} active={pokemon.name} />

      <MoveList moves={pokemon.moves} />
    </div>
  );
}
```

- [ ] **Step 4: Run tests, verify pass**

Run:
```bash
npm test -- PokemonCard
```
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/PokemonCard.tsx src/__tests__/PokemonCard.test.tsx
git commit -m "Add PokemonCard composing all sections"
```

---

## Task 15: Wire it all together in `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace `App.tsx`**

Replace `src/App.tsx`:
```tsx
import { useState } from 'react';
import SearchBar from './components/SearchBar';
import StatusLine from './components/StatusLine';
import PokemonCard from './components/PokemonCard';
import { useGen8List } from './hooks/useGen8List';
import { usePokemon } from './hooks/usePokemon';

export default function App() {
  const list = useGen8List();
  const [query, setQuery] = useState<string | null>(null);
  const [shiny, setShiny] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const result = usePokemon(query, list.names, attempt);

  let status: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex' = 'ready';
  if (list.loading) status = 'loading-dex';
  else if (result.loading) status = 'scanning';
  else if (result.error?.kind === 'not-in-gen-8') status = 'err-not-found';
  else if (result.error?.kind === 'transmission') status = 'err-api';

  const handleSearch = (name: string) => {
    setShiny(false);
    setQuery(name);
    setAttempt((n) => n + 1);
  };

  return (
    <div className="crt">
      <header className="crt-header">▶ POKéDEX // GEN VIII</header>
      <StatusLine state={status} />
      <SearchBar names={list.names} onSearch={handleSearch} disabled={list.loading} />

      {!query && !result.loading && (
        <div className="crt-empty">▶ ENTER POKéMON NAME AND PRESS RETURN</div>
      )}

      {result.error?.kind === 'not-in-gen-8' && (
        <div className="crt-error">ERR: "{query}" NOT FOUND IN GEN VIII</div>
      )}

      {result.error?.kind === 'transmission' && (
        <div className="crt-error">
          ERR: TRANSMISSION LOST
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>[ retry ]</button>
        </div>
      )}

      {result.data && (
        <PokemonCard
          pokemon={result.data.pokemon}
          species={result.data.species}
          chain={result.data.chain}
          shiny={shiny}
          onShinyChange={setShiny}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run all tests**

Run:
```bash
npm test
```
Expected: ALL PASS — every test from tasks 4, 6, 11, 12, 13, 14 green.

- [ ] **Step 3: Run typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Manually verify in browser**

Run `npm run dev`. In the browser:
1. Wait for `[ READY ]` after `[ LOADING DEX... ]`.
2. Type `dra` — autocomplete shows Dragapult, Drakloak, Dreepy, Duraludon.
3. Click `dragapult` (or type it and press Enter).
4. Card appears with: official artwork, dex #887, DRAGON + GHOST chips, six stat bars, abilities (Cursed Body marked HIDDEN), evolution chain Dreepy → Drakloak (Lv 50) → Dragapult (Lv 60), moves grouped by method.
5. Click `[ SHINY ]` — sprite swaps to shiny artwork.
6. Search `pikachu` — see `ERR: "pikachu" NOT FOUND IN GEN VIII`.
7. Search `toxel` — verify branching evolution shows both Toxtricity forms.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "Wire SearchBar, StatusLine, hooks, and PokemonCard into App"
```

---

## Task 16: README and final tidy

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

Create `README.md`:
```markdown
# Gen 8 Pokédex

A retro CRT-terminal-styled React app for searching Generation VIII Pokémon (Pokémon Sword/Shield) and viewing their stats, abilities, evolutions, and moves.

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Tech

Vite · React 18 · TypeScript · Vitest · PokeAPI · VT323 font · plain CSS

## Design & plan

- Spec: `docs/superpowers/specs/2026-05-09-pokemon-gen8-pokedex-design.md`
- Plan: `docs/superpowers/plans/2026-05-09-pokemon-gen8-pokedex.md`
```

- [ ] **Step 2: Run the build**

Run:
```bash
npm run build
```
Expected: clean production build.

- [ ] **Step 3: Run tests + typecheck one final time**

Run:
```bash
npm test && npx tsc --noEmit
```
Expected: all green, no errors.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Add README"
```

---

## Done

The app is complete. Manually verify the golden path one more time in the browser before declaring victory.
