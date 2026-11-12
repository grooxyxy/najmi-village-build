import React from 'react';
import * as THREE from 'three';
import {COLORS, SPRITES} from '../../data/theme';
import {CameraRig, sampleCamera, type CameraKey} from '../lib/camera';
import {
  Box,
  Cylinder,
  GlowSprite,
  Ico,
  Plane,
  UnlitPlane,
} from '../lib/primitives';
import {DustMotes, Embers} from '../lib/particles';
import {CharacterActor} from '../lib/PixelSprite';
import {glowTexture, roofTexture, stoneTexture, skyTexture, warmGlowTexture, windowGlowTexture, woodTexture} from '../lib/textures';
import {Mountains, Sun, Tree} from '../props/BuildingKit';

const cameraKeys: CameraKey[] = [
  {f: 0, position: [8.5, 12.5, 10.5], target: [0, 1.2, -1.2], fov: 40},
  {f: 300, position: [7.0, 10.5, 8.5], target: [0, 1.3, -1.8], fov: 37},
  {f: 450, position: [4.2, 8.0, 6.2], target: [-0.3, 2.4, -4.6], fov: 34},
  {f: 600, position: [2.6, 6.8, 5.0], target: [-0.3, 2.6, -5.2], fov: 33},
  {f: 780, position: [2.2, 6.4, 4.6], target: [-0.3, 2.5, -5.0], fov: 32},
  {f: 900, position: [2.6, 6.6, 4.8], target: [-0.3, 2.4, -5.0], fov: 32},
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const seg = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const WindowView: React.FC<{frame: number}> = ({frame}) => (
  <group position={[0, 0, -5.2]}>
    <UnlitPlane width={30} height={13} position={[0, 6.6, -28]} map={skyTexture()} opacity={0.95} />
    <Plane width={38} height={30} position={[0, -0.35, -10]} color={COLORS.meadow} />
    <Plane width={7} height={18} position={[-5.2, 0.02, -7.5]} rotation={[-Math.PI / 2, 0, -0.12]} color={COLORS.water} opacity={0.9} />
    <Mountains z={-22} />
    <Sun position={[9, 9.5, -17]} />
    <Tree position={[-7.2, 0, -8.5]} scale={0.7} kind="pine" castShadow={false} />
    <Tree position={[5.4, 0, -8.0]} scale={0.8} kind="broad" castShadow={false} hue="olive" />
    <Tree position={[8.5, 0, -11]} scale={0.65} kind="pine" castShadow={false} />
    <Tree position={[-9.5, 0, -12]} scale={0.55} kind="broad" castShadow={false} />
    <Tree position={[1.8, 0, -13]} scale={0.5} kind="pine" castShadow={false} />
    <group position={[-2.8, 0, -11]}>
      <Ico radius={1.2} detail={0} position={[0, 0.7, 0]} color="#779a58" scale={[1.7, 0.7, 1.2]} castShadow={false} />
      <Ico radius={0.8} detail={0} position={[1.7, 0.45, 0.3]} color="#6a8b4d" scale={[1.3, 0.55, 1]} castShadow={false} />
    </group>
    <DustMotes frame={frame} count={20} area={[12, 2.5, 8]} origin={[0, 3.5, -3]} opacity={0.18} color="#ffe3ad" />
  </group>
);

const Fireplace: React.FC<{frame: number}> = ({frame}) => (
  <group position={[-4.9, 0, 0.37]}>
    <Box size={[0.65, 3.0, 2.5]} position={[0, 1.5, 0]} map={stoneTexture([1, 2])} color="#b9b4a5" />
    <Box size={[0.9, 0.25, 2.9]} position={[0.1, 3.0, 0]} map={stoneTexture([1, 2])} color="#c7c2b2" />
    <Box size={[0.08, 1.5, 1.5]} position={[0.37, 1.0, 0]} color="#2b241e" />
    <Box size={[0.1, 0.12, 1.6]} position={[0.43, 1.7, 0]} color="#5e4c3b" />
    <Cylinder radiusTop={0.1} radiusBottom={0.13} height={1.1} segments={7} position={[0.48, 0.62, -0.4]} rotation={[0, 0, 0.3]} color="#4c3222" />
    <Cylinder radiusTop={0.1} radiusBottom={0.13} height={1.1} segments={7} position={[0.48, 0.62, 0.35]} rotation={[0, 0, -0.25]} color="#5a3b28" />
    <Embers frame={frame} position={[0.55, 0.3, 0.02]} count={26} />
    <GlowSprite position={[0.72, 0.75, 0]} scale={1.8} map={warmGlowTexture()} color="#ff9a3c" opacity={0.32} />
    <pointLight position={[0.9, 1.2, 0]} color="#ff9a3c" intensity={5} distance={7} decay={2} />
    <Box size={[0.25, 0.18, 3.2]} position={[0.46, 0.09, 0]} color="#615b50" />
  </group>
);

const Table: React.FC = () => (
  <group position={[-0.8, 0, 0.15]}>
    <Plane width={4.6} height={3.4} position={[0, 0.015, -0.1]} color="#8f5f49" />
    <Plane width={4.1} height={2.9} position={[0, 0.02, -0.1]} color="#b07a5a" />
    <Box size={[2.7, 0.16, 1.55]} position={[0, 1.12, 0]} map={woodTexture([2, 1])} color="#c89864" />
    {[-1.1, 1.1].map((x) => (
      <Box key={`table-leg-x-${x}`} size={[0.14, 1.05, 0.14]} position={[x, 0.53, -0.55]} color="#6e492c" />
    ))}
    {[-1.1, 1.1].map((x) => (
      <Box key={`table-leg-z-${x}`} size={[0.14, 1.05, 0.14]} position={[x, 0.53, 0.55]} color="#6e492c" />
    ))}
    <Cylinder radiusTop={0.3} radiusBottom={0.2} height={0.13} segments={12} position={[0.35, 1.27, 0.1]} color="#d6c59f" />
    <Ico radius={0.16} detail={0} position={[0.1, 1.32, 0.1]} color="#b85d4e" castShadow={false} />
    <Ico radius={0.14} detail={0} position={[0.48, 1.31, 0.05]} color="#d7a44b" castShadow={false} />
    <Cylinder radiusTop={0.07} radiusBottom={0.1} height={0.26} segments={8} position={[-0.75, 1.33, -0.2]} color="#d9c6a0" />
    <mesh position={[-0.75, 1.5, -0.2]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#ffb35e" toneMapped={false} />
    </mesh>
    <GlowSprite position={[-0.75, 1.53, -0.2]} scale={0.55} map={warmGlowTexture()} color="#ffb35e" opacity={0.42} />
    <group position={[2.0, 0, 0.4]}>
      <Box size={[0.9, 0.12, 0.9]} position={[0, 0.55, 0]} color="#6d492e" />
      <Box size={[0.85, 0.9, 0.12]} position={[0, 1.0, 0.38]} rotation={[0.12, 0, 0]} color="#865d3c" />
      {[-0.32, 0.32].map((x) => (
        <Box key={`chair2-${x}`} size={[0.08, 0.55, 0.08]} position={[x, 0.3, 0.3]} color="#54381f" />
      ))}
    </group>
    <group position={[-2.1, 0, -0.25]} rotation={[0, 0.4, 0]}>
      <Box size={[0.85, 0.12, 0.85]} position={[0, 0.55, 0]} color="#65432a" />
      <Box size={[0.82, 0.85, 0.12]} position={[0, 0.98, 0.34]} color="#7a5336" />
    </group>
  </group>
);

const BackWall: React.FC = () => (
  <group>
    <Plane width={10.5} height={8.5} position={[0, 0, 0.5]} map={woodTexture([4, 3])} color="#d4b087" />
    <Box size={[2.35, 5.6, 0.3]} position={[-3.85, 2.8, -3.98]} map={woodTexture([1, 2])} color="#d7b083" />
    <Box size={[3.25, 5.6, 0.3]} position={[3.35, 2.8, -3.98]} map={woodTexture([1, 2])} color="#d7b083" />
    <Box size={[4.6, 1.8, 0.3]} position={[-0.5, 0.9, -3.98]} map={woodTexture([2, 1])} color="#c9a276" />
    <Box size={[4.6, 1.0, 0.3]} position={[-0.5, 5.1, -3.98]} map={woodTexture([2, 1])} color="#c9a276" />
    <Box size={[4.9, 0.18, 0.48]} position={[-0.5, 1.82, -3.86]} color="#6a472d" />
    <Box size={[0.16, 2.9, 0.18]} position={[-2.85, 3.2, -3.86]} color="#62412a" />
    <Box size={[0.16, 2.9, 0.18]} position={[1.85, 3.2, -3.86]} color="#62412a" />
    <Box size={[4.7, 0.16, 0.18]} position={[-0.5, 4.62, -3.86]} color="#62412a" />
    <Box size={[0.08, 2.7, 0.1]} position={[-0.5, 3.2, -3.82]} color="#62412a" />
    <Box size={[4.5, 0.08, 0.1]} position={[-0.5, 3.2, -3.82]} color="#62412a" />
    <UnlitPlane width={4.4} height={2.6} position={[-0.5, 3.2, -3.79]} map={windowGlowTexture()} opacity={0.16} />
    <Cylinder radiusTop={0.1} radiusBottom={0.12} height={5.5} segments={7} position={[-4.85, 2.75, -3.75]} color="#5a3d27" />
    <Cylinder radiusTop={0.1} radiusBottom={0.12} height={5.5} segments={7} position={[4.6, 2.75, -3.75]} color="#5a3d27" />
    <Box size={[10.2, 0.25, 0.32]} position={[0, 5.45, -3.8]} color="#57402b" />
    <Box size={[0.3, 5.6, 8.5]} position={[-5.15, 2.8, 0.5]} map={woodTexture([2, 2])} color="#c9a276" />
    <Box size={[10.5, 0.3, 0.3]} position={[0, 0.15, -3.7]} color="#66452c" />
    <Box size={[0.3, 0.3, 8.5]} position={[-5.0, 0.15, 0.5]} color="#66452c" />
    <group position={[3.35, 1.32, -3.8]}>
      <Box size={[1.2, 2.6, 0.12]} position={[0, 0, -0.02]} color="#5c3f2a" />
      <Box size={[1.02, 2.42, 0.08]} position={[0, 0, 0.05]} color="#80603f" />
      <mesh position={[0.38, -0.1, 0.12]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshLambertMaterial color="#d5b26b" />
      </mesh>
    </group>
    <group position={[2.2, 3.9, -3.75]} rotation={[0, 0, 0.05]}>
      <Box size={[1.6, 0.85, 0.08]} position={[0, 0, 0]} color="#5e4630" />
      <Box size={[1.45, 0.7, 0.06]} position={[0, 0, 0.05]} color="#b98d58" />
      <Box size={[0.7, 0.4, 0.05]} position={[0.1, 0, 0.09]} color="#6d8b79" />
    </group>
  </group>
);

export const CabinInteriorScene: React.FC<{frame: number}> = ({frame}) => {
  const pose = sampleCamera(cameraKeys, frame);
  const enterWalk = seg(frame, 0, 120);
  const approach = seg(frame, 300, 450);
  const atWindow = frame >= 450;
  const moving = frame < 125 || (frame >= 300 && frame < 458);

  const characterX = 3.2 - enterWalk * 2.4 - approach * 1.6;
  const characterZ = -1.15 - enterWalk * 1.85 - approach * 0.12;
  const walkPose = [
    SPRITES.backWalk1,
    SPRITES.backWalk2,
    SPRITES.backWalk3,
    SPRITES.backWalk4,
  ][Math.floor(frame / 7) % 4];
  const sprite = atWindow
    ? SPRITES.back
    : moving
      ? walkPose
      : frame < 180
        ? SPRITES.surprised
        : frame < 260
          ? SPRITES.sad
          : SPRITES.pinch;
  const arriveJump =
    frame >= 112 && frame < 164
      ? Math.sin(((frame - 112) / 52) * Math.PI) * 0.06
      : 0;

  return (
    <>
      <CameraRig frame={frame} pose={pose} />
      <ambientLight intensity={0.68} color="#ffe0b0" />
      <hemisphereLight args={['#ffe0ae', '#3e3328', 0.75]} />
      <directionalLight
        position={[-2, 8.5, -7]}
        intensity={2.6}
        color="#ffd69b"
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
      <pointLight position={[-2.2, 2.4, -4.8]} color="#ffd79d" intensity={3.5} distance={8} decay={2} />

      <BackWall />
      <WindowView frame={frame} />
      <Fireplace frame={frame} />
      <Table />

      <Box size={[5.0, 0.25, 0.45]} position={[-0.5, 1.82, -3.62]} color="#7e5737" />
      <Box size={[0.3, 0.9, 0.35]} position={[-2.4, 0.45, -3.62]} color="#6e4a2e" />
      <Box size={[0.3, 0.9, 0.35]} position={[1.4, 0.45, -3.62]} color="#6e4a2e" />

      <group position={[0, 4.9, 0.5]}>
        {[-2.8, 0.2, 3.2].map((z) => (
          <Box key={`beam-${z}`} size={[10.2, 0.26, 0.26]} position={[0, 0, z]} color={COLORS.woodDark} />
        ))}
      </group>

      <group position={[-4.2, 2.0, -2.9]} rotation={[0, Math.PI / 2, 0]}>
        <Box size={[1.6, 2.0, 0.08]} position={[0, 0, 0]} color="#59402c" />
        <Box size={[1.4, 1.8, 0.06]} position={[0, 0, 0.06]} color="#9d764b" />
      </group>

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        walking={moving}
        walkSpeed={5.6}
        phase={1.2}
        jump={arriveJump}
        lean={moving ? 0.01 : Math.sin(frame / 95) * 0.005}
        shadowRadius={0.46}
        shadowOpacity={0.24}
      />

      <UnlitPlane
        width={4.5}
        height={6.5}
        position={[-1.0, 3.0, -1.6]}
        rotation={[0.85, 0.08, 0]}
        map={warmGlowTexture()}
        color="#ffe3ad"
        opacity={0.13}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      <DustMotes frame={frame} count={52} area={[8.5, 5, 7]} origin={[0, 2.8, 0.1]} opacity={0.52} color="#ffe2ac" />
      <GlowSprite position={[-0.5, 3.4, -3.7]} scale={5.5} map={glowTexture()} color="#ffd493" opacity={0.12} />
      <pointLight position={[0.8, 3.6, -2.4]} color="#ffe0b0" intensity={2.2} distance={7} decay={2} />
    </>
  );
};
