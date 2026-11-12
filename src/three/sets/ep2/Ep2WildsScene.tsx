import React from 'react';
import * as THREE from 'three';
import {SPRITES} from '../../../data/theme';
import {CameraRig, sampleCamera, type CameraKey} from '../../lib/camera';
import {
  Box,
  Cone,
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
  crackTexture,
  glowTexture,
  grassTexture,
  hologramTexture,
  shadowWatcherTexture,
  skyTexture,
  stoneTexture,
  warmGlowTexture,
} from '../../lib/textures';
import {
  Cabin,
  Clouds,
  Fence,
  GrassTuft,
  Mountains,
  Path,
  River,
  Rock,
  Signpost,
  Sun,
  Tree,
  VillageMarker,
} from '../../props/BuildingKit';

export type Ep2WildsMode = 'meadow' | 'forest';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const seg = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const meadowKeys: CameraKey[] = [
  {f: 0, position: [8.4, 3.2, 10.2], target: [1.8, 1.5, -3.2], fov: 40},
  {f: 170, position: [5.8, 2.4, 7.2], target: [2.0, 1.8, -3.3], fov: 34},
  {f: 380, position: [2.0, 4.7, 8.4], target: [2.0, 1.8, -4.0], fov: 32},
  {f: 560, position: [7.5, 3.1, 6.6], target: [2.5, 1.7, -3.5], fov: 30},
  {f: 740, position: [4.6, 2.2, 6.1], target: [2.4, 1.6, -5.0], fov: 28},
  {f: 899, position: [8.8, 3.8, 7.4], target: [1.4, 2.0, -3.0], fov: 36},
];

const forestKeys: CameraKey[] = [
  {f: 0, position: [6.5, 2.5, 8.2], target: [0.0, 1.6, -4.0], fov: 36},
  {f: 80, position: [4.4, 1.9, 6.2], target: [0.2, 1.7, -4.5], fov: 30},
  {f: 160, position: [3.2, 1.5, 5.4], target: [0.4, 2.0, -5.4], fov: 26},
  {f: 260, position: [3.9, 2.2, 6.2], target: [-1.0, 2.0, -6.4], fov: 28},
  {f: 400, position: [3.3, 2.0, 5.0], target: [1.2, 1.8, -4.0], fov: 34},
  {f: 520, position: [5.6, 3.0, 7.1], target: [0.0, 2.0, -7.0], fov: 32},
  {f: 599, position: [2.5, 1.2, 4.2], target: [3.5, 2.6, -8.7], fov: 18},
];

const meadowTrees = [
  {pos: [-8.5, 0, -9.5] as Vec3, scale: 0.85, kind: 'pine' as const, hue: 'dark' as const},
  {pos: [9.0, 0, -11.0] as Vec3, scale: 1.0, kind: 'broad' as const, hue: 'olive' as const},
  {pos: [-12.0, 0, -3.8] as Vec3, scale: 0.7, kind: 'broad' as const, hue: 'green' as const},
  {pos: [12.2, 0, -4.0] as Vec3, scale: 0.75, kind: 'pine' as const, hue: 'dark' as const},
  {pos: [-5.2, 0, -13.0] as Vec3, scale: 0.65, kind: 'pine' as const, hue: 'dark' as const},
];

const forestTrees = [
  {pos: [-7.6, 0, -5.0] as Vec3, scale: 1.6, kind: 'pine' as const},
  {pos: [-4.8, 0, -8.0] as Vec3, scale: 1.9, kind: 'pine' as const},
  {pos: [-2.0, 0, -6.2] as Vec3, scale: 1.4, kind: 'broad' as const},
  {pos: [1.4, 0, -9.6] as Vec3, scale: 1.8, kind: 'pine' as const},
  {pos: [4.4, 0, -6.4] as Vec3, scale: 1.5, kind: 'broad' as const},
  {pos: [6.6, 0, -10.5] as Vec3, scale: 2.0, kind: 'pine' as const},
  {pos: [-0.8, 0, -13.5] as Vec3, scale: 2.2, kind: 'pine' as const},
  {pos: [8.8, 0, -4.8] as Vec3, scale: 1.3, kind: 'broad' as const},
  {pos: [-10.5, 0, -11.5] as Vec3, scale: 1.7, kind: 'pine' as const},
  {pos: [3.8, 0, -14.5] as Vec3, scale: 2.1, kind: 'pine' as const},
];

const Flowers: React.FC<{frame: number}> = ({frame}) => (
  <group>
    {Array.from({length: 34}, (_, index) => {
      const x = -10 + ((index * 7.3) % 20);
      const z = -9 + ((index * 5.7) % 16);
      const sway = Math.sin(frame / 34 + index) * 0.025;
      return (
        <group key={`flower-${index}`} position={[x + sway, 0, z]} rotation={[0, index, 0]}>
          <Cylinder radiusTop={0.018} radiusBottom={0.022} height={0.3} segments={4} position={[0, 0.15, 0]} color="#668b42" castShadow={false} />
          <Ico radius={0.075} detail={0} position={[0, 0.33, 0]} color={['#f7e6a1', '#e8a7b3', '#f3f0dc', '#c1a6ef'][index % 4]} castShadow={false} />
        </group>
      );
    })}
  </group>
);

const WindStreaks: React.FC<{frame: number}> = ({frame}) => (
  <group>
    {[0, 1, 2, 3, 4, 5].map((index) => {
      const x = -12 + ((frame * 0.08 + index * 4.4) % 24);
      return (
        <Box
          key={`wind-${index}`}
          size={[2.2 + (index % 3) * 0.8, 0.015, 0.02]}
          position={[x, 0.55 + (index % 4) * 0.35, -2.5 - index * 0.9]}
          rotation={[0, 0.2, 0.04]}
          color="#fff2cd"
          opacity={0.12}
          transparent
          castShadow={false}
        />
      );
    })}
  </group>
);

const ShovelProp: React.FC = () => (
  <group position={[3.65, 0, -1.9]} rotation={[0, 0.5, -0.12]}>
    <Cylinder radiusTop={0.045} radiusBottom={0.05} height={2.2} segments={7} position={[0, 1.1, 0]} color="#a8784d" />
    <Box size={[0.38, 0.1, 0.07]} position={[0, 2.2, 0]} color="#6d4a2e" />
    <Box size={[0.5, 0.65, 0.06]} position={[0, 0.12, 0]} color="#b9c1bc" />
    <Box size={[0.55, 0.1, 0.06]} position={[0, 0.42, 0]} color="#8d9995" />
    <GlowSprite position={[0, 1.2, 0]} scale={0.8} map={warmGlowTexture()} color="#ffe1a4" opacity={0.12} />
  </group>
);

const SupplyCrates: React.FC = () => (
  <group position={[4.4, 0, -2.6]}>
    <Box size={[1.1, 0.72, 0.8]} position={[0, 0.36, 0]} color="#a97b4d" />
    <Box size={[1.02, 0.08, 0.72]} position={[0, 0.7, 0]} color="#c39761" />
    <Box size={[0.07, 0.68, 0.82]} position={[0, 0.38, 0]} color="#795431" />
    <Box size={[0.85, 0.5, 0.68]} position={[0.1, 0.94, 0.03]} color="#8e6a45" rotation={[0, 0.2, 0]} />
    <Cylinder radiusTop={0.18} radiusBottom={0.2} height={0.9} segments={8} position={[-1.0, 0.45, 0.15]} color="#b7a06d" />
    <Box size={[0.04, 0.82, 0.04]} position={[-1.0, 0.5, 0.15]} color="#e0b25a" />
  </group>
);

const MeadowQuest: React.FC<{frame: number}> = ({frame}) => {
  const appear = clamp01(seg(frame, 150, 210));
  return (
    <group position={[3.25, 2.55, -4.25]} rotation={[0, -0.12, 0]} visible={appear > 0.01}>
      <UnlitPlane
        width={2.1}
        height={2.55}
        map={hologramTexture('NEW QUEST', 'THE FIRST CLEARING', ['CLEAR THE FOREST EDGE', 'PLACE THE VILLAGE FLAG', 'RETURN BEFORE NIGHTFALL'], '#b28cff')}
        opacity={appear}
        depthWrite={false}
      />
      <GlowSprite position={[0, 0, -0.08]} scale={2.8} map={glowTexture()} color="#b28cff" opacity={0.24 * appear} />
      <pointLight position={[0, 0, -0.5]} color="#b28cff" intensity={1.6 * appear} distance={5} decay={2} />
    </group>
  );
};

const LightShaft: React.FC<{position: Vec3; color?: string; size?: number; opacity?: number}> = ({
  position,
  color = '#ffe6ad',
  size = 1.5,
  opacity = 0.1,
}) => (
  <mesh position={position}>
    <coneGeometry args={[size, 12, 16, 1, true]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
  </mesh>
);

const ForestFog: React.FC<{frame: number}> = ({frame}) => (
  <group>
    {[0, 1, 2, 3].map((index) => (
      <UnlitPlane
        key={`fog-${index}`}
        width={22 - index * 2}
        height={5.5}
        position={[-1 + Math.sin(frame / 140 + index) * 0.8, 0.55 + index * 0.42, -5.5 - index * 2.0]}
        map={glowTexture()}
        color={index % 2 === 0 ? '#8faacc' : '#6d7fa8'}
        opacity={0.11 - index * 0.015}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fog={false}
      />
    ))}
  </group>
);

const ForestCrack: React.FC<{frame: number}> = ({frame}) => {
  const open = clamp01(seg(frame, 105, 190));
  const pulse = 0.72 + Math.sin(frame / 8) * 0.18;
  return (
    <group position={[2.35, 0, -7.7]}>
      <UnlitPlane
        width={4.8}
        height={4.8}
        position={[0, 0.045, 0]}
        rotation={[-Math.PI / 2, 0, 0.2]}
        map={crackTexture()}
        opacity={0.18 + open * 0.82}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
      <UnlitPlane
        width={5.6}
        height={5.6}
        position={[0, 0.055, 0]}
        rotation={[-Math.PI / 2, 0, 0.2]}
        map={crackTexture()}
        opacity={open * 0.18 * pulse}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      <Sparkles frame={frame} position={[0, 0.15, 0]} count={30} radius={1.8} size={0.07} opacity={open * 0.5} color="#c7a7ff" />
      <GlowSprite position={[0, 0.22, 0]} scale={4.2} map={glowTexture()} color="#9c6aff" opacity={0.08 + open * 0.34} />
      <pointLight position={[0, 0.8, 0]} color="#9e6aff" intensity={0.4 + open * 7.5 * pulse} distance={12} decay={2} />
      {open > 0.15
        ? [0, 1, 2, 3, 4].map((index) => (
            <Ico
              key={`debris-${index}`}
              radius={0.12 + index * 0.025}
              detail={0}
              position={[
                Math.sin(index * 2.1) * (0.7 + index * 0.22),
                0.08 + open * (0.2 + (index % 3) * 0.12),
                Math.cos(index * 1.7) * (0.55 + index * 0.2),
              ]}
              color={index % 2 === 0 ? '#393046' : '#5d4a6e'}
              castShadow={false}
            />
          ))
        : null}
    </group>
  );
};

export const Ep2WildsScene: React.FC<{frame: number; mode: Ep2WildsMode}> = ({frame, mode}) => {
  const keys = mode === 'meadow' ? meadowKeys : forestKeys;
  const pose = sampleCamera(keys, frame);
  const forestGlow = mode === 'forest' ? clamp01(seg(frame, 120, 220)) : 0;

  let sprite: string = mode === 'meadow' ? SPRITES.shovel : SPRITES.shovel;
  let characterX = mode === 'meadow' ? 1.7 : 0.55;
  let characterZ = mode === 'meadow' ? -1.55 : -1.9;
  let walking = false;
  let jump = 0;
  let lean = 0;

  if (mode === 'meadow') {
    if (frame < 180) {
      sprite = SPRITES.shovel;
      characterX = 1.7 + Math.sin(frame / 120) * 0.05;
    } else if (frame < 430) {
      sprite = frame < 290 ? SPRITES.cheer : SPRITES.point;
      characterX = 1.7;
      jump = frame >= 200 && frame < 245 ? Math.sin(((frame - 200) / 45) * Math.PI) * 0.09 : 0;
    } else if (frame < 650) {
      sprite = SPRITES.point;
      characterX = 1.7 + seg(frame, 430, 650) * 0.55;
      characterZ = -1.55 - seg(frame, 430, 650) * 0.4;
      lean = 0.012;
    } else {
      const walk = seg(frame, 650, 860);
      sprite = [SPRITES.backWalk1, SPRITES.backWalk2, SPRITES.backWalk3, SPRITES.backWalk4][Math.floor(frame / 7) % 4];
      characterX = 2.25 + walk * 0.45;
      characterZ = -1.95 - walk * 3.1;
      walking = frame < 875;
      lean = 0.03;
    }
  } else {
    if (frame < 70) {
      const walk = seg(frame, 0, 65);
      sprite = [SPRITES.backWalk1, SPRITES.backWalk2, SPRITES.backWalk3, SPRITES.backWalk4][Math.floor(frame / 7) % 4];
      characterX = 2.2 - walk * 1.2;
      characterZ = -4.2 + walk * 1.9;
      walking = true;
      lean = 0.025;
    } else if (frame < 150) {
      sprite = SPRITES.shovel;
      characterX = 1.0;
      characterZ = -2.3;
      lean = 0.01;
    } else if (frame < 280) {
      const back = seg(frame, 150, 260);
      sprite = back < 0.35 ? SPRITES.surprised : [SPRITES.walk1, SPRITES.walk2, SPRITES.walk3, SPRITES.walk4][Math.floor(frame / 6) % 4];
      characterX = 1.0 - back * 1.35;
      characterZ = -2.3 + back * 1.25;
      walking = back > 0.2;
      lean = -0.015;
    } else if (frame < 430) {
      sprite = SPRITES.surprised;
      characterX = -0.35 + Math.sin(frame / 70) * 0.05;
      characterZ = -1.05;
      jump = frame >= 280 && frame < 335 ? Math.sin(((frame - 280) / 55) * Math.PI) * 0.08 : 0;
      lean = -0.02;
    } else if (frame < 530) {
      sprite = SPRITES.shout;
      characterX = -0.4;
      characterZ = -1.1;
      lean = -0.01;
    } else {
      sprite = SPRITES.surprised;
      characterX = -0.45;
      characterZ = -1.1;
      lean = 0.006;
    }
  }

  return (
    <>
      <CameraRig
        frame={frame}
        pose={pose}
        handheld={mode === 'forest' ? 0.018 : 0.007}
        shake={mode === 'forest' && frame > 260 ? 0.03 : 0}
        roll={mode === 'forest' && frame > 300 ? Math.sin(frame / 6) * 0.004 : 0}
      />
      <fog attach="fog" args={mode === 'meadow' ? ['#f2d4a8', 38, 100] : ['#0c1420', 16, 46]} />

      {mode === 'meadow' ? (
        <>
          <ambientLight intensity={0.54} color="#ffe9c8" />
          <hemisphereLight args={['#cce9f2', '#7d704a', 0.85]} />
          <directionalLight
            position={[14, 19, 12]}
            intensity={3.5}
            color="#ffdca4"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-22}
            shadow-camera-right={22}
            shadow-camera-top={22}
            shadow-camera-bottom={-22}
            shadow-camera-near={1}
            shadow-camera-far={70}
            shadow-bias={-0.0004}
          />
          <directionalLight position={[-12, 8, -8]} intensity={1.1} color="#7fd3d8" castShadow={false} />
          <pointLight position={[-2.5, 5.5, -4]} color="#ffd39b" intensity={2.8} distance={18} decay={2} />
        </>
      ) : (
        <>
          <ambientLight intensity={0.21} color="#8ea9d4" />
          <hemisphereLight args={['#8cadd8', '#151a20', 0.4]} />
          <directionalLight
            position={[-7, 12, 8]}
            intensity={1.55}
            color="#9cc6ff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-16}
            shadow-camera-right={16}
            shadow-camera-top={16}
            shadow-camera-bottom={-16}
            shadow-camera-near={1}
            shadow-camera-far={42}
            shadow-bias={-0.0005}
          />
          <pointLight position={[-1.1, 1.8, 0.6]} color="#9db8ff" intensity={1.15} distance={6} decay={2} />
          <pointLight position={[2.3, 1.3, -7.7]} color="#a071ff" intensity={forestGlow * 7} distance={14} decay={2} />
          <pointLight position={[3.5, 2.8, -9.4]} color="#8fd7ff" intensity={forestGlow * 2.2} distance={9} decay={2} />
        </>
      )}

      {mode === 'meadow' ? (
        <>
          <UnlitPlane width={160} height={78} position={[0, 24, -70]} map={skyTexture()} opacity={1} fog={false} />
          <Plane width={90} height={74} position={[0, -0.02, -7]} map={grassTexture([20, 18])} color="#d8e6b8" />
          <Mountains z={-46} />
          <Sun position={[17, 22, -46]} />
          <Clouds frame={frame} />
          <LightShaft position={[-4, 8, -10]} size={2.8} opacity={0.06} />
          <LightShaft position={[3, 7, -12]} size={2.2} opacity={0.045} />

          <Cabin position={[-3.0, 0, -5.4]} progress={1} frame={frame} accent="#3f7f78" />
          <Path position={[1.7, 0, -0.3]} length={13.0} width={2.2} rotation={0.35} />
          <Fence position={[5.8, 0, 3.0]} length={7.5} />
          <Fence position={[9.1, 0, 0.4]} rotation={[0, Math.PI / 2, 0]} length={5.0} />
          <Signpost position={[4.7, 0, 1.7]} text="DESA NAJMI" />
          <VillageMarker position={[3.4, 0, -2.0]} active frame={frame} />
          <SupplyCrates />
          <ShovelProp />
          <River frame={frame} position={[-12.5, 0.02, -15]} rotation={0.24} />
          <Flowers frame={frame} />
          <WindStreaks frame={frame} />

          {meadowTrees.map((tree, index) => (
            <Tree key={`meadow-tree-${index}`} position={tree.pos} scale={tree.scale} kind={tree.kind} hue={tree.hue} castShadow={index < 3} />
          ))}
          <Rock position={[-7.0, 0, 1.2]} scale={0.8} />
          <Rock position={[8.6, 0, -2.0]} scale={0.55} color="#8b947e" />
          {[[-6.2, 0, 2.7], [-4.4, 0, 4.0], [8.4, 0, 4.2], [11.2, 0, 1.2], [1.2, 0, 4.8]].map((position, index) => (
            <GrassTuft key={`meadow-tuft-${index}`} position={position as Vec3} scale={0.9 + (index % 3) * 0.2} />
          ))}
          <MeadowQuest frame={frame} />
          <Sparkles frame={frame} position={[3.4, 0.4, -2.0]} count={30} radius={2.2} size={0.055} opacity={0.45} color="#c7a7ff" />
          <DustMotes frame={frame} count={26} area={[20, 3.4, 14]} origin={[0, 2.4, 0]} opacity={0.2} color="#ffe8b6" />
        </>
      ) : (
        <>
          <UnlitPlane width={80} height={54} position={[0, 18, -45]} color="#111b2a" opacity={1} fog={false} />
          <Plane width={52} height={52} position={[0, -0.02, -5]} map={grassTexture([14, 14])} color="#556c55" />
          <Path position={[0, 0, -4]} length={20} width={2.6} rotation={0.1} />
          <ForestFog frame={frame} />
          <ForestCrack frame={frame} />
          {forestTrees.map((tree, index) => (
            <Tree key={`forest-tree-${index}`} position={tree.pos} scale={tree.scale} kind={tree.kind} hue="dark" castShadow={index < 4} />
          ))}
          <Rock position={[-3.0, 0, -5.0]} scale={1.1} color="#4e5a54" />
          <Rock position={[4.8, 0, -4.0]} scale={0.9} color="#48534e" />
          <Rock position={[1.4, 0, -3.0]} scale={0.5} color="#59655d" />
          <DustMotes frame={frame} count={34} area={[14, 4, 10]} origin={[0, 2.6, -2]} opacity={0.3} color="#a9caff" />
          <Sparkles frame={frame} position={[2.3, 0.3, -7.7]} count={40} radius={2.4} size={0.06} opacity={forestGlow * 0.55} color="#c7a7ff" />

          <group visible={frame > 300}>
            <UnlitPlane
              width={3.9}
              height={4.7}
              position={[3.3, 2.35, -9.55]}
              map={shadowWatcherTexture()}
              opacity={clamp01(seg(frame, 300, 520)) * (0.78 + Math.sin(frame / 13) * 0.04)}
              blending={THREE.NormalBlending}
              depthWrite={false}
              fog={false}
            />
            <GlowSprite position={[3.3, 2.4, -9.8]} scale={4.6} map={glowTexture()} color="#8f63ff" opacity={0.12 + forestGlow * 0.2} />
          </group>

          <GlowSprite position={[2.3, 0.4, -7.6]} scale={5.5} map={glowTexture()} color="#a071ff" opacity={0.08 + forestGlow * 0.2} />
          <PixelSprite src={SPRITES.bird} position={[-2.4, 5.2, -8.0]} height={0.2} flip={frame % 240 < 120} opacity={0.5} />
        </>
      )}

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        walking={walking}
        walkSpeed={5.2}
        phase={1.8}
        jump={jump}
        lean={lean}
        shadowRadius={0.48}
        shadowOpacity={mode === 'meadow' ? 0.28 : 0.18}
      />
    </>
  );
};
