import { describe, it, expect } from 'vitest';
import {
  pokedexPath,
  trainersPath,
  teamsPath,
  parsePokedexSearch,
  buildPokedexSearch,
  varietyFromForm,
  formFromVariety,
} from '@/routes';

describe('routes', () => {
  describe('pokedexPath', () => {
    it('returns /pokedex with no args', () => {
      expect(pokedexPath()).toBe('/pokedex');
    });
    it('appends the pokemon slug', () => {
      expect(pokedexPath('charizard')).toBe('/pokedex/charizard');
    });
    it('omits empty query', () => {
      expect(pokedexPath('charizard', {})).toBe('/pokedex/charizard');
    });
    it('builds query for non-default params', () => {
      expect(pokedexPath('charizard', { dimension: '3d', variant: 'shiny', form: 'gmax' })).toBe(
        '/pokedex/charizard?dimension=3d&variant=shiny&form=gmax',
      );
    });
    it('omits default-valued params', () => {
      expect(pokedexPath('charizard', { dimension: '2d', variant: 'normal', form: 'base' })).toBe(
        '/pokedex/charizard',
      );
    });
  });

  describe('trainersPath / teamsPath', () => {
    it('returns the literals', () => {
      expect(trainersPath()).toBe('/trainers');
      expect(teamsPath()).toBe('/teams');
    });
  });

  describe('parsePokedexSearch', () => {
    it('returns defaults for empty search', () => {
      expect(parsePokedexSearch('')).toEqual({
        dimension: '2d',
        variant: 'normal',
        form: 'base',
      });
    });
    it('reads non-default values', () => {
      expect(parsePokedexSearch('dimension=3d&variant=shiny&form=mega-x')).toEqual({
        dimension: '3d',
        variant: 'shiny',
        form: 'mega-x',
      });
    });
    it('ignores garbage values and falls back to defaults', () => {
      expect(parsePokedexSearch('dimension=cube&variant=ultra&form=')).toEqual({
        dimension: '2d',
        variant: 'normal',
        form: 'base',
      });
    });
    it('tolerates a leading ?', () => {
      expect(parsePokedexSearch('?dimension=3d')).toEqual({
        dimension: '3d',
        variant: 'normal',
        form: 'base',
      });
    });
  });

  describe('buildPokedexSearch', () => {
    it('returns empty string when all defaults', () => {
      expect(buildPokedexSearch({ dimension: '2d', variant: 'normal', form: 'base' })).toBe('');
    });
    it('serializes non-defaults', () => {
      expect(buildPokedexSearch({ dimension: '3d', variant: 'shiny', form: 'gmax' })).toBe(
        'dimension=3d&variant=shiny&form=gmax',
      );
    });
  });

  describe('variety mapping', () => {
    it('varietyFromForm: base returns the species name', () => {
      expect(varietyFromForm('pikachu', 'base')).toBe('pikachu');
    });
    it('varietyFromForm: non-base joins with a hyphen', () => {
      expect(varietyFromForm('charizard', 'mega-x')).toBe('charizard-mega-x');
    });
    it('formFromVariety: matching species returns base', () => {
      expect(formFromVariety('pikachu', 'pikachu')).toBe('base');
    });
    it('formFromVariety: alt variety strips the species prefix', () => {
      expect(formFromVariety('charizard', 'charizard-mega-x')).toBe('mega-x');
    });
    it('formFromVariety: unrelated slug returns base (defensive)', () => {
      expect(formFromVariety('charizard', 'pikachu')).toBe('base');
    });
  });
});
