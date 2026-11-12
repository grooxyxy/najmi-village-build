import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../data/theme';
import {FPS} from '../../data/ep2/script';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const scanStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(127, 231, 255, 0.045) 0px, rgba(127, 231, 255, 0.045) 1px, transparent 1px, transparent 4px)',
  pointerEvents: 'none',
  mixBlendMode: 'screen',
};

const Corners: React.FC<{color?: string}> = ({color = COLORS.cyan}) => {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 18,
    height: 18,
    borderStyle: 'solid',
    borderColor: color,
    opacity: 0.8,
  };
  return (
    <>
      <span style={{...base, left: -1, top: -1, borderWidth: '2px 0 0 2px'}} />
      <span style={{...base, right: -1, top: -1, borderWidth: '2px 2px 0 0'}} />
      <span style={{...base, left: -1, bottom: -1, borderWidth: '0 0 2px 2px'}} />
      <span style={{...base, right: -1, bottom: -1, borderWidth: '0 2px 2px 0'}} />
    </>
  );
};

const Frame: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  color?: string;
  accent?: string;
  opacity?: number;
  className?: string;
}> = ({children, style, color = COLORS.cyan, accent = 'rgba(7, 22, 34, 0.86)', opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      padding: '22px 26px 24px',
      background: accent,
      border: `1px solid ${color}66`,
      clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
      boxShadow: `0 0 40px ${color}18, inset 0 0 50px ${color}08`,
      backdropFilter: 'blur(8px)',
      opacity,
      ...style,
    }}
  >
    <Corners color={color} />
    <div style={scanStyle} />
    {children}
  </div>
);

const Label: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = COLORS.cyan}) => (
  <div
    style={{
      fontFamily: FONTS.mono,
      fontSize: 14,
      letterSpacing: '0.26em',
      color,
      marginBottom: 9,
      opacity: 0.95,
    }}
  >
    {children}
  </div>
);

const Progress: React.FC<{value: number; color?: string; width?: number}> = ({value, color = COLORS.cyan, width = 350}) => (
  <div style={{width, height: 8, background: 'rgba(127, 231, 255, 0.14)', marginTop: 9}}>
    <div
      style={{
        width: `${Math.max(0, Math.min(1, value)) * 100}%`,
        height: '100%',
        background: color,
        boxShadow: `0 0 12px ${color}`,
      }}
    />
  </div>
);

const ItemRow: React.FC<{index: number; label: string; ready: boolean; frame: number; at: number}> = ({
  index,
  label,
  ready,
  frame,
  at,
}) => {
  const show = frame >= at * FPS;
  const flicker = show && frame < at * FPS + 8;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '8px 0',
        borderBottom: '1px solid rgba(127, 231, 255, 0.11)',
        opacity: show ? (flicker ? 0.55 : 1) : 0.12,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${ready ? '#8ee08a' : 'rgba(127, 231, 255, 0.4)'}`,
          color: ready ? '#8ee08a' : COLORS.cyan,
          fontFamily: FONTS.mono,
          fontSize: 13,
          background: ready ? 'rgba(142, 224, 138, 0.1)' : 'rgba(127, 231, 255, 0.05)',
        }}
      >
        {ready ? '✓' : `0${index}`}
      </span>
      <span style={{fontFamily: FONTS.mono, fontSize: 18, letterSpacing: '0.04em', color: COLORS.cream, flex: 1}}>
        {label}
      </span>
      <span style={{fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.15em', color: ready ? '#8ee08a' : 'rgba(127, 231, 255, 0.52)'}}>
        {ready ? 'READY' : '----'}
      </span>
    </div>
  );
};

export const Ep2SystemHud: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const questOpen = frame >= 0.6 * FPS && frame <= 5.2 * FPS;
  const checklistOpen = frame >= 30.3 * FPS && frame <= 56.4 * FPS;
  const completeOpen = frame >= 142.6 * FPS && frame <= 162 * FPS;
  const warningOpen = frame >= 179.2 * FPS && frame <= 187.4 * FPS;

  const checklistIn = interpolate(frame, [30.3 * FPS, 31.2 * FPS], [0, 1], clamp);
  const completeIn = interpolate(frame, [142.6 * FPS, 143.8 * FPS], [0, 1], clamp);
  const warningIn = interpolate(frame, [179.2 * FPS, 180.2 * FPS], [0, 1], clamp);
  const warningGlitch = frame % 17 < 2 ? 0.45 : 1;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 38}}>
      {questOpen ? (
        <Frame
          style={{top: 116, right: 78, width: 455}}
          opacity={interpolate(frame, [0.6 * FPS, 1.1 * FPS, 4.6 * FPS, 5.2 * FPS], [0, 1, 1, 0], clamp)}
        >
          <Label>MAIN QUEST // UPDATED</Label>
          <div style={{fontFamily: FONTS.display, fontSize: 30, lineHeight: 1.15, color: COLORS.cream, fontWeight: 700}}>
            FOUND YOUR FIRST VILLAGE
          </div>
          <div style={{fontFamily: FONTS.mono, fontSize: 13, letterSpacing: '0.1em', color: 'rgba(200, 246, 255, 0.62)', marginTop: 14}}>
            OBJECTIVE: BUILD YOUR FIRST BUILDING
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 16}}>
            <Progress value={0.02 + Math.min(0.08, (t / 5) * 0.06)} width={300} />
            <span style={{fontFamily: FONTS.mono, fontSize: 14, color: COLORS.cyan}}>0 / 1</span>
          </div>
          <div style={{fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.16em', color: 'rgba(224, 178, 90, 0.8)', marginTop: 14}}>
            REWARD: VILLAGE EXP // HOST LINK STABLE
          </div>
        </Frame>
      ) : null}

      {checklistOpen ? (
        <Frame
          style={{top: 100, right: 78, width: 520}}
          opacity={checklistIn}
          color="#7fe7ff"
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Label>SYSTEM ADVISORY</Label>
            <span style={{fontFamily: FONTS.mono, fontSize: 12, color: 'rgba(127, 231, 255, 0.55)', letterSpacing: '0.14em'}}>
              HOST // QUERY
            </span>
          </div>
          <div style={{fontFamily: FONTS.display, fontSize: 29, lineHeight: 1.12, color: COLORS.cream, fontWeight: 700, marginBottom: 14}}>
            PREPARATION CHECKLIST
          </div>
          <ItemRow index={1} label="CONSTRUCTION TOOLS" ready={frame >= 41.2 * FPS} frame={frame} at={41.2} />
          <ItemRow index={2} label="FOOD SUPPLIES" ready={frame >= 43.0 * FPS} frame={frame} at={43.0} />
          <ItemRow index={3} label="WATER SUPPLIES" ready={frame >= 44.8 * FPS} frame={frame} at={44.8} />
          <ItemRow index={4} label="BUILDING MATERIALS" ready={frame >= 46.6 * FPS} frame={frame} at={46.6} />
          <ItemRow index={5} label="PLANT SEEDS" ready={frame >= 48.4 * FPS} frame={frame} at={48.4} />
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14}}>
            <span style={{fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.14em', color: 'rgba(200, 246, 255, 0.55)'}}>
              STATUS: {frame >= 48.4 * FPS ? 'ALL ITEMS FOUND' : 'SCANNING...'}
            </span>
            <span style={{fontFamily: FONTS.mono, fontSize: 12, color: COLORS.cyan}}>05 / 05</span>
          </div>
        </Frame>
      ) : null}

      {completeOpen ? (
        <Frame
          style={{top: 104, left: 78, width: 520}}
          opacity={completeIn}
          color="#8ee08a"
          accent="rgba(6, 22, 24, 0.86)"
        >
          <Label color="#8ee08a">PREPARATION COMPLETE</Label>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
            <span style={{fontFamily: FONTS.display, fontSize: 47, fontWeight: 800, color: COLORS.cream, letterSpacing: '-0.02em'}}>
              06
            </span>
            <span style={{fontFamily: FONTS.mono, fontSize: 16, letterSpacing: '0.14em', color: 'rgba(200, 246, 255, 0.72)'}}>
              SUPPLIES SECURED
            </span>
          </div>
          <Progress value={1} color="#8ee08a" width={430} />
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: '1px solid rgba(142, 224, 138, 0.24)',
              opacity: interpolate(frame, [146.5 * FPS, 147.5 * FPS], [0, 1], clamp),
            }}
          >
            <Label color="#e0b25a">NEW QUEST UNLOCKED</Label>
            <div style={{fontFamily: FONTS.display, fontSize: 30, fontWeight: 700, color: '#ffe6ad', lineHeight: 1.1}}>
              THE FIRST CLEARING
            </div>
            <div style={{fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.1em', color: 'rgba(200, 246, 255, 0.6)', marginTop: 9}}>
              LOCATION: FOREST EDGE // CAUTION: UNKNOWN SIGNAL
            </div>
          </div>
        </Frame>
      ) : null}

      {warningOpen ? (
        <Frame
          style={{top: 120, right: 78, width: 410, transform: `translateX(${frame % 19 < 2 ? -4 : 0}px)`}}
          opacity={warningIn * warningGlitch}
          color="#ff6b6b"
          accent="rgba(30, 8, 12, 0.9)"
        >
          <Label color="#ff8a8a">WARNING // SIGNAL ANOMALY</Label>
          <div style={{fontFamily: FONTS.display, fontSize: 29, fontWeight: 800, color: '#ffd7d7', lineHeight: 1.1}}>
            UNKNOWN PRESENCE
          </div>
          <div style={{fontFamily: FONTS.mono, fontSize: 14, letterSpacing: '0.1em', color: 'rgba(255, 190, 190, 0.72)', marginTop: 12}}>
            SOURCE: FOREST EDGE
          </div>
          <div style={{fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.12em', color: '#ff8a8a', marginTop: 8}}>
            HOST SIGNAL // UNSTABLE
          </div>
        </Frame>
      ) : null}
    </AbsoluteFill>
  );
};
