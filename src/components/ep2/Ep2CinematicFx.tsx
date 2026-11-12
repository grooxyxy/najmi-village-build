import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../data/theme';
import {FPS, SCENES} from '../../data/ep2/script';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const range = (frame: number, input: number[], output: number[]) =>
  interpolate(frame, input.map((value) => value * FPS), output, clamp);

const SpeedLines: React.FC<{frame: number; strength: number; color?: string}> = ({frame, strength, color = '255, 244, 218'}) => {
  if (strength < 0.01) {
    return null;
  }
  const rotation = (frame * 0.9) % 360;
  return (
    <AbsoluteFill
      style={{
        zIndex: 34,
        opacity: strength,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        background: `repeating-conic-gradient(from ${rotation}deg at 50% 52%, rgba(${color}, 0.26) 0deg 0.55deg, transparent 0.55deg 3.2deg)`,
        WebkitMaskImage: 'radial-gradient(circle at 50% 52%, transparent 0 19%, black 58%, black 100%)',
        maskImage: 'radial-gradient(circle at 50% 52%, transparent 0 19%, black 58%, black 100%)',
      }}
    />
  );
};

const ChapterLabel: React.FC<{frame: number}> = ({frame}) => {
  const entries = [
    {start: 0.8, end: 4.6, scene: 's1'},
    {start: 30.4, end: 34.4, scene: 's2'},
    {start: 57.2, end: 61.2, scene: 's3'},
    {start: 105.2, end: 109.2, scene: 's4'},
    {start: 140.2, end: 144.2, scene: 's5'},
    {start: 170.2, end: 174.2, scene: 's6'},
  ];
  const active = entries.find((entry) => frame >= entry.start * FPS && frame <= entry.end * FPS);
  if (!active) {
    return null;
  }
  const scene = SCENES.find((entry) => entry.id === active.scene);
  const opacity = interpolate(
    frame,
    [active.start * FPS, active.start * FPS + 10, active.end * FPS - 10, active.end * FPS],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: 116,
        left: 76,
        zIndex: 36,
        opacity,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'stretch',
        gap: 14,
      }}
    >
      <div style={{width: 3, background: COLORS.gold, boxShadow: `0 0 14px ${COLORS.gold}`}} />
      <div>
        <div style={{fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.24em', color: COLORS.gold}}>
          SCENE {active.scene.toUpperCase()} // {scene?.label.toUpperCase()}
        </div>
        <div style={{fontFamily: FONTS.display, fontSize: 26, fontWeight: 700, color: COLORS.cream, marginTop: 3, letterSpacing: '-0.01em'}}>
          {scene?.heading.split('—')[1]?.trim()}
        </div>
      </div>
    </div>
  );
};

export const Ep2CinematicFx: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = frame / FPS;

  const startFade = range(frame, [0, 1.15], [1, 0]);
  const endFade = range(frame, [188.9, 190], [0, 1]);
  const portalFlash = range(frame, [57.0, 57.35, 57.65, 58.0], [0, 0.72, 0.45, 0]);
  const storeFlash = range(frame, [75.8, 76.0, 76.25, 76.55], [0, 0.55, 0.35, 0]);
  const returnFlash = range(frame, [104.8, 105.15, 105.5, 105.8], [0, 0.62, 0.4, 0]);
  const meadowFlash = range(frame, [139.8, 140.1, 140.4, 140.7], [0, 0.4, 0.25, 0]);
  const forestFlash = range(frame, [169.8, 170.1, 170.35, 170.65], [0, 0.45, 0.3, 0]);
  const hahImpact = range(frame, [84.0, 84.12, 84.4, 84.9], [0, 0.82, 0.5, 0]);
  const finalImpact = range(frame, [185.9, 186.05, 186.35, 187.0], [0, 0.94, 0.7, 0]);
  const speed = Math.max(
    range(frame, [57.1, 57.4, 57.8, 58.2], [0, 0.26, 0.18, 0]),
    range(frame, [83.92, 84.18, 84.6, 85.1], [0, 0.55, 0.38, 0]),
    range(frame, [185.9, 186.12, 186.6, 187.2], [0, 0.68, 0.42, 0]),
  );
  const flash = Math.max(portalFlash, storeFlash, returnFlash, meadowFlash, forestFlash);
  const impact = Math.max(hahImpact, finalImpact);
  const black = Math.max(startFade, endFade);
  const grainShift = `${(frame * 7) % 61}px ${(frame * 11) % 47}px`;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          zIndex: 20,
          background: 'radial-gradient(ellipse at center, transparent 42%, rgba(3, 5, 8, 0.5) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          zIndex: 21,
          opacity: 0.16,
          backgroundImage:
            'radial-gradient(circle at 17% 31%, rgba(255,255,255,0.2) 0 1px, transparent 1px 3px), radial-gradient(circle at 73% 61%, rgba(255,255,255,0.14) 0 1px, transparent 1px 4px), radial-gradient(circle at 41% 83%, rgba(255,255,255,0.11) 0 1px, transparent 1px 5px)',
          backgroundSize: '3px 3px, 5px 5px, 7px 7px',
          backgroundPosition: grainShift,
          mixBlendMode: 'overlay',
        }}
      />

      <SpeedLines frame={frame} strength={speed} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 92,
          background: '#05070a',
          zIndex: 32,
          borderBottom: '1px solid rgba(224, 178, 90, 0.12)',
        }}
      >
        <div style={{position: 'absolute', left: 42, top: 29, display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{fontFamily: FONTS.display, fontSize: 18, fontWeight: 800, letterSpacing: '0.18em', color: COLORS.cream}}>
            NAJMI
          </span>
          <span style={{width: 20, height: 1, background: COLORS.gold, opacity: 0.7}} />
          <span style={{fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.18em', color: 'rgba(246,234,211,0.62)'}}>
            THE VILLAGE BUILDER
          </span>
        </div>
        <div style={{position: 'absolute', right: 42, top: 31, fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.2em', color: 'rgba(127,231,255,0.52)'}}>
          EP.02 // WORLD PREPARATION
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 92,
          background: '#05070a',
          zIndex: 32,
          borderTop: '1px solid rgba(224, 178, 90, 0.12)',
        }}
      >
        <div style={{position: 'absolute', left: 42, top: 34, fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.18em', color: 'rgba(246,234,211,0.48)'}}>
          PERSIAPAN MENUJU DUNIA BARU
        </div>
        <div style={{position: 'absolute', right: 42, top: 34, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.18em', color: 'rgba(127,231,255,0.44)'}}>
          <span style={{width: 5, height: 5, borderRadius: 3, background: COLORS.cyan, opacity: 0.75}} />
          1080P // 30FPS
        </div>
      </div>

      <ChapterLabel frame={frame} />

      <AbsoluteFill
        style={{
          zIndex: 58,
          backgroundColor: `rgba(3, 5, 8, ${black})`,
        }}
      />
      <AbsoluteFill
        style={{
          zIndex: 59,
          backgroundColor: `rgba(218, 251, 255, ${flash})`,
        }}
      />
      <AbsoluteFill
        style={{
          zIndex: 60,
          backgroundColor: `rgba(255, 246, 226, ${impact})`,
          mixBlendMode: 'screen',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 92,
          height: 3,
          zIndex: 33,
          background: `linear-gradient(90deg, transparent, rgba(127,231,255,${0.1 + speed * 0.35}), transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
