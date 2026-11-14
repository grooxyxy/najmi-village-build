import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GROUND_Y, HOUSES, PEOPLE, TREES, ROCKS, personPos} from '../scene';
import {blink, bob, breathe, cloudX, motes, smooth, sway} from '../helpers';

// ---------------------------------------------------------------------------
// Style 4 — WATERCOLOR STORYBOOK
// Soft wet edges (SVG turbulence displacement), paper grain, bleeding colors,
// characters as loose painted figures with no hard outlines.
// ---------------------------------------------------------------------------

const PaperFilter: React.FC = () => (
  <defs>
    {/* wet-edge wobble applied to the whole painting */}
    <filter id="wet" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="wetSoft" x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
    <filter id="bleed">
      <feGaussianBlur stdDeviation="7" />
    </filter>
    <pattern id="grain" width="240" height="240" patternUnits="userSpaceOnUse">
      <rect width="240" height="240" fill="transparent" />
      {Array.from({length: 90}, (_, i) => {
        const x = (Math.sin(i * 37.7) * 43758.5453) % 1;
        const y = (Math.sin(i * 91.3 + 5) * 43758.5453) % 1;
        return <circle key={i} cx={Math.abs(x) * 240} cy={Math.abs(y) * 240} r={0.8 + Math.abs(y) * 1.6} fill="#8a7a5f" opacity="0.35" />;
      })}
    </pattern>
    <linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8fb8e8" />
      <stop offset="60%" stopColor="#cfe3f5" />
      <stop offset="100%" stopColor="#fdeecd" />
    </linearGradient>
    <linearGradient id="wGrass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#a8d99a" />
      <stop offset="100%" stopColor="#6fb173" />
    </linearGradient>
  </defs>
);

const SoftPerson: React.FC<{i: number; t: number}> = ({i, t}) => {
  const p = PEOPLE[i];
  const {x, y} = personPos(p, t);
  const s = p.scale;
  const br = breathe(t, p.phase);
  const bl = blink(t, p.phase);
  const walkPh = p.walk ? Math.sin(t * 4 + p.phase * 3) : 0;
  const bobY = p.walk ? Math.abs(Math.sin(t * 4 + p.phase * 3)) * 8 : bob(t, p.phase, 3);
  const armA = p.walk ? walkPh * 30 : Math.sin(t * 1.5 + p.phase) * 7;
  const legA = p.walk ? walkPh * 24 : 0;
  const H = 330 * s * br;
  const headR = 52 * s;
  return (
    <g transform={`translate(${x} ${y - bobY})`} filter="url(#wetSoft)">
      <ellipse cx={0} cy={6} rx={72 * s} ry={17 * s} fill="#4c7a52" opacity="0.35" />
      {/* legs */}
      <path d={`M -18 ${-140 * s} Q ${-30 * s + legA * s} ${-70 * s} ${-24 * s + legA * 1.6 * s} 0`} stroke="#3c4a7a" strokeWidth={30 * s} fill="none" strokeLinecap="round" />
      <path d={`M 18 ${-140 * s} Q ${30 * s - legA * s} ${-70 * s} ${24 * s - legA * 1.6 * s} 0`} stroke="#2f3c66" strokeWidth={30 * s} fill="none" strokeLinecap="round" />
      {/* body */}
      <path d={`M ${-56 * s} ${-H + 70 * s} Q 0 ${-H + 40 * s} ${56 * s} ${-H + 70 * s} L ${48 * s} ${-110 * s} Q 0 ${-90 * s} ${-48 * s} ${-110 * s} Z`} fill={p.body} opacity="0.92" />
      {/* arms */}
      <path d={`M ${-46 * s} ${-H + 90 * s} Q ${-84 * s} ${-H + 150 * s + armA * s} ${-70 * s} ${-H + 210 * s}`} stroke={p.body} strokeWidth={26 * s} fill="none" strokeLinecap="round" />
      <path d={`M ${46 * s} ${-H + 90 * s} Q ${84 * s} ${-H + 150 * s - armA * s} ${70 * s} ${-H + 210 * s}`} stroke={p.body} strokeWidth={26 * s} fill="none" strokeLinecap="round" />
      {/* head */}
      <g transform={`translate(0 ${-H + 20 * s})`}>
        <circle cx="0" cy="0" r={headR} fill="#fbe0c8" />
        <path d={`M ${-headR} ${-headR * 0.3} a ${headR} ${headR} 0 0 1 ${headR * 2} 0 q ${-headR} ${-headR * 0.7} ${-headR * 2} 0`} fill={p.hair} />
        {p.hat === 'pointy' && <path d={`M ${-headR * 1.05} ${-headR * 0.5} Q 0 ${-headR * 2.6} ${headR * 1.05} ${-headR * 0.5} Z`} fill="#6a5fd0" />}
        {p.hat === 'cap' && <path d={`M ${-headR * 1.08} ${-headR * 0.45} a ${headR} ${headR} 0 0 1 ${headR * 2.16} 0 Z`} fill="#44506a" />}
        {bl > 0.5 ? (
          <>
            <path d={`M ${-headR * 0.42} ${-4} l ${headR * 0.28} 0`} stroke="#4a3a30" strokeWidth={5} strokeLinecap="round" />
            <path d={`M ${headR * 0.14} ${-4} l ${headR * 0.28} 0`} stroke="#4a3a30" strokeWidth={5} strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx={-headR * 0.32} cy={-3} rx={headR * 0.15} ry={headR * 0.19} fill="#3a2e26" />
            <ellipse cx={headR * 0.32} cy={-3} rx={headR * 0.15} ry={headR * 0.19} fill="#3a2e26" />
            <circle cx={-headR * 0.36} cy={-7} r={headR * 0.05} fill="#fff" />
            <circle cx={headR * 0.28} cy={-7} r={headR * 0.05} fill="#fff" />
          </>
        )}
        <path d={`M ${-headR * 0.24} ${headR * 0.32} q ${headR * 0.24} ${headR * 0.2} ${headR * 0.48} 0`} stroke="#b06a5a" strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={-headR * 0.6} cy={headR * 0.18} r={headR * 0.16} fill="#f0a8a0" opacity="0.55" />
        <circle cx={headR * 0.6} cy={headR * 0.18} r={headR * 0.16} fill="#f0a8a0" opacity="0.55" />
      </g>
    </g>
  );
};

export const WatercolorVillage: React.FC<{t: number}> = ({t}) => {
  const mot = motes(t, 20, 4);
  return (
    <AbsoluteFill style={{background: '#fdf8ec', overflow: 'hidden'}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <PaperFilter />
        <g filter="url(#wet)">
          <rect width="1920" height="1080" fill="url(#wSky)" />
          {/* sun wash */}
          <circle cx="1580" cy="170" r="190" fill="#ffe9a8" opacity="0.85" filter="url(#bleed)" />
          {/* clouds as wet blots */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${cloudX(i, t)} ${130 + (i % 3) * 90})`} opacity="0.9">
              <ellipse cx="70" cy="30" rx="86" ry="36" fill="#ffffff" />
              <ellipse cx="140" cy="16" rx="60" ry="32" fill="#ffffff" />
              <ellipse cx="30" cy="44" rx="48" ry="26" fill="#eef4fb" />
            </g>
          ))}
          {/* hills */}
          <path d="M0 640 L280 520 L560 620 L840 505 L1120 615 L1400 515 L1700 620 L1920 550 L1920 790 L0 790 Z" fill="#9db8c4" opacity="0.65" />
          <path d="M0 695 L320 600 L660 685 L980 590 L1330 685 L1660 605 L1920 670 L1920 810 L0 810 Z" fill="#8fb98f" opacity="0.85" />
          {/* ground */}
          <rect x="0" y={GROUND_Y} width="1920" height={1080 - GROUND_Y} fill="url(#wGrass)" />
          <path d="M830 760 L1110 760 L1390 1080 L550 1080 Z" fill="#e8d3a8" opacity="0.9" />
          <path d="M890 760 L1050 760 L1220 1080 L720 1080 Z" fill="#d8bd8f" opacity="0.5" />
          {/* color bleed patches on grass */}
          {Array.from({length: 10}, (_, i) => (
            <ellipse key={i} cx={(i * 197) % 1920} cy={840 + ((i * 83) % 220)} rx={120 + (i % 4) * 40} ry={40 + (i % 3) * 18} fill={i % 2 ? '#7fc184' : '#95cf8d'} opacity="0.4" />
          ))}
        </g>

        {/* houses — painted, wet edges */}
        <g filter="url(#wetSoft)">
          {HOUSES.map((h, i) => {
            const {x, y} = h.pos;
            const w = h.w, hh = h.h, rh = h.roofH;
            const lit = 0.5 + 0.5 * Math.sin(t * 1.2 + i * 2);
            return (
              <g key={i}>
                <ellipse cx={x} cy={y + 10} rx={w * 0.6} ry={24} fill="#5c8a5f" opacity="0.4" />
                <rect x={x - w / 2} y={y - hh} width={w} height={hh} rx={10} fill={h.hue} />
                <path d={`M ${x - w / 2 - 30} ${y - hh + 6} L ${x} ${y - hh - rh} L ${x + w / 2 + 30} ${y - hh + 6} Z`} fill={h.roof} />
                <rect x={x + w / 2 - 26} y={y - hh - rh * 0.5} width={44} height={70} rx={6} fill="#8a5a44" />
                {[0.18, 0.66].map((u, k) => (
                  <rect key={k} x={x - w / 2 + u * w} y={y - hh + 46} width={w * 0.17} height={hh * 0.3} rx={6} fill={lit > 0.6 ? '#ffd97a' : '#bfe4f7'} />
                ))}
                <path d={`M ${x - 36} ${y} L ${x - 36} ${y - 80} Q ${x} ${y - 120} ${x + 36} ${y - 80} L ${x + 36} ${y} Z`} fill="#7a5238" />
                {[0, 1, 2].map((k) => {
                  const pp = ((t * 0.4 + k * 0.34 + i) % 1 + 1) % 1;
                  return <circle key={k} cx={x + w / 2 - 4 + Math.sin(pp * 5) * 16} cy={y - hh - rh - 30 - pp * 90} r={16 + pp * 24} fill="#ffffff" opacity={(1 - pp) * 0.75} />;
                })}
              </g>
            );
          })}
        </g>

        {/* trees */}
        <g filter="url(#wetSoft)">
          {TREES.map((tr, i) => {
            const {x, y} = tr.pos;
            const s = tr.scale;
            const sw = sway(t, i * 0.4, 2.6, 3.2);
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={44 * s} ry={13 * s} fill="#5c8a5f" opacity="0.4" />
                <path d={`M ${x - 12 * s} ${y} L ${x - 8 * s} ${y - 120 * s} L ${x + 8 * s} ${y - 120 * s} L ${x + 12 * s} ${y} Z`} fill="#8a6448" />
                <g transform={`rotate(${sw} ${x} ${y - 120 * s})`}>
                  <circle cx={x - 44 * s} cy={y - 160 * s} r={56 * s} fill="#79b87c" />
                  <circle cx={x + 42 * s} cy={y - 152 * s} r={50 * s} fill="#69ab6e" />
                  <circle cx={x} cy={y - 206 * s} r={62 * s} fill="#8ec98f" />
                  <circle cx={x - 16 * s} cy={y - 226 * s} r={34 * s} fill="#a8dbA6" />
                  <circle cx={x + 10 * s} cy={y - 190 * s} r={40 * s} fill="#5f9e66" opacity="0.7" />
                </g>
              </g>
            );
          })}
        </g>

        {ROCKS.map((r, i) => (
          <ellipse key={i} cx={r.x} cy={r.y} rx={26 * r.s} ry={16 * r.s} fill="#a8aeb8" opacity="0.8" filter="url(#wetSoft)" />
        ))}

        {/* villagers */}
        {PEOPLE.map((_, i) => <SoftPerson key={i} i={i} t={t} />)}

        {/* floating petals */}
        {mot.map((m, i) => (
          <ellipse key={i} cx={m.x} cy={m.y} rx={m.s} ry={m.s * 0.6} fill="#f7c8d8" opacity={m.o} transform={`rotate(${(t * 40 + i * 47) % 360} ${m.x} ${m.y})`} />
        ))}
      </svg>

      {/* paper grain + deckled light */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5), transparent 60%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(180,160,120,0.4)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{opacity: 0.5, mixBlendMode: 'multiply', pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='p'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='240' height='240' filter='url(%23p)' opacity='0.35'/></svg>\")"}} />
    </AbsoluteFill>
  );
};
