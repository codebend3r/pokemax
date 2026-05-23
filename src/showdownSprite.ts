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
 * Convert a PokeAPI slug (e.g. `mr-mime`, `charizard-mega-x`) into the slug
 * Showdown's sprite mirror expects.
 */
export function pokeapiToShowdownSlug(pokeapiSlug: string): string {
  let s = pokeapiSlug.toLowerCase();

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
