import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../data/theme';
import {FPS} from '../data/script';

const typed = (text: string, frame: number, start: number, charsPerSecond = 58): string => {
  const count = Math.floor(((frame - start) / FPS) * charsPerSecond);
  return text.slice(0, Math.max(0, count));
};

const corner = (position: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => {
  const size = 22;
  const width = 2;
  const common: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: COLORS.cyan,
    borderStyle: 'solid',
    opacity: 0.8,
  };
  if (position === 'tl') return {...common, top: -1, left: -1, borderWidth: `${width}px 0 0 ${width}px`};
  if (position === 'tr') return {...common, top: -1, right: -1, borderWidth: `${width}px ${width}px 0 0`};
  if (position === 'bl') return {...common, bottom: -1, left: -1, borderWidth: `0 0 ${width}px ${width}px`};
  return {...common, bottom: -1, right: -1, borderWidth: `0 ${width}px ${width}px 0`};
};

const row = (label: string, value: string, color: string = COLORS.cream): React.ReactNode => (
  <div
    key={label}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: 20,
      borderBottom: '1px solid rgba(127, 231, 255, 0.13)',
      padding: '11px 0',
      fontFamily: FONTS.mono,
      fontSize: 23,
    }}
  >
    <span style={{color: 'rgba(210, 245, 255, 0.62)', letterSpacing: '0.08em'}}>{label}</span>
    <span style={{color, fontWeight: 700, letterSpacing: '0.06em'}}>{value}</span>
  </div>
);

const StatusMap: React.FC<{frame: number}> = ({frame}) => {
  const cells = Array.from({length: 48}, (_, index) => index);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 5,
        marginTop: 18,
        marginBottom: 6,
        padding: 12,
        border: '1px solid rgba(127, 231, 255, 0.18)',
        background: 'rgba(28, 92, 112, 0.12)',
      }}
    >
      {cells.map((cell) => {
        const active = cell === 26;
        const pulse = active ? 0.55 + Math.sin(frame / 10) * 0.25 : 0.08;
        return (
          <div
            key={cell}
            style={{
              height: 12,
              background: active ? COLORS.cyan : 'rgba(127, 231, 255, 0.16)',
              opacity: pulse,
              boxShadow: active ? `0 0 12px ${COLORS.cyan}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export const SystemPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 111 * FPS;
  const end = 204.5 * FPS;

  if (frame < start || frame > end) {
    return null;
  }

  const panelOpacity = interpolate(
    frame,
    [start, start + 16, end - 18, end],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  let phase = '';
  let phaseStart = start;
  if (frame < 117.5 * FPS) {
    phase = 'online';
    phaseStart = 111 * FPS;
  } else if (frame < 131 * FPS) {
    phase = 'quest';
    phaseStart = 117.5 * FPS;
  } else if (frame < 141.5 * FPS) {
    phase = 'host';
    phaseStart = 131 * FPS;
  } else if (frame < 155 * FPS) {
    phase = 'lock';
    phaseStart = 141.5 * FPS;
  } else if (frame < 169 * FPS) {
    phase = 'status';
    phaseStart = 155.5 * FPS;
  } else if (frame < 187 * FPS) {
    phase = 'found';
    phaseStart = 169 * FPS;
  } else if (frame < 196 * FPS) {
    phase = 'build';
    phaseStart = 187 * FPS;
  } else {
    phase = 'done';
    phaseStart = 196 * FPS;
  }

  const local = frame - phaseStart;
  const glitch = frame % 163 < 3 ? 3 : 0;
  const scan = (frame * 1.9) % 100;
  const buildProgress = interpolate(
    frame,
    [187 * FPS, 195 * FPS],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const heading = (text: string, delay = 0, color: string = COLORS.cyan) => (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 19,
        letterSpacing: '0.24em',
        color,
        marginBottom: 16,
        opacity: frame >= phaseStart + delay ? 1 : 0,
      }}
    >
      {typed(text, frame, phaseStart + delay)}
    </div>
  );

  const big = (text: string, delay = 0, size = 45) => (
    <div
      style={{
        fontFamily: FONTS.display,
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        color: COLORS.cream,
        marginBottom: 12,
        textShadow: '0 0 24px rgba(127, 231, 255, 0.16)',
      }}
    >
      {typed(text, frame, phaseStart + delay, 44)}
    </div>
  );

  const body = (text: string, delay = 0, color: string = 'rgba(214, 245, 255, 0.72)') => (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 22,
        lineHeight: 1.6,
        color,
        marginBottom: 8,
      }}
    >
      {typed(text, frame, phaseStart + delay, 64)}
    </div>
  );

  let content: React.ReactNode = null;

  if (phase === 'online') {
    content = (
      <>
        {heading('// SYSTEM ONLINE')}
        {big('WELCOME,', 8, 52)}
        {big('HOST.', 18, 52)}
        <div style={{height: 12}} />
        {body('Boot sequence complete.', 32)}
        {body('Host signature detected.', 48)}
        <div style={{marginTop: 22, padding: '12px 14px', borderLeft: `3px solid ${COLORS.cyan}`, background: 'rgba(127,231,255,0.07)', fontFamily: FONTS.mono, fontSize: 18, color: COLORS.cyan}}>
          {typed('LINK ESTABLISHED // WILAYAH 001', frame, phaseStart + 66, 48)}
        </div>
      </>
    );
  } else if (phase === 'quest') {
    content = (
      <>
        {heading('// MAIN QUEST UNLOCKED')}
        {big('BUILD YOUR', 8, 47)}
        {big('FIRST VILLAGE.', 18, 47)}
        <div style={{height: 16}} />
        <div style={{fontFamily: FONTS.mono, fontSize: 20, color: 'rgba(210,245,255,0.62)', letterSpacing: '0.12em'}}>OBJECTIVE</div>
        <div style={{fontFamily: FONTS.mono, fontSize: 27, color: COLORS.gold, marginTop: 8, letterSpacing: '0.04em'}}>
          {typed('FOUND A SETTLEMENT', frame, phaseStart + 34, 44)}
        </div>
        {body('Reward: unknown.', 56)}
        {body('Deadline: none.', 70)}
      </>
    );
  } else if (phase === 'host') {
    content = (
      <>
        {heading('// HOST REGISTERED')}
        {row('ROLE', 'WILAYAH MANAGER', COLORS.cream)}
        {row('AUTHORITY', 'PROVISIONAL', COLORS.gold)}
        {row('STATUS', 'BOUND', COLORS.cyan)}
        <div style={{height: 14}} />
        {body('Host telah dipilih sebagai pengelola wilayah ini.', 38)}
      </>
    );
  } else if (phase === 'lock') {
    content = (
      <>
        {heading('// SYSTEM NOTICE', 0, COLORS.danger)}
        {big('MAIN QUEST', 6, 48)}
        {big('CANNOT BE CANCELLED.', 14, 42)}
        <div style={{height: 14}} />
        {body('Please proceed, Host.', 32)}
        {body('System override: unavailable.', 52, COLORS.danger)}
      </>
    );
  } else if (phase === 'status') {
    content = (
      <>
        {heading('// TERRITORY STATUS')}
        {big('WILAYAH 001', 6, 43)}
        <div style={{height: 10}} />
        {row('POPULATION', '0')}
        {row('BUILDINGS', '0')}
        {row('INFRASTRUCTURE', '0')}
        {row('VILLAGE', 'NONE', COLORS.danger)}
        <StatusMap frame={frame} />
        {body('Wilayah ini belum memiliki penduduk.', 70)}
      </>
    );
  } else if (phase === 'found') {
    content = (
      <>
        {heading('// MAIN QUEST')}
        {big('FOUND YOUR', 6, 44)}
        {big('FIRST VILLAGE.', 14, 44)}
        <div style={{height: 16}} />
        <div style={{fontFamily: FONTS.mono, fontSize: 20, color: 'rgba(210,245,255,0.62)', letterSpacing: '0.12em'}}>OBJECTIVE</div>
        <div style={{fontFamily: FONTS.mono, fontSize: 25, color: COLORS.gold, marginTop: 8}}>
          {typed('BUILD YOUR FIRST BUILDING', frame, phaseStart + 30, 46)}
        </div>
        <div style={{height: 22}} />
        {body('PROGRESS: 0 / 1', 52, COLORS.cyan)}
        {body('A village begins with one wall.', 70)}
      </>
    );
  } else if (phase === 'build') {
    content = (
      <>
        {heading('// CONSTRUCTION IN PROGRESS')}
        {big('COTTAGE_01', 6, 44)}
        <div style={{height: 10}} />
        {body('MATERIALIZING STRUCTURE...', 18)}
        <div style={{height: 14, background: 'rgba(127,231,255,0.1)', border: '1px solid rgba(127,231,255,0.22)', padding: 4}}>
          <div
            style={{
              height: 20,
              width: `${buildProgress * 100}%`,
              background: `linear-gradient(90deg, ${COLORS.systemDim}, ${COLORS.cyan})`,
              boxShadow: `0 0 18px ${COLORS.cyan}55`,
            }}
          />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: FONTS.mono, fontSize: 20, color: COLORS.cream}}>
          <span>PROGRESS</span>
          <span>{Math.floor(buildProgress)} / 1</span>
        </div>
        {body('Do not interrupt the build sequence.', 48, 'rgba(214,245,255,0.5)')}
      </>
    );
  } else {
    content = (
      <>
        {heading('// BUILDING COMPLETE', 0, COLORS.ok)}
        {big('VILLAGE SEEDED.', 6, 43)}
        <div style={{height: 10}} />
        {row('BUILDINGS', '1 / 1', COLORS.ok)}
        {row('POPULATION', '0', COLORS.gold)}
        {row('QUEST', 'ACTIVE', COLORS.cyan)}
        <div style={{height: 12}} />
        {body('FIRST OBJECTIVE COMPLETE.', 34, COLORS.ok)}
        {body('NEXT: ATTRACT YOUR FIRST RESIDENT.', 52)}
      </>
    );
  }

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 30}}>
      <div
        style={{
          position: 'absolute',
          top: 142,
          right: 78,
          width: 800,
          minHeight: 410,
          padding: '30px 34px 28px',
          background: 'rgba(5, 17, 27, 0.9)',
          border: '1px solid rgba(127, 231, 255, 0.42)',
          boxShadow: `0 0 60px rgba(60, 190, 220, 0.12), inset 0 0 80px rgba(30, 95, 130, 0.12)`,
          opacity: panelOpacity,
          transform: `translateX(${glitch}px) scale(${interpolate(frame, [start, start + 24], [0.96, 1], {extrapolateRight: 'clamp'})})`,
          overflow: 'hidden',
          color: COLORS.cream,
        }}
      >
        <div style={corner('tl')} />
        <div style={corner('tr')} />
        <div style={corner('bl')} />
        <div style={corner('br')} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(127,231,255,0.035) 0px, rgba(127,231,255,0.035) 1px, transparent 1px, transparent 4px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scan}%`,
            height: 2,
            background: 'rgba(127,231,255,0.22)',
            boxShadow: '0 0 16px rgba(127,231,255,0.3)',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(127, 231, 255, 0.2)',
            paddingBottom: 13,
            marginBottom: 22,
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: '0.16em',
            color: 'rgba(190, 240, 255, 0.65)',
          }}
        >
          <span style={{display: 'flex', alignItems: 'center', gap: 9}}>
            <span
              style={{
                width: 8,
                height: 8,
                background: frame % 28 < 14 ? COLORS.cyan : COLORS.systemDim,
                boxShadow: `0 0 10px ${COLORS.cyan}`,
              }}
            />
            SYSTEM // HOST INTERFACE
          </span>
          <span>WILAYAH 001</span>
        </div>

        <div style={{position: 'relative'}}>{content}</div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 11,
            borderTop: '1px solid rgba(127, 231, 255, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONTS.mono,
            fontSize: 13,
            letterSpacing: '0.12em',
            color: 'rgba(170, 220, 235, 0.4)',
          }}
        >
          <span>AUTHORITY // UNKNOWN</span>
          <span>SYS.TIME {String(Math.floor((frame - start) / FPS)).padStart(4, '0')}s</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
