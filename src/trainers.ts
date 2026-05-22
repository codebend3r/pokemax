// Trainer browser data — types + curated fixture set.
//
// All fields below are the canonical contract. Other modules (`TrainerGrid`,
// `TrainerCard`, etc.) import from here. Pokémon / move / item slugs match
// PokeAPI conventions so they round-trip into the existing detail components.

export type GameId =
  | 'red-blue'
  | 'yellow'
  | 'gold-silver'
  | 'crystal'
  | 'ruby-sapphire'
  | 'emerald'
  | 'firered-leafgreen'
  | 'diamond-pearl'
  | 'platinum'
  | 'heartgold-soulsilver'
  | 'black-white'
  | 'black-2-white-2'
  | 'x-y'
  | 'omega-ruby-alpha-sapphire'
  | 'sun-moon'
  | 'ultra-sun-ultra-moon'
  | 'lets-go'
  | 'sword-shield'
  | 'brilliant-diamond-shining-pearl'
  | 'legends-arceus'
  | 'scarlet-violet';

export const GAME_LABELS: Record<GameId, string> = {
  'red-blue': 'Red / Blue',
  yellow: 'Yellow',
  'gold-silver': 'Gold / Silver',
  crystal: 'Crystal',
  'ruby-sapphire': 'Ruby / Sapphire',
  emerald: 'Emerald',
  'firered-leafgreen': 'FireRed / LeafGreen',
  'diamond-pearl': 'Diamond / Pearl',
  platinum: 'Platinum',
  'heartgold-soulsilver': 'HeartGold / SoulSilver',
  'black-white': 'Black / White',
  'black-2-white-2': 'Black 2 / White 2',
  'x-y': 'X / Y',
  'omega-ruby-alpha-sapphire': 'Omega Ruby / Alpha Sapphire',
  'sun-moon': 'Sun / Moon',
  'ultra-sun-ultra-moon': 'Ultra Sun / Ultra Moon',
  'lets-go': "Let's Go Pikachu / Eevee",
  'sword-shield': 'Sword / Shield',
  'brilliant-diamond-shining-pearl': 'Brilliant Diamond / Shining Pearl',
  'legends-arceus': 'Legends: Arceus',
  'scarlet-violet': 'Scarlet / Violet',
};

export interface TrainerPokemon {
  /** PokeAPI species slug, e.g. `pikachu`. */
  species: string;
  level: number;
  /** PokeAPI move slugs (up to 4). */
  moves?: string[];
  /** PokeAPI item slug. */
  item?: string;
  /** PokeAPI ability slug. */
  ability?: string;
  /** PokeAPI nature slug. */
  nature?: string;
}

export interface Trainer {
  /** Stable slug, e.g. `rb-brock`. */
  id: string;
  name: string;
  /** Free-form class label — `Gym Leader`, `Elite Four`, `Champion`, `Rival`, `Team Boss`, etc. */
  trainerClass: string;
  game: GameId;
  /** Where they're fought, e.g. `Pewter City Gym`. */
  location?: string;
  /** VS-portrait URL. Optional — list cards fall back to a class glyph. */
  spriteUrl?: string;
  team: TrainerPokemon[];
}

/**
 * Curated demo set. The real ingestion (Bulbapedia / veekun) lands later;
 * for now this is enough to validate the UI shape across multiple gens and
 * classes.
 */
export const TRAINERS: Trainer[] = [
  {
    id: 'rb-brock',
    name: 'Brock',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Pewter City Gym',
    team: [
      { species: 'geodude', level: 12, moves: ['tackle', 'defense-curl'] },
      { species: 'onix', level: 14, moves: ['tackle', 'bide'] },
    ],
  },
  {
    id: 'rb-misty',
    name: 'Misty',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Cerulean City Gym',
    team: [
      { species: 'staryu', level: 18, moves: ['tackle', 'water-gun'] },
      { species: 'starmie', level: 21, moves: ['water-gun', 'harden', 'tackle', 'bubble-beam'] },
    ],
  },
  {
    id: 'rb-lance',
    name: 'Lance',
    trainerClass: 'Elite Four',
    game: 'red-blue',
    location: 'Indigo Plateau',
    team: [
      { species: 'gyarados', level: 56, moves: ['hydro-pump', 'bite', 'dragon-rage', 'leer'] },
      {
        species: 'dragonair',
        level: 54,
        moves: ['agility', 'slam', 'thunder-wave', 'dragon-rage'],
      },
      {
        species: 'dragonair',
        level: 54,
        moves: ['agility', 'slam', 'thunder-wave', 'dragon-rage'],
      },
      { species: 'aerodactyl', level: 58, moves: ['take-down', 'bite', 'fly', 'hyper-beam'] },
      {
        species: 'dragonite',
        level: 60,
        moves: ['hyper-beam', 'agility', 'wing-attack', 'fire-blast'],
      },
    ],
  },
  {
    id: 'gs-whitney',
    name: 'Whitney',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Goldenrod City Gym',
    team: [
      { species: 'clefairy', level: 17, moves: ['mimic', 'encore', 'doubleslap', 'metronome'] },
      { species: 'miltank', level: 19, moves: ['rollout', 'attract', 'stomp', 'milk-drink'] },
    ],
  },
  {
    id: 'dp-cynthia',
    name: 'Cynthia',
    trainerClass: 'Champion',
    game: 'diamond-pearl',
    location: 'Pokémon League',
    team: [
      {
        species: 'spiritomb',
        level: 58,
        ability: 'pressure',
        moves: ['dark-pulse', 'psychic', 'shadow-ball', 'embargo'],
      },
      {
        species: 'roserade',
        level: 58,
        ability: 'natural-cure',
        moves: ['shadow-ball', 'sludge-bomb', 'energy-ball', 'extrasensory'],
      },
      {
        species: 'togekiss',
        level: 60,
        ability: 'serene-grace',
        moves: ['air-slash', 'aura-sphere', 'water-pulse', 'thunder-wave'],
      },
      {
        species: 'lucario',
        level: 60,
        ability: 'inner-focus',
        moves: ['aura-sphere', 'dragon-pulse', 'psychic', 'earthquake'],
      },
      {
        species: 'milotic',
        level: 58,
        ability: 'marvel-scale',
        moves: ['surf', 'ice-beam', 'mirror-coat', 'aqua-ring'],
      },
      {
        species: 'garchomp',
        level: 62,
        ability: 'sand-veil',
        item: 'sitrus-berry',
        moves: ['dragon-rush', 'earthquake', 'brick-break', 'giga-impact'],
      },
    ],
  },
  {
    id: 'bw-n',
    name: 'N',
    trainerClass: 'Team Boss',
    game: 'black-white',
    location: 'N’s Castle',
    team: [
      {
        species: 'zekrom',
        level: 50,
        ability: 'teravolt',
        moves: ['fusion-bolt', 'dragon-claw', 'imprison', 'zen-headbutt'],
      },
      {
        species: 'carracosta',
        level: 50,
        ability: 'solid-rock',
        moves: ['waterfall', 'crunch', 'aqua-jet', 'stone-edge'],
      },
      {
        species: 'vanilluxe',
        level: 50,
        ability: 'ice-body',
        moves: ['blizzard', 'ice-beam', 'mirror-shot', 'flash-cannon'],
      },
      {
        species: 'archeops',
        level: 50,
        ability: 'defeatist',
        moves: ['acrobatics', 'dragon-claw', 'crunch', 'endeavor'],
      },
      {
        species: 'klinklang',
        level: 50,
        ability: 'plus',
        moves: ['gear-grind', 'thunderbolt', 'flash-cannon', 'shift-gear'],
      },
      {
        species: 'zoroark',
        level: 50,
        ability: 'illusion',
        moves: ['night-daze', 'flamethrower', 'foul-play', 'grass-knot'],
      },
    ],
  },
  {
    id: 'swsh-leon',
    name: 'Leon',
    trainerClass: 'Champion',
    game: 'sword-shield',
    location: 'Wyndon Stadium',
    team: [
      {
        species: 'aegislash',
        level: 62,
        ability: 'stance-change',
        item: 'leftovers',
        moves: ['shadow-ball', 'shadow-sneak', 'iron-head', 'kings-shield'],
      },
      {
        species: 'dragapult',
        level: 62,
        ability: 'clear-body',
        item: 'lum-berry',
        moves: ['dragon-darts', 'phantom-force', 'fire-blast', 'thunderbolt'],
      },
      {
        species: 'haxorus',
        level: 63,
        ability: 'mold-breaker',
        item: 'focus-sash',
        moves: ['outrage', 'earthquake', 'poison-jab', 'iron-tail'],
      },
      {
        species: 'rhyperior',
        level: 64,
        ability: 'rock-head',
        item: 'weakness-policy',
        moves: ['rock-wrecker', 'high-horsepower', 'megahorn', 'heat-crash'],
      },
      {
        species: 'mr-rime',
        level: 64,
        ability: 'tangled-feet',
        item: 'never-melt-ice',
        moves: ['ice-beam', 'psychic', 'focus-blast', 'teleport'],
      },
      {
        species: 'charizard',
        level: 65,
        ability: 'blaze',
        item: 'charcoal',
        moves: ['max-airstream', 'fire-blast', 'air-slash', 'solar-beam'],
      },
    ],
  },
  {
    id: 'sv-nemona',
    name: 'Nemona',
    trainerClass: 'Rival',
    game: 'scarlet-violet',
    location: 'Poco Path Lighthouse',
    team: [
      {
        species: 'pawmot',
        level: 65,
        ability: 'volt-absorb',
        moves: ['close-combat', 'double-shock', 'play-rough', 'thunder-punch'],
      },
      {
        species: 'orthworm',
        level: 65,
        ability: 'earth-eater',
        moves: ['iron-head', 'mud-shot', 'rock-slide', 'body-press'],
      },
      {
        species: 'dudunsparce',
        level: 65,
        ability: 'serene-grace',
        moves: ['boomburst', 'glare', 'drill-run', 'coil'],
      },
      {
        species: 'lycanroc',
        level: 65,
        ability: 'tough-claws',
        moves: ['accelerock', 'crunch', 'stone-edge', 'psychic-fangs'],
      },
      {
        species: 'goodra',
        level: 65,
        ability: 'sap-sipper',
        moves: ['draco-meteor', 'fire-blast', 'sludge-bomb', 'thunderbolt'],
      },
      {
        species: 'koraidon',
        level: 66,
        ability: 'orichalcum-pulse',
        moves: ['collision-course', 'flare-blitz', 'drain-punch', 'breaking-swipe'],
      },
    ],
  },
];
