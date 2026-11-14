import React from 'react';
import {AbsoluteFill, Composition, useCurrentFrame, useVideoConfig} from 'remotion';
import {PixelVillage} from './styles/PixelVillage';
import {Village3D} from './styles/Village3D';
import {StickmanHybrid} from './styles/StickmanHybrid';
import {WatercolorVillage} from './styles/WatercolorVillage';
import {FlatAnimeVillage} from './styles/FlatAnimeVillage';

const FPS = 30;
const DUR = 150; // 5 s each

const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps;
};

// --- individual style compositions ---
const C1: React.FC = () => <PixelVillage t={useT()} />;
const C2: React.FC = () => <Village3D t={useT()} />;
const C3: React.FC = () => <StickmanHybrid t={useT()} />;
const C4: React.FC = () => <WatercolorVillage t={useT()} />;
const C5: React.FC = () => <FlatAnimeVillage t={useT()} />;

const STYLES: {id: string; name: string; Comp: React.FC<{t: number}>; tint: string}[] = [
  {id: 'pixel', name: '1 · PIXEL 16-BIT', Comp: PixelVillage, tint: '#5a6ac0'},
  {id: '3d', name: '2 · 3D CGI', Comp: Village3D, tint: '#243b8f'},
  {id: 'stickman', name: '3 · STICKMAN + 3D', Comp: StickmanHybrid, tint: '#3f7fd0'},
  {id: 'watercolor', name: '4 · WATERCOLOR', Comp: WatercolorVillage, tint: '#c9b287'},
  {id: 'anime', name: '5 · FLAT ANIME', Comp: FlatAnimeVillage, tint: '#4aa8f0'},
];

// --- 5-up preview grid (one scene, five styles side by side) ---
const TILE_W = 576; // 1920 * 0.3
const TILE_H = 324; // 1080 * 0.3

const PreviewGrid: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: '#0e1018', padding: 24, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start'}}>
      {STYLES.map((s) => (
        <div key={s.id} style={{width: 612, padding: 12, boxSizing: 'border-box'}}>
          <div
            style={{
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 26,
              letterSpacing: 2,
              marginBottom: 10,
            }}
          >
            <span style={{background: s.tint, padding: '4px 14px', borderRadius: 8}}>{s.name}</span>
          </div>
          <div
            style={{
              position: 'relative',
              width: TILE_W,
              height: TILE_H,
              overflow: 'hidden',
              borderRadius: 14,
              border: '3px solid #2a2f42',
              boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{position: 'absolute', width: 1920, height: 1080, transformOrigin: 'top left', transform: `scale(${TILE_W / 1920})`}}>
              <s.Comp t={t} />
            </div>
          </div>
        </div>
      ))}
      {/* caption tile fills the 6th cell */}
      <div style={{width: 612, padding: 12, boxSizing: 'border-box'}}>
        <div style={{height: 52, marginBottom: 10}} />
        <div
          style={{
            width: TILE_W,
            height: TILE_H,
            borderRadius: 14,
            border: '3px dashed #2a2f42',
            color: '#8b93ad',
            fontFamily: 'monospace',
            fontSize: 24,
            lineHeight: 1.6,
            padding: 34,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{color: '#fff', fontSize: 34, marginBottom: 16}}>ISEKAI VILLAGE</div>
          <div>1 scene · 5 art styles</div>
          <div>Remotion · 1920×1080 · 30fps</div>
          <div style={{marginTop: 16, color: '#5a6380'}}>Open single-style comps for full view</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PreviewGrid" component={PreviewGrid} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
      <Composition id="Style1-Pixel" component={C1} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
      <Composition id="Style2-3D" component={C2} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
      <Composition id="Style3-Stickman" component={C3} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
      <Composition id="Style4-Watercolor" component={C4} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
      <Composition id="Style5-FlatAnime" component={C5} durationInFrames={DUR} fps={FPS} width={1920} height={1080} />
    </>
  );
};
