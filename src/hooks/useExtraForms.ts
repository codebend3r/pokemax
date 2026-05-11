import { useEffect, useState } from 'react';
import type { FormCategory, Gen8Species } from '../types';

const URL = 'https://pokeapi.co/api/v2/pokemon?limit=20000';

let cache: Gen8Species[] | null = null;
let inflight: Promise<Gen8Species[]> | null = null;

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

async function fetchExtraForms(byName: Map<string, Gen8Species>): Promise<Gen8Species[]> {
  const r = await fetch(URL);
  if (!r.ok) throw new Error('Failed to load alternate forms');
  const j = (await r.json()) as { results: { name: string; url: string }[] };

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
}

export interface ExtraFormsState {
  forms: Gen8Species[];
  loading: boolean;
  error: string | null;
}

export function useExtraForms(species: Gen8Species[], enabled: boolean): ExtraFormsState {
  const [state, setState] = useState<ExtraFormsState>({
    forms: cache ?? [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;
    if (cache) {
      setState({ forms: cache, loading: false, error: null });
      return;
    }
    if (species.length === 0) return;

    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    if (!inflight) {
      const byName = new Map(species.map((s) => [s.name, s]));
      inflight = fetchExtraForms(byName);
    }
    inflight
      .then((f) => {
        cache = f;
        if (active) setState({ forms: f, loading: false, error: null });
      })
      .catch((e: Error) => {
        if (active) setState({ forms: [], loading: false, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [enabled, species]);

  return state;
}
