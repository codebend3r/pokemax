// The Pokédex indexes — everything the grid, search, filters, and the
// Pokémon card read — each fetched once per session behind a `memoAsync`.
import { memoAsync } from '@/async';
import { fetchEvolutionChain, fetchGenerationList, fetchPokemon, fetchSpecies } from '@/api';
import { GENERATIONS } from '@/generations';
import { TYPES, type PokeType } from '@/typeChart';
import type { FormCategory, Gen8Species } from '@/types';

const BASE = 'https://pokeapi.co/api/v2';

/** Every base species across all generations, national-dex order. */
export const speciesIndex = memoAsync(async (): Promise<Gen8Species[]> => {
  const lists = await Promise.all(GENERATIONS.map((g) => fetchGenerationList(g.num)));
  return lists.flat().sort((a, b) => a.id - b.id);
});

const FORM_LABEL_OVERRIDES: Record<string, string> = {
  alola: 'Alolan',
  galar: 'Galarian',
  hisui: 'Hisuian',
  paldea: 'Paldean',
  'paldea-combat': 'Paldean Combat',
  'paldea-blaze': 'Paldean Blaze',
  'paldea-aqua': 'Paldean Aqua',
  mega: 'Mega',
  'mega-x': 'Mega X',
  'mega-y': 'Mega Y',
  gmax: 'Gigantamax',
  'gmax-single-strike': 'Gmax Single Strike',
  'gmax-rapid-strike': 'Gmax Rapid Strike',
  'low-key-gmax': 'Gmax Low Key',
  'amped-gmax': 'Gmax Amped',
  primal: 'Primal',
  origin: 'Origin',
  ash: 'Ash',
  totem: 'Totem',
  zen: 'Zen Mode',
  'galar-zen': 'Galarian Zen',
  busted: 'Busted',
  crowned: 'Crowned',
  hero: 'Hero',
  ice: 'Ice Rider',
  shadow: 'Shadow Rider',
  'low-key': 'Low Key',
  amped: 'Amped',
  'single-strike': 'Single Strike',
  'rapid-strike': 'Rapid Strike',
  'three-segment': 'Three-Segment',
  'family-of-three': 'Family of Three',
  'family-of-four': 'Family of Four',
  hangry: 'Hangry',
  noice: 'Noice',
  blade: 'Blade',
  therian: 'Therian',
  incarnate: 'Incarnate',
  resolute: 'Resolute',
  pirouette: 'Pirouette',
  black: 'Black Kyurem',
  white: 'White Kyurem',
  attack: 'Attack',
  defense: 'Defense',
  speed: 'Speed',
  altered: 'Altered',
  sky: 'Sky',
  female: 'Female',
  male: 'Male',
  eternamax: 'Eternamax',
};

function prettifyForm(suffix: string): string {
  return (
    FORM_LABEL_OVERRIDES[suffix] ??
    suffix
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
  );
}

function categorizeForm(suffix: string): FormCategory {
  if (/^mega(-[xy])?$/.test(suffix) || suffix === 'primal') return 'mega';
  if (suffix === 'gmax' || suffix.startsWith('gmax-') || suffix.endsWith('-gmax')) return 'gmax';
  if (/^(alola|galar|hisui|paldea)(-|$)/.test(suffix)) return 'regional';
  return 'other';
}

/** Alternate forms (Mega, Gmax, regional, battle forms), matched to their base species. */
export const formIndex = memoAsync(async (): Promise<Gen8Species[]> => {
  const [species, r] = await Promise.all([
    speciesIndex.get(),
    fetch(`${BASE}/pokemon?limit=20000`),
  ]);
  if (!r.ok) throw new Error('Failed to load alternate forms');
  const j = (await r.json()) as { results: { name: string; url: string }[] };
  const byName = new Map(species.map((s) => [s.name, s]));

  const forms: Gen8Species[] = [];
  for (const entry of j.results) {
    const m = entry.url.match(/\/pokemon\/(\d+)\/?$/);
    if (!m) continue;
    const id = parseInt(m[1], 10);
    if (id < 10000) continue; // skip base species (already in main list)

    // Match the form's name to a parent species by trying progressively shorter
    // dash-separated prefixes. e.g. 'charizard-mega-x' → tries 'charizard-mega'
    // then 'charizard'. The previous loop bailed out before checking single-segment
    // names, which meant nothing ever matched and the forms array stayed empty.
    const parts = entry.name.split('-');
    let base: Gen8Species | undefined;
    let suffix = '';
    for (let i = parts.length - 1; i >= 1; i--) {
      const candidate = parts.slice(0, i).join('-');
      base = byName.get(candidate);
      if (base) {
        suffix = entry.name.slice(candidate.length + 1);
        break;
      }
    }
    if (!base || !suffix) continue;

    forms.push({
      name: entry.name,
      id,
      gen: base.gen,
      speciesName: base.name,
      formLabel: prettifyForm(suffix),
      formCategory: categorizeForm(suffix),
    });
  }
  return forms.sort((a, b) => a.id - b.id);
});

interface TypeResponse {
  pokemon: { slot: number; pokemon: { name: string; url: string } }[];
}

async function fetchTypeIndex(): Promise<Map<number, PokeType[]>> {
  const responses = await Promise.all(
    TYPES.map(async (t) => {
      const r = await fetch(`${BASE}/type/${t}`);
      if (!r.ok) throw new Error(`type/${t} failed`);
      const j = (await r.json()) as TypeResponse;
      return { type: t, body: j };
    }),
  );
  const map = new Map<number, PokeType[]>();
  for (const { type, body } of responses) {
    for (const entry of body.pokemon) {
      const m = entry.pokemon.url.match(/\/pokemon\/(\d+)\/?$/);
      if (!m) continue;
      const id = parseInt(m[1], 10);
      const list = map.get(id) ?? [];
      list[entry.slot - 1] = type;
      map.set(id, list);
    }
  }
  for (const [k, v] of map) {
    map.set(
      k,
      v.filter((t): t is PokeType => Boolean(t)),
    );
  }
  return map;
}

/** Pokémon id → its types, built from the 18 type endpoints fetched in parallel. */
export const typeIndex = memoAsync(fetchTypeIndex);

/**
 * `/pokemon/{id}` or `/pokemon/{name}`. Base species are fetched by id: a
 * species name is not always a Pokémon name (`deoxys` vs `deoxys-normal`).
 */
export const pokemonData = memoAsync(fetchPokemon);

/** A species plus its evolution chain — the chain URL only comes from the species. */
export const speciesDetails = memoAsync(async (name: string) => {
  const species = await fetchSpecies(name);
  const chain = await fetchEvolutionChain(species.evolution_chain.url);
  return { species, chain };
});
