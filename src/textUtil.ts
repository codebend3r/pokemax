/**
 * PokeAPI flavor text and item descriptions are stored with hard line breaks from
 * the game's text boxes — \n (Enter), \x0c (form feed), ­ (soft hyphen) inside
 * words for syllable breaks, and   (non-breaking space). Naively replacing all
 * of these with a regular space introduces noise like "Pi ka chu" or double spaces
 * mid-word. This helper does the right thing: newlines/form-feeds/nbsp → space,
 * but soft hyphens are deleted (their job is layout, not whitespace).
 */
/**
 * Cries are recorded hot — even at the user's slider value, the absolute volume
 * can be jarring next to the music. Scale every cry by this factor before sending
 * it to the audio element. Slider still goes 0-1; effective playback maxes at half.
 */
export const CRY_VOLUME_SCALE = 0.5;

export function cleanFlavorText(raw: string): string {
  return raw
    // Soft hyphens were the wrap-syllable marker — a word like "becomes" appears
    // in the games as "be­\ncomes". Delete the hyphen AND any whitespace that
    // follows it so the word fragments rejoin into "becomes" instead of "be comes".
    .replace(/­\s*/g, '')
    // Regular hyphens left at end-of-line are compound-word breaks like
    // 'whitish-\nblue'. Strip the trailing newline so 'whitish-blue' stays
    // glued instead of becoming 'whitish- blue'.
    .replace(/-[\n\f]/g, '-')
    .replace(/[\n\r\t\f ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
