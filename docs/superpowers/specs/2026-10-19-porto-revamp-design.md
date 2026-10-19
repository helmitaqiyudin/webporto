# Revamp porto + widget live: desain

Tanggal: 2026-10-19
Status: draft, nunggu review Helmi

## 1. Tujuan

Web porto `helmitaqiyudin` dibuat **seimbang antara recruiter dan personal**:

- Recruiter bisa langsung nemu projects, experience, dan stack tanpa ketutupan widget.
- Bagian atas halaman nunjukin kepribadian lewat widget live: status Discord, lagu yang lagi diputer di Spotify, lari terakhir di Strava, dan heatmap aktivitas coding (GitHub + Bitbucket).
- Pengunjung bisa **suggest lagu ke queue Spotify** Helmi. Ini satu-satunya kontrol yang dibuka buat publik.

**Dianggap berhasil kalau:**

1. Keempat widget nampilin data asli di production.
2. Token Spotify dan Strava bisa diperbarui sendiri lewat halaman `/auth` tanpa nyentuh secret manual.
3. Pengunjung ga bisa pause/skip/seek musik Helmi. Suggest lagu bebas tanpa rate limit (keputusan Helmi: trafiknya kecil).
4. Kalau salah satu integrasi mati, halaman tetap jalan dan cuma kartu itu yang nampilin status offline.
5. Ada section Projects, experience punya poin pencapaian, dan tech stack dikelompokkan.

## 2. Kondisi sekarang (hasil cek 2026-10-19)

| Hal | Temuan |
|---|---|
| Spotify refresh token | `400 invalid_grant: Refresh token revoked`, harus OAuth ulang |
| Strava refresh token | Masih valid, tapi app statusnya `Inactive`, semua request data `403` |
| Strava backend | Monorepo Better-T-Stack (tRPC, Drizzle, Turso, Alchemy) yang ga kepake. State `.alchemy` kosong, kemungkinan belum pernah deploy |
| Spotify backend | Bukan git repo. Endpoint play/pause/skip/seek/queue kebuka tanpa auth dan tanpa rate limit |
| Kedua backend | Refresh token yang dikirim balik provider ga pernah disimpan. Kalau provider rotasi token, integrasinya mati diam-diam |
| webporto | Next 14.2.14, React 18. `page.tsx` full `"use client"`. `@mantine/*` terpasang tapi ga dipakai. `framer-motion-3d` dipakai di `head3D.tsx` dan `modelControl.tsx` |
| Konten | Belum ada section Projects. Flutter disebut di bio tapi ga ada di stack |

## 3. Arsitektur

```
Browser (webporto di Vercel)
 ├─ Lanyard API ───────────────────────────── status Discord (tetap)
 └─ helmi-api (Cloudflare Worker, Hono)
      ├─ /spotify/*  ── Spotify Web API (real time, cache memori)
      ├─ /strava/*   ── baca KV (diisi sama cron)
      ├─ /activity   ── baca KV (diisi sama cron)
      ├─ /auth/*     ── OAuth Spotify/Strava, dikunci ADMIN_KEY
      └─ cron 30 menit ── Strava + GitHub GraphQL + Bitbucket Cloud → KV
```

- **Repo baru `helmi-api`** di `C:\Users\helmi\helmi-api`, isinya Hono + Wrangler biasa. Logika `spotify.ts` dan `strava.ts` yang lama dipindah ke sini. Setelah `helmi-api` live, repo `strava-web-api-backend` dan `spotify-web-api-backend` diarsipkan (ga dihapus).
- **Satu KV namespace** `HELMI_KV`.
- **Cache jangka pendek** pakai `Map` di memori isolate. Cache API cuma dijamin jalan di custom domain, jadi dia bukan andalan utama. Kalau nanti worker dipasang di custom domain, Cache API bisa ditambah sebagai lapisan kedua.

## 4. Backend `helmi-api`

### 4.1 Endpoint publik

Semua response sudah dinormalisasi. Bentuk mentah dari provider ga pernah dikirim ke client.

| Route | Response | Sumber / cache |
|---|---|---|
| `GET /spotify/now-playing` | `{ isPlaying, track: { id, name, artists[], album, imageUrl, url, durationMs } \| null, progressMs, fetchedAt }` | Spotify `/me/player`, memori 5 detik |
| `GET /spotify/recent` | `{ track, playedAt }` (lagu terakhir) | Spotify `/me/player/recently-played?limit=1`, memori 60 detik |
| `GET /spotify/search?q=` | `{ tracks: [{ uri, name, artists[], imageUrl, explicit }] }` max 5 | Spotify `/search`, `q` 2–100 karakter, memori 60 detik per query |
| `POST /spotify/queue` body `{ uri }` | `{ ok: true }` atau error (§4.3) | Spotify `/me/player/queue` |
| `GET /strava/recent` | `{ name, sportType, startDate, distanceM, movingTimeS, elevationM, avgPaceSPerKm, polyline \| null }` | KV `strava:recent` |
| `GET /strava/stats` | `{ recent4w, ytd, allTime }`, isinya `{ count, distanceM, movingTimeS }` | KV `strava:stats` |
| `GET /activity` | `{ updatedAt, days: { "YYYY-MM-DD": { github, bitbucket } } }` 365 hari | KV `activity:merged` |
| `GET /health` | `{ spotify, strava, github, bitbucket }`, isinya `ok` / `error` / `stale` plus `lastSuccessAt` | KV `health:*` |

Header `Cache-Control` dikasih ke response GET (misalnya `public, max-age=5` buat now-playing, `max-age=300` buat Strava/activity).

Endpoint play/pause/skip/seek/position yang lama **ga dipindah**.

### 4.2 Token dan OAuth

- Refresh token disimpan di KV (`token:spotify:refresh`, `token:strava:refresh`). Secret Wrangler cuma dipakai sebagai nilai awal kalau KV-nya masih kosong.
- Access token di-cache di KV sampai `expires_in - 60` detik. Hasilnya sekitar 24 write/hari buat Spotify dan 4 buat Strava.
- Kalau provider ngirim balik `refresh_token` baru, nilai di KV langsung diganti.
- Halaman `GET /auth/spotify?key=ADMIN_KEY` dan `GET /auth/strava?key=ADMIN_KEY`:
  1. Cek `key` (constant-time compare).
  2. Set cookie `state` (HttpOnly, Secure, SameSite=Lax, 10 menit).
  3. Redirect ke halaman authorize provider.
- `GET /auth/{provider}/callback` ngecek `state`, nuker `code` jadi token, simpan refresh token ke KV, terus nampilin halaman "Tersambung".
- Scope yang diminta:
  - Spotify: `user-read-playback-state user-read-currently-playing user-modify-playback-state user-read-recently-played`
  - Strava: `read,activity:read`. Sengaja ga pakai `activity:read_all`, biar aktivitas "Only me" ga ikut ketarik.
- Kalau refresh gagal karena `invalid_grant`, status `health` integrasi itu jadi `error`, dan endpoint-nya ngasih `503 { error: "reauth_required" }`.

### 4.3 Suggest lagu (`POST /spotify/queue`)

Ga ada rate limit (keputusan Helmi). Urutan pengecekan:

1. **Validasi input.** `uri` harus cocok dengan `^spotify:track:[A-Za-z0-9]{22}$`. Kalau ga cocok, `400 invalid_uri`.
2. **Origin.** Header `Origin` harus ada di `ALLOWED_ORIGINS`. Kalau ga ada, `403`. Ini cuma nyaring request dari browser di web lain. Script yang manggil langsung tetap bisa lolos.
3. **Player aktif.** Panggil `/me/player`. Kalau `204` atau ga ada device aktif, `409 { error: "not_listening" }`.
4. **Masukin ke queue.** Panggil Spotify add to queue. Kalau gagal, `502`.

Asumsi: akun Spotify Helmi Premium (add to queue butuh Premium).

### 4.4 Cron (tiap 30 menit, `*/30 * * * *`)

Batas free plan: 10 ms CPU dan 50 subrequest per invocation, termasuk cron. Tiap run punya anggaran subrequest `CRON_SUBREQUEST_BUDGET` (default 40), dan tugasnya dikerjain berurutan:

1. **Strava** (sekitar 3 subrequest):
   - Ambil token, `/athlete/activities?per_page=10`, dan `/athletes/{id}/stats`.
   - Pilih aktivitas terbaru yang `sport_type` termasuk `Run`, `TrailRun`, atau `VirtualRun`, dan `visibility === "everyone"`.
   - **Privasi:** polyline-nya dipotong sekitar 300 m di awal dan di akhir sebelum disimpan, biar lokasi start/finish (rumah) ga kelihatan.
   - Simpan `strava:recent` dan `strava:stats`.
2. **GitHub** (1 subrequest, sekali per 6 jam):
   - GraphQL `user(login).contributionsCollection.contributionCalendar` buat 365 hari terakhir.
   - Simpan `activity:github` sebagai `{ date: count }`.
   - Kontribusi private ikut kehitung kalau setting "Private contributions" di profil GitHub aktif.
3. **Bitbucket Cloud** (sisa anggaran):
   - Daftar repo diambil dari `/2.0/repositories/{workspace}?q=updated_on>"<365 hari lalu>"` untuk tiap workspace di `BITBUCKET_WORKSPACES`, terus di-cache di KV `bb:repos` (refresh tiap 24 jam).
   - Tiap repo punya cursor di KV `bb:cursor:<repo>`, isinya `{ newestSeen, backfillNext | null, done }`.
   - **Backfill:** lanjut dari `backfillNext` (`/commits?pagelen=100`) sampai ketemu commit yang lebih tua dari 365 hari.
   - **Incremental:** ambil halaman pertama, terus berhenti begitu ketemu commit dengan tanggal ≤ `newestSeen`.
   - Cuma commit yang email `author.raw`-nya ada di `AUTHOR_EMAILS` yang dihitung. Commit didedup per hash di dalam satu run.
   - Hasilnya ditambahin ke `activity:bitbucket` (`{ date: count }`). Yang disimpan cuma tanggal dan jumlah, tanpa nama repo atau pesan commit.
   - Kalau anggaran habis, sisanya lanjut di run berikutnya. Backfill awal diperkirakan selesai dalam beberapa jam.
4. **Gabung data.** Kalau `activity:github` atau `activity:bitbucket` berubah, tulis ulang `activity:merged`.
5. Tulis `health:<integrasi>` cuma kalau statusnya berubah, biar hemat write.

Kira-kira jumlah write KV: di bawah 300/hari. Kalau limit CPU 10 ms ternyata kena pas backfill Bitbucket, `CRON_SUBREQUEST_BUDGET` diturunin. Kalau masih kena juga, opsinya Workers Paid ($5/bulan). Keputusan itu ada di Helmi.

### 4.5 Konfigurasi

| Nama | Jenis | Isi |
|---|---|---|
| `ALLOWED_ORIGINS` | var | domain porto, `http://localhost:3000`, dan pola preview `*.vercel.app` milik project ini |
| `CRON_SUBREQUEST_BUDGET` | var | angka |
| `GITHUB_LOGIN`, `BITBUCKET_WORKSPACES`, `AUTHOR_EMAILS` | var | dipisah koma |
| `SPOTIFY_CLIENT_ID/SECRET`, `STRAVA_CLIENT_ID/SECRET` | secret | |
| `SPOTIFY_REFRESH_TOKEN`, `STRAVA_REFRESH_TOKEN` | secret, opsional | nilai awal KV |
| `GITHUB_TOKEN` | secret | fine-grained PAT, read-only |
| `BITBUCKET_EMAIL`, `BITBUCKET_API_TOKEN` | secret | Atlassian API token dengan scope baca repo |
| `ADMIN_KEY` | secret | string acak panjang |

Secret lokal ditaruh di `.dev.vars`, yang sudah ada di `.gitignore`.

### 4.6 Struktur file

```
helmi-api/
  src/index.ts            app Hono, CORS, mount route, handler scheduled
  src/routes/spotify.ts   now-playing, recent, search, queue
  src/routes/strava.ts    recent, stats (baca KV)
  src/routes/activity.ts
  src/routes/auth.ts      OAuth Spotify/Strava
  src/routes/health.ts
  src/lib/tokens.ts       simpan refresh/access token di KV + rotasi
  src/lib/spotify.ts      client + normalizer
  src/lib/strava.ts       client + normalizer + trim polyline
  src/lib/github.ts       query kalender kontribusi
  src/lib/bitbucket.ts    daftar repo, scan commit, cursor
  src/lib/memoCache.ts    cache TTL di memori isolate
  src/cron.ts             orkestrasi cron + anggaran subrequest
  test/*.test.ts
  wrangler.jsonc
```

## 5. Frontend `webporto`

### 5.1 Upgrade

- Next 16 + React 19.2, `@react-three/fiber` v9, `@react-three/drei` v10, `framer-motion` v12. Versi persisnya diambil dari npm waktu implementasi.
- `framer-motion-3d` dihapus. Efek pegas di `head3D.tsx` dan `modelControl.tsx` ditulis ulang pakai `useFrame` + integrator pegas kecil (`stepSpring`). `THREE.MathUtils.damp` ga bisa overshoot, jadi efek mantulnya bakal hilang.
- `@mantine/*` dihapus karena ga dipakai.
- `next lint` udah dihapus di Next 16, jadi script lint diganti `eslint .` dengan flat config.
- `page.tsx` jadi server component. Komponen yang butuh state/efek (widget, 3D, kucing, text effect) jadi client island.

### 5.2 Layout

Urutan dari atas ke bawah. Lebar konten maksimal sekitar 680px, jadi satu kolom di bawah 640px.

1. **Bar atas:** toggle tema.
2. **Hero:** kepala 3D (dikecilin, di sebelah kiri), nama, role, bio, tombol sosmed + resume.
3. **Grid widget** (2 kolom):
   - baris 1: Discord | Spotify
   - baris 2: Strava (lebar penuh)
   - baris 3: heatmap (lebar penuh)
4. **Projects:** grid kartu 2 kolom.
5. **Experience / Education:** tabs (komponen lama, ditambah poin pencapaian).
6. **Tech stack:** dikelompokkan.
7. **Footer.**

Kucing interaktif tetap ada. Kartu Discord menggantikan tombol di pojok kiri atas.

### 5.3 Widget

Semua widget ada di `src/components/widgets/`. Masing-masing pakai React Query, dan base URL-nya diambil dari `NEXT_PUBLIC_API_URL`.

- **`DiscordCard`:** data dari Lanyard, interval 5 detik (sama kayak sekarang). Nampilin avatar, titik status, aktivitas pertama, dan timer. Kalau aktivitasnya lebih dari satu, sisanya muncul di hover card. `calculateTimes` dan helper lain di `lib/utils.ts` dipakai ulang.
- **`SpotifyCard`:**
  - `now-playing` di-refresh tiap 10 detik, dan progress-nya diinterpolasi di client tiap 1 detik.
  - Kalau `isPlaying === false`, kartu nampilin `/spotify/recent` dengan label "Last played". Semua teks UI pakai bahasa Inggris, sama kayak situs yang sekarang.
  - Tombol **Suggest a song** ngebuka dialog. Ada input pencarian (debounce 300 ms, minimal 2 karakter) dan daftar maksimal 5 hasil. Pengunjung pilih lagu, POST ke `/spotify/queue`, terus muncul pesan sesuai hasilnya:

    | Hasil | Pesan |
    |---|---|
    | `ok` | "Added to Helmi's queue" |
    | `not_listening` | "Helmi isn't listening right now" |
    | lainnya | "Couldn't add that song. Try again." |

  - Dialog-nya pakai `@radix-ui/react-dialog` (dependency baru, gaya shadcn sama kayak komponen `ui/` yang ada).
- **`StravaCard`:**
  - Rute digambar sebagai SVG dari polyline (decoder sendiri sekitar 30 baris, tanpa library peta).
  - Isinya: nama run, waktu relatif, jarak, pace, durasi, elevasi.
  - Baris statistik: total tahun ini (km, jumlah run) dan 4 minggu terakhir.
  - Kalau `polyline` null (treadmill), yang muncul ikon lari.
  - Interval refresh 5 menit.
- **`ActivityHeatmap`:**
  - Grid 53×7 dari `/activity`, warnanya 5 level berdasarkan kuartil total commit per hari.
  - Tooltip per hari nampilin tanggal plus jumlah GitHub dan Bitbucket.
  - Ada judul total setahun dan legend.
  - Di layar sempit, heatmap bisa di-scroll horizontal di dalam kartunya sendiri. Halamannya sendiri tetap ga boleh scroll horizontal.
  - Interval refresh 30 menit.

**Status tiap widget:**

- Loading: skeleton seukuran kartu.
- Error/offline: kartu tetap tampil dengan teks pelan "Offline right now". Retry React Query dibatasi 2 kali.
- `reauth_required`: sama kayak offline. Di sisi publik ga ada detail teknis.
- Polling berhenti kalau tab disembunyikan (default React Query).

### 5.4 Konten

- `src/data/projects.ts` (baru), tipe `Project`:
  `{ slug, name, year, role, summary, stack: string[], image?, highlights: string[], links?: { demo?, repo? }, internal?: boolean }`.
  Draft awal: myITS Housing, IOG E-commerce, porto ini, `helmi-api`. Project dengan `internal: true` dapet badge "Internal" tanpa link. Screenshot ditaruh di `public/images/projects/`.
- `src/data/experience.tsx`: tiap entri ditambah `highlights: string[]` (3–4 poin). `description` jadi ringkasan.
- `src/data/stack.tsx`: ditambah field `category` (`frontend` | `mobile` | `backend` | `infra` | `tools`). Isi tambahan: Flutter, Postgres, Cloudflare Workers, Hono, Three.js. Daftar final dikonfirmasi Helmi.
- Teks konten gw draft dari data yang ada. Helmi yang nambahin angka/pencapaian dan screenshot.

## 6. Testing dan verifikasi

- **helmi-api:** Vitest, buat
  - normalizer Spotify/Strava (fixture JSON)
  - trim polyline
  - rotasi token (KV palsu)
  - merge heatmap
  - cursor Bitbucket (filter author, berhenti di `newestSeen`, berhenti di batas 365 hari)
  - route `/spotify/queue` untuk tiap cabang error, dengan `fetch` palsu
- **webporto:** Vitest buat decode polyline, format pace/durasi, dan bucket kuartil heatmap.
- **Tiap tahap:** typecheck, lint, `next build`, terus cek di browser (light/dark, lebar 375px dan desktop, kepala 3D, kucing, tiap widget dalam keadaan sukses dan API mati).

## 7. Urutan kerja

1. **`helmi-api`:** scaffold, lib + route + cron + test, deploy `wrangler deploy`.
   **Langkah manual Helmi:**
   - aktifin lagi app Strava
   - daftarin redirect URI `<worker-url>/auth/{spotify,strava}/callback` di dashboard Spotify dan Strava
   - buka `/auth/spotify` dan `/auth/strava`
   - bikin GitHub PAT dan Atlassian API token
   - isi secret
   - konfirmasi `/health` hijau
2. **webporto:** upgrade Next 16 / React 19 dan susun ulang layout, pakai data lama dulu. Verifikasi 3D dan kucing.
3. **Widget:** Spotify, Strava, heatmap, kartu Discord.
4. **Konten:** projects, experience, stack.
5. Arsipkan dua repo backend lama.

Tiap tahap di branch sendiri dengan preview Vercel.

## 8. Di luar scope

- Kontrol play/pause/skip buat siapa pun, termasuk Helmi.
- Halaman detail per project, blog, CMS.
- Webhook Strava (polling cron 30 menit udah cukup).
- Custom domain buat worker (opsional, bisa nanti).

## 9. Risiko

| Risiko | Mitigasi |
|---|---|
| App Strava ga bisa diaktifkan lagi | Kartu Strava tampil offline, sisanya tetap jalan. Bisa dicek ulang nanti |
| Kebijakan Spotify untuk app development mode berubah | `/health` nunjukin error, kartu jatuh ke mode offline |
| CPU 10 ms kena pas backfill Bitbucket | Turunin anggaran per run. Opsi terakhir Workers Paid |
| Ada yang nge-spam queue (pengunjung iseng atau script yang manggil API langsung) | Sengaja ga dibatasi. Dampaknya cuma lagu tambahan di queue, ga bisa skip/pause. Kalau kejadian, rate limit per IP pakai KV bisa ditambah lagi (sekitar 20 baris) |
| Upgrade R3F v9 ngerusak model atau sprite kucing | Tahap 2 dikerjakan terpisah dan diverifikasi sebelum widget |
