// Per-variety cry URL overrides. When the PokeAPI clip for a specific form
// isn't what the user wants (e.g. PokeAPI's Pikachu-Gmax cry is the short
// in-game cry but the iconic "pii" is the moment people remember), this
// map wins over `pokemon.cries.latest`.
//
// Keys are PokeAPI variety slugs (`pokemon.name`), not species names.
// Values are absolute audio URLs.
//
// Two ways to add an entry:
//   1. Hotlink — any CORS-friendly MP3/OGG works for `<audio>` playback
//      (CORS only matters for Web Audio buffer reads / canvas, neither
//      of which we do).
//   2. Self-host — drop the file at `public/audio/cries/<file>.mp3` and
//      reference it as `${import.meta.env.BASE_URL}audio/cries/<file>.mp3`.
//      Survives any third-party CDN changes.
export const CRY_OVERRIDES: Record<string, string> = {
  // Iconic "pii" from Gmax Pikachu's SwSh appearance (myinstants mirror,
  // Cloudflare-served, 58 KB MP3). Reported by user as the right sound.
  'pikachu-gmax': 'https://www.myinstants.com/media/sounds/pikachu-pee.mp3',
  // Full ~8 s Gmax Corviknight roar from SwSh (same CDN, 136 KB MP3).
  'corviknight-gmax': 'https://www.myinstants.com/media/sounds/gigantamaxcorviknight.mp3',
  // Eternamax — full 3.44 s dramatic version, ripped from SwSh's audio bank.
  // PokeAPI's clip is the 0.88 s snippet.
  'eternatus-eternamax': `${import.meta.env.BASE_URL}audio/cries/eternatus-eternamax.ogg`,
  // Meowth-Gmax — SwSh's `Play_PV_052_sp_roar.ogg` is a dedicated 1.74 s,
  // 48 kHz HD roar (separate from the 5 standard cry samples and 2.4× longer
  // than PokeAPI's 0.72 s version). The only `sp_roar` file in the entire
  // SwSh sound bank — Meowth-Gmax and Eternamax are the only two forms that
  // ship with a truly distinct "Gmax cry" rather than a runtime-processed
  // base cry. Every other Gmax falls through to the Web Audio effect chain.
  'meowth-gmax': `${import.meta.env.BASE_URL}audio/cries/meowth-gmax.ogg`,
};

/** Returns the override URL for a variety, or `null` to fall through to PokeAPI. */
export function cryOverrideFor(varietyName: string): string | null {
  return CRY_OVERRIDES[varietyName] ?? null;
}
