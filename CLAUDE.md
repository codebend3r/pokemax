# CLAUDE.md — guardrails for this repo

Short, opinionated rules. When something here conflicts with a default behavior, **this file wins**.

## Git workflow

### Do
- **Default to `main`.** Commit and push directly to `main` after every discrete change — that's still the path for ordinary work.
- One logical change = one commit. Finish the change → `git add <specific files>` → `git commit` → `git push origin main` → move on.
- **Branch and open a PR when the user asks for one.** Branch off `main`, keep one-logical-change-per-commit inside the branch, then `gh pr create --base main`.
- Prefer one branch over several when the changes touch the same files — parallel branches that rewrite the same file just conflict.
- Write commit messages that explain **why**, not just what.
- Follow the `commit-format` skill (`.claude/skills/commit-format/SKILL.md`) for commit subject/body/backtick rules, including the zero-AI-attribution rule.
- Follow the `create-pull-request` skill (`.claude/skills/create-pull-request/SKILL.md`) for every PR title and body — it owns the section order, bullet style, and the same zero-AI-attribution rule.

### Don't
- Don't open a PR for routine work the user didn't ask to review — branches are permitted, not the default.
- Don't bundle unrelated changes into one commit "to save time" — the user explicitly wants tight, change-per-commit history.
- Don't pause to confirm the push each time. Standing authorization is granted for `git push origin main` in this repo.
- Don't run `git push --force`, `git reset --hard`, or anything destructive without explicit per-action approval.
- Don't append `Co-Authored-By: Claude` (or any AI/agent attribution) to commits. See the `commit-format` skill — zero AI mentions anywhere in the message.

## Imports

### Do
- Use the `@/` alias for anything under `src/` (e.g. `import { useTheme } from '@/hooks/useTheme'`).
- Configured in `tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`, and `vitest.config.ts` — all four must stay in sync if the alias changes.

### Don't
- Don't use `../`-style relative imports across directories. Use `@/...` instead.
- Don't introduce a second alias (`~/`, `#/`, etc.) — one alias is enough.

## TypeScript

### Do
- Keep `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `noUncheckedSideEffectImports` on. Fix the cause, not the lint.
- Run `npx tsc -b --pretty false` before committing if you've touched types — silent green is the bar.
- Reach for **type narrowing or type guards** to satisfy the checker. For platform-typed globals (e.g. `webkitAudioContext`), declare the real shape via an ambient declaration in `src/vite-env.d.ts` instead of asserting it at the call site.

### Don't
- Don't use TypeScript type assertions of **any** kind — no `as SomeType`, no `as unknown as`, no `as any`, no `// @ts-ignore`. Narrow the type, write a type guard, or declare the correct type. Assertions are banned outright; `as const` (a const assertion, not a cast) is fine.
- Don't disable strict flags.

## Tests

### Do
- Use `bun run test` (vitest). New components/hooks get a minimal test for default state + the main interactions. **Never** invoke `bun test` directly — that runs bun's built-in test runner, which this project does not use.
- Use `@testing-library/react` patterns: query by role/label, drive with `userEvent`.
- Put tests in `src/__tests__/<name>.test.{ts,tsx}`.

### Don't
- Don't mock `localStorage` per test — `src/__tests__/setup.ts` already installs a working in-memory shim because Node 22+ ships an empty experimental `localStorage` that shadows jsdom's.
- Don't assert on internal CSS class names or DOM structure when a role/label query works.
- Don't "fix" the two known pre-existing `PokemonCard` sprite-source test failures unless that's the actual task — they predate recent changes and aren't owned by drive-by edits.

## UI / styling

### Do
- Keep the CRT phosphor aesthetic: `--primary` (phosphor green), `--accent` (magenta), `--tertiary` (cyan), `--dim`, all defined at the top of `src/styles/crt.css`. Pull from these variables, don't hardcode hex.
- Two fonts are loaded in `index.html`: `Pixelify Sans` (the global retro display font — logo, names, headers; fallback chain `'Pixelify Sans', 'VT323', 'Courier New', monospace`) and `Space Mono` (the `--font-body` used for small body text and stat numbers where pixel-art legibility suffers). `VT323` is only a fallback name, not a loaded import.
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
