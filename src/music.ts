// Tiny in-browser chiptune player. Uses Web Audio API to synthesize square/triangle/saw
// oscillators in the style of NES/Game Boy music — no external audio files needed.

export interface Track {
  name: string;
  bpm: number;
  melody: number[]; // MIDI note numbers, -1 = rest
  bass?: number[];  // bass line played in parallel (lower octave)
  lead: OscillatorType;
  /** Number of full loops before auto-advancing to the next track. Defaults to 3. */
  loops?: number;
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
  {
    name: 'NEON STREET',
    bpm: 88,
    lead: 'square',
    melody: [
      69, 72, 76, 79, 76, 72, 69, 67, 65, 69, 72, 76, 72, 69, 65, 64,
      62, 65, 69, 72, 69, 65, 62, 60, 58, 62, 65, 69, 65, 62, 58, -1,
    ],
    bass: [
      45, -1, 52, -1, 45, -1, 52, -1, 43, -1, 50, -1, 43, -1, 50, -1,
      41, -1, 48, -1, 41, -1, 48, -1, 46, -1, 53, -1, 46, -1, 53, -1,
    ],
  },
  {
    name: 'TWILIGHT CHIP',
    bpm: 68,
    lead: 'triangle',
    melody: [
      57, -1, 60, -1, 64, -1, 60, -1, 62, -1, 65, -1, 69, -1, 65, -1,
      64, -1, 67, -1, 71, -1, 67, -1, 60, -1, 64, -1, 67, -1, -1, -1,
    ],
    bass: [
      45, -1, -1, -1, 45, -1, -1, -1, 50, -1, -1, -1, 50, -1, -1, -1,
      52, -1, -1, -1, 52, -1, -1, -1, 48, -1, -1, -1, 48, -1, -1, -1,
    ],
  },
  {
    name: 'RAINY DEX',
    bpm: 64,
    lead: 'sawtooth',
    melody: [
      60, 62, 64, 65, 64, 62, 60, -1, 64, 65, 67, 69, 67, 65, 64, -1,
      67, 69, 71, 72, 71, 69, 67, -1, 64, 65, 67, 69, 67, 65, 64, 60,
    ],
    bass: [
      36, -1, -1, -1, 40, -1, -1, -1, 41, -1, -1, -1, 43, -1, -1, -1,
      36, -1, -1, -1, 40, -1, -1, -1, 41, -1, -1, -1, 43, -1, -1, -1,
    ],
  },
  {
    name: 'ARCADE CRT',
    bpm: 104,
    lead: 'square',
    melody: [
      64, 67, 71, 67, 64, 67, 71, 67, 65, 69, 72, 69, 65, 69, 72, 69,
      67, 71, 74, 71, 67, 71, 74, 71, 69, 72, 76, 72, 69, 72, 76, -1,
    ],
    bass: [
      40, 47, 40, 47, 40, 47, 40, 47, 41, 48, 41, 48, 41, 48, 41, 48,
      43, 50, 43, 50, 43, 50, 43, 50, 45, 52, 45, 52, 45, 52, 45, 52,
    ],
  },
  {
    name: 'CARTRIDGE DREAM',
    bpm: 76,
    lead: 'triangle',
    melody: [
      67, 69, 72, 74, 72, 69, 67, 65, 64, 65, 67, 69, 67, 65, 64, 62,
      60, 62, 64, 65, 64, 62, 60, 59, 57, 60, 64, 67, 64, 60, 57, -1,
    ],
    bass: [
      36, -1, 43, -1, 36, -1, 43, -1, 41, -1, 48, -1, 41, -1, 48, -1,
      40, -1, 47, -1, 40, -1, 47, -1, 33, -1, 40, -1, 33, -1, 40, -1,
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
  private loopsDone = 0;
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
    master.gain.value = this.volume;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.masterGain = master;
    return true;
  }

  private volume = 0.12;
  getVolume(): number { return this.volume; }

  private shuffle = false;
  isShuffling(): boolean { return this.shuffle; }
  toggleShuffle(): void {
    this.shuffle = !this.shuffle;
    this.emit();
  }

  /**
   * Silence everything already scheduled into the master gain by ramping it to zero
   * and swapping in a brand-new gain node. Any oscillators feeding the old node will
   * fade out within ~30ms; new notes go to the fresh node.
   */
  private cutScheduled(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const oldGain = this.masterGain;
    try {
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    } catch { /* ignore */ }
    window.setTimeout(() => {
      try { oldGain.disconnect(); } catch { /* already disconnected */ }
    }, 120);
    const fresh = this.ctx.createGain();
    fresh.gain.value = this.volume;
    fresh.connect(this.ctx.destination);
    this.masterGain = fresh;
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
    if (!this.playing) return;
    this.playing = false;
    if (this.timer != null) { window.clearTimeout(this.timer); this.timer = null; }
    this.cutScheduled();
    this.emit();
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.play();
  }

  next(): void { this.changeTrack(this.trackIndex + 1); }
  prev(): void { this.changeTrack(this.trackIndex - 1 + TRACKS.length); }

  private changeTrack(rawIndex: number): void {
    this.trackIndex = rawIndex % TRACKS.length;
    this.step = 0;
    this.loopsDone = 0;
    if (this.playing && this.ctx) {
      // Kill the in-flight notes of the previous track before scheduling new ones
      this.cutScheduled();
      this.nextNoteTime = this.ctx.currentTime + 0.05;
      // Auto-advance: re-arm the scheduler with the new track
      if (this.timer != null) {
        window.clearTimeout(this.timer);
        this.timer = null;
      }
      this.tick();
    }
    this.emit();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
    this.emit();
  }

  private tick = (): void => {
    if (!this.playing || !this.ctx) return;
    const track = TRACKS[this.trackIndex];
    // ~3-4 minutes per track by default. melodyLen×stepDur×loops ≈ 200s
    const stepDuration = 60 / track.bpm / 4; // 16th-note grid
    const defaultLoops = Math.max(8, Math.round(200 / (track.melody.length * stepDuration)));
    const targetLoops = track.loops ?? defaultLoops;
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      this.scheduleStep(track, this.nextNoteTime);
      const nextStep = this.step + 1;
      if (nextStep >= track.melody.length) {
        this.step = 0;
        this.loopsDone += 1;
        if (this.loopsDone >= targetLoops) {
          // Track finished — schedule no more notes from it, advance to the next.
          this.loopsDone = 0;
          if (this.shuffle && TRACKS.length > 1) {
            let next = this.trackIndex;
            // pick a different track than the one that just played
            while (next === this.trackIndex) next = Math.floor(Math.random() * TRACKS.length);
            this.changeTrack(next);
          } else {
            this.changeTrack(this.trackIndex + 1);
          }
          return;
        }
      } else {
        this.step = nextStep;
      }
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
