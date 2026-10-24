# Repository code-quality remediation — stacked PR plan

Date: 2026-10-24
Status: planned; implementation not started
Review baseline: `eece7f1` (`PMX: 0.3.8`)

## Goal

Address the repository-wide quality audit through small, independently reviewable PRs. Prefer deleting competing policies, implicit dependencies, and redundant control flow over adding abstraction layers.

This plan includes both behavior-preserving restructuring and intentional correctness fixes. Identify those separately in each PR description; do not claim every change preserves behavior.

## Baseline

At review time, formatting, typecheck, lint, production build, and all 209 tests across 45 files passed. Findings were established through source inspection and local reproductions, not browser or live-service testing.

The review did not change source files. Re-run the baseline checks before implementation, because the repository may have changed since this plan was written.

## Execution rules

- Read `CLAUDE.md` before starting. Its current instructions take precedence over examples in older plans.
- Use Bun for all scripts and tests: `bun run test`, never bare `bun test`.
- Do not commit, push, create PRs, or merge without the required user authorization.
- Do not implement the whole stack in one working tree and then attempt to split it afterward. Finish and validate each slice before starting the next.
- Keep each PR independently buildable and testable against its parent.
- Use the test-location convention already in this repository: `src/__tests__/`.
- Avoid new dependencies unless a concrete requirement justifies them.
- Do not combine cosmetic repository-wide rewrites with these changes.
- Before opening each PR, run the thermo-nuclear quality review and follow the repository's required review/fix workflow.

## Stack structure

Suggested branch names are provisional. Confirm the correct base branch when starting.

| Order | Branch | PR scope | Initial PR base |
| --- | --- | --- | --- |
| 1 | `refactor/validate-data-boundaries` | Honest runtime contracts | Repository main branch |
| 2 | `fix/atomic-obtain-generation` | Trustworthy dataset rebuilds | PR 1 branch |
| 3 | `refactor/pokemon-identity` | Canonical species and variety identity | PR 2 branch |
| 4 | `fix/trainer-counter-dependencies` | Deterministic counter inputs | PR 3 branch |
| 5 | `fix/async-feature-recovery` | Honest loading/error states and retries | PR 4 branch |
| 6 | `refactor/component-styles` | Scoped styles and predictable cascade | PR 5 branch |
| 7 | `fix/cry-playback-ownership` | One playback lifecycle | PR 6 branch |
| 8 | `fix/best-effort-persistence` | Nonfatal storage writes | PR 7 branch |

This is a linear review stack, not a claim that every PR technically depends on every predecessor. PR 4 benefits directly from PR 3; PR 2 should reuse applicable boundary improvements from PR 1. The remaining slices can be independently rebased if review sequencing changes.

After a parent merges, update the child branch and PR base using the repository's authorized workflow. Do not merge a child before its dependencies.

## PR 1 — Make runtime contracts honest

### Findings

- `src/obtain/types.ts` accepts malformed breeding data, version elements, and optional entry fields.
- `src/types.ts` validates evolution triggers but not the other evolution-detail fields consumers read.
- `src/counters.ts` treats the presence of `num` as proof of the whole Showdown entry shape.
- `src/competitive.ts` uses an optional-value validator for required move values, accepts arbitrary spread objects, and can resolve an empty tier to an undefined set.

### Implementation

1. Inventory the fields each consumer reads; validate their actual declared shapes.
2. Reuse existing primitive guards where appropriate. Do not introduce a generic schema framework for these few contracts.
3. Validate optional fields when present, without requiring legitimately absent fields.
4. Separate required move-value validation from optional string/list validation.
5. Validate spread values and Showdown evolution fields.
6. Make build selection skip empty tiers and return `null` when no usable set exists.

### Tests and acceptance

- Reject `breeding: 42`, numeric version names, and `conditions: 42`.
- Reject malformed evolution items and Showdown `prevo: 42` before consumption.
- Reject malformed moves and spreads while retaining valid alternatives.
- An empty tier never produces a `ResolvedBuild` with undefined members.
- Exercise every added or changed guard through positive and negative cases.
- Validate the committed obtain files against the strengthened obtain guard without rewriting the dataset.

### Scope boundary

Do not change identity resolution, scoring policy, or UI recovery here.

## PR 2 — Make obtain generation trustworthy

### Findings

`scripts/build-obtain-data.mts` silently substitutes empty values for malformed required input, writes directly into published output, and checks completeness using files that may belong to previous runs.

### Implementation

1. Replace tolerant readers for required source fields with explicit validation and actionable errors.
2. Preserve documented, intentional source fallbacks; distinguish missing source coverage from malformed input or failed requests.
3. Extract only the parsing/orchestration seams needed for deterministic tests.
4. Generate into staging and record successful outputs from this run.
5. Validate generated records before publication.
6. Publish only after the intended run's completeness criteria pass. Choose and document a safe publication strategy; a series of individual file renames is not dataset-level atomicity.
7. Define `--only` behavior explicitly: targeted failures must fail the command and must not corrupt unrelated output.
8. Ensure fatal generation failures produce a nonzero exit code even when old output files exist.

### Tests and acceptance

- A required-source failure cannot pass because an old output file exists.
- Malformed species input cannot become a successful empty record.
- A failed full run leaves the previously published dataset intact.
- A failed targeted run does not publish partial targeted output.
- Successful targeted runs leave unrelated records unchanged.
- Tests use fixtures and temporary directories, not live scraping or the real published directory.

### Scope boundary

Do not regenerate all committed data as incidental churn. Obtain approval for any live full rebuild separately.

## PR 3 — Resolve Pokémon identity once

### Findings

Species, default-variety, selected-variety, form suffix, and provider names are reconstructed across `dex.ts`, `routes.ts`, `usePokemonView`, `PokemonCard`, and competitive lookup. Hyphen-based Smogon conversion misses valid names such as `Mr. Mime` and `Iron Bundle`.

### Implementation

1. Map existing identity flows before editing; preserve URL compatibility.
2. Define the smallest explicit resolved identity needed by consumers: species identity, default variety, and selected variety.
3. Keep URL parsing/serialization in the routing layer; resolve domain identity in the data layer.
4. Stop reconstructing the selected variety independently in the card.
5. Give external providers explicit conversion boundaries. Reuse applicable existing conventions, but do not assume sprite slugs and Smogon display keys are interchangeable.
6. Remove first-hyphen guesses and redundant downstream fallbacks where the resolved identity makes them unnecessary.
7. Preserve the intended base-variety preview while a valid selected form loads.

### Tests and acceptance

- Cover ordinary species, compound names, alternate forms, and species whose default variety has a different name.
- Include `deoxys`/`deoxys-normal`, `mr-mime`, and `iron-bundle`.
- Cover cold deep links, canonicalization, invalid forms, and form switching.
- Existing legacy and canonical links continue to resolve.
- Smogon fixtures with `Mr. Mime` and `Iron Bundle` resolve correctly.
- Form loading and cry playback do not gain duplicate events.

### Scope boundary

Do not create a universal provider registry or redesign every sprite fallback. Change adapters only where needed to establish the identity boundary.

## PR 4 — Make trainer counter dependencies explicit

### Findings

`TrainersPage` reads `formIndex` with fetching disabled. Counter inputs therefore depend on whether unrelated Pokédex filters previously warmed the cache. The disabled lookup does not subscribe to future cache completion.

### Implementation

1. Load the full required species/form dataset when counter generation needs it, rather than relying on incidental cache contents.
2. Keep orchestration with the counter feature and pass complete, ready input into the pure calculation.
3. Represent required-index loading and failure explicitly; do not interpret incomplete inputs as a valid empty counter team.
4. Preserve the existing scoring and availability policies in this slice.
5. If optional level-data degradation remains, make that policy explicit rather than silently confusing it with complete data.

### Tests and acceptance

- Cold and warm navigation produce identical results for a roster containing an alternate form.
- Pending indexes do not produce a premature “NO COUNTERS FOUND.”
- Required-index failure is observable and recoverable.
- Switching trainers while requests are pending cannot display stale results.

## PR 5 — Preserve async state and expose recovery

### Findings

- `PokedexPage` discards type/form index error and loading states.
- `PokemonGrid` treats a missing type index as empty membership and reports “NO MATCHES.”
- A failed comparison hides the picker, while CHANGE is available only after success.
- Competitive errors do not expose the retry action already supplied by `AsyncState`.

### Implementation

1. Keep async state intact until the feature that owns the result renders it.
2. Distinguish fetching, failed lookup, and successfully empty results.
3. Provide retry for recoverable failures and a way to change a failed comparison target.
4. Reuse the existing async contract; add shared UI only where it removes real duplication.
5. Avoid triggering unrelated lookups when retrying one failed feature.

### Tests and acceptance

- Pending/failed type lookup is never announced as a successful zero-match result.
- Form-index errors are visible and recoverable.
- Failed comparisons allow retry and target replacement without closing the panel.
- Competitive retries can reach a ready state after a transient failure.
- Verify keyboard access and async announcements.

### Scope boundary

The obtain design explicitly specifies an unavailable-only error display without retry UI. Preserve that contract unless separately approved.

## PR 6 — Scope component styles and repair cascade ownership

### Findings

`src/styles/crt.css` contains 3,483 lines of component styles, responsive rules, themes, and animations. Early desktop grid and sprite rules are overridden by later equal-specificity base rules.

### Implementation

1. Inventory tokens, primitives, component ownership, theme overrides, and cross-component selectors.
2. Establish visual baselines at representative mobile, tablet, and desktop widths in both themes.
3. Move component implementation into SCSS modules, keeping responsive rules beside their base rules.
4. Keep global tokens and true primitives global. Introduce shared mixins only for demonstrated repetition.
5. Preserve the `html { zoom: 1.15 }` baseline, focus styles, reduced-motion behavior, and CRT aesthetic.
6. Separate mechanical extraction from intentional responsive corrections in the diff/commit narrative.
7. Verify whether SCSS tooling is already available; if a dependency is necessary, add an exact version and update the Bun lockfile.

### Tests and acceptance

- Desktop grid sizing and sprite dimensions follow the intended breakpoint rules.
- Light and dark themes retain matching component overrides.
- Check home, Pokémon detail, trainers, teams, compare, and expanded detail panels.
- No accidental image/layout changes from replacing broad selectors.
- No replacement global stylesheet simply inherits the same monolith.

### Scope boundary

Do not redesign the visual language. If extraction cannot remain reviewable as one PR, split it into successive ownership-based slices before starting, each with visual checks.

## PR 7 — Give cry playback one lifecycle owner

### Findings

`cry.ts` owns ordinary audio playback, but `gmaxAudio.ts` creates independent sources and returns only a boolean. Those sources cannot be stopped or volume-adjusted by the purported single player. Pending decoding can start obsolete playback. At review time, `toxtricity-low-key-gmax` was the committed Gmax variety without a local override.

### Implementation

1. Check whether synthesis still earns its complexity.
2. If a verified equivalent local clip removes the need for synthesis without losing intended behavior, remove the unused path.
3. Otherwise, return a stoppable playback handle from the effects renderer and retain lifecycle ownership in `cry.ts`.
4. Prevent stale asynchronous completion from starting a superseded cry.
5. Apply volume changes to the active playback backend and clean up ended/stopped nodes.

### Tests and acceptance

- Rapid selections never leave overlapping obsolete cries.
- Delayed decode completion cannot start an old selection.
- Volume changes affect active playback.
- Failed effects playback falls back only when the request is still current.
- Existing priming and once-per-selection/form-switch behavior remain intact.

## PR 8 — Make persistence best-effort

### Finding

`usePersistentState` catches storage-read failures but performs unguarded writes inside an effect. Storage restrictions or quota errors can turn preference changes into uncaught application errors.

### Implementation

1. Keep in-memory React state authoritative.
2. Catch persistence failures at the shared write boundary.
3. Preserve existing keys, codecs, defaults, and the no-write-until-first-change behavior.
4. Do not add a storage service or fallback database for this requirement.

### Tests and acceptance

- Throwing `getItem` still uses the fallback.
- Throwing `setItem` does not crash or prevent preference changes.
- Initial mount does not persist a default.
- Successful writes retain their existing encoded values.

## Validation gate for every PR

Run:

```sh
bun run format:check
bun run typecheck
bun run lint
bun run test
bun run build
```

Also run the slice-specific tests and manual checks above. Inspect `git diff` for unrelated changes, generated-data churn, accidental behavior changes, and unnecessary abstractions.

Each PR description should include:

- Its parent PR and position in the stack.
- The invariant or ownership problem it removes.
- Intentional behavior fixes versus behavior-preserving restructuring.
- Tests and manual checks actually performed.
- Remaining limitations, without claiming unperformed browser or live-source validation.

## Explicit non-goals

- Mechanical conversion of every interface or positional function.
- Repository-wide loop/style rewrites.
- A new query/cache framework, provider registry, or dependency-injection system.
- Counter scoring or historical game-mechanics redesign.
- Splitting the 3,791-line trainer dataset solely to meet a line-count threshold: mostly declarative data is not the same problem as tangled implementation.
- Unrequested dependency upgrades, live dataset regeneration, commits, pushes, or PR creation.
