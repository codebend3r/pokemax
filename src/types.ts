// PokéAPI response shapes, each beside the guard that checks it where it
// enters the app (`getJson` in `api.ts`). Guards check what the app reads.
import { isNamed, isRecord, isResource } from '@/guards';

function isNullable<T>(v: unknown, isT: (x: unknown) => x is T): v is T | null {
  return v === null || isT(v);
}
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number';

export interface GenerationResponse {
  pokemon_species: { name: string; url: string }[];
}

export function isGenerationResponse(v: unknown): v is GenerationResponse {
  return isRecord(v) && Array.isArray(v.pokemon_species) && v.pokemon_species.every(isResource);
}

/** `/pokemon?limit=…` — every variety, base species and alternate forms alike. */
export interface PokemonListResponse {
  results: { name: string; url: string }[];
}

export function isPokemonListResponse(v: unknown): v is PokemonListResponse {
  return isRecord(v) && Array.isArray(v.results) && v.results.every(isResource);
}

export interface TypeResponse {
  pokemon: { slot: number; pokemon: { name: string; url: string } }[];
}

export function isTypeResponse(v: unknown): v is TypeResponse {
  return (
    isRecord(v) &&
    Array.isArray(v.pokemon) &&
    v.pokemon.every((p) => isRecord(p) && isNumber(p.slot) && isResource(p.pokemon))
  );
}

export type FormCategory = 'mega' | 'gmax' | 'regional' | 'other';

/** A base species in the Pokédex index. */
export interface BaseSpecies {
  kind: 'species';
  /** Species slug — `/pokemon-species/{name}`. */
  name: string;
  /** National dex number — `/pokemon/{id}` returns the default variety. */
  id: number;
  gen: number;
}

/** An alternate form (Mega, Gmax, regional, battle form) listed beside its species. */
export interface AltForm {
  kind: 'form';
  /** Variety slug, e.g. `charizard-mega-x`. */
  name: string;
  /** PokéAPI's 10000+ variety id. */
  id: number;
  /** The parent species' generation. */
  gen: number;
  speciesName: string;
  speciesId: number;
  /** Human-readable label, e.g. "Mega X", "Gigantamax". */
  formLabel: string;
  formCategory: FormCategory;
}

export type DexEntry = BaseSpecies | AltForm;

/** The species to fetch `/pokemon-species/` for — a form's parent, or the species itself. */
export function speciesNameOf(entry: DexEntry): string {
  return entry.kind === 'form' ? entry.speciesName : entry.name;
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

function isSpritePair(v: unknown): boolean {
  return (
    isRecord(v) && isNullable(v.front_default, isString) && isNullable(v.front_shiny, isString)
  );
}

export function isPokemonResponse(v: unknown): v is PokemonResponse {
  return (
    isRecord(v) &&
    isNumber(v.id) &&
    isString(v.name) &&
    isNumber(v.height) &&
    isNumber(v.weight) &&
    (v.cries === undefined ||
      (isRecord(v.cries) &&
        isNullable(v.cries.latest, isString) &&
        isNullable(v.cries.legacy, isString))) &&
    isSpritePair(v.sprites) &&
    isRecord(v.sprites) &&
    isRecord(v.sprites.other) &&
    isSpritePair(v.sprites.other['official-artwork']) &&
    Array.isArray(v.types) &&
    v.types.every((t) => isRecord(t) && isNumber(t.slot) && isNamed(t.type)) &&
    Array.isArray(v.stats) &&
    v.stats.every((st) => isRecord(st) && isNumber(st.base_stat) && isNamed(st.stat)) &&
    Array.isArray(v.abilities) &&
    v.abilities.every(
      (a) =>
        isRecord(a) && isNamed(a.ability) && typeof a.is_hidden === 'boolean' && isNumber(a.slot),
    ) &&
    Array.isArray(v.moves) &&
    v.moves.every(
      (m) =>
        isRecord(m) &&
        isNamed(m.move) &&
        Array.isArray(m.version_group_details) &&
        m.version_group_details.every(
          (d) =>
            isRecord(d) &&
            isNumber(d.level_learned_at) &&
            isNamed(d.move_learn_method) &&
            isNamed(d.version_group),
        ),
    )
  );
}

export interface SpeciesResponse {
  name: string;
  /** `generation-i` … — `idFromUrl(url)` is the generation number. */
  generation: { name: string; url: string };
  evolution_chain: { url: string };
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  genera: { genus: string; language: { name: string } }[];
}

export function isSpeciesResponse(v: unknown): v is SpeciesResponse {
  return (
    isRecord(v) &&
    isString(v.name) &&
    isResource(v.generation) &&
    isRecord(v.evolution_chain) &&
    isString(v.evolution_chain.url) &&
    Array.isArray(v.varieties) &&
    v.varieties.every(
      (x) => isRecord(x) && typeof x.is_default === 'boolean' && isResource(x.pokemon),
    ) &&
    Array.isArray(v.flavor_text_entries) &&
    v.flavor_text_entries.every(
      (e) => isRecord(e) && isString(e.flavor_text) && isNamed(e.language) && isNamed(e.version),
    ) &&
    Array.isArray(v.genera) &&
    v.genera.every((g) => isRecord(g) && isString(g.genus) && isNamed(g.language))
  );
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

function isChainLink(v: unknown): v is ChainLink {
  return (
    isRecord(v) &&
    isNamed(v.species) &&
    Array.isArray(v.evolution_details) &&
    v.evolution_details.every((d) => isRecord(d) && isNamed(d.trigger)) &&
    Array.isArray(v.evolves_to) &&
    v.evolves_to.every(isChainLink)
  );
}

export function isEvolutionChainResponse(v: unknown): v is EvolutionChainResponse {
  return isRecord(v) && isChainLink(v.chain);
}

export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor' | string;

export interface GroupedMove {
  name: string;
  level: number;
  method: LearnMethod;
}

export interface EffectEntry {
  short_effect?: string;
  effect?: string;
  language: { name: string };
}

function isEffectEntries(v: unknown): v is EffectEntry[] {
  return (
    Array.isArray(v) &&
    v.every(
      (e) =>
        isRecord(e) &&
        isNamed(e.language) &&
        (e.short_effect === undefined || isString(e.short_effect)) &&
        (e.effect === undefined || isString(e.effect)),
    )
  );
}

export interface MoveResponse {
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  damage_class: { name: string };
  type: { name: string };
  effect_entries: EffectEntry[];
}

export function isMoveResponse(v: unknown): v is MoveResponse {
  return (
    isRecord(v) &&
    isNullable(v.power, isNumber) &&
    isNullable(v.accuracy, isNumber) &&
    isNullable(v.pp, isNumber) &&
    isNumber(v.priority) &&
    isNamed(v.damage_class) &&
    isNamed(v.type) &&
    isEffectEntries(v.effect_entries)
  );
}

export interface AbilityResponse {
  effect_entries: EffectEntry[];
}

export function isAbilityResponse(v: unknown): v is AbilityResponse {
  return isRecord(v) && isEffectEntries(v.effect_entries);
}

export interface ItemResponse {
  effect_entries: EffectEntry[];
  flavor_text_entries: {
    text: string;
    language: { name: string };
    version_group?: { name: string };
  }[];
  category: { name: string };
}

export function isItemResponse(v: unknown): v is ItemResponse {
  return (
    isRecord(v) &&
    isEffectEntries(v.effect_entries) &&
    Array.isArray(v.flavor_text_entries) &&
    v.flavor_text_entries.every((e) => isRecord(e) && isString(e.text) && isNamed(e.language)) &&
    isNamed(v.category)
  );
}

export interface NatureResponse {
  increased_stat: { name: string } | null;
  decreased_stat: { name: string } | null;
}

export function isNatureResponse(v: unknown): v is NatureResponse {
  return (
    isRecord(v) && isNullable(v.increased_stat, isNamed) && isNullable(v.decreased_stat, isNamed)
  );
}
