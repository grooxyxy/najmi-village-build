# NAJMI — THE VILLAGE BUILDER

**Episode 01 — “Pintu Menuju Dunia Lain”** (216 detik / 3:36)<br/>
**Episode 02 — “Persiapan Menuju Dunia Baru”** (190 detik / 3:10)

Video cerita isekai/komedi berdurasi total **406 detik**, 1920×1080, 30 fps. Dunia dibangun dengan **Three.js low-poly** dan kamera sinematik, sementara karakternya memakai **pixel-art billboard** yang konsisten di semua adegan. Seluruh render dilakukan di **GitHub Actions**; tidak perlu memasang paket atau render di perangkat ini.

## Yang sudah ada

- Episode 01: 5 adegan + title card, 6480 frame, 42 baris dialog/narasi, 14 cue SFX.
- Episode 02: 6 adegan, 5700 frame, 26 baris dialog/narasi, 39 cue SFX, skor prosedural 190 detik.
- Episode 02 menambahkan kamera handheld/shake/roll, letterbox sinematik, speed lines, impact frame, sistem pencahayaan baru, serta set kabin, kamar mandi, toko modern, padang rumput, dan hutan.
- 21 pose sprite Najmi (termasuk `think`, `carry`, `shovel`, `phoneStand`) + sprite burung, semuanya digambar oleh skrip.
- UI System holo-cyan, checklist persiapan, ponsel daftar belanja, UI toko/struk, caption word-reveal, transisi, dan title card.
- Pipeline CI terpisah untuk Episode 01 dan Episode 02: generate sprite → generate musik/SFX → VoiceStudio/OmniVoice (dengan cache) → typecheck → render SwANGLE dengan fallback ANGLE + SwiftShader → unggah artifact + still validasi.

## Adegan Episode 02

| Waktu | Adegan | Isi |
| --- | --- | --- |
| 00:00–00:30 | Rumah kayu | Najmi merenungkan desa yang masih kosong; System membuka main quest. |
| 00:30–00:57 | System | Najmi meminta saran; checklist persiapan muncul satu per satu. |
| 00:57–01:45 | Dunia modern | Portal kamar mandi, daftar belanja di ponsel, toko perkakas, harga total yang bikin kaget. |
| 01:45–02:20 | Perlengkapan | Barang bawaan menumpuk di kabin; Najmi mulai menata persiapan. |
| 02:20–02:50 | Misi pertama | Padang rumput golden-hour, quest baru, dan langkah menuju hutan. |
| 02:50–03:10 | Hutan | Reruntuhan bercahaya ungu, suara retakan, sosok bertanduk di antara pepohonan. |

## Adegan Episode 01

| Waktu | Adegan | Isi |
| --- | --- | --- |
| 00:00–00:35 | Kamar Najmi | Kamar berantakan, ponsel, 27 lamaran ditolak, bangun dan berjalan ke kamar mandi. |
| 00:35–01:10 | Kamar mandi / portal | Pintu kamar mandi membuka dunia lain; Najmi mencubit dirinya. |
| 01:10–01:40 | Dalam kabin | Kabin kayu, perapian, jendela besar; Najmi melihat dunia fantasi. |
| 01:40–01:50 | Reveal | Kamera MOBA menarik ke atas memperlihatkan padang rumput, gunung, sungai, dan kabin. |
| 01:50–02:35 | System | Panel System muncul: Host terpilih, misi utama tidak bisa dibatalkan. |
| 02:35–03:36 | Build & ending | Status wilayah kosong, kotej pertama dibangun dengan sihir, desa dimulai, title card. |

## Menjalankan lewat GitHub Actions

Workflow Episode 01 ada di `.github/workflows/render.yml`; workflow Episode 02 ada di `.github/workflows/render-ep2.yml`. Keduanya bisa dipicu manual (`workflow_dispatch`) atau otomatis saat push ke `main` yang menyentuh file terkait.

1. Buat repository GitHub kosong.
2. Dari folder ini:

   ```bash
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

3. Buka tab **Actions → Render NAJMI Episode 02 → Run workflow**.
4. Setelah selesai, unduh artifact **najmi-episode-02**:
   - `najmi-ep2.mp4`
   - `ep2-s1-cabin.png`
   - `ep2-s2-system.png`
   - `ep2-s3-phone.png`
   - `ep2-s3-store.png`
   - `ep2-s4-supplies.png`
   - `ep2-s5-meadow.png`
   - `ep2-s6-forest.png`
   - `audio-manifest.json`

Render penuh memakai `--gl=swangle`. Jika SwANGLE gagal, workflow otomatis mengulang dengan `--gl=angle` dan mengunggah artifact terpisah. Render 1080p dengan adegan 3D bisa memakan waktu puluhan menit; job Episode 02 diberi batas 360 menit. VoiceStudio memakai image Docker `ghcr.io/debpalash/voicestudio:stable`, model OmniVoice ~2.4 GB, dan cache model + hasil VO agar render ulang tidak mengulang sintesis.

### Yang dilakukan CI Episode 02

```text
npm install
python3 scripts/generate-sprites.py
node scripts/generate-audio-ep2.mjs
# mulai container VoiceStudio di 127.0.0.1:3900
node scripts/generate-tts-ep2.mjs
npm run typecheck
npx remotion still ... NajmiEp2 ... --gl=swangle
npx remotion render src/index.ts NajmiEp2 out/najmi-ep2.mp4 --gl=swangle --concurrency=2
```

CI memasang `ffmpeg`, `fonts-dejavu-core`, dan Pillow. VoiceStudio dijalankan sebagai service Docker; model dan hasil VO disimpan lewat `actions/cache`. Tidak ada aset audio eksternal selain model OmniVoice.

## Menjalankan di lokal (opsional)

Kalau ingin membuka Remotion Studio di komputer sendiri:

```bash
npm install
python3 scripts/generate-sprites.py
npx remotion studio src/index.ts
```

Tanpa menjalankan `generate-audio.mjs` dan `generate-tts.mjs`, video tetap bisa dipreview dengan caption berbasis estimasi dan tanpa audio. Untuk audio lengkap, sediakan `ffmpeg`/`ffprobe`, lalu:

```bash
# Jalankan VoiceStudio lebih dulu (Docker), lalu:
node scripts/generate-audio.mjs
VOICESTUDIO_API_KEY=... VOICESTUDIO_URL=http://127.0.0.1:3900 node scripts/generate-tts.mjs
```

Perintah render lokal:

```bash
npx remotion render src/index.ts NajmiEp1 out/najmi-ep1.mp4 --gl=swangle
npx remotion render src/index.ts NajmiEp2 out/najmi-ep2.mp4 --gl=swangle
```

Untuk Episode 02, ganti skrip audio/TTS dengan versi `-ep2`:

```bash
node scripts/generate-audio-ep2.mjs
VOICESTUDIO_API_KEY=... VOICESTUDIO_URL=http://127.0.0.1:3900 node scripts/generate-tts-ep2.mjs
```

## Struktur proyek

```text
src/NajmiVideo.tsx              komposisi Episode 01 + router adegan
src/NajmiEp2.tsx                komposisi Episode 02 + router adegan
src/Root.tsx                    registrasi NajmiEp1 / NajmiEp2 1920x1080/30fps
src/data/script.json            naskah Episode 01, timing, cue SFX
src/data/ep2/script.json        naskah Episode 02, timing, cue SFX
src/data/script.ts              tipe + penggabungan manifest audio Episode 01
src/data/ep2/script.ts          tipe + penggabungan manifest audio Episode 02
src/data/audio-manifest.json    placeholder; ditimpa CI dengan timing TTS asli
src/components/                 caption, ponsel, System UI, title, transisi, audio
src/components/ep2/              caption, HUD, ponsel, toko, sinematik, title, audio Ep2
src/three/lib/                  kamera, primitif, tekstur prosedural, partikel, sprite
src/three/props/BuildingKit.tsx kabin, pohon, gunung, sungai, pagar, penanda desa
src/three/sets/                 kamar, kamar mandi/portal, interior kabin, meadow
src/three/sets/ep2/             kabin, kamar mandi, toko, padang rumput/hutan Ep2
scripts/generate-sprites.py     generator pixel-art (Pillow)
scripts/generate-audio.mjs      skor + SFX WAV Episode 01 murni Node
scripts/generate-audio-ep2.mjs  skor + SFX WAV Episode 02 murni Node
scripts/generate-tts.mjs        VoiceStudio/OmniVoice + ffmpeg + manifest Ep1
scripts/generate-tts-ep2.mjs    VoiceStudio/OmniVoice + ffmpeg + manifest Ep2
.github/workflows/render.yml    pipeline render Episode 01
.github/workflows/render-ep2.yml pipeline render Episode 02
```

### Cara kerja timing

`src/data/script.json` dan `src/data/ep2/script.json` menyimpan waktu dan estimasi durasi. Setelah VoiceStudio menghasilkan suara, skrip TTS memangkas senyap, mengatur pitch/karakter suara, lalu menulis manifest audio. File manifest itulah yang menjadi sumber kebenaran untuk `<Audio>` dan caption. Kalau tidak ada manifest (misalnya saat pertama kali membuka Studio), caption memakai estimasi dari naskah.

Episode 01 memakai jendela waktu tetap agar 42 baris muat dalam 216 detik. Episode 02 memakai **natural-duration scheduling**: setiap baris disintesis lebih dulu, hanya dipercepat maksimal 1.08× jika jauh melewati estimasi, lalu baris berikutnya dijadwalkan setelah jeda napas. Ini menghindari dialog yang terpotong atau terdengar dikejar-kejar.

## Suara

- **TTS:** [VoiceStudio](https://github.com/debpalash/VoiceStudio) + engine OmniVoice (`k2-fsa/OmniVoice`).
- **Lisensi model:** weight OmniVoice memakai CC-BY-NC dan komponen tokenizer pihak ketiga. Workflow disetel untuk produksi **non-komersial**; jangan aktifkan `VOICESTUDIO_ACCEPT_MODEL_LICENCE` untuk penggunaan komersial tanpa meninjau ulang lisensi. VoiceStudio juga meminta penerimaan terpisah untuk tokenizer `eustlb/higgs-audio-v2-tokenizer`, dan pipeline menerima kedua gate tersebut.
- **Narator / Najmi / System** dibedakan lewat voice-design (`male, middle-aged, low pitch`, `male, young adult`), seed tetap per penutur, pitch (`asetrate` + `aresample`), EQ/kompresi, dan filter ffmpeg; System mendapat tremolo + echo digital.
- **Ekspresi Episode 02:** tag `[pause]`, `[sigh]`, `[surprise-ah]`, dan `whisper` dipakai di teks TTS (bukan di caption) untuk napas, kaget, dan baris akhir yang dikecilkan. Tempo maksimal 1.08× agar dialog tetap natural.
- **Musik & SFX:** disintesis dari nol oleh `scripts/generate-audio.mjs` dan `scripts/generate-audio-ep2.mjs`; tidak memakai sampel atau aset berhak cipta.
- **Sprite:** dibuat oleh `scripts/generate-sprites.py`; hasilnya ada di `public/sprites/` dan `contact-sheet.png` untuk inspeksi.

## Catatan produksi

- Karakter memakai satu set sprite kanonik; tinggi dunia 1.75 unit di semua adegan.
- Kamera memakai keyframe `position/target/fov` dengan interpolasi smoothstep; tidak ada kamera top-down murni.
- Kabin di padang rumput dan kabin di dalam portal memakai kit bangunan yang sama.
- Adegan interior memakai kamera cutaway “dollhouse” agar isi ruangan terlihat dari sudut MOBA.
- Semua tekstur (kayu, batu, rumput, ubin, langit, glow) digambar secara prosedural di canvas; tidak ada file tekstur eksternal.
- Jika render terasa terlalu berat, turunkan `--concurrency` atau ubah resolusi di `src/Root.tsx` untuk preview, lalu kembalikan ke 1080p untuk render final.

## Status

Episode 01 sudah berhasil dirender lewat GitHub Actions. Episode 02 sudah siap dirender dengan workflow terpisah; semua instalasi dan render tetap dilakukan di GitHub Actions, bukan di perangkat ini. Setelah workflow Episode 02 dijalankan, artifact video dan still validasi akan muncul di halaman Actions.
