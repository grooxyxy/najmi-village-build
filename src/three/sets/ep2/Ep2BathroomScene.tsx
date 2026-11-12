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
import {DustMotes, Sparkles} from '../../lib/particles';
import {CharacterActor, PixelSprite} from '../../lib/PixelSprite';
import {
  glowTexture,
  grassTexture,
  skyTexture,
  stoneTexture,
  tileTexture,
  warmGlowTexture,
} from '../../lib/textures';
import {Cabin, Mountains, Sun, Tree} from '../../props/BuildingKit';

export type Ep2BathroomMode = 'arrive' | 'phone' | 'return' | 'carry';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const seg = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const arriveKeys: CameraKey[] = [
  {f: 0, position: [6.2, 4.4, 6.4], target: [1.0, 1.7, -3.6], fov: 39},
  {f: 28, position: [4.2, 3.3, 4.8], target: [1.0, 1.7, -3.4], fov: 34},
  {f: 58, position: [5.6, 3.5, 6.2], target: [0.2, 1.4, -1.2], fov: 35},
  {f: 89, position: [3.4, 2.7, 4.2], target: [0.4, 1.75, -1.2], fov: 29},
];

const phoneKeys: CameraKey[] = [
  {f: 0, position: [5.8, 3.5, 6.0], target: [0.8, 1.55, -1.9], fov: 34},
  {f: 120, position: [3.7, 2.9, 4.3], target: [0.8, 1.9, -1.8], fov: 26},
  {f: 255, position: [4.3, 3.2, 3.8], target: [0.3, 1.7, -2.7], fov: 30},
  {f: 370, position: [2.9, 2.0, 4.0], target: [1.0, 2.0, -1.6], fov: 27},
  {f: 430, position: [4.1, 2.6, 4.8], target: [1.2, 1.8, -2.4], fov: 25},
  {f: 479, position: [3.6, 2.4, 4.4], target: [1.0, 1.8, -3.2], fov: 23},
];

const returnKeys: CameraKey[] = [
  {f: 0, position: [7.0, 4.2, 7.2], target: [1.4, 1.3, -2.2], fov: 37},
  {f: 130, position: [4.6, 3.0, 5.0], target: [1.0, 1.4, -2.0], fov: 31},
  {f: 269, position: [3.4, 2.3, 4.1], target: [0.6, 1.5, -2.8], fov: 26},
];

const carryKeys: CameraKey[] = [
  {f: 0, position: [7.2, 4.0, 6.6], target: [1.8, 1.25, -2.0], fov: 36},
  {f: 110, position: [4.8, 2.7, 4.5], target: [1.0, 1.3, -2.2], fov: 30},
  {f: 209, position: [3.7, 2.2, 3.7], target: [0.2, 1.5, -2.8], fov: 26},
];

const PortalWorld: React.FC<{frame: number}> = ({frame}) => (
  <group position={[1.0, 0, -5.6]}>
    <UnlitPlane width={55} height={35} position={[0, 13, -32]} map={skyTexture()} opacity={1} fog={false} />
    <Sun position={[7.4, 7.6, -22]} />
    <Mountains z={-28} />
    <Plane width={24} height={42} position={[0.4, -0.05, -18]} map={grassTexture([12, 16])} color="#d9e6bb" />
    <Cabin position={[0.6, 0, -14.8]} scale={0.64} rotation={[0, 0.18, 0]} progress={1} frame={frame} accent="#3f7f78" />
    <Tree position={[-4.8, 0, -8.2]} scale={0.7} kind="pine" hue="dark" castShadow={false} />
    <Tree position={[5.3, 0, -9.2]} scale={0.8} kind="broad" hue="olive" castShadow={false} />
    <Tree position={[-2.2, 0, -12]} scale={0.6} kind="pine" hue="dark" castShadow={false} />
    <PixelSprite src={SPRITES.bird} position={[-2.5 + (frame % 180) * 0.02, 5.2, -11]} height={0.22} flip={frame % 360 < 180} />
    <Sparkles frame={frame} position={[0, 0.4, -6]} count={24} radius={2.8} size={0.055} opacity={0.45} color="#f6e6a8" />
    <UnlitPlane width={10} height={2.0} position={[0, 1.4, -12]} map={glowTexture()} color="#ecf7e8" opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
  </group>
);

const DoorPortal: React.FC<{frame: number; open: number}> = ({frame, open}) => {
  const rim = 0.15 + open * 0.55 + Math.sin(frame / 8) * 0.04;
  return (
    <group>
      <Box size={[4.4, 4.8, 0.3]} position={[-3.45, 2.4, -4.02]} map={tileTexture([2, 3])} color="#c7d4cd" />
      <Box size={[4.4, 4.8, 0.3]} position={[3.45, 2.4, -4.02]} map={tileTexture([2, 3])} color="#c7d4cd" />
      <Box size={[2.6, 1.2, 0.3]} position={[0, 4.22, -4.02]} map={tileTexture([2, 1])} color="#c7d4cd" />
      <Box size={[11.5, 3.35, 0.3]} position={[0, 6.55, -4.02]} map={tileTexture([3, 2])} color="#b8cbc3" castShadow={false} />
      <Box size={[0.2, 3.55, 0.3]} position={[-1.35, 1.78, -3.88]} color="#5a4431" />
      <Box size={[0.2, 3.55, 0.3]} position={[1.35, 1.78, -3.88]} color="#5a4431" />
      <Box size={[2.9, 0.2, 0.3]} position={[0, 3.56, -3.88]} color="#5a4431" />
      <Box size={[0.24, 3.65, 2.5]} position={[-1.42, 1.82, -5.2]} map={stoneTexture([1, 1])} color="#40534c" />
      <Box size={[0.24, 3.65, 2.5]} position={[1.42, 1.82, -5.2]} map={stoneTexture([1, 1])} color="#40534c" />
      <Box size={[3.1, 0.2, 2.5]} position={[0, 3.62, -5.2]} map={stoneTexture([1, 1])} color="#384a43" />
      <Box size={[3.1, 0.14, 2.5]} position={[0, 0.06, -5.2]} map={stoneTexture([1, 1])} color="#59685d" />

      <group position={[-1.3, 1.72, -3.84]} rotation={[0, -open * 1.3, 0]}>
        <Box size={[2.5, 3.3, 0.14]} position={[1.25, 0, 0]} color="#6e4b30" />
        <Box size={[2.26, 3.04, 0.08]} position={[1.25, 0, 0.1]} color="#8f6843" />
        <Box size={[1.8, 0.06, 0.05]} position={[1.25, 0.7, 0.16]} color="#6a4a2e" />
        <Box size={[1.8, 0.06, 0.05]} position={[1.25, -0.7, 0.16]} color="#6a4a2e" />
        <mesh position={[2.05, -0.12, 0.2]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshLambertMaterial color="#d4b16a" />
        </mesh>
      </group>

      <PortalWorld frame={frame} />

      <mesh position={[0, 1.75, -3.82]}>
        <planeGeometry args={[2.72, 3.52]} />
        <meshBasicMaterial color="#a8f8ff" transparent opacity={0.05 + open * 0.14} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 3.56, -3.8]}>
        <boxGeometry args={[2.86, 0.05, 0.05]} />
        <meshBasicMaterial color="#a8f8ff" transparent opacity={rim} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.02, -3.8]}>
        <boxGeometry args={[2.86, 0.05, 0.05]} />
        <meshBasicMaterial color="#a8f8ff" transparent opacity={rim * 0.75} toneMapped={false} />
      </mesh>
      <mesh position={[-1.4, 1.75, -3.8]}>
        <boxGeometry args={[0.05, 3.55, 0.05]} />
        <meshBasicMaterial color="#a8f8ff" transparent opacity={rim} toneMapped={false} />
      </mesh>
      <mesh position={[1.4, 1.75, -3.8]}>
        <boxGeometry args={[0.05, 3.55, 0.05]} />
        <meshBasicMaterial color="#a8f8ff" transparent opacity={rim} toneMapped={false} />
      </mesh>
      <GlowSprite position={[0, 2.0, -5.0]} scale={4.2} map={glowTexture()} color="#9feaff" opacity={0.12 + open * 0.38} />
      <pointLight position={[0, 2.0, -5.2]} color="#8fefff" intensity={0.5 + open * 5.2} distance={12} decay={2} />
    </group>
  );
};

const Sink: React.FC<{frame: number}> = ({frame}) => (
  <group>
    <Box size={[2.4, 0.75, 1.15]} position={[2.9, 0.4, -3.15]} color="#b6a68f" />
    <Box size={[2.6, 0.12, 1.3]} position={[2.9, 0.84, -3.15]} color="#e7e1d2" />
    <Cylinder radiusTop={0.58} radiusBottom={0.46} height={0.18} segments={18} position={[2.9, 0.9, -3.08]} color="#f1ede2" />
    <Cylinder radiusTop={0.44} radiusBottom={0.37} height={0.05} segments={18} position={[2.9, 1.0, -3.08]} color="#85b8c2" />
    <UnlitPlane width={0.7} height={0.48} position={[2.9, 1.02, -3.08]} rotation={[-Math.PI / 2, 0, 0]} color="#82d5e4" opacity={0.34 + Math.sin(frame / 18) * 0.06} />
    <Cylinder radiusTop={0.05} radiusBottom={0.05} height={0.5} segments={8} position={[2.9, 1.22, -3.55]} color="#9aa9a7" />
    <Cylinder radiusTop={0.055} radiusBottom={0.055} height={0.46} segments={8} position={[2.9, 1.43, -3.33]} rotation={[Math.PI / 2, 0, 0]} color="#9aa9a7" />
    <Cylinder radiusTop={0.07} radiusBottom={0.05} height={0.15} segments={8} position={[2.9, 1.38, -3.1]} color="#9aa9a7" />
    <Cylinder radiusTop={0.14} radiusBottom={0.17} height={0.32} segments={10} position={[3.65, 1.0, -3.1]} color="#d9c9a5" />
    <Ico radius={0.2} detail={0} position={[3.65, 1.24, -3.1]} color="#4d7f4d" castShadow={false} />
    <Ico radius={0.15} detail={0} position={[3.5, 1.32, -3.02]} color="#5f955d" castShadow={false} />
    <group position={[2.9, 3.0, -4.02]}>
      <Box size={[1.7, 1.9, 0.1]} position={[0, 0, 0]} color="#5c6a66" />
      <UnlitPlane width={1.48} height={1.68} position={[0, 0, 0.07]} color="#b9d8d7" opacity={0.86} />
      <UnlitPlane width={0.13} height={1.35} position={[-0.45, 0.1, 0.09]} color="#e8ffff" opacity={0.28} />
      <Box size={[1.65, 0.08, 0.16]} position={[0, -0.92, 0.06]} color="#8a7556" />
    </group>
    <GlowSprite position={[2.9, 3.0, -3.7]} scale={2.3} map={warmGlowTexture()} color="#ffe8c0" opacity={0.24} />
  </group>
);

const Toilet: React.FC = () => (
  <group position={[-3.55, 0, -2.75]}>
    <Box size={[1.1, 1.5, 0.5]} position={[0, 1.0, -0.35]} color="#e9e9e0" />
    <Box size={[1.15, 0.12, 0.55]} position={[0, 1.78, -0.35]} color="#d2d8d2" />
    <Cylinder radiusTop={0.52} radiusBottom={0.45} height={0.52} segments={16} position={[0, 0.35, 0.18]} color="#eef0e9" />
    <Cylinder radiusTop={0.56} radiusBottom={0.56} height={0.1} segments={16} position={[0, 0.64, 0.18]} color="#d7ded9" />
    <Box size={[0.9, 0.08, 0.9]} position={[0, 0.7, 0.18]} color="#f2f2e9" />
    <Cylinder radiusTop={0.07} radiusBottom={0.07} height={0.16} segments={8} position={[0.32, 1.88, -0.35]} color="#9ca9a5" />
  </group>
);

const Shower: React.FC = () => (
  <group position={[-4.5, 0, 1.0]}>
    <Box size={[2.2, 0.08, 2.7]} position={[0, 0.05, 0]} map={tileTexture([2, 2])} color="#e5eee9" />
    <Box size={[0.06, 2.7, 2.5]} position={[1.12, 1.35, 0]} color="#a8c4c5" opacity={0.22} transparent />
    <Cylinder radiusTop={0.06} radiusBottom={0.06} height={1.4} segments={8} position={[0.85, 2.2, 0]} color="#9aa8a4" />
    <Cylinder radiusTop={0.18} radiusBottom={0.22} height={0.16} segments={10} position={[0.85, 2.92, 0]} color="#9aa8a4" />
    <UnlitPlane width={2.1} height={1.9} position={[0, 2.1, 1.2]} color="#d3f2ef" opacity={0.12} rotation={[0, 0, 0]} />
  </group>
);

const Bags: React.FC<{position: Vec3; frame: number}> = ({position, frame}) => (
  <group position={position}>
    {[
      {x: -0.9, z: 0.1, c: '#8a6b4a', h: 0.62, w: 0.95},
      {x: 0.3, z: -0.25, c: '#a66d52', h: 0.52, w: 0.82},
      {x: 1.0, z: 0.35, c: '#4e6b63', h: 0.44, w: 0.7},
    ].map((bag, index) => (
      <group key={`bag-${index}`} position={[bag.x, bag.h / 2, bag.z]} rotation={[0, index * 0.7, 0]}>
        <Box size={[bag.w, bag.h, 0.52]} position={[0, 0, 0]} color={bag.c} />
        <Box size={[bag.w + 0.04, 0.08, 0.56]} position={[0, bag.h / 2 - 0.02, 0]} color="#63513f" />
        <Box size={[0.08, 0.3, 0.08]} position={[-0.24, bag.h / 2 + 0.14, 0]} color="#473b30" />
        <Box size={[0.08, 0.3, 0.08]} position={[0.24, bag.h / 2 + 0.14, 0]} color="#473b30" />
        <Box size={[0.5, 0.04, 0.06]} position={[0, bag.h / 2 + 0.28, 0]} color="#473b30" />
      </group>
    ))}
    <Sparkles frame={frame} position={[0, 0.2, 0]} count={10} radius={1.2} size={0.04} opacity={0.16} color="#ffe5ad" />
  </group>
);

export const Ep2BathroomScene: React.FC<{frame: number; mode: Ep2BathroomMode}> = ({frame, mode}) => {
  const keys = mode === 'arrive' ? arriveKeys : mode === 'phone' ? phoneKeys : mode === 'return' ? returnKeys : carryKeys;
  const pose = sampleCamera(keys, frame);
  const doorOpen =
    mode === 'arrive'
      ? clamp01(0.7 + seg(frame, 0, 50) * 0.3)
      : mode === 'phone'
        ? clamp01(0.1 + seg(frame, 400, 470) * 0.9)
        : 1;

  let sprite: string = SPRITES.phoneStand;
  let characterX = 0.7;
  let characterZ = -1.5;
  let walking = false;
  let jump = 0;
  let lean = 0;

  if (mode === 'arrive') {
    const walk = seg(frame, 0, 78);
    characterX = 1.0 - walk * 1.25;
    characterZ = -3.15 + walk * 1.45;
    walking = frame < 82;
    sprite = walking ? [SPRITES.walk1, SPRITES.walk2, SPRITES.walk3, SPRITES.walk4][Math.floor(frame / 6) % 4] : SPRITES.surprised;
    jump = frame >= 82 && frame < 112 ? Math.sin(((frame - 82) / 30) * Math.PI) * 0.12 : 0;
    lean = walking ? 0.02 : 0.01;
  } else if (mode === 'phone') {
    characterX = 0.75 + Math.sin(frame / 120) * 0.08;
    characterZ = -1.75;
    if (frame < 120) sprite = SPRITES.phoneStand;
    else if (frame < 260) sprite = SPRITES.think;
    else if (frame < 390) sprite = SPRITES.phoneStand;
    else if (frame < 430) sprite = SPRITES.point;
    else sprite = SPRITES.surprised;
    jump = frame >= 430 && frame < 458 ? Math.sin(((frame - 430) / 28) * Math.PI) * 0.07 : 0;
    lean = Math.sin(frame / 95) * 0.008;
  } else if (mode === 'return') {
    const walk = seg(frame, 0, 80);
    characterX = 0.5 + walk * 0.8;
    characterZ = -2.9 + walk * 0.7;
    walking = frame < 85;
    sprite = walking ? [SPRITES.walk1, SPRITES.walk2, SPRITES.walk3, SPRITES.walk4][Math.floor(frame / 6) % 4] : SPRITES.point;
    lean = 0.015;
  } else {
    const walk = seg(frame, 0, 220);
    characterX = 1.4 - walk * 1.9;
    characterZ = -3.0 + walk * 1.0;
    walking = frame < 235;
    sprite = SPRITES.carry;
    jump = 0;
    lean = walking ? 0.025 : 0.005;
  }

  return (
    <>
      <CameraRig
        frame={frame}
        pose={pose}
        handheld={mode === 'carry' ? 0.016 : 0.007}
        roll={mode === 'carry' ? Math.sin(frame / 35) * 0.004 : 0}
        shake={mode === 'phone' && frame > 430 ? 0.02 : 0}
      />
      <fog attach="fog" args={['#9fb8ad', 16, 54]} />

      <ambientLight intensity={0.34} color="#e0efeb" />
      <hemisphereLight args={['#d9f2f1', '#51493f', 0.5]} />
      <directionalLight
        position={[4.5, 9, 6]}
        intensity={2.4}
        color="#ffe4bc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-8, 10, -6]} intensity={1.5} color="#8fd6d9" castShadow={false} />
      <pointLight position={[2.9, 3.1, -2.8]} color="#ffe0b8" intensity={3.4} distance={6} decay={2} />
      <pointLight position={[0, 3.8, 0.4]} color="#ffd8b0" intensity={2.2} distance={9} decay={2} />

      <Plane width={11.6} height={12} position={[0, 0, 0.6]} map={tileTexture([4, 4])} color="#cfdad2" />
      <Box size={[0.28, 4.8, 12]} position={[-5.3, 2.4, 0.6]} map={tileTexture([2, 2])} color="#a8bcb5" />
      <Box size={[11.6, 0.22, 0.28]} position={[0, 4.8, 0.6]} map={tileTexture([3, 1])} color="#b8cbc3" />
      <Box size={[0.22, 0.22, 12]} position={[-5.3, 4.8, 0.6]} color="#b8cbc3" />

      <DoorPortal frame={frame} open={doorOpen} />
      <Sink frame={frame} />
      <Toilet />
      <Shower />
      <group position={[4.55, 1.55, -0.3]}>
        <Box size={[0.1, 1.4, 0.9]} position={[0, 0, 0]} color="#8e9d96" />
        <Box size={[0.08, 1.3, 0.7]} position={[-0.04, 0, 0]} color="#dce7df" />
        <UnlitPlane width={0.6} height={1.1} position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="#f4f2e7" opacity={0.5} />
      </group>

      {mode === 'carry' || mode === 'return' ? (
        <Bags position={mode === 'carry' ? [0.8, 0, -2.2] : [2.1, 0, -2.4]} frame={frame} />
      ) : null}

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        walking={walking}
        walkSpeed={5.4}
        jump={jump}
        lean={lean}
        shadowRadius={0.48}
        shadowOpacity={0.26}
      />

      <DustMotes frame={frame} count={30} area={[7, 3.5, 5]} origin={[0, 2.8, -1.2]} opacity={0.2} color="#d8fbff" />
      <Sparkles frame={frame} position={[0, 0.3, -2.0]} count={18} radius={1.6} size={0.045} opacity={0.18} color="#ffe5ad" />
      <GlowSprite position={[1.0, 2.0, -4.0]} scale={3.2} map={glowTexture()} color="#9feaff" opacity={0.1 + doorOpen * 0.14} />
    </>
  );
};
