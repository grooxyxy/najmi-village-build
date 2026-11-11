# NAJMI — THE VILLAGE BUILDER

Episode 01 — **“Pintu Menuju Dunia Lain”**

Video cerita isekai/komedi berdurasi **216 detik (3:36)**, 1920×1080, 30 fps. Dunia dibangun dengan **Three.js low-poly** dan kamera miring bergaya **MOBA**, sementara karakternya memakai **pixel-art billboard** yang konsisten di semua adegan. Seluruh render dilakukan di **GitHub Actions**; tidak perlu memasang paket atau render di perangkat ini.

## Yang sudah ada

- 5 adegan + title card, total 6480 frame.
- 42 baris dialog/narasi berbahasa Indonesia.
- 14 cue SFX dan satu skor musik prosedural 216 detik.
- 9 pose sprite Najmi + sprite burung, semuanya digambar oleh skrip.
- UI System holo-cyan, overlay ponsel “27 lamaran / 0 balasan”, caption, transisi, dan title card.
- Pipeline CI: generate sprite → generate musik/SFX → download Piper → sintesis TTS → render ANGLE dengan fallback SwiftShader → upload artifact.

## Adegan

| Waktu | Adegan | Isi |
| --- | --- | --- |
| 00:00–00:35 | Kamar Najmi | Kamar berantakan, ponsel, 27 lamaran ditolak, bangun dan berjalan ke kamar mandi. |
| 00:35–01:10 | Kamar mandi / portal | Pintu kamar mandi membuka dunia lain; Najmi mencubit dirinya. |
| 01:10–01:40 | Dalam kabin | Kabin kayu, perapian, jendela besar; Najmi melihat dunia fantasi. |
| 01:40–01:50 | Reveal | Kamera MOBA menarik ke atas memperlihatkan padang rumput, gunung, sungai, dan kabin. |
| 01:50–02:35 | System | Panel System muncul: Host terpilih, misi utama tidak bisa dibatalkan. |
| 02:35–03:36 | Build & ending | Status wilayah kosong, kotej pertama dibangun dengan sihir, desa dimulai, title card. |

## Menjalankan lewat GitHub Actions

Workflow ada di `.github/workflows/render.yml` dan bisa dipicu manual (`workflow_dispatch`) atau otomatis saat push ke `main` yang menyentuh file proyek.

1. Buat repository GitHub kosong.
2. Dari folder ini:

   ```bash
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```

3. Buka tab **Actions → Render NAJMI Episode 01 → Run workflow**.
4. Setelah selesai, unduh artifact **najmi-episode-01**:
   - `najmi-ep1.mp4`
   - `thumbnail.png`
   - `audio-manifest.json`

Render penuh memakai `--gl=angle`. Jika ANGLE gagal, workflow otomatis mengulang dengan `--gl=swiftshader` dan mengunggah artifact terpisah. Render 1080p dengan adegan 3D bisa memakan waktu puluhan menit; job diberi batas 300 menit.

### Yang dilakukan CI

```text
npm install
python3 scripts/generate-sprites.py
node scripts/generate-audio.mjs
bash scripts/setup-piper.sh
node scripts/generate-tts.mjs
npx remotion render src/index.ts NajmiEp1 out/najmi-ep1.mp4 --gl=angle --concurrency=2
```

CI juga memasang `ffmpeg`, `fonts-dejavu-core`, dan Pillow. Tidak ada aset audio eksternal yang diunduh selain binary Piper dan model suaranya.

## Menjalankan di lokal (opsional)

Kalau ingin membuka Remotion Studio di komputer sendiri:

```bash
npm install
python3 scripts/generate-sprites.py
npx remotion studio src/index.ts
```

Tanpa menjalankan `generate-audio.mjs` dan `generate-tts.mjs`, video tetap bisa dipreview dengan caption berbasis estimasi dan tanpa audio. Untuk audio lengkap, sediakan `ffmpeg`/`ffprobe`, lalu:

```bash
bash scripts/setup-piper.sh
node scripts/generate-audio.mjs
node scripts/generate-tts.mjs
```

Perintah render lokal:

```bash
npx remotion render src/index.ts NajmiEp1 out/najmi-ep1.mp4 --gl=angle
```

## Struktur proyek

```text
src/NajmiVideo.tsx              komposisi utama + router adegan
src/Root.tsx                    registrasi komposisi 1920x1080/30fps
src/data/script.json            naskah, timing, cue SFX
src/data/script.ts              tipe + penggabungan manifest audio
src/data/audio-manifest.json    placeholder; ditimpa CI dengan timing TTS asli
src/components/                 caption, ponsel, System UI, title, transisi, audio
src/three/lib/                  kamera, primitif, tekstur prosedural, partikel, sprite
src/three/props/BuildingKit.tsx kabin, pohon, gunung, sungai, pagar, penanda desa
src/three/sets/                 kamar, kamar mandi/portal, interior kabin, meadow
scripts/generate-sprites.py     generator pixel-art (Pillow)
scripts/generate-audio.mjs      skor + SFX WAV murni Node
scripts/generate-tts.mjs        Piper + ffmpeg + penulis manifest
scripts/setup-piper.sh          unduh Piper + voice Indonesia
.github/workflows/render.yml    pipeline render
```

### Cara kerja timing

`src/data/script.json` menyimpan waktu dan estimasi durasi. Setelah Piper menghasilkan suara, `generate-tts.mjs` mengukur durasi nyata, menyesuaikan kecepatan dengan `atempo` agar setiap baris tidak melewati batas adegan, lalu menulis `src/data/audio-manifest.json`. File manifest itulah yang menjadi sumber kebenaran untuk `<Audio>` dan caption. Kalau tidak ada manifest (misalnya saat pertama kali membuka Studio), caption memakai estimasi dari naskah.

## Suara

- **TTS:** [Piper](https://github.com/rhasspy/piper), MIT, offline.
- **Voice:** `id_ID-news_tts-medium` dari [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices). Periksa lisensi voice sebelum publikasi komersial.
- **Narator / Najmi / System** dibedakan lewat `length_scale`, pitch (`asetrate` + `aresample`), dan filter ffmpeg; System mendapat echo digital tipis.
- **Musik & SFX:** disintesis dari nol oleh `scripts/generate-audio.mjs`; tidak memakai sampel atau aset berhak cipta.
- **Sprite:** dibuat oleh `scripts/generate-sprites.py`; hasilnya ada di `public/sprites/` dan `contact-sheet.png` untuk inspeksi.

## Catatan produksi

- Karakter memakai satu set sprite kanonik; tinggi dunia 1.75 unit di semua adegan.
- Kamera memakai keyframe `position/target/fov` dengan interpolasi smoothstep; tidak ada kamera top-down murni.
- Kabin di padang rumput dan kabin di dalam portal memakai kit bangunan yang sama.
- Adegan interior memakai kamera cutaway “dollhouse” agar isi ruangan terlihat dari sudut MOBA.
- Semua tekstur (kayu, batu, rumput, ubin, langit, glow) digambar secara prosedural di canvas; tidak ada file tekstur eksternal.
- Jika render terasa terlalu berat, turunkan `--concurrency` atau ubah resolusi di `src/Root.tsx` untuk preview, lalu kembalikan ke 1080p untuk render final.

## Status

Kode dan aset sudah siap. Video belum dirender di repo ini karena instruksi proyek: semua instalasi dan render dilakukan di GitHub Actions. Setelah remote GitHub ditambahkan dan workflow dijalankan, artifact video akan muncul di halaman Actions.
