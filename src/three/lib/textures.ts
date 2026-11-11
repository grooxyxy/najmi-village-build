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
