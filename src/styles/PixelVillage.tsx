import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GROUND_Y, HOUSES, PEOPLE, TREES, ROCKS, personPos} from '../scene';
import {blink, bob, breathe, cloudX, easeOut, loopT, motes, smooth, sway} from '../helpers';

// ---------------------------------------------------------------------------
// Style 1 — 16-bit PIXEL ART
// Everything is drawn on a coarse grid: shapes snap to 8px cells, palette is
// quantized, and we add a subtle scanline + dither overlay.
// ---------------------------------------------------------------------------

const PX = 8; // pixel block size
const snap = (v: number) => Math.round(v / PX) * PX;

const C = {
  skyTop: '#2a2a6e',
  skyMid: '#5a6ac0',
  skyLow: '#f4a97c',
  sun: '#ffd97a',
  cloud: '#e8e0f8',
  hillFar: '#3d4a8a',
  hillNear: '#2f6a4f',
  grass: '#4fae5a',
  grassDk: '#3c8f49',
  dirt: '#c9a06a',
  dirtDk: '#a87f52',
  wall: '#e8d3a8',
  wallSh: '#c9b287',
  roof: '#a0522d',
  roofSh: '#7a3d21',
  wood: '#6b4423',
  win: '#8fd4ff',
  winLit: '#ffd97a',
  leaf: '#2f7a3f',
  leafLt: '#43934f',
  trunk: '#5a3b1e',
  skin: '#f4c8a0',
  outline: '#1a1428',
};

const Rect: React.FC<{x: number; y: number; w: number; h: number; c: string}> = ({x, y, w, h, c}) => (
  <rect x={snap(x)} y={snap(y)} width={Math.max(PX, snap(w))} height={Math.max(PX, snap(h))} fill={c} />
);

const cloudP = (x: number, y: number, s: number, c: string) => (
  <g key={`${x}-${y}`}>
    <Rect x={x} y={y + 16 * s} w={96 * s} h={24 * s} c={c} />
    <Rect x={x + 16 * s} y={y} w={64 * s} h={24 * s} c={c} />
    <Rect x={x + 32 * s} y={y - 12 * s} w={32 * s} h={16 * s} c={c} />
  </g>
);

const houseP = (i: number, t: number) => {
  const h = HOUSES[i];
  const {x, y} = h.pos;
  const w = h.w, hh = h.h, rh = h.roofH;
  const lit = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 2);
  const winC = lit > 0.6 ? C.winLit : C.win;
  return (
    <g key={i}>
      {/* shadow */}
      <Rect x={x - w / 2 - 8} y={y - 8} w={w + 16} h={24} c={C.grassDk} />
      {/* wall */}
      <Rect x={x - w / 2} y={y - hh} w={w} h={hh} c={C.wall} />
      <Rect x={x + w / 2 - 24} y={y - hh} w={24} h={hh} c={C.wallSh} />
      {/* roof: stepped triangle */}
      {Array.from({length: Math.ceil(rh / PX)}, (_, r) => {
        const grow = (r / Math.ceil(rh / PX)) * (w / 2 + 24);
        return <Rect key={r} x={x - w / 2 - 24 + grow} y={y - hh - (r + 1) * PX} w={(w + 48) - grow * 2} h={PX} c={r % 2 ? C.roofSh : C.roof} />;
      })}
      {/* door */}
      <Rect x={x - 24} y={y - 72} w={48} h={72} c={C.wood} />
      <Rect x={x - 8} y={y - 44} w={8} h={8} c={C.winLit} />
      {/* windows */}
      <Rect x={x - w / 2 + 28} y={y - hh + 40} w={48} h={40} c={winC} />
      <Rect x={x + w / 2 - 76} y={y - hh + 40} w={48} h={40} c={winC} />
      <Rect x={x - w / 2 + 48} y={y - hh + 40} w={8} h={40} c={C.outline} />
      <Rect x={x + w / 2 - 56} y={y - hh + 40} w={8} h={40} c={C.outline} />
      {/* chimney + smoke */}
      <Rect x={x + w / 2 - 90} y={y - hh - rh - 16} w={32} h={56} c={C.roofSh} />
      {[0, 1, 2].map((k) => {
        const p = loopT(t * 0.5 + k * 0.33 + i, 1);
        return <Rect key={k} x={x + w / 2 - 84 + Math.sin(p * 6) * 10} y={y - hh - rh - 30 - p * 70} w={16 + p * 16} h={16 + p * 16} c={C.cloud} />;
      })}
    </g>
  );
};

const treeP = (i: number, t: number) => {
  const tr = TREES[i];
  const {x, y} = tr.pos;
  const s = tr.scale;
  const sw = sway(t, i * 0.4, 2, 3);
  return (
    <g key={i}>
      <Rect x={x - 10 * s} y={y - 90 * s} w={20 * s} h={90 * s} c={C.trunk} />
      <g transform={`rotate(${sw} ${x} ${y - 90 * s})`}>
        <Rect x={x - 56 * s} y={y - 176 * s} w={112 * s} h={56 * s} c={C.leaf} />
        <Rect x={x - 40 * s} y={y - 208 * s} w={80 * s} h={40 * s} c={C.leafLt} />
        <Rect x={x - 24 * s} y={y - 232 * s} w={48 * s} h={32 * s} c={C.leaf} />
      </g>
    </g>
  );
};

const personP = (i: number, t: number) => {
  const p = PEOPLE[i];
  const {x, y} = personPos(p, t);
  const s = p.scale;
  const br = breathe(t, p.phase);
  const bl = blink(t, p.phase);
  const walkPh = p.walk ? Math.sin((t * 4 + p.phase * 3) % (Math.PI * 2)) : 0;
  const armA = p.walk ? walkPh * 30 : Math.sin(t * 1.5 + p.phase) * 6;
  const legA = p.walk ? walkPh * 24 : 0;
  const h = 120 * s * br;
  return (
    <g key={i}>
      <Rect x={x - 34 * s} y={y - 8} w={68 * s} h={16} c={C.grassDk} />
      {/* legs */}
      <g transform={`rotate(${legA} ${x} ${y - 46 * s})`}>
        <Rect x={x - 20 * s} y={y - 52 * s} w={16 * s} h={52 * s} c="#2c3a6e" />
      </g>
      <g transform={`rotate(${-legA} ${x} ${y - 46 * s})`}>
        <Rect x={x + 4 * s} y={y - 52 * s} w={16 * s} h={52 * s} c="#2c3a6e" />
      </g>
      {/* body */}
      <Rect x={x - 30 * s} y={y - h} w={60 * s} h={64 * s} c={p.body} />
      <Rect x={x + 14 * s} y={y - h} w={16 * s} h={64 * s} c="#00000033" />
      {/* arms */}
      <g transform={`rotate(${armA} ${x - 26 * s} ${y - h + 12 * s})`}>
        <Rect x={x - 42 * s} y={y - h + 8 * s} w={16 * s} h={52 * s} c={p.body} />
        <Rect x={x - 42 * s} y={y - h + 56 * s} w={16 * s} h={14 * s} c={C.skin} />
      </g>
      <g transform={`rotate(${-armA} ${x + 26 * s} ${y - h + 12 * s})`}>
        <Rect x={x + 26 * s} y={y - h + 8 * s} w={16 * s} h={52 * s} c={p.body} />
        <Rect x={x + 26 * s} y={y - h + 56 * s} w={16 * s} h={14 * s} c={C.skin} />
      </g>
      {/* head */}
      <Rect x={x - 24 * s} y={y - h - 56 * s} w={48 * s} h={52 * s} c={C.skin} />
      {/* hair / hat */}
      <Rect x={x - 26 * s} y={y - h - 62 * s} w={52 * s} h={16 * s} c={p.hair} />
      {p.hat === 'pointy' && (
        <>
          <Rect x={x - 24 * s} y={y - h - 84 * s} w={48 * s} h={12 * s} c="#5a4fcf" />
          <Rect x={x - 16 * s} y={y - h - 96 * s} w={32 * s} h={12 * s} c="#5a4fcf" />
          <Rect x={x - 8 * s} y={y - h - 106 * s} w={16 * s} h={10 * s} c="#7a6ff0" />
        </>
      )}
      {p.hat === 'cap' && <Rect x={x - 30 * s} y={y - h - 74 * s} w={60 * s} h={12 * s} c="#39424f" />}
      {/* eyes (2px each), blink closes them */}
      {bl > 0.5 ? (
        <>
          <Rect x={x - 16 * s} y={y - h - 36 * s} w={14 * s} h={4} c={C.outline} />
          <Rect x={x + 4 * s} y={y - h - 36 * s} w={14 * s} h={4} c={C.outline} />
        </>
      ) : (
        <>
          <Rect x={x - 14 * s} y={y - h - 40 * s} w={10 * s} h={14 * s} c={C.outline} />
          <Rect x={x + 6 * s} y={y - h - 40 * s} w={10 * s} h={14 * s} c={C.outline} />
        </>
      )}
      <Rect x={x - 6 * s} y={y - h - 18 * s} w={16 * s} h={4} c="#a85a52" />
    </g>
  );
};

export const PixelVillage: React.FC<{t: number}> = ({t}) => {
  const mot = motes(t, 14, 1);
  return (
    <AbsoluteFill style={{backgroundColor: C.skyMid}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" shapeRendering="crispEdges">
        {/* sky bands (quantized gradient) */}
        {Array.from({length: 14}, (_, i) => {
          const u = i / 13;
          const c = u < 0.45 ? C.skyTop : u < 0.8 ? C.skyMid : C.skyLow;
          return <rect key={i} x={0} y={i * 80} width={1920} height={80} fill={c} opacity={u < 0.45 ? 1 : u < 0.8 ? 1 : 1} />;
        })}
        {/* pixel sun */}
        <g>
          {Array.from({length: 7}, (_, r) => (
            <Rect key={r} x={1560 - (7 - Math.abs(r - 3)) * 12} y={140 + r * 16} w={(7 - Math.abs(r - 3)) * 24} h={16} c={C.sun} />
          ))}
        </g>
        {CLOUDS_KEYS.map((i) => cloudP(cloudX(i, t), 130 + (i % 3) * 70, 0.8 + (i % 3) * 0.3, C.cloud))}
        {/* far hills */}
        <path d="M0 640 L240 540 L480 620 L760 520 L1020 610 L1300 530 L1600 620 L1920 560 L1920 760 L0 760 Z" fill={C.hillFar} />
        {/* ground */}
        <Rect x={0} y={GROUND_Y} w={1920} h={1080 - GROUND_Y} c={C.grass} />
        {/* dirt path (stepped) */}
        <path d="M760 760 L1160 760 L1420 1080 L520 1080 Z" fill={C.dirt} />
        <path d="M840 760 L1080 760 L1240 1080 L700 1080 Z" fill={C.dirtDk} opacity="0.35" />
        {/* grass dither rows */}
        {Array.from({length: 12}, (_, r) => (
          <g key={r} opacity="0.35">
            {Array.from({length: 26}, (_, cix) =>
              (cix + r) % 2 === 0 ? (
                <Rect key={cix} x={cix * 76 + (r % 2) * 38} y={GROUND_Y + 24 + r * 26} w={8} h={8} c={C.grassDk} />
              ) : null
            )}
          </g>
        ))}
        {ROCKS.map((r, i) => (
          <Rect key={i} x={r.x} y={r.y} w={24 * r.s + 16} h={16 * r.s + 8} c={i % 2 ? '#7f8a9a' : '#69748a'} />
        ))}
        {[0, 1, 2].map((i) => houseP(i, t))}
        {TREES.map((_, i) => treeP(i, t))}
        {/* path stones */}
        {[0, 1, 2, 3, 4].map((i) => {
          const u = i / 5;
          const sx = 960 + Math.sin(u * 3) * 30;
          return <Rect key={i} x={sx - 30 + u * 40} y={790 + u * 250} w={60} h={26} c={C.dirtDk} />;
        })}
        {PEOPLE.map((_, i) => personP(i, t))}
        {/* floating motes */}
        {mot.map((m, i) => (
          <Rect key={i} x={m.x} y={m.y} w={m.s * 2} h={m.s * 2} c="#fff7d0" />
        ))}
      </svg>
      {/* scanlines */}
      <AbsoluteFill
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 6px)',
          pointerEvents: 'none',
        }}
      />
      {/* vignette */}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(10,6,30,0.6)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const CLOUDS_KEYS = [0, 1, 2, 3, 4, 5];
