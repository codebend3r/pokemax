// Web Audio effects pipeline that turns an ordinary Pokémon cry into a
// Gmax-sounding cry. Used for `-gmax` / `-eternamax` varieties that don't
// have an explicit override in `cryOverrides.ts`.
//
// Effects chain (mirrors what SwSh does at runtime):
//   buffer source @ playbackRate 0.7 → low-shelf bass boost (+9 dB @ 150 Hz)
//   → split: dry (55%) and convolver reverb (1.6 s exponential noise IR, 45%)
//   → destination

let ctx: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer>>();
let cachedIR: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function loadBuffer(c: AudioContext, url: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(url);
  if (cached) return cached;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`cry fetch ${r.status}`);
      return r.arrayBuffer();
    })
    .then((ab) => c.decodeAudioData(ab));
  bufferCache.set(url, p);
  p.catch(() => bufferCache.delete(url));
  return p;
}

function makeReverbIR(c: AudioContext): AudioBuffer {
  if (cachedIR && cachedIR.sampleRate === c.sampleRate) return cachedIR;
  const len = Math.floor(c.sampleRate * 1.6);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.45));
    }
  }
  cachedIR = ir;
  return ir;
}

/**
 * Plays `url` through the Gmax effect chain. Returns true on success, false
 * if Web Audio isn't available or the buffer couldn't be decoded — callers
 * should fall back to plain `<audio>` playback in that case.
 */
export async function playGmaxCryWithEffects(url: string, gain: number): Promise<boolean> {
  const c = getCtx();
  if (!c) return false;
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      return false;
    }
  }
  let buffer: AudioBuffer;
  try {
    buffer = await loadBuffer(c, url);
  } catch {
    return false;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = 0.7; // ~5.5 semitones lower; also stretches duration

  const bass = c.createBiquadFilter();
  bass.type = 'lowshelf';
  bass.frequency.value = 150;
  bass.gain.value = 9;

  const reverb = c.createConvolver();
  reverb.buffer = makeReverbIR(c);

  const dry = c.createGain();
  dry.gain.value = 0.55 * gain;
  const wet = c.createGain();
  wet.gain.value = 0.45 * gain;

  source.connect(bass);
  bass.connect(dry).connect(c.destination);
  bass.connect(reverb).connect(wet).connect(c.destination);

  source.start();
  return true;
}
