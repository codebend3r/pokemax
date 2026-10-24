import { describe, expect, it } from 'vitest';
import { isEvolutionChainResponse } from '@/types';

const detail = {
  min_level: 16,
  trigger: { name: 'level-up' },
  item: null,
  held_item: null,
  known_move: null,
  min_happiness: null,
  time_of_day: '',
  location: null,
  needs_overworld_rain: false,
  gender: null,
};

const chain = (evolution_details: unknown[]) => ({
  chain: {
    species: { name: 'charmander' },
    evolution_details: [],
    evolves_to: [{ species: { name: 'charmeleon' }, evolution_details, evolves_to: [] }],
  },
});

describe('isEvolutionChainResponse', () => {
  it('accepts a base link and a fully-specified evolution detail', () => {
    expect(isEvolutionChainResponse(chain([detail]))).toBe(true);
  });

  it('accepts details that carry named items, moves and locations', () => {
    const rich = {
      ...detail,
      item: { name: 'thunder-stone' },
      held_item: { name: 'oval-stone' },
      known_move: { name: 'mimic' },
      min_happiness: 220,
      time_of_day: 'night',
      location: { name: 'mt-coronet' },
      needs_overworld_rain: true,
      gender: 1,
    };
    expect(isEvolutionChainResponse(chain([rich]))).toBe(true);
  });

  it('rejects an evolution detail that is not an object', () => {
    expect(isEvolutionChainResponse(chain([42]))).toBe(false);
    expect(isEvolutionChainResponse(chain([null]))).toBe(false);
  });

  it.each([
    ['min_level', '16'],
    ['item', 'thunder-stone'],
    ['item', {}],
    ['held_item', 7],
    ['known_move', 'mimic'],
    ['min_happiness', '220'],
    ['time_of_day', null],
    ['location', 'mt-coronet'],
    ['needs_overworld_rain', 'yes'],
    ['gender', '1'],
    ['trigger', 'level-up'],
  ])('rejects a detail whose %s is %j', (field, value) => {
    expect(isEvolutionChainResponse(chain([{ ...detail, [field]: value }]))).toBe(false);
  });

  it('rejects a detail that omits a field the consumer reads', () => {
    const { time_of_day: _omitted, ...rest } = detail;
    expect(isEvolutionChainResponse(chain([rest]))).toBe(false);
  });

  it('rejects a malformed detail deeper in the chain', () => {
    const deep = {
      chain: {
        species: { name: 'a' },
        evolution_details: [],
        evolves_to: [
          {
            species: { name: 'b' },
            evolution_details: [detail],
            evolves_to: [{ species: { name: 'c' }, evolution_details: [42], evolves_to: [] }],
          },
        ],
      },
    };
    expect(isEvolutionChainResponse(deep)).toBe(false);
  });
});
