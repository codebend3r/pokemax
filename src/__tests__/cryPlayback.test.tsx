import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PokemonCard from '@/components/PokemonCard';
import { primeCry, playCry } from '@/cry';
import type { PokemonResponse, SpeciesResponse } from '@/types';

const plays: string[] = [];
let created = 0;

class FakeAudio {
  src: string;
  preload = '';
  volume = 1;
  currentTime = 0;
  constructor(src: string) {
    this.src = src;
    created++;
  }
  play() {
    plays.push(this.src);
    return Promise.resolve();
  }
  pause() {}
}

const CRIES = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest';
const SPRITES = { front_default: null, front_shiny: null };
const variety = (id: number, name: string): PokemonResponse => ({
  id,
  name,
  height: 17,
  weight: 905,
  cries: { latest: `${CRIES}/${id}.ogg`, legacy: null },
  sprites: { ...SPRITES, other: { 'official-artwork': SPRITES } },
  types: [{ slot: 1, type: { name: 'fire' } }],
  stats: [],
  abilities: [],
  moves: [],
});
const BASE = variety(6, 'charizard');
const MEGA = variety(10034, 'charizard-mega-x');
const SPECIES: SpeciesResponse = {
  name: 'charizard',
  generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
  evolution_chain: { url: 'X' },
  varieties: [
    {
      is_default: true,
      pokemon: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
    },
    {
      is_default: false,
      pokemon: { name: 'charizard-mega-x', url: 'https://pokeapi.co/api/v2/pokemon/10034/' },
    },
  ],
  flavor_text_entries: [],
  genera: [],
};
const CHAIN = { chain: { species: { name: 'charizard' }, evolution_details: [], evolves_to: [] } };

function card(form: string, pokemon: PokemonResponse, onFormChange = () => {}) {
  return (
    <PokemonCard
      pokemon={pokemon}
      base={BASE}
      species={SPECIES}
      chain={CHAIN}
      shiny={false}
      onShinyChange={() => {}}
      view="3d"
      onViewChange={() => {}}
      form={form}
      onFormChange={onFormChange}
    />
  );
}

beforeEach(() => {
  plays.length = 0;
  created = 0;
  vi.stubGlobal('Audio', FakeAudio);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cry playback', () => {
  it('plays a primed override clip without reloading it', () => {
    primeCry('/audio/cries/charizard-gmax.mp3');
    playCry('charizard-gmax', '/audio/cries/charizard-gmax.mp3');
    expect(created).toBe(1);
    expect(plays).toEqual(['/audio/cries/charizard-gmax.mp3']);
  });

  it('plays once on show, then once per form switch — not again when the form lands', async () => {
    const onFormChange = vi.fn();
    const { rerender } = render(card('base', BASE, onFormChange));
    expect(plays).toEqual([`${CRIES}/6.ogg`]);

    await userEvent.setup().click(screen.getByRole('button', { name: /MEGA X/i }));
    expect(onFormChange).toHaveBeenCalledWith('mega-x');
    rerender(card('mega-x', BASE, onFormChange)); // URL updated, form data still loading
    rerender(card('mega-x', MEGA, onFormChange)); // form data landed
    expect(plays).toEqual([`${CRIES}/6.ogg`, `${CRIES}/10034.ogg`]);
    expect(created).toBe(2); // the form's clip loaded once, by the click
  });
});
