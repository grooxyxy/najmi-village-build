import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../data/theme';
import {FPS} from '../data/script';

const start = 212.5 * FPS;
const end = 216 * FPS;

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) {
    return null;
  }

  const opacity = interpolate(
    frame,
    [start, start + 18, end - 14, end],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const scale = interpolate(frame, [start, start + 34], [0.94, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineWidth = interpolate(frame, [start + 16, start + 50], [0, 720], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subOpacity = interpolate(frame, [start + 28, start + 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 44%, #171b24 0%, #07080b 52%, #030405 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        opacity,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 22% 30%, rgba(224,178,90,0.12), transparent 24%), radial-gradient(circle at 78% 70%, rgba(127,231,255,0.08), transparent 28%)',
        }}
      />
      {Array.from({length: 26}, (_, index) => {
        const x = (index * 137) % 1920;
        const y = (index * 211) % 1080;
        const twinkle = 0.18 + ((Math.sin(frame / 9 + index) + 1) / 2) * 0.35;
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: index % 4 === 0 ? 3 : 2,
              height: index % 4 === 0 ? 3 : 2,
              background: index % 3 === 0 ? COLORS.cyan : COLORS.gold,
              opacity: twinkle,
              boxShadow: `0 0 8px ${index % 3 === 0 ? COLORS.cyan : COLORS.gold}`,
            }}
          />
        );
      })}

      <div style={{transform: `scale(${scale})`, textAlign: 'center', position: 'relative'}}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 17,
            letterSpacing: '0.42em',
            color: COLORS.creamDim,
            marginBottom: 26,
            opacity: 0.7,
          }}
        >
          A NEW STORY BEGINS
        </div>

        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 186,
            fontWeight: 900,
            lineHeight: 0.86,
            letterSpacing: interpolate(frame, [start, start + 60], [0.04, 0.14], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            color: COLORS.gold,
            textShadow: `0 0 70px rgba(224, 178, 90, 0.22), 0 8px 0 rgba(92, 58, 20, 0.55)`,
          }}
        >
          NAJMI
        </div>

        <div
          style={{
            width: lineWidth,
            height: 1,
            margin: '28px auto',
            background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, transparent)`,
            opacity: 0.7,
          }}
        />

        <div
          style={{
            opacity: subOpacity,
            fontFamily: FONTS.body,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: COLORS.cream,
            marginBottom: 18,
          }}
        >
          THE VILLAGE BUILDER
        </div>
        <div
          style={{
            opacity: subOpacity,
            fontFamily: FONTS.mono,
            fontSize: 24,
            letterSpacing: '0.3em',
            color: COLORS.cyan,
          }}
        >
          EPISODE 01
        </div>

        <div
          style={{
            opacity: subOpacity,
            marginTop: 52,
            fontFamily: FONTS.mono,
            fontSize: 17,
            letterSpacing: '0.34em',
            color: 'rgba(246, 234, 211, 0.45)',
          }}
        >
          TO BE CONTINUED...
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 46,
          fontFamily: FONTS.mono,
          fontSize: 12,
          letterSpacing: '0.28em',
          color: 'rgba(246, 234, 211, 0.22)',
        }}
      >
        NAJMI // EPISODE 01 // PINTU MENUJU DUNIA LAIN
      </div>
    </AbsoluteFill>
  );
};
