// Timing + shot plan for the Tuyul short.
// Narration is one continuous take: block 1 starts at 0.570 s, block 2 at
// 104.910 s (timestamps from the supplied transcript). Sentences inside each
// block are scheduled by length, which lands every scene beat within a beat of
// the voice.

export const FPS = 30;
export const AUDIO_FILE = 'audio/tuyul/tuyul-narration.wav';

const BLOCK_1: {start: number; sentences: string[]} = {
  start: 0.57,
  sentences: [
    'Nama gue Ahmad Najmi Anshori.',
    'Waktu itu gue masih kecil dan tinggal di daerah Kelapa Gading, Jakarta Utara.',
    'Rumah gue persis berada di belakang sebuah sekolah dasar, jadi hampir setiap sore gue sering main bareng teman-teman di sekitar sekolah.',
    'Sore itu kami lagi seru-serunya main polisi maling.',
    'Awalnya semuanya biasa aja, kami berlarian, tertawa, dan saling kejar-kejaran.',
    'Sampai akhirnya gue melihat sesuatu yang aneh di depan gerbang sekolah: ada makhluk kecil berwarna putih yang sedang jongkok di dekat seseorang.',
    'Awalnya gue nggak terlalu memperhatikan, gue pikir itu cuma salah satu teman gue yang sedang sembunyi.',
    'Tapi setelah gue perhatikan lebih dekat, makhluk itu ternyata sedang mengambil beberapa lembar uang dari dompet seseorang.',
    'Dan yang lebih aneh lagi, ukuran tubuhnya kecil banget, jauh lebih kecil dibandingkan anak-anak biasa.',
    'Tanpa pikir panjang, gue langsung berteriak dan mengejarnya.',
    'Makhluk itu tiba-tiba berlari masuk melewati gerbang sekolah.',
    'Gue langsung menyusulnya, tapi semakin jauh gue mengejar, semakin aneh semuanya.',
    'Sekolah sudah mulai sepi, nggak ada murid lain di dalam, dan makhluk itu seperti selalu tahu tempat untuk bersembunyi.',
    'Setiap kali gue hampir menangkapnya, dia selalu berhasil menghilang.',
    'Sampai akhirnya gue melihatnya masuk ke salah satu ruang kelas.',
    'Gue pikir kali ini dia sudah nggak punya tempat untuk kabur, tapi ternyata.',
  ],
};

const BLOCK_2: {start: number; sentences: string[]} = {
  start: 104.91,
  sentences: [
    'Saat gue mendekat, makhluk itu perlahan menoleh ke arah gue, dan di situlah semuanya berubah.',
    'Kepalanya botak, kulitnya pucat, matanya besar dan hitam, tangannya masih menggenggam uang yang tadi dia curi.',
    'Saat melihat wajahnya, gue langsung teringat cerita yang sering gue dengar dari orang-orang tua: makhluk kecil yang suka mencuri uang manusia, tuyul.',
    'Tapi ada satu hal yang jauh lebih aneh.',
    'Tiba-tiba tuyul itu berhenti menatap gue.',
    'Dia perlahan menoleh ke arah jendela, seolah-olah sedang melihat seseorang.',
    'Dan ketika gue ikut melihat ke arah sana, gue melihat siluet seorang manusia berdiri di dekat gerbang sekolah.',
    'Sejak saat itu gue sadar kalau ternyata ada sesuatu yang tinggal sangat dekat dengan rumah gue.',
    'Tapi sampai sekarang, gue masih penasaran siapa sebenarnya yang memelihara tuyul itu.',
  ],
};

export const AUDIO_DURATION = 165.6;

type Sentence = {text: string; start: number; end: number};

const schedule = (block: {start: number; sentences: string[]}, end: number): Sentence[] => {
  const weights = block.sentences.map((s) => s.length + 6);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = end - block.start;
  let cursor = block.start;
  return block.sentences.map((text, i) => {
    const dur = (weights[i] / total) * span;
    const row = {text, start: cursor, end: cursor + dur};
    cursor += dur;
    return row;
  });
};

export const SENTENCES: Sentence[] = [
  ...schedule(BLOCK_1, 104.91),
  ...schedule(BLOCK_2, AUDIO_DURATION),
];

export type SceneName = 'yard' | 'class';
export type CamKey = {
  /** 0..1 through the shot */
  at: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
  /** optional roll in degrees */
  roll?: number;
};

export type Shot = {
  id: string;
  scene: SceneName;
  sentenceFrom: number;
  sentenceTo: number;
  cam: CamKey[];
};

const S = (i: number) => SENTENCES[i].start;

export const SHOTS: Shot[] = [
  {
    id: 'intro',
    scene: 'yard',
    sentenceFrom: 0,
    sentenceTo: 2,
    cam: [
      {at: 0, pos: [1.2, 3.3, 16.0], target: [0.2, 2.7, -10], fov: 46},
      {at: 0.55, pos: [0.8, 2.5, 10.4], target: [0.2, 1.9, -6], fov: 44},
      {at: 1, pos: [0.4, 1.95, 7.0], target: [0.2, 1.4, -2], fov: 40},
    ],
  },
  {
    id: 'play',
    scene: 'yard',
    sentenceFrom: 3,
    sentenceTo: 4,
    cam: [
      {at: 0, pos: [1.35, 1.48, 3.9], target: [0.0, 1.05, -1.8], fov: 44},
      {at: 1, pos: [0.9, 1.42, 3.3], target: [0.05, 1.0, -1.9], fov: 42},
    ],
  },
  {
    id: 'spot',
    scene: 'yard',
    sentenceFrom: 5,
    sentenceTo: 5,
    cam: [
      {at: 0, pos: [2.4, 1.45, 4.0], target: [0.8, 0.9, -1.0], fov: 36},
      {at: 1, pos: [2.1, 1.4, 3.5], target: [0.8, 0.85, -1.05], fov: 34},
    ],
  },
  {
    id: 'misread',
    scene: 'yard',
    sentenceFrom: 6,
    sentenceTo: 7,
    cam: [
      {at: 0, pos: [2.3, 1.35, 3.6], target: [1.0, 0.9, -1.4], fov: 34},
      {at: 1, pos: [2.0, 1.3, 3.1], target: [1.05, 0.85, -1.5], fov: 32},
    ],
  },
  {
    id: 'shout',
    scene: 'yard',
    sentenceFrom: 8,
    sentenceTo: 9,
    cam: [
      {at: 0, pos: [1.4, 1.35, 3.4], target: [1.2, 1.05, -0.8], fov: 38},
      {at: 0.45, pos: [1.1, 1.55, 4.2], target: [1.5, 1.1, -1.9], fov: 42},
      {at: 1, pos: [0.7, 1.7, 4.6], target: [1.7, 1.15, -2.5], fov: 44},
    ],
  },
  {
    id: 'chase',
    scene: 'yard',
    sentenceFrom: 10,
    sentenceTo: 11,
    cam: [
      {at: 0, pos: [3.2, 1.55, 0.6], target: [-0.4, 1.05, -4.0], fov: 44},
      {at: 1, pos: [2.4, 1.5, 0.2], target: [0.2, 1.0, -4.6], fov: 42},
    ],
  },
  {
    id: 'vanish',
    scene: 'yard',
    sentenceFrom: 12,
    sentenceTo: 14,
    cam: [
      {at: 0, pos: [1.8, 2.2, 8.0], target: [0.0, 1.4, -9], fov: 42},
      {at: 0.6, pos: [1.6, 2.1, 7.4], target: [-0.2, 1.35, -8.5], fov: 41},
      {at: 1, pos: [1.4, 2.0, 6.8], target: [-0.4, 1.3, -8], fov: 40},
    ],
  },
  {
    id: 'door',
    scene: 'class',
    sentenceFrom: 15,
    sentenceTo: 16,
    cam: [
      {at: 0, pos: [1.8, 1.72, 6.6], target: [0.3, 1.2, 0.4], fov: 44},
      {at: 1, pos: [1.3, 1.6, 5.4], target: [0.35, 1.1, 0.4], fov: 40},
    ],
  },
  {
    id: 'reveal',
    scene: 'class',
    sentenceFrom: 17,
    sentenceTo: 18,
    cam: [
      {at: 0, pos: [0.45, 1.02, 3.0], target: [0.2, 0.6, 0.4], fov: 32},
      {at: 0.28, pos: [0.45, 1.03, 3.05], target: [0.2, 0.6, 0.4], fov: 32},
      {at: 1, pos: [1.15, 1.3, 6.0], target: [0.55, 1.0, 0.3], fov: 42},
    ],
  },
  {
    id: 'stop',
    scene: 'class',
    sentenceFrom: 19,
    sentenceTo: 20,
    cam: [
      {at: 0, pos: [1.5, 1.4, 4.8], target: [0.7, 1.0, 0.4], fov: 38},
      {at: 1, pos: [1.7, 1.45, 5.0], target: [0.8, 1.0, 0.45], fov: 39},
    ],
  },
  {
    id: 'window',
    scene: 'class',
    sentenceFrom: 21,
    sentenceTo: 22,
    cam: [
      {at: 0, pos: [1.0, 1.55, 4.8], target: [0.0, 1.45, -3.0], fov: 40},
      {at: 1, pos: [0.75, 1.55, 4.2], target: [0.1, 1.45, -3.6], fov: 38},
    ],
  },
  {
    id: 'end',
    scene: 'class',
    sentenceFrom: 23,
    sentenceTo: 24,
    cam: [
      {at: 0, pos: [1.5, 1.4, 4.6], target: [0.6, 1.0, 0.3], fov: 38},
      {at: 1, pos: [2.8, 1.6, 6.6], target: [0.5, 1.05, 0.3], fov: 42},
    ],
  },
];

export const SHOT_TIMES = SHOTS.map((shot) => ({
  ...shot,
  start: S(shot.sentenceFrom),
  end: shot.sentenceTo + 1 < SENTENCES.length ? S(shot.sentenceTo + 1) : AUDIO_DURATION,
}));

export type TimedShot = (typeof SHOT_TIMES)[number];

export const shotAt = (seconds: number): TimedShot => {
  for (let i = SHOT_TIMES.length - 1; i >= 0; i--) {
    if (seconds >= SHOT_TIMES[i].start) return SHOT_TIMES[i];
  }
  return SHOT_TIMES[0];
};

export const DURATION_FRAMES = Math.round(AUDIO_DURATION * FPS);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smoother = (x: number) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
