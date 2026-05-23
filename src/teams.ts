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
  yellow: {
    title: 'Kanto playthrough — Pikachu locked',
    note: 'Pikachu is forced; fill the roster with early Kanto workhorses.',
    team: [
      {
        species: 'pikachu',
        role: 'Starter / Electric',
        why: 'Story-mandatory and gifted at the start — can’t deposit it, so lean into Thunder.',
      },
      {
        species: 'vaporeon',
        role: 'Bulky Water',
        why: 'Eevee gifted in Celadon — Vaporeon patches the Water gap left by the forced Pikachu start.',
      },
      {
        species: 'pidgeot',
        role: 'Physical Attacker / Flyer',
        why: 'Pidgey is free on Route 1; Pidgeot is the strongest fully evolved Normal flier in Kanto.',
      },
      {
        species: 'alakazam',
        role: 'Special Wallbreaker',
        why: 'Abra in Cerulean; highest Special in Gen 1 — covers everything Pikachu can’t.',
      },
      {
        species: 'machamp',
        role: 'Physical Tank',
        why: 'Machop in Rock Tunnel — Fighting coverage smashes Brock, Koga, and the E4 Dark gap.',
      },
      {
        species: 'lapras',
        role: 'Coverage / Pivot',
        why: 'Free at Silph Co.; Ice Beam + Surf handles Lance and acts as the team’s HM mule.',
      },
    ],
  },
  crystal: {
    title: 'Johto playthrough — Crystal edition',
    note: 'Suicune is woven into the story; the rest mirrors a GS-style balanced run.',
    team: [
      {
        species: 'typhlosion',
        role: 'Starter',
        why: 'Cyndaquil line is the most reliable Johto starter — Eruption access in Crystal.',
      },
      {
        species: 'ampharos',
        role: 'Special Tank',
        why: 'Mareep on Route 32; evolves into a bulky Electric sweeper that handles Karen’s Umbreon.',
      },
      {
        species: 'crobat',
        role: 'Speed Pivot',
        why: 'Zubat is everywhere; Crobat’s speed and Cross Poison overwhelm most Kanto Gym Leaders.',
      },
      {
        species: 'suicune',
        role: 'Bulky Water / Story Pick',
        why: 'Crystal-exclusive story encounter at the Tin Tower — Calm Mind + Surf walls both Lance and Red.',
      },
      {
        species: 'heracross',
        role: 'Wallbreaker',
        why: 'Headbutt trees near Azalea Town; Megahorn is the strongest physical move available in Gen 2.',
      },
      {
        species: 'espeon',
        role: 'Special Sweeper',
        why: 'Eevee gifted in Goldenrod; Morning evolution is easy — Psychic deletes Bruno and Koga.',
      },
    ],
  },
  'ruby-sapphire': {
    title: 'Hoenn playthrough — RS pre-Emerald',
    note: 'No guaranteed Bagon early; Sableye/Mawile version exclusives shape coverage.',
    team: [
      {
        species: 'swampert',
        role: 'Starter / Tank',
        why: 'Mudkip’s one Grass weakness barely matters — it carries nearly every Gym and the Elite Four.',
      },
      {
        species: 'gardevoir',
        role: 'Special Attacker',
        why: 'Ralts on Route 102; Psychic + Calm Mind sweeps Sidney and Phoebe.',
      },
      {
        species: 'aggron',
        role: 'Physical Tank',
        why: 'Aron in Granite Cave — Iron Defense + Earthquake walls Flannery and Wallace.',
      },
      {
        species: 'manectric',
        role: 'Speed Pivot',
        why: 'Electrike on Route 110; covers Wattson rematch and Tate & Liza’s Xatu before Salamence is reachable.',
      },
      {
        species: 'flygon',
        role: 'Coverage',
        why: 'Trapinch in the Safari Zone desert — Dragon + Ground covers most RS late-game trainers.',
      },
      {
        species: 'sharpedo',
        role: 'Physical Sweeper',
        why: 'Carvanha in the Safari Zone; Rough Skin + Crunch + Waterfall is the fastest Water attacker in RS.',
      },
    ],
  },
  'firered-leafgreen': {
    title: 'Kanto playthrough — FRLG remake',
    note: 'National Dex post-game unlocks Sevii Islands — team is built to also handle the Sevii rematches.',
    team: [
      {
        species: 'charizard',
        role: 'Starter / Special Attacker',
        why: 'Charmander is the hardest starter in Kanto but Flamethrower + Air Slash shreds the Sevii boss fights.',
      },
      {
        species: 'alakazam',
        role: 'Special Wallbreaker',
        why: 'Abra on Route 24; Psychic + Calm Mind is broken in Gen 3 — sweeps Lorelei and Agatha.',
      },
      {
        species: 'lapras',
        role: 'Bulky Water / Coverage',
        why: 'Free from a Silph Co. employee; Ice Beam + Surf covers Lance and the Sevii Island trainers.',
      },
      {
        species: 'snorlax',
        role: 'Tank',
        why: 'Route 12 / 16 blocker — huge HP and Body Slam are reliable late-game workhorses.',
      },
      {
        species: 'nidoking',
        role: 'Mixed Coverage',
        why: 'Nidoran male on Route 22; Moon Stone evolution early — Earthquake + Megahorn + Flamethrower covers 7 types.',
      },
      {
        species: 'jolteon',
        role: 'Speed Sweeper',
        why: 'Eevee in Celadon; Jolteon is the fastest Electric in FRLG and handles Lorelei’s water types.',
      },
    ],
  },
  platinum: {
    title: 'Sinnoh playthrough — Platinum enhanced',
    note: 'Expanded dex adds Magnemite early; altered gym order changes optimal picks vs DP.',
    team: [
      {
        species: 'empoleon',
        role: 'Starter / Pivot',
        why: 'Piplup covers the early gyms; Steel / Water typing is the best defensive profile in Sinnoh.',
      },
      {
        species: 'staraptor',
        role: 'Physical Attacker',
        why: 'Starly on Route 201; Close Combat availability in Platinum makes it even stronger than in DP.',
      },
      {
        species: 'magnezone',
        role: 'Special Tank',
        why: 'Magnemite available near Pastoria in Platinum; evolves to Magnezone in Mt. Coronet — Flash Cannon + Thunderbolt.',
      },
      {
        species: 'lucario',
        role: 'Mixed Sweeper',
        why: 'Riolu egg from Riley on Iron Island — Aura Sphere + Close Combat + Extreme Speed is broken.',
      },
      {
        species: 'garchomp',
        role: 'Pseudo-Legend',
        why: 'Gible in Wayward Cave — Dragon Rush + Earthquake carries the Distortion World and Cynthia.',
      },
      {
        species: 'roserade',
        role: 'Special Attacker',
        why: 'Budew in Eterna Forest; Sleep Powder slows the Frontier Brains and Cynthia’s Lucario.',
      },
    ],
  },
  'heartgold-soulsilver': {
    title: 'Johto playthrough — handles Lance AND Red',
    note: 'Red’s team peaks at Lv 88 — this roster is built to scale through post-game Kanto.',
    team: [
      {
        species: 'feraligatr',
        role: 'Starter / Physical Sweeper',
        why: 'Totodile’s Dragon Dance + Waterfall set destroys both Lance and Red’s Blastoise.',
      },
      {
        species: 'ampharos',
        role: 'Special Tank',
        why: 'Mareep on Route 32; the strongest non-legendary Electric in HGSS, handles Sabrina rematch.',
      },
      {
        species: 'heracross',
        role: 'Wallbreaker',
        why: 'Headbutt trees near Azalea; Close Combat in Gen 4 makes Megahorn even more redundant in a good way.',
      },
      {
        species: 'espeon',
        role: 'Special Sweeper',
        why: 'Eevee gifted in Goldenrod — Psychic + Signal Beam handles Koga, Will, and Red’s Espeon.',
      },
      {
        species: 'tyranitar',
        role: 'Pseudo-Legend / Sand',
        why: 'Larvitar in Mt. Silver post-game; Stone Edge + Crunch + Sandstorm softens Red’s whole team.',
      },
      {
        species: 'togekiss',
        role: 'Special Pivot',
        why: 'Togepi egg from Mr. Pokémon; Air Slash flinch hax + Serene Grace carries the Kanto gym rematches.',
      },
    ],
  },
  'black-2-white-2': {
    title: 'Unova playthrough — expanded dex',
    note: 'B2W2 allows non-Gen-5 Pokémon — mix in cross-gen picks unavailable in BW.',
    team: [
      {
        species: 'samurott',
        role: 'Starter / Physical Sweeper',
        why: 'Oshawott’s Razor Shell + Megahorn mix in B2W2 covers Iris’s Dragon types late.',
      },
      {
        species: 'lucario',
        role: 'Mixed Sweeper',
        why: 'Riolu in Floccesy Ranch (B2W2 exclusive early) — Aura Sphere + Close Combat is dominant.',
      },
      {
        species: 'magnezone',
        role: 'Special Tank',
        why: 'Magnemite in Virbank Complex — evolves at Chargestone Cave; Flash Cannon + Thunderbolt covers Iris.',
      },
      {
        species: 'krookodile',
        role: 'Physical Sweeper',
        why: 'Sandile on Route 4 — Intimidate + Earthquake + Crunch destroys the rematch Elite Four.',
      },
      {
        species: 'chandelure',
        role: 'Special Sweeper',
        why: 'Litwick in Celestial Tower — still highest non-legendary Special Attack and handles Clay + Iris.',
      },
      {
        species: 'flygon',
        role: 'Coverage',
        why: 'Trapinch in Relic Castle; available earlier in B2W2 — Dragon + Ground fills the gap BW left.',
      },
    ],
  },
  'omega-ruby-alpha-sapphire': {
    title: 'Hoenn remake — Mega Evolution run',
    note: 'Mega Stones available mid-game; build around the Mega starter of choice.',
    team: [
      {
        species: 'swampert',
        role: 'Starter / Mega Tank',
        why: 'Mega Swampert’s Swift Swim + Rain Dance turns it into the fastest Water attacker in ORAS.',
      },
      {
        species: 'gardevoir',
        role: 'Mega Special Attacker',
        why: 'Ralts on Route 102; Mega Gardevoir’s Pixilate Hyper Voice is uncounterable before the League.',
      },
      {
        species: 'flygon',
        role: 'Coverage / Flyer',
        why: 'Trapinch in the Desert — Earthquake + Dragon Claw covers the DexNav-hunted route trainers.',
      },
      {
        species: 'manectric',
        role: 'Mega Speed Pivot',
        why: 'Electrike on Route 110; Mega Manectric’s Intimidate switch resets are huge for the long ORAS postgame.',
      },
      {
        species: 'aggron',
        role: 'Mega Physical Wall',
        why: 'Aron in Granite Cave; Mega Aggron Filter + Heavy Slam tanks the Delta Episode Rayquaza fight.',
      },
      {
        species: 'latios',
        role: 'Special Sweeper / Story Pick',
        why: 'Alpha Sapphire story gift (Latias in OR) — Draco Meteor + Psychic clears the Elite Four rematch.',
      },
    ],
  },
  'sun-moon': {
    title: 'Alola playthrough — Island Trials',
    note: 'No Gyms — Z-Moves and Island Kahunas shape the run. Different picks than USUM.',
    team: [
      {
        species: 'incineroar',
        role: 'Starter / Physical Tank',
        why: 'Litten’s Darkest Lariat ignores stat boosts — perfect for Totem Pokémon that set up.',
      },
      {
        species: 'vikavolt',
        role: 'Special Attacker',
        why: 'Grubbin on Route 1; Vikavolt’s Thunderbolt + Bug Buzz handles Hala, Olivia, and Nanu.',
      },
      {
        species: 'mudsdale',
        role: 'Physical Tank',
        why: 'Mudbray in Paniola Ranch — Stamina ability snowballs under physical hits; Earthquake stacks.',
      },
      {
        species: 'wishiwashi',
        role: 'Bulky Water',
        why: 'School Form has the highest effective HP in Alola; Surf + Ice Beam covers Kahili and Hapu.',
      },
      {
        species: 'salazzle',
        role: 'Special Sweeper',
        why: 'Salandit in Wela Volcano Park — Corrosion ignores type immunities to Toxic, warping Totem fights.',
      },
      {
        species: 'kommo-o',
        role: 'Pseudo-Legend',
        why: 'Jangmo-o in Vast Poni Canyon — Dragon / Fighting STAB sweeps Hapu and the Elite Four late.',
      },
    ],
  },
  'ultra-sun-ultra-moon': {
    title: 'Alola playthrough — Ultra enhanced',
    note: 'Ultra Wormholes add cross-gen legends; Ultra Necrozma is the real final boss.',
    team: [
      {
        species: 'decidueye',
        role: 'Starter / Wallbreaker',
        why: 'Rowlet’s Spirit Shackle traps key threats; Ghost typing handles Acerola’s Trial in USUM.',
      },
      {
        species: 'lycanroc-midday',
        role: 'Physical Sweeper',
        why: 'Rockruff from a gift or early route — Accelerock priority + Stone Edge covers Totem Vikavolt.',
      },
      {
        species: 'toxapex',
        role: 'Wall',
        why: 'Mareanie from SOS chaining early; Regenerator + Toxic stalls Ultra Necrozma’s boosted hits.',
      },
      {
        species: 'kommo-o',
        role: 'Pseudo-Legend',
        why: 'Jangmo-o in Vast Poni Canyon — Clangorous Soulblaze Z-Move deletes Ultra Recon Squad.',
      },
      {
        species: 'magnezone',
        role: 'Special Tank',
        why: 'Magnemite on Blush Mountain; evolves at Vast Poni Canyon — Flash Cannon handles Fairy trials.',
      },
      {
        species: 'tapu-koko',
        role: 'Electric Terrain Setter',
        why: 'Mandatory encounter at Ruins of Conflict post-game; Electric Surge + Dazzling Gleam covers Lusamine.',
      },
    ],
  },
  'lets-go': {
    title: 'Kanto playthrough — Pikachu / Eevee edition',
    note: 'Dex capped at 151 + Meltan; anime-style picks with partner bonuses.',
    team: [
      {
        species: 'pikachu',
        role: 'Partner / Special Attacker',
        why: 'Partner Pikachu has perfect IVs and exclusive moves like Zippy Zap and Splishy Splash.',
      },
      {
        species: 'clefable',
        role: 'Special Tank',
        why: 'Clefairy in Mt. Moon — Magic Guard + Moonblast handles Koga and Agatha without poison damage.',
      },
      {
        species: 'machamp',
        role: 'Physical Wallbreaker',
        why: 'Machop in Rock Tunnel — Fighting STAB covers Brock, Giovanni, and the Elite Four Normal gap.',
      },
      {
        species: 'gyarados',
        role: 'Physical Sweeper',
        why: 'Magikarp fishing in the Safari Zone; Waterfall + Crunch is the strongest Water attacker in Let’s Go.',
      },
      {
        species: 'arcanine',
        role: 'Speed Pivot',
        why: 'Growlithe on Routes 7/8; Fire Stone evolution early — Flare Blitz + Extreme Speed covers Celadon.',
      },
      {
        species: 'dragonite',
        role: 'Pseudo-Legend',
        why: 'Dratini at the Game Corner or Safari Zone — Dragon Rush + Hurricane carries the post-game Master Trainers.',
      },
    ],
  },
  'brilliant-diamond-shining-pearl': {
    title: 'Sinnoh playthrough — BDSP remake',
    note: 'Grand Underground exclusives available mid-game; largely mirrors DP but with earlier access.',
    team: [
      {
        species: 'infernape',
        role: 'Starter / Sweeper',
        why: 'Chimchar is the best BDSP starter — Close Combat + Flare Blitz covers Cynthia’s whole team.',
      },
      {
        species: 'staraptor',
        role: 'Physical Attacker',
        why: 'Starly on Route 201; Close Combat makes it the best in-game bird in Sinnoh.',
      },
      {
        species: 'luxray',
        role: 'Wallbreaker',
        why: 'Shinx near Floaroma — Intimidate + Crunch covers Fantina and Flint in BDSP.',
      },
      {
        species: 'garchomp',
        role: 'Pseudo-Legend',
        why: 'Gible under Wayward Cave — Dragon Rush + Earthquake is the strongest pre-Champion finisher.',
      },
      {
        species: 'roserade',
        role: 'Special Attacker',
        why: 'Budew in Eterna Forest; Sleep Powder + Sludge Bomb opens every Grand Underground fight safely.',
      },
      {
        species: 'togekiss',
        role: 'Special Pivot',
        why: 'Togepi egg from Cynthia; Serene Grace Air Slash flinch is uniquely broken in the BDSP Battle Tower.',
      },
    ],
  },
  'legends-arceus': {
    title: 'Hisui open-world — strong styles',
    note: 'Action RPG mechanics reward high-damage styles over bulk. Prioritize Hisuian forms.',
    team: [
      {
        species: 'decidueye-hisui',
        role: 'Starter / Physical Attacker',
        why: 'Rowlet is available from the start; Hisuian Decidueye’s Triple Arrows is the strongest STAB in PLA.',
      },
      {
        species: 'typhlosion-hisui',
        role: 'Special Attacker',
        why: 'Cyndaquil option — Hisuian Typhlosion’s Calm Mind + Shadow Ball in Agile Style clears Noble Pokémon.',
      },
      {
        species: 'arcanine-hisui',
        role: 'Physical Tank',
        why: 'Growlithe in Cobalt Coastlands; Rock-type addition covers the Flying Nobles and Electrode.',
      },
      {
        species: 'ursaluna',
        role: 'Tank / Coverage',
        why: 'Teddiursa in Crimson Mirelands; Peat Block evolution at full moon — Headlong Rush wrecks every Noble.',
      },
      {
        species: 'sneasler',
        role: 'Physical Sweeper',
        why: 'Hisuian Sneasel in Coronet Highlands; Poison + Fighting STAB + Agile Claw Slash melts late bosses.',
      },
      {
        species: 'garchomp',
        role: 'Pseudo-Legend / Coverage',
        why: 'Gible in Crimson Mirelands — Strong Style Dragon Rush one-shots most Galaxy Team enforcers.',
      },
    ],
  },
};

/** Ordered list of games that actually have a curated team. */
export const TEAM_GAMES: GameId[] = Object.keys(TEAM_BUILDS) as GameId[];
