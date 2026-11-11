import React from 'react';
import {Composition} from 'remotion';
import {NajmiVideo} from './NajmiVideo';
import {DURATION_FRAMES, FPS} from './data/script';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="NajmiEp1"
    component={NajmiVideo}
    durationInFrames={DURATION_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
