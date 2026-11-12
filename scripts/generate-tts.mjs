#!/usr/bin/env node
/**
 * VoiceStudio / OmniVoice dialogue pipeline.
 *
 * CI starts the VoiceStudio container, then this script:
 *   1. accepts the model terms when explicitly allowed,
 *   2. warms the model with one short request,
 *   3. synthesizes every line with a speaker-specific voice design,
 *   4. applies pitch, EQ, compression and loudness treatment with FFmpeg,
 *   5. writes public/audio/vo/*.wav and src/data/audio-manifest.json.
 *
 * All HTTP calls use curl on purpose: the first OmniVoice load can spend far
 * longer than Node's fetch header timeout downloading/loading the model.
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
const API = (process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900').replace(/\/$/, '');
const API_KEY = process.env.VOICESTUDIO_API_KEY || '';
const MODEL = process.env.VOICESTUDIO_MODEL || 'omnivoice';
const MODEL_REPO = process.env.VOICESTUDIO_MODEL_REPO || 'k2-fsa/OmniVoice';
const ACCEPT_TERMS = process.env.VOICESTUDIO_ACCEPT_MODEL_LICENCE === '1';
const REUSE = process.env.VOICESTUDIO_REUSE === '1';
const SKIP_WARMUP = process.env.VOICESTUDIO_SKIP_WARMUP === '1';
const SAMPLE_RATE = 48000;
const NUM_STEP = Number(process.env.VOICESTUDIO_NUM_STEP || 32);
const MAX_TIME = Number(process.env.VOICESTUDIO_MAX_TIME || 2400);
const CURL = process.env.CURL_BIN || 'curl';

const script = JSON.parse(fs.readFileSync(SCRIPT_PATH, 'utf8'));
const sceneById = new Map(script.scenes.map((scene) => [scene.id, scene]));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, places = 3) => Number(value.toFixed(places));

const SPEAKERS = {
  Narrator: {
    instruct: 'male, middle-aged, low pitch',
    pitch: 0.89,
    pace: 1.045,
    guidance: 2.1,
    eq: [
      'equalizer=f=120:t=q:w=0.8:g=3.2',
      'equalizer=f=330:t=q:w=1.0:g=-1.8',
      'equalizer=f=2800:t=q:w=1.2:g=1.1',
      'acompressor=threshold=-19dB:ratio=2.6:attack=10:release=180',
      'aecho=0.8:0.3:42:0.055',
    ].join(','),
  },
  Najmi: {
    instruct: 'male, young adult',
    pitch: 1.02,
    pace: 1.0,
    guidance: 1.9,
    eq: [
      'highpass=f=85',
      'equalizer=f=240:t=q:w=1.0:g=-1.2',
      'equalizer=f=3000:t=q:w=1.1:g=2.2',
      'acompressor=threshold=-18dB:ratio=3.2:attack=6:release=120',
    ].join(','),
  },
  System: {
    instruct: 'male, middle-aged, low pitch',
    pitch: 0.96,
    pace: 1.01,
    guidance: 2.2,
    eq: [
      'highpass=f=170',
      'lowpass=f=5200',
      'equalizer=f=900:t=q:w=1.4:g=2.4',
      'equalizer=f=2600:t=q:w=1.3:g=-3.4',
      'acompressor=threshold=-22dB:ratio=4.5:attack=4:release=80',
      'tremolo=f=26:d=0.09',
      'aecho=0.8:0.55:24|38:0.2|0.12',
    ].join(','),
  },
};

// A few audible breaths/sighs are part of the performance, not the caption.
const TTS_TEXT_OVERRIDES = {
  's1-n2': '[sigh] Lamaran ditolak lagi...',
  's1-n4a': '[sigh] Ah... lapar.',
  's5-n1d': '[sigh] Aku saja tidak punya pengalaman membangun rumah...',
  's5-n2': '[sigh] ...Sepertinya hidupku baru saja menjadi jauh lebih rumit.',
};

const log = (...args) => console.log('[tts]', ...args);

function ensureTools() {
  for (const bin of [CURL, 'ffmpeg', 'ffprobe']) {
    const result = spawnSync('sh', ['-c', `command -v ${JSON.stringify(bin)}`], {
      encoding: 'utf8',
    });
    if (result.status !== 0 || !result.stdout.trim()) {
      throw new Error(`Required binary not found: ${bin}`);
    }
  }
  if (!API_KEY) {
    throw new Error('VOICESTUDIO_API_KEY is required.');
  }
}

async function apiJson(route, options = {}) {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    Accept: 'application/json',
    ...(options.body ? {'Content-Type': 'application/json'} : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${API}${route}`, {...options, headers});
  const text = await response.text();
  let body = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Keep the raw body for diagnostics.
  }
  if (!response.ok) {
    const detail =
      typeof body === 'string' ? body.slice(0, 1200) : JSON.stringify(body).slice(0, 1200);
    throw new Error(`${options.method || 'GET'} ${route} failed (${response.status}): ${detail}`);
  }
  return body;
}

async function ensureLicence() {
  let details;
  try {
    details = await apiJson(`/models/licenses/details/${MODEL_REPO}`);
  } catch (error) {
    log(`licence details unavailable; continuing to the synthesis gate: ${error.message}`);
    return;
  }

  const acceptance = details?.acceptance || details || {};
  const state = String(acceptance.state || acceptance.status || '').toLowerCase();
  const accepted =
    acceptance.accepted === true ||
    state === 'accepted' ||
    state === 'accept' ||
    state === 'ok';
  if (accepted) {
    log(`model terms already accepted for ${MODEL_REPO}`);
    return;
  }

  const fingerprint = acceptance.fingerprint || details?.fingerprint;
  const licence = details?.licence || details?.license || details?.terms?.license || 'unknown';
  log(`model ${MODEL_REPO} licence: ${licence}`);
  if (!fingerprint) {
    log('no fingerprint returned by the licence endpoint; the synthesis gate will decide.');
    return;
  }
  if (!ACCEPT_TERMS) {
    throw new Error(
      `Model terms for ${MODEL_REPO} are not accepted. ` +
        'Set VOICESTUDIO_ACCEPT_MODEL_LICENCE=1 to confirm you accept the model card terms.',
    );
  }

  await apiJson('/models/licenses/accept', {
    method: 'POST',
    body: JSON.stringify({repo_id: MODEL_REPO, fingerprint, accepted: true}),
  });
  log(`model terms accepted for ${MODEL_REPO}`);
}

function existingManifestIsComplete() {
  if (!REUSE) return false;
  try {
    const existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    if (existing.generated !== true || !Array.isArray(existing.lines)) return false;
    if (existing.lines.length !== script.lines.length) return false;
    for (const line of script.lines) {
      const row = existing.lines.find((candidate) => candidate.id === line.id);
      if (!row || !(row.duration > 0) || !row.audio) return false;
      const file = path.join(ROOT, 'public', row.audio);
      if (!fs.existsSync(file) || fs.statSync(file).size < 2000) return false;
    }
    log(`reusing ${existing.lines.length} cached voice lines`);
    return true;
  } catch {
    return false;
  }
}

function curlSynthesis({input, instruct, seed, outPath, label}) {
  fs.mkdirSync(path.dirname(outPath), {recursive: true});
  fs.rmSync(outPath, {force: true});
  const body = JSON.stringify({
    model: MODEL,
    voice: 'default',
    input,
    instruct,
    language: 'id',
    response_format: 'wav',
    speed: 1.0,
    seed,
    num_step: NUM_STEP,
    guidance_scale: SPEAKERS[label].guidance,
  });

  const args = [
    '-sS',
    '--noproxy',
    '*',
    '--connect-timeout',
    '20',
    '--max-time',
    String(MAX_TIME),
    '--retry',
    '3',
    '--retry-delay',
    '10',
    '--retry-connrefused',
    '-o',
    outPath,
    '-w',
    '%{http_code}',
    '-H',
    `Authorization: Bearer ${API_KEY}`,
    '-H',
    'Accept: audio/wav',
    '-H',
    'Content-Type: application/json',
    '--data-binary',
    '@-',
    `${API}/v1/audio/speech`,
  ];

  const started = Date.now();
  const result = spawnSync(CURL, args, {
    input: body,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const status = Number(String(result.stdout || '').trim());
  if (result.error) {
    throw new Error(`curl failed for ${label}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`curl exited ${result.status} for ${label}: ${String(result.stderr).slice(0, 800)}`);
  }
  if (status !== 200) {
    let detail = '';
    try {
      detail = fs.readFileSync(outPath, 'utf8').slice(0, 1200);
    } catch {
      // No body.
    }
    throw new Error(`VoiceStudio returned ${status} for ${label} after ${elapsed}s: ${detail}`);
  }
  const size = fs.statSync(outPath).size;
  if (size < 1000) {
    throw new Error(`VoiceStudio returned a suspiciously small file for ${label} (${size} bytes)`);
  }
  log(`synthesized ${label} in ${elapsed}s (${(size / 1024).toFixed(0)} KiB)`);
  return elapsed;
}

function probe(file) {
  const duration = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=nokey=1:noprint_wrappers=1',
      file,
    ],
    {encoding: 'utf8'},
  );
  const sampleRate = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'a:0',
      '-show_entries',
      'stream=sample_rate',
      '-of',
      'default=nokey=1:noprint_wrappers=1',
      file,
    ],
    {encoding: 'utf8'},
  );
  const durationValue = Number(String(duration.stdout || '').trim());
  const sampleRateValue = Number(String(sampleRate.stdout || '').trim());
  return {
    duration: Number.isFinite(durationValue) && durationValue > 0 ? durationValue : 0,
    sampleRate: Number.isFinite(sampleRateValue) && sampleRateValue > 0 ? sampleRateValue : 24000,
  };
}

function postProcess({line, index, rawPath, outPath}) {
  const info = probe(rawPath);
  const scene = sceneById.get(line.scene) || script.scenes[script.scenes.length - 1];
  const next = script.lines[index + 1];
  const boundary = next ? Math.min(next.start, scene.end) : scene.end;
  const window = Math.max(0.55, boundary - line.start - 0.16);
  const speaker = SPEAKERS[line.speaker] || SPEAKERS.Najmi;
  const trimmed = Math.max(0.35, info.duration - 0.18);
  const target = Math.min(window, Math.max(0.4, trimmed * speaker.pace));
  const shiftedRate = Math.max(4000, Math.round(info.sampleRate * speaker.pitch));
  const tempo = clamp(trimmed / Math.max(0.1, speaker.pitch * target), 0.72, 1.65);

  const trim =
    'silenceremove=start_periods=1:start_duration=0.03:start_threshold=-45dB,' +
    'areverse,silenceremove=start_periods=1:start_duration=0.06:start_threshold=-45dB,areverse';
  const pitch = `asetrate=${shiftedRate},aresample=${SAMPLE_RATE},atempo=${tempo.toFixed(4)}`;
  const finish = `loudnorm=I=-16:TP=-1.5:LRA=10,alimiter=limit=0.95,adelay=60,apad=pad_dur=0.06`;
  const filter = [trim, pitch, speaker.eq, finish].filter(Boolean).join(',');

  const result = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-i',
      rawPath,
      '-af',
      filter,
      '-ac',
      '1',
      '-ar',
      String(SAMPLE_RATE),
      '-c:a',
      'pcm_s16le',
      outPath,
    ],
    {encoding: 'utf8'},
  );
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${line.id}: ${String(result.stderr).slice(0, 1200)}`);
  }

  const finalInfo = probe(outPath);
  const duration = finalInfo.duration > 0 ? finalInfo.duration : target;
  log(
    `${line.id} ${line.speaker} raw=${info.duration.toFixed(2)}s final=${duration.toFixed(2)}s ` +
      `target=${target.toFixed(2)}s tempo=${tempo.toFixed(3)}`,
  );
  return duration;
}

async function main() {
  if (!fs.existsSync(SCRIPT_PATH)) throw new Error(`Missing script: ${SCRIPT_PATH}`);
  if (existingManifestIsComplete()) {
    return;
  }
  ensureTools();
  fs.mkdirSync(VO_DIR, {recursive: true});
  fs.mkdirSync(RAW_DIR, {recursive: true});

  await ensureLicence();

  if (!SKIP_WARMUP) {
    log('warming OmniVoice; the first load may download ~2.4 GB of weights');
    const warmupPath = path.join(RAW_DIR, 'warmup.wav');
    curlSynthesis({
      input: '[sigh] Halo, namaku Najmi.',
      instruct: SPEAKERS.Narrator.instruct,
      seed: 1207,
      outPath: warmupPath,
      label: 'Narrator',
    });
    fs.rmSync(warmupPath, {force: true});
  }

  const generated = [];
  let cursor = 0;
  const started = Date.now();

  for (let index = 0; index < script.lines.length; index += 1) {
    const line = script.lines[index];
    const speaker = SPEAKERS[line.speaker];
    if (!speaker) throw new Error(`Unknown speaker: ${line.speaker}`);
    const text = TTS_TEXT_OVERRIDES[line.id] || line.text;
    const rawPath = path.join(RAW_DIR, `${line.id}.wav`);
    const outName = `${line.id}.wav`;
    const outPath = path.join(VO_DIR, outName);
    const seed = 1301 + index * 37;

    log(`[${index + 1}/${script.lines.length}] ${line.id} (${line.speaker}/${line.delivery})`);
    curlSynthesis({
      input: text,
      instruct: speaker.instruct,
      seed,
      outPath: rawPath,
      label: line.speaker,
    });
    const duration = postProcess({line, index, rawPath, outPath});

    const start = round(Math.max(line.start, cursor + 0.04));
    if (start > line.start + 0.5) {
      log(`warning: ${line.id} shifted from ${line.start.toFixed(2)}s to ${start.toFixed(2)}s`);
    }
    generated.push({
      id: line.id,
      start,
      duration: round(duration),
      audio: `audio/vo/${outName}`,
      speaker: line.speaker,
      text: line.text,
    });
    cursor = start + duration;
  }

  const manifest = {
    generated: true,
    voice: `voicestudio-${MODEL}`,
    sampleRate: SAMPLE_RATE,
    lines: generated,
  };
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const last = generated[generated.length - 1];
  log(`wrote ${generated.length} lines to ${MANIFEST_PATH}`);
  if (last) log(`last line ends at ${(last.start + last.duration).toFixed(2)}s / ${script.duration}s`);
  log(`total synthesis time ${((Date.now() - started) / 1000 / 60).toFixed(1)} min`);
}

main().catch((error) => {
  console.error('[tts] FAILED:', error?.stack || error);
  process.exit(1);
});
