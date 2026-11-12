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
  type Vec3,
} from '../lib/primitives';
import {DustMotes} from '../lib/particles';
import {CharacterActor, LyingSprite} from '../lib/PixelSprite';
import {warmGlowTexture, windowGlowTexture, woodTexture} from '../lib/textures';

const cameraKeys: CameraKey[] = [
  {f: 0, position: [10, 14, 12], target: [-1, 1.5, -1], fov: 40},
  {f: 240, position: [9, 12.5, 10.5], target: [1.0, 1.2, 0], fov: 38},
  {f: 420, position: [6.4, 8.2, 7.2], target: [2.3, 1.1, 0.4], fov: 32},
  {f: 660, position: [8.5, 11.5, 10], target: [2.2, 1.2, 0.5], fov: 37},
  {f: 900, position: [9.2, 13, 11], target: [2.4, 1.2, 0.2], fov: 38},
  {f: 1050, position: [6.5, 9.2, 8.2], target: [4.4, 1.7, -3.4], fov: 34},
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
const segment = (frame: number, start: number, end: number) =>
  smooth((frame - start) / Math.max(1, end - start));

const BookStack: React.FC<{position: Vec3}> = ({position}) => (
  <group position={position} rotation={[0, -0.2, 0]}>
    <Box size={[0.55, 0.1, 0.4]} position={[0, 0.05, 0]} color="#6d5b8e" />
    <Box size={[0.52, 0.09, 0.38]} position={[0.04, 0.145, 0.03]} color="#b06a5d" />
    <Box size={[0.48, 0.08, 0.36]} position={[-0.03, 0.23, -0.02]} color="#4c7b76" />
  </group>
);

const Laptop: React.FC = () => (
  <group position={[-3.6, 1.14, -2.4]}>
    <Box size={[1.35, 0.06, 0.9]} position={[0, 0.03, 0]} color="#2b3038" />
    <Box size={[1.28, 0.02, 0.78]} position={[0, 0.07, 0.03]} color="#161a20" />
    <group position={[0, 0.07, -0.46]} rotation={[-0.18, 0, 0]}>
      <Box size={[1.35, 0.82, 0.06]} position={[0, 0.39, 0]} color="#2b3038" />
      <UnlitPlane
        width={1.2}
        height={0.68}
        position={[0, 0.39, 0.041]}
        color="#3a6687"
        opacity={0.95}
      />
      <Box size={[0.8, 0.035, 0.02]} position={[0, 0.48, 0.055]} color="#8fd4ff" />
      <Box size={[0.58, 0.03, 0.02]} position={[-0.1, 0.37, 0.055]} color="#6fb5d8" />
      <Box size={[0.42, 0.03, 0.02]} position={[-0.18, 0.27, 0.055]} color="#6fb5d8" />
      <GlowSprite
        position={[0, 0.39, 0.1]}
        scale={1.7}
        map={warmGlowTexture()}
        color="#70c7ff"
        opacity={0.13}
      />
    </group>
    <pointLight position={[0, 0.7, 0.4]} color="#7cc8ff" intensity={3.5} distance={5} decay={2} />
  </group>
);

const Bed: React.FC = () => (
  <group>
    <Box size={[4.25, 0.45, 2.85]} position={[2.1, 0.225, 0]} color="#5b3b25" />
    <Box size={[4.0, 0.32, 2.6]} position={[2.1, 0.58, 0]} color="#e9ddc5" />
    <Box size={[4.05, 0.48, 0.2]} position={[2.1, 0.58, -1.5]} color="#794c2e" />
    <Box size={[4.3, 1.0, 0.18]} position={[2.1, 0.8, -1.7]} color="#8d5a35" />
    <Box size={[1.55, 0.22, 0.72]} position={[2.1, 0.84, -0.95]} color="#f3e9d5" />
    <Box size={[2.6, 0.16, 1.25]} position={[2.1, 0.82, 0.78]} color="#b9684c" />
    <Box size={[2.6, 0.1, 0.18]} position={[2.1, 0.9, 1.36]} color="#d89568" />
    <Box size={[0.35, 0.055, 0.65]} position={[2.95, 0.94, 0.2]} rotation={[0, 0.35, 0]} color="#24262d" />
    <UnlitPlane
      width={0.24}
      height={0.5}
      position={[2.97, 0.967, 0.17]}
      rotation={[-Math.PI / 2, 0.35, 0]}
      color="#9fe3ff"
      opacity={0.9}
    />
    <GlowSprite
      position={[2.97, 1.06, 0.17]}
      scale={0.7}
      map={warmGlowTexture()}
      color="#9fe3ff"
      opacity={0.24}
    />
    <pointLight position={[2.9, 1.35, 0.2]} color="#8fd4ff" intensity={2.2} distance={3.2} decay={2} />
  </group>
);

const Desk: React.FC = () => (
  <group>
    <Box size={[3.6, 0.16, 1.65]} position={[-3.7, 1.05, -2.5]} color="#9a6b41" />
    {[-5.35, -2.05].map((x) => (
      <Box key={`desk-back-${x}`} size={[0.14, 1.0, 0.14]} position={[x, 0.52, -3.18]} color="#6f4a2d" />
    ))}
    {[-5.35, -2.05].map((x) => (
      <Box key={`desk-front-${x}`} size={[0.14, 1.0, 0.14]} position={[x, 0.52, -1.82]} color="#6f4a2d" />
    ))}
    <Box size={[3.2, 0.08, 0.5]} position={[-3.7, 0.72, -2.5]} color="#7d522f" />
    <Laptop />
    <BookStack position={[-5.0, 1.15, -2.65]} />
    <Cylinder radiusTop={0.15} radiusBottom={0.13} height={0.28} segments={10} position={[-2.6, 1.28, -2.3]} color="#e8e0cf" />
    <Box size={[0.5, 0.06, 0.4]} position={[-4.55, 1.14, -2.0]} rotation={[0, 0.3, 0]} color="#d9c9a5" />
    <Box size={[0.55, 0.055, 0.42]} position={[-4.3, 1.15, -2.15]} rotation={[0, -0.15, 0]} color="#f2e7d1" />
    <Cylinder radiusTop={0.22} radiusBottom={0.25} height={0.08} segments={10} position={[-2.9, 1.17, -2.9]} color="#b45b4b" />
    <Box size={[0.45, 0.18, 0.45]} position={[-3.3, 1.2, -2.2]} rotation={[0, 0.2, 0]} color="#c8b07a" />
    <group position={[-3.7, 0, -1.35]}>
      <Box size={[0.95, 0.14, 0.9]} position={[0, 0.55, 0]} color="#765034" />
      <Box size={[0.9, 0.85, 0.12]} position={[0, 0.98, 0.4]} rotation={[0.12, 0, 0]} color="#8a5d3b" />
      {[-0.34, 0.34].map((x) => (
        <Box key={`chair-leg-${x}`} size={[0.09, 0.55, 0.09]} position={[x, 0.28, 0.28]} color="#5a3b25" />
      ))}
    </group>
  </group>
);

const Room: React.FC = () => (
  <group>
    <Plane width={13.5} height={10.5} position={[0, 0, 0]} color="#d2c2a8" map={woodTexture([4, 3])} />
    <Box size={[13.5, 5.6, 0.28]} position={[0, 2.8, -5.05]} color={COLORS.bedroomWall} />
    <Box size={[0.28, 5.6, 10.5]} position={[-6.55, 2.8, 0]} color={COLORS.bedroomWallDark} />
    <Box size={[13.5, 0.32, 0.42]} position={[0, 0.16, -4.82]} color="#7f5c3d" />
    <Box size={[0.42, 0.32, 10.5]} position={[-6.35, 0.16, 0]} color="#7f5c3d" />
    <Box size={[13.5, 0.16, 0.16]} position={[0, 1.65, -4.86]} color="#8d6a4c" />

    <group position={[-3.8, 3.15, -4.88]}>
      <Box size={[2.6, 1.9, 0.16]} position={[0, 0, 0]} color="#65452d" />
      <UnlitPlane width={2.32} height={1.62} position={[0, 0, 0.1]} map={windowGlowTexture()} opacity={0.96} />
      <Box size={[0.08, 1.62, 0.08]} position={[0, 0, 0.17]} color="#65452d" />
      <Box size={[2.32, 0.08, 0.08]} position={[0, 0, 0.17]} color="#65452d" />
      <Box size={[2.7, 0.12, 0.55]} position={[0, -1.0, 0.2]} color="#a2774f" />
    </group>
    <group position={[-5.7, 3.15, -4.7]}>
      <Box size={[0.8, 3.0, 0.4]} position={[0, 0, 0]} color="#d7c7ab" />
      <Box size={[0.18, 2.8, 0.42]} position={[0.35, 0, 0.03]} color="#c0ae90" />
    </group>
    <group position={[-1.9, 3.15, -4.7]}>
      <Box size={[0.8, 3.0, 0.4]} position={[0, 0, 0]} color="#d7c7ab" />
      <Box size={[0.18, 2.8, 0.42]} position={[-0.35, 0, 0.03]} color="#c0ae90" />
    </group>

    <group position={[4.25, 1.5, -4.94]}>
      <Box size={[1.55, 3.0, 0.18]} position={[0, 0, 0]} color="#583d28" />
      <Box size={[1.3, 2.8, 0.12]} position={[0, -0.03, 0.12]} color="#7f5b3a" />
      <mesh position={[0.42, -0.1, 0.22]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshLambertMaterial color="#d9b268" />
      </mesh>
      <Box size={[1.75, 0.12, 0.4]} position={[0, -1.55, 0.18]} color="#4a3322" />
      <UnlitPlane width={1.2} height={0.03} position={[0, -1.47, 0.22]} color="#ffc46b" opacity={0.55} />
    </group>

    <group position={[-6.36, 3.2, 1.0]} rotation={[0, Math.PI / 2, 0]}>
      <Box size={[1.8, 2.35, 0.08]} position={[0, 0, 0]} color="#3d3a48" />
      <Box size={[1.6, 2.15, 0.06]} position={[0, 0, 0.06]} color="#d6a356" />
      <Box size={[1.2, 1.55, 0.05]} position={[0, 0.1, 0.1]} color="#7e4f3c" />
      <Box size={[0.7, 0.7, 0.05]} position={[0.25, 0.35, 0.14]} color="#e8d2a4" />
    </group>

    <group position={[-6.35, 2.0, -2.6]}>
      <Box size={[2.4, 0.12, 0.9]} position={[0, 0, 0]} color="#734b2e" />
      {[-0.85, 0.85].map((x) => (
        <Box key={`shelf-${x}`} size={[0.12, 0.65, 0.8]} position={[x, -0.35, 0]} color="#5d3d25" />
      ))}
      <Box size={[0.5, 0.35, 0.25]} position={[-0.7, 0.24, 0]} color="#a35d4e" />
      <Box size={[0.4, 0.28, 0.3]} position={[0.0, 0.2, 0.1]} color="#4e7c73" />
      <Ico radius={0.22} detail={0} position={[0.72, 0.25, 0]} color="#c9a25b" castShadow={false} />
    </group>

    <UnlitPlane
      width={1.5}
      height={4.2}
      position={[-3.5, 2.0, -2.3]}
      rotation={[0.55, 0.15, 0]}
      map={warmGlowTexture()}
      color="#ffe3ad"
      opacity={0.12}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  </group>
);

export const BedroomScene: React.FC<{frame: number}> = ({frame}) => {
  const pose = sampleCamera(cameraKeys, frame);
  const lyingOut = segment(frame, 770, 810);
  const standingIn = segment(frame, 770, 810);
  const walk = segment(frame, 930, 1030);
  const walking = frame >= 930 && frame < 1036;

  const standingPose =
    frame < 870 ? SPRITES.sad : SPRITES.surprised;
  const walkPose = [
    SPRITES.backWalk1,
    SPRITES.backWalk2,
    SPRITES.backWalk3,
    SPRITES.backWalk4,
  ][Math.floor(frame / 7) % 4];
  const sprite = walking ? walkPose : frame >= 1030 ? SPRITES.back : standingPose;
  const wakeJump =
    frame >= 778 && frame < 834
      ? Math.sin(((frame - 778) / 56) * Math.PI) * 0.075
      : 0;

  const characterX = 4.55 + walk * 0.32;
  const characterZ = 1.15 - walk * 5.15;

  return (
    <>
      <CameraRig frame={frame} pose={pose} />
      <RendererLights />

      <Room />
      <Desk />
      <Bed />

      <group position={[0.2, 0.02, 2.25]} rotation={[0, 0.3, 0]}>
        <Box size={[1.5, 0.08, 0.9]} position={[0, 0, 0]} color="#c4b08a" />
        <Box size={[1.4, 0.03, 0.8]} position={[0, 0.06, 0]} color="#a34f45" />
      </group>
      <group position={[-1.4, 0.02, 2.9]} rotation={[0, -0.5, 0]}>
        <Box size={[1.15, 0.05, 0.55]} position={[0, 0, 0]} color="#4f6c8a" />
        <Box size={[0.85, 0.05, 0.38]} position={[0.3, 0.06, 0.2]} color="#d5b36d" />
      </group>
      <group position={[4.9, 0.2, 3.4]} rotation={[0, -0.3, 0]}>
        <Ico radius={0.45} detail={0} position={[0, 0.35, 0]} color="#6d5d4a" scale={[0.9, 1.2, 0.7]} />
        <Box size={[0.45, 0.5, 0.2]} position={[0, 0.65, -0.05]} color="#4a5e52" />
      </group>

      <LyingSprite
        src={SPRITES.phone}
        width={1.02}
        opacity={1 - lyingOut}
        rotationZ={0.04 + Math.sin(frame / 52) * 0.008}
        position={[2.1, 0.974 + Math.sin(frame / 48) * 0.006, 0.15]}
      />

      <CharacterActor
        src={sprite}
        frame={frame}
        position={[characterX, 0, characterZ]}
        height={1.75}
        opacity={standingIn}
        walking={walking}
        walkSpeed={5.6}
        phase={0.4}
        jump={wakeJump}
        shadowRadius={0.48}
        shadowOpacity={0.22}
      />

      <DustMotes frame={frame} count={34} area={[10, 4.2, 8]} origin={[0, 2.5, 0]} opacity={0.38} />
    </>
  );
};

const RendererLights: React.FC = () => (
  <>
    <ambientLight intensity={0.65} color="#ffe3c4" />
    <hemisphereLight args={['#ffd8a6', '#5b4635', 0.75]} />
    <directionalLight
      position={[-7.5, 9.5, 5.5]}
      intensity={2.4}
      color="#ffd7a5"
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
      shadow-camera-near={1}
      shadow-camera-far={30}
      shadow-bias={-0.0005}
    />
    <pointLight position={[-3.7, 2.0, -2.4]} color="#ffb06a" intensity={2.0} distance={5} decay={2} />
  </>
);
