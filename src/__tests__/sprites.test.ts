import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFallbackSrc } from '@/hooks/useFallbackSrc';
import { cardSprites, gridAnimations, gridStills, teamPickAnimations } from '@/sprites';
import type { PokemonResponse } from '@/types';

const SPRITES = { front_default: 'front.png', front_shiny: null };
const mon = (id: number, name: string): PokemonResponse => ({
  id,
  name,
  height: 1,
  weight: 1,
  sprites: {
    ...SPRITES,
    other: { 'official-artwork': { front_default: 'art.png', front_shiny: null } },
  },
  types: [],
  stats: [],
  abilities: [],
  moves: [],
});

describe('cardSprites', () => {
  it('2D: BW pixel art for gen 1-5, then Showdown ani, then gen5ani — all animated', () => {
    const urls = cardSprites(mon(6, 'charizard'), false, '2d');
    expect(urls.map((u) => u.url)).toEqual([
      expect.stringContaining('black-white/animated/6.gif'),
      'https://play.pokemonshowdown.com/sprites/ani/charizard.gif',
      'https://play.pokemonshowdown.com/sprites/gen5ani/charizard.gif',
    ]);
    expect(urls.every((u) => u.animated)).toBe(true);
  });

  it('2D: gen 6+ starts from PokeAPI’s Showdown mirror; shiny uses the shiny sets', () => {
    const urls = cardSprites(mon(887, 'dragapult'), true, '2d').map((u) => u.url);
    expect(urls[0]).toContain('other/showdown/shiny/887.gif');
    expect(urls[1]).toBe('https://play.pokemonshowdown.com/sprites/ani-shiny/dragapult.gif');
  });

  it('3D ends in truly static official artwork', () => {
    const list = cardSprites(mon(6, 'charizard'), false, '3d');
    expect(list[list.length - 1]).toEqual({ url: 'art.png', animated: false });
  });

  it('prefers a locally-shipped GIF in 2D, but not for shiny', () => {
    expect(cardSprites(mon(815, 'cinderace'), false, '2d')[0].url).toContain(
      'sprites/anim/cinderace.gif',
    );
    expect(cardSprites(mon(815, 'cinderace'), true, '2d')[0].url).not.toContain('sprites/anim/');
  });
});

describe('grid and team lists', () => {
  it('falls back to the parent species for forms', () => {
    expect(gridStills(10034, 6)).toHaveLength(2);
    expect(gridAnimations(10034, 6)[1]).toContain('other/showdown/6.gif');
    expect(gridStills(6)).toHaveLength(1);
  });

  it('team picks try gen5ani before ani', () => {
    expect(teamPickAnimations('pikachu')).toEqual([
      'https://play.pokemonshowdown.com/sprites/gen5ani/pikachu.gif',
      'https://play.pokemonshowdown.com/sprites/ani/pikachu.gif',
    ]);
  });
});

describe('useFallbackSrc', () => {
  it('walks the list on errors, ends at null, and restarts for a new list', () => {
    const { result, rerender } = renderHook(({ urls }) => useFallbackSrc(urls), {
      initialProps: { urls: ['a', 'b'] },
    });
    expect(result.current.src).toBe('a');
    act(() => result.current.next());
    expect(result.current.src).toBe('b');
    act(() => result.current.next());
    expect(result.current.src).toBeNull();
    rerender({ urls: ['c'] });
    expect(result.current.src).toBe('c');
  });
});
