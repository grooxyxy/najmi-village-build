import React from 'react';
import {Composition} from 'remotion';
import {NajmiVideo} from './NajmiVideo';
import {NajmiEp2} from './NajmiEp2';
import {DURATION_FRAMES, FPS} from './data/script';
import {DURATION_FRAMES as EP2_DURATION_FRAMES, FPS as EP2_FPS} from './data/ep2/script';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="NajmiEp1"
      component={NajmiVideo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="NajmiEp2"
      component={NajmiEp2}
      durationInFrames={EP2_DURATION_FRAMES}
      fps={EP2_FPS}
      width={1920}
      height={1080}
    />
  </>
);
