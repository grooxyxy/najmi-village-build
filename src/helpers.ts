import {CLOUDS, loopT, rnd} from './scene';

// --- tiny easing / motion helpers (shared by all 5 styles) ---
export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const bob = (t: number, phase = 0, amp = 6, period = 1.6) =>
  Math.sin((t / period + phase) * Math.PI * 2) * amp;
export const sway = (t: number, phase = 0, deg = 3, period = 2.4) =>
  Math.sin((t / period + phase) * Math.PI * 2) * deg;

// Breathing scale for bodies.
export const breathe = (t: number, phase = 0) => 1 + Math.sin((t / 2.2 + phase) * Math.PI * 2) * 0.015;

// Blink cycle: returns 0..1 (1 = closed).
export const blink = (t: number, phase = 0): number => {
  const cycle = loopT(t + phase * 3.7, 3.2);
  return cycle < 0.12 ? smooth(cycle / 0.12) * (1 - smooth((cycle - 0.07) / 0.05)) : 0;
};

// Cloud x position with wrap-around drift.
export const cloudX = (i: number, t: number): number => {
  const c = CLOUDS[i];
  return loopT(c.x + t * c.speed, 2300) - 200;
};

// Floating dust/petal motes: returns array of {x,y,o,s}
export const motes = (t: number, n = 18, salt = 0) =>
  Array.from({length: n}, (_, i) => {
    const r1 = rnd(i + salt * 50);
    const r2 = rnd(i + salt * 50 + 17);
    const r3 = rnd(i + salt * 50 + 33);
    const speed = 8 + r3 * 14;
    const y = loopT(r2 * 1080 + t * speed, 1140) - 30;
    return {
      x: r1 * 1920 + Math.sin((t / (2 + r3 * 3) + r1 * 6) * Math.PI * 2) * 40,
      y,
      o: 0.25 + r3 * 0.5,
      s: 2 + r3 * 5,
    };
  });
