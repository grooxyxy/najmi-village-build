import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {Ep2AudioTrack} from './components/ep2/Ep2AudioTrack';
import {Ep2Captions} from './components/ep2/Ep2Captions';
import {Ep2CinematicFx} from './components/ep2/Ep2CinematicFx';
import {Ep2PhoneUI} from './components/ep2/Ep2PhoneUI';
import {Ep2StoreUI} from './components/ep2/Ep2StoreUI';
import {Ep2SystemHud} from './components/ep2/Ep2SystemHud';
import {Ep2TitleCard} from './components/ep2/Ep2TitleCard';
import {FPS} from './data/ep2/script';
import {SPRITES} from './data/theme';
import {RendererSettings} from './three/lib/camera';
import {Ep2BathroomScene} from './three/sets/ep2/Ep2BathroomScene';
import {Ep2CabinScene} from './three/sets/ep2/Ep2CabinScene';
import {Ep2StoreScene} from './three/sets/ep2/Ep2StoreScene';
import {Ep2WildsScene} from './three/sets/ep2/Ep2WildsScene';

const SpritePreloader: React.FC = () => {
  const urls = useMemo(() => Object.values(SPRITES).map((path) => staticFile(path)), []);
  useLoader(THREE.TextureLoader, urls);
  return null;
};

const ActiveScene: React.FC<{frame: number}> = ({frame}) => {
  const seconds = frame / FPS;

  if (seconds < 30) {
    return <Ep2CabinScene frame={frame} mode="plan" />;
  }
  if (seconds < 57) {
    return <Ep2CabinScene frame={frame - 30 * FPS} mode="system" />;
  }
  if (seconds < 60) {
    return <Ep2BathroomScene frame={frame - 57 * FPS} mode="arrive" />;
  }
  if (seconds < 76) {
    return <Ep2BathroomScene frame={frame - 60 * FPS} mode="phone" />;
  }
  if (seconds < 96) {
    return <Ep2StoreScene frame={frame - 76 * FPS} />;
  }
  if (seconds < 105) {
    return <Ep2BathroomScene frame={frame - 96 * FPS} mode="return" />;
  }
  if (seconds < 112) {
    return <Ep2BathroomScene frame={frame - 105 * FPS} mode="carry" />;
  }
  if (seconds < 140) {
    return <Ep2CabinScene frame={frame - 112 * FPS} mode="supplies" />;
  }
  if (seconds < 170) {
    return <Ep2WildsScene frame={frame - 140 * FPS} mode="meadow" />;
  }
  return <Ep2WildsScene frame={frame - 170 * FPS} mode="forest" />;
};

export const NajmiEp2: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill style={{background: '#05070a', overflow: 'hidden'}}>
      <ThreeCanvas
        width={width}
        height={height}
        style={{position: 'absolute', inset: 0}}
        gl={{alpha: false, antialias: true}}
        camera={{fov: 36, position: [8, 4, 8], near: 0.1, far: 260}}
      >
        <RendererSettings />
        <SpritePreloader />
        <ActiveScene frame={frame} />
      </ThreeCanvas>

      <Ep2CinematicFx />
      <Ep2PhoneUI />
      <Ep2StoreUI />
      <Ep2SystemHud />
      <Ep2Captions />
      <Ep2TitleCard />
      <Ep2AudioTrack />
    </AbsoluteFill>
  );
};
