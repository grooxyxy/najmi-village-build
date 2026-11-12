import React from 'react';
import * as THREE from 'three';
import {SPRITES} from '../../../data/theme';
import {CameraRig, sampleCamera, type CameraKey} from '../../lib/camera';
import {
  Box,
  Cylinder,
  GlowSprite,
  Ico,
  Plane,
  UnlitPlane,
  type Vec3,
} from '../../lib/primitives';
import {DustMotes} from '../../lib/particles';
import {CharacterActor} from '../../lib/PixelSprite';
import {
  glowTexture,
  signTexture,
  tileTexture,
  warmGlowTexture,
  woodTexture,
} from '../../lib/textures';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const seg = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const cameraKeys: CameraKey[] = [
  {f: 0, position: [8.8, 4.8, 9.4], target: [0.0, 1.5, -2.2], fov: 40},
  {f: 90, position: [5.6, 3.0, 6.1], target: [1.1, 1.45, -2.2], fov: 33},
  {f: 180, position: [4.2, 1.85, 4.9], target: [1.7, 1.9, -2.6], fov: 28},
  {f: 240, position: [5.0, 3.0, 5.7], target: [1.4, 1.5, -3.0], fov: 28},
  {f: 300, position: [2.8, 2.2, 3.9], target: [1.0, 2.2, -2.4], fov: 22},
  {f: 430, position: [4.6, 2.8, 4.9], target: [1.0, 1.8, -2.4], fov: 28},
  {f: 599, position: [6.1, 3.5, 6.3], target: [0.0, 1.4, -1.8], fov: 34},
];

const ToolWall: React.FC = () => (
  <group position={[0, 0, -4.0]}>
    <Box size={[9.8, 0.3, 0.28]} position={[0, 0.15, 0]} color="#4d4b47" />
    <Box size={[9.8, 4.7, 0.12]} position={[0, 2.5, -0.07]} color="#5b5d58" />
    <Box size={[9.8, 0.12, 0.28]} position={[0, 4.85, 0.02]} color="#32342f" />
    {Array.from({length: 22}, (_, index) => (
      <mesh key={`peg-${index}`} position={[-4.5 + (index % 11) * 0.9, 1.0 + Math.floor(index / 11) * 2.2, 0.02]}>
        <circleGeometry args={[0.035, 8]} />
        <meshBasicMaterial color="#a7b6ad" />
      </mesh>
    ))}
    <group position={[-3.3, 0, 0.12]} rotation={[0, 0, 0.08]}>
      <Cylinder radiusTop={0.05} radiusBottom={0.05} height={2.8} segments={8} position={[0, 1.55, 0]} color="#a77b4e" />
      <Box size={[0.5, 0.8, 0.06]} position={[0, 0.15, 0]} color="#b9c2bf" />
      <Box size={[0.62, 0.12, 0.06]} position={[0, 0.55, 0]} color="#8e9998" />
    </group>
    <group position={[-1.1, 2.9, 0.12]} rotation={[0, 0, -0.12]}>
      <Cylinder radiusTop={0.055} radiusBottom={0.055} height={1.9} segments={8} position={[0, 0, 0]} color="#9f7146" />
      <Box size={[0.55, 0.3, 0.12]} position={[0.22, 0.75, 0]} color="#87918f" />
      <Box size={[0.3, 0.12, 0.12]} position={[-0.16, 0.75, 0]} color="#b6c0bd" />
    </group>
    <group position={[1.0, 2.8, 0.12]}>
      <Cylinder radiusTop={0.07} radiusBottom={0.07} height={1.35} segments={8} position={[0, 0, 0]} color="#a77b4e" />
      <Box size={[0.55, 0.2, 0.2]} position={[0, 0.75, 0]} color="#75817f" />
      <Box size={[0.22, 0.2, 0.22]} position={[0, 0.75, 0]} color="#aeb9b5" />
    </group>
    <group position={[2.9, 2.7, 0.12]}>
      {[0, 1, 2].map((ring) => (
        <mesh key={`rope-${ring}`} position={[0, ring * 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42 - ring * 0.04, 0.055, 8, 18]} />
          <meshLambertMaterial color={ring % 2 === 0 ? '#c8b17d' : '#b19a68'} />
        </mesh>
      ))}
    </group>
    <group position={[4.2, 2.25, 0.18]} rotation={[0, 0, 0.04]}>
      <Box size={[1.15, 1.1, 0.08]} position={[0, 0, 0]} color="#526d67" />
      <Box size={[1.02, 0.95, 0.05]} position={[0, 0, 0.06]} color="#6c8c82" />
      <Box size={[0.85, 0.75, 0.04]} position={[0, 0, 0.09]} color="#88a79a" />
    </group>
    <UnlitPlane width={8.5} height={1.0} position={[0, 4.55, 0.13]} map={signTexture('PERKAKAS & MATERIAL')} />
  </group>
);

const ShelfUnit: React.FC<{position: Vec3; rotation?: Vec3; height?: number; wide?: number}> = ({
  position,
  rotation = [0, 0, 0],
  height = 3.5,
  wide = 2.2,
}) => (
  <group position={position} rotation={rotation}>
    {[-wide / 2, wide / 2].map((x) => (
      <Box key={`shelf-leg-${x}`} size={[0.08, height, 0.78]} position={[x, height / 2, 0]} color="#3c4543" />
    ))}
    {[0.3, 1.0, 1.7, 2.4, 3.1].map((y) => (
      <Box key={`shelf-deck-${y}`} size={[wide, 0.08, 0.82]} position={[0, y, 0]} color="#7d847d" />
    ))}
    {[0.5, 1.25, 1.95, 2.65].map((y, row) =>
      [-wide * 0.25, wide * 0.22].map((x, index) => (
        <Box
          key={`stock-${row}-${index}`}
          size={[0.62, 0.42, 0.55]}
          position={[x, y, 0.03]}
          color={['#b27b4c', '#80624a', '#a9a186', '#5f7a72'][(row + index) % 4]}
          rotation={[0, (row - index) * 0.12, 0]}
        />
      )),
    )}
    <Box size={[wide + 0.2, 0.16, 0.9]} position={[0, height - 0.1, 0]} color="#303836" />
  </group>
);

const ShoppingCart: React.FC<{frame: number; load: number}> = ({frame, load}) => (
  <group position={[-0.35, 0, -1.45]} rotation={[0, -0.12, 0]}>
    <Box size={[1.3, 0.1, 0.8]} position={[0, 0.72, 0]} color="#778582" />
    <Box size={[1.3, 0.07, 0.06]} position={[0, 0.95, -0.38]} color="#8d9b97" />
    <Box size={[1.3, 0.07, 0.06]} position={[0, 0.95, 0.38]} color="#8d9b97" />
    <Box size={[0.06, 0.07, 0.8]} position={[-0.62, 0.95, 0]} color="#8d9b97" />
    <Box size={[0.06, 0.07, 0.8]} position={[0.62, 0.95, 0]} color="#8d9b97" />
    {[-0.6, 0.0, 0.6].map((x) => (
      <Box key={`cart-bar-${x}`} size={[0.03, 0.7, 0.03]} position={[x, 0.72, -0.38]} color="#9aa8a3" />
    ))}
    <Box size={[0.08, 0.6, 0.08]} position={[-0.66, 0.55, 0.32]} rotation={[0, 0, 0.35]} color="#8d9b97" />
    <Box size={[0.08, 0.6, 0.08]} position={[0.66, 0.55, 0.32]} rotation={[0, 0, -0.35]} color="#8d9b97" />
    {[-0.52, 0.52].map((x) =>
      [-0.3, 0.3].map((z) => (
        <Cylinder key={`wheel-${x}-${z}`} radiusTop={0.09} radiusBottom={0.09} height={0.08} segments={10} position={[x, 0.09, z]} rotation={[0, 0, Math.PI / 2]} color="#202625" />
      )),
    )}
    {load > 0.05 ? (
      <group position={[0, 0.88, 0]}>
        <Box size={[0.95, 0.38, 0.55]} position={[0, 0, 0]} color="#ad7b4d" />
        <Box size={[0.82, 0.28, 0.44]} position={[0.1, 0.3, 0.02]} color="#c79d68" rotation={[0, 0.2, 0]} />
        {load > 0.35 ? <Box size={[0.62, 0.22, 0.36]} position={[-0.05, 0.55, -0.02]} color="#6a887d" rotation={[0, -0.12, 0]} /> : null}
        {load > 0.7 ? <Cylinder radiusTop={0.13} radiusBottom={0.13} height={0.8} segments={8} position={[0.28, 0.62, 0.0]} rotation={[0, 0, 0.5]} color="#b6a36e" /> : null}
      </group>
    ) : null}
    <GlowSprite position={[0, 0.1, 0]} scale={1.2} map={glowTexture()} color="#ffe4ad" opacity={0.05 + Math.sin(frame / 40) * 0.01} />
  </group>
);

const Checkout: React.FC<{frame: number; total: number}> = ({frame, total}) => {
  const screenGlow = 0.4 + Math.min(1, total / 2.82) * 0.5;
  return (
    <group position={[1.0, 0, -3.25]}>
      <Box size={[3.1, 0.95, 1.0]} position={[0, 0.48, 0]} color="#6b6258" />
      <Box size={[3.2, 0.1, 1.1]} position={[0, 0.98, 0]} color="#b9ad96" />
      <Box size={[2.1, 0.06, 0.52]} position={[-0.2, 1.04, 0.14]} color="#292c2a" />
      <Box size={[0.72, 0.52, 0.45]} position={[0.92, 1.27, -0.15]} color="#3c413e" />
      <UnlitPlane width={0.56} height={0.32} position={[0.92, 1.29, 0.09]} color="#8bf2c8" opacity={screenGlow * 0.6} />
      <Box size={[0.12, 0.45, 0.12]} position={[0.92, 1.02, -0.15]} color="#202422" />
      <Cylinder radiusTop={0.1} radiusBottom={0.12} height={0.42} segments={8} position={[0.92, 2.0, -0.2]} color="#777f77" />
      <UnlitPlane width={0.85} height={0.52} position={[0.92, 2.25, -0.15]} map={signTexture(`TOTAL ${total > 0 ? Math.round(total * 1000000).toLocaleString('id-ID') : '---'}`)} />
      <GlowSprite position={[0.92, 2.25, -0.4]} scale={1.5} map={glowTexture()} color="#8bf2c8" opacity={screenGlow * 0.2} />
      <Box size={[0.5, 0.55, 0.4]} position={[-1.1, 1.2, -0.05]} color="#6b8f81" />
      <Box size={[0.42, 0.42, 0.34]} position={[-1.1, 1.24, 0.12]} color="#d6dfcc" />
      {[0, 1, 2].map((bag) => (
        <group key={`bag-${bag}`} position={[1.9 - bag * 0.35, 0.62, -0.1 + bag * 0.22]} rotation={[0, bag * 0.3, 0]}>
          <Box size={[0.45, 0.62, 0.32]} position={[0, 0, 0]} color={['#d8d0bc', '#b86d58', '#8a6c4e'][bag]} />
          <Box size={[0.12, 0.25, 0.08]} position={[-0.1, 0.38, 0]} color="#5d5143" />
          <Box size={[0.12, 0.25, 0.08]} position={[0.1, 0.38, 0]} color="#5d5143" />
        </group>
      ))}
      <pointLight position={[0.4, 2.1, 0.4]} color="#b9ffe6" intensity={1.8} distance={4} decay={2} />
      <DustMotes frame={frame} count={10} area={[2.5, 1.2, 2]} origin={[0, 1.7, 0]} opacity={0.16} color="#c9ffe9" />
    </group>
  );
};

const Fluorescent: React.FC<{position: Vec3; frame: number; flicker?: number}> = ({position, frame, flicker = 0}) => {
  const pulse = flicker === 0 ? 1 : 0.72 + Math.sin(frame / 7 + flicker) * 0.16 + (frame % 61 < 3 ? -0.3 : 0);
  return (
    <group position={position}>
      <Box size={[2.4, 0.1, 0.3]} position={[0, 0, 0]} color="#e9f3ed" emissive="#d6fff4" emissiveIntensity={1.8} flat />
      <Box size={[2.55, 0.16, 0.42]} position={[0, 0.12, 0]} color="#3c4543" />
      <pointLight position={[0, -0.2, 0]} color="#d8fff3" intensity={2.4 * pulse} distance={8} decay={2} />
      <GlowSprite position={[0, -0.1, 0]} scale={1.8} map={glowTexture()} color="#d8fff3" opacity={0.16 * pulse} />
      <mesh position={[0, -2.2, 0]}>
        <coneGeometry args={[1.25, 4.4, 16, 1, true]} />
        <meshBasicMaterial color="#d8fff3" transparent opacity={0.018 * pulse} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

const StackedBoxes: React.FC<{position: Vec3; rotation?: number}> = ({position, rotation = 0}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    {[
      [0, 0.35, 0, 0.9, 0.7, 0.7, '#b2804e'],
      [0.1, 0.85, 0.05, 0.7, 0.35, 0.55, '#8d6743'],
      [-0.8, 0.3, 0.2, 0.6, 0.6, 0.6, '#9d9276'],
    ].map(([x, y, z, w, h, d, color], index) => (
      <Box key={`stack-${index}`} size={[w as number, h as number, d as number]} position={[x as number, y as number, z as number]} color={color as string} />
    ))}
  </group>
);

export const Ep2StoreScene: React.FC<{frame: number}> = ({frame}) => {
  const pose = sampleCamera(cameraKeys, frame);
  const toolLoad = clamp01(seg(frame, 100, 225));
  const payGlow = clamp01(seg(frame, 210, 240));
  const total = 1.25 + payGlow * 1.57;
  const shock = frame >= 240 && frame < 330;

  let sprite: string = SPRITES.idle;
  let characterX = -2.4;
  let characterZ = -1.35;
  let walking = false;
  let jump = 0;
  let lean = 0;

  if (frame < 90) {
    const walk = seg(frame, 0, 80);
    characterX = -2.8 + walk * 2.0;
    characterZ = -1.25 - walk * 0.15;
    walking = true;
    sprite = [SPRITES.walk1, SPRITES.walk2, SPRITES.walk3, SPRITES.walk4][Math.floor(frame / 6) % 4];
    lean = 0.015;
  } else if (frame < 180) {
    const walk = seg(frame, 90, 170);
    characterX = -0.8 + walk * 1.45;
    characterZ = -1.4 + walk * 0.12;
    walking = frame < 175;
    sprite = walking ? [SPRITES.walk1, SPRITES.walk2, SPRITES.walk3, SPRITES.walk4][Math.floor(frame / 6) % 4] : SPRITES.point;
    lean = 0.012;
  } else if (frame < 240) {
    characterX = 0.65;
    characterZ = -1.45;
    sprite = SPRITES.phoneStand;
    lean = 0.008;
  } else if (frame < 300) {
    characterX = 0.55;
    characterZ = -1.35;
    sprite = SPRITES.surprised;
    jump = Math.sin(((frame - 240) / 60) * Math.PI) * 0.16;
    lean = -0.02;
  } else if (frame < 360) {
    characterX = 0.55;
    characterZ = -1.35;
    sprite = SPRITES.shout;
    jump = frame < 340 ? Math.sin(((frame - 300) / 40) * Math.PI) * 0.09 : 0;
    lean = -0.01;
  } else {
    characterX = 0.4 + Math.sin(frame / 80) * 0.06;
    characterZ = -1.25;
    sprite = frame < 440 ? SPRITES.sad : SPRITES.point;
    lean = 0.006;
    if (frame > 520) sprite = SPRITES.cheer;
  }

  return (
    <>
      <CameraRig
        frame={frame}
        pose={pose}
        shake={shock ? 0.035 : 0}
        roll={shock ? Math.sin(frame / 4) * 0.006 : 0}
        handheld={0.008}
      />
      <fog attach="fog" args={['#3a403d', 22, 58]} />

      <ambientLight intensity={0.36} color="#dceee8" />
      <hemisphereLight args={['#d7f5ec', '#39332c', 0.55]} />
      <directionalLight
        position={[3, 12, 6]}
        intensity={1.9}
        color="#eafff7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-10, 8, -5]} intensity={1.1} color="#9fd9d1" castShadow={false} />
      <pointLight position={[2.5, 3.2, -2.3]} color="#ffd8a0" intensity={2.8} distance={7} decay={2} />

      <Plane width={18} height={18} position={[0, 0, -1]} map={tileTexture([6, 6])} color="#8f9b96" />
      <Box size={[10.5, 0.22, 0.25]} position={[0, 0.11, 4.8]} color="#4f5753" />

      <ToolWall />
      <ShelfUnit position={[-4.55, 0, -2.1]} rotation={[0, 0.35, 0]} height={3.7} wide={2.4} />
      <ShelfUnit position={[4.5, 0, -2.25]} rotation={[0, -0.5, 0]} height={3.4} wide={2.0} />
      <ShelfUnit position={[-2.0, 0, -3.2]} rotation={[0, 0.08, 0]} height={2.5} wide={1.6} />

      <Checkout frame={frame} total={total} />
      <ShoppingCart frame={frame} load={toolLoad} />
      <StackedBoxes position={[3.0, 0, -0.35]} rotation={0.4} />
      <StackedBoxes position={[-3.4, 0, 1.3]} rotation={-0.3} />

      <Fluorescent position={[-2.5, 4.55, -1.8]} frame={frame} flicker={1.7} />
      <Fluorescent position={[1.6, 4.55, -1.6]} frame={frame} />
      <Fluorescent position={[4.3, 4.55, 0.8]} frame={frame} flicker={3.1} />

      <group position={[0.0, 2.55, -3.55]}>
        <UnlitPlane width={4.3} height={0.82} position={[0, 0, 0]} map={signTexture('ALAT TUKANG // PROMO')} />
        <GlowSprite position={[0, 0, -0.18]} scale={2.8} map={warmGlowTexture()} color="#ffe6b0" opacity={0.12} />
      </group>

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        walking={walking}
        walkSpeed={5.5}
        jump={jump}
        lean={lean}
        shadowRadius={0.48}
        shadowOpacity={0.22}
      />

      <DustMotes frame={frame} count={22} area={[10, 3, 7]} origin={[0, 2.4, -0.5]} opacity={0.15} color="#e8fff7" />
      <GlowSprite position={[1.0, 1.1, -2.8]} scale={3.4} map={glowTexture()} color="#b9ffe6" opacity={shock ? 0.12 : 0.05} />
    </>
  );
};
