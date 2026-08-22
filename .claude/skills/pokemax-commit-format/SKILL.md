---
name: pokemax-commit-format
description: Use when authoring, amending, squashing, fixup-ing, rebasing, or cherry-picking any git commit message in the pokemax repo — covers subject line, bullet body, backtick rules, and the ban on AI attribution.
---

# pokemax commit format

Every commit is a subject line plus a bullet body. Measured across the last 60 commits: 188 bullets, **zero** ending in a period, **zero** prose paragraphs in a body.

Match `git log`. It is the specification.

## Subject

- **`PMX: ` prefix, always** — repo code, colon, one space, then the subject
- Imperative verb first after the prefix — `Add`, `Drop`, `Fold`, `Make`, `Give`
- Sentence case; capitalize the first word after the prefix
- Backtick every identifier, path, script, and package name
- No second prefix — no `feat:`, no `chore:`, no ticket id
- No trailing period
- Target 72 characters including the prefix; the subject body median is 53

```text
Good: PMX: Give the region model one owner in `generations.ts`
Good: PMX: Make `isObtainFile` validate the shape its consumers index
Bad:  Give the region model one owner in `generations.ts`
Bad:  PMX: feat: refactored the region stuff.
```

The prefix is on every hand-written commit, version bumps included — `PMX: 0.3.4`.

`(#5)` suffixes are appended by GitHub on squash-merge; never type one yourself. Commits made before this convention landed keep their bare subjects.

## Body

**The body is bullets. Nothing else.** No lede, no prose paragraph, no closing summary.

- Every line starts `- ` or is a continuation
- Start lowercase — unless the first token is an identifier or proper noun
- No trailing period, ever
- Wrap at ~72 characters; indent continuations 2 spaces
- One fact per bullet

```text
PMX: Drop the nullable expansion state from `ObtainRegions`

- `Set<string> | null` existed only because the default region was unknown
  until the file loaded — inside `ObtainRegions` it is known at mount
- plain `useState<Set<string>>` with a lazy initializer replaces it
- not routed through `useExpandedRegions` on purpose: its persisted value
  would carry one Pokémon's open region onto the next
```

## What the bullets say

The subject says what. The bullets say **why**, and prove it.

- Lead with the thing that changed, then what happened to it
- Use ` — ` to join a fact to its consequence
- Numbers, not adjectives — `410 lines, ~250 of them static label tables`
- Cite verification inline — e.g. verified all 1351 files in `public/obtain/` still pass
- State what was deliberately not done, and why — the `not routed through` bullet above
- Name the wrong assumption a fix corrects, not just the fix

## Backticks

This repo backticks aggressively. Sister repos do not — do not carry their lighter style here.

Backtick: identifiers, type names, file paths, directories, npm scripts, packages, CSS custom properties and class names, branch names, config keys, literal values.

## Writing the message

Use `-F -` with a quoted heredoc. Backticks inside a double-quoted `-m` string are executed by the shell.

```bash
git add <specific files>
git commit -F - <<'EOF'
PMX: Subject line here

- first bullet
- second bullet
EOF
```

## Hard rules

- **Zero AI attribution.** No `Co-Authored-By: Claude`, no "generated with", no agent or model name anywhere in subject or body.
- **One logical change per commit.** Unrelated work gets its own commit.
- **No bullet-per-changed-file.** A file list is not a rationale.

## Quick reference

| Element | Rule |
|---|---|
| Prefix | `PMX: ` — mandatory, every commit |
| Subject | Imperative, sentence case, backticked, no period, ≤72 chars |
| Body form | Bullets only — no prose lines |
| Bullet case | Lowercase, unless it opens with an identifier |
| Bullet period | Never |
| Wrap | ~72 chars, continuations indented 2 spaces |
| Content | Why over what; numbers over adjectives |
| Attribution | None, ever |
