import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DexRoute } from '@/dex';
import { usePokemonView } from '@/hooks/usePokemonView';

const SPRITES = { front_default: null, front_shiny: null };
const pokemon = (id: number, name: string) => ({
  id,
  name,
  height: 1,
  weight: 1,
  sprites: { ...SPRITES, other: { 'official-artwork': SPRITES } },
  types: [],
  stats: [],
  abilities: [],
  moves: [],
});
const variety = (name: string, id: number, isDefault: boolean) => ({
  is_default: isDefault,
  pokemon: { name, url: `https://pokeapi.co/api/v2/pokemon/${id}/` },
});

// Each test uses its own species so the session memos never leak between them.
function serve(species: string, id: number, formId: number, opts: { formFails?: boolean } = {}) {
  let releaseForm: () => void = () => {};
  const formGate = new Promise<void>((r) => (releaseForm = r));
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.endsWith(`/pokemon-species/${species}`)) {
        return json({
          name: species,
          generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
          evolution_chain: { url: `https://pokeapi.co/api/v2/evolution-chain/${id}/` },
          varieties: [variety(species, id, true), variety(`${species}-mega`, formId, false)],
          flavor_text_entries: [],
          genera: [],
        });
      }
      if (url.includes('/evolution-chain/')) {
        return json({
          chain: { species: { name: species }, evolution_details: [], evolves_to: [] },
        });
      }
      if (url.endsWith(`/pokemon/${id}`)) return json(pokemon(id, species));
      if (url.endsWith(`/pokemon/${species}-mega`)) {
        await formGate;
        return opts.formFails
          ? new Response('', { status: 500 })
          : json(pokemon(formId, `${species}-mega`));
      }
      return new Response('', { status: 404 });
    }),
  );
  return releaseForm;
}

const route = (species: string, form: string, baseId: number): DexRoute => ({
  status: 'found',
  species,
  form,
  baseId,
  canonical: true,
});

describe('usePokemonView', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the default variety while a form loads, then the form', async () => {
    const release = serve('alpha', 9001, 19001);
    const { result } = renderHook(() => usePokemonView(route('alpha', 'mega', 9001)));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.status === 'ready' && result.current.data.pokemon.name).toBe('alpha');
    release();
    await waitFor(() =>
      expect(result.current.status === 'ready' && result.current.data.pokemon.name).toBe(
        'alpha-mega',
      ),
    );
    expect(result.current.status === 'ready' && result.current.data.base.name).toBe('alpha');
  });

  it('falls back to the default variety for a form the species does not have', async () => {
    serve('beta', 9002, 19002);
    const { result } = renderHook(() => usePokemonView(route('beta', 'bogus', 9002)));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.status === 'ready' && result.current.data.pokemon.name).toBe('beta');
  });

  it('surfaces a failed form fetch instead of silently showing the default', async () => {
    const release = serve('gamma', 9003, 19003, { formFails: true });
    const { result } = renderHook(() => usePokemonView(route('gamma', 'mega', 9003)));
    release();
    await waitFor(() => expect(result.current.status).toBe('error'));
  });
});
