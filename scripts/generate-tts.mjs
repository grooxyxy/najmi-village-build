#!/usr/bin/env node
/**
 * Synthesize all dialogue with Piper (offline, MIT) and build the audio
 * manifest that drives both <Audio> and the captions.
 *
 * The render never calls this script. CI runs setup-piper.sh first.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCRIPT_PATH = path.join(ROOT, 'src', 'data', 'script.json');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'audio-manifest.json');
const VO_DIR = path.join(ROOT, 'public', 'audio', 'vo');
const RAW_DIR = path.join(ROOT, '.cache', 'tts-raw');
const SAMPLE_RATE = 22050;

fs.mkdirSync(VO_DIR, {recursive: true});
fs.mkdirSync(RAW_DIR, {recursive: true});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const piperDir = process.env.PIPER_DIR
  ? path.resolve(ROOT, process.env.PIPER_DIR)
  : path.join(ROOT, '.cache', 'piper');
const piperBin = process.env.PIPER_BIN
  ? path.resolve(ROOT, process.env.PIPER_BIN)
  : path.join(piperDir, 'piper');
const piperModel = process.env.PIPER_MODEL
  ? path.resolve(ROOT, process.env.PIPER_MODEL)
  : path.join(piperDir, 'id_ID-news_tts-medium.onnx');

const requireFile = (file, hint) => {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}\n${hint}`);
    process.exit(1);
  }
};

requireFile(piperBin, 'Run scripts/setup-piper.sh first (CI does this automatically).');
requireFile(piperModel, 'The Indonesian Piper voice was not downloaded. Run scripts/setup-piper.sh.');

const commandExists = (command) => {
  const result = spawnSync(command, ['-version'], {encoding: 'utf8'});
  return !result.error;
};

if (!commandExists('ffmpeg') || !commandExists('ffprobe')) {
  console.error('ffmpeg and ffprobe are required to process the TTS audio.');
  process.exit(1);
}

const script = JSON.parse(fs.readFileSync(SCRIPT_PATH, 'utf8'));

const wavDuration = (file) => {
  const buffer = fs.readFileSync(file);
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Not a WAV file: ${file}`);
  }
  let offset = 12;
  let byteRate = SAMPLE_RATE * 2;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      byteRate = buffer.readUInt32LE(offset + 16);
    }
    if (id === 'data') {
      return size / Math.max(1, byteRate);
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error(`Could not read WAV duration: ${file}`);
};

const mediaDuration = (file) => {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
    {encoding: 'utf8'},
  );
  const parsed = Number.parseFloat((result.stdout ?? '').trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return wavDuration(file);
};

const speakerStyle = {
  Narrator: {
    lengthScale: 1.06,
    noiseScale: 0.55,
    noiseW: 0.7,
    pitch: 0.92,
    effect: 'highpass=f=70,lowpass=f=9800,aecho=0.8:0.55:36:0.1',
  },
  Najmi: {
    lengthScale: 0.96,
    noiseScale: 0.66,
    noiseW: 0.8,
    pitch: 1.04,
    effect: 'highpass=f=80,equalizer=f=190:t=q:w=1:g=1.2,lowpass=f=11000',
  },
  System: {
    lengthScale: 1.0,
    noiseScale: 0.36,
    noiseW: 0.5,
    pitch: 1.03,
    effect: 'highpass=f=180,lowpass=f=7200,aecho=0.8:0.45:24:0.16',
  },
};

const lines = [];
let cursor = 0;

for (const line of script.lines) {
  const style = speakerStyle[line.speaker] ?? speakerStyle.Najmi;
  const rawFile = path.join(RAW_DIR, `${line.id}.wav`);
  const outFile = path.join(VO_DIR, `${line.id}.wav`);

  console.log(`[tts] ${line.id} (${line.speaker}) ${line.text.slice(0, 54)}...`);

  const piper = spawnSync(
    piperBin,
    [
      '--model',
      piperModel,
      '--output_file',
      rawFile,
      '--length_scale',
      String(style.lengthScale),
      '--noise_scale',
      String(style.noiseScale),
      '--noise_w',
      String(style.noiseW),
      '--sentence_silence',
      '0.14',
    ],
    {
      input: `${line.text}\n`,
      encoding: 'utf8',
      env: {
        ...process.env,
        LD_LIBRARY_PATH: `${piperDir}:${process.env.LD_LIBRARY_PATH ?? ''}`,
      },
      maxBuffer: 8 * 1024 * 1024,
    },
  );

  if (piper.status !== 0) {
    console.error(piper.stdout);
    console.error(piper.stderr);
    throw new Error(`Piper failed for ${line.id} (exit ${piper.status}).`);
  }

  const rawDuration = mediaDuration(rawFile);
  const lineIndex = script.lines.indexOf(line);
  const nextStart = script.lines[lineIndex + 1]?.start ?? 214.5;
  const scene = script.scenes.find(
    (entry) => line.start >= entry.start && line.start < entry.end,
  );
  const sceneEnd = scene?.end ?? 216;
  const window = Math.max(0.75, Math.min(nextStart, sceneEnd) - line.start - 0.16);
  const target = clamp(Math.min(line.estimate * 1.08, window), 0.75, 8.8);
  const tempo = clamp(rawDuration / (style.pitch * target), 0.78, 1.46);
  const pitchedRate = Math.round(SAMPLE_RATE * style.pitch);

  const filter = [
    `asetrate=${pitchedRate}`,
    `aresample=${SAMPLE_RATE}`,
    `atempo=${tempo.toFixed(4)}`,
    style.effect,
    'loudnorm=I=-18:TP=-2:LRA=9',
    'adelay=35',
    'apad=pad_dur=0.08',
  ].join(',');

  const ffmpeg = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      rawFile,
      '-af',
      filter,
      '-ac',
      '1',
      '-ar',
      String(SAMPLE_RATE),
      '-c:a',
      'pcm_s16le',
      outFile,
    ],
    {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024},
  );

  if (ffmpeg.status !== 0) {
    console.error(ffmpeg.stdout);
    console.error(ffmpeg.stderr);
    throw new Error(`ffmpeg failed for ${line.id} (exit ${ffmpeg.status}).`);
  }

  const duration = mediaDuration(outFile);
  const start = Math.max(line.start, cursor + 0.08);
  cursor = start + duration + 0.04;

  if (start - line.start > 1.5) {
    console.warn(
      `[tts] ${line.id} starts ${(start - line.start).toFixed(2)}s later than authored (${line.start}s).`,
    );
  }

  lines.push({
    id: line.id,
    start: Number(start.toFixed(3)),
    duration: Number(duration.toFixed(3)),
    audio: `audio/vo/${line.id}.wav`,
    speaker: line.speaker,
    text: line.text,
  });
}

const manifest = {
  generated: true,
  voice: 'id_ID-news_tts-medium',
  sampleRate: SAMPLE_RATE,
  lines,
};

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

const last = lines[lines.length - 1];
const lastEnd = last ? last.start + last.duration : 0;
console.log(`[tts] wrote ${path.relative(ROOT, MANIFEST_PATH)} (${lines.length} lines)`);
console.log(`[tts] last line ends at ${lastEnd.toFixed(2)}s`);
if (lastEnd > 214.8) {
  console.warn('[tts] WARNING: last line extends past the safe ending window.');
}
