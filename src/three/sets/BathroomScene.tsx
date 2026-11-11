import React from 'react';
import * as THREE from 'three';
import {COLORS, SPRITES} from '../../data/theme';
import {CameraRig, sampleCamera, type CameraKey} from '../lib/camera';
import {
  BlobShadow,
  Box,
  Cylinder,
  GlowSprite,
  Ico,
  Plane,
  UnlitPlane,
  type Vec3,
} from '../lib/primitives';
import {DustMotes, Sparkles} from '../lib/particles';
import {PixelSprite} from '../lib/PixelSprite';
import {glowTexture, skyTexture, tileTexture, warmGlowTexture} from '../lib/textures';
import {Cabin, Tree} from '../props/BuildingKit';

const cameraKeys: CameraKey[] = [
  {f: 0, position: [7.2, 11.2, 9.2], target: [0.2, 1.4, -1.5], fov: 40},
  {f: 260, position: [6.4, 9.4, 7.8], target: [0.4, 1.5, -2.4], fov: 36},
  {f: 360, position: [4.4, 7.4, 5.6], target: [0.0, 1.7, -4.1], fov: 32},
  {f: 520, position: [5.6, 8.8, 7.0], target: [0.0, 1.6, -3.8], fov: 34},
  {f: 720, position: [4.1, 7.3, 5.4], target: [-0.1, 1.7, -4.5], fov: 31},
  {f: 900, position: [5.4, 8.6, 6.9], target: [-0.2, 1.5, -3.4], fov: 34},
  {f: 1050, position: [6.2, 9.8, 7.8], target: [0.1, 1.4, -2.8], fov: 36},
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const seg = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const Mirror: React.FC = () => (
  <group position={[3.0, 2.9, -3.84]}>
    <Box size={[1.7, 1.9, 0.1]} position={[0, 0, 0]} color="#5c6a66" />
    <UnlitPlane width={1.48} height={1.68} position={[0, 0, 0.07]} color="#b9d8d7" opacity={0.9} />
    <UnlitPlane width={0.13} height={1.35} position={[-0.45, 0.1, 0.09]} color="#e8ffff" opacity={0.32} />
    <Box size={[1.65, 0.08, 0.16]} position={[0, -0.92, 0.06]} color="#8a7556" />
  </group>
);

const Sink: React.FC<{frame: number}> = ({frame}) => (
  <group>
    <Box size={[2.35, 0.72, 1.1]} position={[3.0, 0.4, -2.95]} color="#b6a68f" />
    <Box size={[2.55, 0.12, 1.25]} position={[3.0, 0.82, -2.95]} color="#e7e1d2" />
    <Cylinder
      radiusTop={0.56}
      radiusBottom={0.44}
      height={0.18}
      segments={18}
      position={[3.0, 0.89, -2.88]}
      color="#f1ede2"
    />
    <Cylinder
      radiusTop={0.43}
      radiusBottom={0.36}
      height={0.05}
      segments={18}
      position={[3.0, 0.99, -2.88]}
      color="#85b8c2"
    />
    <UnlitPlane
      width={0.68}
      height={0.44}
      position={[3.0, 1.0, -2.88]}
      rotation={[-Math.PI / 2, 0, 0]}
      color="#82d5e4"
      opacity={0.32 + Math.sin(frame / 18) * 0.05}
    />
    <Cylinder radiusTop={0.05} radiusBottom={0.05} height={0.5} segments={8} position={[3.0, 1.2, -3.35]} color="#9aa9a7" />
    <Cylinder radiusTop={0.055} radiusBottom={0.055} height={0.46} segments={8} position={[3.0, 1.41, -3.14]} rotation={[Math.PI / 2, 0, 0]} color="#9aa9a7" />
    <Cylinder radiusTop={0.07} radiusBottom={0.05} height={0.15} segments={8} position={[3.0, 1.36, -2.92]} color="#9aa9a7" />
    <Cylinder radiusTop={0.14} radiusBottom={0.17} height={0.32} segments={10} position={[3.75, 0.98, -2.9]} color="#d9c9a5" />
    <Ico radius={0.2} detail={0} position={[3.75, 1.22, -2.9]} color="#4d7f4d" castShadow={false} />
    <Ico radius={0.15} detail={0} position={[3.6, 1.3, -2.82]} color="#5f955d" castShadow={false} />
    <Mirror />
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

const Towels: React.FC = () => (
  <group position={[-4.8, 0, 1.2]}>
    <Box size={[0.12, 2.3, 0.12]} position={[0, 1.15, 0]} color="#8a9590" />
    <Box size={[0.1, 0.1, 1.1]} position={[0, 2.2, 0.4]} color="#8a9590" />
    <Box size={[0.12, 0.85, 0.65]} position={[0, 1.65, 0.42]} color="#d7cbb5" />
    <Box size={[0.1, 0.6, 0.55]} position={[0.02, 1.5, 0.45]} color="#b9785c" />
  </group>
);

const Shower: React.FC = () => (
  <group position={[-4.5, 0, 1.0]}>
    <Box size={[2.2, 0.08, 2.7]} position={[0, 0.05, 0]} map={tileTexture([2, 2])} color="#e5eee9" />
    <Box size={[0.06, 2.7, 2.5]} position={[1.12, 1.35, 0]} color="#a8c4c5" opacity={0.22} transparent />
    <Cylinder radiusTop={0.06} radiusBottom={0.06} height={1.4} segments={8} position={[0.85, 2.2, 0]} color="#9aa8a4" />
    <Cylinder radiusTop={0.18} radiusBottom={0.22} height={0.16} segments={10} position={[0.85, 2.92, 0]} color="#9aa8a4" />
    <UnlitPlane
      width={2.1}
      height={1.9}
      position={[0, 2.1, 1.2]}
      color="#d3f2ef"
      opacity={0.12}
      rotation={[0, 0, 0]}
    />
  </group>
);

const DoorAndPortal: React.FC<{frame: number; open: number}> = ({frame, open}) => {
  const doorRotation = -open * 1.28;
  return (
    <group>
      <Box size={[3.6, 4.7, 0.28]} position={[-3.2, 2.35, -4.02]} map={tileTexture([2, 2])} color="#c7d2cb" />
      <Box size={[3.6, 4.7, 0.28]} position={[3.2, 2.35, -4.02]} map={tileTexture([2, 2])} color="#c7d2cb" />
      <Box size={[2.8, 1.25, 0.28]} position={[0, 4.07, -4.02]} map={tileTexture([2, 1])} color="#c7d2cb" />
      <Box size={[0.18, 3.4, 0.26]} position={[-1.48, 1.7, -3.9]} color="#5a4431" />
      <Box size={[0.18, 3.4, 0.26]} position={[1.48, 1.7, -3.9]} color="#5a4431" />
      <Box size={[3.15, 0.18, 0.26]} position={[0, 3.38, -3.9]} color="#5a4431" />

      <group position={[-1.38, 1.66, -3.84]} rotation={[0, doorRotation, 0]}>
        <Box size={[2.72, 3.28, 0.12]} position={[1.36, 0, 0]} color="#6e4b30" />
        <Box size={[2.46, 3.02, 0.08]} position={[1.36, 0, 0.08]} color="#8f6843" />
        <Box size={[1.95, 0.06, 0.05]} position={[1.36, 0.72, 0.13]} color="#6a4a2e" />
        <Box size={[1.95, 0.06, 0.05]} position={[1.36, -0.72, 0.13]} color="#6a4a2e" />
        <mesh position={[2.25, -0.15, 0.18]}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshLambertMaterial color="#d4b16a" />
        </mesh>
      </group>

      <group position={[0, 0, -7.2]}>
        <UnlitPlane width={5.4} height={6.4} position={[0, 2.6, -3.6]} map={skyTexture()} opacity={0.92} />
        <UnlitPlane
          width={4.3}
          height={5.0}
          position={[0, 2.3, 0.08]}
          map={glowTexture()}
          color="#9feaff"
          opacity={0.18 + open * 0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
        <Plane width={7.5} height={8} position={[0, 0.02, -0.8]} color={COLORS.meadow} />
        <Cabin position={[0.5, 0, -1.4]} scale={0.34} progress={1} showSmoke={false} frame={frame} />
        <Tree position={[-1.8, 0, -0.8]} scale={0.45} kind="pine" castShadow={false} />
        <Tree position={[2.0, 0, -1.0]} scale={0.4} kind="broad" castShadow={false} hue="olive" />
        <Tree position={[2.8, 0, -2.0]} scale={0.32} kind="pine" castShadow={false} />
        <Sparkles frame={frame} position={[0, 0.4, 0.2]} count={26} radius={1.4} size={0.07} opacity={0.5} />
      </group>

      <pointLight
        position={[0, 2.2, -5.4]}
        color="#8fefff"
        intensity={0.4 + open * 4.5}
        distance={12}
        decay={2}
      />
      <GlowSprite
        position={[0, 2.5, -4.8]}
        scale={3.0}
        map={glowTexture()}
        color="#9feaff"
        opacity={0.1 + open * 0.35}
      />
    </group>
  );
};

export const BathroomScene: React.FC<{frame: number}> = ({frame}) => {
  const pose = sampleCamera(cameraKeys, frame);
  const doorOpen = clamp01(
    seg(frame, 300, 345) - seg(frame, 420, 455) + seg(frame, 500, 545),
  );
  const walk = seg(frame, 245, 345);
  const characterX = 2.45 - walk * 1.7;
  const characterZ = -2.05 - walk * 0.95;

  const isWalking = frame >= 245 && frame < 345;
  const isPinch = frame >= 610 && frame < 700;
  const isSurprised = frame >= 320 && frame < 740;
  const walkPose = Math.floor(frame / 8) % 2 === 0 ? SPRITES.walk1 : SPRITES.walk2;
  const sprite = isPinch
    ? SPRITES.pinch
    : isWalking
      ? walkPose
      : isSurprised || doorOpen > 0.15
        ? SPRITES.surprised
        : SPRITES.sad;

  return (
    <>
      <CameraRig frame={frame} pose={pose} />
      <ambientLight intensity={0.92} color="#e7f1ef" />
      <hemisphereLight args={['#d9f2f1', '#6b5b4d', 0.8]} />
      <directionalLight
        position={[3, 8, 5]}
        intensity={1.6}
        color="#e7f5ef"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-bias={-0.0005}
      />
      <pointLight position={[0, 4.2, 0]} color="#e7fff7" intensity={5} distance={10} decay={2} />

      <Plane width={10.5} height={8.5} position={[0, 0, 0.2]} map={tileTexture([4, 3])} color="#cfdad2" />
      <Box size={[0.28, 4.8, 8.5]} position={[-5.2, 2.4, 0.2]} map={tileTexture([2, 2])} color="#a8bcb5" />

      <DoorAndPortal frame={frame} open={doorOpen} />
      <Sink frame={frame} />
      <Toilet />
      <Towels />
      <Shower />

      <group position={[4.6, 1.5, -0.4]}>
        <Box size={[0.1, 1.4, 0.9]} position={[0, 0, 0]} color="#8e9d96" />
        <Box size={[0.08, 1.3, 0.7]} position={[-0.04, 0, 0]} color="#dce7df" />
        <UnlitPlane width={0.6} height={1.1} position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="#f4f2e7" opacity={0.55} />
      </group>

      <group position={[characterX, 0, characterZ]}>
        <PixelSprite src={sprite} position={[0, 0.875, 0]} height={1.75} />
        <BlobShadow position={[0, 0.015, 0]} radius={0.46} opacity={0.22} />
      </group>

      <DustMotes frame={frame} count={22} area={[7, 3.5, 5]} origin={[0, 2.8, -1.2]} opacity={0.25} color="#d8fbff" />
    </>
  );
};
