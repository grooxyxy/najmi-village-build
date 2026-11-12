import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../../data/theme';
import {FPS} from '../../data/ep2/script';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const items = [
  {name: 'PERALATAN', detail: 'SEKOP • KAPAK • TALI • TERPAL', price: 'Rp 850.000', at: 76.8, color: '#7ca4b8'},
  {name: 'MAKANAN & AIR', detail: 'BEKAL 3 HARI • 12 LITER', price: 'Rp 420.000', at: 78.6, color: '#b88b5a'},
  {name: 'MATERIAL BANGUNAN', detail: 'PAKU • KAYU • BATU • SEMEN', price: 'Rp 1.240.000', at: 80.4, color: '#c4b37b'},
  {name: 'BIBIT TANAMAN', detail: 'SAYUR • BUAH • PADI', price: 'Rp 310.000', at: 82.2, color: '#6f8f7c'},
];

const ItemCard: React.FC<{item: (typeof items)[number]; frame: number; index: number}> = ({item, frame, index}) => {
  const show = frame >= item.at * FPS;
  const enter = interpolate(frame, [item.at * FPS, item.at * FPS + 12], [0, 1], clamp);
  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transform: `translateX(${show ? (1 - enter) * -46 : -26}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 15px',
        marginBottom: 8,
        width: 360,
        background: 'rgba(7, 15, 20, 0.78)',
        borderLeft: `3px solid ${item.color}`,
        borderTop: '1px solid rgba(255,255,255,0.09)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.26)',
      }}
    >
      <div style={{fontFamily: FONTS.mono, fontSize: 11, color: 'rgba(200,246,255,0.48)', letterSpacing: '0.12em', width: 22}}>
        0{index + 1}
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONTS.body, fontSize: 21, fontWeight: 800, color: COLORS.cream, letterSpacing: '0.02em'}}>{item.name}</div>
        <div style={{fontFamily: FONTS.mono, fontSize: 10, color: 'rgba(200,246,255,0.48)', letterSpacing: '0.1em', marginTop: 2}}>{item.detail}</div>
      </div>
      <div style={{fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: '#ffe2a2'}}>{item.price}</div>
    </div>
  );
};

const formatRupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;

export const Ep2StoreUI: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 76 * FPS;
  const end = 96 * FPS;

  if (frame < start || frame > end) {
    return null;
  }

  const t = frame / FPS;
  const montageFade = interpolate(frame, [76 * FPS, 76.5 * FPS, 83.2 * FPS, 84.0 * FPS], [0, 1, 1, 0], clamp);
  const priceIn = interpolate(frame, [83.8 * FPS, 84.3 * FPS], [0, 1], clamp);
  const priceOut = interpolate(frame, [90.0 * FPS, 90.6 * FPS], [1, 0], clamp);
  const priceOpacity = Math.min(priceIn, priceOut);
  const totalProgress = interpolate(frame, [83.8 * FPS, 84.2 * FPS], [0, 1], clamp);
  const total = 1250000 + totalProgress * 1570000;
  const stamp = interpolate(frame, [91.2 * FPS, 91.8 * FPS], [0, 1], clamp);
  const shake = frame >= 84 * FPS && frame < 84.8 * FPS ? Math.sin(frame * 2.7) * 7 : 0;

  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 41}}>
      {t < 84.1 ? (
        <div style={{position: 'absolute', top: 168, left: 76, opacity: montageFade}}>
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              letterSpacing: '0.24em',
              color: COLORS.cyan,
              marginBottom: 10,
            }}
          >
            TOKO PERKAKAS // KERANJANG
          </div>
          {items.map((item, index) => (
            <ItemCard key={item.name} item={item} frame={frame} index={index} />
          ))}
          <div
            style={{
              marginTop: 12,
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'rgba(200, 246, 255, 0.58)',
              opacity: frame >= 82 * FPS ? 1 : 0.4,
            }}
          >
            {frame >= 82 * FPS ? '5 ITEM // MENUJU KASIR' : 'MEMINDAI RAK...'}
          </div>
        </div>
      ) : null}

      {priceOpacity > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            top: 155,
            right: 90,
            width: 640,
            opacity: priceOpacity,
            transform: `translateX(${shake}px) rotate(${shake * 0.08}deg)`,
          }}
        >
          <div
            style={{
              padding: '24px 28px 26px',
              background: 'rgba(16, 10, 10, 0.87)',
              border: '2px solid rgba(255, 107, 107, 0.72)',
              boxShadow: '0 0 60px rgba(255, 70, 70, 0.24), inset 0 0 60px rgba(255, 70, 70, 0.06)',
              clipPath: 'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))',
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontFamily: FONTS.mono, fontSize: 14, letterSpacing: '0.24em', color: '#ff9b9b'}}>TOTAL BELANJA</div>
              <div style={{fontFamily: FONTS.mono, fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255, 200, 200, 0.6)'}}>
                KASIR 03 // {t < 84.4 ? 'PROSES' : 'SELESAI'}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 76,
                fontWeight: 800,
                color: '#ffe4d4',
                letterSpacing: '-0.04em',
                marginTop: 8,
                textShadow: '0 0 38px rgba(255, 120, 90, 0.38)',
              }}
            >
              {formatRupiah(total)}
            </div>
            <div style={{height: 7, background: 'rgba(255,107,107,0.18)', marginTop: 4, marginBottom: 18}}>
              <div
                style={{
                  height: '100%',
                  width: `${totalProgress * 100}%`,
                  background: '#ff6b6b',
                  boxShadow: '0 0 16px #ff6b6b',
                }}
              />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 22}}>
              <div>
                <div style={{fontFamily: FONTS.mono, fontSize: 11, color: 'rgba(255, 210, 210, 0.56)', letterSpacing: '0.14em'}}>TABUNGAN HOST</div>
                <div style={{fontFamily: FONTS.body, fontSize: 30, fontWeight: 800, color: '#ffb3a1', marginTop: 3}}>Rp 412.000</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontFamily: FONTS.mono, fontSize: 11, color: 'rgba(255, 210, 210, 0.56)', letterSpacing: '0.14em'}}>STATUS</div>
                <div style={{fontFamily: FONTS.body, fontSize: 28, fontWeight: 800, color: '#ff6b6b', marginTop: 3}}>KRITIS</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {t >= 90.3 ? (
        <div
          style={{
            position: 'absolute',
            top: 168,
            right: 92,
            width: 470,
            opacity: interpolate(frame, [90.3 * FPS, 90.8 * FPS, 95.4 * FPS, 96 * FPS], [0, 1, 1, 0], clamp),
            transform: `rotate(-2deg) translateY(${(1 - stamp) * -10}px)`,
            background: '#f2eddf',
            color: '#1c2528',
            padding: '22px 26px 26px',
            boxShadow: '0 18px 50px rgba(0,0,0,0.36)',
            fontFamily: FONTS.mono,
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed rgba(28,37,40,0.35)', paddingBottom: 10}}>
            <span style={{fontSize: 15, letterSpacing: '0.16em', fontWeight: 700}}>STRUK // TOKO PERKAKAS</span>
            <span style={{fontSize: 11}}>03/02</span>
          </div>
          {items.map((item) => (
            <div key={`receipt-${item.name}`} style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 0', borderBottom: '1px dotted rgba(28,37,40,0.18)'}}>
              <span>{item.name}</span>
              <span>{item.price}</span>
            </div>
          ))}
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, padding: '14px 0 8px'}}>
            <span>TOTAL</span>
            <span>Rp 2.820.000</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingTop: 8, borderTop: '2px dashed rgba(28,37,40,0.35)', color: '#a54032', fontWeight: 800}}>
            <span>SALDO TABUNGAN</span>
            <span>Rp 412.000</span>
          </div>
          <div
            style={{
              marginTop: 16,
              display: 'inline-block',
              border: '3px solid #a54032',
              color: '#a54032',
              transform: 'rotate(-6deg)',
              padding: '5px 12px',
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: '0.1em',
              opacity: stamp,
            }}
          >
            KOMITMEN: 100%
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
