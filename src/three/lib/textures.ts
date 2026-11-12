import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();

const rng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const makeTexture = (
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
  repeat: [number, number] = [1, 1],
  clamp = false,
): THREE.Texture => {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create a 2D canvas context for a texture.');
  }
  draw(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  texture.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
};

export const woodTexture = (repeat: [number, number] = [2, 1]): THREE.Texture =>
  makeTexture(
    `wood-${repeat.join('x')}`,
    128,
    128,
    (ctx) => {
      const random = rng(41);
      ctx.fillStyle = '#7a4b2a';
      ctx.fillRect(0, 0, 128, 128);
      const plankHeight = 32;
      for (let row = 0; row < 4; row += 1) {
        const y = row * plankHeight;
        ctx.fillStyle = row % 2 === 0 ? '#81502d' : '#704226';
        ctx.fillRect(0, y, 128, plankHeight - 2);
        ctx.fillStyle = 'rgba(45, 25, 12, 0.65)';
        ctx.fillRect(0, y + plankHeight - 2, 128, 2);
        for (let i = 0; i < 18; i += 1) {
          const gx = random() * 128;
          const gy = y + 3 + random() * (plankHeight - 8);
          const length = 4 + random() * 20;
          ctx.strokeStyle =
            random() > 0.5 ? 'rgba(48, 26, 12, 0.35)' : 'rgba(196, 139, 86, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + length, gy + (random() - 0.5) * 2);
          ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(30, 16, 8, 0.5)';
      for (let i = 0; i < 6; i += 1) {
        ctx.beginPath();
        ctx.ellipse(
          random() * 128,
          random() * 128,
          1.5 + random() * 2,
          3 + random() * 4,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    },
    repeat,
  );

export const grassTexture = (repeat: [number, number] = [14, 14]): THREE.Texture =>
  makeTexture(
    `grass-${repeat.join('x')}`,
    128,
    128,
    (ctx) => {
      const random = rng(7);
      ctx.fillStyle = '#6f9a4a';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 900; i += 1) {
        const x = random() * 128;
        const y = random() * 128;
        const green = 90 + Math.floor(random() * 80);
        ctx.fillStyle = `rgba(${40 + Math.floor(random() * 30)}, ${green}, ${
          40 + Math.floor(random() * 30)
        }, 0.55)`;
        ctx.fillRect(x, y, 1 + random() * 2, 1 + random() * 3);
      }
      for (let i = 0; i < 70; i += 1) {
        ctx.fillStyle = random() > 0.5 ? 'rgba(220, 218, 140, 0.35)' : 'rgba(40, 84, 30, 0.3)';
        ctx.fillRect(random() * 128, random() * 128, 1, 2 + random() * 3);
      }
    },
    repeat,
  );

export const tileTexture = (repeat: [number, number] = [3, 3]): THREE.Texture =>
  makeTexture(
    `tile-${repeat.join('x')}`,
    128,
    128,
    (ctx) => {
      ctx.fillStyle = '#c9d2c9';
      ctx.fillRect(0, 0, 128, 128);
      const size = 32;
      for (let y = 0; y < 128; y += size) {
        for (let x = 0; x < 128; x += size) {
          ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#e1e8df' : '#d6ded5';
          ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fillRect(x + 3, y + 3, size - 6, 2);
        }
      }
    },
    repeat,
  );

export const stoneTexture = (repeat: [number, number] = [2, 1]): THREE.Texture =>
  makeTexture(
    `stone-${repeat.join('x')}`,
    128,
    128,
    (ctx) => {
      const random = rng(19);
      ctx.fillStyle = '#7d837b';
      ctx.fillRect(0, 0, 128, 128);
      const blockH = 24;
      for (let row = 0; row < 6; row += 1) {
        const y = row * blockH;
        const offset = row % 2 === 0 ? 0 : 20;
        for (let x = -40; x < 140; x += 40) {
          ctx.fillStyle = row % 2 === 0 ? '#8f958c' : '#747b73';
          ctx.fillRect(x + offset + 2, y + 2, 36, blockH - 4);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(x + offset + 3, y + 3, 34, 2);
        }
      }
      for (let i = 0; i < 90; i += 1) {
        ctx.fillStyle = 'rgba(30, 35, 30, 0.18)';
        ctx.fillRect(random() * 128, random() * 128, 1 + random() * 3, 1 + random() * 2);
      }
    },
    repeat,
  );

export const roofTexture = (repeat: [number, number] = [3, 2]): THREE.Texture =>
  makeTexture(
    `roof-${repeat.join('x')}`,
    128,
    128,
    (ctx) => {
      const random = rng(23);
      ctx.fillStyle = '#3f5d52';
      ctx.fillRect(0, 0, 128, 128);
      for (let row = 0; row < 8; row += 1) {
        const y = row * 16;
        const offset = row % 2 === 0 ? 0 : 10;
        for (let x = -20; x < 140; x += 20) {
          ctx.fillStyle = row % 2 === 0 ? '#4a6a5e' : '#365247';
          ctx.fillRect(x + offset, y, 18, 14);
          ctx.fillStyle = 'rgba(15, 30, 26, 0.45)';
          ctx.fillRect(x + offset, y + 13, 18, 2);
        }
      }
      for (let i = 0; i < 60; i += 1) {
        ctx.fillStyle = 'rgba(180, 190, 150, 0.18)';
        ctx.fillRect(random() * 128, random() * 128, 1 + random() * 2, 1);
      }
    },
    repeat,
  );

export const waterTexture = (): THREE.Texture =>
  makeTexture(
    'water',
    128,
    128,
    (ctx) => {
      const random = rng(31);
      ctx.fillStyle = '#4e9fb5';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 36; i += 1) {
        const y = random() * 128;
        ctx.strokeStyle =
          random() > 0.5 ? 'rgba(214, 248, 245, 0.55)' : 'rgba(30, 100, 120, 0.4)';
        ctx.lineWidth = 1 + random();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(32, y - 3, 80, y + 4, 128, y);
        ctx.stroke();
      }
      for (let i = 0; i < 20; i += 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(random() * 128, random() * 128, 4 + random() * 12, 1);
      }
    },
    [2, 2],
  );

export const skyTexture = (): THREE.Texture =>
  makeTexture(
    'sky',
    32,
    512,
    (ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#5d9fc2');
      gradient.addColorStop(0.34, '#a8c9cf');
      gradient.addColorStop(0.58, '#f4c48a');
      gradient.addColorStop(0.78, '#f8d9a2');
      gradient.addColorStop(1, '#f2b877');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 512);
    },
    [1, 1],
    true,
  );

export const glowTexture = (): THREE.Texture =>
  makeTexture(
    'glow',
    128,
    128,
    (ctx) => {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.35, 'rgba(180, 245, 255, 0.75)');
      gradient.addColorStop(1, 'rgba(80, 200, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    },
    [1, 1],
    true,
  );

export const warmGlowTexture = (): THREE.Texture =>
  makeTexture(
    'warm-glow',
    128,
    128,
    (ctx) => {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 246, 214, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 210, 120, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 160, 60, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    },
    [1, 1],
    true,
  );

export const signTexture = (text: string): THREE.Texture =>
  makeTexture(
    `sign-${text}`,
    512,
    160,
    (ctx) => {
      ctx.fillStyle = '#4a2f1b';
      ctx.fillRect(0, 0, 512, 160);
      ctx.strokeStyle = '#b98a4d';
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 496, 144);
      ctx.fillStyle = '#f6ead3';
      ctx.font = 'bold 64px "DejaVu Sans", "Liberation Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 82);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let i = 0; i < 28; i += 1) {
        ctx.fillRect((i * 71) % 512, (i * 37) % 160, 20, 1);
      }
    },
    [1, 1],
    true,
  );

export const windowGlowTexture = (): THREE.Texture =>
  makeTexture(
    'window-glow',
    64,
    128,
    (ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 128);
      gradient.addColorStop(0, 'rgba(255, 226, 156, 0.9)');
      gradient.addColorStop(0.7, 'rgba(255, 190, 100, 0.55)');
      gradient.addColorStop(1, 'rgba(255, 150, 60, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 128);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(0, 12, 64, 3);
    },
    [1, 1],
    true,
  );

/**
 * A readable hologram card for the cabin/meadow System beats. The canvas has
 * real transparency so the plane can sit in the set like a projected panel.
 */
export const hologramTexture = (
  heading: string,
  title: string,
  lines: string[],
  accent = '#7fe7ff',
): THREE.Texture =>
  makeTexture(
    `holo-${heading}-${title}-${lines.join('|')}`,
    512,
    620,
    (ctx) => {
      ctx.clearRect(0, 0, 512, 620);
      ctx.fillStyle = 'rgba(4, 22, 34, 0.86)';
      ctx.fillRect(20, 20, 472, 580);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 472, 580);
      ctx.strokeStyle = 'rgba(127, 231, 255, 0.26)';
      ctx.lineWidth = 1;
      ctx.strokeRect(34, 34, 444, 552);
      for (let y = 38; y < 580; y += 5) {
        ctx.fillStyle = 'rgba(127, 231, 255, 0.035)';
        ctx.fillRect(20, y, 472, 1);
      }
      ctx.fillStyle = accent;
      ctx.font = 'bold 20px "DejaVu Sans Mono", monospace';
      ctx.fillText(`// ${heading}`, 54, 84);
      ctx.fillStyle = '#f6ead3';
      ctx.font = 'bold 38px "DejaVu Sans", sans-serif';
      const words = title.split(' ');
      const rows: string[] = [];
      let row = '';
      for (const word of words) {
        const next = row ? `${row} ${word}` : word;
        if (ctx.measureText(next).width > 400 && row) {
          rows.push(row);
          row = word;
        } else {
          row = next;
        }
      }
      if (row) rows.push(row);
      rows.forEach((text, index) => ctx.fillText(text, 54, 138 + index * 44));
      let y = 154 + rows.length * 44;
      for (const line of lines) {
        ctx.fillStyle = 'rgba(201, 240, 255, 0.75)';
        ctx.font = '22px "DejaVu Sans Mono", monospace';
        ctx.fillText(line, 54, y);
        y += 38;
      }
      ctx.fillStyle = 'rgba(127, 231, 255, 0.16)';
      ctx.fillRect(54, 500, 404, 18);
      ctx.fillStyle = accent;
      ctx.fillRect(54, 500, 92, 18);
      ctx.fillStyle = 'rgba(201, 240, 255, 0.62)';
      ctx.font = '17px "DejaVu Sans Mono", monospace';
      ctx.fillText('PROGRESS 0 / 1', 54, 546);
      ctx.fillText('HOST LINK // STABLE', 54, 573);
    },
    [1, 1],
    true,
  );

/** Jagged magical fissure used in the forest cliffhanger. */
export const crackTexture = (): THREE.Texture =>
  makeTexture(
    'crack-magic',
    512,
    512,
    (ctx) => {
      ctx.clearRect(0, 0, 512, 512);
      const random = rng(91);
      const branches: Array<{x: number; y: number; angle: number; length: number}> = [
        {x: 256, y: 500, angle: -Math.PI / 2, length: 420},
      ];
      ctx.lineCap = 'round';
      for (let index = 0; index < 8; index += 1) {
        branches.push({
          x: 180 + random() * 160,
          y: 420 - random() * 240,
          angle: -Math.PI / 2 + (random() - 0.5) * 2.3,
          length: 90 + random() * 160,
        });
      }
      for (const branch of branches) {
        let x = branch.x;
        let y = branch.y;
        let angle = branch.angle;
        const points: Array<[number, number]> = [[x, y]];
        for (let step = 0; step < 9; step += 1) {
          angle += (random() - 0.5) * 0.8;
          x += Math.cos(angle) * (branch.length / 9);
          y += Math.sin(angle) * (branch.length / 9);
          points.push([x, y]);
        }
        ctx.strokeStyle = 'rgba(15, 6, 26, 0.95)';
        ctx.lineWidth = 26;
        ctx.beginPath();
        points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.stroke();
        ctx.strokeStyle = 'rgba(146, 91, 255, 0.9)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.stroke();
        ctx.strokeStyle = 'rgba(209, 182, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.stroke();
      }
      const glow = ctx.createRadialGradient(256, 300, 20, 256, 300, 230);
      glow.addColorStop(0, 'rgba(140, 84, 255, 0.26)');
      glow.addColorStop(1, 'rgba(140, 84, 255, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 512, 512);
    },
    [1, 1],
    true,
  );

/** Antlered forest watcher silhouette, drawn as a cut-out for the cliffhanger. */
export const shadowWatcherTexture = (): THREE.Texture =>
  makeTexture(
    'shadow-watcher',
    512,
    620,
    (ctx) => {
      ctx.clearRect(0, 0, 512, 620);
      const glow = ctx.createRadialGradient(256, 300, 30, 256, 300, 260);
      glow.addColorStop(0, 'rgba(111, 73, 196, 0.35)');
      glow.addColorStop(1, 'rgba(111, 73, 196, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 512, 620);
      ctx.fillStyle = 'rgba(7, 8, 14, 0.98)';
      ctx.beginPath();
      ctx.ellipse(256, 210, 62, 82, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(197, 265);
      ctx.quadraticCurveTo(145, 400, 165, 610);
      ctx.lineTo(347, 610);
      ctx.quadraticCurveTo(367, 400, 315, 265);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(7, 8, 14, 0.98)';
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(210, 310);
      ctx.lineTo(125, 410);
      ctx.lineTo(95, 500);
      ctx.moveTo(302, 310);
      ctx.lineTo(387, 410);
      ctx.lineTo(417, 500);
      ctx.stroke();
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(225, 145);
      ctx.lineTo(170, 55);
      ctx.lineTo(145, 15);
      ctx.moveTo(170, 55);
      ctx.lineTo(205, 20);
      ctx.moveTo(287, 145);
      ctx.lineTo(342, 55);
      ctx.lineTo(367, 15);
      ctx.moveTo(342, 55);
      ctx.lineTo(307, 20);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(161, 113, 255, 0.48)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(256, 210, 66, 86, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(175, 244, 255, 0.95)';
      ctx.beginPath();
      ctx.ellipse(230, 205, 10, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(282, 205, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    [1, 1],
    true,
  );
