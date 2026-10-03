// How a variety's form suffix (`charizard-mega-x` → `mega-x`) reads on
// screen and which filter category it falls in. The grid labels forms beside
// their species name, so labels never repeat it ("Black", not "Black Kyurem").
import type { FormCategory } from '@/types';

// prettier-ignore
const FORM_LABELS: Record<string, string> = {
  // Regional
  alola: 'Alolan', galar: 'Galarian', hisui: 'Hisuian', paldea: 'Paldean',
  'paldea-combat': 'Paldean Combat', 'paldea-blaze': 'Paldean Blaze', 'paldea-aqua': 'Paldean Aqua',
  'galar-zen': 'Galarian Zen',
  // Mega / Primal / Gigantamax
  mega: 'Mega', 'mega-x': 'Mega X', 'mega-y': 'Mega Y', primal: 'Primal',
  gmax: 'Gigantamax', 'single-strike-gmax': 'Gmax Single Strike',
  'rapid-strike-gmax': 'Gmax Rapid Strike', 'low-key-gmax': 'Gmax Low Key',
  'amped-gmax': 'Gmax Amped', eternamax: 'Eternamax',
  // Battle and other forms whose suffix alone reads badly
  zen: 'Zen Mode', ice: 'Ice Rider', shadow: 'Shadow Rider',
  'three-segment': 'Three-Segment', 'family-of-three': 'Family of Three',
  'family-of-four': 'Family of Four', phd: 'Ph.D',
};

/** Display label for a form suffix — the table above, else the suffix title-cased. */
export function formLabel(suffix: string): string {
  return (
    FORM_LABELS[suffix] ??
    suffix
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
  );
}

export function categorizeForm(suffix: string): FormCategory {
  if (/^mega(-[xy])?$/.test(suffix) || suffix === 'primal') return 'mega';
  if (suffix === 'gmax' || suffix.startsWith('gmax-') || suffix.endsWith('-gmax')) return 'gmax';
  if (/^(alola|galar|hisui|paldea)(-|$)/.test(suffix)) return 'regional';
  return 'other';
}
