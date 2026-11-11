import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../data/theme';
import {FPS, getActiveLine} from '../data/script';

const speakerLabel: Record<string, string> = {
  Narrator: 'NARATOR',
  Najmi: 'NAJMI',
  System: 'SYSTEM',
};

const speakerColor: Record<string, string> = {
  Narrator: COLORS.creamDim,
  Najmi: COLORS.gold,
  System: COLORS.cyan,
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = getActiveLine(frame);
  const phoneActive = frame >= 12.8 * FPS && frame <= 25.2 * FPS;

  if (!line || frame >= 212.4 * FPS) {
    return null;
  }

  const start = line.displayStart * FPS;
  const end = line.displayEnd * FPS;
  const fadeFrames = Math.min(9, Math.max(3, (end - start) / 3));
  const opacity = interpolate(
    frame,
    [start, start + fadeFrames, end - fadeFrames, end],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const isSystem = line.speaker === 'System';
  const isNarrator = line.speaker === 'Narrator';
  const long = line.text.length > 96;
  const fontSize = isSystem ? (long ? 32 : 36) : long ? 36 : 42;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: phoneActive ? 'flex-start' : 'center',
        paddingBottom: 56,
        paddingLeft: phoneActive ? 120 : 0,
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: phoneActive ? 900 : 1500,
          minWidth: 460,
          padding: '16px 30px 20px',
          borderRadius: 12,
          background: 'rgba(8, 10, 15, 0.78)',
          border: `1px solid ${isSystem ? 'rgba(127, 231, 255, 0.28)' : 'rgba(246, 234, 211, 0.14)'}`,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(4px)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 16,
            letterSpacing: '0.2em',
            color: speakerColor[line.speaker],
            marginBottom: 6,
            opacity: isNarrator ? 0.72 : 0.95,
          }}
        >
          {speakerLabel[line.speaker]}
        </div>
        <div
          style={{
            fontFamily: isSystem ? FONTS.mono : FONTS.body,
            fontSize,
            lineHeight: 1.42,
            color: isSystem ? '#c8f6ff' : COLORS.cream,
            fontStyle: isNarrator ? 'italic' : 'normal',
            fontWeight: isSystem ? 600 : 500,
            textShadow: '0 2px 12px rgba(0,0,0,0.65)',
            letterSpacing: isSystem ? '0.02em' : '0.005em',
          }}
        >
          {line.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
