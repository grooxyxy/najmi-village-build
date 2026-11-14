import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GROUND_Y, HOUSES, PEOPLE, TREES, ROCKS, personPos} from '../scene';
import {blink, bob, breathe, cloudX, motes, smooth, sway} from '../helpers';

// ---------------------------------------------------------------------------
// Style 5 — FLAT VECTOR / MODERN ANIME
// Clean geometric shapes, bold color blocks, gradient cel-shading, chunky
// outlined characters with anime eyes. No texture — pure crisp vector.
// ---------------------------------------------------------------------------

const L = '#1f2430'; // line color

const AnimePerson: React.FC<{i: number; t: number}> = ({i, t}) => {
  const p = PEOPLE[i];
  const {x, y} = personPos(p, t);
  const s = p.scale;
  const br = breathe(t, p.phase);
  const bl = blink(t, p.phase);
  const walkPh = p.walk ? Math.sin(t * 4 + p.phase * 3) : 0;
  const bobY = p.walk ? Math.abs(Math.sin(t * 4 + p.phase * 3)) * 9 : bob(t, p.phase, 3.5);
  const armA = p.walk ? walkPh * 32 : Math.sin(t * 1.5 + p.phase) * 7;
  const legA = p.walk ? walkPh * 26 : 0;
  const H = 300 * s * br;
  const headR = 56 * s;
  const sw = 8 * s; // outline width
  return (
    <g transform={`translate(${x} ${y - bobY})`}>
      <ellipse cx={0} cy={6} rx={74 * s} ry={17 * s} fill="#1f2430" opacity="0.22" />
      {/* legs */}
      <g transform={`rotate(${legA} ${-16 * s} ${-140 * s})`}>
        <rect x={-38 * s} y={-146 * s} width={40 * s} height={150 * s} rx={20 * s} fill="#33415e" stroke={L} strokeWidth={sw} />
        <ellipse cx={-18 * s} cy={-6 * s} rx={28 * s} ry={14 * s} fill="#1f2430" />
      </g>
      <g transform={`rotate(${-legA} ${16 * s} ${-140 * s})`}>
        <rect x={-2 * s} y={-146 * s} width={40 * s} height={150 * s} rx={20 * s} fill="#3c4d72" stroke={L} strokeWidth={sw} />
        <ellipse cx={20 * s} cy={-6 * s} rx={28 * s} ry={14 * s} fill="#1f2430" />
      </g>
      {/* body */}
      <path
        d={`M ${-58 * s} ${-H + 40 * s} Q 0 ${-H + 6 * s} ${58 * s} ${-H + 40 * s} L ${50 * s} ${-118 * s} Q 0 ${-96 * s} ${-50 * s} ${-118 * s} Z`}
        fill={p.body} stroke={L} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* shading wedge */}
      <path d={`M ${16 * s} ${-H + 26 * s} Q ${58 * s} ${-H + 42 * s} ${58 * s} ${-H + 40 * s} L ${50 * s} ${-118 * s} Q ${34 * s} ${-110 * s} ${30 * s} ${-120 * s} Z`} fill="#000" opacity="0.16" />
      {/* arms */}
      <g transform={`rotate(${armA} ${-52 * s} ${-H + 60 * s})`}>
        <rect x={-84 * s} y={-H + 56 * s} width={34 * s} height={120 * s} rx={17 * s} fill={p.body} stroke={L} strokeWidth={sw} />
        <circle cx={-67 * s} cy={-H + 176 * s} r={17 * s} fill="#ffd9b0" stroke={L} strokeWidth={sw * 0.8} />
      </g>
      <g transform={`rotate(${-armA} ${52 * s} ${-H + 60 * s})`}>
        <rect x={50 * s} y={-H + 56 * s} width={34 * s} height={120 * s} rx={17 * s} fill={p.body} stroke={L} strokeWidth={sw} />
        <circle cx={67 * s} cy={-H + 176 * s} r={17 * s} fill="#ffd9b0" stroke={L} strokeWidth={sw * 0.8} />
      </g>
      {/* head */}
      <g transform={`translate(0 ${-H + 6 * s})`}>
        <circle cx={0} cy={0} r={headR} fill="#ffe0bd" stroke={L} strokeWidth={sw} />
        {/* hair */}
        <path
          d={`M ${-headR} ${-headR * 0.15} a ${headR} ${headR} 0 0 1 ${headR * 2} 0
              L ${headR * 0.8} ${-headR * 0.1} Q ${headR * 0.55} ${-headR * 0.75} ${headR * 0.2} ${-headR * 0.45}
              Q ${-headR * 0.1} ${-headR * 0.9} ${-headR * 0.45} ${-headR * 0.4}
              Q ${-headR * 0.8} ${-headR * 0.65} ${-headR * 0.9} ${-headR * 0.05} Z`}
          fill={p.hair} stroke={L} strokeWidth={sw * 0.8} strokeLinejoin="round"
        />
        {p.hat === 'pointy' && (
          <g>
            <path d={`M ${-headR * 1.1} ${-headR * 0.55} Q 0 ${-headR * 2.9} ${headR * 1.1} ${-headR * 0.55} Z`} fill="#6a5fd8" stroke={L} strokeWidth={sw} strokeLinejoin="round" />
            <path d={`M ${-headR * 1.1} ${-headR * 0.55} Q 0 ${-headR * 1.15} ${headR * 1.1} ${-headR * 0.55}`} fill="none" stroke={L} strokeWidth={sw} />
            <circle cx={0} cy={-headR * 2.5} r={headR * 0.2} fill="#ffd97a" stroke={L} strokeWidth={sw * 0.7} />
          </g>
        )}
        {p.hat === 'cap' && (
          <g>
            <path d={`M ${-headR * 1.12} ${-headR * 0.5} a ${headR * 1.06} ${headR * 1.06} 0 0 1 ${headR * 2.24} 0 Z`} fill="#44506a" stroke={L} strokeWidth={sw} strokeLinejoin="round" />
            <ellipse cx={headR * 1.05} cy={-headR * 0.46} rx={headR * 0.62} ry={headR * 0.17} fill="#333d52" stroke={L} strokeWidth={sw * 0.8} />
          </g>
        )}
        {/* anime eyes */}
        {bl > 0.5 ? (
          <>
            <path d={`M ${-headR * 0.5} ${-2} Q ${-headR * 0.3} ${headR * 0.1} ${-headR * 0.1} ${-2}`} stroke={L} strokeWidth={sw * 0.9} fill="none" strokeLinecap="round" />
            <path d={`M ${headR * 0.1} ${-2} Q ${headR * 0.3} ${headR * 0.1} ${headR * 0.5} ${-2}`} stroke={L} strokeWidth={sw * 0.9} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <g>
              <ellipse cx={-headR * 0.34} cy={2} rx={headR * 0.2} ry={headR * 0.26} fill="#fff" stroke={L} strokeWidth={sw * 0.6} />
              <ellipse cx={-headR * 0.34} cy={4} rx={headR * 0.13} ry={headR * 0.19} fill="#3a6fd8" />
              <circle cx={-headR * 0.38} cy={-2} r={headR * 0.07} fill="#fff" />
              <path d={`M ${-headR * 0.56} ${-headR * 0.24} Q ${-headR * 0.34} ${-headR * 0.36} ${-headR * 0.12} ${-headR * 0.24}`} stroke={L} strokeWidth={sw * 0.9} fill="none" strokeLinecap="round" />
            </g>
            <g>
              <ellipse cx={headR * 0.34} cy={2} rx={headR * 0.2} ry={headR * 0.26} fill="#fff" stroke={L} strokeWidth={sw * 0.6} />
              <ellipse cx={headR * 0.34} cy={4} rx={headR * 0.13} ry={headR * 0.19} fill="#3a6fd8" />
              <circle cx={headR * 0.3} cy={-2} r={headR * 0.07} fill="#fff" />
              <path d={`M ${headR * 0.12} ${-headR * 0.24} Q ${headR * 0.34} ${-headR * 0.36} ${headR * 0.56} ${-headR * 0.24}`} stroke={L} strokeWidth={sw * 0.9} fill="none" strokeLinecap="round" />
            </g>
          </>
        )}
        {/* blush + smile */}
        <ellipse cx={-headR * 0.62} cy={headR * 0.3} rx={headR * 0.16} ry={headR * 0.1} fill="#ff9d9d" opacity="0.7" />
        <ellipse cx={headR * 0.62} cy={headR * 0.3} rx={headR * 0.16} ry={headR * 0.1} fill="#ff9d9d" opacity="0.7" />
        <path d={`M ${-headR * 0.2} ${headR * 0.5} Q 0 ${headR * 0.68} ${headR * 0.2} ${headR * 0.5}`} stroke={L} strokeWidth={sw * 0.8} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

export const FlatAnimeVillage: React.FC<{t: number}> = ({t}) => {
  const mot = motes(t, 16, 5);
  return (
    <AbsoluteFill style={{background: '#7ec8f7', overflow: 'hidden'}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <defs>
          <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4aa8f0" />
            <stop offset="70%" stopColor="#a8e0ff" />
            <stop offset="100%" stopColor="#e0f6ff" />
          </linearGradient>
          <linearGradient id="fGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ed487" />
            <stop offset="100%" stopColor="#4db064" />
          </linearGradient>
          <linearGradient id="fRoof" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a5c" />
            <stop offset="100%" stopColor="#e05a3a" />
          </linearGradient>
          <linearGradient id="fWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff3d6" />
            <stop offset="100%" stopColor="#f3ddb0" />
          </linearGradient>
        </defs>

        <rect width="1920" height="1080" fill="url(#fSky)" />
        {/* sun with ring */}
        <circle cx="1620" cy="150" r="110" fill="#ffe066" />
        <circle cx="1620" cy="150" r="140" fill="none" stroke="#ffe066" strokeWidth="10" opacity="0.5" />

        {/* chunky flat clouds */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${cloudX(i, t)} ${110 + (i % 3) * 85}) scale(${0.75 + (i % 3) * 0.35})`}>
            <rect x="0" y="16" width="190" height="56" rx="28" fill="#ffffff" />
            <circle cx="60" cy="26" r="34" fill="#ffffff" />
            <circle cx="126" cy="22" r="42" fill="#ffffff" />
            <circle cx="164" cy="40" r="26" fill="#eef8ff" />
          </g>
        ))}

        {/* geometric hills */}
        <path d="M0 640 L300 500 L620 640 L950 490 L1300 640 L1620 520 L1920 645 L1920 800 L0 800 Z" fill="#66b8a0" />
        <path d="M0 700 L340 590 L700 700 L1040 580 L1400 700 L1720 610 L1920 690 L1920 820 L0 820 Z" fill="#57a877" />

        {/* ground */}
        <rect x="0" y={GROUND_Y} width="1920" height={1080 - GROUND_Y} fill="url(#fGrass)" />
        <path d="M820 760 L1120 760 L1420 1080 L520 1080 Z" fill="#f2d9a6" />
        <path d="M870 760 L1070 760 L1240 1080 L700 1080 Z" fill="#e6c78e" />
        {/* grass tufts */}
        {Array.from({length: 40}, (_, i) => {
          const gx = ((Math.sin(i * 57.3) * 43758.5453) % 1 + 1) % 1 * 1920;
          const gy = 800 + (((i * 61) % 100) / 100) * 260;
          return (
            <g key={i} stroke="#3d9450" strokeWidth="6" fill="none" strokeLinecap="round">
              <path d={`M ${gx} ${gy} l -8 -22`} />
              <path d={`M ${gx} ${gy} l 0 -26`} />
              <path d={`M ${gx} ${gy} l 8 -22`} />
            </g>
          );
        })}
        {ROCKS.map((r, i) => (
          <g key={i}>
            <ellipse cx={r.x} cy={r.y} rx={28 * r.s} ry={17 * r.s} fill="#9aa6b8" stroke={L} strokeWidth="7" />
            <path d={`M ${r.x - 14 * r.s} ${r.y - 4} q ${14 * r.s} ${-10 * r.s} ${28 * r.s} 0`} stroke="#c2ccda" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* houses */}
        {HOUSES.map((h, i) => {
          const {x, y} = h.pos;
          const w = h.w, hh = h.h, rh = h.roofH;
          const lit = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2);
          return (
            <g key={i}>
              <ellipse cx={x} cy={y + 10} rx={w * 0.6} ry={26} fill="#1f2430" opacity="0.18" />
              {/* side wall */}
              <path d={`M ${x + w / 2} ${y - hh} L ${x + w / 2 + 64} ${y - hh - 30} L ${x + w / 2 + 64} ${y - 30} L ${x + w / 2} ${y} Z`} fill="#d9c396" stroke={L} strokeWidth="9" strokeLinejoin="round" />
              <rect x={x - w / 2} y={y - hh} width={w} height={hh} rx={8} fill="url(#fWall)" stroke={L} strokeWidth="9" />
              {/* roof */}
              <path d={`M ${x - w / 2 - 36} ${y - hh + 4} L ${x + w / 2 + 76} ${y - hh - 34} L ${x + w / 2 + 60} ${y - hh - rh - 34} L ${x - w / 2 - 36} ${y - hh - rh} Z`} fill="url(#fRoof)" stroke={L} strokeWidth="9" strokeLinejoin="round" />
              <path d={`M ${x - w / 2 - 36} ${y - hh - rh * 0.42} L ${x + w / 2 + 66} ${y - hh - rh * 0.62}`} stroke={L} strokeWidth="7" opacity="0.4" fill="none" />
              {/* chimney */}
              <rect x={x + w / 2 - 60} y={y - hh - rh * 0.75} width={46} height={80} rx={6} fill="#c96a4a" stroke={L} strokeWidth="8" />
              {[0, 1, 2].map((k) => {
                const pp = ((t * 0.45 + k * 0.34 + i) % 1 + 1) % 1;
                return <circle key={k} cx={x + w / 2 - 37 + Math.sin(pp * 6) * 16} cy={y - hh - rh * 0.75 - 24 - pp * 90} r={14 + pp * 24} fill="#ffffff" opacity={(1 - pp) * 0.85} />;
              })}
              {/* windows */}
              {[0.16, 0.64].map((u, k) => (
                <g key={k}>
                  <rect x={x - w / 2 + u * w} y={y - hh + 46} width={w * 0.19} height={hh * 0.32} rx={8} fill={lit > 0.6 ? '#ffd97a' : '#bfe8ff'} stroke={L} strokeWidth="8" />
                  <path d={`M ${x - w / 2 + u * w + w * 0.095} ${y - hh + 46} l 0 ${hh * 0.32} M ${x - w / 2 + u * w} ${y - hh + 46 + hh * 0.16} l ${w * 0.19} 0`} stroke={L} strokeWidth="6" />
                </g>
              ))}
              {/* door */}
              <path d={`M ${x - 40} ${y} L ${x - 40} ${y - 86} Q ${x} ${y - 130} ${x + 40} ${y - 86} L ${x + 40} ${y} Z`} fill="#8a5a3c" stroke={L} strokeWidth="9" />
              <circle cx={x + 22} cy={y - 52} r={7} fill="#ffd97a" />
            </g>
          );
        })}

        {/* trees — flat layered circles */}
        {TREES.map((tr, i) => {
          const {x, y} = tr.pos;
          const s = tr.scale;
          const sw = sway(t, i * 0.4, 2.4, 3);
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={48 * s} ry={15 * s} fill="#1f2430" opacity="0.18" />
              <rect x={x - 14 * s} y={y - 130 * s} width={28 * s} height={130 * s} rx={12} fill="#8a5a3c" stroke={L} strokeWidth="8" />
              <g transform={`rotate(${sw} ${x} ${y - 130 * s})`}>
                <circle cx={x - 48 * s} cy={y - 165 * s} r={58 * s} fill="#4db064" stroke={L} strokeWidth="8" />
                <circle cx={x + 46 * s} cy={y - 158 * s} r={52 * s} fill="#4db064" stroke={L} strokeWidth="8" />
                <circle cx={x} cy={y - 215 * s} r={64 * s} fill="#66c47a" stroke={L} strokeWidth="8" />
                <circle cx={x - 20 * s} cy={y - 235 * s} r={34 * s} fill="#8ad99a" />
                <circle cx={x + 26 * s} cy={y - 200 * s} r={30 * s} fill="#3d9450" opacity="0.6" />
              </g>
            </g>
          );
        })}

        {/* villagers */}
        {PEOPLE.map((_, i) => <AnimePerson key={i} i={i} t={t} />)}

        {/* petals */}
        {mot.map((m, i) => (
          <g key={i} transform={`rotate(${(t * 60 + i * 51) % 360} ${m.x} ${m.y})`} opacity={m.o}>
            <ellipse cx={m.x} cy={m.y} rx={m.s * 1.3} ry={m.s * 0.7} fill="#ffc8dc" />
          </g>
        ))}
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, transparent 60%, rgba(30,40,80,0.28) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
