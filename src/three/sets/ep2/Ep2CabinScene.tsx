import React from 'react';
import * as THREE from 'three';
import {COLORS, SPRITES} from '../../../data/theme';
import {CameraRig, sampleCamera, type CameraKey} from '../../lib/camera';
import {
  Box,
  Cylinder,
  GlowSprite,
  Ico,
  Plane,
  UnlitPlane,
} from '../../lib/primitives';
import {DustMotes, Embers} from '../../lib/particles';
import {CharacterActor} from '../../lib/PixelSprite';
import {
  glowTexture,
  hologramTexture,
  roofTexture,
  skyTexture,
  stoneTexture,
  warmGlowTexture,
  windowGlowTexture,
  woodTexture,
} from '../../lib/textures';
import {Mountains, Sun, Tree} from '../../props/BuildingKit';

export type Ep2CabinMode = 'plan' | 'system' | 'supplies';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const seg = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const planKeys: CameraKey[] = [
  {f: 0, position: [8.6, 6.8, 7.4], target: [0.2, 1.8, -1.7], fov: 38},
  {f: 150, position: [7.0, 5.6, 6.2], target: [0.2, 1.9, -1.9], fov: 35},
  {f: 330, position: [4.9, 4.1, 5.0], target: [0.7, 2.25, -1.2], fov: 30},
  {f: 520, position: [3.4, 3.7, 4.4], target: [-0.3, 2.2, -2.1], fov: 31},
  {f: 690, position: [5.4, 3.1, 5.2], target: [0.9, 2.0, -1.4], fov: 29},
  {f: 830, position: [4.0, 4.2, 4.8], target: [2.8, 1.9, -3.5], fov: 24},
  {f: 899, position: [3.3, 4.0, 4.5], target: [2.8, 1.9, -3.7], fov: 22},
];

const systemKeys: CameraKey[] = [
  {f: 0, position: [6.8, 5.8, 6.4], target: [-0.4, 1.9, -2.1], fov: 36},
  {f: 170, position: [4.6, 4.7, 5.4], target: [-0.2, 2.0, -2.4], fov: 32},
  {f: 370, position: [3.0, 5.1, 4.1], target: [0.4, 2.25, -2.9], fov: 30},
  {f: 580, position: [5.2, 4.1, 5.3], target: [0.8, 1.9, -2.4], fov: 33},
  {f: 720, position: [3.5, 3.4, 4.7], target: [2.8, 2.0, -3.3], fov: 27},
  {f: 809, position: [3.9, 3.6, 5.0], target: [2.6, 1.9, -3.1], fov: 26},
];

const suppliesKeys: CameraKey[] = [
  {f: 0, position: [7.6, 4.8, 7.0], target: [1.6, 1.15, -2.1], fov: 37},
  {f: 160, position: [5.4, 3.8, 5.8], target: [1.1, 1.1, -1.9], fov: 33},
  {f: 330, position: [4.0, 3.1, 4.4], target: [0.4, 1.0, -1.3], fov: 30},
  {f: 520, position: [5.8, 3.7, 5.5], target: [0.0, 1.25, -1.0], fov: 33},
  {f: 680, position: [4.5, 2.9, 4.6], target: [0.8, 1.45, -1.4], fov: 28},
  {f: 749, position: [3.9, 2.7, 4.1], target: [0.6, 1.5, -1.2], fov: 25},
  {f: 839, position: [4.2, 3.0, 4.5], target: [0.8, 1.5, -1.4], fov: 27},
];

const WindowView: React.FC<{frame: number}> = ({frame}) => (
  <group position={[0, 0, -4.12]}>
    <UnlitPlane width={30} height={13} position={[-1.8, 6.3, -25]} map={skyTexture()} opacity={0.98} />
    <Plane width={34} height={28} position={[-1.8, -0.35, -9]} color={COLORS.meadow} />
    <Mountains z={-20} />
    <Sun position={[8.4, 9.2, -16]} />
    <Tree position={[-7.2, 0, -8.5]} scale={0.7} kind="pine" castShadow={false} hue="dark" />
    <Tree position={[5.4, 0, -8.0]} scale={0.8} kind="broad" castShadow={false} hue="olive" />
    <Tree position={[-9.5, 0, -12]} scale={0.6} kind="broad" castShadow={false} />
    <DustMotes frame={frame} count={18} area={[10, 2, 6]} origin={[-1.5, 3.6, -2]} opacity={0.16} color="#ffe3ad" />
  </group>
);

const Fireplace: React.FC<{frame: number}> = ({frame}) => (
  <group position={[-4.75, 0, 0.1]}>
    <Box size={[0.7, 3.1, 2.6]} position={[0, 1.55, 0]} map={stoneTexture([1, 2])} color="#aaa69a" />
    <Box size={[0.96, 0.24, 3.0]} position={[0.1, 3.06, 0]} map={stoneTexture([1, 2])} color="#c7c2b2" />
    <Box size={[0.08, 1.65, 1.55]} position={[0.39, 1.0, 0]} color="#211b17" />
    <Box size={[0.1, 0.12, 1.65]} position={[0.45, 1.75, 0]} color="#5e4c3b" />
    <Cylinder radiusTop={0.1} radiusBottom={0.13} height={1.1} segments={7} position={[0.48, 0.62, -0.42]} rotation={[0, 0, 0.3]} color="#4c3222" />
    <Cylinder radiusTop={0.1} radiusBottom={0.13} height={1.1} segments={7} position={[0.48, 0.62, 0.38]} rotation={[0, 0, -0.25]} color="#5a3b28" />
    <Embers frame={frame} position={[0.55, 0.3, 0]} count={34} />
    <GlowSprite position={[0.78, 0.8, 0]} scale={2.2} map={warmGlowTexture()} color="#ff8a32" opacity={0.46} />
    <pointLight position={[1.0, 1.2, 0]} color="#ff8a36" intensity={7} distance={9} decay={2} />
    <Box size={[0.3, 0.18, 3.3]} position={[0.46, 0.09, 0]} color="#5b5449" />
  </group>
);

const Table: React.FC = () => (
  <group position={[-0.7, 0, 0.25]}>
    <Box size={[2.7, 0.16, 1.55]} position={[0, 1.12, 0]} map={woodTexture([2, 1])} color="#c89864" />
    {[-1.1, 1.1].map((x) => (
      <React.Fragment key={`table-leg-${x}`}>
        <Box size={[0.14, 1.05, 0.14]} position={[x, 0.53, -0.55]} color="#6e492c" />
        <Box size={[0.14, 1.05, 0.14]} position={[x, 0.53, 0.55]} color="#6e492c" />
      </React.Fragment>
    ))}
    <Cylinder radiusTop={0.28} radiusBottom={0.2} height={0.13} segments={12} position={[0.45, 1.27, 0.1]} color="#d6c59f" />
    <Ico radius={0.15} detail={0} position={[0.24, 1.32, 0.1]} color="#b85d4e" castShadow={false} />
    <Cylinder radiusTop={0.07} radiusBottom={0.1} height={0.26} segments={8} position={[-0.8, 1.33, -0.2]} color="#d9c6a0" />
    <mesh position={[-0.8, 1.5, -0.2]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#ffb35e" toneMapped={false} />
    </mesh>
    <GlowSprite position={[-0.8, 1.53, -0.2]} scale={0.7} map={warmGlowTexture()} color="#ffb35e" opacity={0.52} />
    <UnlitPlane width={1.45} height={0.95} position={[0.55, 1.23, -0.15]} rotation={[-Math.PI / 2, 0, 0.1]} color="#d8cba8" opacity={0.9} />
    <Box size={[0.9, 0.06, 0.06]} position={[0.55, 1.29, -0.15]} rotation={[0, 0, 0.1]} color="#4f6f83" />
  </group>
);

const BackWall: React.FC<{frame: number; doorOpen: number}> = ({frame, doorOpen}) => {
  const rim = 0.1 + doorOpen * 0.5 + Math.sin(frame / 8) * 0.03;
  return (
    <group>
      <Plane width={10.6} height={8.8} position={[0, 0, 0.3]} map={woodTexture([4, 3])} color="#c9a276" />
      <Box size={[2.25, 5.7, 0.3]} position={[-3.9, 2.85, -4.02]} map={woodTexture([1, 2])} color="#d7b083" />
      <Box size={[3.0, 5.7, 0.3]} position={[3.35, 2.85, -4.02]} map={woodTexture([1, 2])} color="#d7b083" />
      <Box size={[4.65, 1.85, 0.3]} position={[-0.5, 0.93, -4.02]} map={woodTexture([2, 1])} color="#c9a276" />
      <Box size={[4.65, 1.05, 0.3]} position={[-0.5, 5.15, -4.02]} map={woodTexture([2, 1])} color="#c9a276" />
      <Box size={[4.95, 0.18, 0.48]} position={[-0.5, 1.88, -3.9]} color="#6a472d" />
      <Box size={[0.16, 2.9, 0.18]} position={[-2.85, 3.3, -3.9]} color="#62412a" />
      <Box size={[0.16, 2.9, 0.18]} position={[1.85, 3.3, -3.9]} color="#62412a" />
      <Box size={[4.7, 0.16, 0.18]} position={[-0.5, 4.68, -3.9]} color="#62412a" />
      <Box size={[0.08, 2.7, 0.1]} position={[-0.5, 3.3, -3.86]} color="#62412a" />
      <Box size={[4.5, 0.08, 0.1]} position={[-0.5, 3.3, -3.86]} color="#62412a" />
      <UnlitPlane width={4.4} height={2.6} position={[-0.5, 3.3, -3.83]} map={windowGlowTexture()} opacity={0.2} />
      <Cylinder radiusTop={0.1} radiusBottom={0.12} height={5.55} segments={7} position={[-4.85, 2.8, -3.8]} color="#5a3d27" />
      <Cylinder radiusTop={0.1} radiusBottom={0.12} height={5.55} segments={7} position={[4.6, 2.8, -3.8]} color="#5a3d27" />
      <Box size={[10.2, 0.25, 0.32]} position={[0, 5.5, -3.82]} color="#57402b" />
      <Box size={[0.3, 5.6, 8.5]} position={[-5.15, 2.8, 0.4]} map={woodTexture([2, 2])} color="#c9a276" />
      <Box size={[10.5, 0.3, 0.3]} position={[0, 0.15, -3.7]} color="#66452c" />
      <Box size={[0.3, 0.3, 8.5]} position={[-5.0, 0.15, 0.4]} color="#66452c" />
      {[4.0, 2.35, 1.2].map((y) => (
        <Box key={`shelf-${y}`} size={[1.7, 0.1, 0.6]} position={[3.55, y, -3.72]} color="#795532" />
      ))}
      <group position={[3.35, 1.35, -3.84]}>
        <Box size={[1.2, 2.6, 0.12]} position={[0, 0, -0.02]} color="#5c3f2a" />
        <Box size={[1.02, 2.42, 0.08]} position={[0, 0, 0.05]} color="#80603f" />
        <mesh position={[0.38, -0.1, 0.12]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshLambertMaterial color="#d5b26b" />
        </mesh>
      </group>
      <group position={[3.35, 2.6, -3.78]} rotation={[0, 0, 0.04]}>
        <Box size={[1.15, 0.75, 0.08]} position={[0, 0, 0]} color="#5e4630" />
        <Box size={[1.0, 0.6, 0.06]} position={[0, 0, 0.05]} color="#b98d58" />
        <Box size={[0.6, 0.35, 0.05]} position={[0.1, 0, 0.09]} color="#6d8b79" />
      </group>
      <group position={[3.4, 3.9, -3.8]}>
        <Box size={[1.2, 0.8, 0.1]} position={[0, 0, 0]} color="#4e3b2a" />
        <UnlitPlane width={1.05} height={0.65} position={[0, 0, 0.06]} map={hologramTexture('FIELD NOTES', 'FIRST BUILD', ['CHOOSE A FLAT SITE', 'CLEAR THE GROUND', 'RAISE ONE WALL'], '#e0b25a')} opacity={0.92} />
      </group>
      <group position={[0.95, 1.62, -3.82]} rotation={[0, -doorOpen * 1.22, 0]}>
        <Box size={[1.42, 2.7, 0.14]} position={[0, 0, 0]} color="#5b3f29" />
        <Box size={[1.2, 2.48, 0.08]} position={[0, 0, 0.1]} color="#8b6440" />
        <Box size={[0.9, 0.06, 0.05]} position={[0, 0.72, 0.16]} color="#6a4a2e" />
        <Box size={[0.9, 0.06, 0.05]} position={[0, -0.72, 0.16]} color="#6a4a2e" />
        <mesh position={[0.48, -0.12, 0.2]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshLambertMaterial color="#d4b16a" />
        </mesh>
      </group>
      <Box size={[1.7, 2.9, 0.2]} position={[0.95, 1.62, -3.98]} color="#493224" />
      <mesh position={[0.95, 1.62, -3.85]}>
        <planeGeometry args={[1.48, 2.72]} />
        <meshBasicMaterial color="#9ff6ff" transparent opacity={0.07 + doorOpen * 0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0.95, 1.62, -3.84]}>
        <planeGeometry args={[1.48, 2.72]} />
        <meshBasicMaterial color="#7fe7ff" wireframe transparent opacity={rim * 0.7} depthWrite={false} />
      </mesh>
      <GlowSprite position={[0.95, 1.7, -3.2]} scale={2.2} map={glowTexture()} color="#8fefff" opacity={0.04 + doorOpen * 0.34} />
      <pointLight position={[0.95, 1.7, -3.15]} color="#7fe7ff" intensity={0.2 + doorOpen * 3.2} distance={7} decay={2} />
    </group>
  );
};

const SupplyPile: React.FC<{frame: number; amount: number}> = ({frame, amount}) => {
  const visible = (index: number) => amount >= index;
  return (
    <group position={[0.25, 0, -0.55]}>
      {visible(1) ? (
        <group position={[-0.9, 0, 0.25]} rotation={[0, 0.15, 0]}>
          <Box size={[1.2, 0.78, 0.88]} position={[0, 0.39, 0]} color="#a8794c" />
          <Box size={[1.16, 0.12, 0.84]} position={[0, 0.74, 0]} color="#c79a64" />
          <Box size={[0.1, 0.76, 0.9]} position={[0, 0.4, 0]} color="#835b36" />
          <Box size={[0.7, 0.04, 0.06]} position={[0, 0.76, 0]} color="#5a432c" />
        </group>
      ) : null}
      {visible(2) ? (
        <group position={[0.35, 0, 0.15]} rotation={[0, -0.2, 0]}>
          <Box size={[1.35, 0.65, 0.92]} position={[0, 0.33, 0]} color="#94683f" />
          <Box size={[1.26, 0.08, 0.84]} position={[0, 0.63, 0]} color="#bd8a58" />
          <Box size={[0.08, 0.64, 0.94]} position={[0, 0.35, 0]} color="#6f4d2e" />
        </group>
      ) : null}
      {visible(3) ? (
        <group position={[1.25, 0, -0.05]} rotation={[0, 0.25, 0]}>
          <Cylinder radiusTop={0.28} radiusBottom={0.3} height={1.25} segments={9} position={[0, 0.62, 0]} color="#b7a06d" />
          <Cylinder radiusTop={0.28} radiusBottom={0.3} height={0.06} segments={9} position={[0, 0.0, 0]} color="#51463a" />
          <Box size={[0.05, 1.2, 0.05]} position={[0.22, 0.62, 0]} color="#e0b25a" />
          <Box size={[0.05, 0.05, 0.2]} position={[0.22, 1.22, 0]} color="#e0b25a" />
        </group>
      ) : null}
      {visible(4) ? (
        <group position={[-0.2, 0, -0.9]} rotation={[0, -0.12, 0]}>
          <Box size={[1.0, 0.09, 1.7]} position={[0, 0.06, 0]} color="#566f5a" />
          <Box size={[0.9, 0.05, 1.55]} position={[0, 0.12, 0]} color="#76957b" />
          <Cylinder radiusTop={0.16} radiusBottom={0.16} height={0.8} segments={8} position={[0.65, 0.16, 0.55]} rotation={[Math.PI / 2, 0, 0]} color="#4d634f" />
        </group>
      ) : null}
      {visible(5) ? (
        <group position={[1.3, 0, 0.95]} rotation={[0, 0.4, 0]}>
          <Box size={[0.6, 0.1, 0.45]} position={[0, 0.08, 0]} color="#5a3f26" />
          <Box size={[0.5, 0.08, 0.35]} position={[0, 0.12, 0]} color="#c9a25e" />
          <Box size={[0.16, 0.05, 0.05]} position={[0, 0.16, 0]} color="#7fe7ff" />
        </group>
      ) : null}
      {visible(6) ? (
        <group position={[-1.35, 0, 0.9]} rotation={[0, 0.1, 0]}>
          <Box size={[0.7, 0.7, 0.55]} position={[0, 0.35, 0]} color="#c8c1a8" />
          <Box size={[0.62, 0.5, 0.48]} position={[0, 0.42, 0]} color="#e7e1c8" />
          <Box size={[0.2, 0.24, 0.04]} position={[0, 0.45, 0.25]} color="#c74e4e" />
        </group>
      ) : null}
      <GlowSprite position={[0, 0.12, 0]} scale={4.2} map={glowTexture()} color="#ffe3a8" opacity={0.06} />
      <DustMotes frame={frame} count={16} area={[5, 1.2, 4]} origin={[0, 0.5, 0]} opacity={0.16} color="#ffe0ac" />
    </group>
  );
};

export const Ep2CabinScene: React.FC<{frame: number; mode: Ep2CabinMode}> = ({frame, mode}) => {
  const keys = mode === 'plan' ? planKeys : mode === 'system' ? systemKeys : suppliesKeys;
  const pose = sampleCamera(keys, frame);
  const doorOpen = mode === 'supplies' ? clamp01(seg(frame, 30, 70) * 0.55 + (frame > 160 ? 0.35 : 0) + seg(frame, 690, 720) * 0.15) : mode === 'plan' ? seg(frame, 820, 880) * 0.45 : 0.04;
  const hologram =
    mode === 'plan'
      ? hologramTexture('MAIN QUEST', 'FOUND YOUR FIRST VILLAGE', ['BUILD YOUR FIRST BUILDING', 'PROGRESS: 0 / 1', 'REWARD: VILLAGE EXP'], '#7fe7ff')
      : hologramTexture('SYSTEM ADVISORY', 'PREPARATION CHECKLIST', ['01  CONSTRUCTION TOOLS', '02  FOOD SUPPLIES', '03  WATER SUPPLIES', '04  BUILDING MATERIALS', '05  PLANT SEEDS'], '#7fe7ff');

  let sprite: string = SPRITES.think;
  let characterX = 0.75;
  let characterZ = -1.0;
  let walking = false;
  let jump = 0;
  let lean = 0;

  if (mode === 'plan') {
    characterX = 0.8 + Math.sin(frame / 170) * 0.08;
    characterZ = -1.05;
    if (frame < 210) sprite = SPRITES.think;
    else if (frame < 360) sprite = SPRITES.sad;
    else if (frame < 500) sprite = SPRITES.think;
    else if (frame < 600) sprite = SPRITES.surprised;
    else if (frame < 760) sprite = SPRITES.think;
    else sprite = SPRITES.point;
    jump = frame >= 510 && frame < 565 ? Math.sin(((frame - 510) / 55) * Math.PI) * 0.1 : 0;
    lean = frame >= 760 ? Math.sin(frame / 80) * 0.012 : 0;
  } else if (mode === 'system') {
    characterX = -1.1 + Math.sin(frame / 150) * 0.08;
    characterZ = -1.0;
    if (frame < 120) sprite = SPRITES.idle;
    else if (frame < 250) sprite = SPRITES.point;
    else if (frame < 420) sprite = SPRITES.think;
    else if (frame < 560) sprite = SPRITES.point;
    else if (frame < 650) sprite = SPRITES.cheer;
    else sprite = SPRITES.point;
    jump = frame >= 600 && frame < 650 ? Math.sin(((frame - 600) / 50) * Math.PI) * 0.08 : 0;
    lean = Math.sin(frame / 90) * 0.008;
  } else {
    const cycle = frame % 240;
    const returning = cycle >= 150;
    const doorX = 2.65;
    const centerX = 0.1;
    const t = clamp01((cycle - (returning ? 150 : 0)) / (returning ? 90 : 130));
    characterX = returning ? centerX + (doorX - centerX) * smooth(t) : doorX + (centerX - doorX) * smooth(t);
    characterZ = returning ? -1.3 + (-3.0 + 1.3) * smooth(t) : -3.0 + 1.7 * smooth(t);
    walking = cycle < 150 || (cycle >= 150 && cycle < 235);
    sprite = returning ? [SPRITES.backWalk1, SPRITES.backWalk2, SPRITES.backWalk3, SPRITES.backWalk4][Math.floor(frame / 6) % 4] : SPRITES.carry;
    if (!walking) sprite = SPRITES.point;
    if (frame > 690) {
      characterX = 0.2;
      characterZ = -1.4;
      sprite = SPRITES.cheer;
      jump = frame >= 700 && frame < 750 ? Math.sin(((frame - 700) / 50) * Math.PI) * 0.07 : 0;
    }
    lean = walking ? 0.02 : Math.sin(frame / 80) * 0.01;
  }

  const supplies = mode === 'supplies' ? Math.min(6, 1 + Math.floor(frame / 110)) : 0;

  return (
    <>
      <CameraRig
        frame={frame}
        pose={pose}
        shake={mode === 'plan' && frame > 820 ? 0.02 : 0}
        handheld={mode === 'supplies' ? 0.012 : 0.006}
        roll={mode === 'plan' && frame > 820 ? -0.01 : 0}
      />
      <fog attach="fog" args={['#1b1712', 16, 44]} />

      <ambientLight intensity={0.2} color="#9db2cf" />
      <hemisphereLight args={['#8fb2d4', '#2b1a12', 0.4]} />
      <directionalLight
        position={[-3, 8.5, 1.5]}
        intensity={3.6}
        color="#ffd49a"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[6, 5, -7]} intensity={1.5} color="#7fd8ff" castShadow={false} />
      <pointLight position={[-1.8, 3.4, -4.6]} color="#ffcf8a" intensity={5.2} distance={9} decay={2} />
      <pointLight position={[0.9, 2.8, -2.2]} color="#8feaff" intensity={mode === 'plan' || mode === 'system' ? 3.2 : 1.2} distance={7} decay={2} />

      <BackWall frame={frame} doorOpen={doorOpen} />
      <WindowView frame={frame} />
      <Fireplace frame={frame} />
      <Table />
      <Box size={[5.0, 0.25, 0.45]} position={[-0.5, 1.88, -3.64]} color="#7e5737" />
      <Box size={[0.3, 0.9, 0.35]} position={[-2.4, 0.45, -3.64]} color="#6e4a2e" />
      <Box size={[0.3, 0.9, 0.35]} position={[1.4, 0.45, -3.64]} color="#6e4a2e" />
      <group position={[-4.2, 2.0, -2.9]} rotation={[0, Math.PI / 2, 0]}>
        <Box size={[1.6, 2.0, 0.08]} position={[0, 0, 0]} color="#59402c" />
        <Box size={[1.4, 1.8, 0.06]} position={[0, 0, 0.06]} color="#9d764b" />
      </group>

      <UnlitPlane
        width={3.15}
        height={2.95}
        position={[-1.25, 2.5, -2.55]}
        rotation={[0.06, 0.2, -0.03]}
        map={hologram}
        opacity={mode === 'supplies' ? 0 : 0.96}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
      <GlowSprite position={[-1.25, 2.5, -2.6]} scale={3.6} map={glowTexture()} color="#7fe7ff" opacity={mode === 'supplies' ? 0 : 0.24} />

      {mode === 'supplies' ? <SupplyPile frame={frame} amount={supplies} /> : null}

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        walking={walking}
        walkSpeed={5.5}
        phase={1.2}
        jump={jump}
        lean={lean}
        shadowRadius={0.46}
        shadowOpacity={0.28}
      />

      <UnlitPlane
        width={4.5}
        height={6.5}
        position={[-1.0, 3.0, -1.6]}
        rotation={[0.85, 0.08, 0]}
        map={warmGlowTexture()}
        color="#ffe3ad"
        opacity={0.14}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      <DustMotes frame={frame} count={54} area={[8.5, 5, 7]} origin={[0, 2.8, 0.1]} opacity={0.4} color="#ffe2ac" />
      <GlowSprite position={[-0.5, 3.4, -3.7]} scale={6} map={glowTexture()} color="#ffd493" opacity={0.1} />
    </>
  );
};
