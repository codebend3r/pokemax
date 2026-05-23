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
 * Milestone-fight trainers across Gen I–IX.
 * Includes every Gym Leader, Elite Four member, Champion, main Rival, and
 * narrative Team Boss. Route trainers, grunts, and Frontier Brains excluded.
 */
export const TRAINERS: Trainer[] = [
  // ─── Red / Blue ────────────────────────────────────────────────────────────
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
    id: 'rb-lt-surge',
    name: 'Lt. Surge',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Vermilion City Gym',
    team: [
      { species: 'voltorb', level: 21, moves: ['tackle', 'screech', 'sonicboom'] },
      { species: 'pikachu', level: 18, moves: ['thundershock', 'growl', 'thunder-wave'] },
      { species: 'raichu', level: 24, moves: ['thunderbolt', 'thunder-wave', 'quick-attack'] },
    ],
  },
  {
    id: 'rb-erika',
    name: 'Erika',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Celadon City Gym',
    team: [
      { species: 'victreebel', level: 29, moves: ['razor-leaf', 'sleep-powder', 'wrap'] },
      { species: 'tangela', level: 24, moves: ['constrict', 'sleep-powder', 'bind'] },
      { species: 'vileplume', level: 29, moves: ['petal-dance', 'sleep-powder', 'mega-drain'] },
    ],
  },
  {
    id: 'rb-koga',
    name: 'Koga',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Fuchsia City Gym',
    team: [
      { species: 'koffing', level: 37, moves: ['smog', 'smokescreen', 'tackle'] },
      { species: 'muk', level: 39, moves: ['minimize', 'sludge', 'smokescreen'] },
      { species: 'koffing', level: 37, moves: ['smog', 'smokescreen', 'tackle'] },
      { species: 'weezing', level: 43, moves: ['toxic', 'smog', 'smokescreen', 'self-destruct'] },
    ],
  },
  {
    id: 'rb-sabrina',
    name: 'Sabrina',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Saffron City Gym',
    team: [
      { species: 'kadabra', level: 38, moves: ['psybeam', 'disable', 'psych-up'] },
      { species: 'mr-mime', level: 37, moves: ['psybeam', 'barrier', 'meditate'] },
      { species: 'venomoth', level: 38, moves: ['psybeam', 'sleep-powder', 'leech-life'] },
      { species: 'alakazam', level: 43, moves: ['psychic', 'recover', 'psybeam', 'reflect'] },
    ],
  },
  {
    id: 'rb-blaine',
    name: 'Blaine',
    trainerClass: 'Gym Leader',
    game: 'red-blue',
    location: 'Cinnabar Island Gym',
    team: [
      { species: 'growlithe', level: 42, moves: ['ember', 'leer', 'bite'] },
      { species: 'ponyta', level: 40, moves: ['ember', 'tail-whip', 'stomp'] },
      { species: 'rapidash', level: 42, moves: ['fire-spin', 'stomp', 'growl'] },
      { species: 'arcanine', level: 47, moves: ['fire-blast', 'ember', 'take-down', 'leer'] },
    ],
  },
  {
    id: 'rb-giovanni',
    name: 'Giovanni',
    trainerClass: 'Team Boss',
    game: 'red-blue',
    location: 'Viridian City Gym',
    team: [
      { species: 'rhyhorn', level: 45, moves: ['stomp', 'tail-whip', 'fury-attack'] },
      { species: 'dugtrio', level: 42, moves: ['dig', 'growl', 'scratch'] },
      { species: 'nidoqueen', level: 44, moves: ['body-slam', 'scratch', 'tail-whip'] },
      { species: 'nidoking', level: 45, moves: ['thrash', 'double-kick', 'poison-sting'] },
      { species: 'rhydon', level: 50, moves: ['horn-drill', 'stomp', 'tail-whip', 'fury-attack'] },
    ],
  },
  {
    id: 'rb-lorelei',
    name: 'Lorelei',
    trainerClass: 'Elite Four',
    game: 'red-blue',
    location: 'Indigo Plateau',
    team: [
      { species: 'dewgong', level: 54, moves: ['aurora-beam', 'rest', 'ice-beam', 'double-edge'] },
      { species: 'cloyster', level: 53, moves: ['aurora-beam', 'supersonic', 'clamp', 'blizzard'] },
      { species: 'slowbro', level: 54, moves: ['amnesia', 'surf', 'psychic', 'withdraw'] },
      { species: 'jynx', level: 56, moves: ['blizzard', 'double-slap', 'psychic', 'lovely-kiss'] },
      { species: 'lapras', level: 56, moves: ['blizzard', 'surf', 'body-slam', 'confuse-ray'] },
    ],
  },
  {
    id: 'rb-bruno',
    name: 'Bruno',
    trainerClass: 'Elite Four',
    game: 'red-blue',
    location: 'Indigo Plateau',
    team: [
      { species: 'onix', level: 53, moves: ['bide', 'slam', 'tackle'] },
      {
        species: 'hitmonchan',
        level: 55,
        moves: ['comet-punch', 'ice-punch', 'fire-punch', 'thunder-punch'],
      },
      {
        species: 'hitmonlee',
        level: 55,
        moves: ['high-jump-kick', 'meditate', 'double-kick', 'focus-energy'],
      },
      { species: 'onix', level: 54, moves: ['bide', 'slam', 'tackle'] },
      { species: 'machamp', level: 58, moves: ['submission', 'karate-chop', 'leer', 'fissure'] },
    ],
  },
  {
    id: 'rb-agatha',
    name: 'Agatha',
    trainerClass: 'Elite Four',
    game: 'red-blue',
    location: 'Indigo Plateau',
    team: [
      {
        species: 'gengar',
        level: 54,
        moves: ['night-shade', 'hypnosis', 'dream-eater', 'confuse-ray'],
      },
      { species: 'haunter', level: 53, moves: ['hypnosis', 'dream-eater', 'night-shade', 'lick'] },
      {
        species: 'gengar',
        level: 58,
        moves: ['night-shade', 'hypnosis', 'dream-eater', 'confuse-ray'],
      },
      { species: 'arbok', level: 54, moves: ['bite', 'glare', 'wrap', 'screech'] },
      { species: 'haunter', level: 53, moves: ['hypnosis', 'dream-eater', 'night-shade', 'lick'] },
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
    id: 'rb-blue',
    name: 'Blue',
    trainerClass: 'Champion',
    game: 'red-blue',
    location: 'Indigo Plateau',
    team: [
      {
        species: 'pidgeot',
        level: 59,
        moves: ['quick-attack', 'whirlwind', 'wing-attack', 'sky-attack'],
      },
      { species: 'alakazam', level: 57, moves: ['psychic', 'recover', 'psybeam', 'reflect'] },
      { species: 'rhydon', level: 59, moves: ['horn-drill', 'stomp', 'tail-whip', 'fury-attack'] },
      { species: 'arcanine', level: 61, moves: ['fire-blast', 'ember', 'take-down', 'leer'] },
      { species: 'exeggutor', level: 61, moves: ['stomp', 'barrage', 'hypnosis', 'egg-bomb'] },
      { species: 'blastoise', level: 63, moves: ['water-gun', 'bite', 'withdraw', 'skull-bash'] },
    ],
  },

  // ─── Gold / Silver ─────────────────────────────────────────────────────────
  {
    id: 'gs-falkner',
    name: 'Falkner',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Violet City Gym',
    team: [
      { species: 'pidgey', level: 7, moves: ['tackle', 'sand-attack'] },
      { species: 'pidgeotto', level: 9, moves: ['tackle', 'sand-attack', 'gust'] },
    ],
  },
  {
    id: 'gs-bugsy',
    name: 'Bugsy',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Azalea Town Gym',
    team: [
      { species: 'metapod', level: 14, moves: ['harden'] },
      { species: 'kakuna', level: 14, moves: ['harden'] },
      { species: 'scyther', level: 16, moves: ['fury-cutter', 'leer', 'quick-attack'] },
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
    id: 'gs-morty',
    name: 'Morty',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Ecruteak City Gym',
    team: [
      { species: 'gastly', level: 21, moves: ['lick', 'spite', 'hypnosis', 'mean-look'] },
      { species: 'haunter', level: 21, moves: ['lick', 'spite', 'hypnosis', 'mean-look'] },
      { species: 'haunter', level: 23, moves: ['shadow-ball', 'hypnosis', 'mean-look', 'curse'] },
      { species: 'gengar', level: 25, moves: ['shadow-ball', 'hypnosis', 'mean-look', 'curse'] },
    ],
  },
  {
    id: 'gs-chuck',
    name: 'Chuck',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Cianwood City Gym',
    team: [
      { species: 'primeape', level: 27, moves: ['karate-chop', 'thrash', 'leer', 'focus-energy'] },
      { species: 'poliwrath', level: 30, moves: ['surf', 'dynamicpunch', 'hypnosis', 'body-slam'] },
    ],
  },
  {
    id: 'gs-jasmine',
    name: 'Jasmine',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Olivine City Gym',
    team: [
      { species: 'magnemite', level: 30, moves: ['thundershock', 'sonicboom', 'thunder-wave'] },
      { species: 'magnemite', level: 30, moves: ['thundershock', 'sonicboom', 'thunder-wave'] },
      { species: 'steelix', level: 35, moves: ['iron-tail', 'screech', 'rock-throw', 'slam'] },
    ],
  },
  {
    id: 'gs-pryce',
    name: 'Pryce',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Mahogany Town Gym',
    team: [
      { species: 'seel', level: 27, moves: ['icy-wind', 'aurora-beam', 'rest'] },
      { species: 'dewgong', level: 29, moves: ['icy-wind', 'aurora-beam', 'rest', 'take-down'] },
      {
        species: 'piloswine',
        level: 31,
        moves: ['blizzard', 'ice-shard', 'mud-bomb', 'take-down'],
      },
    ],
  },
  {
    id: 'gs-clair',
    name: 'Clair',
    trainerClass: 'Gym Leader',
    game: 'gold-silver',
    location: 'Blackthorn City Gym',
    team: [
      { species: 'dragonair', level: 37, moves: ['dragon-rage', 'slam', 'thunder-wave', 'surf'] },
      { species: 'dragonair', level: 37, moves: ['dragon-rage', 'slam', 'thunder-wave', 'surf'] },
      { species: 'dragonair', level: 37, moves: ['dragon-rage', 'slam', 'thunder-wave', 'surf'] },
      {
        species: 'kingdra',
        level: 40,
        moves: ['surf', 'smokescreen', 'dragon-rage', 'hyper-beam'],
      },
    ],
  },
  {
    id: 'gs-will',
    name: 'Will',
    trainerClass: 'Elite Four',
    game: 'gold-silver',
    location: 'Pokémon League',
    team: [
      {
        species: 'xatu',
        level: 40,
        moves: ['psybeam', 'night-shade', 'confuse-ray', 'future-sight'],
      },
      { species: 'jynx', level: 41, moves: ['blizzard', 'psychic', 'lovely-kiss', 'perish-song'] },
      { species: 'exeggutor', level: 41, moves: ['psychic', 'sleep-powder', 'egg-bomb', 'stomp'] },
      { species: 'slowbro', level: 41, moves: ['psychic', 'surf', 'amnesia', 'withdraw'] },
      {
        species: 'xatu',
        level: 42,
        moves: ['psybeam', 'night-shade', 'confuse-ray', 'future-sight'],
      },
    ],
  },
  {
    id: 'gs-koga',
    name: 'Koga',
    trainerClass: 'Elite Four',
    game: 'gold-silver',
    location: 'Pokémon League',
    team: [
      {
        species: 'ariados',
        level: 40,
        moves: ['night-shade', 'string-shot', 'scary-face', 'double-edge'],
      },
      {
        species: 'venomoth',
        level: 41,
        moves: ['psychic', 'silver-wind', 'sleep-powder', 'disable'],
      },
      {
        species: 'forretress',
        level: 43,
        moves: ['spikes', 'rapid-spin', 'rollout', 'mirror-shot'],
      },
      { species: 'muk', level: 42, moves: ['toxic', 'minimize', 'sludge', 'acid-armor'] },
      { species: 'crobat', level: 44, moves: ['cross-poison', 'fly', 'confuse-ray', 'bite'] },
    ],
  },
  {
    id: 'gs-bruno',
    name: 'Bruno',
    trainerClass: 'Elite Four',
    game: 'gold-silver',
    location: 'Pokémon League',
    team: [
      {
        species: 'hitmontop',
        level: 42,
        moves: ['triple-kick', 'detect', 'rapid-spin', 'rolling-kick'],
      },
      {
        species: 'hitmonlee',
        level: 42,
        moves: ['high-jump-kick', 'meditate', 'mind-reader', 'focus-energy'],
      },
      {
        species: 'hitmonchan',
        level: 42,
        moves: ['mach-punch', 'comet-punch', 'ice-punch', 'fire-punch'],
      },
      { species: 'onix', level: 43, moves: ['bide', 'rock-throw', 'slam', 'bind'] },
      { species: 'machamp', level: 46, moves: ['cross-chop', 'vital-throw', 'leer', 'rock-slide'] },
    ],
  },
  {
    id: 'gs-karen',
    name: 'Karen',
    trainerClass: 'Elite Four',
    game: 'gold-silver',
    location: 'Pokémon League',
    team: [
      {
        species: 'umbreon',
        level: 42,
        moves: ['faint-attack', 'confuse-ray', 'quick-attack', 'mean-look'],
      },
      {
        species: 'vileplume',
        level: 42,
        moves: ['petal-dance', 'sleep-powder', 'acid', 'moonlight'],
      },
      {
        species: 'gengar',
        level: 45,
        moves: ['shadow-ball', 'hypnosis', 'dream-eater', 'confuse-ray'],
      },
      { species: 'murkrow', level: 44, moves: ['faint-attack', 'mean-look', 'pursuit', 'fly'] },
      {
        species: 'houndoom',
        level: 47,
        moves: ['crunch', 'flamethrower', 'faint-attack', 'sunny-day'],
      },
    ],
  },
  {
    id: 'gs-lance',
    name: 'Lance',
    trainerClass: 'Champion',
    game: 'gold-silver',
    location: 'Pokémon League',
    team: [
      { species: 'gyarados', level: 44, moves: ['hyper-beam', 'surf', 'dragon-rage', 'bite'] },
      {
        species: 'dragonite',
        level: 47,
        moves: ['thunder-wave', 'blizzard', 'fire-blast', 'hyper-beam'],
      },
      {
        species: 'dragonite',
        level: 47,
        moves: ['thunder-wave', 'blizzard', 'fire-blast', 'hyper-beam'],
      },
      {
        species: 'aerodactyl',
        level: 46,
        moves: ['hyper-beam', 'ancientpower', 'bite', 'scary-face'],
      },
      {
        species: 'charizard',
        level: 46,
        moves: ['fire-blast', 'wing-attack', 'slash', 'dragon-rage'],
      },
      { species: 'dragonite', level: 50, moves: ['outrage', 'hyper-beam', 'blizzard', 'thunder'] },
    ],
  },
  {
    id: 'gs-silver',
    name: 'Silver',
    trainerClass: 'Rival',
    game: 'gold-silver',
    location: 'Mt. Silver',
    team: [
      {
        species: 'sneasel',
        level: 43,
        moves: ['faint-attack', 'slash', 'icy-wind', 'fury-swipes'],
      },
      { species: 'magneton', level: 41, moves: ['thunder', 'thunder-wave', 'supersonic', 'swift'] },
      {
        species: 'gengar',
        level: 43,
        moves: ['shadow-ball', 'hypnosis', 'mean-look', 'confuse-ray'],
      },
      {
        species: 'alakazam',
        level: 43,
        moves: ['psychic', 'recover', 'fire-punch', 'thunder-punch'],
      },
      { species: 'golbat', level: 42, moves: ['confuse-ray', 'bite', 'leech-life', 'mean-look'] },
      { species: 'feraligatr', level: 45, moves: ['surf', 'crunch', 'slash', 'screech'] },
    ],
  },

  // ─── Ruby / Sapphire ───────────────────────────────────────────────────────
  {
    id: 'rs-roxanne',
    name: 'Roxanne',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Rustboro City Gym',
    team: [
      { species: 'geodude', level: 12, moves: ['tackle', 'defense-curl'] },
      { species: 'geodude', level: 12, moves: ['tackle', 'defense-curl'] },
      { species: 'nosepass', level: 15, moves: ['tackle', 'harden', 'rock-throw', 'block'] },
    ],
  },
  {
    id: 'rs-brawly',
    name: 'Brawly',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Dewford Town Gym',
    team: [
      { species: 'machop', level: 17, moves: ['karate-chop', 'leer', 'focus-energy'] },
      { species: 'meditite', level: 17, moves: ['meditate', 'bide', 'detect'] },
      { species: 'makuhita', level: 19, moves: ['arm-thrust', 'vital-throw', 'fake-out'] },
    ],
  },
  {
    id: 'rs-wattson',
    name: 'Wattson',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Mauville City Gym',
    team: [
      { species: 'voltorb', level: 20, moves: ['rollout', 'spark', 'selfdestruct'] },
      { species: 'electrike', level: 20, moves: ['leer', 'howl', 'spark', 'thunder-wave'] },
      {
        species: 'magneton',
        level: 22,
        moves: ['thunder-wave', 'sonicboom', 'thundershock', 'spark'],
      },
      { species: 'manectric', level: 24, moves: ['thunder-wave', 'leer', 'howl', 'spark'] },
    ],
  },
  {
    id: 'rs-flannery',
    name: 'Flannery',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Lavaridge Town Gym',
    team: [
      { species: 'slugma', level: 24, moves: ['smog', 'ember', 'yawn', 'amnesia'] },
      { species: 'slugma', level: 24, moves: ['smog', 'ember', 'yawn', 'amnesia'] },
      {
        species: 'torkoal',
        level: 28,
        moves: ['flamethrower', 'body-slam', 'attract', 'overheat'],
      },
    ],
  },
  {
    id: 'rs-norman',
    name: 'Norman',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Petalburg City Gym',
    team: [
      { species: 'spinda', level: 27, moves: ['psybeam', 'teeter-dance', 'facade', 'encore'] },
      { species: 'vigoroth', level: 27, moves: ['slash', 'encore', 'uproar', 'facade'] },
      { species: 'linoone', level: 29, moves: ['belly-drum', 'slash', 'headbutt', 'shadow-ball'] },
      { species: 'slaking', level: 31, moves: ['facade', 'yawn', 'slack-off', 'faint-attack'] },
    ],
  },
  {
    id: 'rs-winona',
    name: 'Winona',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Fortree City Gym',
    team: [
      {
        species: 'swellow',
        level: 31,
        moves: ['aerial-ace', 'quick-attack', 'double-team', 'endeavor'],
      },
      {
        species: 'pelipper',
        level: 30,
        moves: ['supersonic', 'water-gun', 'wing-attack', 'protect'],
      },
      {
        species: 'skarmory',
        level: 32,
        moves: ['steel-wing', 'aerial-ace', 'fury-attack', 'air-cutter'],
      },
      {
        species: 'altaria',
        level: 33,
        moves: ['dragon-breath', 'earthquake', 'aerial-ace', 'take-down'],
      },
    ],
  },
  {
    id: 'rs-tate-liza',
    name: 'Tate & Liza',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Mossdeep City Gym',
    team: [
      {
        species: 'lunatone',
        level: 41,
        moves: ['calm-mind', 'cosmic-power', 'psychic', 'ice-beam'],
      },
      {
        species: 'solrock',
        level: 41,
        moves: ['sunny-day', 'solar-beam', 'flamethrower', 'psychic'],
      },
    ],
  },
  {
    id: 'rs-wallace',
    name: 'Wallace',
    trainerClass: 'Gym Leader',
    game: 'ruby-sapphire',
    location: 'Sootopolis City Gym',
    team: [
      { species: 'luvdisc', level: 40, moves: ['water-gun', 'sweet-kiss', 'attract', 'surf'] },
      { species: 'whiscash', level: 42, moves: ['surf', 'earthquake', 'amnesia', 'rain-dance'] },
      { species: 'sealeo', level: 40, moves: ['surf', 'aurora-beam', 'encore', 'blizzard'] },
      {
        species: 'seaking',
        level: 42,
        moves: ['waterfall', 'horn-drill', 'supersonic', 'agility'],
      },
      { species: 'milotic', level: 43, moves: ['surf', 'recover', 'ice-beam', 'attract'] },
    ],
  },
  {
    id: 'rs-sidney',
    name: 'Sidney',
    trainerClass: 'Elite Four',
    game: 'ruby-sapphire',
    location: 'Pokémon League',
    team: [
      { species: 'mightyena', level: 46, moves: ['take-down', 'sand-attack', 'bite', 'swagger'] },
      {
        species: 'shiftry',
        level: 48,
        moves: ['fake-out', 'extrasensory', 'faint-attack', 'razor-leaf'],
      },
      {
        species: 'cacturne',
        level: 46,
        moves: ['needle-arm', 'cotton-spore', 'faint-attack', 'leech-seed'],
      },
      { species: 'crawdaunt', level: 48, moves: ['surf', 'crabhammer', 'taunt', 'swords-dance'] },
      {
        species: 'absol',
        level: 49,
        moves: ['slash', 'swords-dance', 'faint-attack', 'aerial-ace'],
      },
    ],
  },
  {
    id: 'rs-phoebe',
    name: 'Phoebe',
    trainerClass: 'Elite Four',
    game: 'ruby-sapphire',
    location: 'Pokémon League',
    team: [
      {
        species: 'dusclops',
        level: 48,
        moves: ['shadow-ball', 'confuse-ray', 'will-o-wisp', 'future-sight'],
      },
      {
        species: 'banette',
        level: 49,
        moves: ['shadow-ball', 'will-o-wisp', 'faint-attack', 'psych-up'],
      },
      {
        species: 'dusclops',
        level: 51,
        moves: ['shadow-ball', 'confuse-ray', 'will-o-wisp', 'future-sight'],
      },
      {
        species: 'sableye',
        level: 50,
        moves: ['shadow-ball', 'faint-attack', 'attract', 'calm-mind'],
      },
      {
        species: 'banette',
        level: 49,
        moves: ['shadow-ball', 'will-o-wisp', 'faint-attack', 'psych-up'],
      },
    ],
  },
  {
    id: 'rs-glacia',
    name: 'Glacia',
    trainerClass: 'Elite Four',
    game: 'ruby-sapphire',
    location: 'Pokémon League',
    team: [
      { species: 'sealeo', level: 50, moves: ['blizzard', 'encore', 'aurora-beam', 'water-pulse'] },
      { species: 'glalie', level: 50, moves: ['blizzard', 'crunch', 'ice-ball', 'light-screen'] },
      { species: 'sealeo', level: 52, moves: ['blizzard', 'encore', 'aurora-beam', 'water-pulse'] },
      { species: 'glalie', level: 52, moves: ['blizzard', 'crunch', 'ice-ball', 'light-screen'] },
      { species: 'walrein', level: 53, moves: ['blizzard', 'surf', 'sheer-cold', 'body-slam'] },
    ],
  },
  {
    id: 'rs-drake',
    name: 'Drake',
    trainerClass: 'Elite Four',
    game: 'ruby-sapphire',
    location: 'Pokémon League',
    team: [
      { species: 'shelgon', level: 52, moves: ['dragon-breath', 'protect', 'rage', 'scary-face'] },
      { species: 'altaria', level: 54, moves: ['dragon-breath', 'earthquake', 'fly', 'take-down'] },
      {
        species: 'flygon',
        level: 53,
        moves: ['dragonbreath', 'earthquake', 'aerial-ace', 'flamethrower'],
      },
      {
        species: 'flygon',
        level: 53,
        moves: ['dragonbreath', 'earthquake', 'aerial-ace', 'flamethrower'],
      },
      { species: 'salamence', level: 55, moves: ['dragon-claw', 'fly', 'crunch', 'scary-face'] },
    ],
  },
  {
    id: 'rs-steven',
    name: 'Steven',
    trainerClass: 'Champion',
    game: 'ruby-sapphire',
    location: 'Pokémon League',
    team: [
      { species: 'skarmory', level: 57, moves: ['aerial-ace', 'spikes', 'steel-wing', 'toxic'] },
      {
        species: 'claydol',
        level: 55,
        moves: ['earth-power', 'light-screen', 'reflect', 'extrasensory'],
      },
      {
        species: 'aggron',
        level: 56,
        moves: ['thunder', 'solar-beam', 'double-edge', 'iron-tail'],
      },
      {
        species: 'cradily',
        level: 56,
        moves: ['ancient-power', 'ingrain', 'recover', 'giga-drain'],
      },
      {
        species: 'armaldo',
        level: 56,
        moves: ['ancient-power', 'aerial-ace', 'slash', 'water-pulse'],
      },
      {
        species: 'metagross',
        level: 58,
        moves: ['meteor-mash', 'earthquake', 'psychic', 'shadow-ball'],
      },
    ],
  },

  // ─── Diamond / Pearl ───────────────────────────────────────────────────────
  {
    id: 'dp-roark',
    name: 'Roark',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Oreburgh City Gym',
    team: [
      { species: 'geodude', level: 12, moves: ['stealth-rock', 'rock-polish', 'rock-throw'] },
      { species: 'onix', level: 12, moves: ['stealth-rock', 'rock-polish', 'bind'] },
      { species: 'cranidos', level: 14, moves: ['headbutt', 'pursuit', 'scary-face', 'leer'] },
    ],
  },
  {
    id: 'dp-gardenia',
    name: 'Gardenia',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Eterna City Gym',
    team: [
      { species: 'cherubi', level: 19, moves: ['leech-seed', 'tackle', 'growth', 'magical-leaf'] },
      { species: 'turtwig', level: 19, moves: ['mega-drain', 'leech-seed', 'razor-leaf', 'bite'] },
      {
        species: 'roserade',
        level: 22,
        moves: ['magical-leaf', 'grass-whistle', 'poison-sting', 'stun-spore'],
      },
    ],
  },
  {
    id: 'dp-maylene',
    name: 'Maylene',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Veilstone City Gym',
    team: [
      { species: 'meditite', level: 27, moves: ['meditate', 'detect', 'drain-punch', 'confusion'] },
      { species: 'machoke', level: 27, moves: ['vital-throw', 'bulk-up', 'leer', 'revenge'] },
      {
        species: 'lucario',
        level: 30,
        moves: ['metal-claw', 'force-palm', 'drain-punch', 'calm-mind'],
      },
    ],
  },
  {
    id: 'dp-crasher-wake',
    name: 'Crasher Wake',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Pastoria City Gym',
    team: [
      { species: 'gyarados', level: 27, moves: ['brine', 'twister', 'bite', 'leer'] },
      { species: 'quagsire', level: 27, moves: ['rain-dance', 'water-gun', 'mud-bomb', 'slam'] },
      { species: 'floatzel', level: 30, moves: ['brine', 'agility', 'water-gun', 'swift'] },
    ],
  },
  {
    id: 'dp-fantina',
    name: 'Fantina',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Hearthome City Gym',
    team: [
      {
        species: 'drifblim',
        level: 32,
        moves: ['minimize', 'gust', 'will-o-wisp', 'ominous-wind'],
      },
      {
        species: 'gengar',
        level: 34,
        moves: ['shadow-claw', 'hypnosis', 'dream-eater', 'confuse-ray'],
      },
      {
        species: 'mismagius',
        level: 36,
        moves: ['shadow-ball', 'confuse-ray', 'psybeam', 'mean-look'],
      },
    ],
  },
  {
    id: 'dp-byron',
    name: 'Byron',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Canalave City Gym',
    team: [
      {
        species: 'bronzor',
        level: 36,
        moves: ['confuse-ray', 'hypnosis', 'iron-defense', 'flash-cannon'],
      },
      { species: 'steelix', level: 36, moves: ['screech', 'iron-tail', 'crunch', 'rock-tomb'] },
      {
        species: 'bastiodon',
        level: 39,
        moves: ['iron-defense', 'ancient-power', 'metal-burst', 'protect'],
      },
    ],
  },
  {
    id: 'dp-candice',
    name: 'Candice',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Snowpoint City Gym',
    team: [
      { species: 'snover', level: 38, moves: ['razor-leaf', 'powder-snow', 'leer', 'swagger'] },
      {
        species: 'sneasel',
        level: 38,
        moves: ['icy-wind', 'quick-attack', 'faint-attack', 'fury-swipes'],
      },
      {
        species: 'medicham',
        level: 40,
        moves: ['ice-punch', 'drain-punch', 'detect', 'calm-mind'],
      },
      { species: 'abomasnow', level: 42, moves: ['blizzard', 'wood-hammer', 'ice-shard', 'mist'] },
    ],
  },
  {
    id: 'dp-volkner',
    name: 'Volkner',
    trainerClass: 'Gym Leader',
    game: 'diamond-pearl',
    location: 'Sunyshore City Gym',
    team: [
      {
        species: 'jolteon',
        level: 46,
        moves: ['thunder-fang', 'thunder-wave', 'shadow-ball', 'quick-attack'],
      },
      {
        species: 'raichu',
        level: 46,
        moves: ['thunderbolt', 'quick-attack', 'iron-tail', 'signal-beam'],
      },
      {
        species: 'ambipom',
        level: 47,
        moves: ['thunder-punch', 'swift', 'double-hit', 'fake-out'],
      },
      {
        species: 'electivire',
        level: 50,
        moves: ['thunderbolt', 'ice-punch', 'fire-punch', 'thunder-wave'],
      },
    ],
  },
  {
    id: 'dp-aaron',
    name: 'Aaron',
    trainerClass: 'Elite Four',
    game: 'diamond-pearl',
    location: 'Pokémon League',
    team: [
      {
        species: 'dustox',
        level: 53,
        ability: 'shield-dust',
        moves: ['toxic', 'protect', 'moonlight', 'silver-wind'],
      },
      {
        species: 'beautifly',
        level: 53,
        ability: 'swarm',
        moves: ['silver-wind', 'giga-drain', 'morning-sun', 'attract'],
      },
      {
        species: 'vespiquen',
        level: 54,
        ability: 'pressure',
        moves: ['attack-order', 'defend-order', 'toxic', 'heal-order'],
      },
      {
        species: 'heracross',
        level: 54,
        ability: 'swarm',
        moves: ['close-combat', 'megahorn', 'aerial-ace', 'reversal'],
      },
      {
        species: 'drapion',
        level: 57,
        ability: 'sniper',
        moves: ['night-slash', 'cross-poison', 'thunder-fang', 'swords-dance'],
      },
    ],
  },
  {
    id: 'dp-bertha',
    name: 'Bertha',
    trainerClass: 'Elite Four',
    game: 'diamond-pearl',
    location: 'Pokémon League',
    team: [
      {
        species: 'whiscash',
        level: 55,
        ability: 'oblivious',
        moves: ['earth-power', 'surf', 'zen-headbutt', 'amnesia'],
      },
      {
        species: 'gliscor',
        level: 55,
        ability: 'hyper-cutter',
        moves: ['earthquake', 'aerial-ace', 'sandstorm', 'swords-dance'],
      },
      {
        species: 'golem',
        level: 56,
        ability: 'rock-head',
        moves: ['earthquake', 'stone-edge', 'explosion', 'rock-polish'],
      },
      {
        species: 'sudowoodo',
        level: 56,
        ability: 'rock-head',
        moves: ['stone-edge', 'hammer-arm', 'sucker-punch', 'double-edge'],
      },
      {
        species: 'hippowdon',
        level: 59,
        ability: 'sand-stream',
        moves: ['earthquake', 'ice-fang', 'slack-off', 'crunch'],
      },
    ],
  },
  {
    id: 'dp-flint',
    name: 'Flint',
    trainerClass: 'Elite Four',
    game: 'diamond-pearl',
    location: 'Pokémon League',
    team: [
      {
        species: 'rapidash',
        level: 58,
        ability: 'flash-fire',
        moves: ['flamethrower', 'fire-spin', 'sunny-day', 'agility'],
      },
      {
        species: 'drifblim',
        level: 58,
        ability: 'aftermath',
        moves: ['thunderbolt', 'ominous-wind', 'shadow-ball', 'minimize'],
      },
      {
        species: 'lopunny',
        level: 57,
        ability: 'cute-charm',
        moves: ['fire-punch', 'bounce', 'quick-attack', 'dizzy-punch'],
      },
      {
        species: 'steelix',
        level: 57,
        ability: 'rock-head',
        moves: ['fire-fang', 'iron-tail', 'crunch', 'stone-edge'],
      },
      {
        species: 'infernape',
        level: 61,
        ability: 'blaze',
        moves: ['flare-blitz', 'close-combat', 'earthquake', 'swords-dance'],
      },
    ],
  },
  {
    id: 'dp-lucian',
    name: 'Lucian',
    trainerClass: 'Elite Four',
    game: 'diamond-pearl',
    location: 'Pokémon League',
    team: [
      {
        species: 'mr-mime',
        level: 59,
        ability: 'filter',
        moves: ['psychic', 'reflect', 'light-screen', 'thunder-wave'],
      },
      {
        species: 'espeon',
        level: 59,
        ability: 'synchronize',
        moves: ['psychic', 'calm-mind', 'shadow-ball', 'morning-sun'],
      },
      {
        species: 'bronzong',
        level: 60,
        ability: 'heatproof',
        moves: ['psychic', 'calm-mind', 'future-sight', 'flash-cannon'],
      },
      {
        species: 'alakazam',
        level: 60,
        ability: 'inner-focus',
        moves: ['psychic', 'calm-mind', 'shadow-ball', 'recover'],
      },
      {
        species: 'gallade',
        level: 63,
        ability: 'steadfast',
        moves: ['psycho-cut', 'close-combat', 'slash', 'swords-dance'],
      },
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
    id: 'dp-barry',
    name: 'Barry',
    trainerClass: 'Rival',
    game: 'diamond-pearl',
    location: 'Pokémon League',
    team: [
      {
        species: 'staraptor',
        level: 52,
        ability: 'intimidate',
        moves: ['brave-bird', 'close-combat', 'quick-attack', 'roost'],
      },
      {
        species: 'heracross',
        level: 52,
        ability: 'guts',
        moves: ['megahorn', 'close-combat', 'aerial-ace', 'pursuit'],
      },
      {
        species: 'rapidash',
        level: 53,
        ability: 'flash-fire',
        moves: ['fire-blast', 'flare-blitz', 'stomp', 'agility'],
      },
      {
        species: 'roserade',
        level: 53,
        ability: 'natural-cure',
        moves: ['energy-ball', 'sludge-bomb', 'extrasensory', 'shadow-ball'],
      },
      {
        species: 'floatzel',
        level: 53,
        ability: 'swift-swim',
        moves: ['waterfall', 'ice-fang', 'swift', 'agility'],
      },
      {
        species: 'empoleon',
        level: 55,
        ability: 'torrent',
        moves: ['hydro-pump', 'metal-claw', 'blizzard', 'flash-cannon'],
      },
    ],
  },

  // ─── Black / White ─────────────────────────────────────────────────────────
  {
    id: 'bw-cilan',
    name: 'Cilan',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Striaton City Gym',
    team: [
      { species: 'lillipup', level: 12, moves: ['bite', 'tackle', 'leer', 'helping-hand'] },
      { species: 'pansage', level: 14, moves: ['bullet-seed', 'bite', 'leech-seed', 'vine-whip'] },
    ],
  },
  {
    id: 'bw-lenora',
    name: 'Lenora',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Nacrene City Gym',
    team: [
      { species: 'herdier', level: 18, moves: ['bite', 'take-down', 'leer', 'helping-hand'] },
      { species: 'watchog', level: 20, moves: ['retaliate', 'crunch', 'hypnosis', 'leer'] },
    ],
  },
  {
    id: 'bw-burgh',
    name: 'Burgh',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Castelia City Gym',
    team: [
      { species: 'whirlipede', level: 21, moves: ['screech', 'pursuit', 'poison-tail', 'protect'] },
      { species: 'dwebble', level: 21, moves: ['smack-down', 'bug-bite', 'rock-blast', 'protect'] },
      {
        species: 'leavanny',
        level: 23,
        moves: ['razor-leaf', 'bug-bite', 'string-shot', 'struggle-bug'],
      },
    ],
  },
  {
    id: 'bw-elesa',
    name: 'Elesa',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Nimbasa City Gym',
    team: [
      {
        species: 'emolga',
        level: 25,
        moves: ['volt-switch', 'aerial-ace', 'quick-attack', 'pursuit'],
      },
      {
        species: 'emolga',
        level: 25,
        moves: ['volt-switch', 'aerial-ace', 'quick-attack', 'pursuit'],
      },
      {
        species: 'zebstrika',
        level: 27,
        moves: ['volt-switch', 'flame-charge', 'pursuit', 'quick-attack'],
      },
    ],
  },
  {
    id: 'bw-clay',
    name: 'Clay',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Driftveil City Gym',
    team: [
      { species: 'krokorok', level: 29, moves: ['bulldoze', 'bite', 'swagger', 'sand-tomb'] },
      {
        species: 'palpitoad',
        level: 29,
        moves: ['bulldoze', 'aqua-ring', 'uproar', 'muddy-water'],
      },
      { species: 'excadrill', level: 31, moves: ['bulldoze', 'rock-slide', 'slash', 'hone-claws'] },
    ],
  },
  {
    id: 'bw-skyla',
    name: 'Skyla',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Mistralton City Gym',
    team: [
      {
        species: 'swoobat',
        level: 33,
        moves: ['air-cutter', 'attract', 'heart-stamp', 'acrobatics'],
      },
      { species: 'unfezant', level: 33, moves: ['air-slash', 'leer', 'quick-attack', 'attract'] },
      {
        species: 'swanna',
        level: 35,
        moves: ['air-slash', 'bubble-beam', 'wing-attack', 'feather-dance'],
      },
    ],
  },
  {
    id: 'bw-brycen',
    name: 'Brycen',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Icirrus City Gym',
    team: [
      {
        species: 'vanillish',
        level: 37,
        moves: ['icy-wind', 'taunt', 'acid-armor', 'mirror-shot'],
      },
      {
        species: 'cryogonal',
        level: 37,
        moves: ['aurora-beam', 'slash', 'freeze-dry', 'light-screen'],
      },
      { species: 'beartic', level: 39, moves: ['surf', 'brine', 'slash', 'icicle-crash'] },
    ],
  },
  {
    id: 'bw-drayden',
    name: 'Drayden',
    trainerClass: 'Gym Leader',
    game: 'black-white',
    location: 'Opelucid City Gym',
    team: [
      { species: 'fraxure', level: 41, moves: ['dragon-dance', 'dragon-claw', 'slash', 'taunt'] },
      { species: 'fraxure', level: 41, moves: ['dragon-dance', 'dragon-claw', 'slash', 'taunt'] },
      { species: 'haxorus', level: 43, moves: ['dragon-dance', 'dragon-claw', 'slash', 'taunt'] },
    ],
  },
  {
    id: 'bw-shauntal',
    name: 'Shauntal',
    trainerClass: 'Elite Four',
    game: 'black-white',
    location: 'Pokémon League',
    team: [
      {
        species: 'cofagrigus',
        level: 48,
        ability: 'mummy',
        moves: ['shadow-ball', 'will-o-wisp', 'toxic-spikes', 'calm-mind'],
      },
      {
        species: 'drifblim',
        level: 50,
        ability: 'aftermath',
        moves: ['shadow-ball', 'will-o-wisp', 'thunderbolt', 'minimize'],
      },
      {
        species: 'chandelure',
        level: 50,
        ability: 'flash-fire',
        moves: ['shadow-ball', 'flamethrower', 'energy-ball', 'psychic'],
      },
      {
        species: 'golurk',
        level: 48,
        ability: 'iron-fist',
        moves: ['shadow-punch', 'earthquake', 'heavy-slam', 'focus-punch'],
      },
    ],
  },
  {
    id: 'bw-marshal',
    name: 'Marshal',
    trainerClass: 'Elite Four',
    game: 'black-white',
    location: 'Pokémon League',
    team: [
      {
        species: 'throh',
        level: 48,
        ability: 'guts',
        moves: ['bulk-up', 'circle-throw', 'storm-throw', 'seismic-toss'],
      },
      {
        species: 'sawk',
        level: 48,
        ability: 'sturdy',
        moves: ['close-combat', 'double-kick', 'brick-break', 'bulk-up'],
      },
      {
        species: 'conkeldurr',
        level: 50,
        ability: 'guts',
        moves: ['drain-punch', 'hammer-arm', 'stone-edge', 'bulk-up'],
      },
      {
        species: 'mienshao',
        level: 50,
        ability: 'inner-focus',
        moves: ['high-jump-kick', 'u-turn', 'fake-out', 'acrobatics'],
      },
    ],
  },
  {
    id: 'bw-grimsley',
    name: 'Grimsley',
    trainerClass: 'Elite Four',
    game: 'black-white',
    location: 'Pokémon League',
    team: [
      {
        species: 'scrafty',
        level: 48,
        ability: 'moxie',
        moves: ['crunch', 'high-jump-kick', 'dragon-claw', 'bulk-up'],
      },
      {
        species: 'liepard',
        level: 48,
        ability: 'unburden',
        moves: ['night-slash', 'shadow-claw', 'attract', 'aerial-ace'],
      },
      {
        species: 'krookodile',
        level: 50,
        ability: 'moxie',
        moves: ['crunch', 'earthquake', 'stone-edge', 'outrage'],
      },
      {
        species: 'bisharp',
        level: 50,
        ability: 'defiant',
        moves: ['night-slash', 'iron-head', 'sucker-punch', 'swords-dance'],
      },
    ],
  },
  {
    id: 'bw-caitlin',
    name: 'Caitlin',
    trainerClass: 'Elite Four',
    game: 'black-white',
    location: 'Pokémon League',
    team: [
      {
        species: 'musharna',
        level: 48,
        ability: 'forewarn',
        moves: ['psychic', 'calm-mind', 'hypnosis', 'dream-eater'],
      },
      {
        species: 'sigilyph',
        level: 50,
        ability: 'magic-guard',
        moves: ['air-slash', 'energy-ball', 'shadow-ball', 'psychic'],
      },
      {
        species: 'reuniclus',
        level: 50,
        ability: 'magic-guard',
        moves: ['psychic', 'focus-blast', 'energy-ball', 'calm-mind'],
      },
      {
        species: 'gothitelle',
        level: 48,
        ability: 'shadow-tag',
        moves: ['psychic', 'flatter', 'rest', 'snore'],
      },
    ],
  },
  {
    id: 'bw-alder',
    name: 'Alder',
    trainerClass: 'Champion',
    game: 'black-white',
    location: 'Pokémon League',
    team: [
      {
        species: 'accelgor',
        level: 54,
        ability: 'hydration',
        moves: ['bug-buzz', 'final-gambit', 'focus-blast', 'water-shuriken'],
      },
      {
        species: 'bouffalant',
        level: 54,
        ability: 'reckless',
        moves: ['head-charge', 'stone-edge', 'return', 'earthquake'],
      },
      {
        species: 'druddigon',
        level: 56,
        ability: 'sheer-force',
        moves: ['dragon-claw', 'fire-punch', 'thunder-punch', 'sucker-punch'],
      },
      {
        species: 'vanilluxe',
        level: 56,
        ability: 'ice-body',
        moves: ['blizzard', 'freeze-dry', 'mirror-shot', 'light-screen'],
      },
      {
        species: 'escavalier',
        level: 56,
        ability: 'shell-armor',
        moves: ['megahorn', 'iron-head', 'poison-jab', 'swords-dance'],
      },
      {
        species: 'volcarona',
        level: 58,
        ability: 'flame-body',
        moves: ['fiery-dance', 'quiver-dance', 'bug-buzz', 'hurricane'],
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
    id: 'bw-cheren',
    name: 'Cheren',
    trainerClass: 'Rival',
    game: 'black-white',
    location: 'Pokémon League',
    team: [
      {
        species: 'unfezant',
        level: 50,
        ability: 'super-luck',
        moves: ['air-slash', 'quick-attack', 'return', 'roost'],
      },
      {
        species: 'simisage',
        level: 50,
        ability: 'gluttony',
        moves: ['seed-bomb', 'crunch', 'shadow-claw', 'acrobatics'],
      },
      {
        species: 'liepard',
        level: 50,
        ability: 'limber',
        moves: ['shadow-claw', 'night-slash', 'sucker-punch', 'pursuit'],
      },
      {
        species: 'boldore',
        level: 50,
        ability: 'sturdy',
        moves: ['power-gem', 'rock-slide', 'iron-defense', 'bulldoze'],
      },
      {
        species: 'seismitoad',
        level: 50,
        ability: 'poison-touch',
        moves: ['surf', 'sludge-wave', 'earthquake', 'ice-punch'],
      },
      {
        species: 'serperior',
        level: 52,
        ability: 'overgrow',
        moves: ['leaf-blade', 'coil', 'dragon-tail', 'aerial-ace'],
      },
    ],
  },
  {
    id: 'bw-bianca',
    name: 'Bianca',
    trainerClass: 'Rival',
    game: 'black-white',
    location: 'Victory Road',
    team: [
      {
        species: 'musharna',
        level: 49,
        ability: 'forewarn',
        moves: ['psychic', 'hypnosis', 'stored-power', 'calm-mind'],
      },
      {
        species: 'simipour',
        level: 49,
        ability: 'torrent',
        moves: ['surf', 'ice-beam', 'focus-blast', 'return'],
      },
      {
        species: 'pansear',
        level: 49,
        ability: 'gluttony',
        moves: ['fire-blast', 'acrobatics', 'shadow-claw', 'return'],
      },
      {
        species: 'swoobat',
        level: 49,
        ability: 'klutz',
        moves: ['psychic', 'air-slash', 'heart-stamp', 'calm-mind'],
      },
      {
        species: 'zebstrika',
        level: 49,
        ability: 'lightning-rod',
        moves: ['thunderbolt', 'flame-charge', 'pursuit', 'quick-attack'],
      },
      {
        species: 'emboar',
        level: 51,
        ability: 'blaze',
        moves: ['flare-blitz', 'hammer-arm', 'head-smash', 'wild-charge'],
      },
    ],
  },

  // ─── X / Y ─────────────────────────────────────────────────────────────────
  {
    id: 'xy-viola',
    name: 'Viola',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Santalune City Gym',
    team: [
      {
        species: 'surskit',
        level: 10,
        moves: ['bubble', 'quick-attack', 'sweet-scent', 'water-sport'],
      },
      {
        species: 'vivillon',
        level: 12,
        moves: ['tackle', 'poison-powder', 'stun-spore', 'struggle-bug'],
      },
    ],
  },
  {
    id: 'xy-grant',
    name: 'Grant',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Cyllage City Gym',
    team: [
      {
        species: 'amaura',
        level: 25,
        moves: ['rock-tomb', 'icy-wind', 'ancient-power', 'take-down'],
      },
      { species: 'tyrunt', level: 25, moves: ['rock-tomb', 'ancient-power', 'bite', 'stomp'] },
    ],
  },
  {
    id: 'xy-korrina',
    name: 'Korrina',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Shalour City Gym',
    team: [
      {
        species: 'mienfoo',
        level: 29,
        moves: ['drain-punch', 'swift', 'fake-out', 'power-up-punch'],
      },
      {
        species: 'machoke',
        level: 28,
        moves: ['power-up-punch', 'leer', 'karate-chop', 'low-sweep'],
      },
      {
        species: 'hawlucha',
        level: 32,
        moves: ['high-jump-kick', 'aerial-ace', 'power-up-punch', 'shadow-claw'],
      },
    ],
  },
  {
    id: 'xy-ramos',
    name: 'Ramos',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Coumarine City Gym',
    team: [
      {
        species: 'jumpluff',
        level: 30,
        moves: ['acrobatics', 'sleep-powder', 'leech-seed', 'bounce'],
      },
      {
        species: 'weepinbell',
        level: 31,
        moves: ['poison-powder', 'razor-leaf', 'gastro-acid', 'sleep-powder'],
      },
      { species: 'gogoat', level: 34, moves: ['bulldoze', 'razor-leaf', 'leech-seed', 'bulk-up'] },
    ],
  },
  {
    id: 'xy-clemont',
    name: 'Clemont',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Lumiose City Gym',
    team: [
      {
        species: 'emolga',
        level: 35,
        moves: ['volt-switch', 'aerial-ace', 'pursuit', 'light-screen'],
      },
      {
        species: 'magneton',
        level: 35,
        moves: ['thunderbolt', 'thunder-wave', 'mirror-shot', 'volt-switch'],
      },
      {
        species: 'heliolisk',
        level: 37,
        moves: ['thunderbolt', 'swift', 'volt-switch', 'parabolic-charge'],
      },
    ],
  },
  {
    id: 'xy-valerie',
    name: 'Valerie',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Laverre City Gym',
    team: [
      { species: 'mawile', level: 38, moves: ['fairy-wind', 'iron-head', 'crunch', 'sweet-scent'] },
      {
        species: 'mr-mime',
        level: 39,
        moves: ['psybeam', 'disarming-voice', 'light-screen', 'reflect'],
      },
      {
        species: 'sylveon',
        level: 42,
        moves: ['draining-kiss', 'disarming-voice', 'fairy-wind', 'moonblast'],
      },
    ],
  },
  {
    id: 'xy-olympia',
    name: 'Olympia',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Anistar City Gym',
    team: [
      {
        species: 'sigilyph',
        level: 44,
        moves: ['air-slash', 'psybeam', 'ice-beam', 'cosmic-power'],
      },
      { species: 'slowking', level: 45, moves: ['psychic', 'surf', 'fire-blast', 'power-gem'] },
      {
        species: 'meowstic',
        level: 48,
        moves: ['psychic', 'thunderbolt', 'shadow-ball', 'calm-mind'],
      },
    ],
  },
  {
    id: 'xy-wulfric',
    name: 'Wulfric',
    trainerClass: 'Gym Leader',
    game: 'x-y',
    location: 'Snowbelle City Gym',
    team: [
      {
        species: 'abomasnow',
        level: 56,
        moves: ['ice-punch', 'wood-hammer', 'earthquake', 'blizzard'],
      },
      { species: 'cryogonal', level: 55, moves: ['blizzard', 'reflect', 'light-screen', 'haze'] },
      {
        species: 'avalugg',
        level: 59,
        moves: ['avalanche', 'iron-defense', 'crunch', 'rock-slide'],
      },
    ],
  },
  {
    id: 'xy-malva',
    name: 'Malva',
    trainerClass: 'Elite Four',
    game: 'x-y',
    location: 'Pokémon League',
    team: [
      {
        species: 'pyroar',
        level: 63,
        ability: 'unnerve',
        moves: ['flamethrower', 'noble-roar', 'dark-pulse', 'hyper-voice'],
      },
      {
        species: 'torkoal',
        level: 63,
        ability: 'white-smoke',
        moves: ['overheat', 'stealth-rock', 'stone-edge', 'explosion'],
      },
      {
        species: 'chandelure',
        level: 63,
        ability: 'flame-body',
        moves: ['flamethrower', 'shadow-ball', 'energy-ball', 'psychic'],
      },
      {
        species: 'talonflame',
        level: 65,
        ability: 'gale-wings',
        moves: ['brave-bird', 'flare-blitz', 'swords-dance', 'roost'],
      },
    ],
  },
  {
    id: 'xy-siebold',
    name: 'Siebold',
    trainerClass: 'Elite Four',
    game: 'x-y',
    location: 'Pokémon League',
    team: [
      {
        species: 'clawitzer',
        level: 63,
        ability: 'mega-launcher',
        moves: ['water-pulse', 'dark-pulse', 'aura-sphere', 'ice-beam'],
      },
      {
        species: 'starmie',
        level: 63,
        ability: 'natural-cure',
        moves: ['surf', 'psychic', 'thunderbolt', 'ice-beam'],
      },
      {
        species: 'gyarados',
        level: 63,
        ability: 'intimidate',
        moves: ['waterfall', 'ice-fang', 'dragon-dance', 'crunch'],
      },
      {
        species: 'barbaracle',
        level: 65,
        ability: 'tough-claws',
        moves: ['stone-edge', 'cross-chop', 'razor-shell', 'x-scissor'],
      },
    ],
  },
  {
    id: 'xy-wikstrom',
    name: 'Wikstrom',
    trainerClass: 'Elite Four',
    game: 'x-y',
    location: 'Pokémon League',
    team: [
      {
        species: 'klefki',
        level: 63,
        ability: 'prankster',
        moves: ['spikes', 'fairy-lock', 'flash-cannon', 'play-rough'],
      },
      {
        species: 'probopass',
        level: 63,
        ability: 'sturdy',
        moves: ['power-gem', 'flash-cannon', 'thunder-wave', 'earth-power'],
      },
      {
        species: 'scizor',
        level: 63,
        ability: 'light-metal',
        moves: ['bullet-punch', 'x-scissor', 'iron-defense', 'swords-dance'],
      },
      {
        species: 'aegislash',
        level: 65,
        ability: 'stance-change',
        moves: ['shadow-ball', 'flash-cannon', 'shadow-sneak', 'kings-shield'],
      },
    ],
  },
  {
    id: 'xy-drasna',
    name: 'Drasna',
    trainerClass: 'Elite Four',
    game: 'x-y',
    location: 'Pokémon League',
    team: [
      {
        species: 'dragalge',
        level: 63,
        ability: 'poison-point',
        moves: ['dragon-pulse', 'sludge-bomb', 'water-pulse', 'toxic'],
      },
      {
        species: 'druddigon',
        level: 63,
        ability: 'sheer-force',
        moves: ['dragon-claw', 'fire-punch', 'thunder-punch', 'sucker-punch'],
      },
      {
        species: 'altaria',
        level: 63,
        ability: 'natural-cure',
        moves: ['dragon-pulse', 'moonblast', 'ice-beam', 'refresh'],
      },
      {
        species: 'noivern',
        level: 65,
        ability: 'infiltrator',
        moves: ['boomburst', 'dragon-pulse', 'hurricane', 'flamethrower'],
      },
    ],
  },
  {
    id: 'xy-diantha',
    name: 'Diantha',
    trainerClass: 'Champion',
    game: 'x-y',
    location: 'Pokémon League',
    team: [
      {
        species: 'hawlucha',
        level: 64,
        ability: 'unburden',
        moves: ['high-jump-kick', 'aerial-ace', 'swords-dance', 'shadow-claw'],
      },
      {
        species: 'tyrantrum',
        level: 65,
        ability: 'strong-jaw',
        moves: ['dragon-claw', 'crunch', 'earthquake', 'stone-edge'],
      },
      {
        species: 'aurorus',
        level: 65,
        ability: 'refrigerate',
        moves: ['blizzard', 'ancient-power', 'hyper-voice', 'thunder'],
      },
      {
        species: 'gourgeist',
        level: 65,
        ability: 'frisk',
        moves: ['shadow-ball', 'trick-or-treat', 'leech-seed', 'seed-bomb'],
      },
      {
        species: 'goodra',
        level: 66,
        ability: 'sap-sipper',
        moves: ['dragon-pulse', 'muddy-water', 'ice-beam', 'sludge-wave'],
      },
      {
        species: 'gardevoir',
        level: 68,
        ability: 'trace',
        item: 'gardevoirite',
        moves: ['moonblast', 'psychic', 'shadow-ball', 'thunderbolt'],
      },
    ],
  },

  // ─── Sun / Moon ────────────────────────────────────────────────────────────
  {
    id: 'sm-hala',
    name: 'Hala',
    trainerClass: 'Gym Leader',
    game: 'sun-moon',
    location: 'Iki Town',
    team: [
      { species: 'mankey', level: 14, moves: ['karate-chop', 'leer', 'low-kick', 'fury-swipes'] },
      {
        species: 'makuhita',
        level: 14,
        moves: ['arm-thrust', 'fake-out', 'sand-attack', 'vital-throw'],
      },
      { species: 'crabrawler', level: 15, moves: ['bubble', 'leer', 'pursuit', 'power-up-punch'] },
    ],
  },
  {
    id: 'sm-olivia',
    name: 'Olivia',
    trainerClass: 'Gym Leader',
    game: 'sun-moon',
    location: 'Ruins of Life',
    team: [
      {
        species: 'nosepass',
        level: 26,
        moves: ['power-gem', 'rock-throw', 'thunder-wave', 'spark'],
      },
      {
        species: 'boldore',
        level: 26,
        moves: ['smack-down', 'rock-blast', 'iron-defense', 'bulldoze'],
      },
      { species: 'lycanroc', level: 27, moves: ['rock-throw', 'crunch', 'stealth-rock', 'bite'] },
    ],
  },
  {
    id: 'sm-nanu',
    name: 'Nanu',
    trainerClass: 'Gym Leader',
    game: 'sun-moon',
    location: "Ula'ula Island",
    team: [
      {
        species: 'sableye',
        level: 36,
        moves: ['shadow-ball', 'foul-play', 'will-o-wisp', 'recover'],
      },
      { species: 'krokorok', level: 37, moves: ['crunch', 'earthquake', 'swagger', 'sand-tomb'] },
      {
        species: 'persian-alola',
        level: 37,
        moves: ['dark-pulse', 'power-gem', 'slash', 'nasty-plot'],
      },
    ],
  },
  {
    id: 'sm-hapu',
    name: 'Hapu',
    trainerClass: 'Gym Leader',
    game: 'sun-moon',
    location: 'Vast Poni Canyon',
    team: [
      {
        species: 'dugtrio-alola',
        level: 49,
        moves: ['earthquake', 'sucker-punch', 'iron-head', 'swords-dance'],
      },
      {
        species: 'gastrodon',
        level: 49,
        moves: ['earth-power', 'scald', 'recover', 'mirror-coat'],
      },
      { species: 'flygon', level: 49, moves: ['earthquake', 'dragon-claw', 'fire-blast', 'roost'] },
      {
        species: 'mudsdale',
        level: 50,
        moves: ['high-horsepower', 'heavy-slam', 'close-combat', 'iron-defense'],
      },
    ],
  },
  {
    id: 'sm-acerola',
    name: 'Acerola',
    trainerClass: 'Elite Four',
    game: 'sun-moon',
    location: 'Pokémon League',
    team: [
      {
        species: 'drifblim',
        level: 54,
        ability: 'aftermath',
        moves: ['shadow-ball', 'will-o-wisp', 'acrobatics', 'thunder-wave'],
      },
      {
        species: 'gengar',
        level: 54,
        ability: 'cursed-body',
        moves: ['shadow-ball', 'sludge-wave', 'thunderbolt', 'destiny-bond'],
      },
      {
        species: 'froslass',
        level: 54,
        ability: 'snow-cloak',
        moves: ['shadow-ball', 'blizzard', 'destiny-bond', 'thunder-wave'],
      },
      {
        species: 'dhelmise',
        level: 55,
        ability: 'steelworker',
        moves: ['anchor-shot', 'shadow-ball', 'energy-ball', 'whirlpool'],
      },
      {
        species: 'palossand',
        level: 56,
        ability: 'water-compaction',
        moves: ['shadow-ball', 'earth-power', 'shore-up', 'ancient-power'],
      },
    ],
  },
  {
    id: 'sm-kahili',
    name: 'Kahili',
    trainerClass: 'Elite Four',
    game: 'sun-moon',
    location: 'Pokémon League',
    team: [
      {
        species: 'oricorio',
        level: 54,
        ability: 'dancer',
        moves: ['revelation-dance', 'air-slash', 'roost', 'substitute'],
      },
      {
        species: 'mandibuzz',
        level: 54,
        ability: 'overcoat',
        moves: ['brave-bird', 'foul-play', 'roost', 'toxic'],
      },
      {
        species: 'hawlucha',
        level: 54,
        ability: 'unburden',
        moves: ['sky-attack', 'high-jump-kick', 'swords-dance', 'acrobatics'],
      },
      {
        species: 'crobat',
        level: 55,
        ability: 'inner-focus',
        moves: ['brave-bird', 'cross-poison', 'nasty-plot', 'roost'],
      },
      {
        species: 'skarmory',
        level: 56,
        ability: 'sturdy',
        moves: ['brave-bird', 'iron-head', 'spikes', 'roost'],
      },
    ],
  },
  {
    id: 'sm-kukui',
    name: 'Professor Kukui',
    trainerClass: 'Champion',
    game: 'sun-moon',
    location: 'Pokémon League',
    team: [
      {
        species: 'lycanroc',
        level: 57,
        ability: 'tough-claws',
        moves: ['stone-edge', 'crunch', 'leech-life', 'swords-dance'],
      },
      {
        species: 'ninetales-alola',
        level: 57,
        ability: 'snow-warning',
        moves: ['blizzard', 'moonblast', 'freeze-dry', 'light-screen'],
      },
      {
        species: 'braviary',
        level: 57,
        ability: 'defiant',
        moves: ['brave-bird', 'superpower', 'shadow-claw', 'roost'],
      },
      {
        species: 'magnezone',
        level: 57,
        ability: 'magnet-pull',
        moves: ['thunderbolt', 'flash-cannon', 'thunder-wave', 'volt-switch'],
      },
      {
        species: 'snorlax',
        level: 57,
        ability: 'thick-fat',
        moves: ['body-slam', 'crunch', 'seed-bomb', 'yawn'],
      },
      {
        species: 'incineroar',
        level: 58,
        ability: 'blaze',
        moves: ['flare-blitz', 'darkest-lariat', 'leech-life', 'earthquake'],
      },
    ],
  },

  // ─── Sword / Shield ────────────────────────────────────────────────────────
  {
    id: 'swsh-milo',
    name: 'Milo',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Turffield Stadium',
    team: [
      {
        species: 'gossifleur',
        level: 19,
        moves: ['round', 'magical-leaf', 'cotton-spore', 'growth'],
      },
      {
        species: 'eldegoss',
        level: 20,
        moves: ['round', 'magical-leaf', 'cotton-spore', 'leafage'],
      },
    ],
  },
  {
    id: 'swsh-nessa',
    name: 'Nessa',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Hulbury Stadium',
    team: [
      { species: 'goldeen', level: 22, moves: ['peck', 'horn-attack', 'water-pulse', 'agility'] },
      { species: 'arrokuda', level: 23, moves: ['crunch', 'aqua-jet', 'swift', 'water-gun'] },
      { species: 'drednaw', level: 24, moves: ['razor-shell', 'bite', 'headbutt', 'mud-shot'] },
    ],
  },
  {
    id: 'swsh-kabu',
    name: 'Kabu',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Motostoke Stadium',
    team: [
      {
        species: 'ninetales',
        level: 25,
        moves: ['ember', 'quick-attack', 'will-o-wisp', 'overheat'],
      },
      { species: 'arcanine', level: 25, moves: ['ember', 'bite', 'extreme-speed', 'fire-fang'] },
      { species: 'centiskorch', level: 27, moves: ['fire-lash', 'coil', 'crunch', 'leech-life'] },
    ],
  },
  {
    id: 'swsh-bea',
    name: 'Bea',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Stow-on-Side Stadium',
    team: [
      {
        species: 'hitmontop',
        level: 34,
        moves: ['revenge', 'rapid-spin', 'triple-kick', 'detect'],
      },
      {
        species: 'pangoro',
        level: 34,
        moves: ['circle-throw', 'crunch', 'poison-jab', 'bullet-punch'],
      },
      {
        species: 'sirfetchd',
        level: 35,
        moves: ['close-combat', 'first-impression', 'brutal-swing', 'leaf-blade'],
      },
      {
        species: 'machamp',
        level: 36,
        moves: ['close-combat', 'bullet-punch', 'thunder-punch', 'ice-punch'],
      },
    ],
  },
  {
    id: 'swsh-opal',
    name: 'Opal',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Ballonlea Stadium',
    team: [
      {
        species: 'weezing-galar',
        level: 36,
        moves: ['strange-steam', 'sludge', 'tackle', 'fairy-wind'],
      },
      { species: 'mawile', level: 36, moves: ['play-rough', 'iron-head', 'crunch', 'fairy-wind'] },
      {
        species: 'togekiss',
        level: 37,
        moves: ['air-slash', 'dazzling-gleam', 'thunder-wave', 'ancient-power'],
      },
      {
        species: 'alcremie',
        level: 38,
        moves: ['dazzling-gleam', 'mystical-fire', 'recover', 'draining-kiss'],
      },
    ],
  },
  {
    id: 'swsh-gordie',
    name: 'Gordie',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Circhester Stadium',
    team: [
      {
        species: 'barbaracle',
        level: 40,
        moves: ['stone-edge', 'razor-shell', 'cross-chop', 'slash'],
      },
      { species: 'shuckle', level: 40, moves: ['rock-blast', 'sticky-web', 'toxic', 'wrap'] },
      {
        species: 'stonjourner',
        level: 41,
        moves: ['stone-edge', 'power-gem', 'wide-guard', 'stomping-tantrum'],
      },
      {
        species: 'coalossal',
        level: 42,
        moves: ['rock-blast', 'heat-crash', 'flare-blitz', 'stealth-rock'],
      },
    ],
  },
  {
    id: 'swsh-piers',
    name: 'Piers',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Spikemuth',
    team: [
      {
        species: 'scrafty',
        level: 44,
        moves: ['crunch', 'high-jump-kick', 'bulk-up', 'scary-face'],
      },
      {
        species: 'malamar',
        level: 45,
        moves: ['superpower', 'psycho-cut', 'night-slash', 'swagger'],
      },
      {
        species: 'skuntank',
        level: 45,
        moves: ['night-slash', 'flamethrower', 'sucker-punch', 'toxic'],
      },
      {
        species: 'obstagoon',
        level: 46,
        moves: ['night-slash', 'obstruct', 'hyper-voice', 'cross-chop'],
      },
    ],
  },
  {
    id: 'swsh-raihan',
    name: 'Raihan',
    trainerClass: 'Gym Leader',
    game: 'sword-shield',
    location: 'Hammerlocke Stadium',
    team: [
      {
        species: 'gigalith',
        level: 46,
        moves: ['rock-blast', 'solar-beam', 'sandstorm', 'stealth-rock'],
      },
      {
        species: 'flygon',
        level: 47,
        moves: ['dragon-claw', 'earth-power', 'crunch', 'sandstorm'],
      },
      {
        species: 'sandaconda',
        level: 46,
        moves: ['coil', 'sand-tomb', 'earthquake', 'rock-slide'],
      },
      {
        species: 'duraludon',
        level: 48,
        moves: ['dragon-claw', 'flash-cannon', 'sandstorm', 'metal-claw'],
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

  // ─── Scarlet / Violet ──────────────────────────────────────────────────────
  {
    id: 'sv-katy',
    name: 'Katy',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Cortondo Gym',
    team: [
      { species: 'nymble', level: 14, moves: ['nuzzle', 'bug-bite', 'feint', 'struggle-bug'] },
      {
        species: 'tarountula',
        level: 14,
        moves: ['string-shot', 'bug-bite', 'lunge', 'struggle-bug'],
      },
      { species: 'teddiursa', level: 15, moves: ['bug-bite', 'fury-swipes', 'scratch', 'lick'] },
    ],
  },
  {
    id: 'sv-brassius',
    name: 'Brassius',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Artazon Gym',
    team: [
      { species: 'smoliv', level: 16, moves: ['razor-leaf', 'absorb', 'growth', 'struggle-bug'] },
      { species: 'petilil', level: 16, moves: ['sleep-powder', 'absorb', 'mega-drain', 'round'] },
      { species: 'sudowoodo', level: 17, moves: ['trailblaze', 'rock-throw', 'copycat', 'flail'] },
    ],
  },
  {
    id: 'sv-iono',
    name: 'Iono',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Levincia Gym',
    team: [
      { species: 'wattrel', level: 23, moves: ['charge', 'wing-attack', 'shock-wave', 'peck'] },
      {
        species: 'bellibolt',
        level: 23,
        moves: ['spark', 'water-gun', 'mud-slap', 'thunder-wave'],
      },
      { species: 'luxio', level: 23, moves: ['spark', 'bite', 'leer', 'charge'] },
      {
        species: 'mismagius',
        level: 24,
        moves: ['charge-beam', 'shadow-ball', 'mystical-fire', 'power-gem'],
      },
    ],
  },
  {
    id: 'sv-kofu',
    name: 'Kofu',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Cascarrafa Gym',
    team: [
      { species: 'veluza', level: 29, moves: ['fillet-away', 'slash', 'water-pulse', 'pluck'] },
      {
        species: 'wugtrio',
        level: 29,
        moves: ['water-gun', 'mud-slap', 'magnitude', 'sucker-punch'],
      },
      {
        species: 'crabominable',
        level: 30,
        moves: ['ice-punch', 'crabhammer', 'low-kick', 'flail'],
      },
    ],
  },
  {
    id: 'sv-larry',
    name: 'Larry',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Medali Gym',
    team: [
      { species: 'komala', level: 35, moves: ['headbutt', 'yawn', 'play-rough', 'slash'] },
      {
        species: 'dudunsparce',
        level: 35,
        moves: ['body-slam', 'hyper-drill', 'glare', 'take-down'],
      },
      {
        species: 'staraptor',
        level: 36,
        moves: ['brave-bird', 'close-combat', 'quick-attack', 'final-gambit'],
      },
    ],
  },
  {
    id: 'sv-ryme',
    name: 'Ryme',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Montenevera Gym',
    team: [
      {
        species: 'banette',
        level: 41,
        moves: ['shadow-ball', 'will-o-wisp', 'skill-swap', 'shadow-sneak'],
      },
      {
        species: 'mimikyu',
        level: 41,
        moves: ['shadow-sneak', 'wood-hammer', 'play-rough', 'shadow-claw'],
      },
      {
        species: 'houndstone',
        level: 41,
        moves: ['phantom-force', 'crunch', 'shadow-ball', 'yawn'],
      },
      { species: 'toxtricity', level: 42, moves: ['hex', 'noxious-torque', 'spark', 'venoshock'] },
    ],
  },
  {
    id: 'sv-tulip',
    name: 'Tulip',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Alfornada Gym',
    team: [
      {
        species: 'farigiraf',
        level: 44,
        moves: ['psychic', 'hyper-voice', 'reflect', 'bullet-seed'],
      },
      {
        species: 'espathra',
        level: 44,
        moves: ['lumina-crash', 'psychic', 'calm-mind', 'feather-dance'],
      },
      {
        species: 'gardevoir',
        level: 45,
        moves: ['psychic', 'calm-mind', 'mystical-fire', 'draining-kiss'],
      },
      { species: 'florges', level: 45, moves: ['moonblast', 'psychic', 'grass-knot', 'synthesis'] },
    ],
  },
  {
    id: 'sv-grusha',
    name: 'Grusha',
    trainerClass: 'Gym Leader',
    game: 'scarlet-violet',
    location: 'Glaseado Gym',
    team: [
      {
        species: 'frosmoth',
        level: 47,
        moves: ['blizzard', 'bug-buzz', 'ice-scales', 'quiver-dance'],
      },
      {
        species: 'beartic',
        level: 47,
        moves: ['icicle-crash', 'icy-wind', 'swords-dance', 'superpower'],
      },
      {
        species: 'cetitan',
        level: 47,
        moves: ['icicle-crash', 'belly-drum', 'amnesia', 'liquidation'],
      },
      {
        species: 'altaria',
        level: 48,
        moves: ['ice-beam', 'moonblast', 'dragon-pulse', 'perish-song'],
      },
    ],
  },
  {
    id: 'sv-rika',
    name: 'Rika',
    trainerClass: 'Elite Four',
    game: 'scarlet-violet',
    location: 'Pokémon League',
    team: [
      {
        species: 'whiscash',
        level: 57,
        ability: 'oblivious',
        moves: ['earth-power', 'scald', 'yawn', 'blizzard'],
      },
      {
        species: 'camerupt',
        level: 57,
        ability: 'solid-rock',
        moves: ['earth-power', 'flamethrower', 'yawn', 'ancient-power'],
      },
      {
        species: 'donphan',
        level: 57,
        ability: 'sturdy',
        moves: ['earthquake', 'head-smash', 'ice-shard', 'stealth-rock'],
      },
      {
        species: 'dugtrio-alola',
        level: 57,
        ability: 'tangling-hair',
        moves: ['earthquake', 'iron-head', 'sucker-punch', 'sand-tomb'],
      },
      {
        species: 'garchomp',
        level: 58,
        ability: 'sand-veil',
        moves: ['earthquake', 'dragon-claw', 'crunch', 'poison-jab'],
      },
    ],
  },
  {
    id: 'sv-poppy',
    name: 'Poppy',
    trainerClass: 'Elite Four',
    game: 'scarlet-violet',
    location: 'Pokémon League',
    team: [
      {
        species: 'copperajah',
        level: 58,
        ability: 'sheer-force',
        moves: ['iron-head', 'earthquake', 'heavy-slam', 'play-rough'],
      },
      {
        species: 'magnezone',
        level: 58,
        ability: 'magnet-pull',
        moves: ['thunderbolt', 'flash-cannon', 'thunder-wave', 'volt-switch'],
      },
      {
        species: 'bronzong',
        level: 58,
        ability: 'heatproof',
        moves: ['flash-cannon', 'future-sight', 'calm-mind', 'hypnosis'],
      },
      {
        species: 'corviknight',
        level: 58,
        ability: 'pressure',
        moves: ['brave-bird', 'iron-head', 'bulk-up', 'roost'],
      },
      {
        species: 'tinkaton',
        level: 59,
        ability: 'mold-breaker',
        moves: ['gigaton-hammer', 'play-rough', 'encore', 'stealth-rock'],
      },
    ],
  },
  {
    id: 'sv-hassel',
    name: 'Hassel',
    trainerClass: 'Elite Four',
    game: 'scarlet-violet',
    location: 'Pokémon League',
    team: [
      {
        species: 'noivern',
        level: 58,
        ability: 'infiltrator',
        moves: ['dragon-pulse', 'boomburst', 'hurricane', 'flamethrower'],
      },
      {
        species: 'flapple',
        level: 58,
        ability: 'hustle',
        moves: ['dragon-rush', 'grav-apple', 'acrobatics', 'recycle'],
      },
      {
        species: 'haxorus',
        level: 58,
        ability: 'mold-breaker',
        moves: ['dragon-dance', 'outrage', 'earthquake', 'swords-dance'],
      },
      {
        species: 'dragalge',
        level: 58,
        ability: 'adaptability',
        moves: ['dragon-pulse', 'sludge-wave', 'focus-blast', 'toxic'],
      },
      {
        species: 'baxcalibur',
        level: 59,
        ability: 'thermal-exchange',
        moves: ['glaive-rush', 'ice-shard', 'dragon-dance', 'crunch'],
      },
    ],
  },
  {
    id: 'sv-geeta',
    name: 'Geeta',
    trainerClass: 'Champion',
    game: 'scarlet-violet',
    location: 'Pokémon League',
    team: [
      {
        species: 'espathra',
        level: 60,
        ability: 'speed-boost',
        moves: ['lumina-crash', 'calm-mind', 'psychic', 'shadow-ball'],
      },
      {
        species: 'veluza',
        level: 60,
        ability: 'sharpness',
        moves: ['fillet-away', 'psycho-cut', 'aqua-cutter', 'slash'],
      },
      {
        species: 'avalugg-hisui',
        level: 60,
        ability: 'sturdy',
        moves: ['avalanche', 'iron-defense', 'crunch', 'rock-slide'],
      },
      {
        species: 'gogoat',
        level: 60,
        ability: 'sap-sipper',
        moves: ['horn-leech', 'milk-drink', 'body-slam', 'earth-power'],
      },
      {
        species: 'kingambit',
        level: 61,
        ability: 'defiant',
        moves: ['kowtow-cleave', 'iron-head', 'sucker-punch', 'swords-dance'],
      },
      {
        species: 'glimmora',
        level: 62,
        ability: 'toxic-debris',
        moves: ['power-gem', 'sludge-wave', 'earth-power', 'mortal-spin'],
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
