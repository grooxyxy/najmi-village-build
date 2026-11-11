import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {AUDIO_MANIFEST, FPS, HAS_AUDIO, SFX_CUES} from '../data/script';

export const AudioTrack: React.FC = () => {
  if (!HAS_AUDIO) {
    return null;
  }

  return (
    <>
      <Audio src={staticFile('audio/music/score.wav')} volume={0.15} />
      {AUDIO_MANIFEST.lines.map((line) => (
        <Sequence
          key={line.id}
          from={Math.max(0, Math.round(line.start * FPS))}
          durationInFrames={Math.max(1, Math.ceil(line.duration * FPS) + 6)}
        >
          <Audio
            src={staticFile(line.audio)}
            volume={line.speaker === 'System' ? 0.82 : line.speaker === 'Narrator' ? 0.9 : 0.96}
          />
        </Sequence>
      ))}
      {SFX_CUES.map((cue) => (
        <Sequence
          key={cue.id}
          from={Math.max(0, Math.round(cue.at * FPS))}
          durationInFrames={8 * FPS}
        >
          <Audio src={staticFile(cue.src)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
