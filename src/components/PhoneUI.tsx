import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../data/theme';
import {FPS} from '../data/script';

const applications = [
  {role: 'Admin Toko', company: 'Toko Berkah Jaya', date: '12 Feb', status: 'DITOLAK'},
  {role: 'Kurir Paket', company: 'Kirim Cepat', date: '09 Feb', status: 'DITOLAK'},
  {role: 'Barista', company: 'Kopi Senja', date: '05 Feb', status: 'DITOLAK'},
  {role: 'Staff Gudang', company: 'Gudang Nusantara', date: '01 Feb', status: 'DITOLAK'},
  {role: 'Magang Admin', company: 'CV Maju Terus', date: '28 Jan', status: 'DITOLAK'},
];

export const PhoneUI: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 12.8 * FPS;
  const end = 25.2 * FPS;

  if (frame < start || frame > end) {
    return null;
  }

  const fade = interpolate(
    frame,
    [start, start + 18, end - 18, end],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const scroll = interpolate(frame, [start, end], [0, -250], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const appear = (index: number) =>
    interpolate(frame, [start + 16 + index * 8, start + 30 + index * 8], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  return (
    <AbsoluteFill
      style={{
        opacity: fade,
        backgroundColor: 'rgba(4, 6, 10, 0.58)',
        zIndex: 25,
        pointerEvents: 'none',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 170,
          width: 430,
          color: COLORS.cream,
          fontFamily: FONTS.body,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 15,
            letterSpacing: '0.24em',
            color: COLORS.cyan,
            marginBottom: 18,
          }}
        >
          PONSEL // 09:41
        </div>
        <div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em'}}>
          27 lamaran.
          <br />
          <span style={{color: COLORS.danger}}>0 balasan.</span>
        </div>
        <div style={{marginTop: 22, fontSize: 22, lineHeight: 1.5, color: COLORS.creamDim}}>
          Kadang yang paling melelahkan bukan ditolak.
          <br />
          Tapi menunggu tanpa jawaban.
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 230,
          top: 70,
          width: 520,
          height: 940,
          borderRadius: 52,
          background: '#101318',
          border: '10px solid #262a30',
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), inset 0 0 0 2px #3a3f46',
          transform: 'rotate(-2.2deg)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 150,
            height: 28,
            borderRadius: 16,
            background: '#080a0d',
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 14,
            borderRadius: 38,
            overflow: 'hidden',
            background: '#f4efe4',
            color: '#22252a',
            fontFamily: FONTS.body,
          }}
        >
          <div
            style={{
              padding: '38px 28px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 17,
              fontWeight: 600,
              color: '#5d6066',
            }}
          >
            <span>09:41</span>
            <span>▮▮▮ 82%</span>
          </div>

          <div style={{padding: '3px 26px 14px', display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{fontSize: 30, color: '#3a3d42'}}>←</div>
            <div style={{fontSize: 27, fontWeight: 800, letterSpacing: '-0.02em'}}>Lamaran Saya</div>
          </div>

          <div style={{display: 'flex', gap: 12, padding: '0 26px 18px'}}>
            <div style={{flex: 1, background: '#e2d9c7', borderRadius: 14, padding: '14px 16px'}}>
              <div style={{fontSize: 30, fontWeight: 800}}>27</div>
              <div style={{fontSize: 14, color: '#6b655b'}}>Terkirim</div>
            </div>
            <div style={{flex: 1, background: '#f2d9cf', borderRadius: 14, padding: '14px 16px'}}>
              <div style={{fontSize: 30, fontWeight: 800, color: '#b34139'}}>0</div>
              <div style={{fontSize: 14, color: '#8d5f56'}}>Dibalas</div>
            </div>
          </div>

          <div style={{height: 1, background: '#ddd4c4', margin: '0 26px 16px'}} />

          <div style={{transform: `translateY(${scroll}px)`}}>
            {applications.map((application, index) => (
              <div
                key={application.role}
                style={{
                  opacity: appear(index),
                  margin: '0 22px 12px',
                  padding: '18px 18px 16px',
                  borderRadius: 16,
                  background: '#fffaf0',
                  border: '1px solid #e2d9c8',
                  boxShadow: '0 4px 12px rgba(50, 40, 25, 0.06)',
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
                  <div>
                    <div style={{fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em'}}>
                      {application.role}
                    </div>
                    <div style={{fontSize: 15, color: '#777064', marginTop: 4}}>
                      {application.company} · {application.date}
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: 'flex-start',
                      padding: '5px 9px',
                      borderRadius: 7,
                      background: '#f6d6d0',
                      color: '#a4362d',
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {application.status}
                  </div>
                </div>
                <div style={{marginTop: 14, height: 3, borderRadius: 2, background: '#eadfce'}}>
                  <div
                    style={{
                      width: `${38 + index * 11}%`,
                      height: '100%',
                      borderRadius: 2,
                      background: '#c9b99e',
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              style={{
                margin: '28px 22px 0',
                padding: 22,
                textAlign: 'center',
                color: '#8c8374',
                fontSize: 15,
                lineHeight: 1.5,
              }}
            >
              Tidak ada balasan baru.
              <br />
              Coba lagi besok.
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: 22,
              right: 22,
              bottom: 18,
              height: 54,
              borderRadius: 18,
              background: '#2d3138',
              color: '#f4efe4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            }}
          >
            Cari Lowongan Baru
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
