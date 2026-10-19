# Panduan Praktikum SQL Dasar
## WHERE, Operator, LIKE, dan ORDER BY

**Studi kasus:** Database **TokoKu** (toko online perangkat komputer)
**Durasi:** 2 pertemuan × 4 jam
**DBMS:** MySQL 8 / MariaDB (catatan untuk PostgreSQL disertakan)

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan praktikum ini, kamu mampu:

1. Memfilter data dengan `WHERE` dan berbagai operator.
2. Menggabungkan kondisi dengan `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, dan `IS NULL`.
3. Mencari data berpola teks dengan `LIKE`.
4. Mengurutkan dan membatasi hasil dengan `ORDER BY` dan `LIMIT`.
5. Menulis query yang aman dan efisien sesuai praktik industri.

## 🗓️ Alur Waktu

| Pertemuan | Sesi | Durasi | Materi |
|---|---|---|---|
| **1** | A | 30 mnt | Persiapan database & review `SELECT` |
| | B | 55 mnt | `WHERE` + operator perbandingan |
| | C | 55 mnt | Operator logika: `AND`, `OR`, `NOT`, `IN`, `BETWEEN` |
| | D | 35 mnt | `NULL` (`IS NULL`) + Latihan Mini |
| | E | 65 mnt | Rangkuman + **Lembar Kerja Praktikum 1 (20 soal)** |
| **2** | A | 20 mnt | Review pertemuan 1 |
| | B | 60 mnt | `LIKE` dan wildcard |
| | C | 55 mnt | `ORDER BY` + `LIMIT` (pagination) |
| | D | 30 mnt | Praktik terbaik industri |
| | E | 75 mnt | **Lembar Kerja Praktikum 2 (20 soal)** |

> 💡 **Cara belajar:** ketik sendiri setiap query (jangan *copy-paste*), **tebak dulu hasilnya**, baru jalankan. Kalau hasilnya beda dari tebakanmu, di situlah kamu belajar!

---

# 🔧 BAGIAN 0 — Persiapan (Pertemuan 1, Sesi A)

## Langkah 1: Buat Database dan Tabel

Buka MySQL client (terminal, DBeaver, phpMyAdmin, atau MySQL Workbench), lalu jalankan:

```sql
CREATE DATABASE tokoku CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tokoku;

CREATE TABLE pelanggan (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    nama          VARCHAR(100) NOT NULL,
    email         VARCHAR(100),               -- boleh kosong (NULL)
    kota          VARCHAR(50)  NOT NULL,
    tanggal_daftar DATE        NOT NULL
);

CREATE TABLE produk (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nama_produk VARCHAR(100) NOT NULL,
    kategori    VARCHAR(50)  NOT NULL,
    harga       INT          NOT NULL,
    stok        INT          NOT NULL
);

CREATE TABLE pesanan (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    pelanggan_id  INT         NOT NULL,
    produk_id     INT         NOT NULL,
    jumlah        INT         NOT NULL,
    status        VARCHAR(20) NOT NULL,       -- diproses, dikirim, selesai, dibatalkan
    tanggal_pesan DATE        NOT NULL,
    catatan       VARCHAR(200),               -- boleh kosong (NULL)
    FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id),
    FOREIGN KEY (produk_id)    REFERENCES produk(id)
);
```

## Langkah 2: Isi Data Contoh

```sql
INSERT INTO pelanggan (nama, email, kota, tanggal_daftar) VALUES
('Budi Santoso',   'budi@mail.com',  'Jember',     '2025-01-10'),
('Siti Aminah',    'siti@mail.com',  'Surabaya',   '2025-02-14'),
('Andi Pratama',   NULL,             'Jember',     '2025-03-05'),
('Dewi Lestari',   'dewi@mail.com',  'Malang',     '2025-03-20'),
('Rizky Ramadhan', 'rizky@mail.com', 'Banyuwangi', '2025-04-02'),
('Putri Anggraini',NULL,             'Surabaya',   '2025-05-18'),
('Agus Salim',     'agus@mail.com',  'Jember',     '2025-06-01'),
('Nur Hidayah',    'nur@mail.com',   'Malang',     '2025-07-09'),
('Budi Hartono',   'budih@mail.com', 'Jakarta',    '2025-08-15'),
('Citra Dewi',     'citra@mail.com', 'Jember',     '2025-09-22');

INSERT INTO produk (nama_produk, kategori, harga, stok) VALUES
('Laptop Asus Vivobook',    'Elektronik', 7500000, 15),
('Mouse Logitech M331',     'Aksesoris',   175000, 80),
('Keyboard Mekanik Rexus',  'Aksesoris',   450000, 35),
('Monitor LG 24 Inch',      'Elektronik', 1850000, 12),
('Flashdisk Sandisk 64GB',  'Aksesoris',    85000,  0),
('Headset Gaming Fantech',  'Aksesoris',   320000, 25),
('Webcam Logitech C270',    'Elektronik',  495000, 18),
('Buku Basis Data Dasar',   'Buku',         95000, 50),
('Buku Pemrograman Web',    'Buku',        120000, 40),
('SSD Kingston 480GB',      'Elektronik',  650000, 22),
('Laptop Lenovo IdeaPad',   'Elektronik', 6800000,  8),
('Mousepad Gaming XL',      'Aksesoris',    65000,  0);

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

## Langkah 3: Verifikasi (Checkpoint ✅)

```sql
SELECT COUNT(*) FROM pelanggan;  -- harus 10
SELECT COUNT(*) FROM produk;     -- harus 12
SELECT COUNT(*) FROM pesanan;    -- harus 15
```

Kalau angkamu berbeda, ulangi bagian `INSERT` yang bermasalah sebelum lanjut.

## Review `SELECT`

```sql
SELECT * FROM produk;                          -- semua kolom
SELECT nama_produk, harga FROM produk;         -- kolom tertentu
```

> ⚠️ **Kebiasaan industri #1:** hindari `SELECT *` di kode aplikasi. Sebutkan kolom yang dibutuhkan saja. Alasannya: lebih cepat (data lebih sedikit), lebih aman (kolom sensitif tidak ikut terbawa), dan kode tidak rusak saat struktur tabel berubah. Di praktikum ini `SELECT *` boleh dipakai untuk eksplorasi saja.

---

# 📘 PERTEMUAN 1 — Memfilter Data

## Sesi B: `WHERE` dan Operator Perbandingan

### Konsep

`WHERE` adalah **saringan**. Tanpa `WHERE`, database mengembalikan *semua* baris. Dengan `WHERE`, hanya baris yang kondisinya bernilai **benar** yang dikembalikan.

```sql
SELECT kolom FROM tabel WHERE kondisi;
```

### Operator Perbandingan

| Operator | Arti | Contoh |
|---|---|---|
| `=` | sama dengan | `kota = 'Jember'` |
| `<>` atau `!=` | tidak sama dengan | `status <> 'selesai'` |
| `>` | lebih besar | `harga > 500000` |
| `<` | lebih kecil | `stok < 20` |
| `>=` | lebih besar atau sama | `harga >= 1000000` |
| `<=` | lebih kecil atau sama | `stok <= 10` |

### Praktik 1.1 — Filter teks

```sql
SELECT nama, kota FROM pelanggan WHERE kota = 'Jember';
```

**Hasil yang diharapkan:** 4 pelanggan (Budi Santoso, Andi Pratama, Agus Salim, Citra Dewi).

> 📝 **Aturan penulisan:**
> - Teks ditulis dengan **tanda kutip tunggal** `'...'`.
> - Angka **tanpa** tanda kutip.
> - Tanggal ditulis `'YYYY-MM-DD'`.

### Praktik 1.2 — Filter angka

```sql
SELECT nama_produk, harga FROM produk WHERE harga > 1000000;
```

🤔 **Tebak dulu:** produk apa saja yang muncul? (Jawaban: Laptop Asus, Monitor LG, Laptop Lenovo.)

### Praktik 1.3 — Filter tanggal

```sql
SELECT id, pelanggan_id, tanggal_pesan, status
FROM pesanan
WHERE tanggal_pesan >= '2025-10-15';
```

### Praktik 1.4 — Tidak sama dengan

```sql
SELECT id, produk_id, status FROM pesanan WHERE status <> 'selesai';
```

### 🧪 Coba Sendiri (5 menit)

1. Tampilkan nama produk yang stoknya **habis** (stok = 0).
2. Tampilkan pelanggan yang mendaftar **setelah** `2025-06-01`.
3. Tampilkan produk dengan harga **maksimal** Rp100.000.

---

## Sesi C: Operator Logika

### `AND`, `OR`, `NOT`

| Operator | Aturan | Contoh |
|---|---|---|
| `AND` | **semua** kondisi harus benar | `kategori = 'Buku' AND harga < 100000` |
| `OR` | **salah satu** kondisi benar sudah cukup | `kota = 'Jember' OR kota = 'Malang'` |
| `NOT` | membalik kondisi | `NOT kategori = 'Buku'` |

### Praktik 2.1 — `AND`

```sql
SELECT nama_produk, kategori, harga
FROM produk
WHERE kategori = 'Elektronik' AND harga < 2000000;
```

### Praktik 2.2 — `OR`

```sql
SELECT nama, kota FROM pelanggan
WHERE kota = 'Jember' OR kota = 'Malang';
```

### ⚠️ Jebakan Klasik: Urutan `AND` dan `OR`

`AND` diproses **lebih dulu** daripada `OR`. Bandingkan dua query ini:

```sql
-- Query A (tanpa kurung)
SELECT nama_produk, kategori, harga FROM produk
WHERE kategori = 'Buku' OR kategori = 'Aksesoris' AND harga < 100000;

-- Query B (dengan kurung)
SELECT nama_produk, kategori, harga FROM produk
WHERE (kategori = 'Buku' OR kategori = 'Aksesoris') AND harga < 100000;
```

Jalankan keduanya. Jumlah barisnya berbeda! Query A dibaca sebagai *"semua Buku, ATAU Aksesoris yang murah"*, sedangkan Query B dibaca *"Buku atau Aksesoris, yang harganya murah"*.

> ✅ **Kebiasaan industri #2:** **selalu pakai tanda kurung** saat mencampur `AND` dan `OR`, walaupun kamu hafal prioritasnya. Rekan satu tim (dan dirimu enam bulan lagi) akan berterima kasih.

### `IN` — pengganti `OR` berulang

```sql
-- Panjang dan berulang
SELECT * FROM pelanggan WHERE kota = 'Jember' OR kota = 'Malang' OR kota = 'Surabaya';

-- Ringkas dan mudah dibaca
SELECT * FROM pelanggan WHERE kota IN ('Jember', 'Malang', 'Surabaya');
```

Lawannya: `NOT IN`.

```sql
SELECT nama, kota FROM pelanggan WHERE kota NOT IN ('Jember', 'Malang');
```

### `BETWEEN` — rentang nilai (**inklusif**: batas awal dan akhir ikut)

```sql
SELECT nama_produk, harga FROM produk
WHERE harga BETWEEN 100000 AND 500000;
```

Setara dengan `harga >= 100000 AND harga <= 500000`.

```sql
SELECT id, tanggal_pesan, status FROM pesanan
WHERE tanggal_pesan BETWEEN '2025-10-10' AND '2025-10-15';
```

### 🧪 Coba Sendiri (10 menit)

1. Tampilkan pesanan berstatus `diproses` **atau** `dikirim` (gunakan `IN`).
2. Tampilkan produk `Aksesoris` yang stoknya di atas 20 **dan** harganya di bawah Rp400.000.
3. Tampilkan pelanggan yang **bukan** dari Jember.
4. Tampilkan pesanan antara 1 sampai 10 Oktober 2025.

---

## Sesi D: Nilai `NULL`

### Konsep

`NULL` artinya **"tidak ada nilai / tidak diketahui"**. Ia **bukan** angka 0 dan **bukan** teks kosong `''`.

Lihat tabel `pelanggan`: Andi dan Putri tidak punya email (`NULL`).

### Praktik 3.1 — Coba cara yang salah

```sql
SELECT nama FROM pelanggan WHERE email = NULL;
```

Hasilnya **kosong**, padahal ada pelanggan tanpa email. Kenapa? Karena `NULL = NULL` hasilnya bukan *benar*, melainkan *tidak diketahui*.

### Praktik 3.2 — Cara yang benar

```sql
SELECT nama FROM pelanggan WHERE email IS NULL;        -- tidak punya email
SELECT nama, email FROM pelanggan WHERE email IS NOT NULL;  -- punya email
```

### Jebakan `NULL` pada `<>`

```sql
SELECT id, catatan FROM pesanan WHERE catatan <> 'Hadiah ulang tahun';
```

Baris dengan `catatan = NULL` **tidak ikut muncul**! Kalau ingin ikut:

```sql
SELECT id, catatan FROM pesanan
WHERE catatan <> 'Hadiah ulang tahun' OR catatan IS NULL;
```

> ✅ **Kebiasaan industri #3:** selalu tanyakan *"kolom ini boleh NULL tidak?"* sebelum menulis filter. Bug "data hilang secara misterius" di aplikasi nyata sering berasal dari sini.

### 🧪 Latihan Mini 1 (15 menit, kerjakan sendiri)

1. Tampilkan pesanan yang **punya catatan**.
2. Tampilkan pelanggan dari **Jember atau Surabaya** yang **punya email**.
3. Tampilkan pesanan berstatus `selesai` pada **Oktober 2025 tanggal 10 ke atas** dengan jumlah lebih dari 1.

## Sesi E: Rangkuman & Lembar Kerja Praktikum 1

| Konsep | Ingat ini |
|---|---|
| `WHERE` | Saringan baris |
| Teks & tanggal | Pakai kutip tunggal |
| `AND` / `OR` | Gunakan kurung jika dicampur |
| `IN` | Pengganti `OR` berulang |
| `BETWEEN` | Inklusif di kedua ujung |
| `NULL` | Pakai `IS NULL` / `IS NOT NULL`, bukan `=` |

**Pertanyaan refleksi (jawab di buku catatan):**
1. Apa beda `harga BETWEEN 100 AND 200` dengan `harga > 100 AND harga < 200`?
2. Mengapa `WHERE email = NULL` tidak pernah mengembalikan data?


---

# 📝 LEMBAR KERJA PRAKTIKUM 1
**Topik:** `WHERE`, Operator Perbandingan & Logika, `NULL` | **Jumlah soal:** 20 | **Skor:** 5 poin per soal

**Nama:** ______________________ **NIM:** ______________ **Kelas:** __________

**Petunjuk:**
- Gunakan database `tokoku`.
- Tulis query dan **tempelkan tangkapan layar hasilnya** (atau tulis jumlah baris yang dihasilkan).
- Kerjakan berurutan; soal makin sulit di bagian akhir.
- Soal bertanda 💬 dijawab dengan kalimatmu sendiri.

## Bagian A — `WHERE` & Operator Perbandingan

1. Tampilkan nama dan email semua pelanggan yang berasal dari **Surabaya**.
2. Tampilkan nama produk dan harga untuk produk yang harganya **di bawah Rp100.000**.
3. Tampilkan semua pesanan dengan jumlah **lebih dari 2**.
4. Tampilkan semua pesanan yang statusnya **bukan** `selesai`.
5. Tampilkan pelanggan yang mendaftar **pada atau sebelum 31 Maret 2025**.

## Bagian B — Operator Logika (`AND`, `OR`, `NOT`, `IN`, `BETWEEN`)

6. Tampilkan produk kategori **Aksesoris** yang **stoknya masih ada** (lebih dari 0).
7. Tampilkan produk kategori **Elektronik** dengan harga **maksimal Rp1.000.000**.
8. Tampilkan pelanggan yang berasal dari **Jember atau Jakarta**.
9. Tampilkan pesanan berstatus `diproses` atau `dikirim` menggunakan **`IN`**.
10. Tampilkan pelanggan yang kotanya **tidak termasuk** Jember dan Malang menggunakan **`NOT IN`**.
11. Tampilkan produk dengan harga **antara Rp100.000 dan Rp500.000** menggunakan **`BETWEEN`**.
12. Tampilkan pesanan yang dibuat **antara 10 Oktober 2025 dan 15 Oktober 2025**.
13. Tampilkan pesanan berstatus `selesai` **atau** `dikirim` yang jumlahnya **lebih dari 1**. *(Perhatikan penggunaan kurung!)*
14. 💬 Jalankan kedua query berikut, lalu jelaskan mengapa jumlah barisnya berbeda:
    ```sql
    SELECT * FROM produk WHERE kategori = 'Buku' OR kategori = 'Aksesoris' AND stok = 0;
    SELECT * FROM produk WHERE (kategori = 'Buku' OR kategori = 'Aksesoris') AND stok = 0;
    ```

## Bagian C — `NULL`

15. Tampilkan pelanggan yang **belum memiliki email**.
16. Tampilkan pesanan berstatus `diproses` yang **memiliki catatan**.
17. 💬 Query `SELECT id, catatan FROM pesanan WHERE catatan <> 'Hadiah ulang tahun';` tidak menampilkan pesanan yang catatannya kosong. Jelaskan alasannya, lalu tulis query perbaikan agar pesanan tanpa catatan ikut tampil.

## Bagian D — Studi Kasus Gabungan

18. Tampilkan pelanggan dari **Jember atau Surabaya** yang **memiliki email**.
19. Tampilkan produk yang **bukan** kategori `Buku`, harganya **di atas Rp100.000**, dan stoknya **kurang dari 30**.
20. Tim gudang ingin memantau pesanan yang **tidak dibatalkan**, dibuat **sejak 10 Oktober 2025**, dan **tanpa catatan**. Tampilkan hanya kolom `id`, `pelanggan_id`, `status`, dan `tanggal_pesan`.

## ✅ Checklist Pengumpulan Lembar Kerja 1

- [ ] Semua query dapat dijalankan tanpa error
- [ ] Teks memakai kutip tunggal
- [ ] Tanda kurung dipakai saat mencampur `AND` dan `OR`
- [ ] `NULL` diperiksa dengan `IS NULL` / `IS NOT NULL`
- [ ] Tangkapan layar/jumlah baris dilampirkan

---

# 📗 PERTEMUAN 2 — Mencari & Mengurutkan Data

## Sesi B: `LIKE` dan Wildcard

### Konsep

`=` hanya cocok jika teks **persis sama**. `LIKE` mencocokkan teks berdasarkan **pola**.

| Wildcard | Arti |
|---|---|
| `%` | nol atau lebih karakter apa saja |
| `_` | tepat **satu** karakter apa saja |

### Pola-Pola Umum

| Pola | Artinya | Contoh cocok |
|---|---|---|
| `'Budi%'` | diawali "Budi" | Budi Santoso, Budi Hartono |
| `'%Dewi'` | diakhiri "Dewi" | Citra Dewi |
| `'%Laptop%'` | mengandung "Laptop" | Laptop Asus Vivobook |
| `'_udi%'` | karakter ke-2 dst. "udi" | Budi ... |
| `'%a_a%'` | huruf "a", 1 karakter bebas, "a" | Santoso? (cek sendiri!) |

### Praktik 4.1 — Diawali

```sql
SELECT nama FROM pelanggan WHERE nama LIKE 'Budi%';
```

### Praktik 4.2 — Diakhiri

```sql
SELECT nama FROM pelanggan WHERE nama LIKE '%Dewi';
```

### Praktik 4.3 — Mengandung (fitur *search* paling umum)

```sql
SELECT nama_produk, harga FROM produk WHERE nama_produk LIKE '%Laptop%';
SELECT nama_produk FROM produk WHERE nama_produk LIKE '%Gaming%';
```

### Praktik 4.4 — Wildcard `_`

```sql
-- Email yang username-nya tepat 4 huruf sebelum @
SELECT nama, email FROM pelanggan WHERE email LIKE '____@mail.com';
```

### Praktik 4.5 — `NOT LIKE` dan kombinasi

```sql
SELECT nama_produk FROM produk
WHERE nama_produk LIKE '%Logitech%' AND nama_produk NOT LIKE '%Webcam%';
```

### Besar-Kecil Huruf (Case Sensitivity)

```sql
SELECT nama FROM pelanggan WHERE nama LIKE '%budi%';
```

- **MySQL/MariaDB** (collation `_ci`): **tidak** membedakan huruf besar/kecil, jadi "Budi" ikut muncul.
- **PostgreSQL**: `LIKE` **membedakan** huruf. Gunakan `ILIKE` untuk pencarian tanpa membedakan:
  ```sql
  SELECT nama FROM pelanggan WHERE nama ILIKE '%budi%';
  ```

### Mencari karakter `%` atau `_` secara harfiah

Gunakan `ESCAPE`:

```sql
SELECT * FROM produk WHERE nama_produk LIKE '%50\%%' ESCAPE '\\';
```

### ⚠️ Insight Industri: `LIKE` dan Performa

Database bisa memakai **index** (struktur pencarian cepat, seperti daftar isi buku) hanya jika pola diawali teks pasti:

| Pola | Bisa pakai index? |
|---|---|
| `LIKE 'Budi%'` | ✅ Ya |
| `LIKE '%Budi'` | ❌ Tidak (scan seluruh tabel) |
| `LIKE '%Budi%'` | ❌ Tidak (scan seluruh tabel) |

Pada tabel berisi jutaan baris, `LIKE '%kata%'` bisa sangat lambat. Solusi yang dipakai industri untuk fitur pencarian skala besar: **Full-Text Search** (`FULLTEXT` di MySQL, `tsvector` di PostgreSQL) atau mesin pencari khusus seperti Elasticsearch/Meilisearch. Untuk skala kecil-menengah, `LIKE` sudah cukup.

Kamu bisa melihat cara database menjalankan query dengan `EXPLAIN`:

```sql
EXPLAIN SELECT * FROM pelanggan WHERE nama LIKE 'Budi%';
```

### 🧪 Coba Sendiri (10 menit)

1. Cari produk yang namanya diawali "Buku".
2. Cari pelanggan yang namanya mengandung "an".
3. Cari produk berkategori Aksesoris yang namanya mengandung "Gaming" atau "Logitech".
4. Cari pesanan yang catatannya mengandung kata "kirim".

---

## Sesi C: `ORDER BY` dan `LIMIT`

### Konsep

Tanpa `ORDER BY`, **urutan hasil tidak dijamin**. Jangan pernah mengandalkan "biasanya urut sesuai id".

```sql
SELECT kolom FROM tabel
WHERE kondisi
ORDER BY kolom [ASC | DESC];
```

- `ASC` = naik (A→Z, kecil→besar) — **default**.
- `DESC` = turun (Z→A, besar→kecil).

### Urutan Penulisan Klausa (hafalkan!)

```
SELECT → FROM → WHERE → ORDER BY → LIMIT
```

### Praktik 5.1 — Satu kolom

```sql
SELECT nama_produk, harga FROM produk ORDER BY harga;          -- termurah dulu
SELECT nama_produk, harga FROM produk ORDER BY harga DESC;     -- termahal dulu
```

### Praktik 5.2 — Teks dan tanggal

```sql
SELECT nama FROM pelanggan ORDER BY nama ASC;
SELECT id, tanggal_pesan, status FROM pesanan ORDER BY tanggal_pesan DESC;  -- terbaru dulu
```

### Praktik 5.3 — Lebih dari satu kolom

```sql
SELECT nama_produk, kategori, harga FROM produk
ORDER BY kategori ASC, harga DESC;
```

Dibaca: urutkan berdasarkan kategori dulu; jika kategori sama, urutkan berdasarkan harga termahal.

### Praktik 5.4 — `WHERE` + `ORDER BY`

```sql
SELECT nama_produk, harga FROM produk
WHERE kategori = 'Elektronik'
ORDER BY harga DESC;
```

### Praktik 5.5 — `LIMIT` (membatasi jumlah baris)

```sql
-- 3 produk termahal
SELECT nama_produk, harga FROM produk ORDER BY harga DESC LIMIT 3;

-- 5 pesanan terbaru
SELECT id, tanggal_pesan, status FROM pesanan ORDER BY tanggal_pesan DESC LIMIT 5;
```

### Praktik 5.6 — Pagination (halaman data)

Semua aplikasi dengan tabel data (admin panel, katalog, feed) memakai pola ini:

```sql
-- Halaman 1 (5 data per halaman)
SELECT id, nama_produk, harga FROM produk ORDER BY id LIMIT 5 OFFSET 0;
-- Halaman 2
SELECT id, nama_produk, harga FROM produk ORDER BY id LIMIT 5 OFFSET 5;
-- Halaman 3
SELECT id, nama_produk, harga FROM produk ORDER BY id LIMIT 5 OFFSET 10;
```

Rumus: `OFFSET = (halaman - 1) × jumlah_per_halaman`

> *Catatan:* SQL Server memakai `TOP` atau `OFFSET ... FETCH`, Oracle memakai `FETCH FIRST`. Konsepnya sama.

### ⚠️ Insight Industri: Urutan yang Stabil (*Tie-Breaker*)

Coba urutkan berdasarkan kolom yang nilainya banyak kembar:

```sql
SELECT id, nama_produk, kategori FROM produk ORDER BY kategori LIMIT 4 OFFSET 0;
```

Jika banyak baris punya `kategori` sama, database bebas mengurutkan sesama mereka. Akibatnya, **data bisa muncul dobel atau hilang antar halaman** saat pagination. Solusinya: tambahkan kolom unik (biasanya `id`) sebagai urutan terakhir.

```sql
SELECT id, nama_produk, kategori FROM produk
ORDER BY kategori ASC, id ASC
LIMIT 4 OFFSET 0;
```

> ✅ **Kebiasaan industri #4:** pagination **selalu** disertai `ORDER BY` dengan kolom unik sebagai penentu akhir.

### Posisi `NULL` saat diurutkan

```sql
SELECT nama, email FROM pelanggan ORDER BY email ASC;
```

Di MySQL, `NULL` dianggap paling kecil (muncul di awal saat `ASC`). Di PostgreSQL sebaliknya (`NULL` di akhir saat `ASC`). Agar konsisten antar DBMS, tulis eksplisit:

```sql
-- MySQL: NULL di akhir
SELECT nama, email FROM pelanggan ORDER BY email IS NULL, email ASC;
-- PostgreSQL: NULL di akhir
SELECT nama, email FROM pelanggan ORDER BY email ASC NULLS LAST;
```

### 🧪 Coba Sendiri (10 menit)

1. Tampilkan 3 produk **Aksesoris** termurah.
2. Tampilkan pelanggan diurutkan berdasarkan kota (A-Z), lalu nama (A-Z).
3. Tampilkan pesanan berstatus `selesai`, terbaru dulu, ambil 4 data.

---

## Sesi D: Praktik Terbaik Industri

Bagian ini menghubungkan SQL yang kamu pelajari dengan cara kerja aplikasi sungguhan.

### 1. 🔒 Jangan Pernah Menyambung Input Pengguna ke Query (SQL Injection)

Misalnya aplikasi punya kolom pencarian produk. Cara **berbahaya**:

```php
// ❌ JANGAN! Rentan SQL Injection
$keyword = $_GET['q'];
$sql = "SELECT * FROM produk WHERE nama_produk LIKE '%$keyword%'";
```

Jika pengguna mengetik `' OR '1'='1`, kondisi `WHERE` berubah makna dan semua data bocor. Cara **aman** yang dipakai industri adalah **prepared statement** (parameter terpisah dari query):

```php
// ✅ PHP PDO
$stmt = $pdo->prepare(
    "SELECT id, nama_produk, harga FROM produk WHERE nama_produk LIKE :kw ORDER BY nama_produk"
);
$stmt->execute(['kw' => '%' . $keyword . '%']);
$hasil = $stmt->fetchAll();
```

```php
// ✅ Laravel (Query Builder otomatis memakai prepared statement)
$produk = DB::table('produk')
    ->select('id', 'nama_produk', 'harga')
    ->where('nama_produk', 'like', "%{$keyword}%")
    ->orderBy('nama_produk')
    ->get();
```

> Aturan emas: **data dari pengguna = data, bukan bagian dari perintah SQL.**

### 2. 📄 Pagination + Filter + Sorting = Satu Query

Endpoint API katalog produk di dunia nyata biasanya berbentuk:

```sql
SELECT id, nama_produk, kategori, harga
FROM produk
WHERE kategori = 'Elektronik'
  AND harga BETWEEN 500000 AND 8000000
  AND nama_produk LIKE 'Laptop%'
ORDER BY harga ASC, id ASC
LIMIT 10 OFFSET 0;
```

Parameter `kategori`, rentang harga, kata kunci, urutan, dan halaman berasal dari *query string* seperti `/api/produk?kategori=Elektronik&sort=harga&page=1`.

> **Catatan lanjut:** `OFFSET` yang besar (misal halaman 10.000) menjadi lambat. Aplikasi skala besar memakai **keyset/cursor pagination**: `WHERE id > :id_terakhir ORDER BY id LIMIT 10`. Kamu akan menemukannya nanti; cukup tahu bahwa ini ada.

### 3. ⚡ Tulis Kondisi yang "Ramah Index" (*Sargable*)

Jangan membungkus kolom dengan fungsi di dalam `WHERE`:

```sql
-- ❌ Lambat: index pada tanggal_pesan tidak bisa dipakai
SELECT id FROM pesanan WHERE MONTH(tanggal_pesan) = 10 AND YEAR(tanggal_pesan) = 2025;

-- ✅ Cepat: bandingkan kolom langsung dengan rentang
SELECT id FROM pesanan
WHERE tanggal_pesan >= '2025-10-01' AND tanggal_pesan < '2025-11-01';
```

Perhatikan pola `>= awal AND < awal_bulan_berikutnya`. Ini lebih aman daripada `BETWEEN` untuk kolom `DATETIME`/`TIMESTAMP` karena tidak ada data di detik terakhir yang terlewat.

### 4. 🔍 Pilih Kolom Secukupnya

```sql
-- ❌ Boros
SELECT * FROM pelanggan WHERE kota = 'Jember';
-- ✅ Efisien
SELECT id, nama, kota FROM pelanggan WHERE kota = 'Jember';
```

### 5. 🧾 Konvensi Penulisan

- Kata kunci SQL **huruf besar** (`SELECT`, `WHERE`), nama tabel/kolom **huruf kecil** dengan `snake_case`.
- Satu klausa per baris untuk query panjang.
- Gunakan alias bila perlu agar hasil mudah dibaca:

```sql
SELECT nama_produk AS produk, harga AS harga_satuan
FROM produk
WHERE stok > 0
ORDER BY harga_satuan DESC;
```

### 6. 🛡️ Biasakan Menguji dengan `SELECT` Sebelum `UPDATE`/`DELETE`

Praktik ini sangat menyelamatkan karier. Sebelum menjalankan:

```sql
DELETE FROM pesanan WHERE status = 'dibatalkan';
```

jalankan dulu:

```sql
SELECT * FROM pesanan WHERE status = 'dibatalkan';
```

Pastikan baris yang muncul memang yang kamu maksud. Lupa menulis `WHERE` pada `UPDATE`/`DELETE` akan memengaruhi **seluruh tabel**. Di lingkungan produksi, kebanyakan tim juga memakai transaksi (`BEGIN` ... `ROLLBACK`/`COMMIT`) dan *backup* sebelum perubahan data massal.

### Tabel Ringkasan Praktik Terbaik

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

# 📝 LEMBAR KERJA PRAKTIKUM 2
**Topik:** `LIKE`, `ORDER BY`, `LIMIT`, Praktik Industri | **Jumlah soal:** 20 | **Skor:** 5 poin per soal

**Nama:** ______________________ **NIM:** ______________ **Kelas:** __________

**Petunjuk:**
- Gunakan database `tokoku`.
- Tulis query dan **tempelkan tangkapan layar hasilnya** (atau tulis jumlah baris yang dihasilkan).
- Soal bertanda 💬 dijawab dengan kalimatmu sendiri.
- Hindari `SELECT *` pada jawaban akhir; sebutkan kolom yang diminta saja.

## Bagian A — `LIKE`

1. Tampilkan produk yang namanya **diawali** "Buku".
2. Tampilkan produk yang namanya **mengandung** kata "Gaming".
3. Tampilkan pelanggan yang namanya **berakhiran** "Dewi".
4. Tampilkan pelanggan yang namanya **diawali** "Budi" **atau** **berakhiran** "Dewi".
5. Tampilkan pelanggan yang email-nya memiliki **tepat 3 karakter** sebelum `@mail.com` (gunakan wildcard `_`).
6. Tampilkan produk bermerek **Logitech** yang **bukan** Webcam (gunakan `NOT LIKE`).
7. Tampilkan pesanan yang catatannya **mengandung** kata "kirim".

## Bagian B — `ORDER BY`

8. Tampilkan nama produk dan harga, diurutkan dari **termurah** ke **termahal**.
9. Tampilkan semua pelanggan, diurutkan dari **tanggal daftar terbaru**.
10. Tampilkan produk diurutkan berdasarkan **kategori A–Z**, lalu **harga termahal** lebih dulu.
11. Tampilkan produk **Elektronik** dengan stok **lebih dari 10**, diurutkan dari harga **termahal**.
12. Tampilkan pelanggan diurutkan berdasarkan **kota A–Z**, lalu **nama Z–A**.

## Bagian C — `LIMIT` & Pagination

13. Tampilkan **3 produk termahal** (nama dan harga).
14. Tampilkan **2 pesanan terbaru** yang berstatus `selesai`.
15. Buat query pagination untuk daftar produk (urut `harga` naik, dengan **tie-breaker `id`**). Tampilkan **halaman ke-2** dengan **4 data per halaman**.
16. 💬 Mengapa kolom `id` perlu ditambahkan sebagai urutan terakhir pada pagination? Berapa nilai `OFFSET` untuk **halaman ke-5** dengan **10 data per halaman**?

## Bagian D — Praktik Terbaik Industri & Studi Kasus Gabungan

17. 💬 Perbaiki query berikut agar **ramah index (sargable)** dan jelaskan alasannya:
    ```sql
    SELECT id FROM pesanan WHERE MONTH(tanggal_pesan) = 10 AND YEAR(tanggal_pesan) = 2025;
    ```
18. 💬 Mana yang lebih cepat pada tabel berisi jutaan baris, dan mengapa?
    ```sql
    SELECT id, nama_produk FROM produk WHERE nama_produk LIKE 'Mouse%';
    SELECT id, nama_produk FROM produk WHERE nama_produk LIKE '%Mouse%';
    ```
19. Pengguna mengetik `Laptop` di kolom pencarian, memilih kategori `Elektronik`, urutan harga termahal, halaman 1 (5 data/halaman). Tulis versi **PHP PDO atau Laravel Query Builder** yang aman dari SQL Injection (**prepared statement**).
20. **Fitur pencarian admin.** Tampilkan pesanan yang **masih aktif** (`diproses` atau `dikirim`), dibuat **sejak 10 Oktober 2025** (inklusif), dengan catatan yang **tidak kosong**. Urutkan dari tanggal **terlama**, lalu `id`. Tampilkan hanya kolom `id`, `tanggal_pesan`, `status`, dan `catatan`.

## ✅ Checklist Pengumpulan Lembar Kerja 2

- [ ] Semua query dapat dijalankan tanpa error
- [ ] Tidak ada `SELECT *` pada jawaban akhir
- [ ] Pagination selalu memakai `ORDER BY` dengan kolom unik
- [ ] Jawaban analisis ditulis dengan kalimat sendiri
- [ ] Tangkapan layar/jumlah baris dilampirkan

---

# 📚 Rangkuman Akhir

```sql
SELECT   kolom_yang_dibutuhkan
FROM     nama_tabel
WHERE    (kondisi1 OR kondisi2)
  AND    kolom LIKE 'kata%'
  AND    kolom_lain IS NOT NULL
ORDER BY kolom_utama DESC, id ASC
LIMIT    10 OFFSET 0;
```

Urutan penulisan: **SELECT → FROM → WHERE → ORDER BY → LIMIT**.

**Selanjutnya:** `JOIN` (menggabungkan `pesanan` dengan `pelanggan` dan `produk`), fungsi agregat (`COUNT`, `SUM`, `AVG`), `GROUP BY`, dan `HAVING`. Studi kasus **TokoKu** akan terus dipakai. 🚀
