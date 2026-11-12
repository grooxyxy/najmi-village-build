import React, {useMemo} from 'react';
import * as THREE from 'three';
import {COLORS} from '../../data/theme';
import {
  Box,
  Cone,
  Cylinder,
  GlowSprite,
  Ico,
  Plane,
  UnlitPlane,
  type Vec3,
} from '../lib/primitives';
import {
  signTexture,
  glowTexture,
  roofTexture,
  stoneTexture,
  warmGlowTexture,
  waterTexture,
  windowGlowTexture,
  woodTexture,
} from '../lib/textures';
import {Smoke} from '../lib/particles';

const W = 5.6;
const D = 4.4;
const WALL_H = 3.0;
const ROOF_RISE = 1.35;

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

const BuildPart: React.FC<{
  at: number;
  progress: number;
  children: React.ReactNode;
}> = ({at, progress, children}) => {
  const t = smooth((progress - at) / 0.16);
  const alive = t > 0.002;
  const scale = alive ? 0.001 + t * 0.999 : 0.001;
  return (
    <group scale={[scale, scale, scale]} visible={alive}>
      {children}
    </group>
  );
};

export interface CabinProps {
  position?: Vec3;
  scale?: number;
  rotation?: Vec3;
  progress?: number;
  frame?: number;
  accent?: string;
  showSmoke?: boolean;
  cottage?: boolean;
}

export const Cabin: React.FC<CabinProps> = ({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  progress = 1,
  frame = 0,
  accent = '#3f7f78',
  showSmoke = true,
  cottage = false,
}) => {
  const p = Math.max(0, Math.min(1, progress));
  const gable = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2, 0);
    shape.lineTo(W / 2, 0);
    shape.lineTo(0, ROOF_RISE);
    shape.closePath();
    return shape;
  }, []);

  const wood = woodTexture([2, 1]);
  const planks = woodTexture([1, 2]);
  const stone = stoneTexture([2, 1]);
  const roof = roofTexture([3, 2]);

  return (
    <group position={position} scale={scale} rotation={rotation}>
      <BuildPart at={0} progress={p}>
        <Box
          size={[W + 0.4, 0.55, D + 0.4]}
          position={[0, 0.275, 0]}
          map={stone}
          color="#c7c3b4"
        />
        <Box
          size={[W + 0.7, 0.16, D + 0.7]}
          position={[0, 0.08, 0]}
          map={stone}
          color="#9a978a"
        />
      </BuildPart>

      <BuildPart at={0.09} progress={p}>
        <Box size={[W, WALL_H, 0.28]} position={[0, 0.55 + WALL_H / 2, -D / 2]} map={wood} color="#e6c196" />
        <Box size={[0.28, WALL_H, D]} position={[-W / 2, 0.55 + WALL_H / 2, 0]} map={planks} color="#d9ad7e" />
        <Box size={[0.28, WALL_H, D]} position={[W / 2, 0.55 + WALL_H / 2, 0]} map={planks} color="#d9ad7e" />
        <Box size={[W, WALL_H, 0.28]} position={[0, 0.55 + WALL_H / 2, D / 2]} map={wood} color="#e6c196" />
        {[
          [-W / 2, 0.55 + WALL_H / 2, -D / 2],
          [W / 2, 0.55 + WALL_H / 2, -D / 2],
          [-W / 2, 0.55 + WALL_H / 2, D / 2],
          [W / 2, 0.55 + WALL_H / 2, D / 2],
        ].map((corner, index) => (
          <Box
            key={`corner-${index}`}
            size={[0.24, WALL_H + 0.18, 0.24]}
            position={corner as Vec3}
            color={COLORS.woodDark}
          />
        ))}
        {[1.0, 2.7].map((y) => (
          <Box
            key={`band-${y}`}
            size={[W + 0.06, 0.1, 0.08]}
            position={[0, y, D / 2 + 0.16]}
            color={COLORS.woodDark}
          />
        ))}
        {[0.9, 1.7, 2.5].map((y) => (
          <Box
            key={`back-band-${y}`}
            size={[W + 0.06, 0.08, 0.07]}
            position={[0, y, -D / 2 - 0.16]}
            color={COLORS.woodDark}
          />
        ))}
      </BuildPart>

      <BuildPart at={0.34} progress={p}>
        <mesh position={[0, 0.55 + WALL_H, D / 2 + 0.02]}>
          <shapeGeometry args={[gable]} />
          <meshLambertMaterial color="#c48e5a" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.55 + WALL_H, -D / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
          <shapeGeometry args={[gable]} />
          <meshLambertMaterial color="#b98655" side={THREE.DoubleSide} />
        </mesh>
      </BuildPart>

      <BuildPart at={0.4} progress={p}>
        <Box
          size={[3.55, 0.24, D + 0.8]}
          position={[-1.35, 3.95, 0]}
          rotation={[0, 0, 0.53]}
          map={roof}
          color="#d2e0d0"
          flat
        />
        <Box
          size={[3.55, 0.24, D + 0.8]}
          position={[1.35, 3.95, 0]}
          rotation={[0, 0, -0.53]}
          map={roof}
          color="#c6d8c8"
          flat
        />
        <Box size={[0.22, 0.22, D + 0.9]} position={[0, 4.92, 0]} color={COLORS.roofDark} />
      </BuildPart>

      <BuildPart at={0.6} progress={p}>
        <group position={[0.95, 1.58, D / 2 + 0.16]}>
          <Box size={[1.3, 2.25, 0.12]} position={[0, 0, 0]} color={COLORS.woodDark} />
          <Box size={[1.08, 2.08, 0.1]} position={[0, 0, 0.07]} color={accent} />
          <Box size={[0.08, 1.85, 0.04]} position={[-0.26, -0.02, 0.14]} color="#2b5a55" />
          <Box size={[0.08, 1.85, 0.04]} position={[0.26, -0.02, 0.14]} color="#2b5a55" />
          <SphereHandle />
          <Box size={[1.5, 0.12, 0.55]} position={[0, -1.18, 0.22]} color="#8d806c" />
        </group>
        <Box size={[1.6, 0.18, 1.2]} position={[0.95, 0.36, D / 2 + 0.7]} color="#a67a4e" />
      </BuildPart>

      <BuildPart at={0.64} progress={p}>
        <group position={[-1.5, 2.3, D / 2 + 0.16]}>
          <Box size={[1.42, 1.02, 0.1]} position={[0, 0, 0]} color={COLORS.woodDark} />
          <UnlitPlane width={1.18} height={0.78} position={[0, 0, 0.06]} map={windowGlowTexture()} opacity={0.92} />
          <Box size={[0.06, 0.78, 0.06]} position={[0, 0, 0.1]} color={COLORS.woodDark} />
          <Box size={[1.18, 0.06, 0.06]} position={[0, 0, 0.1]} color={COLORS.woodDark} />
          <Box size={[1.5, 0.1, 0.18]} position={[0, -0.54, 0.06]} color={COLORS.woodDark} />
        </group>
        <group position={[W / 2 + 0.16, 2.3, 0.55]} rotation={[0, Math.PI / 2, 0]}>
          <Box size={[1.12, 0.92, 0.09]} position={[0, 0, 0]} color={COLORS.woodDark} />
          <UnlitPlane width={0.92} height={0.7} position={[0, 0, 0.06]} map={windowGlowTexture()} opacity={0.88} />
          <Box size={[0.05, 0.7, 0.05]} position={[0, 0, 0.1]} color={COLORS.woodDark} />
        </group>
      </BuildPart>

      <BuildPart at={0.78} progress={p}>
        <Box size={[0.78, 2.3, 0.78]} position={[-1.6, 3.15, -0.85]} map={stone} color="#c1bdae" />
        <Box size={[0.95, 0.16, 0.95]} position={[-1.6, 4.28, -0.85]} map={stone} color="#9e9b8d" />
        {showSmoke ? <Smoke frame={frame} position={[-1.6, 4.7, -0.85]} /> : null}
      </BuildPart>

      <BuildPart at={0.84} progress={p}>
        <group position={[0.95, 0.4, D / 2 + 1.35]}>
          <Box size={[3.0, 0.18, 1.5]} position={[0, 0, 0]} color="#9d7145" />
          {[-1.25, 1.25].map((x) => (
            <Box key={`porch-post-${x}`} size={[0.14, 2.0, 0.14]} position={[x, 1.0, 0.52]} color={COLORS.woodDark} />
          ))}
          <Box size={[2.85, 0.14, 0.9]} position={[0, 2.0, 0.2]} color={COLORS.roof} flat />
        </group>
      </BuildPart>

      <BuildPart at={0.9} progress={p}>
        <GlowSprite position={[1.85, 2.15, D / 2 + 0.7]} scale={0.62} map={warmGlowTexture()} opacity={0.55} />
        <mesh position={[1.85, 2.15, D / 2 + 0.7]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#ffd48a" toneMapped={false} />
        </mesh>
        <pointLight
          position={[1.85, 2.05, D / 2 + 1.0]}
          color="#ffc06a"
          intensity={2.5}
          distance={5}
          decay={2}
        />
      </BuildPart>

      {cottage ? (
        <BuildPart at={0.94} progress={p}>
          <group position={[-3.45, 0, -2.1]}>
            <Cylinder radiusTop={0.08} radiusBottom={0.1} height={1.8} segments={6} position={[0, 0.9, 0]} color={COLORS.woodDark} />
            <UnlitPlane
              width={1.7}
              height={0.55}
              position={[0, 1.7, 0.02]}
              map={signTexture('DESA NAJMI')}
            />
            <Box size={[0.08, 0.08, 0.5]} position={[0, 1.45, -0.1]} color={COLORS.woodDark} />
          </group>
        </BuildPart>
      ) : null}
    </group>
  );
};

const SphereHandle: React.FC = () => (
  <mesh position={[0.38, -0.05, 0.2]}>
    <sphereGeometry args={[0.075, 8, 8]} />
    <meshLambertMaterial color="#e0b25a" />
  </mesh>
);

export const Tree: React.FC<{
  position?: Vec3;
  scale?: number;
  kind?: 'broad' | 'pine';
  castShadow?: boolean;
  hue?: 'green' | 'olive' | 'dark';
}> = ({position = [0, 0, 0], scale = 1, kind = 'broad', castShadow = true, hue = 'green'}) => {
  const palette =
    hue === 'olive'
      ? ['#7c934e', '#6b8444', '#5a743b']
      : hue === 'dark'
        ? ['#3f663e', '#355839', '#2c4b33']
        : ['#5d8b45', '#4e7a3d', '#6b9850'];

  return (
    <group position={position} scale={scale}>
      <Cylinder
        radiusTop={0.13}
        radiusBottom={0.21}
        height={1.3}
        segments={6}
        position={[0, 0.65, 0]}
        color="#5b3a22"
        castShadow={castShadow}
      />
      {kind === 'pine' ? (
        <>
          <Cone radius={1.05} height={1.35} segments={7} position={[0, 1.45, 0]} color={palette[0]} castShadow={castShadow} />
          <Cone radius={0.82} height={1.15} segments={7} position={[0, 2.05, 0]} color={palette[1]} castShadow={castShadow} />
          <Cone radius={0.56} height={0.95} segments={7} position={[0, 2.6, 0]} color={palette[2]} castShadow={castShadow} />
        </>
      ) : (
        <>
          <Ico radius={0.95} detail={0} position={[0, 1.65, 0]} color={palette[0]} castShadow={castShadow} />
          <Ico radius={0.68} detail={0} position={[0.42, 2.2, 0.15]} color={palette[1]} castShadow={castShadow} />
          <Ico radius={0.58} detail={0} position={[-0.42, 2.28, -0.12]} color={palette[2]} castShadow={castShadow} />
        </>
      )}
    </group>
  );
};

export const Rock: React.FC<{position?: Vec3; scale?: number; color?: string}> = ({
  position = [0, 0, 0],
  scale = 1,
  color = '#8b8b7d',
}) => (
  <group position={position} scale={scale}>
    <Ico radius={0.55} detail={0} position={[0, 0.25, 0]} color={color} scale={[1.4, 0.65, 1]} castShadow />
    <Ico radius={0.3} detail={0} position={[0.5, 0.18, 0.2]} color="#75796d" scale={[1, 0.6, 1]} castShadow={false} />
  </group>
);

export const GrassTuft: React.FC<{position?: Vec3; scale?: number}> = ({
  position = [0, 0, 0],
  scale = 1,
}) => (
  <group position={position} scale={scale}>
    {[-0.08, 0, 0.09].map((x, index) => (
      <Cone
        key={`blade-${index}`}
        radius={0.07}
        height={0.42 + index * 0.06}
        segments={4}
        position={[x, 0.21, index * 0.03]}
        color={index === 1 ? '#7da54c' : '#5e8539'}
        castShadow={false}
      />
    ))}
  </group>
);

export const Fence: React.FC<{
  position?: Vec3;
  rotation?: Vec3;
  length?: number;
  color?: string;
}> = ({position = [0, 0, 0], rotation = [0, 0, 0], length = 6, color = '#8d6137'}) => {
  const posts = Math.max(2, Math.round(length / 1.4));
  return (
    <group position={position} rotation={rotation}>
      {Array.from({length: posts}, (_, index) => {
        const x = -length / 2 + (index / (posts - 1)) * length;
        return (
          <Box
            key={`post-${index}`}
            size={[0.16, 1.1, 0.16]}
            position={[x, 0.55, 0]}
            color={color}
            castShadow={false}
          />
        );
      })}
      {[0.42, 0.82].map((y) => (
        <Box
          key={`rail-${y}`}
          size={[length, 0.1, 0.1]}
          position={[0, y, 0]}
          color={color}
          castShadow={false}
        />
      ))}
    </group>
  );
};

export const Mountains: React.FC<{z?: number; frame?: number}> = ({z = -34}) => {
  const mountains: Array<{x: number; r: number; h: number; color: string; snow?: boolean}> = [
    {x: -25, r: 9, h: 11, color: '#78958c'},
    {x: -15, r: 11, h: 16, color: '#5f817c', snow: true},
    {x: -4, r: 8, h: 10, color: '#87a29a'},
    {x: 5, r: 12, h: 17, color: '#567a76', snow: true},
    {x: 16, r: 9, h: 12, color: '#78958c'},
    {x: 27, r: 12, h: 14, color: '#8aa39b'},
    {x: 38, r: 8, h: 9, color: '#92aaa1'},
  ];
  return (
    <group position={[0, 0, z]}>
      {mountains.map((mountain, index) => (
        <group key={`mountain-${index}`} position={[mountain.x, 0, -index * 0.7]}>
          <Cone
            radius={mountain.r}
            height={mountain.h}
            segments={6}
            position={[0, mountain.h / 2 - 0.4, 0]}
            color={mountain.color}
            castShadow={false}
            flat
          />
          {mountain.snow ? (
            <Cone
              radius={mountain.r * 0.36}
              height={mountain.h * 0.3}
              segments={6}
              position={[0, mountain.h * 0.86, 0]}
              color="#e9e7db"
              castShadow={false}
              flat
            />
          ) : null}
        </group>
      ))}
    </group>
  );
};

export const Clouds: React.FC<{frame?: number}> = ({frame = 0}) => {
  const cloudData = [
    {x: -18, y: 17, z: -27, s: 1.2},
    {x: -4, y: 20, z: -31, s: 0.85},
    {x: 11, y: 16.5, z: -26, s: 1.05},
    {x: 24, y: 21, z: -33, s: 0.9},
  ];
  return (
    <group>
      {cloudData.map((cloud, index) => (
        <group
          key={`cloud-${index}`}
          position={[cloud.x + Math.sin(frame / 260 + index) * 1.6, cloud.y, cloud.z]}
          scale={cloud.s}
        >
          <Ico radius={1.6} detail={0} position={[0, 0, 0]} color="#f8f0dd" scale={[2.1, 0.65, 1.1]} castShadow={false} flat={false} />
          <Ico radius={1.0} detail={0} position={[1.4, -0.18, 0.1]} color="#f2e8d4" scale={[1.4, 0.55, 0.9]} castShadow={false} flat={false} />
          <Ico radius={0.85} detail={0} position={[-1.2, -0.2, -0.15]} color="#fbf5e7" scale={[1.35, 0.5, 0.85]} castShadow={false} flat={false} />
        </group>
      ))}
    </group>
  );
};

export const Sun: React.FC<{position?: Vec3}> = ({position = [18, 18, -34]}) => (
  <group position={position}>
    <mesh>
      <sphereGeometry args={[2.1, 16, 16]} />
      <meshBasicMaterial color="#fff4c8" toneMapped={false} />
    </mesh>
    <GlowSprite scale={13} map={glowTexture()} color="#ffe8a0" opacity={0.65} />
    <GlowSprite scale={6} map={warmGlowTexture()} color="#fff0b0" opacity={0.85} />
  </group>
);

export const Signpost: React.FC<{position?: Vec3; text?: string; rotation?: number}> = ({
  position = [0, 0, 0],
  text = 'DESA NAJMI',
  rotation = 0,
}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Cylinder radiusTop={0.1} radiusBottom={0.12} height={2.3} segments={6} position={[0, 1.15, 0]} color={COLORS.woodDark} />
    <UnlitPlane width={2.4} height={0.75} position={[0, 2.0, 0.08]} map={signTexture(text)} />
    <Box size={[0.09, 0.09, 0.55]} position={[0, 1.7, -0.18]} color={COLORS.woodDark} />
  </group>
);

export const Path: React.FC<{
  position?: Vec3;
  rotation?: number;
  length?: number;
  width?: number;
}> = ({position = [0, 0, 0], rotation = 0, length = 12, width = 2.4}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Plane
      width={width}
      height={length}
      position={[0, 0.025, 0]}
      color="#b18a5d"
      map={stoneTexture([1, 3])}
      rotation={[-Math.PI / 2, 0, 0]}
    />
    {Array.from({length: 12}, (_, index) => (
      <Box
        key={`path-stone-${index}`}
        size={[0.25, 0.08, 0.18]}
        position={[
          Math.sin(index * 4.1) * (width / 2 - 0.2),
          0.06,
          -length / 2 + (index / 11) * length,
        ]}
        rotation={[0, index * 0.9, 0]}
        color={index % 2 === 0 ? '#8e8a7c' : '#a19d8f'}
        castShadow={false}
      />
    ))}
  </group>
);

export const River: React.FC<{frame: number; position?: Vec3; rotation?: number}> = ({
  frame,
  position = [-7, 0.02, -15],
  rotation = 0.18,
}) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <Plane width={7.5} height={34} position={[0, 0, 0]} color="#5aaec2" map={waterTexture()} rotation={[-Math.PI / 2, 0, 0]} />
    {Array.from({length: 7}, (_, index) => (
      <Box
        key={`foam-${index}`}
        size={[0.9 - index * 0.06, 0.015, 0.045]}
        position={[
          -2.4 + ((index * 3.2 + frame * 0.006) % 5.2),
          0.04,
          -12 + index * 4.1,
        ]}
        color="#d5f3ef"
        castShadow={false}
      />
    ))}
    {Array.from({length: 8}, (_, index) => (
      <Box
        key={`bank-${index}`}
        size={[0.55, 0.2, 0.7]}
        position={[-4.0 + (index % 2) * 8.0, 0.08, -14 + index * 4]}
        rotation={[0, index * 0.6, 0]}
        color={index % 2 === 0 ? '#9a9b89' : '#858b7b'}
        castShadow={false}
      />
    ))}
  </group>
);

export const VillageMarker: React.FC<{position?: Vec3; active?: boolean; frame?: number}> = ({
  position = [0, 0, 0],
  active = false,
  frame = 0,
}) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.25, 2.42, 32]} />
      <meshBasicMaterial color={active ? '#8ef0d0' : '#7fe7ff'} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.95, 3.05, 32]} />
      <meshBasicMaterial color="#7fe7ff" transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
    <GlowSprite position={[0, 0.15, 0]} scale={4.6} map={glowTexture()} color="#7fe7ff" opacity={0.25 + Math.sin(frame / 18) * 0.08} />
  </group>
);
