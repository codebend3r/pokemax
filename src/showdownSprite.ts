// Showdown's sprite mirror at `play.pokemonshowdown.com/sprites/gen5/...`
// uses a slug convention that differs from PokeAPI's. Base species with
// multi-word names (`Mr. Mime` → `mrmime`, `Iron Bundle` → `ironbundle`)
// have ALL hyphens stripped; alt forms keep one dash between species and
// form suffix, with inner hyphens stripped (`charizard-mega-x` →
// `charizard-megax`).

/**
 * PokeAPI slugs for base species whose canonical name contains hyphens.
 * These need ALL hyphens stripped when targeting Showdown — `mr-mime` →
 * `mrmime`, NOT `mr-mime`.
 */
const COMPOUND_BASE_SPECIES = new Set<string>([
  'ho-oh',
  'mr-mime',
  'mime-jr',
  'mr-rime',
  'type-null',
  'porygon-z',
  'jangmo-o',
  'hakamo-o',
  'kommo-o',
  'tapu-koko',
  'tapu-lele',
  'tapu-bulu',
  'tapu-fini',
  'nidoran-f',
  'nidoran-m',
  // Gen 9 Paradox Pokémon (Past)
  'great-tusk',
  'scream-tail',
  'brute-bonnet',
  'flutter-mane',
  'slither-wing',
  'sandy-shocks',
  'roaring-moon',
  'walking-wake',
  'gouging-fire',
  'raging-bolt',
  // Gen 9 Paradox Pokémon (Future)
  'iron-treads',
  'iron-bundle',
  'iron-hands',
  'iron-jugulis',
  'iron-moth',
  'iron-thorns',
  'iron-valiant',
  'iron-leaves',
  'iron-crown',
  'iron-boulder',
  // Treasures of Ruin (SV)
  'wo-chien',
  'chien-pao',
  'ting-lu',
  'chi-yu',
]);

/**
 * PokeAPI slugs where the form suffix names the species' DEFAULT form —
 * Showdown drops the suffix entirely (`lycanroc-midday` → `lycanroc`).
 */
const DEFAULT_FORM_SLUGS: Record<string, string> = {
  'lycanroc-midday': 'lycanroc',
  'oricorio-baile': 'oricorio',
  'minior-red-meteor': 'minior',
  'mimikyu-disguised': 'mimikyu',
  'toxtricity-amped': 'toxtricity',
  'basculegion-male': 'basculegion',
  'indeedee-male': 'indeedee',
  'oinkologne-male': 'oinkologne',
};

/**
 * Convert a PokeAPI slug (e.g. `mr-mime`, `charizard-mega-x`) into the slug
 * Showdown's sprite mirror expects.
 */
export function pokeapiToShowdownSlug(pokeapiSlug: string): string {
  let s = pokeapiSlug.toLowerCase();

  const defaultForm = DEFAULT_FORM_SLUGS[s];
  if (defaultForm) return defaultForm;

  // Pikachu cap-forms drop the `-cap` suffix on Showdown
  // (`pikachu-original-cap` → `pikachu-original`).
  if (s.startsWith('pikachu-') && s.endsWith('-cap')) {
    s = s.slice(0, -'-cap'.length);
  }

  // No hyphens → already a single-token base species.
  if (!s.includes('-')) return s;

  // Compound base species → strip every hyphen.
  if (COMPOUND_BASE_SPECIES.has(s)) return s.replace(/-/g, '');

  // Compound base + form (rare but defensive): peel off the known compound
  // species, then treat the rest as the form.
  for (const base of COMPOUND_BASE_SPECIES) {
    if (s.startsWith(base + '-')) {
      const speciesPart = base.replace(/-/g, '');
      const formPart = s.slice(base.length + 1).replace(/-/g, '');
      return `${speciesPart}-${formPart}`;
    }
  }

  // Standard species-form slug. Split on the first dash; strip inner
  // hyphens from the form part.
  const firstDash = s.indexOf('-');
  const speciesPart = s.slice(0, firstDash);
  const formPart = s.slice(firstDash + 1).replace(/-/g, '');
  return `${speciesPart}-${formPart}`;
}

/**
 * Build the full Showdown sprite URL (gen-5 mini sprite, 96px static PNG).
 */
export function showdownSpriteUrl(pokeapiSlug: string): string {
  return `https://play.pokemonshowdown.com/sprites/gen5/${pokeapiToShowdownSlug(pokeapiSlug)}.png`;
}

/**
 * Build the animated variant (BW-style GIF). Neither set is complete —
 * `gen5ani` covers gens 1-5 + some DLC, `ani` covers most gen 6-9 — so chain
 * them via `onError` (gen5ani → ani → CSS motion) rather than trusting one.
 */
export function showdownAnimSpriteUrl(pokeapiSlug: string, set: 'gen5ani' | 'ani' = 'gen5ani') {
  return `https://play.pokemonshowdown.com/sprites/${set}/${pokeapiToShowdownSlug(pokeapiSlug)}.gif`;
}

/**
 * Species with a locally-built 2D pixel GIF in `public/sprites/anim/` —
 * assembled from PokeRogue / GBA fan spritesheets for Pokémon that Showdown
 * either only covers with 3D-model-style `ani` GIFs or not at all.
 */
const LOCAL_ANIM_SLUGS = new Set([
  'arcanine-hisui',
  'cinderace',
  'decidueye',
  'decidueye-hisui',
  'garganacl',
  'iron-bundle',
  'iron-jugulis',
  'iron-treads',
  'maushold-family-of-three',
  'meowscarada',
  'salazzle',
  'sneasler',
  'tinkaton',
  'typhlosion-hisui',
]);

/** URL of the local animated GIF for a slug, or null when we don't ship one. */
export function localAnimUrl(pokeapiSlug: string): string | null {
  if (!LOCAL_ANIM_SLUGS.has(pokeapiSlug)) return null;
  return `${import.meta.env.BASE_URL}sprites/anim/${pokeapiSlug}.gif`;
}
