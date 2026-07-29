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
  // Ride/travel poses of the box legendaries — cosmetic; use the base sprite.
  'koraidon-limited-build': 'koraidon',
  'koraidon-sprinting-build': 'koraidon',
  'koraidon-swimming-build': 'koraidon',
  'koraidon-gliding-build': 'koraidon',
  'miraidon-low-power-mode': 'miraidon',
  'miraidon-drive-mode': 'miraidon',
  'miraidon-aquatic-mode': 'miraidon',
  'miraidon-glide-mode': 'miraidon',
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
 * assembled from PokeRogue / GBA fan spritesheets, plus RetroNC's animated
 * gen-5-style sprites for gen 9 DLC legendaries and Legends Z-A megas.
 * Values are the GIF basename; forms that share art alias the same file.
 */
const LOCAL_ANIM_FILES: Record<string, string> = {
  'arcanine-hisui': 'arcanine-hisui',
  cinderace: 'cinderace',
  decidueye: 'decidueye',
  'decidueye-hisui': 'decidueye-hisui',
  garganacl: 'garganacl',
  'iron-bundle': 'iron-bundle',
  'iron-jugulis': 'iron-jugulis',
  'iron-treads': 'iron-treads',
  'maushold-family-of-three': 'maushold-family-of-three',
  meowscarada: 'meowscarada',
  salazzle: 'salazzle',
  sneasler: 'sneasler',
  tinkaton: 'tinkaton',
  'typhlosion-hisui': 'typhlosion-hisui',
  // Gen 9 DLC legendaries (RetroNC)
  ogerpon: 'ogerpon',
  'ogerpon-wellspring-mask': 'ogerpon',
  'ogerpon-hearthflame-mask': 'ogerpon',
  'ogerpon-cornerstone-mask': 'ogerpon',
  okidogi: 'okidogi',
  munkidori: 'munkidori',
  fezandipiti: 'fezandipiti',
  pecharunt: 'pecharunt',
  'iron-leaves': 'iron-leaves',
  'iron-boulder': 'iron-boulder',
  'iron-crown': 'iron-crown',
  // Legends Z-A megas (RetroNC)
  'zygarde-mega': 'zygarde-mega',
  'heatran-mega': 'heatran-mega',
  'darkrai-mega': 'darkrai-mega',
  'zeraora-mega': 'zeraora-mega',
  'baxcalibur-mega': 'baxcalibur-mega',
  'golisopod-mega': 'golisopod-mega',
  'meowstic-male-mega': 'meowstic-male-mega',
  'meowstic-female-mega': 'meowstic-male-mega',
  'magearna-mega': 'magearna-mega',
  'magearna-original-mega': 'magearna-mega',
};

/** URL of the local animated GIF for a slug, or null when we don't ship one. */
export function localAnimUrl(pokeapiSlug: string): string | null {
  const file = LOCAL_ANIM_FILES[pokeapiSlug];
  if (!file) return null;
  return `${import.meta.env.BASE_URL}sprites/anim/${file}.gif`;
}
