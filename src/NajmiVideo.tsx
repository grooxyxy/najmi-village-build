import React, {useMemo} from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {AudioTrack} from './components/AudioTrack';
import {Captions} from './components/Captions';
import {PhoneUI} from './components/PhoneUI';
import {SystemPanel} from './components/SystemPanel';
import {TitleCard} from './components/TitleCard';
import {TransitionOverlay} from './components/TransitionOverlay';
import {FPS} from './data/script';
import {SPRITES} from './data/theme';
import {RendererSettings} from './three/lib/camera';
import {BedroomScene} from './three/sets/BedroomScene';
import {BathroomScene} from './three/sets/BathroomScene';
import {CabinInteriorScene} from './three/sets/CabinInteriorScene';
import {MeadowScene} from './three/sets/MeadowScene';

const SpritePreloader: React.FC = () => {
  const urls = useMemo(() => Object.values(SPRITES).map((path) => staticFile(path)), []);
  useLoader(THREE.TextureLoader, urls);
  return null;
};

const ActiveScene: React.FC<{frame: number}> = ({frame}) => {
  const seconds = frame / FPS;

  if (seconds < 35) {
    return <BedroomScene frame={frame} />;
  }
  if (seconds < 70) {
    return <BathroomScene frame={frame - 35 * FPS} />;
  }
  if (seconds < 100) {
    return <CabinInteriorScene frame={frame - 70 * FPS} />;
  }
  if (seconds < 110) {
    return <MeadowScene frame={frame - 100 * FPS} mode="reveal" />;
  }
  if (seconds < 155) {
    return <MeadowScene frame={frame - 110 * FPS} mode="system" />;
  }
  return <MeadowScene frame={frame - 155 * FPS} mode="build" />;
};

export const NajmiVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(155deg, #17130f 0%, #0b0d12 55%, #06080c 100%)',
        overflow: 'hidden',
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        style={{position: 'absolute', inset: 0}}
        gl={{alpha: true, antialias: true}}
        camera={{fov: 36, position: [12.5, 24, 18.5], near: 0.1, far: 260}}
      >
        <RendererSettings />
        <SpritePreloader />
        <ActiveScene frame={frame} />
      </ThreeCanvas>

      <PhoneUI />
      <SystemPanel />
      <Captions />
      <TransitionOverlay />
      <TitleCard />
      <AudioTrack />
    </AbsoluteFill>
  );
};
