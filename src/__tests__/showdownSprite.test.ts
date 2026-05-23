import { describe, it, expect } from 'vitest';
import { pokeapiToShowdownSlug } from '@/showdownSprite';

describe('pokeapiToShowdownSlug', () => {
  it('passes through single-token slugs', () => {
    expect(pokeapiToShowdownSlug('pikachu')).toBe('pikachu');
    expect(pokeapiToShowdownSlug('charizard')).toBe('charizard');
  });

  it('strips hyphens from compound base species', () => {
    expect(pokeapiToShowdownSlug('mr-mime')).toBe('mrmime');
    expect(pokeapiToShowdownSlug('mr-rime')).toBe('mrrime');
    expect(pokeapiToShowdownSlug('mime-jr')).toBe('mimejr');
    expect(pokeapiToShowdownSlug('ho-oh')).toBe('hooh');
    expect(pokeapiToShowdownSlug('type-null')).toBe('typenull');
    expect(pokeapiToShowdownSlug('porygon-z')).toBe('porygonz');
    expect(pokeapiToShowdownSlug('tapu-koko')).toBe('tapukoko');
    expect(pokeapiToShowdownSlug('iron-bundle')).toBe('ironbundle');
    expect(pokeapiToShowdownSlug('great-tusk')).toBe('greattusk');
    expect(pokeapiToShowdownSlug('chien-pao')).toBe('chienpao');
    expect(pokeapiToShowdownSlug('nidoran-f')).toBe('nidoranf');
  });

  it('joins species + form with a single dash, stripping inner hyphens', () => {
    expect(pokeapiToShowdownSlug('charizard-mega-x')).toBe('charizard-megax');
    expect(pokeapiToShowdownSlug('charizard-mega-y')).toBe('charizard-megay');
    expect(pokeapiToShowdownSlug('pikachu-rock-star')).toBe('pikachu-rockstar');
    expect(pokeapiToShowdownSlug('pikachu-pop-star')).toBe('pikachu-popstar');
    expect(pokeapiToShowdownSlug('pikachu-ph-d')).toBe('pikachu-phd');
  });

  it('keeps the single-dash form when the form has no inner hyphens', () => {
    expect(pokeapiToShowdownSlug('raichu-alola')).toBe('raichu-alola');
    expect(pokeapiToShowdownSlug('charizard-gmax')).toBe('charizard-gmax');
    expect(pokeapiToShowdownSlug('avalugg-hisui')).toBe('avalugg-hisui');
  });

  it('drops the `-cap` suffix from Pikachu cap forms', () => {
    expect(pokeapiToShowdownSlug('pikachu-original-cap')).toBe('pikachu-original');
    expect(pokeapiToShowdownSlug('pikachu-hoenn-cap')).toBe('pikachu-hoenn');
    expect(pokeapiToShowdownSlug('pikachu-partner-cap')).toBe('pikachu-partner');
    expect(pokeapiToShowdownSlug('pikachu-world-cap')).toBe('pikachu-world');
  });

  it('lowercases inputs', () => {
    expect(pokeapiToShowdownSlug('Mr-Mime')).toBe('mrmime');
    expect(pokeapiToShowdownSlug('Charizard-Mega-X')).toBe('charizard-megax');
  });
});
