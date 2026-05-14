// prettier-ignore
export const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

export type PokeType = (typeof TYPES)[number];

const X = 0.5; // resists
const O = 0; // immune
const D = 2; // double (super effective)

// prettier-ignore
const EFFECTIVENESS: Record<PokeType, Partial<Record<PokeType, number>>> = {
  normal:   { fighting: D, ghost: O },
  fire:     { fire: X, water: D, grass: X, ice: X, ground: D, bug: X, rock: D, steel: X, fairy: X },
  water:    { fire: X, water: X, electric: D, grass: D, ice: X, steel: X },
  electric: { electric: X, ground: D, flying: X, steel: X },
  grass:    { fire: D, water: X, electric: X, grass: X, ice: D, poison: D, ground: X, flying: D, bug: D },
  ice:      { fire: D, ice: X, fighting: D, rock: D, steel: D },
  fighting: { flying: D, psychic: D, bug: X, rock: X, dark: X, fairy: D },
  poison:   { grass: X, fighting: X, poison: X, ground: D, psychic: D, bug: X, fairy: X },
  ground:   { water: D, electric: O, grass: D, ice: D, poison: X, rock: X },
  flying:   { electric: D, grass: X, ice: D, fighting: X, ground: O, bug: X, rock: D },
  psychic:  { fighting: X, psychic: X, bug: D, ghost: D, dark: D },
  bug:      { fire: D, grass: X, fighting: X, ground: X, flying: D, rock: D },
  rock:     { normal: X, fire: X, water: D, grass: D, fighting: D, poison: X, ground: D, flying: X, steel: D },
  ghost:    { normal: O, fighting: O, poison: X, bug: X, ghost: D, dark: D },
  dragon:   { fire: X, water: X, electric: X, grass: X, ice: D, dragon: D, fairy: D },
  dark:     { fighting: D, psychic: O, bug: D, ghost: X, dark: X, fairy: D },
  steel:    { normal: X, fire: D, grass: X, ice: X, fighting: D, poison: O, ground: D, flying: X, psychic: X, bug: X, rock: X, dragon: X, steel: X, fairy: X },
  fairy:    { fighting: X, poison: D, bug: X, dragon: O, dark: X, steel: D },
};

export interface Matchup {
  type: PokeType;
  multiplier: number;
}

export function defensiveMatchups(types: PokeType[]): Matchup[] {
  return TYPES.map((attacking) => {
    let m = 1;
    for (const def of types) {
      const row = EFFECTIVENESS[def];
      const v = row[attacking];
      if (v === undefined) continue;
      m *= v;
    }
    return { type: attacking, multiplier: m };
  });
}

export interface MatchupGroups {
  weak4x: Matchup[];
  weak2x: Matchup[];
  resist2x: Matchup[];
  resist4x: Matchup[];
  immune: Matchup[];
}

export function groupMatchups(matchups: Matchup[]): MatchupGroups {
  const groups: MatchupGroups = { weak4x: [], weak2x: [], resist2x: [], resist4x: [], immune: [] };
  for (const m of matchups) {
    if (m.multiplier === 0) groups.immune.push(m);
    else if (m.multiplier === 4) groups.weak4x.push(m);
    else if (m.multiplier === 2) groups.weak2x.push(m);
    else if (m.multiplier === 0.5) groups.resist2x.push(m);
    else if (m.multiplier === 0.25) groups.resist4x.push(m);
  }
  return groups;
}

export const TYPE_COLORS: Record<PokeType, string> = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};
