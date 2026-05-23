// Per-variety cry URL overrides. Wins over `pokemon.cries.latest` in
// `PokemonCard.tsx`. Keys are PokeAPI variety slugs (`pokemon.name`).
//
// Every Gmax form has a self-hosted clip extracted from a SwSh "All
// Gigantamax" compilation: ~4 s each, captures the Dynamax intro jingle
// followed by the Pokémon's Gmax cry — the "first time you see it"
// moment the user wanted. Eternatus-Eternamax + Meowth-Gmax are sourced
// directly from SwSh's audio bank (cleaner) and aren't in the comp video.
//
// Add a new entry: drop the file at `public/audio/cries/<file>.{mp3,ogg}`
// and reference it as `${import.meta.env.BASE_URL}audio/cries/<file>.<ext>`.
const A = (file: string): string => `${import.meta.env.BASE_URL}audio/cries/${file}`;

export const CRY_OVERRIDES: Record<string, string> = {
  // Gen 1 starters' Gmax forms — from the compilation
  'venusaur-gmax': A('venusaur-gmax.mp3'),
  'charizard-gmax': A('charizard-gmax.mp3'),
  'blastoise-gmax': A('blastoise-gmax.mp3'),
  // Other Gen 1 Gmax-capable species
  'butterfree-gmax': A('butterfree-gmax.mp3'),
  'pikachu-gmax': A('pikachu-gmax.mp3'),
  'machamp-gmax': A('machamp-gmax.mp3'),
  'gengar-gmax': A('gengar-gmax.mp3'),
  'kingler-gmax': A('kingler-gmax.mp3'),
  'lapras-gmax': A('lapras-gmax.mp3'),
  'eevee-gmax': A('eevee-gmax.mp3'),
  'snorlax-gmax': A('snorlax-gmax.mp3'),
  // Gen 5
  'garbodor-gmax': A('garbodor-gmax.mp3'),
  // Gen 7 (Pokémon GO origin)
  'melmetal-gmax': A('melmetal-gmax.mp3'),
  // Gen 8 starters
  'rillaboom-gmax': A('rillaboom-gmax.mp3'),
  'cinderace-gmax': A('cinderace-gmax.mp3'),
  'inteleon-gmax': A('inteleon-gmax.mp3'),
  // Gen 8 native
  'corviknight-gmax': A('corviknight-gmax.mp3'),
  'orbeetle-gmax': A('orbeetle-gmax.mp3'),
  'drednaw-gmax': A('drednaw-gmax.mp3'),
  'coalossal-gmax': A('coalossal-gmax.mp3'),
  'flapple-gmax': A('flapple-gmax.mp3'),
  'appletun-gmax': A('appletun-gmax.mp3'),
  'sandaconda-gmax': A('sandaconda-gmax.mp3'),
  'toxtricity-amped-gmax': A('toxtricity-amped-gmax.mp3'),
  'centiskorch-gmax': A('centiskorch-gmax.mp3'),
  'hatterene-gmax': A('hatterene-gmax.mp3'),
  'grimmsnarl-gmax': A('grimmsnarl-gmax.mp3'),
  'alcremie-gmax': A('alcremie-gmax.mp3'),
  'copperajah-gmax': A('copperajah-gmax.mp3'),
  'duraludon-gmax': A('duraludon-gmax.mp3'),
  'urshifu-single-strike-gmax': A('urshifu-single-strike-gmax.mp3'),
  'urshifu-rapid-strike-gmax': A('urshifu-rapid-strike-gmax.mp3'),
  // Meowth-Gmax — sourced directly from SwSh's audio bank
  // (`Play_PV_052_sp_roar.ogg`, 1.74 s @ 48 kHz HD)
  'meowth-gmax': A('meowth-gmax.ogg'),
  // Eternamax — from SwSh's audio bank (`Play_PV_890_01_00.ogg`, 3.44 s).
  // Not in the compilation video.
  'eternatus-eternamax': A('eternatus-eternamax.ogg'),
};

/** Returns the override URL for a variety, or `null` to fall through to PokeAPI. */
export function cryOverrideFor(varietyName: string): string | null {
  return CRY_OVERRIDES[varietyName] ?? null;
}
