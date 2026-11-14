// Canvas 2D pen for the tuyul short.
// Design canvas 512 x 1024, soles at y = 1000.
// Style: big bean head + big rounded torso, arms and legs stay stick-thin.
// Ink outlines everywhere, flat fills, no gradients on the characters.
//
// The tuyul is deliberately NOT drawn in detail until `drawTuyul` is used in
// the classroom reveal. Before that the short only shows `drawTuyulBlur`
// (a pale, faceless shape) or `drawTuyulBack` (hunched back, no face).

export const CANVAS_W = 512;
export const CANVAS_H = 1024;
export const GROUND_Y = 1000;

export const INK = '#231528';
export const INK_SOFT = '#3a2233';

const SKIN = '#f3bd8c';
const SKIN_DK = '#d99a68';
const HAIR = '#191220';
const SHIRT = '#fbeeda';
const SHIRT_DK = '#e0d2b6';
const SHORTS = '#34436e';

const rad = (d: number) => (d * Math.PI) / 180;

export type Pose = {
  /** walk phase, -1 = resting */
  walk: number;
  /** body pitch in degrees */
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
  armL: number;
  armR: number;
  elbowL: number;
  elbowR: number;
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
  armL: 8,
  armR: 6,
  elbowL: 8,
  elbowR: 6,
  face: 1,
  ...over,
});

export const blinkAt = (t: number, first = 1) => {
  const p = (((t - first) % 3.4) + 3.4) % 3.4;
  if (p < 0.09) return p / 0.09;
  if (p < 0.15) return 1;
  if (p < 0.33) return 1 - (p - 0.15) / 0.18;
  return 0;
};

// ---------------------------------------------------------------- primitives

function stick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleDeg: number,
  len: number,
  width: number,
  color: string,
  inkW = 7,
) {
  const ex = x + Math.sin(rad(angleDeg)) * len;
  const ey = y + Math.cos(rad(angleDeg)) * len;
  const line = (w: number, c: string) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.lineWidth = w;
    ctx.strokeStyle = c;
    ctx.lineCap = 'round';
    ctx.stroke();
  };
  if (inkW > 0) line(width + inkW * 2, INK);
  line(width, color);
  return [ex, ey] as const;
}

function ball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, inkW = 6) {
  if (inkW > 0) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, r - inkW), 0, Math.PI * 2);
  } else {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = color;
  ctx.fill();
}

function ink(ctx: CanvasRenderingContext2D, path: () => void, fill: string, inkW = 7) {
  ctx.beginPath();
  path();
  ctx.fillStyle = fill;
  ctx.fill();
  if (inkW > 0) {
    ctx.lineWidth = inkW;
    ctx.strokeStyle = INK;
    ctx.stroke();
  }
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// --------------------------------------------------------------------- kids

const palette = (skin: string, shirt: string, shorts: string) => ({skin, shirt, shorts});

export function drawKid(
  ctx: CanvasRenderingContext2D,
  t: number,
  p: Pose,
  skin = SKIN,
  shirt = SHIRT,
  shorts = SHORTS,
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const col = palette(skin, shirt, shorts);
  const cx = 256;
  const breathe = Math.sin(t * 1.8) * 4;
  const walking = p.walk >= 0;
  const phase = walking ? p.walk * Math.PI * 2 : 0;
  const bob = walking ? Math.abs(Math.sin(phase)) * 16 : 0;
  const crouch = p.crouch * 90;
  const leanPx = p.lean * 3.4;

  const hipY = 690 - crouch - bob;
  const shoulderY = hipY - 240;
  const headRY = 138;
  const headCY = shoulderY - 156 - breathe - crouch * 0.12;
  const headRX = 150;
  const headX = cx + leanPx * 0.7 + p.yaw * 14;
  const bodyX = cx + leanPx;

  // ---- legs (front view: short swing, knee lift shortens the shin)
  for (const side of [-1, 1] as const) {
    const ph = phase + (side < 0 ? 0 : Math.PI);
    const step = walking ? Math.sin(ph) : 0;
    const lift = walking ? Math.max(0, Math.sin(ph)) : 0;
    const hipX = bodyX + side * 54;
    const swing = step * 12 + side * 2;
    const [kx, ky] = stick(ctx, hipX, hipY, swing, 126, 24, col.shorts);
    const lower = swing + lift * 16;
    const [ax, ay] = stick(ctx, kx, ky, lower, 147 - lift * 30, 20, col.skin);
    // sneaker, kept chunky so the stick legs still read as a kid
    ctx.save();
    ctx.translate(ax + side * 12, ay + 14);
    ctx.rotate(rad(lower * 0.45));
    rect(ctx, -34, -18, 74, 40, 18);
    ctx.fillStyle = '#201a2a';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = INK;
    ctx.stroke();
    rect(ctx, -18, -14, 46, 16, 8);
    ctx.fillStyle = '#3b3350';
    ctx.fill();
    rect(ctx, -32, 8, 70, 12, 6);
    ctx.fillStyle = '#f4eee2';
    ctx.fill();
    ctx.restore();
  }

  // ---- shorts
  ink(ctx, () => rect(ctx, bodyX - 84, hipY - 24, 168, 84, 22), col.shorts, 6);

  // ---- torso: big bean
  const tw = 140;
  ink(
    ctx,
    () => {
      ctx.moveTo(bodyX - tw + 8, shoulderY + 16);
      ctx.quadraticCurveTo(bodyX - tw - 6, hipY - 96, bodyX - tw + 26, hipY + 6);
      ctx.quadraticCurveTo(bodyX, hipY + 34, bodyX + tw - 26, hipY + 6);
      ctx.quadraticCurveTo(bodyX + tw + 6, hipY - 96, bodyX + tw - 8, shoulderY + 16);
      ctx.quadraticCurveTo(bodyX, shoulderY - 26, bodyX - tw + 8, shoulderY + 16);
      ctx.closePath();
    },
    col.shirt,
    7,
  );
  // hem
  ink(ctx, () => rect(ctx, bodyX - tw + 20, hipY - 6, tw * 2 - 40, 30, 12), SHIRT_DK, 5);
  // chest pocket
  ink(ctx, () => rect(ctx, bodyX + 42, shoulderY + 66, 42, 36, 8), col.shirt, 4);
  ctx.fillStyle = SHIRT_DK;
  ctx.fillRect(bodyX + 46, shoulderY + 70, 34, 6);

  // ---- stick arms with shirt sleeve caps
  for (const side of [-1, 1] as const) {
    const base = side < 0 ? p.armL : p.armR;
    const elbow = side < 0 ? p.elbowL : p.elbowR;
    const sx = bodyX + side * (tw - 18);
    const sy = shoulderY + 32;
    const lift = base * side * p.face;
    const [ex, ey] = stick(ctx, sx, sy, lift, 122, 18, col.skin);
    const [hx, hy] = stick(ctx, ex, ey, lift - elbow * side * 0.55, 100, 17, col.skin);
    ball(ctx, hx, hy, 17, col.skin, 5);
    // puff sleeve drawn last so it covers the shoulder joint cleanly
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(rad(lift));
    ink(ctx, () => ctx.ellipse(0, 8, 25, 30, 0, 0, Math.PI * 2), col.shirt, 5);
    ctx.restore();
  }

  // ---- neck
  ink(ctx, () => rect(ctx, headX - 28, headCY + headRY - 26, 56, 66, 20), SKIN_DK, 5);

  // ---- head
  ink(ctx, () => ctx.ellipse(headX, headCY, headRX, headRY, 0, 0, Math.PI * 2), col.skin, 7);
  // ears
  for (const side of [-1, 1] as const) {
    ink(ctx, () => ctx.ellipse(headX + side * (headRX - 4), headCY + 16, 20, 30, 0, 0, Math.PI * 2), SKIN_DK, 5);
  }

  // ---- hair: swept fringe + cowlick
  ink(
    ctx,
    () => {
      ctx.moveTo(headX - headRX - 2, headCY + 10);
      ctx.quadraticCurveTo(headX - headRX - 6, headCY - 118, headX - 20, headCY - headRY - 6);
      ctx.quadraticCurveTo(headX + 96, headCY - headRY - 18, headX + headRX + 2, headCY - 22);
      ctx.quadraticCurveTo(headX + 96, headCY - 58, headX + 52, headCY - 74);
      ctx.quadraticCurveTo(headX + 12, headCY - 96, headX - 30, headCY - 74);
      ctx.quadraticCurveTo(headX - 76, headCY - 54, headX - headRX + 10, headCY - 4);
      ctx.closePath();
    },
    HAIR,
    6,
  );
  // cowlick
  ink(
    ctx,
    () => {
      ctx.moveTo(headX - 18, headCY - headRY + 4);
      ctx.quadraticCurveTo(headX - 10, headCY - headRY - 58, headX + 34, headCY - headRY - 40);
      ctx.quadraticCurveTo(headX + 6, headCY - headRY - 24, headX + 22, headCY - headRY + 10);
      ctx.closePath();
    },
    HAIR,
    5,
  );

  // ---- face
  const fx = headX + p.yaw * 8;
  const fy = headCY + p.lookY * 4;
  const eyeDX = 62;
  for (const side of [-1, 1] as const) {
    const ex = fx + side * eyeDX + p.lookX * 12;
    const ey = fy + 2;
    const open = Math.max(0.06, 1 - p.blink);
    const ry = 42 * open;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ex, ey, 42, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf6';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = INK_SOFT;
    ctx.stroke();
    ctx.clip();
    ctx.beginPath();
    ctx.arc(ex + p.lookX * 12 + p.yaw * 6, ey + 2 + p.lookY * 10, 25 + p.wow * 2, 0, Math.PI * 2);
    ctx.fillStyle = '#120c18';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - 8 + p.lookX * 12, ey - 10, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    // brow
    ctx.beginPath();
    const browY = ey - 52 - p.wow * 10;
    ctx.moveTo(ex - 34, browY + 6);
    ctx.quadraticCurveTo(ex, browY - 8, ex + 34, browY + 2);
    ctx.strokeStyle = HAIR;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // nose
  ctx.beginPath();
  ctx.arc(fx + p.face * 4, fy + 52, 12, rad(20), rad(160));
  ctx.strokeStyle = SKIN_DK;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // mouth
  const mouthY = fy + 92;
  if (p.wow > 0.08) {
    ink(ctx, () => ctx.ellipse(fx, mouthY + 6, 20, 10 + 24 * p.wow, 0, 0, Math.PI * 2), '#7c3038', 5);
    ctx.beginPath();
    ctx.ellipse(fx, mouthY + 16, 12, 8 * p.wow, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c96a6a';
    ctx.fill();
  } else if (p.talk > 0.05) {
    ink(ctx, () => ctx.ellipse(fx, mouthY + 2, 16 + 8 * p.talk, 5 + 14 * p.talk, 0, 0, Math.PI * 2), '#7c3038', 5);
  } else {
    ctx.beginPath();
    ctx.arc(fx, mouthY - 8, 30, rad(24), rad(156));
    ctx.strokeStyle = '#8d4a44';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // cheek freckles
  ctx.fillStyle = 'rgba(214,126,100,0.35)';
  for (const side of [-1, 1] as const) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(fx + side * 96, fy + 48 + i * 8, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ------------------------------------------------------------------- adults

export function drawAdult(ctx: CanvasRenderingContext2D, t: number, wallet = 0, coat = '#4c4566') {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 256;
  const breathe = Math.sin(t * 1.4) * 3;
  const hipY = 706;
  const shoulderY = hipY - 250;
  const headCY = shoulderY - 120 - breathe;
  const coatDk = '#38304e';

  for (const side of [-1, 1] as const) {
    const [kx, ky] = stick(ctx, cx + side * 46, hipY, side * 3, 152, 22, '#2b2639');
    const [ax, ay] = stick(ctx, kx, ky, side * 1, 146, 20, '#2b2639');
    ctx.save();
    ctx.translate(ax + side * 10, ay + 16);
    rect(ctx, -32, -18, 70, 38, 16);
    ctx.fillStyle = '#171321';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.restore();
  }

  // long coat, big body, back view
  ink(
    ctx,
    () => {
      ctx.moveTo(cx - 138, shoulderY + 6);
      ctx.quadraticCurveTo(cx - 150, hipY - 90, cx - 128, hipY + 16);
      ctx.lineTo(cx + 128, hipY + 16);
      ctx.quadraticCurveTo(cx + 150, hipY - 90, cx + 138, shoulderY + 6);
      ctx.quadraticCurveTo(cx, shoulderY - 26, cx - 138, shoulderY + 6);
      ctx.closePath();
    },
    coat,
    7,
  );
  // coat vent + belt
  ctx.beginPath();
  ctx.moveTo(cx, hipY - 80);
  ctx.lineTo(cx, hipY + 12);
  ctx.strokeStyle = coatDk;
  ctx.lineWidth = 7;
  ctx.stroke();
  ink(ctx, () => rect(ctx, cx - 132, hipY - 70, 264, 18, 6), coatDk, 0);

  // stick arms, coat sleeves near the shoulder
  for (const side of [-1, 1] as const) {
    const sx = cx + side * 116;
    ball(ctx, sx, shoulderY + 44, 26, coat, 6);
    const [ex, ey] = stick(ctx, sx, shoulderY + 44, side * 7, 118, 20, coat);
    const [hx, hy] = stick(ctx, ex, ey, side * 2, 112, 17, '#e6b184');
    ball(ctx, hx, hy, 17, '#e6b184', 5);
  }

  // scarf
  ink(ctx, () => rect(ctx, cx - 78, shoulderY - 18, 156, 44, 18), '#8a5a52', 6);
  // head, back view
  ink(ctx, () => ctx.rect(cx - 26, headCY + 96, 52, 56), '#c98f60', 5);
  ink(ctx, () => ctx.ellipse(cx, headCY, 116, 122, 0, 0, Math.PI * 2), '#d9a374', 7);
  for (const side of [-1, 1] as const) {
    ink(ctx, () => ctx.ellipse(cx + side * 112, headCY + 18, 18, 26, 0, 0, Math.PI * 2), '#c98f60', 4);
  }
  // hair cap, leaving a skin nape
  ink(
    ctx,
    () => {
      ctx.moveTo(cx - 114, headCY + 12);
      ctx.quadraticCurveTo(cx - 108, headCY - 132, cx, headCY - 134);
      ctx.quadraticCurveTo(cx + 108, headCY - 132, cx + 114, headCY + 12);
      ctx.quadraticCurveTo(cx + 82, headCY + 78, cx + 54, headCY + 62);
      ctx.quadraticCurveTo(cx, headCY + 92, cx - 54, headCY + 62);
      ctx.quadraticCurveTo(cx - 82, headCY + 78, cx - 114, headCY + 12);
      ctx.closePath();
    },
    '#221a2e',
    5,
  );

  // shoulder bag + strap from the right shoulder to the left hip
  ink(
    ctx,
    () => {
      ctx.moveTo(cx + 78, shoulderY + 2);
      ctx.lineTo(cx + 100, shoulderY + 26);
      ctx.lineTo(cx - 144, hipY - 66);
      ctx.lineTo(cx - 164, hipY - 90);
      ctx.closePath();
    },
    '#2b2639',
    4,
  );
  ink(ctx, () => rect(ctx, cx - 218, hipY - 96, 104, 140, 26), '#211a2c', 6);
  ink(ctx, () => rect(ctx, cx + 62, hipY - 38, 86, 54, 10), '#6b4430', 6);
  for (let i = 0; i < 3; i++) {
    const lift = wallet * (10 + i * 7);
    ctx.globalAlpha = 0.35 + 0.65 * wallet;
    ink(ctx, () => rect(ctx, cx + 72 + i * 5, hipY - 52 - lift, 62, 24, 4), '#e4cf9a', 4);
    ctx.beginPath();
    ctx.moveTo(cx + 96 + i * 5, hipY - 44 - lift);
    ctx.lineTo(cx + 120 + i * 5, hipY - 44 - lift);
    ctx.strokeStyle = '#8d7442';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// -------------------------------------------------------------------- tuyul

const TUYUL_SKIN = '#c9ceb9';
const TUYUL_DK = '#979c86';

function aura(ctx: CanvasRenderingContext2D, t: number, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#4a2058';
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(t * 1.1 + i * 1.7) * 26;
    ctx.beginPath();
    ctx.ellipse(cx + sway + (i - 2) * 54 * scale, cy + 120 + (i % 2) * 90, 46 * scale, 120 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Faceless pale shape used before the reveal. Never shows eyes or teeth. */
export function drawTuyulBlur(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 256;
  const bob = Math.sin(t * 2.2) * 5;
  const sway = Math.sin(t * 1.3) * 6;
  aura(ctx, t, cx, 640, 0.8);
  ctx.save();
  ctx.globalAlpha = 0.9;
  // head sunk into hunched shoulders
  ink(ctx, () => ctx.ellipse(cx + sway, 640 + bob, 122, 116, 0, 0, Math.PI * 2), TUYUL_SKIN, 7);
  ink(
    ctx,
    () => {
      ctx.moveTo(cx - 76 + sway, 902);
      ctx.quadraticCurveTo(cx - 118 + sway, 780 + bob, cx - 66 + sway, 742 + bob);
      ctx.quadraticCurveTo(cx + sway, 710 + bob, cx + 66 + sway, 742 + bob);
      ctx.quadraticCurveTo(cx + 118 + sway, 780 + bob, cx + 76 + sway, 902);
      ctx.quadraticCurveTo(cx + sway, 940, cx - 76 + sway, 902);
      ctx.closePath();
    },
    TUYUL_SKIN,
    6,
  );
  // arms tucked against the body, hands near the knees
  for (const side of [-1, 1] as const) {
    const [ex, ey] = stick(ctx, cx + side * 66 + sway, 772 + bob, side * 18, 74, 20, TUYUL_SKIN);
    const [hx, hy] = stick(ctx, ex, ey, side * 2, 66, 17, TUYUL_SKIN);
    ball(ctx, hx, hy, 14, TUYUL_SKIN, 4);
  }
  // short bent legs
  for (const side of [-1, 1] as const) {
    const [kx, ky] = stick(ctx, cx + side * 46 + sway, 890, side * 24, 54, 21, TUYUL_SKIN);
    stick(ctx, kx, ky, side * 2, 66, 17, TUYUL_SKIN);
  }
  ctx.restore();
}

/** Hunched back view for the door shot: body only, no face. */
export function drawTuyulBack(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 256;
  const bob = Math.sin(t * 1.9) * 5;
  aura(ctx, t, cx, 560 + bob, 1);
  // short legs
  for (const side of [-1, 1] as const) {
    stick(ctx, cx + side * 54, 872 + bob, side * 12, 118, 24, TUYUL_SKIN);
    ink(ctx, () => ctx.ellipse(cx + side * 78, 986 + bob, 40, 16, 0, 0, Math.PI * 2), TUYUL_DK, 5);
  }
  // hunched body
  ink(
    ctx,
    () => {
      ctx.moveTo(cx - 100, 872 + bob);
      ctx.quadraticCurveTo(cx - 138, 700 + bob, cx - 82, 668 + bob);
      ctx.quadraticCurveTo(cx, 638 + bob, cx + 82, 668 + bob);
      ctx.quadraticCurveTo(cx + 138, 700 + bob, cx + 100, 872 + bob);
      ctx.closePath();
    },
    TUYUL_SKIN,
    7,
  );
  // spine bumps
  for (let i = 0; i < 5; i++) {
    const y = 692 + i * 34 + bob;
    ctx.beginPath();
    ctx.arc(cx, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = TUYUL_DK;
    ctx.fill();
  }
  // big bald head, back view
  ink(ctx, () => ctx.ellipse(cx, 520 + bob, 150, 152, 0, 0, Math.PI * 2), TUYUL_SKIN, 7);
  ink(ctx, () => ctx.ellipse(cx, 470 + bob, 118, 92, 0, 0, Math.PI * 2), '#e2e3d3', 0);
  // pointy ears
  for (const side of [-1, 1] as const) {
    ink(
      ctx,
      () => {
        ctx.moveTo(cx + side * 136, 500 + bob);
        ctx.lineTo(cx + side * 196, 470 + bob);
        ctx.lineTo(cx + side * 144, 556 + bob);
        ctx.closePath();
      },
      TUYUL_DK,
      5,
    );
  }
  // long arms
  for (const side of [-1, 1] as const) {
    const [ex, ey] = stick(ctx, cx + side * 100, 700 + bob, side * 42, 118, 20, TUYUL_SKIN);
    stick(ctx, ex, ey, side * 8, 120, 16, TUYUL_SKIN);
  }
}

/** The real thing: pale, bald, huge black eyes, sharp teeth, claws. */
export function drawTuyul(ctx: CanvasRenderingContext2D, t: number, p: Pose, reaching = 1) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 256;
  const bob = Math.sin(t * 2.4) * 5;
  const crouch = p.crouch * 40;
  const headCY = 486 + bob + crouch;
  aura(ctx, t, cx, 600, 1.15);

  // short bent legs
  for (const side of [-1, 1] as const) {
    const [kx, ky] = stick(ctx, cx + side * 60, 836, side * 44, 74, 26, TUYUL_SKIN);
    const [ax, ay] = stick(ctx, kx, ky, side * 6, 82, 22, TUYUL_SKIN);
    // claw foot
    for (let i = -1; i <= 1; i++) {
      ink(
        ctx,
        () => {
          ctx.moveTo(ax + i * 12, ay + 8);
          ctx.lineTo(ax + i * 20 + side * 18, ay + 34);
          ctx.lineTo(ax + i * 12 + side * 8, ay + 8);
          ctx.closePath();
        },
        TUYUL_DK,
        0,
      );
    }
  }

  // hunched body, ribs
  ink(
    ctx,
    () => {
      ctx.moveTo(cx - 96, 842);
      ctx.quadraticCurveTo(cx - 142, 710, cx - 90, 660);
      ctx.quadraticCurveTo(cx, 622, cx + 90, 660);
      ctx.quadraticCurveTo(cx + 142, 710, cx + 96, 842);
      ctx.quadraticCurveTo(cx, 872, cx - 96, 842);
      ctx.closePath();
    },
    TUYUL_SKIN,
    7,
  );
  ctx.strokeStyle = TUYUL_DK;
  ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(cx, 716 + i * 34, 44 - i * 3, rad(210), rad(330));
    ctx.stroke();
  }

  // shoulder spikes
  for (const side of [-1, 1] as const) {
    ink(
      ctx,
      () => {
        ctx.moveTo(cx + side * 78, 676);
        ctx.lineTo(cx + side * 116, 610);
        ctx.lineTo(cx + side * 108, 690);
        ctx.closePath();
      },
      TUYUL_DK,
      5,
    );
  }

  // arms: one reaching for the money, one long claw arm
  const reach = 118 + reaching * 40;
  const [exL, eyL] = stick(ctx, cx - 88, 700, -reach * 0.55, 130, 20, TUYUL_SKIN);
  const [hxL, hyL] = stick(ctx, exL, eyL, -reach * 0.2, 118, 17, TUYUL_SKIN);
  // long claws
  for (let i = -1; i <= 1; i++) {
    ink(
      ctx,
      () => {
        ctx.moveTo(hxL, hyL);
        ctx.quadraticCurveTo(hxL - 42 + i * 12, hyL + 34, hxL - 62 + i * 16, hyL + 92);
        ctx.quadraticCurveTo(hxL - 22 + i * 12, hyL + 40, hxL + 6, hyL + 10);
        ctx.closePath();
      },
      TUYUL_DK,
      4,
    );
  }
  const [exR, eyR] = stick(ctx, cx + 92, 692, 18, 108, 20, TUYUL_SKIN);
  const [hxR, hyR] = stick(ctx, exR, eyR, 205, 100, 17, TUYUL_SKIN);
  // stolen money clutched at chest height, fist on top of it
  ctx.save();
  ctx.translate(hxR + 26, hyR - 4);
  ctx.rotate(-0.2);
  ink(ctx, () => rect(ctx, -46, -36, 96, 70, 10), '#e7d3a0', 5);
  ink(ctx, () => rect(ctx, -34, -24, 72, 46, 5), '#f6e7bd', 3);
  ctx.beginPath();
  ctx.arc(2, -1, 14, 0, Math.PI * 2);
  ctx.strokeStyle = '#b08c4e';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
  ball(ctx, hxR, hyR, 16, TUYUL_SKIN, 5);

  // big bald head
  ink(ctx, () => ctx.ellipse(cx, headCY, 158, 150, 0, 0, Math.PI * 2), TUYUL_SKIN, 7);
  // dome shine
  ctx.beginPath();
  ctx.ellipse(cx - 40, headCY - 86, 58, 34, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
  // veins
  ctx.strokeStyle = '#8e937f';
  ctx.lineWidth = 4;
  for (const [sx, sy, ex2, ey2, mx, my] of [
    [-96, headCY - 72, -58, headCY - 18, -92, headCY - 44],
    [88, headCY - 88, 52, headCY - 34, 92, headCY - 58],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(mx, my, ex2, ey2);
    ctx.stroke();
  }
  // pointy ears
  for (const side of [-1, 1] as const) {
    ink(
      ctx,
      () => {
        ctx.moveTo(cx + side * 138, headCY - 16);
        ctx.lineTo(cx + side * 208, headCY - 54);
        ctx.lineTo(cx + side * 148, headCY + 54);
        ctx.closePath();
      },
      TUYUL_DK,
      6,
    );
  }

  // black eyes, no whites
  const eyeDx = 72;
  for (const side of [-1, 1] as const) {
    const ex = cx + side * eyeDx + p.yaw * 16;
    const ey = headCY + 10;
    // sunken socket
    ctx.beginPath();
    ctx.ellipse(ex, ey + 6, 72, 72, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(92,104,82,0.5)';
    ctx.fill();
    ink(ctx, () => ctx.ellipse(ex, ey, 56, 52, 0, 0, Math.PI * 2), '#07050b', 5);
    // angry upper lid cuts across the eye
    ctx.beginPath();
    ctx.moveTo(ex + side * 62, ey - 74);
    ctx.lineTo(ex - side * 62, ey - 12);
    ctx.lineTo(ex - side * 20, ey + 4);
    ctx.lineTo(ex + side * 62, ey - 34);
    ctx.closePath();
    ctx.fillStyle = TUYUL_SKIN;
    ctx.fill();
    ctx.strokeStyle = '#3f4740';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(ex + side * 62, ey - 74);
    ctx.lineTo(ex - side * 62, ey - 12);
    ctx.stroke();
    // pin glint
    ctx.beginPath();
    ctx.arc(ex - 14, ey + 14, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,246,230,0.92)';
    ctx.fill();
  }

  // nose slits
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.ellipse(cx + side * 12, headCY + 74, 6, 12, side * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#6e7261';
    ctx.fill();
  }

  // wide grin with sharp teeth
  const mouthW = 100;
  ctx.beginPath();
  ctx.moveTo(cx - mouthW, headCY + 88);
  ctx.quadraticCurveTo(cx, headCY + 172, cx + mouthW, headCY + 82);
  ctx.quadraticCurveTo(cx, headCY + 120, cx - mouthW, headCY + 88);
  ctx.closePath();
  ctx.fillStyle = '#2a1118';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#160a0e';
  ctx.stroke();
  // teeth
  ctx.fillStyle = '#f2ead3';
  for (let i = 0; i < 9; i++) {
    const x = cx - 78 + i * 19;
    const y = headCY + 96 + Math.sin((i / 8) * Math.PI) * 18;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.lineTo(x, y + 22 + (i % 2) * 7);
    ctx.lineTo(x + 9, y);
    ctx.closePath();
    ctx.fill();
  }
  // tongue
  ctx.beginPath();
  ctx.ellipse(cx, headCY + 140, 38, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8a3a44';
  ctx.fill();
}

// --------------------------------------------------------------- silhouette

export function drawSilhouette(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const cx = 256;
  const sway = Math.sin(t * 0.9) * 3;
  ctx.fillStyle = '#0b0710';
  // hat + head
  ctx.beginPath();
  ctx.ellipse(cx + sway, 470, 98, 104, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + sway, 392, 150, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + sway, 400, 84, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  // long coat body
  ctx.beginPath();
  ctx.moveTo(cx - 132 + sway, 1010);
  ctx.lineTo(cx - 118 + sway, 620);
  ctx.quadraticCurveTo(cx, 566, cx + 118 + sway, 620);
  ctx.lineTo(cx + 132 + sway, 1010);
  ctx.closePath();
  ctx.fill();
  // arms
  ctx.strokeStyle = '#0b0710';
  ctx.lineWidth = 34;
  ctx.lineCap = 'round';
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(cx + side * 112 + sway, 640);
    ctx.quadraticCurveTo(cx + side * 152 + sway, 780, cx + side * 138 + sway, 930);
    ctx.stroke();
  }
}
