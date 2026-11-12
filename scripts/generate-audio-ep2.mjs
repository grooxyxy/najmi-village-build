#!/usr/bin/env node
/**
 * Procedural score + SFX for NAJMI Episode 02.
 *
 * No npm packages and no external samples: everything is synthesized into
 * 16-bit mono WAV files so the render is fully reproducible in CI.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const AUDIO = path.join(ROOT, 'public', 'audio', 'ep2');
const SAMPLE_RATE = 22050;
const DURATION = 190;

fs.mkdirSync(path.join(AUDIO, 'music'), {recursive: true});
fs.mkdirSync(path.join(AUDIO, 'sfx'), {recursive: true});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const midi = (note) => 440 * Math.pow(2, (note - 69) / 12);
const TAU = Math.PI * 2;

const seeded = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const oscillator = (type, phase) => {
  if (type === 'sine') return Math.sin(phase);
  if (type === 'triangle') {
    const x = ((phase / TAU) % 1 + 1) % 1;
    return 1 - 4 * Math.abs(x - 0.5);
  }
  if (type === 'soft-square') {
    return Math.tanh(Math.sin(phase) * 2.2);
  }
  if (type === 'bell') {
    return Math.sin(phase) * 0.7 + Math.sin(phase * 2.01) * 0.2 + Math.sin(phase * 3.97) * 0.08;
  }
  return Math.sin(phase);
};

const envelope = (t, duration, attack, release) => {
  if (t < 0 || t > duration) return 0;
  const a = Math.min(1, t / Math.max(0.001, attack));
  const r = Math.min(1, (duration - t) / Math.max(0.001, release));
  return Math.min(a, r);
};

class Track {
  constructor(seconds, sampleRate = SAMPLE_RATE) {
    this.sampleRate = sampleRate;
    this.samples = new Float32Array(Math.ceil(seconds * sampleRate));
  }

  add(index, value) {
    if (index >= 0 && index < this.samples.length) {
      this.samples[index] += value;
    }
  }

  tone(start, duration, frequency, amplitude, options = {}) {
    const {
      type = 'sine',
      attack = 0.06,
      release = 0.3,
      detune = 0,
      vibrato = 0,
      vibratoRate = 5,
      pan = 0,
    } = options;
    const startSample = Math.floor(start * this.sampleRate);
    const count = Math.floor(duration * this.sampleRate);
    for (let i = 0; i < count; i += 1) {
      const t = i / this.sampleRate;
      const env = envelope(t, duration, attack, release);
      const vib = vibrato ? Math.sin(TAU * vibratoRate * t) * vibrato : 0;
      const phase = TAU * (frequency + vib) * t + detune;
      const sample = oscillator(type, phase) * amplitude * env;
      const index = startSample + i;
      if (index >= 0 && index < this.samples.length) {
        // Keep the mix mono but let the pan shape the contribution slightly.
        this.samples[index] += sample * (1 - Math.abs(pan) * 0.35);
      }
    }
  }

  chord(start, duration, notes, amplitude, options = {}) {
    notes.forEach((note, index) => {
      const offset = options.spread ? (index - (notes.length - 1) / 2) * options.spread : 0;
      this.tone(start + Math.max(0, offset), Math.max(0.1, duration - Math.abs(offset)), midi(note), amplitude, {
        type: options.type ?? 'sine',
        attack: options.attack ?? 0.5,
        release: options.release ?? 0.8,
        detune: index * 0.13,
        vibrato: options.vibrato ?? 0,
        vibratoRate: 4.6 + index * 0.2,
      });
    });
  }

  noise(start, duration, amplitude, options = {}) {
    const {attack = 0.005, release = duration * 0.8, seed = 1, lowpass = 0.2} = options;
    const random = seeded(seed);
    const startSample = Math.floor(start * this.sampleRate);
    const count = Math.floor(duration * this.sampleRate);
    let last = 0;
    for (let i = 0; i < count; i += 1) {
      const t = i / this.sampleRate;
      const env = envelope(t, duration, attack, release);
      const raw = random() * 2 - 1;
      last = last + lowpass * (raw - last);
      const value = last * amplitude * env;
      const index = startSample + i;
      if (index >= 0 && index < this.samples.length) {
        this.samples[index] += value;
      }
    }
  }

  normalize(target = 0.78) {
    let peak = 0;
    for (const sample of this.samples) {
      peak = Math.max(peak, Math.abs(sample));
    }
    if (peak < 1e-8) return;
    const gain = target / peak;
    for (let i = 0; i < this.samples.length; i += 1) {
      this.samples[i] = clamp(this.samples[i] * gain, -1, 1);
    }
  }

  fade(seconds = 2) {
    const frames = Math.floor(seconds * this.sampleRate);
    for (let i = 0; i < frames; i += 1) {
      const gain = i / frames;
      this.samples[i] *= gain;
      this.samples[this.samples.length - 1 - i] *= gain;
    }
  }

  write(file) {
    const dataLength = this.samples.length * 2;
    const buffer = Buffer.alloc(44 + dataLength);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(this.sampleRate, 24);
    buffer.writeUInt32LE(this.sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);
    for (let i = 0; i < this.samples.length; i += 1) {
      buffer.writeInt16LE(Math.round(clamp(this.samples[i], -1, 1) * 32767), 44 + i * 2);
    }
    fs.writeFileSync(file, buffer);
    console.log(`wrote ${path.relative(ROOT, file)} (${(dataLength / 1024 / 1024).toFixed(1)} MB)`);
  }
}

// ---------------------------------------------------------------------------
// Score
// ---------------------------------------------------------------------------

const sections = [
  {
    id: 'plan',
    start: 0,
    end: 30,
    tempo: 76,
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [41, 45, 48],
      [48, 52, 55],
    ],
    pad: 0.042,
    arp: 0.032,
    bass: 0.052,
    melody: 0.014,
    pulse: 0,
    noise: 0.005,
    color: 'warm',
  },
  {
    id: 'system',
    start: 30,
    end: 56,
    tempo: 64,
    chords: [
      [38, 45, 50],
      [34, 41, 46],
      [41, 45, 48],
      [36, 43, 48],
    ],
    pad: 0.052,
    arp: 0.014,
    bass: 0.06,
    melody: 0,
    pulse: 0,
    noise: 0.009,
    color: 'mystery',
  },
  {
    id: 'phone',
    start: 56,
    end: 76,
    tempo: 96,
    chords: [
      [43, 47, 50],
      [48, 52, 55],
      [45, 50, 53],
      [50, 53, 57],
    ],
    pad: 0.034,
    arp: 0.045,
    bass: 0.046,
    melody: 0.022,
    pulse: 0.025,
    noise: 0.003,
    color: 'wonder',
  },
  {
    id: 'store',
    start: 76,
    end: 96,
    tempo: 112,
    chords: [
      [45, 48, 52],
      [43, 46, 50],
      [41, 45, 48],
      [43, 47, 50],
    ],
    pad: 0.03,
    arp: 0.048,
    bass: 0.055,
    melody: 0.018,
    pulse: 0.05,
    noise: 0.002,
    color: 'system',
  },
  {
    id: 'return',
    start: 96,
    end: 105,
    tempo: 88,
    chords: [
      [50, 53, 57],
      [46, 50, 53],
      [48, 52, 55],
      [43, 47, 50],
    ],
    pad: 0.04,
    arp: 0.028,
    bass: 0.052,
    melody: 0.01,
    pulse: 0,
    noise: 0.005,
    color: 'warm',
  },
  {
    id: 'supplies',
    start: 105,
    end: 140,
    tempo: 102,
    chords: [
      [50, 57, 62],
      [46, 53, 58],
      [53, 60, 65],
      [48, 55, 60],
    ],
    pad: 0.043,
    arp: 0.036,
    bass: 0.062,
    melody: 0.024,
    pulse: 0.035,
    noise: 0.004,
    color: 'hope',
  },
  {
    id: 'meadow',
    start: 140,
    end: 170,
    tempo: 108,
    chords: [
      [48, 55, 60],
      [55, 62, 67],
      [57, 64, 69],
      [53, 60, 65],
    ],
    pad: 0.05,
    arp: 0.042,
    bass: 0.06,
    melody: 0.036,
    pulse: 0.045,
    noise: 0.006,
    color: 'hope',
  },
  {
    id: 'forest',
    start: 170,
    end: 190,
    tempo: 72,
    chords: [
      [38, 45, 50],
      [36, 43, 48],
      [34, 41, 46],
      [33, 40, 45],
    ],
    pad: 0.055,
    arp: 0.012,
    bass: 0.062,
    melody: 0,
    pulse: 0.02,
    noise: 0.012,
    color: 'mystery',
  },
];

const score = new Track(DURATION);

const addSection = (section) => {
  const beat = 60 / section.tempo;
  const bar = beat * 4;
  const startBar = Math.floor(section.start / bar);
  const endBar = Math.ceil(section.end / bar);
  const arpSteps = [0, 1, 2, 3, 4, 5, 4, 3];

  for (let barIndex = startBar; barIndex < endBar; barIndex += 1) {
    const time = barIndex * bar;
    if (time >= section.end) break;
    const chord = section.chords[Math.abs(barIndex) % section.chords.length];
    const root = chord[0];

    // Pad on every two bars.
    if (barIndex % 2 === 0) {
      score.chord(time, Math.min(bar * 2.1, section.end - time), chord, section.pad, {
        type: section.color === 'system' ? 'soft-square' : 'sine',
        attack: section.color === 'mystery' ? 1.4 : 0.8,
        release: 1.2,
        spread: 0.025,
        vibrato: section.color === 'wonder' ? 0.7 : 0,
      });
    }

    // Bass.
    for (let beatIndex = 0; beatIndex < 4; beatIndex += 1) {
      if (time + beatIndex * beat >= section.end) break;
      if (beatIndex === 0 || beatIndex === 2 || section.pulse > 0) {
        score.tone(time + beatIndex * beat, beat * 0.9, midi(root - 12), section.bass, {
          type: 'triangle',
          attack: 0.01,
          release: beat * 0.7,
        });
      }
    }

    // Arpeggio / sparkle.
    const arpEvery = section.color === 'mystery' ? 2 : 1;
    for (let step = 0; step < 8; step += arpEvery) {
      const t = time + step * (beat / 2);
      if (t >= section.end) break;
      const note = chord[arpSteps[(step + barIndex) % arpSteps.length] % chord.length] + 12;
      score.tone(t, beat * 0.8, midi(note), section.arp, {
        type: 'bell',
        attack: 0.008,
        release: beat * 1.1,
        pan: step % 2 === 0 ? -0.25 : 0.25,
      });
    }

    // Sparse melody motif in the warmer sections.
    if (section.melody > 0 && barIndex % 4 === 0) {
      const motif = [0, 2, 4, 2, 5, 4, 2, 0];
      motif.forEach((degree, index) => {
        const t = time + index * beat * 0.75;
        if (t >= section.end) return;
        const scale = [0, 2, 3, 5, 7, 10, 12];
        const note = chord[0] + 12 + scale[degree % scale.length];
        score.tone(t, beat * 0.9, midi(note), section.melody, {
          type: 'sine',
          attack: 0.02,
          release: beat * 1.2,
          vibrato: 0.4,
          vibratoRate: 4.8,
        });
      });
    }

    // Soft pulse for system/build tension.
    if (section.pulse > 0) {
      for (let step = 0; step < 8; step += 1) {
        const t = time + step * (beat / 2);
        if (t >= section.end) break;
        score.tone(t, 0.1, midi(chord[0] - 24), section.pulse * (step % 2 === 0 ? 1 : 0.55), {
          type: 'sine',
          attack: 0.004,
          release: 0.22,
        });
      }
    }

    // Air / texture.
    if (section.noise > 0 && barIndex % 2 === 0) {
      score.noise(time, Math.min(bar * 2, section.end - time), section.noise, {
        attack: 1.2,
        release: 1.8,
        seed: barIndex + 13,
        lowpass: 0.02,
      });
    }
  }
};

sections.forEach(addSection);

// A quiet low drone through the whole episode.
score.tone(0, DURATION, midi(38), 0.018, {type: 'sine', attack: 3, release: 5});
score.tone(0, DURATION, midi(45), 0.012, {type: 'sine', attack: 4, release: 5, detune: 0.2});

// The forest gets its own darker pedal and a slow, breathing swell.
score.tone(170, 20, midi(33), 0.035, {type: 'sine', attack: 1.6, release: 5});
score.tone(170, 20, midi(40), 0.018, {type: 'sine', attack: 2.4, release: 5, detune: 0.5});
score.tone(184.5, 5.5, midi(51), 0.026, {type: 'sine', attack: 0.6, release: 3.2, vibrato: 0.4});

// Light transitional chimes at the scene boundaries.
[30, 56, 60, 76, 96, 105, 112, 140, 170].forEach((time, index) => {
  score.tone(time - 0.12, 1.8, midi(74 + (index % 3) * 3), 0.022, {
    type: 'bell',
    attack: 0.01,
    release: 1.7,
  });
});

// Sub-booms on the big visual cuts and the price shock.
[56, 76, 84, 140].forEach((time, index) => {
  score.tone(time, 1.8, midi(34 + (index % 2) * 3), 0.055, {
    type: 'sine',
    attack: 0.01,
    release: 1.6,
  });
});
score.tone(186.3, 3.2, midi(30), 0.09, {type: 'sine', attack: 0.01, release: 2.8});
score.tone(186.3, 2.6, midi(39), 0.045, {type: 'triangle', attack: 0.01, release: 2.3});

score.fade(1.5);
score.normalize(0.72);
score.write(path.join(AUDIO, 'music', 'score.wav'));

// ---------------------------------------------------------------------------
// SFX
// ---------------------------------------------------------------------------

const makeSfx = (seconds) => new Track(seconds);

const saveSfx = (name, track, peak = 0.75) => {
  track.normalize(peak);
  track.write(path.join(AUDIO, 'sfx', `${name}.wav`));
};

// Stomach growl: low, wet, slightly comic.
{
  const sfx = makeSfx(1.35);
  const random = seeded(5);
  for (let i = 0; i < 24; i += 1) {
    const start = i * 0.045;
    const freq = 58 + random() * 45;
    sfx.tone(start, 0.22, freq, 0.17, {type: 'triangle', attack: 0.01, release: 0.18});
  }
  sfx.noise(0.1, 1.1, 0.045, {seed: 21, attack: 0.08, release: 0.8, lowpass: 0.08});
  saveSfx('stomach', sfx, 0.7);
}

// Door creak + latch.
{
  const sfx = makeSfx(0.95);
  for (let i = 0; i < 13; i += 1) {
    sfx.tone(i * 0.055, 0.14, 410 + i * 34, 0.045, {
      type: 'triangle',
      attack: 0.003,
      release: 0.12,
    });
  }
  sfx.noise(0.0, 0.28, 0.08, {seed: 8, attack: 0.005, release: 0.2, lowpass: 0.1});
  sfx.tone(0.52, 0.18, midi(38), 0.16, {type: 'sine', attack: 0.002, release: 0.16});
  saveSfx('door', sfx, 0.8);
}

// Pinch / soft comic sting.
{
  const sfx = makeSfx(0.55);
  sfx.tone(0.0, 0.12, midi(84), 0.1, {type: 'triangle', attack: 0.002, release: 0.1});
  sfx.tone(0.1, 0.18, midi(77), 0.08, {type: 'sine', attack: 0.002, release: 0.16});
  sfx.noise(0.0, 0.08, 0.06, {seed: 3, attack: 0.001, release: 0.06, lowpass: 0.25});
  saveSfx('pinch', sfx, 0.7);
}

// Notification chime.
{
  const sfx = makeSfx(1.3);
  sfx.tone(0.0, 0.5, midi(84), 0.12, {type: 'bell', attack: 0.003, release: 0.46});
  sfx.tone(0.12, 0.7, midi(88), 0.1, {type: 'bell', attack: 0.003, release: 0.64});
  sfx.tone(0.26, 0.9, midi(91), 0.06, {type: 'sine', attack: 0.003, release: 0.84});
  saveSfx('notify', sfx, 0.72);
}

// System boot: digital sweep and confirmation beeps.
{
  const sfx = makeSfx(1.7);
  for (let i = 0; i < 18; i += 1) {
    const t = i * 0.035;
    sfx.tone(t, 0.1, 300 + i * 55, 0.035, {
      type: 'soft-square',
      attack: 0.003,
      release: 0.09,
    });
  }
  sfx.tone(0.72, 0.55, midi(79), 0.09, {type: 'bell', attack: 0.003, release: 0.5});
  sfx.tone(1.02, 0.55, midi(86), 0.06, {type: 'bell', attack: 0.003, release: 0.5});
  sfx.noise(0.0, 1.0, 0.025, {seed: 12, attack: 0.1, release: 0.8, lowpass: 0.05});
  saveSfx('system', sfx, 0.68);
}

// Whoosh / UI panel sweep.
{
  const sfx = makeSfx(1.15);
  const random = seeded(33);
  for (let i = 0; i < 30; i += 1) {
    const t = i * 0.032;
    const env = Math.sin((i / 30) * Math.PI);
    sfx.tone(t, 0.3, 280 + i * 28 + random() * 20, 0.03 * env, {
      type: 'sine',
      attack: 0.02,
      release: 0.26,
    });
  }
  sfx.noise(0.0, 1.0, 0.06, {seed: 44, attack: 0.35, release: 0.6, lowpass: 0.03});
  saveSfx('whoosh', sfx, 0.65);
}

// Magic construction sparkle.
{
  const sfx = makeSfx(1.9);
  const notes = [72, 76, 79, 84, 88, 91, 96];
  notes.forEach((note, index) => {
    sfx.tone(index * 0.09, 1.0, midi(note), 0.06, {
      type: 'bell',
      attack: 0.004,
      release: 0.9,
      pan: index % 2 === 0 ? -0.2 : 0.2,
    });
  });
  sfx.noise(0.0, 1.6, 0.03, {seed: 55, attack: 0.1, release: 1.2, lowpass: 0.12});
  sfx.tone(0.9, 0.8, midi(48), 0.05, {type: 'sine', attack: 0.01, release: 0.75});
  saveSfx('magic', sfx, 0.72);
}

// Epic closing hit.
{
  const sfx = makeSfx(3.2);
  sfx.tone(0.0, 2.4, midi(36), 0.2, {type: 'sine', attack: 0.005, release: 2.2});
  sfx.tone(0.0, 1.6, midi(43), 0.1, {type: 'triangle', attack: 0.005, release: 1.4});
  sfx.chord(0.12, 2.8, [60, 64, 67, 72], 0.045, {
    type: 'sine',
    attack: 0.2,
    release: 2.5,
    spread: 0.02,
    vibrato: 0.4,
  });
  sfx.noise(0.0, 1.2, 0.04, {seed: 77, attack: 0.01, release: 1.0, lowpass: 0.04});
  saveSfx('epic', sfx, 0.78);
}

// Optional UI click, useful for future cuts.
{
  const sfx = makeSfx(0.18);
  sfx.tone(0.0, 0.08, midi(88), 0.08, {type: 'triangle', attack: 0.001, release: 0.07});
  saveSfx('click', sfx, 0.5);
}

// Cash register: drawer clack, scanner beep, then a small coin cascade.
{
  const sfx = makeSfx(1.7);
  sfx.noise(0.0, 0.16, 0.22, {seed: 201, attack: 0.001, release: 0.13, lowpass: 0.32});
  sfx.tone(0.0, 0.12, midi(41), 0.12, {type: 'triangle', attack: 0.001, release: 0.1});
  sfx.tone(0.18, 0.16, midi(88), 0.12, {type: 'soft-square', attack: 0.002, release: 0.12});
  sfx.tone(0.36, 0.2, midi(96), 0.09, {type: 'soft-square', attack: 0.002, release: 0.16});
  sfx.tone(0.52, 0.8, midi(91), 0.055, {type: 'bell', attack: 0.003, release: 0.7});
  for (let i = 0; i < 8; i += 1) {
    sfx.tone(0.62 + i * 0.055, 0.32, midi(96 + (i % 4) * 2), 0.025, {
      type: 'bell',
      attack: 0.001,
      release: 0.28,
      pan: i % 2 === 0 ? -0.25 : 0.25,
    });
  }
  sfx.noise(0.58, 0.9, 0.045, {seed: 202, attack: 0.02, release: 0.6, lowpass: 0.18});
  saveSfx('cash', sfx, 0.72);
}

// Single coin / till ding.
{
  const sfx = makeSfx(1.1);
  [0, 0.12, 0.25, 0.4].forEach((start, index) => {
    sfx.tone(start, 0.5 - index * 0.06, midi(96 + index * 3), 0.08 - index * 0.012, {
      type: 'bell',
      attack: 0.001,
      release: 0.42,
      pan: index % 2 === 0 ? -0.3 : 0.3,
    });
  });
  sfx.noise(0.0, 0.14, 0.06, {seed: 211, attack: 0.001, release: 0.1, lowpass: 0.4});
  saveSfx('coin', sfx, 0.62);
}

// Paper/plastic supply bag rustle.
{
  const sfx = makeSfx(1.35);
  for (let i = 0; i < 7; i += 1) {
    sfx.noise(i * 0.16, 0.24, 0.055 + (i % 3) * 0.012, {
      seed: 220 + i,
      attack: 0.012,
      release: 0.2,
      lowpass: 0.34,
    });
  }
  sfx.tone(0.04, 0.2, midi(47), 0.07, {type: 'triangle', attack: 0.005, release: 0.16});
  sfx.tone(0.58, 0.18, midi(53), 0.045, {type: 'triangle', attack: 0.005, release: 0.14});
  saveSfx('bag', sfx, 0.55);
}

// Four weighted footsteps with a little gravel.
{
  const sfx = makeSfx(2.4);
  [0.0, 0.54, 1.08, 1.62].forEach((start, index) => {
    sfx.tone(start, 0.22, 72 - index * 2, 0.16, {
      type: 'sine',
      attack: 0.004,
      release: 0.18,
    });
    sfx.noise(start, 0.18, 0.055, {
      seed: 230 + index,
      attack: 0.002,
      release: 0.15,
      lowpass: 0.18,
    });
    sfx.noise(start + 0.06, 0.12, 0.025, {
      seed: 240 + index,
      attack: 0.002,
      release: 0.1,
      lowpass: 0.45,
    });
  });
  saveSfx('footsteps', sfx, 0.58);
}

// Soft wind bed for the meadow / forest edge.
{
  const sfx = makeSfx(6.0);
  sfx.noise(0.0, 6.0, 0.18, {seed: 251, attack: 1.4, release: 3.4, lowpass: 0.008});
  sfx.noise(0.0, 5.8, 0.035, {seed: 252, attack: 2.2, release: 3.0, lowpass: 0.055});
  sfx.tone(0.0, 5.6, 164, 0.008, {type: 'sine', attack: 1.8, release: 2.4, vibrato: 9, vibratoRate: 0.35});
  saveSfx('wind', sfx, 0.5);
}

// Magical ground crack: snap, sub impact and a short bright shard.
{
  const sfx = makeSfx(1.5);
  sfx.noise(0.0, 0.26, 0.34, {seed: 261, attack: 0.001, release: 0.2, lowpass: 0.48});
  sfx.noise(0.16, 0.38, 0.2, {seed: 262, attack: 0.001, release: 0.3, lowpass: 0.3});
  sfx.tone(0.0, 0.8, midi(31), 0.19, {type: 'sine', attack: 0.002, release: 0.72});
  sfx.tone(0.0, 0.16, 1800, 0.06, {type: 'triangle', attack: 0.001, release: 0.13});
  sfx.tone(0.08, 0.4, 980, 0.045, {type: 'soft-square', attack: 0.001, release: 0.34});
  sfx.noise(0.28, 0.9, 0.055, {seed: 263, attack: 0.02, release: 0.75, lowpass: 0.06});
  saveSfx('crack', sfx, 0.78);
}

// Distant forest rumble.
{
  const sfx = makeSfx(3.0);
  sfx.noise(0.0, 3.0, 0.26, {seed: 271, attack: 0.2, release: 2.5, lowpass: 0.006});
  sfx.tone(0.0, 2.8, midi(28), 0.14, {type: 'sine', attack: 0.18, release: 2.4, vibrato: 1.4, vibratoRate: 1.2});
  sfx.tone(0.1, 2.6, midi(40), 0.055, {type: 'triangle', attack: 0.3, release: 2.2});
  saveSfx('rumble', sfx, 0.72);
}

// Quest-unlocked stinger.
{
  const sfx = makeSfx(2.2);
  [72, 76, 79, 84, 88].forEach((note, index) => {
    sfx.tone(index * 0.11, 1.25, midi(note), 0.07, {
      type: 'bell',
      attack: 0.003,
      release: 1.1,
      pan: index % 2 === 0 ? -0.2 : 0.2,
    });
  });
  sfx.chord(0.25, 1.8, [60, 64, 67, 72], 0.035, {
    type: 'sine',
    attack: 0.2,
    release: 1.5,
    spread: 0.03,
    vibrato: 0.25,
  });
  sfx.noise(0.0, 1.6, 0.025, {seed: 281, attack: 0.1, release: 1.2, lowpass: 0.1});
  saveSfx('quest', sfx, 0.7);
}

// Cliffhanger impact.
{
  const sfx = makeSfx(3.2);
  sfx.tone(0.0, 2.8, midi(27), 0.23, {type: 'sine', attack: 0.002, release: 2.5});
  sfx.tone(0.0, 1.8, midi(39), 0.1, {type: 'triangle', attack: 0.002, release: 1.5});
  sfx.noise(0.0, 1.4, 0.12, {seed: 291, attack: 0.002, release: 1.1, lowpass: 0.045});
  sfx.chord(0.04, 2.8, [48, 55, 60, 63], 0.045, {
    type: 'sine',
    attack: 0.05,
    release: 2.4,
    spread: 0.04,
    vibrato: 0.6,
  });
  sfx.tone(0.2, 2.2, midi(88), 0.03, {type: 'bell', attack: 0.005, release: 1.9});
  saveSfx('impact', sfx, 0.82);
}

console.log('Audio bed ready.');
