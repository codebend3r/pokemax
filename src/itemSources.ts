import type { GameId } from '@/trainers';
import { GAME_LABELS } from '@/trainers';

export interface CraftingRecipe {
  /** League Points cost (SV style). */
  lp: number;
  /** Material ingredients — `item` is the PokeAPI item slug if applicable, else a free-form name. */
  materials: { item: string; count: number }[];
}

export interface ItemSource {
  /** Which game this source applies to. Use `multiple` if the source is truly cross-game (e.g. a long-running gift). */
  game: GameId | 'multiple';
  /** Free-form location / method. */
  where?: string;
  /** Buy price in poke-dollars, if sold somewhere. */
  buy?: number;
  /** SV-style crafting recipe — only set when the item can be crafted (e.g. SV TMs). */
  crafting?: CraftingRecipe;
}

/**
 * Curated acquisition data for noteworthy items + TMs. Keys are PokeAPI item
 * slugs (e.g. `master-ball`, `tm-thunderbolt`). Expand any time — items not
 * in this map simply don't show an OBTAIN section.
 */
export const ITEM_SOURCES: Record<string, ItemSource[]> = {
  'master-ball': [
    { game: 'red-blue', where: 'Silph Co. — gift from the president after defeating Giovanni.' },
    { game: 'gold-silver', where: 'Radio Tower — gift from Prof. Elm’s aide.' },
    { game: 'scarlet-violet', where: 'Academy Ace Tournament — guaranteed prize after first win.' },
  ],
  'rare-candy': [
    { game: 'multiple', where: 'Hidden in many caves and routes across every mainline game.' },
    { game: 'red-blue', where: '`Mt. Moon` and `Cerulean Cave` (hidden items).' },
    { game: 'scarlet-violet', where: 'Pickup ability, raid rewards, hidden across Paldea.' },
  ],
  leftovers: [
    { game: 'multiple', where: 'Wild Snorlax / Munchlax held item (5% chance).' },
    { game: 'red-blue', where: 'Held by the Snorlax on Route 12 / 16.' },
    { game: 'sword-shield', where: 'Pokémon Center BP shop — 25 BP.' },
  ],
  'life-orb': [
    { game: 'platinum', where: 'Pokémon Mansion garden — pickup post-game.' },
    { game: 'sword-shield', where: 'Hammerlocke Pokémon Center — 25 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Delibird Presents stores — purchasable after Champion rank.',
    },
  ],
  'choice-band': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Mesagoza store.' },
  ],
  'choice-specs': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Mesagoza store.' },
  ],
  'choice-scarf': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Mesagoza store.' },
  ],
  'focus-sash': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents store.' },
  ],
  eviolite: [
    { game: 'black-2-white-2', where: 'Black Tower / White Treehollow reward.' },
    { game: 'sword-shield', where: 'Hammerlocke Pokémon Center — 50 BP.' },
    { game: 'scarlet-violet', where: 'Porto Marinada auction (variable price).' },
  ],
  'lucky-egg': [
    { game: 'red-blue', where: 'Held by wild Chansey (5% chance).' },
    {
      game: 'sword-shield',
      where: 'Wedgehurst Pokémon Center — gift from a researcher after Dex milestones.',
    },
  ],
  'amulet-coin': [
    { game: 'red-blue', where: 'Route 16 — gift from a man in the gatehouse.' },
    { game: 'sword-shield', where: 'Motostoke Pokémon Center — gift after first gym.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — purchasable after midgame.' },
  ],
  'tm-thunderbolt': [
    { game: 'red-blue', where: 'Vermilion City — gift from Lt. Surge after defeating him.' },
    { game: 'gold-silver', where: 'Goldenrod Department Store — 3000 Game Corner coins.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center.',
      crafting: {
        lp: 12000,
        materials: [
          { item: 'magnemite-coil', count: 3 },
          { item: 'pawmi-fur', count: 3 },
        ],
      },
    },
  ],
  'tm-ice-beam': [
    { game: 'red-blue', where: 'Celadon Game Corner — 4000 coins (TM13).' },
    { game: 'sword-shield', where: 'Circhester Pokémon Center — 50 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Cetitan TM unlock.',
      crafting: {
        lp: 12000,
        materials: [
          { item: 'cetoddle-milk', count: 3 },
          { item: 'snom-thread', count: 3 },
        ],
      },
    },
  ],
  'tm-fire-blast': [
    { game: 'red-blue', where: 'Mt. Ember (FR/LG) / Victory Road — hidden item.' },
    { game: 'sword-shield', where: 'Hammerlocke Pokémon Center — 50 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft after defeating Iono.',
      crafting: {
        lp: 15000,
        materials: [
          { item: 'litleo-fur', count: 3 },
          { item: 'fletchling-feather', count: 3 },
        ],
      },
    },
  ],
  'tm-earthquake': [
    { game: 'red-blue', where: 'Silph Co. 9F — hidden item / Viridian Gym gift from Giovanni.' },
    {
      game: 'scarlet-violet',
      where: 'Craft after defeating Grusha (Glaseado).',
      crafting: {
        lp: 15000,
        materials: [
          { item: 'diglett-dirt', count: 3 },
          { item: 'phanpy-tusk', count: 3 },
        ],
      },
    },
  ],
  'tm-surf': [
    {
      game: 'red-blue',
      where: 'Safari Zone Secret House — Warden gift after returning his teeth.',
    },
    {
      game: 'gold-silver',
      where: 'Ecruteak City — gift from the Kimono Girl after the Dance Theater event.',
    },
    {
      game: 'scarlet-violet',
      where: 'Not a TM in SV; replaced by Surf as an HM-style move taught via tutor.',
    },
  ],
  'razor-claw': [
    {
      game: 'diamond-pearl',
      where: 'Victory Road — Battle Frontier purchase / wild Sneasel held item.',
    },
    { game: 'sword-shield', where: 'Crown Tundra — Frostpoint Field.' },
  ],
  'razor-fang': [
    {
      game: 'diamond-pearl',
      where: 'Route 214 — won from the Battle Park / wild Gligar held item.',
    },
    { game: 'sword-shield', where: 'Crown Tundra — Slippery Slope wild Gligar.' },
  ],
  'destiny-knot': [
    { game: 'platinum', where: 'Veilstone Department Store — Tuesday-only sale.' },
    {
      game: 'scarlet-violet',
      where: 'Delibird Presents — purchasable after midgame; also held by wild Luvdisc.',
    },
  ],
  'ability-patch': [
    { game: 'sword-shield', where: 'Max Raid den rare reward (Dynamax Adventures).' },
    { game: 'scarlet-violet', where: '6-star Tera Raid reward.' },
  ],
};

/**
 * Convert an `ItemSource[]` into displayable rows. Helper used by the UI to
 * format the game label uniformly.
 */
export function formatSourceLine(src: ItemSource): string {
  if (src.game === 'multiple') return 'Multiple games';
  return GAME_LABELS[src.game];
}
