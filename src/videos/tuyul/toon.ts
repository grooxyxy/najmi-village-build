// Canvas 2D character pen for the tuyul short.
// 512 x 1024 design canvas, soles at y = 1000. Flat colours + plum ink.
// Every moving part is drawn from a parameter, so nothing teleports between
// frames: walk cycles, breathing, blinks, gaze and follow-through are all
// continuous functions of time.

export const CANVAS_W = 512;
export const CANVAS_H = 1024;
export const GROUND_Y = 1000;

export const INK = '#241726';
export const INK_SOFT = '#3a2233';

const SKIN = '#f2bd8e';
const SKIN_DK = '#d09166';
const HAIR = '#1b1320';
const SHIRT = '#f7efda';
const SHIRT_DK = '#dbcfb2';
const SHORTS = '#3c4d7a';
const SOCK = '#eae4d4';
const SHOE = '#221a2b';

export type Pose = {
  /** 0..1 walk phase, -1 rest */
  walk: number;
  /** body pitch, degrees */
  lean: number;
  /** head turn, -1..1 */
  yaw: number;
  /** gaze, -1..1 */
  lookX: number;
  lookY: number;
  /** 0 open .. 1 closed */
  blink: number;
  /** talking mouth 0..1 */
  talk: number;
  /** 0..1 wow mouth */
  wow: number;
  /** crouch 0..1 */
  crouch: number;
  /** arms: 0 hangs, positive raises forward */
  armL: number;
  armR: number;
  /** elbow bend degrees */
  elbowL: number;
  elbowR: number;
  /** which way the body faces: 1 right, -1 left */
  face: 1 | -1;
};

export const restPose = (over: Partial<Pose> = {}): Pose => ({
  walk: -1,
  lean: 0,
  yaw: 0,
  lookX: 0,
  lookY: 0,
  blink: 0,
  talk: 0,
  wow: 0,
  crouch: 0,
  armL: 7,
  armR: 6,
  elbowL: 10,
  elbowR: 8,
  face: 1,
  ...over,
});

const rad = (d: number) => (d * Math.PI) / 180;

function limb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  width: number,
  color: string,
  outline = true,
) {
  const ex = x + Math.sin(rad(angle)) * length;
  const ey = y + Math.cos(rad(angle)) * length;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.lineWidth = width + (outline ? 6 : 0);
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  if (outline) ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
  return [ex, ey] as const;
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, ink = true) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (ink) {
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, r - 3, 0, Math.PI * 2);
  }
  ctx.fillStyle = fill;
  ctx.fill();
}

function shape(ctx: CanvasRenderingContext2D, path: () => void, fill: string, ink = 5) {
  ctx.beginPath();
  path();
  ctx.fillStyle = fill;
  ctx.fill();
  if (ink > 0) {
    ctx.lineWidth = ink;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Kid: 3.5 head-heights, bean head, stick limbs, ~1.55 m. */
export function drawKid(ctx: CanvasRenderingContext2D, t: number, p: Pose, skin = SKIN, shirt = SHIRT, shorts = SHORTS) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const face = p.face;
  const breath = Math.sin(t * 1.75) * 3;
  const bob = p.walk >= 0 ? Math.abs(Math.sin(p.walk * Math.PI * 2)) * 16 : 0;
  const hipY = 690 - p.crouch * 90 - bob;
  const shoulderY = hipY - 200;
  const headY = shoulderY - 132 - breath;
  const cx = 256;
  const shift = Math.sin(t * 0.72) * 4;

  // legs
  const swing = p.walk >= 0 ? Math.sin(p.walk * Math.PI * 2) * 34 : 0;
  const kneeL = p.walk >= 0 ? 34 * (0.5 + 0.5 * Math.sin(p.walk * Math.PI * 2 + 1.9)) : 4;
  const kneeR = p.walk >= 0 ? 34 * (0.5 + 0.5 * Math.sin(p.walk * Math.PI * 2 + 1.9 + Math.PI)) : 4;
  for (const side of [-1, 1] as const) {
    const a = (side < 0 ? swing : -swing) + side * 2;
    const knee = side < 0 ? kneeL : kneeR;
    const hx = cx + side * 46;
    const [kx, ky] = limb(ctx, hx, hipY, a, 150, 44, shorts);
    const [fx, fy] = limb(ctx, kx, ky, a - knee, 142, 38, skin);
    dot(ctx, kx, ky, 24, shorts);
    // sock + shoe
    limb(ctx, fx, fy, 0, 8, 42, SOCK);
    ctx.save();
    ctx.translate(fx + face * 16, fy + 12);
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = SHOE;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(-face * 6, -6, 26, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3a2d46';
    ctx.fill();
    ctx.restore();
  }

  // torso
  shape(ctx, () => {
    ctx.moveTo(cx - 88 + shift, shoulderY + 6);
    ctx.quadraticCurveTo(cx + shift, shoulderY - 16, cx + 88 + shift, shoulderY + 6);
    ctx.lineTo(cx + 74 + shift, hipY + 10);
    ctx.quadraticCurveTo(cx + shift, hipY + 24, cx - 74 + shift, hipY + 10);
    ctx.closePath();
  }, shirt, 6);
  // hem
  shape(ctx, () => roundRect(ctx, cx - 76 + shift, hipY - 2, 152, 26, 10), SHIRT_DK, 4);
  // collar
  shape(ctx, () => {
    ctx.moveTo(cx - 34 + shift, shoulderY + 2);
    ctx.lineTo(cx + 34 + shift, shoulderY + 2);
    ctx.lineTo(cx + shift, shoulderY + 52);
    ctx.closePath();
  }, SKIN_DK, 4);

  // arms
  for (const side of [-1, 1] as const) {
    const arm = side < 0 ? p.armL : p.armR;
    const elbow = side < 0 ? p.elbowL : p.elbowR;
    const sx = cx + shift + side * 92;
    const sy = shoulderY + 30;
    const lift = -arm * side * face;
    const [ex, ey] = limb(ctx, sx, sy, lift, 104, 40, shirt);
    const [hx, hy] = limb(ctx, ex, ey, lift + elbow * side * face, 96, 34, skin);
    dot(ctx, ex, ey, 21, shirt);
    dot(ctx, hx, hy, 20, skin);
  }

  // head
  const hx = cx + shift + p.yaw * 16;
  const headR = 118;
  shape(ctx, () => roundRect(ctx, hx - 26, headY + 96, 52, 46, 18), SKIN_DK, 5);
  shape(ctx, () => ctx.ellipse(hx, headY, 108, headR, 0, 0, Math.PI * 2), skin, 6);
  shape(ctx, () => ctx.ellipse(hx - 106, headY + 18, 16, 22, 0, 0, Math.PI * 2), skin, 5);
  shape(ctx, () => ctx.ellipse(hx + 106, headY + 18, 16, 22, 0, 0, Math.PI * 2), skin, 5);

  // hair cap
  shape(ctx, () => {
    ctx.arc(hx, headY - 6, 112, Math.PI, 0);
    ctx.lineTo(hx + 108, headY - 44);
    ctx.quadraticCurveTo(hx + 40, headY - 92, hx - 14, headY - 56);
    ctx.quadraticCurveTo(hx - 70, headY - 88, hx - 108, headY - 40);
    ctx.closePath();
  }, HAIR, 6);

  // eyes
  const eyeDX = 40;
  const lid = Math.max(0, Math.min(1, p.blink));
  for (const side of [-1, 1] as const) {
    const ex = hx + side * eyeDX + p.lookX * 10 + p.yaw * 6;
    const ey = headY + 8 + p.lookY * 6;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ex, ey, 25, 30 + p.wow * 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fdfbf6';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK_SOFT;
    ctx.stroke();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(ex + p.lookX * 8 + p.yaw * 4, ey + 2 + p.lookY * 5, 15 + p.wow * 3, 0, Math.PI * 2);
    ctx.fillStyle = '#120c18';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - 4 + p.lookX * 8, ey - 5, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    if (lid > 0.03) {
      ctx.fillStyle = skin;
      ctx.fillRect(ex - 30, ey - 34, 60, 68 * lid);
      ctx.strokeStyle = SKIN_DK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ex - 26, ey - 34 + 68 * lid);
      ctx.lineTo(ex + 26, ey - 34 + 68 * lid);
      ctx.stroke();
    }
    ctx.restore();
    // brow
    ctx.beginPath();
    ctx.moveTo(ex - 24, ey - 42);
    ctx.quadraticCurveTo(ex, ey - 50, ex + 22, ey - 44);
    ctx.strokeStyle = HAIR;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // nose + mouth
  shape(ctx, () => ctx.ellipse(hx + face * 2, headY + 46, 7, 6, 0, 0, Math.PI * 2), SKIN_DK, 0);
  if (p.wow > 0.05) {
    shape(ctx, () => ctx.ellipse(hx, headY + 76, 13, 8 + 14 * p.wow, 0, 0, Math.PI * 2), '#74343c', 4);
  } else if (p.talk > 0.02) {
    shape(ctx, () => ctx.ellipse(hx, headY + 74, 12 + 8 * p.talk, 4 + 10 * p.talk, 0, 0, Math.PI * 2), '#7d3a40', 4);
  } else {
    ctx.beginPath();
    ctx.arc(hx, headY + 64, 22, rad(20), rad(160));
    ctx.strokeStyle = '#8a4a44';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

/** Tuyul: small pale creature, bald oversized head, black eyes, crouched. */
export function drawTuyul(ctx: CanvasRenderingContext2D, t: number, p: Pose, reaching = 0) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const breath = Math.sin(t * 2.1) * 4;
  const cx = 256;
  const hipY = 880;
  const headY = 640 - breath + p.crouch * 60;
  const pale = '#efe9df';
  const paleDk = '#c9c1b5';

  // folded legs
  shape(ctx, () => ctx.ellipse(cx - 78, 930, 62, 34, -0.2, 0, Math.PI * 2), paleDk, 5);
  shape(ctx, () => ctx.ellipse(cx + 86, 930, 62, 34, 0.2, 0, Math.PI * 2), paleDk, 5);

  // hunched body
  shape(ctx, () => {
    ctx.moveTo(cx - 88, 930);
    ctx.quadraticCurveTo(cx - 104, 760, cx - 58, 748);
    ctx.lineTo(cx + 56, 748);
    ctx.quadraticCurveTo(cx + 104, 762, cx + 88, 930);
    ctx.closePath();
  }, pale, 6);

  // reaching arm (towards the wallet)
  const ang = 120 + reaching * 70;
  const [ex, ey] = limb(ctx, cx - 62, 800, -ang, 110, 26, pale);
  dot(ctx, ex, ey, 20, paleDk);

  // head
  const hr = 132;
  shape(ctx, () => ctx.ellipse(cx, headY, hr * 0.95, hr, 0, 0, Math.PI * 2), pale, 6);
  shape(ctx, () => ctx.ellipse(cx - hr + 8, headY + 20, 14, 20, 0, 0, Math.PI * 2), paleDk, 4);
  shape(ctx, () => ctx.ellipse(cx + hr - 8, headY + 20, 14, 20, 0, 0, Math.PI * 2), paleDk, 4);

  for (const side of [-1, 1] as const) {
    const ex2 = cx + side * 46;
    const ey2 = headY + 6;
    shape(ctx, () => ctx.ellipse(ex2, ey2, 34, 42, 0, 0, Math.PI * 2), '#fbf9f4', 4);
    shape(ctx, () => ctx.ellipse(ex2 + side * 2, ey2 + 3, 26, 34, 0, 0, Math.PI * 2), '#0d0911', 0);
    ctx.beginPath();
    ctx.arc(ex2 - 7, ey2 - 10, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  // small mouth
  ctx.beginPath();
  ctx.arc(cx, headY + 74, 15, rad(200), rad(340));
  ctx.strokeStyle = '#7d6862';
  ctx.lineWidth = 5;
  ctx.stroke();
}

/** Generic adult seen from behind: coat, bag, wallet pocket. */
export function drawAdult(ctx: CanvasRenderingContext2D, t: number, wallet = 0) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const breath = Math.sin(t * 1.4) * 3;
  const cx = 256;
  const hipY = 700;
  const coat = '#4a435f';
  const coatDk = '#3a344c';

  for (const side of [-1, 1] as const) {
    limb(ctx, cx + side * 48, hipY, side * 2, 280, 46, '#2c2838');
    ctx.save();
    ctx.translate(cx + side * 58, 986);
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 18, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1622';
    ctx.fill();
    ctx.restore();
  }
  shape(ctx, () => {
    ctx.moveTo(cx - 140, hipY - 300 - breath);
    ctx.lineTo(cx + 140, hipY - 300 - breath);
    ctx.lineTo(cx + 120, hipY + 14);
    ctx.lineTo(cx - 120, hipY + 14);
    ctx.closePath();
  }, coat, 6);
  shape(ctx, () => ctx.ellipse(cx, hipY - 372 - breath, 92, 104, 0, 0, Math.PI * 2), '#3c354e', 6);
  shape(ctx, () => {
    ctx.arc(cx, hipY - 380 - breath, 90, Math.PI, 0);
    ctx.lineTo(cx + 84, hipY - 380 - breath);
    ctx.lineTo(cx - 84, hipY - 380 - breath);
    ctx.closePath();
  }, '#221c2d', 4);
  // bag
  shape(ctx, () => roundRect(ctx, cx - 196, hipY - 90, 96, 132, 26), '#221c2d', 5);
  // wallet in hand at the hip
  shape(ctx, () => roundRect(ctx, cx + 74, hipY - 34, 74, 48, 10), '#6b4430', 5);
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.35 + 0.65 * wallet;
    shape(ctx, () => roundRect(ctx, cx + 84 + i * 4, hipY - 48 - i * 5 * wallet, 56, 22, 4), '#bfa768', 3);
    ctx.globalAlpha = 1;
  }
}

/** Featureless silhouette for the distant man at the gate. */
export function drawSilhouette(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 256;
  const sway = Math.sin(t * 0.9) * 3;
  ctx.fillStyle = '#0d0912';
  ctx.beginPath();
  ctx.ellipse(cx + sway, 520, 96, 112, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 128 + sway, 1010);
  ctx.lineTo(cx - 118 + sway, 640);
  ctx.quadraticCurveTo(cx, 590, cx + 118 + sway, 640);
  ctx.lineTo(cx + 128 + sway, 1010);
  ctx.closePath();
  ctx.fill();
}
