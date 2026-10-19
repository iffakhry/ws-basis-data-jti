---
theme: default
title: Praktikum SQL Dasar — WHERE, Operator, LIKE, ORDER BY
info: |
  Workshop Basis Data
  Studi kasus TokoKu · 2 pertemuan × 4 jam
class: text-center
transition: slide-left
mdc: true
aspectRatio: 16/9
canvasWidth: 980
lineNumbers: false
drawings:
  persist: false
---

# Praktikum SQL Dasar

## WHERE · Operator · LIKE · ORDER BY

<div class="mt-8 opacity-80">

Studi kasus **TokoKu** (toko online perangkat komputer)

2 pertemuan × 4 jam · MySQL 8 / MariaDB

</div>

<div class="abs-br m-6 text-sm opacity-60">Workshop Basis Data</div>

---

## 🎯 Tujuan Pembelajaran

Setelah praktikum ini, kamu mampu:

1. Memfilter data dengan `WHERE` dan berbagai operator
2. Menggabungkan kondisi: `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, `IS NULL`
3. Mencari data berpola teks dengan `LIKE`
4. Mengurutkan dan membatasi hasil: `ORDER BY` dan `LIMIT`
5. Menulis query yang **aman** dan **efisien** sesuai praktik industri

<div class="mt-6 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

💡 Ketik sendiri setiap query, **tebak dulu hasilnya**, baru jalankan. Kalau hasilnya beda dari tebakanmu, di situlah kamu belajar!

</div>

---

## 🗓️ Alur Waktu

<style>
table { font-size: 0.8rem; }
th, td { padding: 0.15rem 0.7rem !important; }
</style>

| Pertemuan | Sesi | Durasi | Materi |
|---|---|---|---|
| **1** | A | 30 mnt | Persiapan database & review `SELECT` |
| | B | 55 mnt | `WHERE` + operator perbandingan |
| | C | 55 mnt | `AND`, `OR`, `NOT`, `IN`, `BETWEEN` |
| | D | 35 mnt | `NULL` + latihan mini |
| | E | 65 mnt | Rangkuman + **Lembar Kerja 1** (20 soal) |
| **2** | A | 20 mnt | Review pertemuan 1 |
| | B | 60 mnt | `LIKE` dan wildcard |
| | C | 55 mnt | `ORDER BY` + `LIMIT` (pagination) |
| | D | 30 mnt | Praktik terbaik industri |
| | E | 75 mnt | **Lembar Kerja 2** (20 soal) |

---

## 🛒 Studi Kasus: Database TokoKu

Satu database yang dipakai terus dari awal sampai akhir.

<style>
table { font-size: 0.75rem; }
th, td { padding: 0.15rem 0.5rem !important; }
</style>

<div class="grid grid-cols-3 gap-4">

<div>

**pelanggan**

| Kolom | Tipe |
|---|---|
| id | INT (PK) |
| nama | VARCHAR |
| email | VARCHAR, *NULL* |
| kota | VARCHAR |
| tanggal_daftar | DATE |

</div>

<div>

**produk**

| Kolom | Tipe |
|---|---|
| id | INT (PK) |
| nama_produk | VARCHAR |
| kategori | VARCHAR |
| harga | INT |
| stok | INT |

</div>

<div>

**pesanan**

| Kolom | Tipe |
|---|---|
| id | INT (PK) |
| pelanggan_id | INT (FK) |
| produk_id | INT (FK) |
| jumlah | INT |
| status | VARCHAR |
| tanggal_pesan | DATE |
| catatan | VARCHAR, *NULL* |

</div>

</div>

---
layout: section
---

# Pertemuan 1

Memfilter Data

---

## 🔧 Persiapan 1: Buat Database & Tabel

<style>
.slidev-code { font-size: 0.78rem !important; line-height: 1.3 !important; }
</style>

```sql
CREATE DATABASE tokoku CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tokoku;

CREATE TABLE pelanggan (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    nama           VARCHAR(100) NOT NULL,
    email          VARCHAR(100),               -- boleh kosong (NULL)
    kota           VARCHAR(50)  NOT NULL,
    tanggal_daftar DATE         NOT NULL
);

CREATE TABLE produk (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nama_produk VARCHAR(100) NOT NULL,
    kategori    VARCHAR(50)  NOT NULL,
    harga       INT          NOT NULL,
    stok        INT          NOT NULL
);
```

---

## 🔧 Persiapan 2: Tabel `pesanan`

<style>
.slidev-code { font-size: 0.82rem !important; line-height: 1.35 !important; }
</style>

```sql
CREATE TABLE pesanan (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    pelanggan_id  INT         NOT NULL,
    produk_id     INT         NOT NULL,
    jumlah        INT         NOT NULL,
    status        VARCHAR(20) NOT NULL,   -- diproses, dikirim, selesai, dibatalkan
    tanggal_pesan DATE        NOT NULL,
    catatan       VARCHAR(200),           -- boleh kosong (NULL)
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id),
    FOREIGN KEY (produk_id)    REFERENCES produk(id)
);
```

<div class="mt-4 text-sm">

Perhatikan kolom yang **boleh `NULL`**: `pelanggan.email` dan `pesanan.catatan`. Kita akan membutuhkannya nanti.

</div>

---

## 🔧 Persiapan 3: Isi Data `pelanggan`

<style>
.slidev-code { font-size: 0.8rem !important; line-height: 1.35 !important; }
</style>

```sql
INSERT INTO pelanggan (nama, email, kota, tanggal_daftar) VALUES
('Budi Santoso',    'budi@mail.com',  'Jember',     '2025-01-10'),
('Siti Aminah',     'siti@mail.com',  'Surabaya',   '2025-02-14'),
('Andi Pratama',    NULL,             'Jember',     '2025-03-05'),
('Dewi Lestari',    'dewi@mail.com',  'Malang',     '2025-03-20'),
('Rizky Ramadhan',  'rizky@mail.com', 'Banyuwangi', '2025-04-02'),
('Putri Anggraini', NULL,             'Surabaya',   '2025-05-18'),
('Agus Salim',      'agus@mail.com',  'Jember',     '2025-06-01'),
('Nur Hidayah',     'nur@mail.com',   'Malang',     '2025-07-09'),
('Budi Hartono',    'budih@mail.com', 'Jakarta',    '2025-08-15'),
('Citra Dewi',      'citra@mail.com', 'Jember',     '2025-09-22');
```

---

## 🔧 Persiapan 4: Isi Data `produk`

<style>
.slidev-code { font-size: 0.8rem !important; line-height: 1.35 !important; }
</style>

```sql
INSERT INTO produk (nama_produk, kategori, harga, stok) VALUES
('Laptop Asus Vivobook',   'Elektronik', 7500000, 15),
('Mouse Logitech M331',    'Aksesoris',   175000, 80),
('Keyboard Mekanik Rexus', 'Aksesoris',   450000, 35),
('Monitor LG 24 Inch',     'Elektronik', 1850000, 12),
('Flashdisk Sandisk 64GB', 'Aksesoris',    85000,  0),
('Headset Gaming Fantech', 'Aksesoris',   320000, 25),
('Webcam Logitech C270',   'Elektronik',  495000, 18),
('Buku Basis Data Dasar',  'Buku',         95000, 50),
('Buku Pemrograman Web',   'Buku',        120000, 40),
('SSD Kingston 480GB',     'Elektronik',  650000, 22),
('Laptop Lenovo IdeaPad',  'Elektronik', 6800000,  8),
('Mousepad Gaming XL',     'Aksesoris',    65000,  0);
```

---

## 🔧 Persiapan 5: Isi Data `pesanan`

<style>
.slidev-code { font-size: 0.76rem !important; line-height: 1.3 !important; }
</style>

```sql
INSERT INTO pesanan (pelanggan_id, produk_id, jumlah, status, tanggal_pesan, catatan) VALUES
(1,  2, 1, 'selesai',    '2025-10-01', NULL),
(2,  1, 1, 'selesai',    '2025-10-03', 'Mohon dibungkus kardus tebal'),
(3,  8, 2, 'dikirim',    '2025-10-05', NULL),
(4,  3, 1, 'diproses',   '2025-10-07', NULL),
(5,  4, 1, 'dibatalkan', '2025-10-08', 'Salah pilih ukuran'),
(1,  9, 1, 'selesai',    '2025-10-10', NULL),
(6,  6, 2, 'dikirim',    '2025-10-12', 'Kirim sebelum Jumat'),
(7, 10, 1, 'diproses',   '2025-10-13', NULL),
(8,  2, 3, 'selesai',    '2025-10-14', NULL),
(9, 11, 1, 'dikirim',    '2025-10-15', NULL),
(10, 7, 1, 'diproses',   '2025-10-16', 'Hadiah ulang tahun'),
(3,  5, 4, 'selesai',    '2025-10-17', NULL),
(2,  8, 1, 'dibatalkan', '2025-10-18', NULL),
(4,  1, 1, 'diproses',   '2025-10-18', 'Tolong cek garansi'),
(7, 12, 2, 'selesai',    '2025-10-19', NULL);
```

---

## ✅ Checkpoint: Verifikasi Data

```sql
SELECT COUNT(*) FROM pelanggan;  -- harus 10
SELECT COUNT(*) FROM produk;     -- harus 12
SELECT COUNT(*) FROM pesanan;    -- harus 15
```

<div class="mt-6 p-3 rounded bg-green-500 bg-opacity-10">

Angkamu berbeda? Ulangi bagian `INSERT` yang bermasalah **sebelum lanjut**.

</div>

---

## Review `SELECT`

```sql
SELECT * FROM produk;                     -- semua kolom
SELECT nama_produk, harga FROM produk;    -- kolom tertentu
```

<div class="mt-6 p-4 rounded bg-amber-500 bg-opacity-10">

⚠️ **Kebiasaan industri #1: hindari `SELECT *` di kode aplikasi.**

- Lebih **cepat** (data yang dikirim lebih sedikit)
- Lebih **aman** (kolom sensitif tidak ikut terbawa)
- Kode **tidak rusak** saat struktur tabel berubah

<span class="text-sm opacity-80">Di praktikum, `SELECT *` boleh dipakai untuk eksplorasi saja.</span>

</div>

---
layout: section
---

# Sesi B

`WHERE` dan Operator Perbandingan

---

## `WHERE` = Saringan

Tanpa `WHERE`: **semua baris** dikembalikan.
Dengan `WHERE`: hanya baris yang kondisinya **benar**.

```sql
SELECT kolom FROM tabel WHERE kondisi;
```

<div class="mt-6">

| Jenis data | Cara menulis | Contoh |
|---|---|---|
| Teks | kutip tunggal | `kota = 'Jember'` |
| Angka | tanpa kutip | `harga > 500000` |
| Tanggal | `'YYYY-MM-DD'` | `tanggal_pesan >= '2025-10-15'` |

</div>

---

## Operator Perbandingan

<style>
table { font-size: 0.9rem; }
th, td { padding: 0.25rem 0.9rem !important; }
</style>

| Operator | Arti | Contoh |
|---|---|---|
| `=` | sama dengan | `kota = 'Jember'` |
| `<>` atau `!=` | tidak sama dengan | `status <> 'selesai'` |
| `>` | lebih besar | `harga > 500000` |
| `<` | lebih kecil | `stok < 20` |
| `>=` | lebih besar atau sama | `harga >= 1000000` |
| `<=` | lebih kecil atau sama | `stok <= 10` |

---

## Praktik 1.1 & 1.2: Filter Teks dan Angka

```sql
SELECT nama, kota FROM pelanggan WHERE kota = 'Jember';
```

<v-click>

➡️ Hasil: **4 pelanggan** (Budi Santoso, Andi Pratama, Agus Salim, Citra Dewi)

</v-click>

```sql
SELECT nama_produk, harga FROM produk WHERE harga > 1000000;
```

🤔 **Tebak dulu:** produk apa saja yang muncul?

<v-click>

➡️ Laptop Asus, Monitor LG, Laptop Lenovo

</v-click>

---

## Praktik 1.3 & 1.4: Tanggal dan "Tidak Sama Dengan"

```sql
SELECT id, pelanggan_id, tanggal_pesan, status
FROM pesanan
WHERE tanggal_pesan >= '2025-10-15';
```

```sql
SELECT id, produk_id, status
FROM pesanan
WHERE status <> 'selesai';
```

<div class="mt-4 text-sm opacity-80">

Bandingkan jumlah baris tiap query dengan jumlah total pesanan (15). Apakah masuk akal?

</div>

---

## 🧪 Coba Sendiri (5 menit)

Kerjakan di editor SQL-mu:

1. Tampilkan nama produk yang **stoknya habis** (`stok = 0`)
2. Tampilkan pelanggan yang mendaftar **setelah** `2025-06-01`
3. Tampilkan produk dengan harga **maksimal Rp100.000**

<v-click>

<div class="mt-6 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Cek hasilmu: soal 1 → **2 produk**, soal 2 → **3 pelanggan**, soal 3 → **3 produk**.

</div>

</v-click>

---
layout: section
---

# Sesi C

Operator Logika: `AND` · `OR` · `NOT` · `IN` · `BETWEEN`

---

## `AND`, `OR`, `NOT`

| Operator | Aturan | Contoh |
|---|---|---|
| `AND` | **semua** kondisi harus benar | `kategori = 'Buku' AND harga < 100000` |
| `OR` | **salah satu** benar sudah cukup | `kota = 'Jember' OR kota = 'Malang'` |
| `NOT` | membalik kondisi | `NOT kategori = 'Buku'` |

```sql
SELECT nama_produk, kategori, harga
FROM produk
WHERE kategori = 'Elektronik' AND harga < 2000000;
```

---

## Praktik 2.2: `OR`

```sql
SELECT nama, kota
FROM pelanggan
WHERE kota = 'Jember' OR kota = 'Malang';
```

🤔 **Tebak:** berapa baris yang muncul?

<v-click>

➡️ **6 baris** (4 dari Jember + 2 dari Malang)

</v-click>

<div class="mt-6 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Perhatikan: `kota = 'Jember' AND kota = 'Malang'` akan menghasilkan **0 baris**. Satu baris tidak mungkin berada di dua kota sekaligus.

</div>

---

## ⚠️ Jebakan Klasik: `AND` vs `OR`

`AND` diproses **lebih dulu** daripada `OR`. Jalankan keduanya, lalu bandingkan jumlah barisnya:

<style>
.slidev-code { font-size: 0.8rem !important; line-height: 1.35 !important; }
</style>

```sql
-- Query A (tanpa kurung)
SELECT nama_produk, kategori, harga FROM produk
WHERE kategori = 'Buku' OR kategori = 'Aksesoris' AND harga < 100000;
```

```sql
-- Query B (dengan kurung)
SELECT nama_produk, kategori, harga FROM produk
WHERE (kategori = 'Buku' OR kategori = 'Aksesoris') AND harga < 100000;
```

<div class="text-sm">

- **A** dibaca: *semua Buku*, ATAU *Aksesoris yang murah*
- **B** dibaca: *Buku atau Aksesoris*, yang harganya murah

</div>

---

## ✅ Kebiasaan Industri #2

<div class="mt-10 p-6 rounded bg-green-500 bg-opacity-10 text-xl">

**Selalu pakai tanda kurung** saat mencampur `AND` dan `OR`.

</div>

<div class="mt-8">

Walaupun kamu hafal prioritasnya, rekan satu tim (dan dirimu enam bulan lagi) akan lebih mudah membaca query yang **eksplisit**.

</div>

---

## `IN`: Pengganti `OR` Berulang

```sql
-- Panjang dan berulang
SELECT * FROM pelanggan
WHERE kota = 'Jember' OR kota = 'Malang' OR kota = 'Surabaya';
```

```sql
-- Ringkas dan mudah dibaca
SELECT * FROM pelanggan WHERE kota IN ('Jember', 'Malang', 'Surabaya');
```

Lawannya, `NOT IN`:

```sql
SELECT nama, kota FROM pelanggan WHERE kota NOT IN ('Jember', 'Malang');
```

---

## `BETWEEN`: Rentang Nilai (Inklusif)

Batas awal **dan** batas akhir ikut dihitung.

```sql
SELECT nama_produk, harga FROM produk
WHERE harga BETWEEN 100000 AND 500000;
```

Setara dengan:

```sql
WHERE harga >= 100000 AND harga <= 500000
```

Cocok juga untuk tanggal:

```sql
SELECT id, tanggal_pesan, status FROM pesanan
WHERE tanggal_pesan BETWEEN '2025-10-10' AND '2025-10-15';
```

---

## 🧪 Coba Sendiri (10 menit)

1. Tampilkan pesanan berstatus `diproses` **atau** `dikirim` (pakai `IN`)
2. Tampilkan produk `Aksesoris` dengan stok **di atas 20** dan harga **di bawah Rp400.000**
3. Tampilkan pelanggan yang **bukan** dari Jember
4. Tampilkan pesanan antara **1 sampai 10 Oktober 2025**

<v-click>

<div class="mt-6 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Cek hasilmu: soal 1 → **7 baris**, soal 2 → **2 produk**, soal 3 → **6 pelanggan**, soal 4 → **6 pesanan**.

</div>

</v-click>

---
layout: section
---

# Sesi D

Nilai `NULL`

---

## Apa itu `NULL`?

<div class="mt-4 text-lg">

`NULL` = **"tidak ada nilai / tidak diketahui"**

</div>

- ❌ Bukan angka `0`
- ❌ Bukan teks kosong `''`

<div class="mt-6">

Di tabel `pelanggan`, **Andi** dan **Putri** tidak punya email (`NULL`).

</div>

```sql
SELECT nama FROM pelanggan WHERE email = NULL;   -- ❌ hasil KOSONG
```

<v-click>

Kenapa kosong? Karena `NULL = NULL` bukan *benar*, melainkan *tidak diketahui*.

</v-click>

---

## Cara yang Benar: `IS NULL`

```sql
SELECT nama FROM pelanggan WHERE email IS NULL;             -- tidak punya email
SELECT nama, email FROM pelanggan WHERE email IS NOT NULL;  -- punya email
```

<div class="mt-6">

| ❌ Salah | ✅ Benar |
|---|---|
| `email = NULL` | `email IS NULL` |
| `email <> NULL` | `email IS NOT NULL` |

</div>

---

## ⚠️ Jebakan `NULL` pada `<>`

```sql
SELECT id, catatan FROM pesanan
WHERE catatan <> 'Hadiah ulang tahun';
```

Baris dengan `catatan = NULL` **tidak ikut muncul!** Agar ikut:

```sql
SELECT id, catatan FROM pesanan
WHERE catatan <> 'Hadiah ulang tahun' OR catatan IS NULL;
```

<div class="mt-4 p-3 rounded bg-green-500 bg-opacity-10 text-sm">

✅ **Kebiasaan industri #3:** tanyakan *"kolom ini boleh NULL tidak?"* sebelum menulis filter. Bug "data hilang misterius" sering berasal dari sini.

</div>

---

## 🧪 Latihan Mini 1 (15 menit)

Kerjakan sendiri:

1. Tampilkan pesanan yang **punya catatan**
2. Tampilkan pelanggan dari **Jember atau Surabaya** yang **punya email**
3. Tampilkan pesanan berstatus `selesai`, tanggal **10 Oktober 2025 ke atas**, jumlah **lebih dari 1**

<div class="mt-6 text-sm opacity-80">

Petunjuk soal 2: ingat kurung untuk `OR`, lalu gabungkan dengan `AND`.

</div>

---

## 📚 Rangkuman Pertemuan 1

<style>
table { font-size: 0.85rem; }
th, td { padding: 0.2rem 0.8rem !important; }
</style>

| Konsep | Ingat ini |
|---|---|
| `WHERE` | Saringan baris |
| Teks & tanggal | Pakai kutip tunggal |
| `AND` / `OR` | Gunakan kurung jika dicampur |
| `IN` | Pengganti `OR` berulang |
| `BETWEEN` | Inklusif di kedua ujung |
| `NULL` | Pakai `IS NULL` / `IS NOT NULL`, bukan `=` |

**Refleksi:**

1. Apa beda `harga BETWEEN 100 AND 200` dengan `harga > 100 AND harga < 200`?
2. Mengapa `WHERE email = NULL` tidak pernah mengembalikan data?

---
layout: section
---

# 📝 Lembar Kerja Praktikum 1

20 soal · 5 poin per soal

---

## LK 1 — Petunjuk

- Gunakan database `tokoku`
- Tulis query dan **tempelkan tangkapan layar hasilnya** (atau tulis jumlah baris)
- Kerjakan berurutan; soal makin sulit di bagian akhir
- Soal bertanda 💬 dijawab dengan kalimatmu sendiri

<div class="mt-6 text-sm">

**Pembagian bagian:**

| Bagian | Soal |
|---|---|
| A. `WHERE` & operator perbandingan | 1–5 |
| B. Operator logika | 6–14 |
| C. `NULL` | 15–17 |
| D. Studi kasus gabungan | 18–20 |

</div>

---

## LK 1 — Bagian A: `WHERE` & Perbandingan

<div class="text-sm">

1. Tampilkan nama dan email semua pelanggan yang berasal dari **Surabaya**
2. Tampilkan nama produk dan harga untuk produk yang harganya **di bawah Rp100.000**
3. Tampilkan semua pesanan dengan jumlah **lebih dari 2**
4. Tampilkan semua pesanan yang statusnya **bukan** `selesai`
5. Tampilkan pelanggan yang mendaftar **pada atau sebelum 31 Maret 2025**

</div>

---

## LK 1 — Bagian B: Operator Logika (1/2)

<div class="text-sm">

6. Tampilkan produk kategori **Aksesoris** yang **stoknya masih ada** (lebih dari 0)
7. Tampilkan produk kategori **Elektronik** dengan harga **maksimal Rp1.000.000**
8. Tampilkan pelanggan yang berasal dari **Jember atau Jakarta**
9. Tampilkan pesanan berstatus `diproses` atau `dikirim` menggunakan **`IN`**
10. Tampilkan pelanggan yang kotanya **tidak termasuk** Jember dan Malang menggunakan **`NOT IN`**
11. Tampilkan produk dengan harga **antara Rp100.000 dan Rp500.000** menggunakan **`BETWEEN`**

</div>

---

## LK 1 — Bagian B: Operator Logika (2/2)

<style>
.slidev-code { font-size: 0.78rem !important; line-height: 1.3 !important; }
</style>

<div class="text-sm">

12. Tampilkan pesanan yang dibuat **antara 10 Oktober 2025 dan 15 Oktober 2025**
13. Tampilkan pesanan berstatus `selesai` **atau** `dikirim` yang jumlahnya **lebih dari 1** *(perhatikan kurung!)*
14. 💬 Jalankan kedua query berikut, lalu jelaskan mengapa jumlah barisnya berbeda:

</div>

```sql
SELECT * FROM produk WHERE kategori = 'Buku' OR kategori = 'Aksesoris' AND stok = 0;
SELECT * FROM produk WHERE (kategori = 'Buku' OR kategori = 'Aksesoris') AND stok = 0;
```

---

## LK 1 — Bagian C & D

<div class="text-sm">

**C. `NULL`**

15. Tampilkan pelanggan yang **belum memiliki email**
16. Tampilkan pesanan berstatus `diproses` yang **memiliki catatan**
17. 💬 Query `WHERE catatan <> 'Hadiah ulang tahun'` tidak menampilkan pesanan yang catatannya kosong. Jelaskan alasannya, lalu tulis query perbaikan agar pesanan tanpa catatan ikut tampil

**D. Studi Kasus Gabungan**

18. Tampilkan pelanggan dari **Jember atau Surabaya** yang **memiliki email**
19. Tampilkan produk yang **bukan** kategori `Buku`, harganya **di atas Rp100.000**, dan stoknya **kurang dari 30**
20. Tim gudang ingin memantau pesanan yang **tidak dibatalkan**, dibuat **sejak 10 Oktober 2025**, dan **tanpa catatan**. Tampilkan hanya kolom `id`, `pelanggan_id`, `status`, `tanggal_pesan`

</div>

---

## ✅ Checklist Pengumpulan LK 1

- [ ] Semua query dapat dijalankan tanpa error
- [ ] Teks memakai kutip tunggal
- [ ] Kurung dipakai saat mencampur `AND` dan `OR`
- [ ] `NULL` diperiksa dengan `IS NULL` / `IS NOT NULL`
- [ ] Tangkapan layar / jumlah baris dilampirkan

---
layout: section
---

# Pertemuan 2

Mencari & Mengurutkan Data

---

## 🔁 Review Cepat Pertemuan 1

Jawab dalam hati, lalu cek ke temanmu:

1. Mengapa teks ditulis dengan kutip tunggal?
2. Apa yang terjadi pada `kategori = 'Buku' OR kategori = 'Aksesoris' AND stok = 0`?
3. Mengapa `WHERE email = NULL` selalu kosong?
4. Apakah `BETWEEN 10 AND 20` ikut menghitung 10 dan 20?

<v-click>

<div class="mt-4 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Jawaban singkat: (1) aturan sintaks SQL, (2) `AND` diproses lebih dulu, (3) `NULL` tidak bisa dibandingkan dengan `=`, (4) ya, inklusif.

</div>

</v-click>

---
layout: section
---

# Sesi B

`LIKE` dan Wildcard

---

## `LIKE`: Mencari Berdasarkan Pola

`=` hanya cocok jika teks **persis sama**. `LIKE` mencocokkan berdasarkan **pola**.

| Wildcard | Arti |
|---|---|
| `%` | nol atau lebih karakter apa saja |
| `_` | tepat **satu** karakter apa saja |

<style>
table { font-size: 0.85rem; }
th, td { padding: 0.2rem 0.8rem !important; }
</style>

| Pola | Artinya | Contoh cocok |
|---|---|---|
| `'Budi%'` | diawali "Budi" | Budi Santoso, Budi Hartono |
| `'%Dewi'` | diakhiri "Dewi" | Citra Dewi |
| `'%Laptop%'` | mengandung "Laptop" | Laptop Asus Vivobook |
| `'_udi%'` | karakter ke-2 dst. "udi" | Budi ... |

---

## Praktik 4.1 – 4.3: Diawali, Diakhiri, Mengandung

```sql
SELECT nama FROM pelanggan WHERE nama LIKE 'Budi%';          -- diawali
SELECT nama FROM pelanggan WHERE nama LIKE '%Dewi';          -- diakhiri
```

```sql
SELECT nama_produk, harga FROM produk WHERE nama_produk LIKE '%Laptop%';
SELECT nama_produk FROM produk WHERE nama_produk LIKE '%Gaming%';
```

<div class="mt-4 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Pola **"mengandung"** (`%kata%`) adalah dasar fitur *search* paling umum di aplikasi.

</div>

---

## Praktik 4.4 & 4.5: Wildcard `_` dan `NOT LIKE`

```sql
-- Email yang username-nya tepat 4 huruf sebelum @
SELECT nama, email FROM pelanggan WHERE email LIKE '____@mail.com';
```

🤔 **Tebak:** siapa saja yang muncul?

<v-click>

➡️ **Budi, Siti, Dewi, Agus** (bukan Nur, karena hanya 3 huruf)

</v-click>

```sql
SELECT nama_produk FROM produk
WHERE nama_produk LIKE '%Logitech%' AND nama_produk NOT LIKE '%Webcam%';
```

---

## Besar-Kecil Huruf (Case Sensitivity)

```sql
SELECT nama FROM pelanggan WHERE nama LIKE '%budi%';
```

<div class="grid grid-cols-2 gap-6 mt-4">

<div class="p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

**MySQL / MariaDB**

Collation `_ci` → **tidak** membedakan huruf besar/kecil. "Budi" ikut muncul.

</div>

<div class="p-3 rounded bg-purple-500 bg-opacity-10 text-sm">

**PostgreSQL**

`LIKE` **membedakan** huruf. Gunakan `ILIKE`:

```sql
WHERE nama ILIKE '%budi%'
```

</div>

</div>

<div class="mt-4 text-sm">

Mencari karakter `%` atau `_` secara harfiah? Gunakan `ESCAPE`:

</div>

```sql
SELECT * FROM produk WHERE nama_produk LIKE '%50\%%' ESCAPE '\\';
```

---

## ⚠️ Insight Industri: `LIKE` dan Performa

Database memakai **index** (seperti daftar isi buku) hanya jika pola **diawali teks pasti**.

<style>
table { font-size: 0.9rem; }
th, td { padding: 0.25rem 0.9rem !important; }
</style>

| Pola | Bisa pakai index? |
|---|---|
| `LIKE 'Budi%'` | ✅ Ya |
| `LIKE '%Budi'` | ❌ Tidak (scan seluruh tabel) |
| `LIKE '%Budi%'` | ❌ Tidak (scan seluruh tabel) |

<div class="text-sm">

- Tabel jutaan baris + `LIKE '%kata%'` = **lambat**
- Solusi skala besar: **Full-Text Search** (`FULLTEXT` MySQL, `tsvector` PostgreSQL) atau Elasticsearch / Meilisearch
- Skala kecil-menengah: `LIKE` sudah cukup

</div>

```sql
EXPLAIN SELECT * FROM pelanggan WHERE nama LIKE 'Budi%';   -- lihat rencana eksekusi
```

---

## 🧪 Coba Sendiri (10 menit)

1. Cari produk yang namanya **diawali** "Buku"
2. Cari pelanggan yang namanya **mengandung** "an"
3. Cari produk **Aksesoris** yang namanya mengandung "Gaming" **atau** "Logitech"
4. Cari pesanan yang catatannya **mengandung** kata "kirim"

<div class="mt-4 text-sm opacity-80">

Petunjuk soal 3: jangan lupa kurung untuk `OR`.

</div>

<v-click>

<div class="mt-4 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Cek hasilmu: soal 1 → **2 produk**, soal 4 → **1 pesanan**.

</div>

</v-click>

---
layout: section
---

# Sesi C

`ORDER BY` dan `LIMIT`

---

## `ORDER BY`: Mengurutkan Hasil

<div class="p-3 rounded bg-amber-500 bg-opacity-10 text-sm">

⚠️ Tanpa `ORDER BY`, **urutan hasil tidak dijamin**. Jangan mengandalkan "biasanya urut sesuai id".

</div>

```sql
SELECT kolom FROM tabel
WHERE kondisi
ORDER BY kolom [ASC | DESC];
```

- `ASC` = naik (A→Z, kecil→besar), **default**
- `DESC` = turun (Z→A, besar→kecil)

<div class="mt-4 p-3 rounded bg-blue-500 bg-opacity-10 text-center">

Urutan penulisan: **SELECT → FROM → WHERE → ORDER BY → LIMIT**

</div>

---

## Praktik 5.1 & 5.2: Satu Kolom

```sql
SELECT nama_produk, harga FROM produk ORDER BY harga;          -- termurah dulu
SELECT nama_produk, harga FROM produk ORDER BY harga DESC;     -- termahal dulu
```

```sql
SELECT nama FROM pelanggan ORDER BY nama ASC;
SELECT id, tanggal_pesan, status FROM pesanan
ORDER BY tanggal_pesan DESC;                                   -- terbaru dulu
```

---

## Praktik 5.3 & 5.4: Banyak Kolom + `WHERE`

```sql
SELECT nama_produk, kategori, harga FROM produk
ORDER BY kategori ASC, harga DESC;
```

<div class="text-sm">

Dibaca: urutkan berdasarkan **kategori** dulu; jika kategori sama, urutkan berdasarkan **harga termahal**.

</div>

```sql
SELECT nama_produk, harga FROM produk
WHERE kategori = 'Elektronik'
ORDER BY harga DESC;
```

---

## `LIMIT`: Membatasi Jumlah Baris

```sql
-- 3 produk termahal
SELECT nama_produk, harga FROM produk ORDER BY harga DESC LIMIT 3;
```

```sql
-- 5 pesanan terbaru
SELECT id, tanggal_pesan, status FROM pesanan
ORDER BY tanggal_pesan DESC LIMIT 5;
```

<div class="mt-4 text-sm opacity-80">

Catatan: SQL Server memakai `TOP` atau `OFFSET ... FETCH`, Oracle memakai `FETCH FIRST`. Konsepnya sama.

</div>

---

## Pagination: Data per Halaman

Pola ini dipakai di admin panel, katalog, dan feed.

<style>
.slidev-code { font-size: 0.8rem !important; line-height: 1.35 !important; }
</style>

```sql
-- Halaman 1 (5 data per halaman)
SELECT id, nama_produk, harga FROM produk ORDER BY id LIMIT 5 OFFSET 0;
-- Halaman 2
SELECT id, nama_produk, harga FROM produk ORDER BY id LIMIT 5 OFFSET 5;
-- Halaman 3
SELECT id, nama_produk, harga FROM produk ORDER BY id LIMIT 5 OFFSET 10;
```

<div class="mt-4 p-3 rounded bg-blue-500 bg-opacity-10 text-center">

`OFFSET = (halaman - 1) × jumlah_per_halaman`

</div>

---

## ⚠️ Insight: Urutan yang Stabil (*Tie-Breaker*)

Urut berdasarkan kolom yang banyak **kembar**:

```sql
SELECT id, nama_produk, kategori FROM produk
ORDER BY kategori LIMIT 4 OFFSET 0;
```

Baris dengan `kategori` sama boleh diurutkan **sesuka database**. Saat pagination, data bisa **muncul dobel atau hilang** antar halaman.

✅ **Solusi:** tambahkan kolom unik sebagai urutan terakhir.

```sql
SELECT id, nama_produk, kategori FROM produk
ORDER BY kategori ASC, id ASC
LIMIT 4 OFFSET 0;
```

---

## `NULL` Saat Diurutkan

```sql
SELECT nama, email FROM pelanggan ORDER BY email ASC;
```

- **MySQL:** `NULL` dianggap paling kecil (muncul di **awal** saat `ASC`)
- **PostgreSQL:** sebaliknya (`NULL` di **akhir** saat `ASC`)

Agar konsisten antar DBMS, tulis eksplisit (NULL di akhir):

```sql
-- MySQL
SELECT nama, email FROM pelanggan ORDER BY email IS NULL, email ASC;
-- PostgreSQL
SELECT nama, email FROM pelanggan ORDER BY email ASC NULLS LAST;
```

---

## 🧪 Coba Sendiri (10 menit)

1. Tampilkan **3 produk Aksesoris termurah**
2. Tampilkan pelanggan diurutkan berdasarkan **kota (A–Z)**, lalu **nama (A–Z)**
3. Tampilkan pesanan berstatus `selesai`, **terbaru dulu**, ambil **4 data**

<v-click>

<div class="mt-6 p-3 rounded bg-blue-500 bg-opacity-10 text-sm">

Cek soal 1: Mousepad Gaming XL, Flashdisk Sandisk 64GB, Mouse Logitech M331.

</div>

</v-click>

---
layout: section
---

# Sesi D

Praktik Terbaik Industri

---

## 🔒 #1 Jangan Sambung Input Pengguna ke Query

<style>
.slidev-code { font-size: 0.8rem !important; line-height: 1.35 !important; }
</style>

**❌ Berbahaya** (rentan SQL Injection):

```php
$keyword = $_GET['q'];
$sql = "SELECT * FROM produk WHERE nama_produk LIKE '%$keyword%'";
```

Jika pengguna mengetik `' OR '1'='1`, makna `WHERE` berubah dan semua data bocor.

**✅ Aman:** prepared statement (parameter terpisah dari query)

```php
$stmt = $pdo->prepare(
    "SELECT id, nama_produk, harga FROM produk WHERE nama_produk LIKE :kw ORDER BY nama_produk"
);
$stmt->execute(['kw' => '%' . $keyword . '%']);
$hasil = $stmt->fetchAll();
```

---

## 🔒 Versi Laravel

Query Builder Laravel otomatis memakai prepared statement.

```php
$produk = DB::table('produk')
    ->select('id', 'nama_produk', 'harga')
    ->where('nama_produk', 'like', "%{$keyword}%")
    ->orderBy('nama_produk')
    ->get();
```

<div class="mt-8 p-4 rounded bg-green-500 bg-opacity-10 text-lg text-center">

**Data dari pengguna = data, bukan bagian dari perintah SQL.**

</div>

---

## 📄 #2 Pagination + Filter + Sorting

Endpoint API katalog produk di dunia nyata:

<style>
.slidev-code { font-size: 0.82rem !important; line-height: 1.35 !important; }
</style>

```sql
SELECT id, nama_produk, kategori, harga
FROM produk
WHERE kategori = 'Elektronik'
  AND harga BETWEEN 500000 AND 8000000
  AND nama_produk LIKE 'Laptop%'
ORDER BY harga ASC, id ASC
LIMIT 10 OFFSET 0;
```

<div class="text-sm">

Parameternya berasal dari *query string*:
`/api/produk?kategori=Elektronik&sort=harga&page=1`

**Catatan lanjut:** `OFFSET` besar (halaman 10.000) menjadi lambat. Aplikasi skala besar memakai **keyset pagination**: `WHERE id > :id_terakhir ORDER BY id LIMIT 10`.

</div>

---

## ⚡ #3 Kondisi yang "Ramah Index" (*Sargable*)

Jangan membungkus kolom dengan fungsi di dalam `WHERE`.

```sql
-- ❌ Lambat: index pada tanggal_pesan tidak bisa dipakai
SELECT id FROM pesanan
WHERE MONTH(tanggal_pesan) = 10 AND YEAR(tanggal_pesan) = 2025;
```

```sql
-- ✅ Cepat: bandingkan kolom langsung dengan rentang
SELECT id FROM pesanan
WHERE tanggal_pesan >= '2025-10-01' AND tanggal_pesan < '2025-11-01';
```

<div class="text-sm">

Pola `>= awal AND < awal_bulan_berikutnya` juga lebih aman daripada `BETWEEN` untuk kolom `DATETIME`/`TIMESTAMP`: tidak ada data di detik terakhir yang terlewat.

</div>

---

## 🔍 #4 Pilih Kolom  ·  🧾 #5 Konvensi

<style>
.slidev-code { font-size: 0.8rem !important; line-height: 1.35 !important; }
</style>

```sql
-- ❌ Boros
SELECT * FROM pelanggan WHERE kota = 'Jember';
-- ✅ Efisien
SELECT id, nama, kota FROM pelanggan WHERE kota = 'Jember';
```

<div class="text-sm">

- Kata kunci SQL **HURUF BESAR**, nama tabel/kolom **huruf kecil** dengan `snake_case`
- Satu klausa per baris untuk query panjang
- Gunakan alias agar hasil mudah dibaca:

</div>

```sql
SELECT nama_produk AS produk, harga AS harga_satuan
FROM produk
WHERE stok > 0
ORDER BY harga_satuan DESC;
```

---

## 🛡️ #6 `SELECT` Dulu Sebelum `UPDATE` / `DELETE`

Sebelum menjalankan ini:

```sql
DELETE FROM pesanan WHERE status = 'dibatalkan';
```

Jalankan dulu ini, dan pastikan barisnya memang yang kamu maksud:

```sql
SELECT * FROM pesanan WHERE status = 'dibatalkan';
```

<div class="mt-4 p-3 rounded bg-red-500 bg-opacity-10 text-sm">

Lupa `WHERE` pada `UPDATE`/`DELETE` akan mengubah **seluruh tabel**. Di produksi, tim juga memakai transaksi (`BEGIN` … `ROLLBACK`/`COMMIT`) dan *backup* sebelum perubahan data massal.

</div>

---

## 📋 Ringkasan Praktik Terbaik

<style>
table { font-size: 0.8rem; }
th, td { padding: 0.15rem 0.7rem !important; }
</style>

| # | Praktik | Alasan |
|---|---|---|
| 1 | Prepared statement | Mencegah SQL Injection |
| 2 | Hindari `SELECT *` | Performa & keamanan |
| 3 | Kurung saat campur `AND`/`OR` | Menghindari logika salah |
| 4 | `IS NULL`, bukan `= NULL` | Hasil benar |
| 5 | `ORDER BY` + kolom unik saat pagination | Hasil konsisten |
| 6 | Jangan bungkus kolom dengan fungsi di `WHERE` | Index terpakai |
| 7 | `LIKE 'kata%'` lebih cepat dari `'%kata%'` | Index terpakai |
| 8 | `SELECT` dulu sebelum `UPDATE`/`DELETE` | Mencegah kehilangan data |

---
layout: section
---

# 📝 Lembar Kerja Praktikum 2

20 soal · 5 poin per soal

---

## LK 2 — Petunjuk

- Gunakan database `tokoku`
- Tulis query dan **tempelkan tangkapan layar hasilnya** (atau tulis jumlah baris)
- Soal bertanda 💬 dijawab dengan kalimatmu sendiri
- Hindari `SELECT *` pada jawaban akhir; sebutkan kolom yang diminta saja

<div class="mt-6 text-sm">

| Bagian | Soal |
|---|---|
| A. `LIKE` | 1–7 |
| B. `ORDER BY` | 8–12 |
| C. `LIMIT` & pagination | 13–16 |
| D. Praktik industri & studi kasus | 17–20 |

</div>

---

## LK 2 — Bagian A: `LIKE`

<div class="text-sm">

1. Tampilkan produk yang namanya **diawali** "Buku"
2. Tampilkan produk yang namanya **mengandung** kata "Gaming"
3. Tampilkan pelanggan yang namanya **berakhiran** "Dewi"
4. Tampilkan pelanggan yang namanya **diawali** "Budi" **atau** **berakhiran** "Dewi"
5. Tampilkan pelanggan yang email-nya memiliki **tepat 3 karakter** sebelum `@mail.com` (wildcard `_`)
6. Tampilkan produk bermerek **Logitech** yang **bukan** Webcam (`NOT LIKE`)
7. Tampilkan pesanan yang catatannya **mengandung** kata "kirim"

</div>

---

## LK 2 — Bagian B: `ORDER BY`

<div class="text-sm">

8. Tampilkan nama produk dan harga, diurutkan dari **termurah** ke **termahal**
9. Tampilkan semua pelanggan, diurutkan dari **tanggal daftar terbaru**
10. Tampilkan produk diurutkan berdasarkan **kategori A–Z**, lalu **harga termahal** lebih dulu
11. Tampilkan produk **Elektronik** dengan stok **lebih dari 10**, diurutkan dari harga **termahal**
12. Tampilkan pelanggan diurutkan berdasarkan **kota A–Z**, lalu **nama Z–A**

</div>

---

## LK 2 — Bagian C: `LIMIT` & Pagination

<div class="text-sm">

13. Tampilkan **3 produk termahal** (nama dan harga)
14. Tampilkan **2 pesanan terbaru** yang berstatus `selesai`
15. Buat query pagination untuk daftar produk (urut `harga` naik, dengan **tie-breaker `id`**). Tampilkan **halaman ke-2** dengan **4 data per halaman**
16. 💬 Mengapa kolom `id` perlu ditambahkan sebagai urutan terakhir pada pagination? Berapa nilai `OFFSET` untuk **halaman ke-5** dengan **10 data per halaman**?

</div>

---

## LK 2 — Bagian D (1/2): Praktik Industri

<style>
.slidev-code { font-size: 0.78rem !important; line-height: 1.3 !important; }
</style>

<div class="text-sm">

17. 💬 Perbaiki query berikut agar **ramah index (sargable)** dan jelaskan alasannya:

</div>

```sql
SELECT id FROM pesanan WHERE MONTH(tanggal_pesan) = 10 AND YEAR(tanggal_pesan) = 2025;
```

<div class="text-sm">

18. 💬 Mana yang lebih cepat pada tabel jutaan baris, dan mengapa?

</div>

```sql
SELECT id, nama_produk FROM produk WHERE nama_produk LIKE 'Mouse%';
SELECT id, nama_produk FROM produk WHERE nama_produk LIKE '%Mouse%';
```

---

## LK 2 — Bagian D (2/2): Studi Kasus

<div class="text-sm">

19. Pengguna mengetik `Laptop` di kolom pencarian, memilih kategori `Elektronik`, urutan harga termahal, halaman 1 (5 data/halaman). Tulis versi **PHP PDO atau Laravel Query Builder** yang aman dari SQL Injection (**prepared statement**)

20. **Fitur pencarian admin.** Tampilkan pesanan yang **masih aktif** (`diproses` atau `dikirim`), dibuat **sejak 10 Oktober 2025** (inklusif), dengan catatan yang **tidak kosong**. Urutkan dari tanggal **terlama**, lalu `id`. Tampilkan hanya kolom `id`, `tanggal_pesan`, `status`, dan `catatan`

</div>

---

## ✅ Checklist Pengumpulan LK 2

- [ ] Semua query dapat dijalankan tanpa error
- [ ] Tidak ada `SELECT *` pada jawaban akhir
- [ ] Pagination selalu memakai `ORDER BY` dengan kolom unik
- [ ] Jawaban analisis ditulis dengan kalimat sendiri
- [ ] Tangkapan layar / jumlah baris dilampirkan

---

## 📚 Rangkuman Akhir

```sql
SELECT   kolom_yang_dibutuhkan
FROM     nama_tabel
WHERE    (kondisi1 OR kondisi2)
  AND    kolom LIKE 'kata%'
  AND    kolom_lain IS NOT NULL
ORDER BY kolom_utama DESC, id ASC
LIMIT    10 OFFSET 0;
```

<div class="mt-4 p-3 rounded bg-blue-500 bg-opacity-10 text-center">

**SELECT → FROM → WHERE → ORDER BY → LIMIT**

</div>

---
layout: end
class: text-center
---

# Terima Kasih 🚀

<div class="mt-6 opacity-80">

**Selanjutnya:** `JOIN`, fungsi agregat (`COUNT`, `SUM`, `AVG`), `GROUP BY`, dan `HAVING`

Studi kasus **TokoKu** tetap dipakai.

</div>
