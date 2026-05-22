import type { GameId } from '@/trainers';

export interface TeamPick {
  /** PokeAPI species slug. */
  species: string;
  /** Short role label (`Starter`, `Sweeper`, `Tank`, `Pivot`, `Special Attacker`, etc.). */
  role: string;
  /** One-line rationale — why this pick for this game. */
  why: string;
}

export interface TeamBuild {
  /** Display title — usually `Recommended in-game team`. */
  title: string;
  /** Subtitle / context note. */
  note?: string;
  /** Up to 6 picks. */
  team: TeamPick[];
}

/**
 * Curated playthrough teams. Each entry is a "this gets you through the game"
 * recommendation, not a competitive build — the goal is fun + coverage + a
 * Pokémon that's actually obtainable early/mid game.
 *
 * Games without an entry simply don't appear in the TEAMS browser; expand the
 * list any time.
 */
export const TEAM_BUILDS: Partial<Record<GameId, TeamBuild>> = {
  'red-blue': {
    title: 'Kanto playthrough — balanced coverage',
    note: 'Catchable early, covers most Gym Leaders, anime-coded.',
    team: [
      {
        species: 'charizard',
        role: 'Starter / Special Attacker',
        why: 'Fire + Flying coverage, Wing Attack + Flamethrower carry late game.',
      },
      {
        species: 'pikachu',
        role: 'Speed Sweeper',
        why: 'Free Thunderstone, deletes Misty / Lt. Surge / Blaine / Lorelei.',
      },
      {
        species: 'alakazam',
        role: 'Special Wallbreaker',
        why: 'Highest Special in Gen 1 — sweeps anything that isn’t Bug or Ghost.',
      },
      {
        species: 'snorlax',
        role: 'Tank',
        why: 'Body Slam + Rest + huge HP pool. Only one in the wild — don’t skip Route 12.',
      },
      {
        species: 'gyarados',
        role: 'Mixed Attacker',
        why: 'Magikarp grinder pays off. Hydro Pump + Hyper Beam crush most teams.',
      },
      {
        species: 'lapras',
        role: 'Coverage / Pivot',
        why: 'Free at Silph Co. Ice Beam + Surf covers Lance.',
      },
    ],
  },
  'gold-silver': {
    title: 'Johto playthrough — type variety',
    note: 'Heavy on Gen 2 newcomers so the regional dex actually matters.',
    team: [
      {
        species: 'typhlosion',
        role: 'Starter',
        why: 'Cyndaquil line is the most reliable Johto starter for in-game runs.',
      },
      {
        species: 'ampharos',
        role: 'Special Tank',
        why: 'Mareep on Route 32 — early Electric, evolves into a bulky sweeper.',
      },
      {
        species: 'crobat',
        role: 'Speed Pivot',
        why: 'Zubat is free; Crobat is one of the fastest, most evasive sweepers in Johto.',
      },
      {
        species: 'feraligatr',
        role: 'Physical Attacker',
        why: 'Optional Totodile trade or restart slot — Crunch + Surf coverage.',
      },
      {
        species: 'heracross',
        role: 'Wallbreaker',
        why: 'Found in headbuttable trees in Azalea — Megahorn is busted in Gen 2.',
      },
      {
        species: 'umbreon',
        role: 'Wall',
        why: 'Eevee is gifted in Goldenrod; Umbreon trivializes the Kanto rematch run.',
      },
    ],
  },
  emerald: {
    title: 'Hoenn playthrough — strong coverage',
    note: 'Picks revolve around the Hoenn Pokédex with broad type spread.',
    team: [
      {
        species: 'swampert',
        role: 'Starter / Tank',
        why: 'Mudkip is the easiest Hoenn run — one Grass weakness, otherwise unstoppable.',
      },
      {
        species: 'gardevoir',
        role: 'Special Attacker',
        why: 'Ralts in Route 102, becomes the strongest Special Attacker in Hoenn.',
      },
      {
        species: 'aggron',
        role: 'Physical Tank',
        why: 'Aron on Granite Cave — Iron Defense + Earthquake walks through most fights.',
      },
      {
        species: 'salamence',
        role: 'Pseudo-Legend Sweeper',
        why: 'Bagon at Meteor Falls. Rare grind, pays off through the Elite Four.',
      },
      {
        species: 'manectric',
        role: 'Speed Pivot',
        why: 'Early Electric, threatens Wattson rematch and Tate & Liza’s Xatu.',
      },
      {
        species: 'flygon',
        role: 'Coverage',
        why: 'Trapinch in the desert — Earthquake + Dragon coverage no other team member offers.',
      },
    ],
  },
  'diamond-pearl': {
    title: 'Sinnoh playthrough — pre-Platinum',
    note: 'Sinnoh’s base dex is thin on Fire and Fighting — this team patches that.',
    team: [
      {
        species: 'infernape',
        role: 'Starter / Sweeper',
        why: 'Only realistic Fire option in DP. Close Combat + Flare Blitz late.',
      },
      {
        species: 'staraptor',
        role: 'Physical Attacker',
        why: 'Starly is on Route 201; Staraptor is one of the best in-game birds ever.',
      },
      {
        species: 'luxray',
        role: 'Wallbreaker',
        why: 'Shinx in Floaroma Meadow — Intimidate + Crunch covers the Ghost-leader Fantina.',
      },
      {
        species: 'gastrodon',
        role: 'Tank',
        why: 'Shellos line resists Fire/Ice/Steel from Cynthia and walls most water types.',
      },
      {
        species: 'roserade',
        role: 'Special Attacker',
        why: 'Budew in Eterna Forest. Sleep Powder + Sludge Bomb is a brutal opener.',
      },
      {
        species: 'garchomp',
        role: 'Pseudo-Legend',
        why: 'Gible in Wayward Cave (early access). The strongest pre-Champion sweeper in DP.',
      },
    ],
  },
  'black-white': {
    title: 'Unova playthrough — Gen V only',
    note: 'BW only allows Gen 5 Pokémon until post-game — picks reflect that.',
    team: [
      {
        species: 'serperior',
        role: 'Starter / Pivot',
        why: 'Snivy line gets Coil + Leaf Blade — the best in-game Grass starter in Gen 5.',
      },
      {
        species: 'krookodile',
        role: 'Physical Sweeper',
        why: 'Sandile on Route 4 — Intimidate + Earthquake demolishes Elesa rematch and N.',
      },
      {
        species: 'haxorus',
        role: 'Wallbreaker',
        why: 'Axew in Mistralton Cave. Dragon Dance + Outrage = win condition.',
      },
      {
        species: 'chandelure',
        role: 'Special Sweeper',
        why: 'Litwick in Celestial Tower — highest Special Attack outside legendaries in BW.',
      },
      {
        species: 'excadrill',
        role: 'Coverage / Sand',
        why: 'Drilbur in the Desert Resort — Earthquake + Iron Head + Sand Rush sweeps.',
      },
      {
        species: 'jellicent',
        role: 'Tank',
        why: 'Frillish on Route 17. Water Absorb + Recover + Cursed Body walls Ghetsis’ Hydreigon.',
      },
    ],
  },
  'sword-shield': {
    title: 'Galar playthrough — Dynamax-ready',
    note: 'Picks all hit hard under Dynamax / Max Moves.',
    team: [
      {
        species: 'cinderace',
        role: 'Starter / Sweeper',
        why: 'Pyro Ball + Libero hidden ability post-game. Best Galar starter, period.',
      },
      {
        species: 'corviknight',
        role: 'Tank / Flyer',
        why: 'Rookidee on Route 1 — Pressure + Bulk Up walks through Bea / Allister.',
      },
      {
        species: 'toxapex',
        role: 'Wall',
        why: 'Mareanie at Outer Spikemuth. Regenerator + Toxic stalls Leon’s Charizard.',
      },
      {
        species: 'dragapult',
        role: 'Speed Sweeper',
        why: 'Dreepy in the Lake of Outrage — fastest Dragon in the game, Dragon Darts is insane.',
      },
      {
        species: 'mr-rime',
        role: 'Special Attacker',
        why: 'Galarian Mr. Mime evolves — Screens setter + Ice Beam coverage.',
      },
      {
        species: 'grimmsnarl',
        role: 'Disruptor',
        why: 'Impidimp in Glimwood Tangle. Prankster + Spirit Break + Thunder Wave under Dynamax.',
      },
    ],
  },
  'scarlet-violet': {
    title: 'Paldea playthrough — open-world',
    note: 'Catchable in the first half of the open world. Hard hits, fast clear.',
    team: [
      {
        species: 'meowscarada',
        role: 'Starter / Sweeper',
        why: 'Flower Trick is a guaranteed crit + can’t miss. Single-handed sweep button.',
      },
      {
        species: 'garganacl',
        role: 'Tank',
        why: 'Nacli in the South Province — Salt Cure stalls the Elite Four’s top end.',
      },
      {
        species: 'gholdengo',
        role: 'Wallbreaker',
        why: 'Make Believe puzzle in the open world. Make It Rain + Shadow Ball is unfair.',
      },
      {
        species: 'iron-bundle',
        role: 'Speed Sweeper',
        why: 'Area Zero — paradox Pokémon, fastest in the game with insane Ice/Water STAB.',
      },
      {
        species: 'tinkaton',
        role: 'Coverage',
        why: 'Tinkatink on West Province. Gigaton Hammer one-shots most Dragons / Fairies.',
      },
      {
        species: 'koraidon',
        role: 'Box Legendary',
        why: 'Story-mandatory in Scarlet. Collision Course turns the postgame Academy Ace tournament trivial.',
      },
    ],
  },
};

/** Ordered list of games that actually have a curated team. */
export const TEAM_GAMES: GameId[] = Object.keys(TEAM_BUILDS) as GameId[];
