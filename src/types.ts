export interface Gen8ListResponse {
  pokemon_species: { name: string; url: string }[];
}

export type FormCategory = 'mega' | 'gmax' | 'regional' | 'other';

export interface Gen8Species {
  name: string; // pokemon endpoint name (may include form suffix, e.g. 'charizard-mega-x')
  id: number; // /pokemon/{id} works for both base species and forms
  gen: number;
  /** Species (parent) name used for /pokemon-species/{name}. Defaults to `name` if absent. */
  speciesName?: string;
  /** Human-readable form label, only set for non-default forms (e.g. "Mega X", "Gigantamax"). */
  formLabel?: string;
  /** Category of alternate form. Absent on default species. */
  formCategory?: FormCategory;
}

export interface PokemonResponse {
  id: number;
  name: string;
  /** Decimetres (1 = 10 cm) — divide by 10 for metres */
  height: number;
  /** Hectograms (1 = 100 g) — divide by 10 for kilograms */
  weight: number;
  cries?: {
    latest: string | null;
    legacy: string | null;
  };
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
        front_shiny: string | null;
      };
      home?: {
        front_default: string | null;
        front_shiny: string | null;
      };
      showdown?: {
        front_default: string | null;
        front_shiny: string | null;
      };
    };
  };
  types: { slot: number; type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean; slot: number }[];
  moves: {
    move: { name: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
      version_group: { name: string };
    }[];
  }[];
}

export interface SpeciesResponse {
  name: string;
  evolution_chain: { url: string };
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  genera: { genus: string; language: { name: string } }[];
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: { name: string };
  item: { name: string } | null;
  held_item: { name: string } | null;
  known_move: { name: string } | null;
  min_happiness: number | null;
  time_of_day: string;
  location: { name: string } | null;
  needs_overworld_rain: boolean;
  gender: number | null;
}

export interface ChainLink {
  species: { name: string };
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChainResponse {
  chain: ChainLink;
}

export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor' | string;

export interface GroupedMove {
  name: string;
  level: number;
  method: LearnMethod;
}
