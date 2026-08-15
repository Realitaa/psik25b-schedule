# PSIK25B Schedule & Class Management System

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.5-00DC82?logo=nuxt&labelColor=020420)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-v4-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&labelColor=020420)](https://www.typescriptlang.org/)
[![NuxtHub](https://img.shields.io/badge/NuxtHub-Cloudflare%20D1-000000?logo=cloudflare&labelColor=020420)](https://hub.nuxt.com)

Sistem Informasi dan Manajemen Jadwal Perkuliahan serta Data Dosen untuk Kelas PSIK25B. Dibangun menggunakan **Nuxt 4**, **Nuxt UI v4**, dan **NuxtHub (Cloudflare D1 / SQLite)** dengan tema warna **Teal**.

---

## 🚀 Fitur Utama

### 📖 Portal Publik (`/`)
* **Jadwal Hari Ini (`TodayActivityCard`)**:
  * Menampilkan kartu perkuliahan hari ini yang diperbarui secara real-time.
  * Status berwarna interaktif:
    * 🟢 **Sedang Berlangsung** (Teal)
    * 🔵 **Mendatang** (Blue)
    * 🟢 **Hari Libur / Akhir Pekan** (Green)
  * Menapis otomatis mata kuliah yang sudah selesai pada hari tersebut.
  * Deteksi otomatis libur nasional & akhir pekan via composable `useDayStatus`.
* **Jadwal Mata Kuliah**:
  * Menampilkan seluruh perkuliahan pada tahun ajaran aktif secara teratur.
  * Diurutkan secara kronologis berdasarkan hari (Senin → Jumat) dan jam mulai.
  * Ramah pengguna mobile dengan *text wrapping* dan *min-width constraint* tanpa scrolling horizontal berlebih.
* **Data Dosen Pengampu**:
  * Daftar kontak dosen pengampu lengkap dengan singkatan, NIP, dan link integrasi pesan langsung ke WhatsApp (`wa.me`).

### 🔐 Admin Dashboard (`/dashboard`)
* **Manajemen Otentikasi**: Sistem login admin berbasis sesi (`nuxt-auth-utils`).
* **Manajemen Tahun Ajaran**: Tambah tahun ajaran dan setel tahun ajaran aktif.
* **Manajemen Data Dosen**: Tambah, edit, dan hapus data dosen.
* **Manajemen Mata Kuliah**: Tambah, edit, dan hapus jadwal mata kuliah beserta dosen pengampunya.

---

## 🛠️ Teknologi & Libs

* **Framework**: [Nuxt 4](https://nuxt.com)
* **UI & Styling**: [Nuxt UI v4](https://ui.nuxt.com) + [Tailwind CSS v4](https://tailwindcss.com)
* **Database & ORM**: [NuxtHub](https://hub.nuxt.com) + [Drizzle ORM](https://orm.drizzle.team) (SQLite / Cloudflare D1)
* **Authentication**: [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)
* **Icons**: [Iconify / Lucide & Simple Icons](https://iconify.design)
* **Code Quality**: ESLint (`@nuxt/eslint`) + `vue-tsc`

---

## 💻 Cara Menjalankan Proyek

### 1. Prasyarat
Pastikan Node.js dan `pnpm` sudah terpasang di sistem Anda.

### 2. Instalasi Dependensi
```bash
pnpm install
```

### 3. Generasi Tipe Nuxt
```bash
npx nuxi prepare
```

### 4. Menjalankan Server Pengembangan
```bash
pnpm dev
```
Akses aplikasi di browser pada alamat `http://localhost:3000`.

---

## 📦 Perintah Skrip (`Scripts`)

| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev` | Menjalankan dev server Nuxt pada port 3000 |
| `pnpm build` | Membangun bundle aplikasi untuk produksi |
| `pnpm preview` | Menjalankan preview lokal hasil build produksi |
| `pnpm typecheck` | Menjalankan pemeriksaan tipe TypeScript via `vue-tsc` |
| `pnpm lint` | Menjalankan pemeriksaan linter ESLint |
| `pnpm postinstall` | Generasi otomatis tipe `.nuxt` (`nuxi prepare`) |

---

## 📄 Lisensi

Proyek ini dilindungi di bawah lisensi [MIT](LICENSE).
