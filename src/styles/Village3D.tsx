import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GROUND_Y, HOUSES, PEOPLE, TREES, ROCKS, personPos, STAGE_W, STAGE_H} from '../scene';
import {blink, bob, breathe, cloudX, easeOut, loopT, motes, smooth, sway} from '../helpers';

// ---------------------------------------------------------------------------
// Style 2 — 3D (fake isometric CGI look)
// Built from CSS 3D transforms: each house is a real box with 4 walls + roof
// slabs, the camera slowly orbits, and people are billboarded planes.
// ---------------------------------------------------------------------------

const GROUND_DEPTH = 1400;

const Box: React.FC<{
  w: number; h: number; d: number;
  x: number; y: number;      // base center on ground
  colors: {front: string; side: string; top: string};
  children?: React.ReactNode;
}> = ({w, h, d, x, y, colors, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h,
      width: w,
      height: h,
      transformStyle: 'preserve-3d',
    }}
  >
    {/* front */}
    <div style={{position: 'absolute', inset: 0, background: colors.front, transform: `translateZ(${d / 2}px)`, boxShadow: 'inset -18px 0 30px rgba(0,0,0,0.25)'}} />
    {/* back */}
    <div style={{position: 'absolute', inset: 0, background: colors.side, transform: `translateZ(${-d / 2}px) rotateY(180deg)`}} />
    {/* left */}
    <div style={{position: 'absolute', left: 0, top: 0, width: d, height: h, background: colors.side, transformOrigin: 'left center', transform: 'rotateY(-90deg)', boxShadow: 'inset -24px 0 34px rgba(0,0,0,0.3)'}} />
    {/* right */}
    <div style={{position: 'absolute', right: 0, top: 0, width: d, height: h, background: colors.side, transformOrigin: 'right center', transform: 'rotateY(90deg)', boxShadow: 'inset 24px 0 34px rgba(0,0,0,0.22)'}} />
    {/* top */}
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: d, background: colors.top, transformOrigin: 'top center', transform: 'rotateX(90deg)'}} />
    {children}
  </div>
);

const House3D: React.FC<{i: number; t: number}> = ({i, t}) => {
  const h = HOUSES[i];
  const {x, y} = h.pos;
  const lit = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 2);
  const win = lit > 0.6 ? '#ffd97a' : '#8fd4ff';
  return (
    <>
      {/* walls */}
      <Box
        w={h.w} h={h.h} d={h.w * 0.8} x={x} y={y}
        colors={{front: h.hue, side: '#c2ab82', top: '#b9a177'}}
      >
        {/* windows on front face */}
        {[0.24, 0.72].map((u, k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: `${u * 100 - 8}%`,
              top: '26%',
              width: '17%',
              height: '30%',
              background: win,
              border: '6px solid #6b4423',
              transform: `translateZ(${h.w * 0.4 + 4}px)`,
              boxShadow: `0 0 ${28 * lit}px rgba(255,210,120,${0.7 * lit})`,
            }}
          />
        ))}
        {/* door */}
        <div
          style={{
            position: 'absolute',
            left: '42%',
            bottom: 0,
            width: '16%',
            height: '46%',
            background: '#6b4423',
            borderRadius: '40% 40% 0 0',
            transform: `translateZ(${h.w * 0.4 + 4}px)`,
          }}
        />
      </Box>
      {/* roof: two slabs forming a gable */}
      {[-1, 1].map((side) => (
        <div
          key={side}
          style={{
            position: 'absolute',
            left: x - h.w / 2 - 26,
            top: y - h.h - h.roofH,
            width: h.w + 52,
            height: h.roofH * 1.45,
            background: side > 0 ? h.roof : '#7a3d21',
            transformOrigin: side > 0 ? 'bottom center' : 'bottom center',
            transform: `translateZ(${side * (h.w * 0.4 + 6)}px) rotateX(${side * -48}deg) translateY(${side > 0 ? 0 : 0}px)`,
            boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.2)',
          }}
        />
      ))}
      {/* ridge beam */}
      <div
        style={{
          position: 'absolute',
          left: x - h.w / 2 - 30,
          top: y - h.h - h.roofH - 12,
          width: h.w + 60,
          height: 18,
          background: '#5f3018',
          transform: `translateZ(0px)`,
        }}
      />
      {/* chimney smoke (billboard puffs) */}
      {[0, 1, 2].map((k) => {
        const p = loopT(t * 0.45 + k * 0.34 + i, 1);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x + h.w / 2 - 96,
              top: y - h.h - h.roofH - 30 - p * 90,
              width: 26 + p * 34,
              height: 26 + p * 34,
              borderRadius: '50%',
              background: 'rgba(240,240,255,0.75)',
              filter: 'blur(3px)',
              opacity: 1 - p,
            }}
          />
        );
      })}
    </>
  );
};

const Tree3D: React.FC<{i: number; t: number}> = ({i, t}) => {
  const tr = TREES[i];
  const {x, y} = tr.pos;
  const s = tr.scale;
  const sw = sway(t, i * 0.4, 2.4, 3);
  return (
    <div style={{position: 'absolute', left: x, top: y, transformStyle: 'preserve-3d'}}>
      <div
        style={{
          position: 'absolute',
          left: -12 * s,
          top: -100 * s,
          width: 24 * s,
          height: 100 * s,
          background: 'linear-gradient(90deg,#5a3b1e,#7a5230)',
          borderRadius: 6,
        }}
      />
      <div style={{position: 'absolute', left: 0, top: -120 * s, transform: `rotate(${sw}deg)`, transformOrigin: 'bottom center'}}>
        {[
          {dx: -60, dy: -40, r: 66, c: '#2f7a3f'},
          {dx: 55, dy: -34, r: 58, c: '#3c8f49'},
          {dx: 0, dy: -80, r: 72, c: '#43934f'},
          {dx: -20, dy: -120, r: 52, c: '#4fae5a'},
        ].map((b, k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: b.dx * s - b.r * s,
              top: b.dy * s - b.r * s,
              width: b.r * 2 * s,
              height: b.r * 2 * s,
              borderRadius: '50%',
              background: `radial-gradient(circle at 34% 30%, #6fd07a, ${b.c} 65%)`,
              filter: 'saturate(1.1)',
            }}
          />
        ))}
      </div>
      {/* billboard trunk base shadow */}
      <div style={{position: 'absolute', left: -50 * s, top: -12, width: 100 * s, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.28)', filter: 'blur(6px)'}} />
    </div>
  );
};

const Person3D: React.FC<{i: number; t: number}> = ({i, t}) => {
  const p = PEOPLE[i];
  const {x, y} = personPos(p, t);
  const s = p.scale;
  const br = breathe(t, p.phase);
  const bl = blink(t, p.phase);
  const walkPh = p.walk ? Math.sin(t * 4 + p.phase * 3) : 0;
  const bobY = p.walk ? Math.abs(Math.sin(t * 4 + p.phase * 3)) * 8 : bob(t, p.phase, 3);
  const armA = p.walk ? walkPh * 32 : Math.sin(t * 1.5 + p.phase) * 7;
  const legA = p.walk ? walkPh * 26 : 0;
  const H = 250 * s * br;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translateZ(${60 + i * 14}px) translateY(${-bobY}px)`}}>
      {/* ground shadow */}
      <div style={{position: 'absolute', left: -60 * s, top: -14, width: 120 * s, height: 30, borderRadius: '50%', background: 'rgba(20,30,20,0.35)', filter: 'blur(8px)'}} />
      {/* legs */}
      <div style={{position: 'absolute', left: -34 * s, top: -96 * s, width: 26 * s, height: 96 * s, background: '#2c3a6e', borderRadius: 10, transform: `rotate(${legA}deg)`, transformOrigin: 'top center'}} />
      <div style={{position: 'absolute', left: 8 * s, top: -96 * s, width: 26 * s, height: 96 * s, background: '#22305c', borderRadius: 10, transform: `rotate(${-legA}deg)`, transformOrigin: 'top center'}} />
      {/* body */}
      <div
        style={{
          position: 'absolute',
          left: -52 * s,
          top: -H,
          width: 104 * s,
          height: 128 * s,
          background: `linear-gradient(105deg, ${p.body}, rgba(0,0,0,0.35))`,
          borderRadius: '46% 46% 30% 30%',
          boxShadow: 'inset -14px -8px 22px rgba(0,0,0,0.28)',
        }}
      />
      {/* arms */}
      <div style={{position: 'absolute', left: -76 * s, top: -H + 14 * s, width: 26 * s, height: 104 * s, background: p.body, borderRadius: 14, transform: `rotate(${armA}deg)`, transformOrigin: 'top center'}} />
      <div style={{position: 'absolute', left: 50 * s, top: -H + 14 * s, width: 26 * s, height: 104 * s, background: p.body, borderRadius: 14, transform: `rotate(${-armA}deg)`, transformOrigin: 'top center'}} />
      {/* head */}
      <div
        style={{
          position: 'absolute',
          left: -42 * s,
          top: -H - 84 * s,
          width: 84 * s,
          height: 92 * s,
          background: 'radial-gradient(circle at 36% 30%, #ffe4c4, #f4c8a0 70%)',
          borderRadius: '50%',
          boxShadow: 'inset -10px -6px 16px rgba(160,100,70,0.35)',
        }}
      >
        {/* hair */}
        <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '44%', background: p.hair, borderRadius: '50% 50% 40% 40%'}} />
        {p.hat === 'pointy' && (
          <div style={{position: 'absolute', left: '8%', top: '-58%', width: '84%', height: '70%', background: 'linear-gradient(#7a6ff0,#4a3fc0)', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)'}} />
        )}
        {p.hat === 'cap' && (
          <div style={{position: 'absolute', left: '-6%', top: '-14%', width: '112%', height: '36%', background: '#39424f', borderRadius: '50% 50% 12% 12%'}} />
        )}
        {/* eyes */}
        {bl > 0.5 ? (
          <>
            <div style={{position: 'absolute', left: '24%', top: '52%', width: '20%', height: 4, background: '#1a1428'}} />
            <div style={{position: 'absolute', left: '56%', top: '52%', width: '20%', height: 4, background: '#1a1428'}} />
          </>
        ) : (
          <>
            <div style={{position: 'absolute', left: '24%', top: '46%', width: '16%', height: '22%', background: '#fff', borderRadius: '50%'}}>
              <div style={{position: 'absolute', left: '30%', top: '30%', width: '46%', height: '50%', background: '#1a1428', borderRadius: '50%'}} />
            </div>
            <div style={{position: 'absolute', left: '60%', top: '46%', width: '16%', height: '22%', background: '#fff', borderRadius: '50%'}}>
              <div style={{position: 'absolute', left: '24%', top: '30%', width: '46%', height: '50%', background: '#1a1428', borderRadius: '50%'}} />
            </div>
          </>
        )}
        {/* smile */}
        <div style={{position: 'absolute', left: '36%', top: '74%', width: '28%', height: '12%', borderBottom: '5px solid #a85a52', borderRadius: '0 0 60% 60%'}} />
      </div>
    </div>
  );
};

export const Village3D: React.FC<{t: number}> = ({t}) => {
  // slow orbit + gentle bob of the whole world
  const yaw = Math.sin(t * 0.22) * 7;
  const pitch = 9 + Math.sin(t * 0.31) * 1.6;
  const mot = motes(t, 16, 2);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#243b8f 0%, #6f8ae0 38%, #f7b98a 72%, #ffd9a0 100%)', overflow: 'hidden'}}>
      {/* sun */}
      <div style={{position: 'absolute', right: 240, top: 110, width: 170, height: 170, borderRadius: '50%', background: 'radial-gradient(circle, #fff7d0 0%, #ffd97a 55%, rgba(255,190,90,0) 72%)', boxShadow: '0 0 140px 60px rgba(255,200,110,0.55)'}} />
      {/* clouds */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', left: cloudX(i, t), top: 110 + (i % 3) * 80, transform: `scale(${0.7 + (i % 3) * 0.35})`}}>
          {[{dx: 0, dy: 20, w: 150, h: 54}, {dx: 40, dy: -8, w: 110, h: 64}, {dx: 110, dy: 16, w: 90, h: 46}].map((b, k) => (
            <div key={k} style={{position: 'absolute', left: b.dx, top: b.dy, width: b.w, height: b.h, borderRadius: 999, background: 'rgba(255,255,255,0.92)', filter: 'blur(2px)'}} />
          ))}
        </div>
      ))}
      {/* 3D world */}
      <div style={{position: 'absolute', inset: 0, perspective: '1600px', perspectiveOrigin: '50% 34%'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg) translateY(60px)`,
          }}
        >
          {/* ground plane */}
          <div
            style={{
              position: 'absolute',
              left: -200,
              top: GROUND_Y - 40,
              width: STAGE_W + 400,
              height: GROUND_DEPTH,
              transformOrigin: 'top center',
              transform: 'rotateX(90deg)',
              background: 'linear-gradient(#57b866 0%, #49a75a 40%, #3d9450 100%)',
              boxShadow: 'inset 0 60px 90px rgba(0,0,0,0.12)',
            }}
          >
            {/* dirt road strip */}
            <div style={{position: 'absolute', left: '40%', top: 0, width: '20%', height: '100%', background: 'linear-gradient(#c9a06a,#a87f52)'}} />
            {/* grass speckle */}
            {Array.from({length: 60}, (_, i) => (
              <div key={i} style={{position: 'absolute', left: `${(Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * 100}%`, top: `${((i * 37) % 100)}%`, width: 10, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.16)'}} />
            ))}
          </div>
          {/* distant hills (flat billboards far back) */}
          <div style={{position: 'absolute', left: -100, top: GROUND_Y - 330, width: STAGE_W + 200, height: 340, transform: 'translateZ(-700px)', background: 'linear-gradient(transparent 30%, #2f6a4f 31%)', clipPath: 'polygon(0 60%, 12% 34%, 26% 56%, 40% 26%, 55% 52%, 70% 30%, 84% 54%, 100% 38%, 100% 100%, 0 100%)', opacity: 0.9}} />
          {ROCKS.map((r, i) => (
            <div key={i} style={{position: 'absolute', left: r.x, top: r.y, width: 40 * r.s, height: 26 * r.s, background: '#7f8a9a', borderRadius: '40% 50% 30% 40%', transform: 'translateZ(20px)'}} />
          ))}
          {[0, 1, 2].map((i) => <House3D key={i} i={i} t={t} />)}
          {TREES.map((_, i) => <Tree3D key={i} i={i} t={t} />)}
          {PEOPLE.map((_, i) => <Person3D key={i} i={i} t={t} />)}
          {/* floating motes as tiny glints */}
          {mot.map((m, i) => (
            <div key={i} style={{position: 'absolute', left: m.x, top: m.y, width: m.s, height: m.s, borderRadius: '50%', background: '#fff7d0', opacity: m.o, transform: 'translateZ(300px)', filter: 'blur(1px)'}} />
          ))}
        </div>
      </div>
      {/* cinematic grade */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(10,8,30,0.55) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(120,160,255,0.12), transparent 30%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
