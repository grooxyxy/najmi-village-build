import React from 'react';
import * as THREE from 'three';
import {SPRITES} from '../../data/theme';
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
import {CharacterActor, PixelSprite} from '../lib/PixelSprite';
import {
  glowTexture,
  grassTexture,
  skyTexture,
  stoneTexture,
  tileTexture,
  warmGlowTexture,
} from '../lib/textures';
import {
  Cabin,
  Fence,
  GrassTuft,
  Mountains,
  Path,
  Rock,
  Signpost,
  Sun,
  Tree,
} from '../props/BuildingKit';

const cameraKeys: CameraKey[] = [
  {f: 0, position: [7.8, 10.6, 9.8], target: [0.2, 1.4, -2.2], fov: 42},
  {f: 240, position: [5.2, 7.4, 7.6], target: [0.2, 1.6, -3.2], fov: 37},
  {f: 330, position: [3.4, 4.2, 6.3], target: [0.3, 1.8, -5.0], fov: 33},
  {f: 450, position: [3.0, 3.6, 5.9], target: [0.4, 1.8, -6.2], fov: 32},
  {f: 650, position: [2.5, 3.0, 5.4], target: [0.4, 1.9, -7.2], fov: 31},
  {f: 820, position: [2.0, 2.6, 5.0], target: [0.5, 1.9, -7.6], fov: 30},
  {f: 1000, position: [3.1, 4.7, 5.8], target: [0.4, 1.7, -6.4], fov: 32},
  {f: 1050, position: [3.8, 5.4, 6.4], target: [0.3, 1.7, -5.6], fov: 34},
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
      opacity={0.3 + Math.sin(frame / 18) * 0.06}
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

const PortalBar: React.FC<{position: Vec3; size: Vec3; opacity: number}> = ({
  position,
  size,
  opacity,
}) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshBasicMaterial
      color="#9ff6ff"
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      toneMapped={false}
    />
  </mesh>
);

const LightShaft: React.FC<{position: Vec3; rotation?: Vec3; opacity: number; scale?: number}> = ({
  position,
  rotation = [0, 0, 0],
  opacity,
  scale = 1,
}) => (
  <mesh position={position} rotation={rotation} scale={scale}>
    <coneGeometry args={[1.45, 16, 18, 1, true]} />
    <meshBasicMaterial
      color="#ffe4ab"
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      toneMapped={false}
    />
  </mesh>
);

const PortalBirds: React.FC<{frame: number}> = ({frame}) => (
  <group>
    {[0, 1, 2].map((index) => {
      const x = -7.4 + ((frame * 0.012 + index * 4.2) % 8.6);
      const y = 5.0 + (index % 2) * 0.75 + Math.sin(frame / 70 + index) * 0.18;
      return (
        <PixelSprite
          key={`portal-bird-${index}`}
          src={SPRITES.bird}
          position={[x, y, -17 - index * 2.5]}
          height={0.25 + (index % 2) * 0.06}
          flip={index % 2 === 0}
        />
      );
    })}
  </group>
);

const PortalWorld: React.FC<{frame: number}> = ({frame}) => (
  <group>
    <UnlitPlane
      width={64}
      height={38}
      position={[-2, 15, -52]}
      map={skyTexture()}
      opacity={1}
      fog={false}
    />
    <Sun position={[-10.5, 6.2, -40]} />
    <Mountains z={-45} />

    <Plane
      width={27}
      height={54}
      position={[-12, -0.04, -31]}
      map={grassTexture([14, 18])}
      color="#d9e6bb"
    />
    <Path
      position={[-1.55, 0, -14.2]}
      length={18.5}
      width={2.35}
      rotation={0.18}
    />

    <BlobShadow position={[-3.2, 0.02, -22.5]} radius={3.4} opacity={0.23} />
    <Cabin
      position={[-3.2, 0, -22.5]}
      scale={0.85}
      rotation={[0, 0.14, 0]}
      progress={1}
      showSmoke
      frame={frame}
      accent="#3f7f78"
    />
    <Cabin
      position={[-8.2, 0, -33]}
      scale={0.42}
      rotation={[0, 0.35, 0]}
      progress={1}
      showSmoke={false}
      frame={frame}
      accent="#547a63"
    />
    <Cabin
      position={[-0.8, 0, -39]}
      scale={0.34}
      rotation={[0, -0.2, 0]}
      progress={1}
      showSmoke={false}
      frame={frame}
      accent="#6c624d"
    />

    <Tree position={[-7.6, 0, -13.5]} scale={1.1} kind="pine" hue="dark" castShadow />
    <Tree position={[-9.8, 0, -19]} scale={1.35} kind="broad" hue="green" castShadow={false} />
    <Tree position={[-0.8, 0, -16.5]} scale={0.9} kind="pine" hue="olive" castShadow={false} />
    <Tree position={[-5.4, 0, -27]} scale={0.72} kind="broad" hue="dark" castShadow={false} />
    <Tree position={[-12.5, 0, -28]} scale={0.9} kind="pine" hue="dark" castShadow={false} />

    <Fence position={[-4.8, 0, -12.2]} rotation={[0, 0.15, 0]} length={6.5} />
    <group position={[-0.15, 0, -11.6]} scale={0.86} rotation={[0, -0.18, 0]}>
      <Signpost text="DESA NAJMI" />
    </group>

    <Rock position={[-4.9, 0, -8.6]} scale={0.72} color="#89907e" />
    <Rock position={[-1.7, 0, -10.4]} scale={0.45} color="#7e8979" />
    <Rock position={[-6.7, 0, -10.9]} scale={0.38} color="#959885" />

    {[
      [-3.2, 0, -9.2, 0.75],
      [-5.5, 0, -11.4, 0.85],
      [-1.1, 0, -12.8, 0.68],
      [-6.6, 0, -14.8, 0.9],
      [-2.5, 0, -15.5, 0.72],
      [-5.9, 0, -18.2, 0.8],
    ].map(([x, y, z, scale], index) => (
      <GrassTuft
        key={`portal-grass-${index}`}
        position={[x, y, z] as Vec3}
        scale={scale}
      />
    ))}

    <UnlitPlane
      width={17}
      height={2.2}
      position={[-3, 1.5, -24]}
      map={glowTexture()}
      color="#ecf7e8"
      opacity={0.1}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      fog={false}
    />
    <UnlitPlane
      width={24}
      height={2.6}
      position={[-2, 2.4, -36]}
      map={glowTexture()}
      color="#e8f2df"
      opacity={0.07}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      fog={false}
    />

    <LightShaft position={[-7.4, 8, -24]} rotation={[0, 0, 0.22]} opacity={0.045} />
    <LightShaft position={[-4.2, 8, -28]} rotation={[0, 0, -0.08]} opacity={0.032} />
    <LightShaft position={[-1.4, 8, -31]} rotation={[0, 0, 0.12]} opacity={0.026} />

    <PortalBirds frame={frame} />
    <DustMotes
      frame={frame}
      count={46}
      area={[16, 4.5, 24]}
      origin={[-3.5, 2.1, -20]}
      opacity={0.3}
      color="#ffe6b0"
      size={0.05}
    />
    <Sparkles
      frame={frame}
      position={[-2.8, 0.3, -16]}
      count={28}
      radius={3.2}
      size={0.055}
      opacity={0.34}
      color="#f7e7a8"
    />
  </group>
);

const DoorAndPortal: React.FC<{frame: number; open: number}> = ({frame, open}) => {
  const doorRotation = -open * 1.28;
  const rim = 0.14 + open * 0.5 + Math.sin(frame / 8) * 0.035;
  return (
    <group>
      <Box size={[4.4, 4.7, 0.28]} position={[-3.6, 2.35, -4.02]} map={tileTexture([2, 2])} color="#c7d2cb" />
      <Box size={[4.4, 4.7, 0.28]} position={[3.6, 2.35, -4.02]} map={tileTexture([2, 2])} color="#c7d2cb" />
      <Box size={[2.8, 1.25, 0.28]} position={[0, 4.07, -4.02]} map={tileTexture([2, 1])} color="#c7d2cb" />
      <Box
        size={[11.6, 3.4, 0.28]}
        position={[0, 6.4, -4.02]}
        map={tileTexture([3, 2])}
        color="#bccdc5"
        castShadow={false}
      />
      <Box size={[0.18, 3.4, 0.26]} position={[-1.48, 1.7, -3.9]} color="#5a4431" />
      <Box size={[0.18, 3.4, 0.26]} position={[1.48, 1.7, -3.9]} color="#5a4431" />
      <Box size={[3.15, 0.18, 0.26]} position={[0, 3.38, -3.9]} color="#5a4431" />

      <Box size={[0.22, 3.5, 2.4]} position={[-1.51, 1.75, -5.15]} map={stoneTexture([1, 1])} color="#45564f" />
      <Box size={[0.22, 3.5, 2.4]} position={[1.51, 1.75, -5.15]} map={stoneTexture([1, 1])} color="#45564f" />
      <Box size={[3.24, 0.2, 2.4]} position={[0, 3.47, -5.15]} map={stoneTexture([1, 1])} color="#3b4b45" />
      <Box size={[3.24, 0.14, 2.4]} position={[0, 0.07, -5.15]} map={stoneTexture([1, 1])} color="#5b6a5f" />

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

      <PortalBar position={[0, 3.43, -3.82]} size={[3.08, 0.045, 0.045]} opacity={rim} />
      <PortalBar position={[0, -0.02, -3.82]} size={[3.08, 0.045, 0.045]} opacity={rim * 0.8} />
      <PortalBar position={[-1.45, 1.7, -3.82]} size={[0.045, 3.4, 0.045]} opacity={rim} />
      <PortalBar position={[1.45, 1.7, -3.82]} size={[0.045, 3.4, 0.045]} opacity={rim} />

      <PortalWorld frame={frame} />

      <Sparkles
        frame={frame}
        position={[0, 1.8, -3.95]}
        count={32}
        radius={1.45}
        size={0.052}
        opacity={0.16 + open * 0.55}
        color="#c9fbff"
      />
      <GlowSprite
        position={[0, 2.35, -5.2]}
        scale={3.5}
        map={glowTexture()}
        color="#9feaff"
        opacity={0.08 + open * 0.26}
      />
      <GlowSprite
        position={[0, 0.55, -4.4]}
        scale={1.8}
        map={warmGlowTexture()}
        color="#ffe4a6"
        opacity={0.07 + open * 0.12}
      />
      <pointLight
        position={[0, 2.2, -5.4]}
        color="#8fefff"
        intensity={0.6 + open * 4.2}
        distance={12}
        decay={2}
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
  const approach = seg(frame, 720, 825);
  const recoil = seg(frame, 880, 940);
  const settle = seg(frame, 545, 620);
  const walking = (frame >= 245 && frame < 350) || (frame >= 720 && frame < 828);
  const isPinch = frame >= 610 && frame < 700;

  const characterX = 2.45 - walk * 1.7 + settle * 0.42 - approach * 0.16 + recoil * 0.34;
  const characterZ = -2.05 - walk * 0.95 - approach * 0.55 + recoil * 0.2;

  const walkSprites = [
    SPRITES.backWalk1,
    SPRITES.backWalk2,
    SPRITES.backWalk3,
    SPRITES.backWalk4,
  ];
  const walkPose = walkSprites[Math.floor(frame / 6) % walkSprites.length];

  const sprite = walking
    ? walkPose
    : isPinch
      ? SPRITES.pinch
      : frame >= 940
        ? SPRITES.sad
        : frame >= 320
          ? SPRITES.surprised
          : SPRITES.sad;

  const surpriseJump =
    frame >= 330 && frame < 392
      ? Math.sin(((frame - 330) / 62) * Math.PI) * 0.19
      : 0;
  const revealJump =
    frame >= 512 && frame < 582
      ? Math.sin(((frame - 512) / 70) * Math.PI) * 0.17
      : 0;
  const jump = Math.max(surpriseJump, revealJump);
  const lean = walking ? 0.012 : recoil * 0.03;

  return (
    <>
      <CameraRig frame={frame} pose={pose} />
      <fog attach="fog" args={['#9fb8ad', 13, 58]} />

      <ambientLight intensity={0.42} color="#e0efeb" />
      <hemisphereLight args={['#d9f2f1', '#51493f', 0.56]} />
      <directionalLight
        position={[4.5, 9, 6]}
        intensity={1.85}
        color="#ffe4bc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-16, 20, 10]} intensity={1.45} color="#ffe0a8" castShadow={false} />
      <pointLight position={[0, 3.9, 1.2]} color="#ffe3bd" intensity={2.1} distance={9} decay={2} />
      <pointLight position={[3.1, 2.5, -2.2]} color="#ffd1a0" intensity={1.6} distance={4.5} decay={2} />

      <Plane width={11.6} height={12} position={[0, 0, 0.6]} map={tileTexture([4, 4])} color="#cfdad2" />
      <Box size={[0.28, 4.8, 12]} position={[-5.3, 2.4, 0.6]} map={tileTexture([2, 2])} color="#a8bcb5" />

      <DoorAndPortal frame={frame} open={doorOpen} />
      <Sink frame={frame} />
      <Toilet />
      <Towels />
      <Shower />

      <Box size={[2.4, 0.04, 1.3]} position={[0, 0.035, -2.15]} color="#6e8178" />
      <group position={[4.6, 1.5, -0.4]}>
        <Box size={[0.1, 1.4, 0.9]} position={[0, 0, 0]} color="#8e9d96" />
        <Box size={[0.08, 1.3, 0.7]} position={[-0.04, 0, 0]} color="#dce7df" />
        <UnlitPlane width={0.6} height={1.1} position={[-0.08, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="#f4f2e7" opacity={0.55} />
      </group>

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        walking={walking}
        walkSpeed={5.4}
        jump={jump}
        lean={lean}
        shadowRadius={0.46}
        shadowOpacity={0.24}
      />

      <DustMotes frame={frame} count={26} area={[7, 3.5, 5]} origin={[0, 2.8, -1.2]} opacity={0.22} color="#d8fbff" />
      <Sparkles frame={frame} position={[0, 0.3, -2.0]} count={16} radius={1.5} size={0.04} opacity={0.18} color="#ffe5ad" />
    </>
  );
};
