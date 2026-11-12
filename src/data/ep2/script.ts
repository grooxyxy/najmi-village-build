import rawScript from './script.json';
import rawAudio from './audio-manifest.json';

export type Speaker = 'Narrator' | 'Najmi' | 'System';
export type SceneId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6';
export type Delivery =
  | 'thinking'
  | 'serious'
  | 'excited'
  | 'confident'
  | 'surprised'
  | 'smile'
  | 'shocked'
  | 'sigh'
  | 'tired'
  | 'proud'
  | 'whisper'
  | 'system';

export interface ScriptLine {
  id: string;
  scene: SceneId;
  speaker: Speaker;
  text: string;
  start: number;
  estimate: number;
  gapAfter: number;
  delivery: Delivery;
  ttsText?: string;
  instruct?: string;
}

export interface Scene {
  id: SceneId;
  start: number;
  end: number;
  label: string;
  heading: string;
}

export interface SfxCue {
  id: string;
  at: number;
  src: string;
  volume: number;
}

export interface ScriptData {
  title: string;
  episode: string;
  fps: number;
  duration: number;
  scenes: Scene[];
  lines: ScriptLine[];
  sfx: SfxCue[];
}

export interface AudioLine {
  id: string;
  start: number;
  duration: number;
  audio: string;
  speaker: Speaker;
  text: string;
}

export interface AudioManifest {
  generated: boolean;
  voice?: string;
  sampleRate?: number;
  lines: AudioLine[];
}

export const SCRIPT = rawScript as unknown as ScriptData;
export const AUDIO_MANIFEST = rawAudio as unknown as AudioManifest;

export const FPS = SCRIPT.fps;
export const DURATION_SECONDS = SCRIPT.duration;
export const DURATION_FRAMES = Math.round(DURATION_SECONDS * FPS);

export const SCENES = SCRIPT.scenes;
export const LINES = SCRIPT.lines;
export const SFX_CUES = SCRIPT.sfx;
export const HAS_AUDIO = AUDIO_MANIFEST.generated === true;

export interface TimedLine extends ScriptLine {
  displayStart: number;
  displayEnd: number;
  audio?: string;
}

export const TIMED_LINES: TimedLine[] = LINES.map((line) => {
  const generated = AUDIO_MANIFEST.lines.find((entry) => entry.id === line.id);
  const start = generated ? generated.start : line.start;
  const duration = generated ? generated.duration : line.estimate;
  const sceneEnd = SCENES.find((scene) => scene.id === line.scene)?.end ?? DURATION_SECONDS;
  return {
    ...line,
    displayStart: start,
    displayEnd: Math.min(start + Math.max(duration + 0.3, 1.15), sceneEnd - 0.02),
    audio: generated?.audio,
  };
});

export const getScene = (id: SceneId): Scene => {
  const scene = SCENES.find((entry) => entry.id === id);
  if (!scene) {
    throw new Error(`Unknown scene: ${id}`);
  }
  return scene;
};

export const getSceneAtTime = (seconds: number): Scene =>
  SCENES.find((scene) => seconds >= scene.start && seconds < scene.end) ??
  SCENES[SCENES.length - 1];

export const getActiveLine = (frame: number): TimedLine | null => {
  const seconds = frame / FPS;
  let active: TimedLine | null = null;
  for (const line of TIMED_LINES) {
    if (seconds >= line.displayStart && seconds < line.displayEnd) {
      active = line;
    }
  }
  return active;
};

export const secondsToFrames = (seconds: number): number => Math.round(seconds * FPS);
