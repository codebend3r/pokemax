# CLAUDE.md

Pokemax is a retro CRT-styled Pokédex: a Vite + React 19 + TypeScript single-page app with wouter routing, deployed to GitHub Pages. Species, moves and sprites come live from PokeAPI, competitive sets from Smogon, and the how-to-obtain data is prebuilt into `public/obtain/`.

## Workflow

- Do not commit anything until I tell you to. Finishing a change is not permission to commit it.
- Do not push anything until I tell you to. Once I have told you to commit on a branch that already tracks a remote, push it in the same step, don't ask again.
- Do not merge anything until I tell you to.
- Do not create a PR until I tell you to.

## Imports

- Never use relative paths, not even for same-directory siblings or co-located style sheets. `@/*` maps to `src/`; it is configured in `tsconfig.json`, `tsconfig.app.json` and `vite.config.ts`, which must stay in sync.
- SCSS `@use` follows the same rule: `@use "@/styles/mixins" as *`.

## Tooling

- All scripts run through Bun (`bun install`, `bun run …`). Never invoke npm or yarn.
- Run tests with `bun run test`, never bare `bun test`, which runs Bun's built-in runner instead of Vitest.

## Tests

- Tests live in `src/__tests__/<name>.test.{ts,tsx}`. New components and hooks get a minimal test for their default state and main interactions.
- Use `@testing-library/react` patterns: query by role or label, drive with `userEvent`. Don't assert on CSS class names or DOM structure when a role or label query works.
- Don't mock `localStorage` per test. `src/__tests__/setup.ts` installs an in-memory shim, because Node 22+ ships an empty experimental `localStorage` that shadows jsdom's.
- Don't un-skip the two quarantined `PokemonCard` sprite tests (`it.skip`) unless that's the task. They describe the old static sprite ladder and need a sprite-spec update.

## TypeScript

- Always use type aliases. Never use interfaces, including in `declare global` augmentations.
- Use type guards wherever possible, and unit test every type guard function.
- Never use `any`. Prefer type narrowing or type guards.
- Never cast types, and never double cast (`as any as string`).
- If a type can't be inferred and narrowing isn't an option, use `unknown`.
- Keep `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` and `noUncheckedSideEffectImports` on. Fix the cause, not the lint.
- For platform-typed globals (e.g. `webkitAudioContext`), declare the real shape in `src/vite-env.d.ts` instead of working around it at the call site.

## SCSS/CSS

- Use SCSS modules (`*.module.scss`) for component styles.
- Use the global stylesheet (`src/styles/globals.scss`) only for design tokens and true typographic primitives.
- Layout is container-driven. The container sets width and height and positions its children, so a child moved to a different container can lay out differently there.
- Prefer CSS grid with `gap` for spacing. Avoid margins for spacing. Flex is the second choice.
- Avoid plain divs, meaning divs with no class or id.
- Always use the token values from `src/styles/globals.scss` for font sizes, colors, padding, margin, gap and border radius.

## UI

- Keep the CRT phosphor aesthetic: `--primary` (phosphor green), `--accent` (magenta), `--tertiary` (cyan) and `--dim`, currently defined at the top of `src/styles/crt.css`. Never hardcode hex.
- Two fonts load in `index.html`: `Pixelify Sans`, the retro display font for the logo, names and headers, and `Space Mono` (`--font-body`), for small body text and stat numbers where pixel art loses legibility. `VT323` is only a fallback name. Don't add a font import without dropping one.
- Light theme overrides go under `:root[data-theme="light"]`. Add a matching override when introducing a new tinted element.
- Don't break the `html { zoom: 1.15 }` baseline at the top of `crt.css`. It is the global "make text legible" lever.
- Persist user preferences in `localStorage` under the `pokemax.*` namespace (`pokemax.theme`, `pokemax.view`, `pokemax.pageSize`, …).
- Don't introduce a CSS framework (Tailwind, etc.).

## Code style

- Prefer immutable data structures and operations.
- Prefer `reduce` over `for` loops. Never use `for/in` or `for/of`; use `Array.prototype` methods (`map`, `filter`, `reduce`, `flatMap`).
- Prefer double-bang (`!!value`) for boolean conversion.
- Prefer short-circuit `&&` over a ternary whose else branch is `null` or `undefined`, especially in JSX.
  - Do: `{isActive && <Badge />}`. Don't: `{isActive ? <Badge /> : null}`.
  - Make the condition a real boolean (`!!count && …`) so a bare `0` never renders.
- Prefer optional chaining (`?.`), and always pair it with nullish coalescing (`??`) to supply a fallback.
- Prefer a single object parameter over positional ones, so argument order doesn't matter. Do: `doSomething({ foo, bar })`. Don't: `doSomething(foo, bar)`.

## Accessibility (WCAG AA)

- Use semantic HTML before ARIA: a native `button`, never a clickable `div`. Add ARIA only to fill a gap, and never override a native role.
- Everything must be operable by keyboard, with a visible `:focus-visible` style. Modals, drawers and menus move focus in, trap it, restore it to the trigger on close, and close on `Escape`.
- Every control needs an accessible name:
  - form fields get a `label`, with `aria-describedby` for hints and errors;
  - icon-only buttons get an `aria-label`;
  - decorative icons get `aria-hidden="true"`, and decorative images `alt=""`.
- Announce async changes (toasts, status, form errors) with `aria-live` or `role="alert"`.
- Text needs at least 4.5:1 contrast, and large text and UI elements 3:1, measured against the `globals.scss` tokens. Never signal meaning by color alone.
- Respect `prefers-reduced-motion` and size with `rem`. Each page has one `h1` with no skipped heading levels, and the document sets `lang`.

## Specs and plans

- Design specs and implementation plans live in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Check them before extending an existing feature.

## Scope discipline

- Touch only what the task needs. If a fix surfaces an adjacent issue, mention it in the response; don't silently bundle the fix.
- Don't refactor surrounding code while doing a feature change.
- Don't add "future-proof" abstractions (registries, dependency-injection helpers) for code that has one caller.
- Don't add comments that just describe what the code already says. Comments are for the *why*: a hidden invariant, an external constraint, a workaround.
- Don't generate documentation files (`*.md`, `README` additions) unless the task explicitly asks for it. This file is the exception.

## Creating PRs

- When creating a PR, always run the /thermo-nuclear-code-quality-review skill, then apply all of suggestions, commit as a separate commit and push to origin, then open PR
