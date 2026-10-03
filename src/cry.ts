// The one cry player. It resolves a variety's cry URL and owns the single
// `<audio>` element every cry plays through, so a pick can pre-warm a clip and
// the card can play it without the two ever disagreeing on what is loaded.
import { cryOverrideFor } from '@/cryOverrides';
import { playGmaxCryWithEffects } from '@/gmaxAudio';
import type { PokemonResponse } from '@/types';

/**
 * Cries are recorded hot — even at the user's slider value, the absolute volume
 * can be jarring next to the music. Every cry is scaled by this factor; the
 * slider still goes 0-1, so effective playback maxes at half.
 */
const VOLUME_SCALE = 0.5;
const POKEAPI_CRIES = 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest';

/** Before a variety's data loads: its override, else PokeAPI's cry by variety id. */
export function cryUrlById(name: string, id: number): string {
  return cryOverrideFor(name) ?? `${POKEAPI_CRIES}/${id}.ogg`;
}

/** Once loaded: its override, else the cry PokeAPI lists for it (if any). */
export function cryUrlOf(pokemon: PokemonResponse): string | null {
  return cryOverrideFor(pokemon.name) ?? pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null;
}

let audio: HTMLAudioElement | null = null;
// The URL as requested. `audio.src` reads back absolute, so comparing it with
// the relative override paths never matched and every override cry reloaded.
let loadedUrl: string | null = null;
let volume = 0;

function load(url: string): HTMLAudioElement {
  if (audio && loadedUrl === url) return audio;
  audio?.pause();
  audio = new Audio(url);
  audio.preload = 'auto';
  audio.volume = volume * VOLUME_SCALE;
  loadedUrl = url;
  return audio;
}

/** Pre-warms a cry during the click that picks a Pokémon, so it plays instantly once shown. */
export function primeCry(url: string): void {
  load(url);
}

export function setCryVolume(v: number): void {
  volume = v;
  if (audio) audio.volume = v * VOLUME_SCALE;
}

function isGmaxVariety(name: string): boolean {
  return /-(g|eterna)max$/.test(name);
}

/**
 * Plays variety `name`'s cry from `url`. Every Gmax form ships an override
 * clip with the Dynamax jingle baked in; a Gmax form without one routes
 * through the Web Audio pitch/reverb chain, falling back to plain playback.
 */
export function playCry(name: string, url: string): void {
  const a = load(url);
  const playDirect = () => {
    a.currentTime = 0;
    a.play().catch(() => {});
  };
  if (isGmaxVariety(name) && cryOverrideFor(name) === null) {
    playGmaxCryWithEffects(url, volume * VOLUME_SCALE).then((ok) => {
      if (!ok) playDirect();
    });
  } else {
    playDirect();
  }
}
