const LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};
const BAR_WIDTH = 16;
const BAR_MAX = 200;

interface Props {
  name: string;
  value: number;
}

export default function StatBar({ name, value }: Props) {
  const filled = Math.min(BAR_WIDTH, Math.round((value / BAR_MAX) * BAR_WIDTH));
  const empty = BAR_WIDTH - filled;
  return (
    <div className="crt-stat">
      <span>{LABELS[name] ?? name.toUpperCase()}</span>
      <span className="crt-stat-bar">
        {'█'.repeat(filled)}
        {'░'.repeat(empty)}
      </span>
      <span className="crt-stat-value">{value}</span>
    </div>
  );
}
