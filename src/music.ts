// Tiny in-browser chiptune player. Uses Web Audio API to synthesize square/triangle/saw
// oscillators in the style of NES/Game Boy music — no external audio files needed.

export interface Track {
  name: string;
  bpm: number;
  melody: number[]; // MIDI note numbers, -1 = rest
  bass?: number[];  // bass line played in parallel (lower octave)
  lead: OscillatorType;
}

const TRACKS: Track[] = [
  {
    name: 'CRT DRIFT',
    bpm: 72,
    lead: 'triangle',
    melody: [
      69, -1, 72, -1, 76, -1, 72, -1, 69, -1, 72, -1, 76, -1, 79, -1,
      77, -1, 76, -1, 72, -1, 76, -1, 74, -1, 72, -1, 69, -1, -1, -1,
    ],
    bass: [
      45, -1, -1, -1, 45, -1, -1, -1, 45, -1, -1, -1, 45, -1, -1, -1,
      50, -1, -1, -1, 50, -1, -1, -1, 43, -1, -1, -1, 41, -1, -1, -1,
    ],
  },
  {
    name: 'PIXEL LULLABY',
    bpm: 60,
    lead: 'square',
    melody: [
      67, 65, 64, 60, 64, 65, 67, -1, 65, 64, 62, 60, 62, 64, 65, -1,
      64, 62, 60, 57, 60, 62, 64, -1, 65, 64, 62, 60, 62, 60, 57, -1,
    ],
    bass: [
      48, -1, -1, -1, 48, -1, -1, -1, 53, -1, -1, -1, 53, -1, -1, -1,
      50, -1, -1, -1, 50, -1, -1, -1, 48, -1, -1, -1, 45, -1, -1, -1,
    ],
  },
  {
    name: 'MODEM HYMN',
    bpm: 84,
    lead: 'sawtooth',
    melody: [
      62, 65, 69, 72, 69, 65, 62, 65, 67, 70, 74, 77, 74, 70, 67, 70,
      69, 72, 76, 79, 76, 72, 69, 72, 67, 70, 74, 77, 74, 70, 67, 65,
    ],
    bass: [
      38, -1, 38, -1, 38, -1, 38, -1, 43, -1, 43, -1, 43, -1, 43, -1,
      45, -1, 45, -1, 45, -1, 45, -1, 43, -1, 43, -1, 41, -1, 41, -1,
    ],
  },
  {
    name: 'BOOT-UP CHIME',
    bpm: 96,
    lead: 'square',
    melody: [
      60, 64, 67, 72, 67, 64, 60, 64, 62, 65, 69, 74, 69, 65, 62, 65,
      64, 67, 71, 76, 71, 67, 64, 67, 65, 69, 72, 77, 72, 69, 65, 62,
    ],
    bass: [
      36, -1, -1, -1, 36, -1, -1, -1, 38, -1, -1, -1, 38, -1, -1, -1,
      40, -1, -1, -1, 40, -1, -1, -1, 41, -1, -1, -1, 41, -1, -1, -1,
    ],
  },
];

function midiToFreq(n: number): number {
  return 440 * Math.pow(2, (n - 69) / 12);
}

type Listener = () => void;

class ChiptunePlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timer: number | null = null;
  private nextNoteTime = 0;
  private step = 0;
  private playing = false;
  private trackIndex = 0;
  private listeners = new Set<Listener>();

  get isPlaying(): boolean { return this.playing; }
  get currentTrack(): Track { return TRACKS[this.trackIndex]; }
  get tracks(): readonly Track[] { return TRACKS; }
  get currentIndex(): number { return this.trackIndex; }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private emit(): void { this.listeners.forEach((f) => f()); }

  private ensureContext(): boolean {
    if (this.ctx) return true;
    const Ctor = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.06;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.masterGain = master;
    return true;
  }

  play(): void {
    if (this.playing) return;
    if (!this.ensureContext() || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.playing = true;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.tick();
    this.emit();
  }

  pause(): void {
    this.playing = false;
    if (this.timer != null) { window.clearTimeout(this.timer); this.timer = null; }
    this.emit();
  }

  toggle(): void { this.playing ? this.pause() : this.play(); }

  next(): void {
    this.trackIndex = (this.trackIndex + 1) % TRACKS.length;
    this.step = 0;
    if (this.playing && this.ctx) this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.emit();
  }

  prev(): void {
    this.trackIndex = (this.trackIndex - 1 + TRACKS.length) % TRACKS.length;
    this.step = 0;
    if (this.playing && this.ctx) this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.emit();
  }

  setVolume(v: number): void {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  private tick = (): void => {
    if (!this.playing || !this.ctx) return;
    const track = TRACKS[this.trackIndex];
    const stepDuration = 60 / track.bpm / 4; // 16th-note grid
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      this.scheduleStep(track, this.nextNoteTime);
      this.step = (this.step + 1) % track.melody.length;
      this.nextNoteTime += stepDuration;
    }
    this.timer = window.setTimeout(this.tick, 40);
  };

  private scheduleStep(track: Track, time: number): void {
    if (!this.ctx || !this.masterGain) return;
    const lead = track.melody[this.step];
    if (lead >= 0) this.scheduleNote(time, midiToFreq(lead), track.lead, 0.32, 0.12);
    if (track.bass) {
      const bass = track.bass[this.step];
      if (bass >= 0) this.scheduleNote(time, midiToFreq(bass), 'triangle', 0.5, 0.18);
    }
  }

  private scheduleNote(time: number, freq: number, type: OscillatorType, dur: number, peak: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(peak, time + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(env).connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }
}

export const player = new ChiptunePlayer();
