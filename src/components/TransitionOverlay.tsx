import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FPS} from '../data/script';

const range = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input.map((value) => value * FPS), output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const TransitionOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  const startFade = range(frame, [0, 1.2], [1, 0]);
  const s1Fade = range(frame, [34.2, 34.9, 35.0, 35.7], [0, 1, 1, 0]);
  const portalFlash = range(frame, [69.5, 69.85, 70.0, 70.45], [0, 0.92, 0.92, 0]);
  const windowFlash = range(frame, [99.45, 99.8, 100.0, 100.3, 100.7], [0, 0.75, 0.85, 0.35, 0]);
  const systemFlash = range(frame, [109.55, 109.8, 110.0, 110.35], [0, 0.55, 0.55, 0]);
  const scene4Blink = range(frame, [154.2, 154.5, 155.0, 155.65], [0, 0.55, 0.55, 0]);
  const endFade = range(frame, [215.0, 216.0], [0, 1]);

  const black = Math.max(startFade, s1Fade, scene4Blink, endFade);
  const flash = Math.max(portalFlash, windowFlash, systemFlash);

  return (
    <>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 48%, rgba(3, 5, 8, 0.38) 100%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(3, 5, 8, ${black})`,
          zIndex: 45,
          pointerEvents: 'none',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(213, 250, 255, ${flash})`,
          zIndex: 46,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          background: 'rgba(127, 231, 255, 0.08)',
          zIndex: 47,
        }}
      />
    </>
  );
};
