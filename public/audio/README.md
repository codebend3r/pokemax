# Audio assets

## `cries/<variety>.{mp3,ogg}`

Self-hosted Pokémon cry overrides, keyed by PokeAPI variety slug. The
`CRY_OVERRIDES` map in `src/cryOverrides.ts` decides which forms read from
here vs. fall back to PokeAPI's `cries.latest`.

Every `-gmax` / `-eternamax` form has an entry here:

- **Gen 1-8 Gmax forms**: 4 s clips extracted from a Sword/Shield "All
  Gigantamax" YouTube compilation, each starting at the Dynamax intro
  jingle and including the per-form cry. Encoded as MP3 (96 kbps mono).
- **Meowth-Gmax**: SwSh's `Play_PV_052_sp_roar.ogg` (1.74 s, 48 kHz HD).
- **Eternatus-Eternamax**: SwSh's `Play_PV_890_01_00.ogg` (3.44 s).

These are dispatched without the Web Audio effect chain — the clips
already contain the dramatic intro. The effect chain (`src/gmaxAudio.ts`)
only runs for Gmax forms that lack an override (currently none).

To replace one: drop a new file at `public/audio/cries/<variety>.<ext>`,
update the entry in `src/cryOverrides.ts`.
