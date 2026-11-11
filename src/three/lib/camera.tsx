import {useThree} from '@react-three/fiber';
import type * as React from 'react';
import {useLayoutEffect} from 'react';
import * as THREE from 'three';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

export const mix3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

export const CameraRig: React.FC<{pose: CameraPose; frame: number}> = ({pose, frame}) => {
  const {camera} = useThree();

  useLayoutEffect(() => {
    camera.position.set(...pose.position);
    camera.lookAt(new THREE.Vector3(...pose.target));
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = pose.fov;
      camera.near = 0.1;
      camera.far = 260;
      camera.updateProjectionMatrix();
    }
  }, [frame, camera, pose.position, pose.target, pose.fov]);

  return null;
};

export const RendererSettings: React.FC = () => {
  const {gl} = useThree();

  useLayoutEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.02;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.setPixelRatio(1);
  }, [gl]);

  return null;
};

export interface CameraKey {
  f: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const smoothStep = (t: number): number => {
  const value = Math.max(0, Math.min(1, t));
  return value * value * (3 - 2 * value);
};

export const sampleCamera = (keys: CameraKey[], frame: number): CameraPose => {
  if (keys.length === 0) {
    return {position: [12.5, 24, 18.5], target: [0, 1, 0], fov: 36};
  }
  if (frame <= keys[0].f) {
    return keys[0];
  }
  for (let index = 0; index < keys.length - 1; index += 1) {
    const a = keys[index];
    const b = keys[index + 1];
    if (frame >= a.f && frame <= b.f) {
      const t = smoothStep((frame - a.f) / Math.max(1, b.f - a.f));
      return {
        position: mix3(a.position, b.position, t),
        target: mix3(a.target, b.target, t),
        fov: mix(a.fov, b.fov, t),
      };
    }
  }
  return keys[keys.length - 1];
};
