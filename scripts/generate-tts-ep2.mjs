#!/usr/bin/env node
/**
 * Episode 02 dialogue pipeline with natural-duration scheduling.
 *
 * Unlike Episode 01, lines are not squeezed into fixed next-line windows. Each
 * performance is synthesized, only gently tempo-corrected when it is far longer
 * than the written estimate, and then scheduled after the previous line with a
 * real pause. That keeps the Indonesian delivery from sounding clipped.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCRIPT_PATH = path.join(ROOT, 'src', 'data', 'ep2', 'script.json');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'ep2', 'audio-manifest.json');
const VO_DIR = path.join(ROOT, 'public', 'audio', 'ep2', 'vo');
const RAW_DIR = path.join(ROOT, '.cache', 'tts-raw-ep2');
const API = (process.env.VOICESTUDIO_URL || 'http://127.0.0.1:3900').replace(/\/$/, '');
const API_KEY = process.env.VOICESTUDIO_API_KEY || '';
const MODEL = process.env.VOICESTUDIO_MODEL || 'omnivoice';
const MODEL_REPO = process.env.VOICESTUDIO_MODEL_REPO || 'k2-fsa/OmniVoice';
const EXTRA_MODEL_REPOS = (
  process.env.VOICESTUDIO_EXTRA_MODEL_REPOS || 'eustlb/higgs-audio-v2-tokenizer'
)
  .split(',')
  .map((repo) => repo.trim())
  .filter(Boolean);
const MODEL_REPOS = [...new Set([MODEL_REPO, ...EXTRA_MODEL_REPOS])];
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
    seed: 3311,
    pitch: 0.98,
    guidance: 2.1,
    eq: [
      'equalizer=f=120:t=q:w=0.8:g=2.4',
      'equalizer=f=330:t=q:w=1.0:g=-1.4',
      'equalizer=f=2800:t=q:w=1.2:g=0.8',
      'acompressor=threshold=-19dB:ratio=2.4:attack=10:release=180',
    ].join(','),
  },
  Najmi: {
    // Fixed voice design across the episode. Emotion comes from the writing,
    // OmniVoice tags and the natural timing rather than a new voice per line.
    instruct: 'male, young adult',
    seed: 2411,
    pitch: 1.015,
    guidance: 1.9,
    eq: [
      'highpass=f=82',
      'equalizer=f=240:t=q:w=1.0:g=-1.1',
      'equalizer=f=3100:t=q:w=1.1:g=2.0',
      'acompressor=threshold=-18dB:ratio=3.0:attack=6:release=130',
    ].join(','),
  },
  System: {
    instruct: 'male, middle-aged, low pitch',
    seed: 7103,
    pitch: 0.94,
    guidance: 2.25,
    eq: [
      'highpass=f=175',
      'lowpass=f=5100',
      'equalizer=f=900:t=q:w=1.4:g=2.2',
      'equalizer=f=2600:t=q:w=1.3:g=-3.2',
      'acompressor=threshold=-22dB:ratio=4.5:attack=4:release=80',
      'tremolo=f=25:d=0.08',
      'aecho=0.8:0.5:24|38:0.18|0.1',
    ].join(','),
    robotic: true,
  },
};

// Explicit breath/pause beats. The captions keep the clean written text; only
// the synthesis request receives these performance tags.
const TTS_TEXT_OVERRIDES = {
  's1-sys1': '[pause 120ms] Main quest diperbarui. [pause 120ms] Temukan desa pertamamu.',
  's1-n1': '[pause 250ms] Hmm... [pause 200ms] membangun desa dari nol...',
  's1-n2': 'Masalahnya, [pause 160ms] aku bahkan tidak punya peralatan untuk membangun rumah.',
  's1-n3': 'Tunggu sebentar...',
  's1-n4': 'Kenapa aku harus mencari semua peralatan [pause 180ms] di dunia ini?',
  's1-n5': 'Aku masih punya akses [pause 120ms] ke duniaku sendiri!',
  's2-sys1': 'Host, [pause 120ms] apakah Anda membutuhkan bantuan?',
  's2-n1': 'System, [pause 160ms] apa saja yang kubutuhkan untuk memulai sebuah desa?',
  's2-sys2': 'Untuk memulai pembangunan pemukiman, [pause 130ms] Host membutuhkan beberapa sumber daya.',
  's2-sys3': 'Disarankan untuk mempersiapkan kebutuhan dasar [pause 150ms] sebelum memulai pembangunan.',
  's2-n2': 'Bagus! [pause 150ms] Kalau begitu, aku tahu harus mulai dari mana!',
  's3-n1': 'Pertama, [pause 120ms] peralatan untuk membersihkan lahan.',
  's3-n2': 'Terus makanan, [pause 100ms] air minum...',
  's3-n3': 'Dan yang paling penting...',
  's3-n4': 'Peralatan untuk membangun tempat tinggal!',
  's3-n5': '[surprise-ah] HAH?!',
  's3-n6': 'Uang tabunganku...',
  's3-n7': '[sigh] Sepertinya aku harus benar-benar serius dengan proyek ini.',
  's4-n1': 'Ugh... [pause 140ms] ternyata membawa barang sebanyak ini tidak semudah yang kubayangkan.',
  's4-n2': 'Baiklah... [pause 120ms] setidaknya aku tidak datang dengan tangan kosong.',
  's5-sys1': 'Persiapan Host telah selesai.',
  's5-n1': 'Heh... tidak buruk.',
  's5-n2': 'Sepertinya petualangan ini [pause 140ms] akhirnya benar-benar dimulai.',
  's6-n1': '[pause 250ms] Hah?',
  's6-n2': 'Jangan bilang...',
  's6-n3': '[pause 250ms] ada sesuatu di sana?',
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

async function acceptModelTerms(models) {
  let accepted = 0;
  for (const model of models || []) {
    const repoId = model?.repo_id;
    const fingerprint = model?.fingerprint;
    if (!repoId || !fingerprint) continue;
    await apiJson('/models/licenses/accept', {
      method: 'POST',
      body: JSON.stringify({repo_id: repoId, fingerprint, accepted: true}),
    });
    log(`model terms accepted for ${repoId}`);
    accepted += 1;
  }
  return accepted;
}

async function ensureLicenceForRepo(repoId) {
  let details;
  try {
    details = await apiJson(`/models/licenses/details/${repoId}`);
  } catch (error) {
    log(`licence details unavailable for ${repoId}; continuing to the synthesis gate: ${error.message}`);
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
    log(`model terms already accepted for ${repoId}`);
    return;
  }

  const fingerprint = acceptance.fingerprint || details?.fingerprint;
  const info = details?.info || {};
  const licence =
    info.license || info.licence || details?.licence || details?.license || details?.terms?.license || 'unknown';
  log(`model ${repoId} licence: ${licence}`);
  if (!fingerprint) {
    log(`no fingerprint returned for ${repoId}; the synthesis gate will decide.`);
    return;
  }
  if (!ACCEPT_TERMS) {
    throw new Error(
      `Model terms for ${repoId} are not accepted. ` +
        'Set VOICESTUDIO_ACCEPT_MODEL_LICENCE=1 to confirm you accept the model card terms.',
    );
  }

  const acceptedCount = await acceptModelTerms([{repo_id: repoId, fingerprint}]);
  if (acceptedCount === 0) {
    throw new Error(`Could not record model terms acceptance for ${repoId}.`);
  }
}

async function ensureLicences() {
  for (const repoId of MODEL_REPOS) {
    await ensureLicenceForRepo(repoId);
  }
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

async function curlSynthesis({input, instruct, seed, outPath, label}) {
  fs.mkdirSync(path.dirname(outPath), {recursive: true});
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

  let totalElapsed = 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    fs.rmSync(outPath, {force: true});
    const started = Date.now();
    const result = spawnSync(CURL, args, {
      input: body,
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024,
    });
    const elapsed = (Date.now() - started) / 1000;
    totalElapsed += elapsed;
    const status = Number(String(result.stdout || '').trim());
    if (result.error) {
      throw new Error(`curl failed for ${label}: ${result.error.message}`);
    }
    if (result.status !== 0) {
      throw new Error(
        `curl exited ${result.status} for ${label}: ${String(result.stderr).slice(0, 800)}`,
      );
    }

    let rawBody = '';
    try {
      rawBody = fs.readFileSync(outPath, 'utf8');
    } catch {
      // No body.
    }

    if (status === 200) {
      const size = fs.statSync(outPath).size;
      if (size < 1000) {
        throw new Error(`VoiceStudio returned a suspiciously small file for ${label} (${size} bytes)`);
      }
      log(`synthesized ${label} in ${elapsed.toFixed(1)}s (${(size / 1024).toFixed(0)} KiB)`);
      return totalElapsed.toFixed(1);
    }

    if (attempt < 2 && status === 403 && ACCEPT_TERMS) {
      let parsed;
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        // Not a JSON licence gate.
      }
      const models = parsed?.detail?.models || parsed?.error?.models || parsed?.models || [];
      if (models.length > 0) {
        log(
          `VoiceStudio requested ${models.length} additional model licence(s) for ${label}; ` +
            'accepting and retrying',
        );
        const accepted = await acceptModelTerms(models);
        if (accepted > 0) continue;
      }
    }

    const engineUnavailable =
      status === 400 && /model_not_available|Engine '.*' is not available/.test(rawBody);
    if (attempt < 2 && (engineUnavailable || status === 429 || status >= 500)) {
      const waitMs = engineUnavailable ? 8000 : 3000;
      log(`VoiceStudio returned ${status} for ${label}; retrying in ${waitMs / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    throw new Error(
      `VoiceStudio returned ${status} for ${label} after ${elapsed.toFixed(1)}s: ${rawBody.slice(0, 1200)}`,
    );
  }
  throw new Error(`VoiceStudio failed for ${label} after ${totalElapsed.toFixed(1)}s and retries.`);
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

function wavPeak(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length < 44 || buffer.toString('ascii', 0, 4) !== 'RIFF') return 0;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'data') {
      const end = Math.min(buffer.length, offset + 8 + size);
      let peak = 0;
      for (let index = offset + 8; index + 1 < end; index += 2) {
        const value = Math.abs(buffer.readInt16LE(index));
        if (value > peak) peak = value;
      }
      return peak;
    }
    offset += 8 + size + (size % 2);
  }
  return 0;
}

function postProcess({line, rawPath, outPath}) {
  const info = probe(rawPath);
  const speaker = SPEAKERS[line.speaker] || SPEAKERS.Najmi;
  const trimmed = Math.max(0.35, info.duration - 0.16);
  // Keep the performance's natural length. Only a line that runs far past its
  // written estimate gets a gentle 1.0-1.08x correction; Episode 01 used up to
  // 1.65x and that is exactly the clipped, rushed sound we are avoiding.
  const softLimit = Math.max(1.4, line.estimate * 1.18 + 0.5);
  const speed = clamp(trimmed / softLimit, 1.0, 1.08);
  const shiftedRate = Math.max(4000, Math.round(info.sampleRate * speaker.pitch));
  const tempo = speed / speaker.pitch;

  const trim =
    'silenceremove=start_periods=1:start_duration=0.035:start_threshold=-48dB,' +
    'areverse,silenceremove=start_periods=1:start_duration=0.08:start_threshold=-48dB,areverse';
  const pitch = `asetrate=${shiftedRate},aresample=${SAMPLE_RATE},atempo=${tempo.toFixed(4)}`;
  const deliveryEq = line.delivery === 'whisper' ? 'highpass=f=150,lowpass=f=7600' : null;
  const finish = 'loudnorm=I=-16:TP=-1.5:LRA=10,alimiter=limit=0.95,adelay=50,apad=pad_dur=0.04';
  const filter = [trim, pitch, deliveryEq, speaker.eq, finish].filter(Boolean).join(',');

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
  const duration = finalInfo.duration > 0 ? finalInfo.duration : trimmed / speed;
  log(
    `${line.id} ${line.speaker} raw=${info.duration.toFixed(2)}s final=${duration.toFixed(2)}s ` +
      `estimate=${line.estimate.toFixed(2)}s speed=${speed.toFixed(3)} tempo=${tempo.toFixed(3)}`,
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

  await ensureLicences();

  if (!SKIP_WARMUP) {
    log('warming OmniVoice; the first load may download ~2.4 GB of weights');
    const warmupPath = path.join(RAW_DIR, 'warmup.wav');
    await curlSynthesis({
      input: '[sigh] Halo, namaku Najmi. Ini episode dua.',
      instruct: SPEAKERS.Narrator.instruct,
      seed: SPEAKERS.Narrator.seed,
      outPath: warmupPath,
      label: 'Narrator',
    });
    fs.rmSync(warmupPath, {force: true});
  }

  const rendered = [];
  const started = Date.now();

  for (let index = 0; index < script.lines.length; index += 1) {
    const line = script.lines[index];
    const speaker = SPEAKERS[line.speaker];
    if (!speaker) throw new Error(`Unknown speaker: ${line.speaker}`);
    const text = TTS_TEXT_OVERRIDES[line.id] || line.ttsText || line.text;
    const rawPath = path.join(RAW_DIR, `${line.id}.wav`);
    const outName = `${line.id}.wav`;
    const outPath = path.join(VO_DIR, outName);
    const seed = speaker.seed + index * 11;
    const instruct =
      line.delivery === 'whisper' ? `${speaker.instruct}, whisper` : speaker.instruct;

    log(`[${index + 1}/${script.lines.length}] ${line.id} (${line.speaker}/${line.delivery})`);
    await curlSynthesis({
      input: text,
      instruct,
      seed,
      outPath: rawPath,
      label: line.speaker,
    });
    let duration = postProcess({line, rawPath, outPath});
    if (wavPeak(outPath) < 80 || duration < 0.16) {
      log(
        `warning: ${line.id} produced a silent or near-empty take ` +
          `(${duration.toFixed(2)}s, peak ${wavPeak(outPath)}); retrying with an alternate seed`,
      );
      await curlSynthesis({
        input: text,
        instruct,
        seed: seed + 137,
        outPath: rawPath,
        label: line.speaker,
      });
      duration = postProcess({line, rawPath, outPath});
    }
    if (wavPeak(outPath) < 80 || duration < 0.14) {
      throw new Error(
        `${line.id} still has unusable audio after retry ` +
          `(${duration.toFixed(2)}s, peak ${wavPeak(outPath)})`,
      );
    }
    rendered.push({line, duration, outName, outPath});
  }

  // Natural-duration scheduling happens only after every performance exists.
  // Desired starts come from the script; if a line naturally runs long, later
  // lines move forward instead of the long line being sped up unnaturally.
  const generated = [];
  let cursor = 0;
  for (const item of rendered) {
    const {line, duration, outName} = item;
    const scene = sceneById.get(line.scene) || script.scenes[script.scenes.length - 1];
    const desired = line.start;
    let start = Math.max(desired, cursor + 0.16);
    const latest = scene.end - 0.12 - duration;
    if (start + duration > scene.end - 0.12 && latest >= cursor + 0.1) {
      start = latest;
    }
    if (start > desired + 0.7) {
      log(`warning: ${line.id} shifted from ${desired.toFixed(2)}s to ${start.toFixed(2)}s`);
    }
    if (start + duration > scene.end + 0.4) {
      log(
        `warning: ${line.id} ends at ${(start + duration).toFixed(2)}s, past scene ${line.scene} end ${scene.end}s`,
      );
    }
    start = round(start);
    generated.push({
      id: line.id,
      start,
      duration: round(duration),
      audio: `audio/ep2/vo/${outName}`,
      speaker: line.speaker,
      text: line.text,
    });
    cursor = start + duration;
    log(`${line.id} scheduled at ${start.toFixed(2)}s -> ${(start + duration).toFixed(2)}s`);
  }

  const manifest = {
    generated: true,
    voice: `voicestudio-${MODEL}-ep2`,
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
