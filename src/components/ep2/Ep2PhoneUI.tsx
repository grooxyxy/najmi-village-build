import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../data/theme';
import {FPS} from '../../data/ep2/script';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Row: React.FC<{
  index: number;
  title: string;
  subtitle: string;
  price: string;
  showAt: number;
  checkAt: number;
  frame: number;
  color: string;
}> = ({index, title, subtitle, price, showAt, checkAt, frame, color}) => {
  const show = frame >= showAt * FPS;
  const checked = frame >= checkAt * FPS;
  const inAnim = interpolate(frame, [showAt * FPS, showAt * FPS + 12], [0, 1], clamp);
  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: `translateX(${show ? (1 - inAnim) * 38 : 24}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 4px',
        borderBottom: '1px solid rgba(32, 54, 70, 0.14)',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          display: 'grid',
          placeItems: 'center',
          background: `${color}18`,
          border: `1px solid ${color}55`,
          color,
          fontFamily: FONTS.mono,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {['01', '02', '03', '04'][index]}
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONTS.body, fontSize: 20, color: '#16242c', fontWeight: 700}}>{title}</div>
        <div style={{fontFamily: FONTS.mono, fontSize: 11, color: 'rgba(22, 36, 44, 0.52)', letterSpacing: '0.06em', marginTop: 2}}>
          {subtitle}
        </div>
      </div>
      <div style={{textAlign: 'right'}}>
        <div style={{fontFamily: FONTS.mono, fontSize: 13, color: checked ? '#237a57' : '#6b7680', fontWeight: 700}}>{price}</div>
        <div
          style={{
            marginTop: 6,
            width: 20,
            height: 20,
            marginLeft: 'auto',
            borderRadius: 5,
            border: `1.5px solid ${checked ? '#237a57' : '#9aa6ac'}`,
            background: checked ? '#237a57' : 'transparent',
            color: '#f4fff8',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {checked ? '✓' : ''}
        </div>
      </div>
    </div>
  );
};

export const Ep2PhoneUI: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 60 * FPS;
  const end = 76 * FPS;

  if (frame < start || frame > end) {
    return null;
  }

  const fade = interpolate(frame, [start, start + 14, end - 14, end], [0, 1, 1, 0], clamp);
  const enter = interpolate(frame, [start, start + 24], [0, 1], clamp);
  const float = Math.sin(frame / 26) * 5;
  const pulse = 0.55 + Math.sin(frame / 8) * 0.2;
  const count = [62.0, 65.5, 69.5, 73.0].filter((time) => frame >= time * FPS).length;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 42}}>
      <div
        style={{
          position: 'absolute',
          top: 178 + float,
          right: 112,
          width: 520,
          height: 730,
          opacity: fade,
          transform: `perspective(1400px) rotateY(-8deg) rotateZ(-3deg) translateY(${(1 - enter) * 70}px) scale(${0.96 + enter * 0.04})`,
          transformOrigin: '50% 70%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -30,
            background: 'radial-gradient(ellipse at center, rgba(102, 238, 255, 0.22), transparent 68%)',
            filter: 'blur(10px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 46,
            background: 'linear-gradient(145deg, #26353d 0%, #0b1217 45%, #334a54 100%)',
            padding: 13,
            boxShadow: '0 36px 80px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255,255,255,0.12)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 110,
              height: 24,
              borderRadius: 18,
              background: '#0a0d10',
              zIndex: 5,
            }}
          />
          <div
            style={{
              height: '100%',
              borderRadius: 35,
              background: 'linear-gradient(175deg, #f7fbf6 0%, #e9f2ec 52%, #dbe9e4 100%)',
              overflow: 'hidden',
              position: 'relative',
              color: '#16242c',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(20, 50, 40, 0.028) 0px, rgba(20, 50, 40, 0.028) 1px, transparent 1px, transparent 4px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                padding: '20px 26px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: FONTS.mono,
                fontSize: 12,
                color: 'rgba(22, 36, 44, 0.65)',
                fontWeight: 700,
              }}
            >
              <span>09:41</span>
              <span style={{letterSpacing: '0.1em'}}>PORTAL // 4G</span>
              <span>▮▮▮ 78%</span>
            </div>
            <div style={{padding: '12px 26px 0', display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{fontSize: 26, color: '#192b33', lineHeight: 1}}>←</div>
              <div>
                <div style={{fontFamily: FONTS.body, fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em'}}>CATATAN BELANJA</div>
                <div style={{fontFamily: FONTS.mono, fontSize: 11, color: 'rgba(22, 36, 44, 0.5)', letterSpacing: '0.08em', marginTop: 2}}>
                  MISI: PERSIAPAN DUNIA BARU
                </div>
              </div>
            </div>
            <div style={{padding: '18px 26px 0'}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '13px 16px',
                  borderRadius: 14,
                  background: 'linear-gradient(120deg, rgba(28, 102, 88, 0.12), rgba(127, 231, 255, 0.1))',
                  border: '1px solid rgba(28, 102, 88, 0.18)',
                }}
              >
                <div>
                  <div style={{fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(22, 36, 44, 0.48)', letterSpacing: '0.12em'}}>PROGRESS BELANJA</div>
                  <div style={{fontFamily: FONTS.body, fontSize: 18, fontWeight: 800, color: '#1c6658'}}>{count} / 4 KATEGORI</div>
                </div>
                <div style={{width: 120, height: 8, background: 'rgba(28, 102, 88, 0.16)', borderRadius: 5}}>
                  <div style={{width: `${(count / 4) * 100}%`, height: '100%', background: '#1c6658', borderRadius: 5, transition: 'none'}} />
                </div>
              </div>
            </div>
            <div style={{padding: '5px 26px 0'}}>
              <Row index={0} title="Peralatan" subtitle="SEKOP • KAPAK • TALI • TERPAL" price="Rp 850.000" showAt={60.7} checkAt={62.0} frame={frame} color="#b97835" />
              <Row index={1} title="Makanan & Air" subtitle="BEKAL 3 HARI • 12 LITER AIR" price="Rp 420.000" showAt={64.2} checkAt={65.5} frame={frame} color="#3d8b67" />
              <Row index={2} title="Material Bangunan" subtitle="PAKU • KAYU • BATU • SEMEN" price="Rp 1.240.000" showAt={67.8} checkAt={69.5} frame={frame} color="#657887" />
              <Row index={3} title="Bibit Tanaman" subtitle="SAYUR • BUAH • PADI" price="Rp 310.000" showAt={71.4} checkAt={73.0} frame={frame} color="#4c7b3f" />
            </div>
            <div style={{padding: '22px 26px 0'}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderRadius: 16,
                  background: frame >= 73 * FPS ? 'linear-gradient(120deg, #1c4d4a, #1c6658)' : 'rgba(22, 36, 44, 0.06)',
                  color: frame >= 73 * FPS ? '#f4fff8' : 'rgba(22, 36, 44, 0.42)',
                  boxShadow: frame >= 73 * FPS ? `0 10px 26px rgba(28, 102, 88, 0.3)` : 'none',
                }}
              >
                <div>
                  <div style={{fontFamily: FONTS.mono, fontSize: 10, letterSpacing: '0.14em', opacity: 0.7}}>ESTIMASI TOTAL</div>
                  <div style={{fontFamily: FONTS.body, fontSize: 28, fontWeight: 800}}>{frame >= 73 * FPS ? 'Rp 2.820.000' : 'CEK HARGA'}</div>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    display: 'grid',
                    placeItems: 'center',
                    background: frame >= 73 * FPS ? 'rgba(255,255,255,0.14)' : 'rgba(28, 102, 88, 0.12)',
                    fontFamily: FONTS.mono,
                    fontSize: 22,
                    color: frame >= 73 * FPS ? '#f4fff8' : '#1c6658',
                    opacity: pulse,
                  }}
                >
                  →
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                left: 26,
                right: 26,
                bottom: 22,
                display: 'flex',
                justifyContent: 'center',
                gap: 10,
                opacity: 0.35,
              }}
            >
              {[0, 1, 2].map((dot) => (
                <span key={`dot-${dot}`} style={{width: 7, height: 7, borderRadius: 4, background: dot === 0 ? '#1c6658' : '#a6b4b0'}} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
