import type * as React from 'react';
import {useMemo} from 'react';
import * as THREE from 'three';
import {glowTexture, warmGlowTexture} from './textures';
import type {Vec3} from './primitives';

const seeded = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

export const DustMotes: React.FC<{
  frame: number;
  count?: number;
  area?: Vec3;
  origin?: Vec3;
  color?: string;
  size?: number;
  opacity?: number;
  drift?: number;
}> = ({
  frame,
  count = 48,
  area = [8, 5, 7],
  origin = [0, 2.5, 0],
  color = '#ffe6b0',
  size = 0.035,
  opacity = 0.55,
  drift = 1,
}) => {
  const positions = useMemo(() => {
    const random = seeded(83);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (random() - 0.5) * area[0];
      array[i * 3 + 1] = random() * area[1];
      array[i * 3 + 2] = (random() - 0.5) * area[2];
    }
    return array;
  }, [count, area[0], area[1], area[2]]);

  const wobble = Math.sin(frame / 95) * 0.12 * drift;

  return (
    <points position={[origin[0] + wobble, origin[1], origin[2]]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTexture()}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export const Embers: React.FC<{frame: number; position?: Vec3; count?: number}> = ({
  frame,
  position = [0, 0.4, 0],
  count = 22,
}) => {
  const positions = useMemo(() => {
    const random = seeded(57);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (random() - 0.5) * 0.7;
      array[i * 3 + 1] = random() * 1.1;
      array[i * 3 + 2] = (random() - 0.5) * 0.35;
    }
    return array;
  }, [count]);

  const flicker = 0.55 + Math.sin(frame / 6) * 0.15 + Math.sin(frame / 13) * 0.08;

  return (
    <points position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={warmGlowTexture()}
        color="#ff9a3c"
        size={0.075}
        sizeAttenuation
        transparent
        opacity={flicker}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export const Sparkles: React.FC<{
  frame: number;
  position?: Vec3;
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  opacity?: number;
}> = ({
  frame,
  position = [0, 1, 0],
  count = 30,
  radius = 2,
  color = '#d8fbff',
  size = 0.06,
  opacity = 0.8,
}) => {
  const positions = useMemo(() => {
    const random = seeded(101);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const r = 0.3 + random() * radius;
      array[i * 3] = Math.cos(angle) * r;
      array[i * 3 + 1] = random() * 3.5;
      array[i * 3 + 2] = Math.sin(angle) * r;
    }
    return array;
  }, [count, radius]);

  return (
    <points position={position} rotation={[0, frame / 240, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={glowTexture()}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity * (0.75 + Math.sin(frame / 20) * 0.2)}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export const Smoke: React.FC<{frame: number; position?: Vec3}> = ({
  frame,
  position = [0, 5, 0],
}) => {
  const puffs = [0, 1, 2, 3];
  return (
    <group position={position}>
      {puffs.map((puff) => {
        const phase = ((frame / 120 + puff / puffs.length) % 1 + 1) % 1;
        return (
          <mesh
            key={puff}
            position={[Math.sin(phase * Math.PI * 2 + puff) * 0.35, phase * 2.6, 0]}
            scale={0.25 + phase * 0.55}
          >
            <icosahedronGeometry args={[0.55, 0]} />
            <meshBasicMaterial
              color="#f1eadc"
              transparent
              opacity={0.24 * (1 - phase)}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};
