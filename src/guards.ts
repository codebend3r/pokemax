// Building blocks for the runtime guards that check external JSON where it
// enters the app — what lets the response types be trusted without a cast.

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** PokéAPI's `NamedAPIResource`, checked by the field the app reads. */
export function isNamed(v: unknown): v is { name: string } {
  return isRecord(v) && typeof v.name === 'string';
}

export function isResource(v: unknown): v is { name: string; url: string } {
  return isRecord(v) && typeof v.name === 'string' && typeof v.url === 'string';
}
