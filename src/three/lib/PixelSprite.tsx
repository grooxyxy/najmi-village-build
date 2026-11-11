import {useLoader} from '@react-three/fiber';
import type * as React from 'react';
import {useLayoutEffect} from 'react';
import {staticFile} from 'remotion';
import * as THREE from 'three';
import type {Vec3} from './primitives';

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
