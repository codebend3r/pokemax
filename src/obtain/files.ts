import { memoAsync } from '@/async';
import { isObtainFile, type ObtainFile } from '@/obtain/types';

/** `public/obtain/{id}.json`, built offline by `scripts/build-obtain-data.mts`. */
export const obtainFiles = memoAsync(async (pokemonId: number): Promise<ObtainFile> => {
  const r = await fetch(`${import.meta.env.BASE_URL}obtain/${pokemonId}.json`);
  if (!r.ok) throw new Error(`No obtain data (${r.status})`);
  const json: unknown = await r.json();
  if (!isObtainFile(json)) throw new Error('Malformed obtain data');
  return json;
});
