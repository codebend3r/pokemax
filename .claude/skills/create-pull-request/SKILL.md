---
name: create-pull-request
description: Use when opening a pull request in the pokemax repo, writing or rewriting a PR title or body, or editing an existing PR's description — including when the user says "open a PR", "raise a PR", "push this for review", or asks to fix up a PR description.
---

# Creating a pull request

Every pokemax PR reads the same way: a reviewer scans the title, gets the shape from the lede, and finds the detail in bullets. Match the existing PRs (#3, #5, #6) — they are the reference.

**Bullets are the default. Prose is the exception.**

## Title

- Sentence case, no prefix — no `feat:`, no `chore:`, no ticket id
- Names the outcome, not the mechanics
- Backticks on every identifier, path, and package name
- No trailing period; target 72 characters
- Same voice as the commit subjects in `git log` — the title is a commit subject for the whole branch

```text
Good: Swap lint, format, and test toolchains for `oxlint`, `oxfmt`, `bun test`
Bad:  chore: various fixes and improvements.
```

## Body contract

The body is these parts, in this order:

1. **Lede** — 1–2 sentences, no heading. What the PR does and why. Link prior work as `#5` when it is a follow-up.
2. **`## What changed`** — bullets, one fact each.
3. **`## Verification`** — bullets. Commands actually run, and their results.
4. **`## Notes`** — bullets. Include only when there is something to say.

**If the change spans more than one subsystem,** replace `## What changed` with one `##` section per subsystem (`## Formatting`, `## Linting`, `## Tests`), each holding its own bullets.

**If work was deliberately left undone,** it goes in `## Notes` — never omitted.

## Bullet style

- One fact per bullet, two lines maximum
- Lead with the thing that changed, then what happened to it
- Backticks on identifiers, paths, commands, scripts, CSS vars, branch names
- Numbers, not adjectives — `130 → 143 tests`, not `more tests`
- No trailing period on a single-clause bullet; use periods when a bullet runs to two sentences
- Cite the evidence inline — e.g. all 1351 files in `public/obtain/` still pass the tightened guard

## Verification section

Report what was run, not what should pass:

- `bun run system-check` green — `format:check`, `tsc -b`, `oxlint`, 143 tests, `vite build`
- Test count before → after
- Any dataset or generated-file impact, including "none"

A red or skipped check is stated plainly, with the output. Never claim a check passed without running it.

## Notes section

The place for judgment the diff cannot show:

- Deviations from the plan or from review feedback, and why
- Adjacent problems found and deliberately not fixed
- Known limitations shipping with the change
- Why a branch exists at all, given `CLAUDE.md` defaults to `main`

## Creating it

Write the body to a file first — backticks inside a double-quoted `--body` string get executed by the shell.

```bash
cat > /tmp/pr-body.md <<'EOF'
<body>
EOF
gh pr create --base main --title "<title>" --body-file /tmp/pr-body.md
```

Editing an existing PR: `gh pr edit <n> --body-file /tmp/pr-body.md`.

## Hard rules

- **Zero AI attribution** anywhere in the title or body — no `Co-Authored-By: Claude`, no "generated with", no agent mentions
- **No test plan checkboxes**, no `🤖` footers, no emoji section headers
- **No restating the diff** — a bullet per changed file is not a summary

## Quick reference

| Element | Rule |
|---|---|
| Title | Sentence case, no prefix, backticked identifiers, ≤72 chars |
| Lede | 1–2 sentences, no heading |
| Sections | `What changed` → `Verification` → `Notes` |
| Body form | Bullets; prose only in the lede |
| Identifiers | Always backticked |
| Evidence | Numbers and command output, never adjectives |
| Attribution | None, ever |
