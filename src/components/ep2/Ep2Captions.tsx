import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../data/theme';
import {FPS, getActiveLine, type TimedLine} from '../../data/ep2/script';

const speakerLabel: Record<string, string> = {
  Narrator: 'NARATOR',
  Najmi: 'NAJMI',
  System: 'SYSTEM // LINK',
};

const speakerColor: Record<string, string> = {
  Narrator: COLORS.creamDim,
  Najmi: COLORS.gold,
  System: COLORS.cyan,
};

const WordLine: React.FC<{line: TimedLine; frame: number}> = ({line, frame}) => {
  const words = line.text.split(/\s+/).filter(Boolean);
  const seconds = frame / FPS;
  const elapsed = Math.max(0, seconds - line.displayStart);
  const total = Math.max(0.8, line.displayEnd - line.displayStart);
  const reveal = Math.min(1, elapsed / Math.max(0.55, total * 0.58));
  const visible = Math.max(1, Math.ceil(reveal * words.length));
  const emphasis = line.delivery === 'shocked' || line.delivery === 'excited';
  const whisper = line.delivery === 'whisper';
  return (
    <>
      {words.map((word, index) => {
        const on = index < visible;
        const active = index === Math.min(words.length - 1, visible - 1);
        return (
          <span
            key={`${line.id}-word-${index}`}
            style={{
              display: 'inline-block',
              opacity: on ? 1 : 0,
              transform: on ? 'translateY(0)' : 'translateY(8px)',
              transition: 'none',
              color: active && emphasis ? '#ffe9a8' : whisper ? '#c8dcff' : 'inherit',
              textShadow: active && emphasis ? '0 0 24px rgba(255, 210, 120, 0.45)' : undefined,
              marginRight: '0.24em',
            }}
          >
            {word}
          </span>
        );
      })}
    </>
  );
};

export const Ep2Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = getActiveLine(frame);

  if (!line || frame >= 190 * FPS) {
    return null;
  }

  const start = line.displayStart * FPS;
  const end = line.displayEnd * FPS;
  const fade = Math.min(7, Math.max(3, (end - start) / 4));
  const opacity = interpolate(frame, [start, start + fade, end - fade, end], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isSystem = line.speaker === 'System';
  const isNarrator = line.speaker === 'Narrator';
  const phoneActive = frame >= 60 * FPS && frame <= 76 * FPS;
  const long = line.text.length > 96;
  const whisper = line.delivery === 'whisper';
  const fontSize = isSystem ? (long ? 29 : 33) : whisper ? 34 : long ? 34 : 40;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: phoneActive ? 'flex-start' : 'center',
        paddingBottom: 126,
        paddingLeft: phoneActive ? 82 : 0,
        paddingRight: phoneActive ? 1020 : 0,
        pointerEvents: 'none',
        zIndex: 48,
      }}
    >
      <div
        style={{
          opacity,
          maxWidth: phoneActive ? 820 : 1460,
          minWidth: 420,
          padding: '13px 24px 17px',
          borderRadius: 7,
          background: isSystem ? 'rgba(5, 22, 32, 0.82)' : 'rgba(8, 10, 15, 0.74)',
          borderLeft: `4px solid ${speakerColor[line.speaker]}`,
          borderTop: '1px solid rgba(246, 234, 211, 0.12)',
          borderRight: '1px solid rgba(246, 234, 211, 0.08)',
          borderBottom: '1px solid rgba(246, 234, 211, 0.08)',
          boxShadow: '0 14px 40px rgba(0, 0, 0, 0.36)',
          backdropFilter: 'blur(6px)',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: FONTS.mono,
            fontSize: 14,
            letterSpacing: '0.22em',
            color: speakerColor[line.speaker],
            marginBottom: 5,
            opacity: isNarrator ? 0.72 : 0.95,
          }}
        >
          <span style={{width: 26, height: 1, background: speakerColor[line.speaker], display: 'inline-block'}} />
          {speakerLabel[line.speaker]}
        </div>
        <div
          style={{
            fontFamily: isSystem ? FONTS.mono : FONTS.body,
            fontSize,
            lineHeight: 1.34,
            color: isSystem ? '#c8f6ff' : whisper ? '#d8e6ff' : COLORS.cream,
            fontStyle: isNarrator ? 'italic' : 'normal',
            fontWeight: isSystem ? 600 : 500,
            textShadow: '0 2px 12px rgba(0,0,0,0.65)',
            letterSpacing: isSystem ? '0.015em' : '0.002em',
          }}
        >
          {isSystem ? line.text : <WordLine line={line} frame={frame} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};
