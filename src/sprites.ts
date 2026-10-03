// Every Pokémon sprite URL the app renders, as ordered candidate lists — the
// first that loads wins (`useFallbackSrc`). Each list's order is a product
// decision (see the comments); the hosts and conventions live only here.
import { pokeapiToShowdownSlug } from '@/showdownSprite';
import type { Dimension } from '@/routes';
import type { PokemonResponse } from '@/types';

const POKEAPI = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const BW_ANIMATED = `${POKEAPI}/versions/generation-v/black-white/animated`;
// PokeAPI's mirror of Showdown's animated GIFs, indexed by id.
const POKEAPI_SHOWDOWN = `${POKEAPI}/other/showdown`;
// Frame-animated fan sprites in 5th-gen BW pixel-art style, mirrored by
// Pokémon Showdown. `ani/` is the main Smogon Sprite Project set; `gen5ani/`
// is an older alternate set that covers some newer DLC/legendary additions
// (e.g. Terapagos, Miraidon) that `ani/` doesn't have yet.
const SHOWDOWN = 'https://play.pokemonshowdown.com/sprites';
/** Black/White's animated sprites cover the national dex through #649. */
const MAX_BW_ID = 649;

export interface SpriteSource {
  url: string;
  /** True when the image is a real frame-animated GIF. */
  animated: boolean;
}

function showdownSet(set: 'ani' | 'gen5ani', shiny: boolean, name: string): string {
  return `${SHOWDOWN}/${set}${shiny ? '-shiny' : ''}/${pokeapiToShowdownSlug(name)}.gif`;
}

/** PokeAPI's Showdown-mirror GIF for a Pokémon id. */
export function pokeapiShowdownGif(id: number, shiny = false): string {
  return `${POKEAPI_SHOWDOWN}${shiny ? '/shiny' : ''}/${id}.gif`;
}

/** Gen 5 mini sprite — a 96px static PNG from Showdown, by PokeAPI slug. */
export function showdownSpriteUrl(name: string): string {
  return `${SHOWDOWN}/gen5/${pokeapiToShowdownSlug(name)}.png`;
}

/**
 * The detail card's sprite, best first. 2D lists ONLY frame-animated pixel
 * art — the card hides the 2D toggle when none of it loads, so there is no
 * static fallback. 3D ends in official artwork, which stays truly static and
 * should only ever show for the handful of forms with no animated source.
 */
export function cardSprites(p: PokemonResponse, shiny: boolean, view: Dimension): SpriteSource[] {
  // Locally-shipped GIFs have no shiny variants.
  const local = shiny ? null : localAnimUrl(p.name);
  const animated = (url: string): SpriteSource => ({ url, animated: true });
  if (view === '2d') {
    return [
      ...(local ? [animated(local)] : []),
      // Gen 1-5: BW animated pixel art — the iconic 2D look. Gen 6+: PokeAPI's Showdown mirror.
      animated(
        p.id <= MAX_BW_ID
          ? `${BW_ANIMATED}${shiny ? '/shiny' : ''}/${p.id}.gif`
          : pokeapiShowdownGif(p.id, shiny),
      ),
      // Smogon Sprite Project — covers most Gen 6-9 forms, Gmax / Eternamax included.
      animated(showdownSet('ani', shiny, p.name)),
      // The older set — has newer DLC additions `ani/` hasn't picked up yet.
      animated(showdownSet('gen5ani', shiny, p.name)),
    ];
  }
  const art = p.sprites.other['official-artwork'];
  return [
    animated(pokeapiShowdownGif(p.id, shiny)),
    animated(showdownSet('ani', shiny, p.name)),
    // A locally-shipped GIF beats a static image even in 3D.
    ...(local ? [animated(local)] : []),
    {
      url: shiny
        ? (art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? '')
        : (art.front_default ?? p.sprites.front_default ?? ''),
      animated: false,
    },
  ];
}

/** Grid cell still: the static pixel sprite, else the parent species' (forms often lack one). */
export function gridStills(id: number, parentId?: number): string[] {
  return [`${POKEAPI}/${id}.png`, ...(parentId ? [`${POKEAPI}/${parentId}.png`] : [])];
}

/** Grid cell hover animation, else the parent species' animation. */
export function gridAnimations(id: number, parentId?: number): string[] {
  return [
    id <= MAX_BW_ID ? `${BW_ANIMATED}/${id}.gif` : pokeapiShowdownGif(id),
    ...(parentId ? [pokeapiShowdownGif(parentId)] : []),
  ];
}

/**
 * Small team-pick animation: local 2D → `gen5ani` → `ani`. Neither Showdown
 * set is complete; past the end, CSS bounce on the still takes over.
 */
export function teamPickAnimations(name: string): string[] {
  const local = localAnimUrl(name);
  return [
    ...(local ? [local] : []),
    showdownSet('gen5ani', false, name),
    showdownSet('ani', false, name),
  ];
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
function localAnimUrl(pokeapiSlug: string): string | null {
  const file = LOCAL_ANIM_FILES[pokeapiSlug];
  if (!file) return null;
  return `${import.meta.env.BASE_URL}sprites/anim/${file}.gif`;
}
