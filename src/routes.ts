export type Dimension = '2d' | '3d';
export type Variant = 'normal' | 'shiny';
/** Form key — `base` means the default variety; anything else is the variety-slug suffix. */
export type Form = string;

export interface PokedexSearch {
  dimension: Dimension;
  variant: Variant;
  form: Form;
}

const DEFAULTS: PokedexSearch = {
  dimension: '2d',
  variant: 'normal',
  form: 'base',
};

export function pokedexPath(name?: string, query?: Partial<PokedexSearch>): string {
  const base = name ? `/pokedex/${name}` : '/pokedex';
  if (!query) return base;
  const search = buildPokedexSearch({ ...DEFAULTS, ...query });
  return search ? `${base}?${search}` : base;
}

export function trainersPath(): string {
  return '/trainers';
}

export function teamsPath(): string {
  return '/teams';
}

export function parsePokedexSearch(search: string): PokedexSearch {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  const rawDim = params.get('dimension');
  const dimension: Dimension = rawDim === '3d' ? '3d' : '2d';

  const rawVar = params.get('variant');
  const variant: Variant = rawVar === 'shiny' ? 'shiny' : 'normal';

  const rawForm = params.get('form');
  const form: Form = rawForm && rawForm.trim() ? rawForm : 'base';

  return { dimension, variant, form };
}

export function buildPokedexSearch(state: PokedexSearch): string {
  const params = new URLSearchParams();
  if (state.dimension !== DEFAULTS.dimension) params.set('dimension', state.dimension);
  if (state.variant !== DEFAULTS.variant) params.set('variant', state.variant);
  if (state.form !== DEFAULTS.form) params.set('form', state.form);
  return params.toString();
}

/** `(species='charizard', form='mega-x')` → `'charizard-mega-x'`; `form='base'` → `'charizard'`. */
export function varietyFromForm(species: string, form: Form): string {
  if (form === 'base' || form === '') return species;
  return `${species}-${form}`;
}

/** Inverse: `(species='charizard', variety='charizard-mega-x')` → `'mega-x'`. */
export function formFromVariety(species: string, variety: string): Form {
  if (variety === species) return 'base';
  const prefix = `${species}-`;
  if (variety.startsWith(prefix)) return variety.slice(prefix.length);
  return 'base';
}
