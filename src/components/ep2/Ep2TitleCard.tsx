import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../data/theme';
import {FPS} from '../../data/ep2/script';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const GlitchBars: React.FC<{frame: number; strength: number}> = ({frame, strength}) => (
  <>
    {[0, 1, 2, 3].map((index) => {
      const y = (frame * (7 + index * 3) + index * 211) % 1080;
      return (
        <div
          key={`glitch-${index}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y,
            height: 2 + (index % 2) * 4,
            background: index % 2 === 0 ? 'rgba(127,231,255,0.16)' : 'rgba(255,107,107,0.12)',
            opacity: strength,
            mixBlendMode: 'screen',
          }}
        />
      );
    })}
  </>
);

export const Ep2TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  const opening = frame >= 0.25 * FPS && frame <= 3.05 * FPS;
  const ending = frame >= 186.25 * FPS;

  if (!opening && !ending) {
    return null;
  }

  if (opening) {
    const opacity = interpolate(frame, [0.25 * FPS, 0.8 * FPS, 2.55 * FPS, 3.05 * FPS], [0, 1, 1, 0], clamp);
    const slide = interpolate(frame, [0.25 * FPS, 1.05 * FPS], [42, 0], clamp);
    const line = interpolate(frame, [0.55 * FPS, 1.4 * FPS], [0, 620], clamp);
    return (
      <AbsoluteFill style={{pointerEvents: 'none', zIndex: 70}}>
        <div
          style={{
            position: 'absolute',
            left: 118,
            top: 302,
            width: 1100,
            padding: '28px 36px 34px',
            opacity,
            transform: `translateX(${slide}px)`,
            background: 'linear-gradient(90deg, rgba(5,7,10,0.88) 0%, rgba(5,7,10,0.58) 72%, transparent 100%)',
            borderLeft: `4px solid ${COLORS.gold}`,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8}}>
            <span style={{fontFamily: FONTS.mono, fontSize: 13, letterSpacing: '0.28em', color: COLORS.gold}}>EPISODE 02</span>
            <span style={{width: line, height: 1, background: 'linear-gradient(90deg, rgba(224,178,90,0.72), transparent)'}} />
          </div>
          <div style={{fontFamily: FONTS.display, fontSize: 106, lineHeight: 0.9, fontWeight: 800, letterSpacing: '-0.055em', color: COLORS.cream}}>
            NAJMI
          </div>
          <div style={{fontFamily: FONTS.mono, fontSize: 15, letterSpacing: '0.34em', color: 'rgba(246,234,211,0.62)', marginTop: 5}}>
            THE VILLAGE BUILDER
          </div>
          <div style={{fontFamily: FONTS.display, fontSize: 41, lineHeight: 1.08, fontWeight: 700, color: '#ffe4ae', marginTop: 22, letterSpacing: '-0.02em'}}>
            PERSIAPAN MENUJU<br />DUNIA BARU
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  const opacity = interpolate(frame, [186.25 * FPS, 186.65 * FPS, 189.5 * FPS, 190 * FPS], [0, 1, 1, 0], clamp);
  const scale = interpolate(frame, [186.25 * FPS, 187.2 * FPS], [1.08, 1], clamp);
  const glitch = interpolate(frame, [186.25 * FPS, 186.6 * FPS, 187.0 * FPS], [1, 0.4, 0], clamp);

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 70, opacity}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(7,10,16,0.72), rgba(2,3,5,0.97))'}} />
      <GlitchBars frame={frame} strength={glitch} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 390,
          textAlign: 'center',
          transform: `scale(${scale})`,
        }}
      >
        <div style={{fontFamily: FONTS.mono, fontSize: 14, letterSpacing: '0.34em', color: 'rgba(127,231,255,0.68)'}}>
          EPISODE 02 // PERSIAPAN MENUJU DUNIA BARU
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: COLORS.cream,
            marginTop: 16,
            textShadow: '0 0 38px rgba(127,231,255,0.18)',
          }}
        >
          BERSAMBUNG...
        </div>
        <div style={{width: 540, height: 1, background: 'linear-gradient(90deg, transparent, rgba(224,178,90,0.7), transparent)', margin: '20px auto 18px'}} />
        <div style={{fontFamily: FONTS.mono, fontSize: 13, letterSpacing: '0.22em', color: 'rgba(246,234,211,0.55)'}}>
          NAJMI: THE VILLAGE BUILDER
        </div>
        <div style={{fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.24em', color: 'rgba(255,107,107,0.58)', marginTop: 10}}>
          SESUATU MENUNGGU DI HUTAN
        </div>
      </div>
    </AbsoluteFill>
  );
};
