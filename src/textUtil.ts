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
    .replace(/­/g, '')              // soft hyphens are display-only — delete, don't space
    .replace(/[\n\r\t\f ]/g, ' ')   // line breaks, tabs, form-feed, nbsp → space
    .replace(/\s+/g, ' ')                // collapse runs of whitespace
    .trim();
}
