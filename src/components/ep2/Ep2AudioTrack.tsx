import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO_MANIFEST, FPS, HAS_AUDIO, SFX_CUES} from '../../data/ep2/script';

export const Ep2AudioTrack: React.FC = () => {
  if (!HAS_AUDIO) {
    return null;
  }

  return (
    <>
      <Audio src={staticFile('audio/ep2/music/score.wav')} volume={0.14} />
      {AUDIO_MANIFEST.lines.map((line) => (
        <Sequence
          key={line.id}
          from={Math.max(0, Math.round(line.start * FPS))}
          durationInFrames={Math.max(1, Math.ceil(line.duration * FPS) + 8)}
        >
          <Audio
            src={staticFile(line.audio)}
            volume={line.speaker === 'System' ? 0.78 : line.speaker === 'Narrator' ? 0.9 : 0.98}
          />
        </Sequence>
      ))}
      {SFX_CUES.map((cue) => (
        <Sequence
          key={cue.id}
          from={Math.max(0, Math.round(cue.at * FPS))}
          durationInFrames={9 * FPS}
        >
          <Audio src={staticFile(cue.src)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
