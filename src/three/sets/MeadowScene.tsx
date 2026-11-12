import React from 'react';
import {SPRITES} from '../../data/theme';
import {CameraRig, sampleCamera, type CameraKey} from '../lib/camera';
import {
  Box,
  GlowSprite,
  Ico,
  Plane,
  UnlitPlane,
  type Vec3,
} from '../lib/primitives';
import {DustMotes, Sparkles} from '../lib/particles';
import {CharacterActor, PixelSprite} from '../lib/PixelSprite';
import {glowTexture, grassTexture, skyTexture, warmGlowTexture} from '../lib/textures';
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
} from '../props/BuildingKit';

export type MeadowMode = 'reveal' | 'system' | 'build';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const revealKeys: CameraKey[] = [
  {f: 0, position: [9, 16, 13], target: [-1, 2, -3], fov: 37},
  {f: 300, position: [16, 28, 22], target: [-1, 1, -3], fov: 34},
];

const systemKeys: CameraKey[] = [
  {f: 0, position: [11, 19, 15], target: [-0.6, 1.5, -1.2], fov: 36},
  {f: 600, position: [9.8, 17.2, 13.2], target: [-0.6, 1.5, -1.2], fov: 35},
  {f: 1350, position: [8.4, 15.4, 11.2], target: [-0.6, 1.5, -1.2], fov: 33},
];

const buildKeys: CameraKey[] = [
  {f: 0, position: [15, 26, 21], target: [2, 0.5, -1], fov: 36},
  {f: 520, position: [12, 21, 16], target: [2.5, 0.8, -0.5], fov: 35},
  {f: 900, position: [9, 16, 12], target: [7.0, 1, 0.4], fov: 33},
  {f: 1200, position: [9.4, 16.4, 12.4], target: [6.4, 1, 0.3], fov: 33},
  {f: 1440, position: [13, 23, 18], target: [2, 0.5, -1], fov: 35},
  {f: 1830, position: [17, 29, 24], target: [1, 0, -2], fov: 35},
];

const treeData: Array<{pos: Vec3; scale: number; kind: 'broad' | 'pine'; hue: 'green' | 'olive' | 'dark'; shadow: boolean}> = [
  {pos: [-12.5, 0, -7], scale: 1.0, kind: 'pine', hue: 'dark', shadow: true},
  {pos: [-9.5, 0, 4.8], scale: 0.85, kind: 'broad', hue: 'olive', shadow: true},
  {pos: [10.8, 0, -7.4], scale: 0.9, kind: 'pine', hue: 'green', shadow: true},
  {pos: [13.5, 0, 2.0], scale: 0.7, kind: 'broad', hue: 'olive', shadow: false},
  {pos: [1.2, 0, -13.2], scale: 0.62, kind: 'pine', hue: 'dark', shadow: false},
  {pos: [-2.8, 0, -10.4], scale: 0.55, kind: 'broad', hue: 'green', shadow: false},
  {pos: [8.8, 0, 8.6], scale: 0.58, kind: 'broad', hue: 'olive', shadow: false},
  {pos: [-14.5, 0, -13.5], scale: 0.8, kind: 'pine', hue: 'dark', shadow: false},
  {pos: [18.5, 0, -5.2], scale: 0.74, kind: 'broad', hue: 'green', shadow: false},
  {pos: [-6.2, 0, 9.5], scale: 0.48, kind: 'broad', hue: 'olive', shadow: false},
  {pos: [15.8, 0, 10.2], scale: 0.5, kind: 'pine', hue: 'green', shadow: false},
  {pos: [4.4, 0, -10.8], scale: 0.45, kind: 'pine', hue: 'dark', shadow: false},
];

const BirdFlock: React.FC<{frame: number}> = ({frame}) => (
  <group>
    {[0, 1, 2, 3, 4].map((index) => {
      const x = -22 + ((frame * 0.018 + index * 8.5) % 46);
      const y = 9.5 + (index % 3) * 0.9 + Math.sin(frame / 90 + index) * 0.3;
      return (
        <PixelSprite
          key={`bird-${index}`}
          src={SPRITES.bird}
          position={[x, y, -20 - index * 2.4]}
          height={0.42 + (index % 2) * 0.09}
          flip={index % 2 === 0}
        />
      );
    })}
  </group>
);

const Blueprint: React.FC<{position: Vec3; opacity: number; frame: number}> = ({
  position,
  opacity,
  frame,
}) => {
  const cyan = '#8df2ff';
  return (
    <group position={position} visible={opacity > 0.01}>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.7, 2.78, 32]} />
        <meshBasicMaterial color={cyan} transparent opacity={0.45 * opacity} side={2} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[4.6, 2.5, 3.7]} />
        <meshBasicMaterial color={cyan} wireframe transparent opacity={0.3 * opacity} />
      </mesh>
      <mesh position={[0, 3.0, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[4.8, 0.08, 4.0]} />
        <meshBasicMaterial color={cyan} wireframe transparent opacity={0.3 * opacity} />
      </mesh>
      <mesh position={[0, 3.0, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[4.8, 0.08, 4.0]} />
        <meshBasicMaterial color={cyan} wireframe transparent opacity={0.3 * opacity} />
      </mesh>
      <GlowSprite position={[0, 0.18, 0]} scale={4.8} map={glowTexture()} color="#8df2ff" opacity={0.18 * opacity} />
      <Sparkles frame={frame} position={[0, 0.4, 0]} count={22} radius={2.1} size={0.06} opacity={0.35 * opacity} />
    </group>
  );
};

const Scaffolding: React.FC<{position: Vec3; visible: boolean}> = ({position, visible}) => (
  <group position={position} visible={visible}>
    {[-2.0, 2.0].map((x) =>
      [-1.5, 1.6].map((z) => (
        <Box
          key={`scaffold-${x}-${z}`}
          size={[0.12, 4.1, 0.12]}
          position={[x, 2.05, z]}
          color="#9b7446"
          castShadow={false}
        />
      )),
    )}
    {[-2.0, 2.0].map((x) => (
      <Box key={`scaffold-top-${x}`} size={[0.1, 0.1, 3.4]} position={[x, 3.8, 0]} color="#9b7446" castShadow={false} />
    ))}
    <Box size={[4.3, 0.1, 0.1]} position={[0, 2.7, -1.5]} color="#b08a58" castShadow={false} />
    <Box size={[4.3, 0.1, 0.1]} position={[0, 1.4, -1.5]} color="#b08a58" castShadow={false} />
  </group>
);

export const MeadowScene: React.FC<{
  frame: number;
  mode: MeadowMode;
  buildProgress?: number;
}> = ({frame, mode, buildProgress}) => {
  const keys = mode === 'reveal' ? revealKeys : mode === 'system' ? systemKeys : buildKeys;
  const pose = sampleCamera(keys, frame);
  const progress =
    buildProgress ??
    (mode === 'build' ? clamp01((frame - 960) / 220) : 0);
  const showPlot = mode !== 'reveal';
  const showNajmi = mode !== 'reveal';
  const buildWalk = mode === 'build' ? smooth((frame - 600) / 165) : 0;
  const walking = mode === 'build' && frame >= 600 && frame < 770;
  const buildWalkPose = [
    SPRITES.backWalk1,
    SPRITES.backWalk2,
    SPRITES.backWalk3,
    SPRITES.backWalk4,
  ][Math.floor(frame / 7) % 4];

  const najmiPose =
    mode === 'system'
      ? frame < 180
        ? SPRITES.surprised
        : frame < 450
          ? SPRITES.idle
          : frame < 600
            ? SPRITES.pinch
            : frame < 930
              ? SPRITES.point
              : frame < 1120
                ? SPRITES.shout
                : SPRITES.sad
      : walking
        ? buildWalkPose
        : frame < 600
          ? SPRITES.back
          : frame < 870
            ? SPRITES.pinch
            : frame < 1155
              ? SPRITES.sad
              : frame < 1245
                ? SPRITES.pinch
                : frame < 1310
                  ? SPRITES.sad
                  : SPRITES.back;

  const najmiX = mode === 'system' ? -1.4 + Math.sin(frame / 110) * 0.12 : 2.1 + buildWalk * 1.5;
  const najmiZ = mode === 'system' ? -0.8 + Math.sin(frame / 135) * 0.05 : 2.2 + buildWalk * 0.85;
  const najmiJump =
    mode === 'system' && frame >= 64 && frame < 132
      ? Math.sin(((frame - 64) / 68) * Math.PI) * 0.16
      : 0;
  const najmiLean =
    mode === 'build' && frame >= 870 && frame < 1310 ? -0.022 : mode === 'system' ? Math.sin(frame / 95) * 0.006 : 0;

  return (
    <>
      <CameraRig frame={frame} pose={pose} />
      <fog attach="fog" args={['#f4d8b0', 38, 95]} />
      <ambientLight intensity={0.72} color="#fff0d0" />
      <hemisphereLight args={['#cde7ee', '#7b6b45', 0.85]} />
      <directionalLight
        position={[13, 20, 12]}
        intensity={2.8}
        color="#ffe0b0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={65}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-3, 5, -1]} color="#ffd19b" intensity={2.2} distance={16} decay={2} />

      <UnlitPlane width={150} height={72} position={[0, 22, -68]} map={skyTexture()} opacity={1} fog={false} />
      <Plane width={80} height={70} position={[0, -0.02, -8]} map={grassTexture([18, 16])} color="#d4e4b4" />
      <Mountains z={-42} />
      <Sun position={[18, 23, -48]} />
      <Clouds frame={frame} />

      <Cabin position={[-3.2, 0, -4.8]} progress={1} frame={frame} accent="#3f7f78" />
      <Path position={[1.8, 0, -0.5]} length={12.5} width={2.3} rotation={0.52} />
      <Fence position={[5.4, 0, 3.4]} length={7.5} />
      <Fence position={[9.2, 0, 1.2]} rotation={[0, Math.PI / 2, 0]} length={5.4} />

      {showPlot ? (
        <>
          <VillageMarker position={[5.4, 0, 0.8]} active={progress > 0.9} frame={frame} />
          <Cabin
            position={[5.4, 0, 0.8]}
            scale={0.78}
            progress={progress}
            frame={frame}
            accent="#5d8a6a"
            showSmoke
          />
          <Blueprint
            position={[5.4, 0, 0.8]}
            opacity={mode === 'system' ? 0.2 : 1 - progress}
            frame={frame}
          />
          <Scaffolding position={[5.4, 0, 0.8]} visible={progress > 0.01 && progress < 0.95} />
          {progress > 0.01 && progress < 0.99 ? (
            <Sparkles frame={frame} position={[5.4, 0.2, 0.8]} count={42} radius={2.6} size={0.075} opacity={0.85} />
          ) : null}
          {progress > 0.91 ? <Signpost position={[5.4, 0, 3.25]} text="DESA NAJMI" /> : null}
        </>
      ) : null}

      <River frame={frame} position={[-12, 0.02, -15]} rotation={0.24} />
      <group>
        {treeData.map((tree, index) => (
          <Tree
            key={`tree-${index}`}
            position={tree.pos}
            scale={tree.scale}
            kind={tree.kind}
            hue={tree.hue}
            castShadow={tree.shadow}
          />
        ))}
      </group>

      <Rock position={[-7.5, 0, 1.5]} scale={0.8} />
      <Rock position={[8.8, 0, -1.8]} scale={0.55} color="#8b947e" />
      <Rock position={[-2.4, 0, 5.4]} scale={0.5} color="#8d8d7a" />
      {[
        [-6.5, 0, 2.8],
        [-4.6, 0, 4.1],
        [8.4, 0, 4.5],
        [11.4, 0, 1.4],
        [1.1, 0, 5.1],
        [-8.2, 0, -2.2],
      ].map((pos, index) => (
        <GrassTuft key={`tuft-${index}`} position={pos as Vec3} scale={0.9 + (index % 3) * 0.2} />
      ))}

      <BirdFlock frame={frame} />
      <DustMotes frame={frame} count={22} area={[18, 3, 12]} origin={[0, 2.2, 0]} opacity={0.18} color="#ffe8b6" />

      {showNajmi ? (
        <CharacterActor
          src={najmiPose}
          frame={frame}
          position={[najmiX, 0, najmiZ]}
          height={1.75}
          walking={walking}
          walkSpeed={5.6}
          phase={2.1}
          jump={najmiJump}
          lean={najmiLean}
          shadowRadius={0.48}
          shadowOpacity={0.24}
        />
      ) : null}

      <GlowSprite
        position={[-3.2, 2.7, -1.1]}
        scale={4.2}
        map={warmGlowTexture()}
        color="#ffd595"
        opacity={0.16}
      />
    </>
  );
};
