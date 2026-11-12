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

export const CameraRig: React.FC<{
  pose: CameraPose;
  frame: number;
  shake?: number;
  roll?: number;
  handheld?: number;
  offset?: [number, number, number];
}> = ({pose, frame, shake = 0, roll = 0, handheld = 0, offset = [0, 0, 0]}) => {
  const {camera} = useThree();

  useLayoutEffect(() => {
    const n1 = Math.sin(frame * 0.73 + 1.3) * 0.7 + Math.sin(frame * 1.91 + 4.1) * 0.3;
    const n2 = Math.sin(frame * 0.61 + 2.8) * 0.6 + Math.sin(frame * 2.17 + 1.7) * 0.4;
    const n3 = Math.sin(frame * 0.53 + 5.2) * 0.65 + Math.sin(frame * 1.37 + 2.4) * 0.35;
    const driftX = handheld * n1;
    const driftY = handheld * n2 * 0.55;
    const driftZ = handheld * n3 * 0.35;
    const joltX = shake * n1;
    const joltY = shake * n2;
    const joltZ = shake * n3 * 0.5;
    camera.position.set(
      pose.position[0] + offset[0] + driftX + joltX,
      pose.position[1] + offset[1] + driftY + joltY,
      pose.position[2] + offset[2] + driftZ + joltZ,
    );
    camera.lookAt(
      new THREE.Vector3(
        pose.target[0] + shake * n2 * 0.35,
        pose.target[1] + shake * n1 * 0.22,
        pose.target[2],
      ),
    );
    camera.rotation.z += roll + handheld * 0.0018 * n3 + shake * 0.008 * n1;
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = pose.fov;
      camera.near = 0.1;
      camera.far = 260;
      camera.updateProjectionMatrix();
    }
  }, [frame, camera, pose.position, pose.target, pose.fov, shake, roll, handheld, offset]);

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
