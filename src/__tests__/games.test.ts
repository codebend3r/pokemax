import { describe, expect, it } from 'vitest';
import {
  GAMES,
  GAME_IDS,
  GAME_OF_VERSION,
  GAME_ORDER,
  REGIONS,
  VERSION_ORDER,
  isGameId,
} from '@/games';
import { GENERATIONS } from '@/generations';

describe('REGIONS', () => {
  it('places every game in exactly one region', () => {
    const placed = REGIONS.flatMap((r) => r.games);
    expect(new Set(placed).size).toBe(placed.length);
    expect([...placed].sort()).toEqual([...GAME_IDS].sort());
    expect(GAME_ORDER).toEqual(placed);
  });

  it('places Hisui directly after Sinnoh', () => {
    const names = REGIONS.map((r) => r.name);
    expect(names.indexOf('Hisui')).toBe(names.indexOf('Sinnoh') + 1);
    expect(REGIONS.find((r) => r.name === 'Hisui')?.note).toBe('Ancient Sinnoh');
  });

  it('files remakes under their setting, not their generation', () => {
    const sinnoh = REGIONS.find((r) => r.name === 'Sinnoh');
    expect(sinnoh?.games).toContain('brilliant-diamond-shining-pearl');
  });
});

describe('GAMES', () => {
  it('ids are PokéAPI version-group slugs, Let’s Go included', () => {
    expect(isGameId('lets-go-pikachu-lets-go-eevee')).toBe(true);
    expect(isGameId('lets-go')).toBe(false);
    expect(isGameId('constructor')).toBe(false);
  });

  it('never caps a dex above the generation the game shipped in', () => {
    for (const g of GAME_IDS) expect(GAMES[g].dexGen, g).toBeLessThanOrEqual(GAMES[g].gen);
    expect(GAMES['lets-go-pikachu-lets-go-eevee'].dexGen).toBe(1);
    expect(GAMES['scarlet-violet'].dexGen).toBe(9);
  });

  it('gives every generation a primary version group from that generation', () => {
    for (const g of GENERATIONS) expect(GAMES[g.primaryVersionGroup].gen).toBe(g.num);
  });

  it('maps every version back to its game, in release order', () => {
    for (const g of GAME_IDS) {
      for (const v of GAMES[g].versions) expect(GAME_OF_VERSION[v]).toBe(g);
    }
    expect(VERSION_ORDER[0]).toBe('red');
    expect(VERSION_ORDER[VERSION_ORDER.length - 1]).toBe('violet');
  });
});
