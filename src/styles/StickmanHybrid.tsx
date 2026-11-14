import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GROUND_Y, HOUSES, PEOPLE, TREES, ROCKS, personPos} from '../scene';
import {blink, bob, breathe, cloudX, loopT, motes, smooth, sway} from '../helpers';

// ---------------------------------------------------------------------------
// Style 3 — STICKMAN + 3D HYBRID (matches the reference image)
// Painted/3D-ish background, but the villagers are flat hand-drawn stickmen:
// big white round heads, thin black noodle limbs, simple clothes & hats.
// ---------------------------------------------------------------------------

const Ink = '#14121a';

const StHead: React.FC<{r: number; bl: number; grin?: boolean; look?: number}> = ({r, bl, grin, look = 0}) => (
  <g>
    <circle cx={0} cy={0} r={r} fill="#fdfdfa" stroke={Ink} strokeWidth={r * 0.09} />
    {bl > 0.5 ? (
      <>
        <path d={`M ${-r * 0.45} ${-r * 0.08} l ${r * 0.3} 0`} stroke={Ink} strokeWidth={r * 0.1} strokeLinecap="round" />
        <path d={`M ${r * 0.15} ${-r * 0.08} l ${r * 0.3} 0`} stroke={Ink} strokeWidth={r * 0.1} strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx={-r * 0.3 + look * r * 0.1} cy={-r * 0.08} rx={r * 0.17} ry={r * 0.2} fill="#fff" stroke={Ink} strokeWidth={r * 0.06} />
        <ellipse cx={r * 0.3 + look * r * 0.1} cy={-r * 0.08} rx={r * 0.17} ry={r * 0.2} fill="#fff" stroke={Ink} strokeWidth={r * 0.06} />
        <circle cx={-r * 0.3 + look * r * 0.16} cy={-r * 0.05} r={r * 0.08} fill={Ink} />
        <circle cx={r * 0.3 + look * r * 0.16} cy={-r * 0.05} r={r * 0.08} fill={Ink} />
      </>
    )}
    {grin ? (
      <path d={`M ${-r * 0.34} ${r * 0.28} q ${r * 0.34} ${r * 0.36} ${r * 0.68} 0`} fill="#fff" stroke={Ink} strokeWidth={r * 0.07} strokeLinejoin="round" />
    ) : (
      <path d={`M ${-r * 0.2} ${r * 0.34} q ${r * 0.2} ${r * 0.16} ${r * 0.4} 0`} fill="none" stroke={Ink} strokeWidth={r * 0.07} strokeLinecap="round" />
    )}
  </g>
);

const StickPerson: React.FC<{i: number; t: number}> = ({i, t}) => {
  const p = PEOPLE[i];
  const {x, y} = personPos(p, t);
  const s = p.scale;
  const br = breathe(t, p.phase);
  const bl = blink(t, p.phase);
  const walkPh = p.walk ? Math.sin(t * 4.2 + p.phase * 3) : 0;
  const bobY = p.walk ? Math.abs(Math.sin(t * 4.2 + p.phase * 3)) * 10 : bob(t, p.phase, 4);
  const armA = p.walk ? walkPh * 34 : Math.sin(t * 1.4 + p.phase) * 8;
  const legA = p.walk ? walkPh * 28 : 0;
  const headR = 62 * s * br;
  const hipY = -150 * s;
  const shY = -330 * s;
  const lw = 11 * s; // limb stroke width

  return (
    <g transform={`translate(${x} ${y - bobY})`}>
      {/* soft ground shadow */}
      <ellipse cx={0} cy={4} rx={70 * s} ry={16 * s} fill="rgba(10,14,20,0.3)" />
      {/* legs (noodle style, slightly bent) */}
      <path
        d={`M 0 ${hipY} Q ${-16 * s + legA * 0.9 * s} ${-70 * s} ${-14 * s + legA * 1.6 * s} ${-6 * s}`}
        fill="none" stroke={Ink} strokeWidth={lw} strokeLinecap="round"
      />
      <path
        d={`M 0 ${hipY} Q ${16 * s - legA * 0.9 * s} ${-70 * s} ${16 * s - legA * 1.6 * s} ${-6 * s}`}
        fill="none" stroke={Ink} strokeWidth={lw} strokeLinecap="round"
      />
      {/* body: simple tunic */}
      <path
        d={`M ${-46 * s} ${shY} L ${46 * s} ${shY} L ${38 * s} ${hipY + 20 * s} L ${-38 * s} ${hipY + 20 * s} Z`}
        fill={p.body} stroke={Ink} strokeWidth={lw * 0.8} strokeLinejoin="round"
      />
      {/* arms */}
      <path
        d={`M ${-40 * s} ${shY + 20 * s} Q ${-74 * s} ${shY + 70 * s + armA * s} ${-64 * s} ${shY + 130 * s + armA * 1.6 * s}`}
        fill="none" stroke={Ink} strokeWidth={lw} strokeLinecap="round"
      />
      <path
        d={`M ${40 * s} ${shY + 20 * s} Q ${74 * s} ${shY + 70 * s - armA * s} ${64 * s} ${shY + 130 * s - armA * 1.6 * s}`}
        fill="none" stroke={Ink} strokeWidth={lw} strokeLinecap="round"
      />
      {/* head */}
      <g transform={`translate(0 ${shY - headR * 0.92})`}>
        {/* hat sits on top of head */}
        {p.hat === 'pointy' && (
          <path d={`M ${-headR * 1.02} ${-headR * 0.5} Q 0 ${-headR * 2.5} ${headR * 1.02} ${-headR * 0.5} Z`} fill="#5a4fcf" stroke={Ink} strokeWidth={headR * 0.09} strokeLinejoin="round" />
        )}
        {p.hat === 'cap' && (
          <>
            <path d={`M ${-headR * 1.05} ${-headR * 0.45} a ${headR} ${headR} 0 0 1 ${headR * 2.1} 0 Z`} fill="#39424f" stroke={Ink} strokeWidth={headR * 0.08} />
            <ellipse cx={headR * 0.9} cy={-headR * 0.42} rx={headR * 0.6} ry={headR * 0.16} fill="#39424f" stroke={Ink} strokeWidth={headR * 0.07} />
          </>
        )}
        {p.hat === 'none' && (
          <path d={`M ${-headR * 1.0} ${-headR * 0.35} a ${headR} ${headR} 0 0 1 ${headR * 2} 0 q ${-headR * 0.5} ${-headR * 0.35} ${-headR * 1} ${-headR * 0.05} q ${-headR * 0.5} ${-headR * 0.3} ${-headR * 1} ${0} Z`} fill={p.hair} stroke={Ink} strokeWidth={headR * 0.08} />
        )}
        <StHead r={headR} bl={bl} grin={i === 1 || i === 3} look={Math.sin(t * 0.8 + p.phase)} />
      </g>
    </g>
  );
};

export const StickmanHybrid: React.FC<{t: number}> = ({t}) => {
  const mot = motes(t, 15, 3);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#8ec9e8'}}>
      {/* --- painted 3D-ish backdrop --- */}
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f7fd0" />
            <stop offset="55%" stopColor="#9fd0f2" />
            <stop offset="100%" stopColor="#ffe6bd" />
          </linearGradient>
          <linearGradient id="grsG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ec173" />
            <stop offset="100%" stopColor="#3f9152" />
          </linearGradient>
          <radialGradient id="sunG">
            <stop offset="0%" stopColor="#fffbe0" />
            <stop offset="60%" stopColor="#ffd97a" />
            <stop offset="100%" stopColor="rgba(255,200,100,0)" />
          </radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#skyG)" />
        <circle cx="1610" cy="150" r="150" fill="url(#sunG)" />

        {/* clouds (painterly blobs) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${cloudX(i, t)} ${120 + (i % 3) * 85}) scale(${0.7 + (i % 3) * 0.35})`} opacity="0.95">
            <ellipse cx="70" cy="30" rx="80" ry="34" fill="#ffffff" />
            <ellipse cx="130" cy="14" rx="56" ry="30" fill="#ffffff" />
            <ellipse cx="30" cy="42" rx="46" ry="24" fill="#eef6ff" />
          </g>
        ))}

        {/* far hills with painted strokes */}
        <path d="M0 640 L260 520 L520 618 L800 500 L1080 610 L1360 510 L1660 615 L1920 545 L1920 780 L0 780 Z" fill="#5a9c8f" opacity="0.75" />
        <path d="M0 690 L300 600 L620 680 L950 585 L1300 680 L1640 600 L1920 665 L1920 800 L0 800 Z" fill="#4f8f6f" />

        {/* ground */}
        <rect x="0" y={GROUND_Y} width="1920" height={1080 - GROUND_Y} fill="url(#grsG)" />
        {/* road */}
        <path d="M820 760 L1120 760 L1400 1080 L540 1080 Z" fill="#d8b57f" />
        <path d="M870 760 L1070 760 L1250 1080 L700 1080 Z" fill="#c3a06c" opacity="0.6" />
        {/* painted grass strokes */}
        {Array.from({length: 46}, (_, i) => {
          const gx = ((Math.sin(i * 91.7) * 43758.5453) % 1 + 1) % 1 * 1920;
          const gy = 790 + (((i * 53) % 100) / 100) * 280;
          return <path key={i} d={`M ${gx} ${gy} q 4 -14 10 -20`} stroke="#2f7a3f" strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round" />;
        })}
        {ROCKS.map((r, i) => (
          <ellipse key={i} cx={r.x} cy={r.y} rx={26 * r.s} ry={16 * r.s} fill="#8a94a6" stroke="#5f6a7d" strokeWidth="4" />
        ))}

        {/* houses: painterly 3D */}
        {HOUSES.map((h, i) => {
          const {x, y} = h.pos;
          const w = h.w, hh = h.h, rh = h.roofH;
          const lit = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2);
          return (
            <g key={i}>
              <ellipse cx={x} cy={y + 8} rx={w * 0.62} ry={26} fill="rgba(20,40,25,0.3)" />
              {/* side wall for depth */}
              <path d={`M ${x + w / 2} ${y - hh} L ${x + w / 2 + 60} ${y - hh - 26} L ${x + w / 2 + 60} ${y - 26} L ${x + w / 2} ${y} Z`} fill="#c2ab82" stroke={Ink} strokeWidth="6" />
              <rect x={x - w / 2} y={y - hh} width={w} height={hh} fill={h.hue} stroke={Ink} strokeWidth="7" />
              {/* roof */}
              <path d={`M ${x - w / 2 - 34} ${y - hh} L ${x} ${y - hh - rh} L ${x + w / 2 + 60} ${y - hh - 26} L ${x + w / 2 + 60} ${y - hh - 26 - rh * 0.18} L ${x} ${y - hh - rh - 30} L ${x - w / 2 - 34} ${y - hh - rh * 0.2} Z`} fill={h.roof} stroke={Ink} strokeWidth="7" strokeLinejoin="round" />
              <path d={`M ${x - w / 2 - 34} ${y - hh} L ${x} ${y - hh - rh} L ${x + w / 2 + 26} ${y - hh - rh * 0.86} L ${x + w / 2 + 26} ${y - hh - rh * 0.5} L ${x} ${y - hh - rh * 0.28} L ${x - w / 2 - 34} ${y - hh} Z`} fill={h.roof} stroke={Ink} strokeWidth="7" strokeLinejoin="round" />
              {/* windows */}
              {[0.2, 0.68].map((u, k) => (
                <g key={k}>
                  <rect x={x - w / 2 + u * w} y={y - hh + 42} width={w * 0.16} height={hh * 0.3} fill={lit > 0.6 ? '#ffd97a' : '#aee2ff'} stroke={Ink} strokeWidth="6" />
                </g>
              ))}
              {/* door */}
              <path d={`M ${x - 34} ${y} L ${x - 34} ${y - 78} Q ${x} ${y - 116} ${x + 34} ${y - 78} L ${x + 34} ${y} Z`} fill="#6b4423" stroke={Ink} strokeWidth="6" />
              {/* chimney smoke */}
              {[0, 1, 2].map((k) => {
                const pp = loopT(t * 0.45 + k * 0.34 + i, 1);
                return <circle key={k} cx={x + w / 2 - 70 + Math.sin(pp * 5) * 14} cy={y - hh - rh - 34 - pp * 90} r={14 + pp * 22} fill="#ffffff" opacity={(1 - pp) * 0.8} />;
              })}
            </g>
          );
        })}

        {/* trees */}
        {TREES.map((tr, i) => {
          const {x, y} = tr.pos;
          const s = tr.scale;
          const sw = sway(t, i * 0.4, 2.4, 3);
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={46 * s} ry={14 * s} fill="rgba(20,40,25,0.28)" />
              <rect x={x - 13 * s} y={y - 110 * s} width={26 * s} height={110 * s} rx={8} fill="#6b4423" stroke={Ink} strokeWidth="6" />
              <g transform={`rotate(${sw} ${x} ${y - 110 * s})`}>
                <circle cx={x - 46 * s} cy={y - 150 * s} r={54 * s} fill="#3c8f49" stroke={Ink} strokeWidth="6" />
                <circle cx={x + 44 * s} cy={y - 144 * s} r={48 * s} fill="#3c8f49" stroke={Ink} strokeWidth="6" />
                <circle cx={x} cy={y - 194 * s} r={58 * s} fill="#57b866" stroke={Ink} strokeWidth="6" />
                <circle cx={x - 14 * s} cy={y - 216 * s} r={34 * s} fill="#7ad185" />
              </g>
            </g>
          );
        })}
      </svg>

      {/* --- stickman villagers on top (flat, ink outlines) --- */}
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        {PEOPLE.map((_, i) => <StickPerson key={i} i={i} t={t} />)}
        {/* floating motes */}
        {mot.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.s * 0.8} fill="#fff7d0" opacity={m.o} />
        ))}
      </svg>

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 58%, rgba(30,20,50,0.4) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
