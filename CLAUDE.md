# CLAUDE.md — guardrails for this repo

Short, opinionated rules. When something here conflicts with a default behavior, **this file wins**.

## Git workflow

### Do
- Commit and push **directly to `main`** after every discrete change. No feature branches, no PRs.
- One logical change = one commit. Finish the change → `git add <specific files>` → `git commit` → `git push origin main` → move on.
- Use the standard `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer.
- Write commit messages that explain **why**, not just what.

### Don't
- Don't open pull requests. Don't create branches.
- Don't bundle unrelated changes into one commit "to save time" — the user explicitly wants tight, change-per-commit history.
- Don't pause to confirm the push each time. Standing authorization is granted for `git push origin main` in this repo.
- Don't run `git push --force`, `git reset --hard`, or anything destructive without explicit per-action approval.

## Imports

### Do
- Use the `@/` alias for anything under `src/` (e.g. `import { useTheme } from '@/hooks/useTheme'`).
- Configured in `tsconfig.app.json`, `vite.config.ts`, and `vitest.config.ts` — all three must stay in sync if the alias changes.

### Don't
- Don't use `../`-style relative imports across directories. Use `@/...` instead.
- Don't introduce a second alias (`~/`, `#/`, etc.) — one alias is enough.

## TypeScript

### Do
- Keep `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports` on. Fix the cause, not the lint.
- Run `npx tsc -b --pretty false` before committing if you've touched types — silent green is the bar.

### Don't
- Don't add `// @ts-ignore` or `as any` to make errors go away. Type the data properly or narrow.
- Don't disable strict flags.

## Tests

### Do
- Use `npm test` (vitest). New components/hooks get a minimal test for default state + the main interactions.
- Use `@testing-library/react` patterns: query by role/label, drive with `userEvent`.
- Put tests in `src/__tests__/<name>.test.{ts,tsx}`.

### Don't
- Don't mock `localStorage` per test — `src/__tests__/setup.ts` already installs a working in-memory shim because Node 22+ ships an empty experimental `localStorage` that shadows jsdom's.
- Don't assert on internal CSS class names or DOM structure when a role/label query works.
- Don't "fix" the two known pre-existing `PokemonCard` sprite-source test failures unless that's the actual task — they predate recent changes and aren't owned by drive-by edits.

## UI / styling

### Do
- Keep the CRT phosphor aesthetic: `--primary` (phosphor green), `--accent` (magenta), `--tertiary` (cyan), `--dim`, all defined at the top of `src/styles/crt.css`. Pull from these variables, don't hardcode hex.
- Use the `Pixelify Sans` retro font already loaded in `index.html`. Fallback chain in `crt.css` is `'Pixelify Sans', 'VT323', 'Courier New', monospace`.
- Persist user preferences in `localStorage` under the `pokemax.*` namespace (`pokemax.theme`, `pokemax.view`, `pokemax.pageSize`, etc.).
- Light theme overrides live near the bottom of `crt.css` under `:root[data-theme="light"] ...`. Add matching overrides when introducing new tinted elements.

### Don't
- Don't introduce a CSS framework (Tailwind, etc.). The whole UI is hand-rolled CSS in one file by design.
- Don't add new font imports without dropping an old one — keep the network cost flat.
- Don't break the `html { zoom: 1.15 }` baseline at the top of `crt.css` — it's the global "make text legible" lever.

## Scope discipline

### Do
- Touch only what the task needs. Land it. Push. Move on.
- If a bug fix surfaces an adjacent issue, mention it in the response, don't silently bundle the fix.

### Don't
- Don't refactor surrounding code while doing a feature change.
- Don't add "future-proof" abstractions (interfaces, registries, dependency-injection helpers) for code that has one caller.
- Don't add comments that just describe what the code already says. Comments are for the *why* — a hidden invariant, an external constraint, a workaround.
- Don't generate documentation files (`*.md`, `README` additions) unless the task explicitly asks for it. This file is the exception.
