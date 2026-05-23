# Audio assets

## `dynamax-intro.ogg`

Universal orchestral hit played before any `-gmax` / `-eternamax` form's cry
(chained via `Audio.onended` in `PokemonCard.tsx`). Sourced from a Sword/Shield
rip — drop your own clip here. Either `.ogg` or `.mp3` is fine; Vite serves the
file as-is at `${BASE_URL}audio/dynamax-intro.ogg`.

If the file is missing the wiring degrades gracefully — the per-form cry just
plays without an intro.

## `cries/<file>.{ogg,mp3}`

Optional per-variety cry overrides. Drop a file here and reference it from
`src/cryOverrides.ts` if you want to use a self-hosted clip instead of the
PokeAPI mirror for a specific form. Hotlinks (e.g. myinstants) also work in
the override map.
