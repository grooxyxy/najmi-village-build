// Shared scene description — one isekai village, five style renderers.
// All coordinates are in a virtual 1920x1080 stage.

export type Vec = {x: number; y: number};

export type House = {
  pos: Vec;      // base center on ground
  w: number;
  h: number;
  roofH: number;
  hue: string;   // wall color
  roof: string;  // roof color
};

export type Person = {
  pos: Vec;      // feet position
  scale: number;
  phase: number; // animation offset
  body: string;  // shirt/tunic color
  hair: string;
  hat?: 'pointy' | 'cap' | 'none';
  walk: boolean; // walks a small loop
};

export type Tree = {pos: Vec; scale: number};

export const STAGE_W = 1920;
export const STAGE_H = 1080;
export const GROUND_Y = 760; // horizon/ground line

export const HOUSES: House[] = [
  {pos: {x: 430, y: 780}, w: 300, h: 210, roofH: 130, hue: '#e8d3a8', roof: '#a0522d'},
  {pos: {x: 960, y: 745}, w: 380, h: 260, roofH: 160, hue: '#f0e0bc', roof: '#8b4513'},
  {pos: {x: 1490, y: 775}, w: 300, h: 215, roofH: 135, hue: '#e2cba0', roof: '#9c5a2c'},
];

export const TREES: Tree[] = [
  {pos: {x: 140, y: 800}, scale: 1.15},
  {pos: {x: 720, y: 720}, scale: 0.85},
  {pos: {x: 1230, y: 715}, scale: 0.8},
  {pos: {x: 1800, y: 810}, scale: 1.25},
  {pos: {x: 1650, y: 700}, scale: 0.7},
  {pos: {x: 300, y: 690}, scale: 0.65},
];

export const PEOPLE: Person[] = [
  {pos: {x: 640, y: 905}, scale: 1.0, phase: 0.0, body: '#3f6fbf', hair: '#4a3220', hat: 'pointy', walk: true},
  {pos: {x: 1060, y: 935}, scale: 1.1, phase: 1.7, body: '#c0453e', hair: '#1e1a17', hat: 'cap', walk: false},
  {pos: {x: 1340, y: 895}, scale: 0.9, phase: 3.1, body: '#4f9d69', hair: '#8a6a2f', hat: 'none', walk: true},
  {pos: {x: 860, y: 960}, scale: 1.2, phase: 4.6, body: '#8a5fc9', hair: '#2b2b3a', hat: 'pointy', walk: false},
];

// Simple seeded RNG so every renderer agrees on clouds/rocks.
export const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const CLOUDS = Array.from({length: 6}, (_, i) => ({
  x: rnd(i) * 1920,
  y: 90 + rnd(i + 40) * 240,
  s: 0.6 + rnd(i + 80) * 0.9,
  speed: 6 + rnd(i + 120) * 10,
}));

export const ROCKS = Array.from({length: 14}, (_, i) => ({
  x: rnd(i + 200) * 1920,
  y: 800 + rnd(i + 240) * 240,
  s: 0.4 + rnd(i + 280) * 0.8,
}));

// Time helper: looping seconds.
export const loopT = (t: number, period: number): number =>
  ((t % period) + period) % period;

// Person walk position (small back-and-forth patrol).
export const personPos = (p: Person, t: number): Vec => {
  if (!p.walk) return p.pos;
  const off = Math.sin(t * 0.5 + p.phase) * 90;
  return {x: p.pos.x + off, y: p.pos.y};
};
