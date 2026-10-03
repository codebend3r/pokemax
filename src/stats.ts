/** PokéAPI stat slugs in the order every stat table reads. */
export const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};

export function statLabel(stat: string): string {
  return STAT_LABELS[stat] ?? stat.toUpperCase();
}
