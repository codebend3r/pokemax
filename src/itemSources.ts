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

  // ── Competitive hold items ──────────────────────────────────────────────────
  'assault-vest': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Mesagoza store, after Champion rank.' },
  ],
  'weakness-policy': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 20 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Levincia store.' },
  ],
  'loaded-dice': [
    { game: 'scarlet-violet', where: 'Delibird Presents — Levincia store after mid-game.' },
  ],
  'booster-energy': [
    {
      game: 'scarlet-violet',
      where: 'Area Zero — scattered on the ground inside the Zero Lab crater.',
    },
  ],
  'clear-amulet': [
    { game: 'scarlet-violet', where: 'Delibird Presents — Cascarrafa store after Champion rank.' },
  ],
  'covert-cloak': [{ game: 'scarlet-violet', where: 'Delibird Presents — Cascarrafa store.' }],
  'mirror-herb': [
    { game: 'scarlet-violet', where: 'Delibird Presents — Cascarrafa store after Champion rank.' },
  ],
  'room-service': [{ game: 'sword-shield', where: 'Hammerlocke Pokémon Center — 50 BP.' }],
  'heavy-duty-boots': [
    { game: 'sword-shield', where: 'Wild Pokémon held item or Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Levincia store.' },
  ],
  'terrain-extender': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Levincia store.' },
  ],
  'expert-belt': [
    { game: 'diamond-pearl', where: 'Route 221 — held by a wild Sandslash.' },
    { game: 'sword-shield', where: 'Battle Tower BP shop — 25 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Mesagoza store.' },
  ],
  'wide-lens': [
    { game: 'diamond-pearl', where: 'Route 225 — held by wild Yanmega.' },
    { game: 'sword-shield', where: 'Hammerlocke Pokémon Center — 10 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Cascarrafa store.' },
  ],
  'scope-lens': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 10 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Mesagoza store.' },
  ],
  'kings-rock': [
    { game: 'gold-silver', where: 'Slowpoke Well — held by wild Slowpoke.' },
    { game: 'multiple', where: 'Held by wild Poliwhirl or Slowbro (5% chance).' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Cascarrafa store.' },
  ],
  'light-clay': [
    { game: 'diamond-pearl', where: 'Route 206 — held by wild Bronzor (5%).' },
    { game: 'sword-shield', where: 'Battle Tower BP shop — 10 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Levincia store.' },
  ],
  'mental-herb': [
    { game: 'sword-shield', where: 'Wild Area Pokémon held item / Battle Tower — 10 BP.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — Cascarrafa store.' },
  ],

  // ── Evolution stones ────────────────────────────────────────────────────────
  'fire-stone': [
    {
      game: 'red-blue',
      where: 'Celadon Department Store, 4F — 2100 poke-dollars.',
      buy: 2100,
    },
    { game: 'gold-silver', where: "Burned Tower — hidden item; Bill's grandfather gift." },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    {
      game: 'scarlet-violet',
      where: 'Delibird Presents — all branches; found on South Province paths.',
    },
  ],
  'water-stone': [
    {
      game: 'red-blue',
      where: 'Celadon Department Store, 4F — 2100 poke-dollars.',
      buy: 2100,
    },
    { game: 'gold-silver', where: "Bill's grandfather gift; hidden in Whirl Islands." },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'thunder-stone': [
    {
      game: 'red-blue',
      where: 'Celadon Department Store, 4F — 2100 poke-dollars.',
      buy: 2100,
    },
    { game: 'gold-silver', where: "Bill's grandfather gift; Route 10 hidden item." },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'leaf-stone': [
    {
      game: 'red-blue',
      where: 'Celadon Department Store, 4F — 2100 poke-dollars.',
      buy: 2100,
    },
    { game: 'gold-silver', where: "Bill's grandfather gift." },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'moon-stone': [
    { game: 'red-blue', where: 'Mt. Moon — held by wild Clefairy; hidden items throughout.' },
    { game: 'gold-silver', where: 'Mt. Moon — Monday-night wild Clefairy gathering; Tohjo Falls.' },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'sun-stone': [
    { game: 'gold-silver', where: 'Pokeathlon Dome (3000 points) or held by wild Sunkern.' },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'dusk-stone': [
    { game: 'diamond-pearl', where: 'Galactic Warehouse (Veilstone) — hidden on the ground.' },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'dawn-stone': [
    { game: 'diamond-pearl', where: 'Mt. Coronet peak — hidden item near the summit.' },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'shiny-stone': [
    { game: 'diamond-pearl', where: "Iron Island — gift from Riley's aide; rare hidden item." },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    { game: 'scarlet-violet', where: 'Delibird Presents — all branches.' },
  ],
  'ice-stone': [
    { game: 'sun-moon', where: 'Po Town — hidden item on the ground.' },
    { game: 'sword-shield', where: 'Lake of Outrage — ore deposit; Digging Duo chance.' },
    {
      game: 'scarlet-violet',
      where: 'Delibird Presents — all branches; North Province snowy area.',
    },
  ],

  // ── Mega Stones ──────────────────────────────────────────────────────────────
  'charizardite-x': [
    { game: 'x-y', where: 'Pokémon Village — hidden item after defeating the Elite Four.' },
    { game: 'omega-ruby-alpha-sapphire', where: 'Not obtainable; version-exclusive to X.' },
  ],
  'charizardite-y': [
    {
      game: 'x-y',
      where: 'Pokémon Village — hidden item after defeating the Elite Four (Y version).',
    },
    { game: 'omega-ruby-alpha-sapphire', where: 'Not obtainable; version-exclusive to Y.' },
  ],
  lucarionite: [
    {
      game: 'x-y',
      where: 'Shalour City Tower of Mastery — gift from Korrina after the Lucario event.',
    },
    { game: 'omega-ruby-alpha-sapphire', where: 'Granite Cave — held by the Lucario from Steven.' },
  ],
  garchompite: [
    { game: 'x-y', where: 'Pokémon Village — hidden item, requires Dowsing Machine post-game.' },
    {
      game: 'omega-ruby-alpha-sapphire',
      where: 'Fortree City — gift from a Sky Pillar NPC post-game.',
    },
  ],
  salamencite: [
    {
      game: 'omega-ruby-alpha-sapphire',
      where: 'Sky Pillar — hidden item on the rooftop after the story.',
    },
  ],

  // ── Competitive berries ───────────────────────────────────────────────────────
  'sitrus-berry': [
    { game: 'multiple', where: 'Sold at Berry vendors; held by many wild Pokémon (5%).' },
    { game: 'gold-silver', where: 'Gold Berry — held by various wild Pokémon; found on trees.' },
    {
      game: 'scarlet-violet',
      where: 'Berry trees scattered across Paldea; Delibird Presents — all branches.',
      buy: 200,
    },
  ],
  'lum-berry': [
    { game: 'multiple', where: 'Berry trees in most mainline games; held by wild Pokémon.' },
    {
      game: 'scarlet-violet',
      where: 'Berry trees in South Province (Area Two) and elsewhere in Paldea.',
    },
  ],
  'petaya-berry': [
    {
      game: 'multiple',
      where: 'Rare — held by wild Pokémon in certain games; Battle Frontier rewards.',
    },
    {
      game: 'scarlet-violet',
      where: 'Porto Marinada auction or gift from NPCs in Paldea post-game.',
    },
  ],
  'liechi-berry': [
    {
      game: 'multiple',
      where: 'Rare — held by wild Pokémon in certain games; Battle Frontier rewards.',
    },
    {
      game: 'scarlet-violet',
      where: 'Porto Marinada auction or gift from NPCs in Paldea post-game.',
    },
  ],

  // ── Recovery / status items ───────────────────────────────────────────────────
  revive: [
    {
      game: 'red-blue',
      where: 'Pokémon Mart (most towns, mid-game) — 1500 poke-dollars.',
      buy: 1500,
    },
    {
      game: 'multiple',
      where: 'Standard Pokémon Mart stock across all mainline games.',
      buy: 1500,
    },
  ],
  'max-revive': [
    { game: 'red-blue', where: 'Various hidden items; not sold in shops.' },
    { game: 'multiple', where: 'Hidden items scattered across many games; not purchasable.' },
  ],
  'super-potion': [
    {
      game: 'red-blue',
      where: 'Pokémon Mart (Cerulean City onward) — 700 poke-dollars.',
      buy: 700,
    },
    { game: 'multiple', where: 'Standard Pokémon Mart stock across all mainline games.', buy: 700 },
  ],
  'hyper-potion': [
    {
      game: 'red-blue',
      where: 'Pokémon Mart (Celadon City onward) — 1200 poke-dollars.',
      buy: 1200,
    },
    {
      game: 'multiple',
      where: 'Standard Pokémon Mart stock across all mainline games.',
      buy: 1200,
    },
  ],
  'max-potion': [
    {
      game: 'red-blue',
      where: 'Pokémon Mart (Fuchsia City onward) — 2500 poke-dollars.',
      buy: 2500,
    },
    { game: 'multiple', where: 'Standard Pokémon Mart stock in most mainline games.', buy: 2500 },
  ],
  'full-heal': [
    {
      game: 'red-blue',
      where: 'Pokémon Mart (Lavender Town onward) — 600 poke-dollars.',
      buy: 600,
    },
    { game: 'multiple', where: 'Standard Pokémon Mart stock across all mainline games.', buy: 600 },
  ],
  'full-restore': [
    {
      game: 'red-blue',
      where: 'Pokémon Mart (Viridian City / Cinnabar onward) — 3000 poke-dollars.',
      buy: 3000,
    },
    { game: 'multiple', where: 'Standard Pokémon Mart stock in most mainline games.', buy: 3000 },
  ],

  // ── Additional TMs ───────────────────────────────────────────────────────────
  'tm-flamethrower': [
    { game: 'red-blue', where: 'Celadon Game Corner — 4500 coins (TM35).' },
    { game: 'gold-silver', where: 'Goldenrod Department Store — 5500 poke-dollars.', buy: 5500 },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Litleo/Houndour unlock.',
      crafting: {
        lp: 12000,
        materials: [
          { item: 'litleo-fur', count: 3 },
          { item: 'numel-lava', count: 3 },
        ],
      },
    },
  ],
  'tm-psychic': [
    { game: 'red-blue', where: 'Saffron City — gift from a Silph Co. employee.' },
    { game: 'gold-silver', where: 'Goldenrod Department Store — 3500 poke-dollars.', buy: 3500 },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Ralts/Gothita unlock.',
      crafting: {
        lp: 12000,
        materials: [
          { item: 'gothita-eyelash', count: 3 },
          { item: 'ralts-dust', count: 3 },
        ],
      },
    },
  ],
  'tm-toxic': [
    { game: 'red-blue', where: 'Fuchsia City — gift from Koga after defeating him.' },
    { game: 'gold-silver', where: 'Goldenrod Department Store basement sale.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Seviper/Ekans unlock.',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'ekans-fang', count: 3 },
          { item: 'seviper-fang', count: 3 },
        ],
      },
    },
  ],
  'tm-rest': [
    { game: 'red-blue', where: 'Celadon Department Store, rooftop — gift from a man upstairs.' },
    { game: 'sword-shield', where: 'Turffield Pokémon Center — purchased for 10 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center.',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'komala-claw', count: 3 },
          { item: 'jigglypuff-fur', count: 3 },
        ],
      },
    },
  ],
  'tm-substitute': [
    { game: 'red-blue', where: 'Pokémon Mansion (Cinnabar Island) — hidden item.' },
    { game: 'sword-shield', where: 'Wild Area Pokémon Center — 50 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center.',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'mimikyu-scrap', count: 3 },
          { item: 'ditto-goo', count: 3 },
        ],
      },
    },
  ],
  'tm-protect': [
    { game: 'gold-silver', where: 'Goldenrod Department Store — sold on the 4F.' },
    { game: 'sword-shield', where: 'Any Pokémon Center — 30 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center (one of the earliest unlocks).',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'silcoon-shed', count: 3 },
          { item: 'snom-thread', count: 3 },
        ],
      },
    },
  ],
  'tm-stealth-rock': [
    { game: 'diamond-pearl', where: 'Oreburgh Gate — gift from the Hiker after the first gym.' },
    { game: 'sword-shield', where: 'Wild Area Pokémon Center — 30 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Nacli unlock.',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'nacli-salt', count: 3 },
          { item: 'rockruff-rock', count: 3 },
        ],
      },
    },
  ],
  'tm-u-turn': [
    { game: 'diamond-pearl', where: 'Veilstone Game Corner — 4000 coins.' },
    { game: 'sword-shield', where: 'Battle Tower BP shop — 20 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Lokix/Nymble unlock.',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'nymble-claw', count: 3 },
          { item: 'lokix-leg', count: 3 },
        ],
      },
    },
  ],
  'tm-knock-off': [
    { game: 'sword-shield', where: 'Battle Tower BP shop — 20 BP.' },
    {
      game: 'scarlet-violet',
      where: 'Craft at any Pokémon Center after the Meowth/Stunky unlock.',
      crafting: {
        lp: 10000,
        materials: [
          { item: 'meowth-fur', count: 3 },
          { item: 'stunky-fur', count: 3 },
        ],
      },
    },
  ],
  'tm-tera-blast': [
    {
      game: 'scarlet-violet',
      where: 'Academy — gift from Salvatore (Languages teacher) after raising Tera Raid rank.',
    },
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
