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

export const isString = (v: unknown): v is string => typeof v === 'string';
export const isNumber = (v: unknown): v is number => typeof v === 'number';
export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';

export function isStringList(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

/** A field the source always writes, with `null` meaning "no value". */
export function isNullable<T>(v: unknown, isT: (x: unknown) => x is T): v is T | null {
  return v === null || isT(v);
}

/** A field the source may leave out; when present it must still be a `T`. */
export function isOptional<T>(v: unknown, isT: (x: unknown) => x is T): v is T | undefined {
  return v === undefined || isT(v);
}
