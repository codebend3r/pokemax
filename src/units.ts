/** PokéAPI height is in decimetres: `1.7 m  (5'07")`. */
export function formatHeight(decimetres: number): string {
  const meters = decimetres / 10;
  const totalInches = meters * 39.3701;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - ft * 12);
  return `${meters.toFixed(1)} m  (${ft}'${String(inches).padStart(2, '0')}")`;
}

/** PokéAPI weight is in hectograms: `90.5 kg  (199.5 lbs)`. */
export function formatWeight(hectograms: number): string {
  const kg = hectograms / 10;
  return `${kg.toFixed(1)} kg  (${(kg * 2.20462).toFixed(1)} lbs)`;
}
