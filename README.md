# Isekai Village — 5 Style Previews

Satu scene (desa isekai + penduduknya), lima versi style, semua digambar dari kode (tanpa aset eksternal).

| Komposisi | Style | File |
|---|---|---|
| `PreviewGrid` | Grid 5 versi berdampingan | `src/Root.tsx` |
| `Style1-Pixel` | Pixel art 16-bit (grid 8px, scanline, palet terkuantisasi) | `src/styles/PixelVillage.tsx` |
| `Style2-3D` | 3D CGI (CSS 3D transforms, kamera orbit, dinding berbayang) | `src/styles/Village3D.tsx` |
| `Style3-Stickman` | Stickman + 3D — kepala bulat putih, tangan mie, latar painted (sesuai referensi) | `src/styles/StickmanHybrid.tsx` |
| `Style4-Watercolor` | Lukisan air (feTurbulence wet edge, grain kertas) | `src/styles/WatercolorVillage.tsx` |
| `Style5-FlatAnime` | Flat vector / anime modern (outline tebal, mata anime) | `src/styles/FlatAnimeVillage.tsx` |

## Preview PNG (otomatis lewat CI)

Setiap push ke `main`, workflow **Preview Stills** (`.github/workflows/preview-still.yml`) akan:

1. `npm install`
2. Render still PNG (`--frame=60`) untuk 6 komposisi → folder `preview/`
3. Upload sebagai artifact **preview-stills**
4. Commit PNG-nya balik ke repo (folder `preview/`), jadi bisa langsung direview di halaman GitHub

Jalankan manual dari tab **Actions → Preview Stills → Run workflow** kapan saja.

## Menjalankan lokal

```bash
npm install
npm run studio                      # Remotion Studio
npm run still Style3-Stickman out/hybrid.png --frame=60
```

## Struktur

- `src/scene.ts` — data scene bersama: rumah, pohon, orang, jalan (semua style pakai ini → komposisinya identik)
- `src/helpers.ts` — motion shared: blink, bob, sway, napas, awan, motes
- `src/styles/*` — lima renderer, semua menerima `t` (detik)
- `src/Root.tsx` — 6 komposisi (1 grid + 5 single), 1920×1080, 30fps, 150 frame

Karakter di tiap style punya sikap yang sama: jalan bolak-balik, kedip, napas, tangan mengayun — hanya visualnya yang berbeda.
