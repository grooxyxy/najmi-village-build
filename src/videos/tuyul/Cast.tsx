import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {BlobShadow, type Vec3} from '../../three/lib/primitives';
import {CANVAS_H, CANVAS_W} from './toon';

type DrawFn = (ctx: CanvasRenderingContext2D, time: number, frame: number) => void;

/**
 * A billboard that redraws its canvas every frame. The canvas is the character;
 * the sprite keeps it facing the camera, exactly like the cartoon-card look.
 */
export const ToonActor: React.FC<{
  draw: DrawFn;
  position: Vec3;
  height: number;
  flip?: boolean;
  opacity?: number;
  shadow?: boolean;
  shadowRadius?: number;
}> = ({draw, position, height, flip = false, opacity = 1, shadow = true, shadowRadius = 0.55}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const canvas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = CANVAS_W;
    c.height = CANVAS_H;
    return c;
  }, []);
  const texture = useMemo(() => {
    if (!canvas) return null;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }, [canvas]);
  const drawn = useRef(-1);

  useLayoutEffect(() => {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    draw(ctx, frame / fps, frame);
    ctx.restore();
    texture.needsUpdate = true;
    drawn.current = frame;
  }, [canvas, texture, frame, fps, draw]);

  if (!texture) return null;
  const aspect = CANVAS_W / CANVAS_H;
  return (
    <group position={position}>
      {shadow ? <BlobShadow position={[0, 0.012, 0]} radius={shadowRadius * height} opacity={0.42} /> : null}
      <sprite scale={[height * aspect * (flip ? -1 : 1), height, 1]} position={[0, height / 2, 0]}>
        <spriteMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          opacity={opacity}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
};
