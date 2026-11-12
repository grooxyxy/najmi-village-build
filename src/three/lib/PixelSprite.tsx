import {useLoader} from '@react-three/fiber';
import type * as React from 'react';
import {useLayoutEffect} from 'react';
import {staticFile} from 'remotion';
import * as THREE from 'three';
import {BlobShadow, type Vec3} from './primitives';

const prepareTexture = (texture: THREE.Texture) => {
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
};

export const usePixelTexture = (src: string): THREE.Texture => {
  const texture = useLoader(THREE.TextureLoader, staticFile(src));
  useLayoutEffect(() => {
    prepareTexture(texture);
  }, [texture]);
  return texture;
};

export const PixelSprite: React.FC<{
  src: string;
  position?: Vec3;
  height?: number;
  flip?: boolean;
  opacity?: number;
  color?: string;
  depthWrite?: boolean;
}> = ({
  src,
  position = [0, 0.9, 0],
  height = 1.75,
  flip = false,
  opacity = 1,
  color = '#ffffff',
  depthWrite = true,
}) => {
  const texture = usePixelTexture(src);
  const image = texture.image as {width?: number; height?: number} | undefined;
  const aspect = (image?.width ?? 48) / (image?.height ?? 64);

  return (
    <sprite position={position} scale={[height * aspect * (flip ? -1 : 1), height, 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        alphaTest={0.35}
        opacity={opacity}
        depthWrite={depthWrite}
        toneMapped={false}
      />
    </sprite>
  );
};

/**
 * Grounded character wrapper with a small amount of procedural life: idle
 * breathing, a weight shift, a walk bob and a reactive jump. The sprite texture
 * itself stays nearest-neighbour crisp; only the billboard transform moves.
 */
export const CharacterActor: React.FC<{
  src: string;
  frame: number;
  position?: Vec3;
  height?: number;
  flip?: boolean;
  opacity?: number;
  color?: string;
  walking?: boolean;
  walkSpeed?: number;
  phase?: number;
  jump?: number;
  lean?: number;
  shadow?: boolean;
  shadowRadius?: number;
  shadowOpacity?: number;
}> = ({
  src,
  frame,
  position = [0, 0, 0],
  height = 1.75,
  flip = false,
  opacity = 1,
  color = '#ffffff',
  walking = false,
  walkSpeed = 5.2,
  phase = 0,
  jump = 0,
  lean = 0,
  shadow = true,
  shadowRadius = 0.48,
  shadowOpacity = 0.22,
}) => {
  const stride = Math.sin(frame / walkSpeed + phase);
  const step = walking ? Math.abs(stride) * 0.035 : 0;
  const breath = walking ? 0 : Math.sin(frame / 42 + phase) * 0.012;
  const bob = jump + step + Math.max(0, breath) * 0.5;
  const tilt = lean + (walking ? stride * 0.028 : Math.sin(frame / 78 + phase) * 0.006);
  const scaleY = 1 + (walking ? Math.abs(stride) * 0.012 : breath * 0.55);
  const lift = Math.max(0, jump);

  return (
    <group position={position}>
      <group position={[0, bob, 0]} rotation={[0, 0, tilt]} scale={[1, scaleY, 1]}>
        <PixelSprite
          src={src}
          position={[0, height / 2, 0]}
          height={height}
          flip={flip}
          opacity={opacity}
          color={color}
        />
      </group>
      {shadow ? (
        <BlobShadow
          position={[0, 0.015, 0]}
          radius={shadowRadius * (1 - Math.min(0.28, lift * 0.5))}
          opacity={shadowOpacity * opacity * (1 - Math.min(0.55, lift * 1.4))}
        />
      ) : null}
    </group>
  );
};

export const LyingSprite: React.FC<{
  src: string;
  position?: Vec3;
  width?: number;
  opacity?: number;
  rotationZ?: number;
}> = ({src, position = [0, 1.15, 0], width = 1.9, opacity = 1, rotationZ = 0}) => {
  const texture = usePixelTexture(src);
  const image = texture.image as {width?: number; height?: number} | undefined;
  const aspect = (image?.width ?? 64) / (image?.height ?? 40);

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, rotationZ]}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.35}
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite
        toneMapped={false}
      />
    </mesh>
  );
};

export const PixelPoster: React.FC<{
  src: string;
  position?: Vec3;
  width?: number;
  rotation?: Vec3;
  opacity?: number;
}> = ({src, position = [0, 2, 0], width = 1.2, rotation = [0, 0, 0], opacity = 1}) => {
  const texture = usePixelTexture(src);
  const image = texture.image as {width?: number; height?: number} | undefined;
  const aspect = (image?.width ?? 48) / (image?.height ?? 64);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.35}
        opacity={opacity}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};
