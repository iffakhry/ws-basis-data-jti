---
theme: default
title: Fungsi Agregat SQL - Workshop Basis Data
info: |
  Slide Workshop Basis Data: Fungsi Agregat SQL (COUNT, SUM, AVG, MIN, MAX).
  Studi kasus: KopiKita. Pertemuan 1 dan 2 (masing-masing 4 jam).
aspectRatio: 16/9
canvasWidth: 980
transition: slide-left
mdc: true
drawings:
  persist: false
---

# Fungsi Agregat SQL

`COUNT` · `SUM` · `AVG` · `MIN` · `MAX`

Workshop Basis Data · Studi Kasus **KopiKita** ☕

<div class="pt-8 text-sm opacity-70">
2 pertemuan × 4 jam · Pertemuan 1: dasar fungsi agregat · Pertemuan 2: GROUP BY, HAVING, CASE WHEN
</div>

<!--
Catatan penyaji:
- Deck ini memakai properti `zoom` di frontmatter slide (butuh Slidev 0.48 atau lebih baru).
- Slide yang padat sudah diperkecil dengan `zoom`. Jalankan `slidev export` untuk memeriksa hasil akhir.
- Skrip lengkap pembuatan tabel dan data ada di file panduan praktikum, Bagian 0.
-->

---
layout: default
zoom: 0.9
---

# Tujuan Pembelajaran

Setelah dua pertemuan ini, kamu mampu:

1. Menjelaskan apa itu fungsi agregat dan kapan memakainya
2. Menggunakan `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` dengan benar
3. Memahami perilaku `NULL` pada fungsi agregat
4. Mengelompokkan data dengan `GROUP BY`, menyaring dengan `HAVING`, dan memakai `CASE WHEN` di dalam agregat
5. Membuat laporan ringkasan bisnis dari satu tabel: per bulan, per status, per segmen
6. Menerapkan praktik industri: penanganan `NULL`, tipe data uang, filter tanggal efisien, definisi metrik yang konsisten

---
zoom: 0.9
---

# Cara Mengikuti Praktikum

| Simbol | Artinya |
|---|---|
| 🔮 **Prediksi dulu** | Tebak hasilnya **sebelum** menjalankan query |
| 🧪 **Coba sendiri** | Tulis query sendiri, jangan salin-tempel |
| ⚠️ **Jebakan** | Kesalahan yang sering terjadi, di kelas maupun di dunia kerja |
| 🏭 **Praktik Industri** | Cara yang dipakai tim pengembang profesional |
| ✅ **Checkpoint** | Cocokkan hasilmu sebelum lanjut |

> 💡 **Aturan emas:** ketik sendiri setiap query. Otot jari ikut belajar.

---
layout: section
---

# PERTEMUAN 1

Dasar Fungsi Agregat

---
zoom: 0.8
---

# Rencana Waktu Pertemuan 1 (240 menit)

| Menit | Kegiatan |
|---|---|
| 0–20 | Persiapan database KopiKita |
| 20–35 | Konsep fungsi agregat |
| 35–70 | `COUNT` |
| 70–95 | `SUM` |
| 95–125 | `AVG` |
| 125–145 | `MIN` dan `MAX` |
| 145–155 | Istirahat |
| 155–180 | Menggabungkan beberapa agregat |
| 180–200 | Praktik industri |
| 200–240 | Lembar Kerja 1 |

---
layout: section
---

# Persiapan Database

Kenalan dengan **KopiKita**

---
zoom: 0.9
---

# Studi Kasus: KopiKita ☕

Kamu adalah **data analyst junior** di toko online KopiKita.

Pemilik toko ingin tahu:

- Berapa pesanan yang masuk?
- Berapa omzet dan nilai pesanan rata-rata?
- Produk apa yang laris?
- Pelanggan dari kota mana saja?

Semua jawabannya ada di database. Kamu akan menggalinya dengan **fungsi agregat**.

```
categories ──< products ──< order_items >── orders >── customers
```

---
zoom: 0.8
---

# Struktur Tabel

| Tabel | Isi | Daftar kolom lengkap |
|---|---|---|
| `categories` | Kategori produk | `category_id`, `name` |
| `products` | Katalog produk | `product_id`, `name`, `category_id`, `price`, `stock`, `rating` (boleh `NULL`) |
| `customers` | Pelanggan | `customer_id`, `name`, `city` (boleh `NULL`), `joined_at` |
| `orders` | Header pesanan | `order_id`, `customer_id`, `order_date`, `status`, `shipping_fee` (boleh `NULL`) |
| `order_items` | Rincian barang | `item_id`, `order_id`, `product_id`, `quantity`, `unit_price` |

**Status pesanan:** `menunggu`, `dikirim`, `selesai`, `dibatalkan`

> Minggu ini **setiap query hanya memakai satu tabel**.

---
zoom: 0.9
---

# Langkah Setup

**1. Buat database**

```sql
CREATE DATABASE kopikita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kopikita;
```

**2. Buat 5 tabel** dengan kode DDL pada tiga slide berikutnya, lalu **3. isi data** dengan kode `INSERT` pada lima slide setelah DDL.

**Alat:** MySQL 8.0+ atau MariaDB 10.6+, dengan MySQL Workbench, DBeaver, phpMyAdmin, atau terminal `mysql`.

---
zoom: 0.85
---

# DDL (1/3): `categories` dan `products`

```sql
CREATE TABLE categories (
  category_id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL,
  rating DECIMAL(2,1) NULL,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);
```

---
zoom: 0.85
---

# DDL (2/3): `customers` dan `orders`

```sql
CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(50) NULL,
  joined_at DATE NOT NULL
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  shipping_fee DECIMAL(10,2) NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

---
zoom: 0.85
---

# DDL (3/3): `order_items`

```sql
CREATE TABLE order_items (
  item_id INT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

Buat tabel **berurutan** seperti di atas, karena tabel yang memakai `FOREIGN KEY` harus dibuat setelah tabel yang dirujuknya.

---
zoom: 0.8
---

# INSERT (1/5): `categories` dan `customers`

```sql
INSERT INTO categories VALUES
(1,'Kopi'),(2,'Teh'),(3,'Peralatan'),(4,'Camilan'),(5,'Merchandise');

INSERT INTO customers VALUES
(1,'Andi','Jember','2025-11-03'),
(2,'Budi','Surabaya','2025-12-15'),
(3,'Citra','Jember','2026-01-20'),
(4,'Dewi','Malang','2026-02-11'),
(5,'Eko',NULL,'2026-03-05'),
(6,'Fitri','Surabaya','2026-04-18'),
(7,'Gita','Jember','2026-05-09'),
(8,'Hadi','Banyuwangi','2026-06-30'),
(9,'Indah','Jember','2026-07-14'),
(10,'Joko','Malang','2026-08-01');
```

---
zoom: 0.8
---

# INSERT (2/5): `products`

```sql
INSERT INTO products VALUES
(1,'Kopi Arabika Gayo 250g',1,85000,40,4.8),
(2,'Kopi Robusta Lampung 250g',1,55000,60,4.5),
(3,'Kopi Toraja 250g',1,95000,25,4.7),
(4,'Teh Hijau Premium',2,45000,80,4.3),
(5,'Teh Melati',2,35000,100,4.1),
(6,'Teh Hitam Kayu Aro',2,40000,0,NULL),
(7,'Coffee Grinder Manual',3,250000,15,4.6),
(8,'French Press 600ml',3,175000,20,4.4),
(9,'Dripper V60',3,120000,0,NULL),
(10,'Keripik Singkong',4,25000,150,4.0),
(11,'Kacang Sangrai',4,30000,90,NULL),
(12,'Cookies Kopi',4,48000,35,4.2);
```

---
zoom: 0.75
---

# INSERT (3/5): `orders`

```sql
INSERT INTO orders VALUES
(1,1,'2026-07-05','selesai',15000),
(2,2,'2026-07-12','selesai',20000),
(3,1,'2026-07-28','selesai',NULL),
(4,3,'2026-08-03','selesai',15000),
(5,4,'2026-08-10','dibatalkan',18000),
(6,5,'2026-08-21','selesai',NULL),
(7,2,'2026-08-30','selesai',20000),
(8,6,'2026-09-04','selesai',20000),
(9,3,'2026-09-15','selesai',15000),
(10,7,'2026-09-22','dikirim',15000),
(11,1,'2026-10-01','selesai',NULL),
(12,8,'2026-10-06','selesai',25000),
(13,4,'2026-10-12','menunggu',18000),
(14,6,'2026-10-15','dikirim',20000),
(15,2,'2026-10-18','dikirim',20000);
```

---
zoom: 0.8
---

# INSERT (4/5): `order_items` bagian 1

```sql
INSERT INTO order_items VALUES
(1,1,1,2,80000),
(2,1,5,1,35000),
(3,2,7,1,250000),
(4,3,2,3,50000),
(5,3,10,2,25000),
(6,4,4,2,45000),
(7,4,5,2,35000),
(8,5,3,1,95000),
(9,6,8,1,175000),
(10,6,1,1,85000),
(11,7,2,1,55000),
(12,7,12,3,48000),
(13,8,9,1,120000),
(14,8,3,2,95000);
```

---
zoom: 0.8
---

# INSERT (5/5): `order_items` bagian 2

```sql
INSERT INTO order_items VALUES
(15,9,1,1,85000),
(16,9,11,2,30000),
(17,10,7,1,250000),
(18,10,2,1,55000),
(19,11,4,3,45000),
(20,11,10,5,25000),
(21,12,8,2,175000),
(22,12,12,2,48000),
(23,13,6,2,40000),
(24,14,1,2,85000),
(25,14,3,1,95000),
(26,15,5,4,35000),
(27,15,10,3,25000);
```

Jalankan berurutan: `categories`, `customers`, `products`, `orders`, lalu kedua bagian `order_items`.

---
zoom: 0.9
---

# ✅ Checkpoint 0

Jalankan, lalu cocokkan jumlah barisnya:

```sql
SELECT COUNT(*) FROM categories;    -- 5
SELECT COUNT(*) FROM products;      -- 12
SELECT COUNT(*) FROM customers;     -- 10
SELECT COUNT(*) FROM orders;        -- 15
SELECT COUNT(*) FROM order_items;   -- 27
```

Ada yang tidak cocok? Ulangi langkah isi data untuk tabel itu.

`COUNT(*)` baru saja kamu pakai: itu fungsi agregat pertamamu. 🎉

---
zoom: 0.9
---

# 📝 Perhatikan `unit_price`

Kolom `unit_price` di `order_items` menyimpan **harga saat transaksi terjadi**.

- Pesanan #1 membeli Kopi Arabika seharga **80.000**
- Harga di katalog sekarang **85.000**

Kenapa begini? Jawabannya ada di bagian **Praktik Industri** nanti.

---
layout: section
---

# Konsep Fungsi Agregat

---
zoom: 0.85
---

# Apa Itu Fungsi Agregat?

Query biasa mengembalikan **banyak baris**. Fungsi agregat **meringkas banyak baris menjadi satu nilai**.

```
Banyak baris  ──►  [ fungsi agregat ]  ──►  1 nilai
```

| Fungsi | Pertanyaan yang dijawab | Contoh di KopiKita |
|---|---|---|
| `COUNT` | Berapa banyak? | Jumlah pesanan |
| `SUM` | Berapa totalnya? | Total nilai penjualan |
| `AVG` | Berapa rata-ratanya? | Rata-rata harga produk |
| `MIN` | Terkecil / terawal? | Produk termurah |
| `MAX` | Terbesar / terakhir? | Tanggal pesanan terbaru |

---
zoom: 0.9
---

# Tiga Aturan Dasar

<v-clicks>

1. Hasil fungsi agregat (tanpa `GROUP BY`) selalu **satu baris**
2. Fungsi agregat **mengabaikan `NULL`** (kecuali `COUNT(*)`)
3. `WHERE` bekerja **sebelum** agregasi: baris disaring dulu, baru diringkas

</v-clicks>

<v-click>

> Ingat tiga aturan ini. Hampir semua kesalahan pemula berasal dari salah satunya.

</v-click>

---
layout: section
---

# COUNT

Menghitung baris

---
zoom: 0.85
---

# `COUNT(*)`: Hitung Semua Baris

```sql
SELECT COUNT(*) AS total_pesanan FROM orders;
```

| total_pesanan |
|---|
| 15 |

Dengan filter `WHERE`:

```sql
SELECT COUNT(*) AS pesanan_selesai
FROM orders
WHERE status = 'selesai';
```

Hasil: **10**. MySQL menyaring baris `selesai` dulu, baru menghitung.

🧪 **Coba sendiri:** berapa produk yang stoknya habis (`stock = 0`)?

---
zoom: 0.85
---

# 🔮 Prediksi: `COUNT(*)` vs `COUNT(kolom)`

`customers` punya 10 baris. Satu pelanggan (Eko) kotanya `NULL`. Berapa hasilnya?

```sql
SELECT
  COUNT(*)    AS semua_baris,
  COUNT(city) AS kota_terisi
FROM customers;
```

<v-click>

| semua_baris | kota_terisi |
|---|---|
| 10 | 9 |

⚠️ `COUNT(*)` menghitung **baris**. `COUNT(kolom)` menghitung **nilai yang terisi**. Memilih yang salah membuat laporan keliru tanpa pesan error.

</v-click>

---
zoom: 0.9
---

# `COUNT(DISTINCT kolom)`: Nilai Unik

```sql
SELECT COUNT(DISTINCT city) AS jumlah_kota FROM customers;
```

Hasil: **4** (Jember, Surabaya, Malang, Banyuwangi). `NULL` tidak dihitung.

```sql
SELECT COUNT(DISTINCT customer_id) AS pelanggan_yang_pernah_order
FROM orders;
```

Hasil: **8**. Dari 10 pelanggan, hanya 8 yang pernah memesan.

---
zoom: 0.9
---

# Ringkasan `COUNT`

| Bentuk | Menghitung | `NULL`? |
|---|---|---|
| `COUNT(*)` | Semua baris | Ikut dihitung |
| `COUNT(kolom)` | Baris dengan kolom terisi | Diabaikan |
| `COUNT(DISTINCT kolom)` | Nilai unik yang terisi | Diabaikan |

<v-click>

🧪 **Coba sendiri:** berapa baris di `orders` yang `shipping_fee`-nya terisi? Bandingkan dengan `COUNT(*)`.

</v-click>

---
layout: section
---

# SUM

Menjumlahkan

---
zoom: 0.85
---

# `SUM` pada Kolom dan Ekspresi

```sql
SELECT SUM(stock) AS total_stok FROM products;                -- 615
SELECT SUM(quantity) AS total_barang_terjual FROM order_items; -- 52
```

Kamu boleh menghitung per baris dulu, baru dijumlahkan:

```sql
SELECT SUM(quantity * unit_price) AS total_nilai_penjualan
FROM order_items;                                              -- 3.385.000

SELECT SUM(stock * price) AS nilai_stok FROM products;        -- 31.555.000
```

> Angka penjualan mencakup **semua** pesanan (termasuk yang dibatalkan), karena `status` ada di tabel `orders`.

---
zoom: 0.85
---

# `SUM` + `WHERE` dan `NULL`

```sql
SELECT SUM(shipping_fee) AS total_ongkir
FROM orders
WHERE status = 'selesai';
```

Hasil: **130.000**

- Ada **10** pesanan selesai
- Hanya **7** yang ongkirnya terisi
- Sisanya `NULL` dan **diabaikan** oleh `SUM`

---
zoom: 0.85
---

# ⚠️ `SUM` Tanpa Baris = `NULL`, Bukan 0

```sql
SELECT SUM(shipping_fee) FROM orders WHERE status = 'ditolak';
```

Hasil: **`NULL`**. Padahal laporan biasanya butuh angka 0. Gunakan `COALESCE`:

```sql
SELECT COALESCE(SUM(shipping_fee), 0) AS total_ongkir
FROM orders
WHERE status = 'ditolak';
```

Hasil: **0**

`COALESCE(a, b)` artinya: pakai `a`; kalau `a` itu `NULL`, pakai `b`.

---
layout: section
---

# AVG

Rata-rata

---
zoom: 0.9
---

# `AVG` Dasar

```sql
SELECT AVG(price) AS rata_rata_harga FROM products;
```

Hasil: ± **83.583,33**. Rapikan dengan `ROUND(nilai, jumlah_desimal)`:

```sql
SELECT ROUND(AVG(price), 0) AS rata_rata_harga FROM products;
```

Hasil: **83.583**

Dengan filter:

```sql
SELECT ROUND(AVG(price), 0) AS rata2_harga_ready
FROM products WHERE stock > 0;          -- 84.300
```

---
zoom: 0.8
---

# 🔮 Prediksi: Apakah Angkanya Sama?

Tiga produk belum punya rating (`NULL`).

```sql
SELECT
  AVG(rating)                 AS cara_1,
  SUM(rating) / COUNT(*)      AS cara_2,
  SUM(rating) / COUNT(rating) AS cara_3,
  COUNT(rating)               AS produk_berating
FROM products;
```

<v-click>

| cara_1 | cara_2 | cara_3 | produk_berating |
|---|---|---|---|
| 4.4 | 3.3 | 4.4 | 9 |

`AVG` membagi dengan **9** (baris terisi), bukan 12. Cara 2 keliru karena `COUNT(*)` ikut menghitung produk tanpa rating.

</v-click>

---
zoom: 0.85
---

# ⚠️ Apa Arti `NULL` di Sini?

| Makna `NULL` | Perlakuan |
|---|---|
| **Tidak diketahui** (rating belum ada) | Biarkan, `AVG` mengabaikannya |
| **Sebenarnya nol** (gratis ongkir) | Ubah jadi 0 dengan `COALESCE` |

```sql
SELECT
  AVG(shipping_fee)              AS rata2_tanpa_null,    -- 18.416,67
  AVG(COALESCE(shipping_fee, 0)) AS rata2_null_jadi_nol  -- 14.733,33
FROM orders;
```

Dua angka, dua makna bisnis. **Kamu** yang menentukan mana yang benar, bukan MySQL.

---
layout: section
---

# MIN dan MAX

---
zoom: 0.8
---

# `MIN` dan `MAX`: Angka, Tanggal, Teks

```sql
SELECT MIN(price) AS termurah, MAX(price) AS termahal FROM products;
```

| termurah | termahal |
|---|---|
| 25000 | 250000 |

```sql
SELECT MIN(order_date) AS pesanan_pertama, MAX(order_date) AS pesanan_terakhir
FROM orders;
```

| pesanan_pertama | pesanan_terakhir |
|---|---|
| 2026-07-05 | 2026-10-18 |

Pada teks, `MIN`/`MAX` mengikuti urutan abjad: `Coffee Grinder Manual` dan `Teh Melati`.

---
zoom: 0.85
---

# ⚠️ "Siapa" Produk Termahal?

```sql
SELECT name, MAX(price) FROM products;   -- ❌ SALAH / tidak konsisten
```

- `MAX(price)` hanya **satu** nilai, sedangkan `name` punya 12 kemungkinan
- Mode default MySQL modern (`ONLY_FULL_GROUP_BY`): **error**
- Di setting lama: bisa menampilkan nama yang **tidak cocok** dengan harganya (lebih berbahaya)

✅ Cara yang benar:

```sql
SELECT name, price FROM products ORDER BY price DESC LIMIT 1;
```

Hasil: `Coffee Grinder Manual | 250000`

---
layout: section
---

# Menggabungkan Beberapa Agregat

Satu query, banyak jawaban

---
zoom: 0.8
---

# Ringkasan Katalog KopiKita

```sql
SELECT
  COUNT(*)              AS jumlah_produk,
  SUM(stock)            AS total_stok,
  ROUND(AVG(price), 0)  AS rata2_harga,
  MIN(price)            AS harga_min,
  MAX(price)            AS harga_max
FROM products;
```

| jumlah_produk | total_stok | rata2_harga | harga_min | harga_max |
|---|---|---|---|---|
| 12 | 615 | 83583 | 25000 | 250000 |

Kebiasaan bagus: **satu kali baca tabel, banyak jawaban.**

---
zoom: 0.8
---

# Dengan Filter: Ringkasan Kategori Kopi

```sql
SELECT
  COUNT(*)              AS jumlah_produk,
  ROUND(AVG(price), 0)  AS rata2_harga,
  MIN(price)            AS harga_min,
  MAX(price)            AS harga_max
FROM products
WHERE category_id = 1;
```

| jumlah_produk | rata2_harga | harga_min | harga_max |
|---|---|---|---|
| 3 | 78333 | 55000 | 95000 |

🧪 **Coba sendiri:** buat ringkasan `orders` dalam **satu** query: jumlah pesanan, jumlah pelanggan unik yang memesan, tanggal pesanan pertama dan terakhir.

---
layout: section
---

# 🏭 Praktik Industri

Dari "asal jalan" ke "siap produksi"

---
zoom: 0.8
---

# Hitung di Database, Bukan di Aplikasi

❌ **Salah:** tarik semua data ke aplikasi, lalu hitung dengan loop.

```php
// Laravel: menarik ribuan baris ke memori hanya untuk menghitung
$orders = Order::all();
$total  = count($orders);
```

✅ **Benar:** biarkan database yang menghitung.

```php
// Laravel: hanya satu angka yang dikirim lewat jaringan
$total = Order::where('status', 'selesai')->count();
$omzet = OrderItem::sum(DB::raw('quantity * unit_price'));
$rata2 = Product::avg('price');
```

Query SQL di baliknya sama dengan yang kamu pelajari hari ini.

---
zoom: 0.85
---

# `DECIMAL` untuk Uang, dan Selalu Pikirkan `NULL`

**Uang = `DECIMAL`, bukan `FLOAT`.** `FLOAT`/`DOUBLE` menyimpan pecahan secara aproksimasi. Setelah dijumlahkan ribuan kali, selisih kecil menumpuk.

**Sebelum menulis agregat, tanyakan:**

1. Apakah kolom ini bisa `NULL`?
2. Apa arti `NULL` di sini: *tidak diketahui* atau *nol*?
3. Bagaimana jika tidak ada baris yang cocok? (`SUM` → `NULL`)

```sql
SELECT COALESCE(SUM(shipping_fee), 0) AS total_ongkir
FROM orders WHERE status = 'selesai';
```

---
zoom: 0.85
---

# Simpan "Harga Saat Transaksi"

Itu alasan `order_items` punya `unit_price`, padahal `products` sudah punya `price`.

- Harga katalog bisa berubah kapan saja
- Jika omzet dihitung dari harga katalog hari ini, **laporan bulan lalu ikut berubah**
- Pesanan #1: 80.000 (saat transaksi) vs 85.000 (katalog sekarang)

```sql
-- ✅ Benar: pakai harga saat transaksi
SELECT SUM(quantity * unit_price) FROM order_items;
```

---
zoom: 0.9
---

# Kebiasaan Baik Lainnya

**Beri alias yang bermakna**

`SUM(quantity * unit_price)` menghasilkan kolom bernama `SUM(quantity * unit_price)`. Rekan tim dan aplikasi lebih mudah membaca `AS total_nilai`. Gunakan `snake_case` yang deskriptif.

**Jangan `SELECT *` hanya untuk menghitung**

`SELECT COUNT(*) FROM orders` bagus. Menarik semua kolom lalu menghitung di aplikasi tidak.

---
zoom: 0.8
---

# Rangkuman Pertemuan 1

| Fungsi | `NULL` | Tanpa baris cocok | Tipe data |
|---|---|---|---|
| `COUNT(*)` | Dihitung | `0` | Angka |
| `COUNT(kolom)` | Diabaikan | `0` | Angka |
| `SUM` | Diabaikan | `NULL` | Angka |
| `AVG` | Diabaikan | `NULL` | Angka |
| `MIN` / `MAX` | Diabaikan | `NULL` | Angka, tanggal, teks |

**Lanjut ke Lembar Kerja Praktikum 1** 📝

---
zoom: 0.85
---

# 📝 Lembar Kerja Praktikum 1

Fungsi Agregat Dasar · **20 soal**

- Gunakan database `kopikita`. Kerjakan **mandiri**
- Tulis **query** dan **hasilnya** (salin atau screenshot)
- Beri **alias** yang bermakna pada kolom hasil
- Soal bertanda 💬 meminta penjelasan singkat (1–2 kalimat)
- Soal 16–20 menantang, kerjakan terakhir

| Bagian | Soal |
|---|---|
| A. Dasar | 1–8 |
| B. Menengah | 9–15 |
| C. Menantang | 16–20 |

---
zoom: 0.85
---

# Lembar Kerja 1 · A. Dasar (1–8)

1. Hitung jumlah seluruh pelanggan.
2. Hitung jumlah produk pada kategori Teh (`category_id = 2`).
3. Hitung jumlah pesanan berstatus `dikirim`.
4. Hitung jumlah pelanggan yang berasal dari kota **Jember**.
5. Hitung jumlah pelanggan yang tidak memiliki kota (`city` bernilai `NULL`). Tuliskan **dua cara** berbeda.
6. Hitung jumlah kota yang **berbeda** pada tabel `customers`.
7. Hitung total stok seluruh produk.
8. Hitung total kuantitas barang terjual pada tabel `order_items`.

---
zoom: 0.75
---

# Lembar Kerja 1 · B. Menengah (9–15)

9. Hitung total ongkos kirim (`shipping_fee`) dari pesanan `selesai`. Pastikan hasilnya **0, bukan `NULL`**, jika tidak ada data.
10. Hitung rata-rata harga produk kategori Camilan (`category_id = 4`), dibulatkan tanpa desimal.
11. Hitung rata-rata `rating` seluruh produk. 💬 Berapa produk yang ikut dihitung, dan mengapa tidak 12?
12. Tampilkan harga termurah dan termahal produk kategori Peralatan (`category_id = 3`) dalam satu query.
13. Tampilkan tanggal pesanan **pertama** dan **terakhir** khusus pesanan `selesai`.
14. Hitung rata-rata `shipping_fee` seluruh pesanan dengan dua cara: (a) apa adanya, (b) `NULL` dianggap 0. 💬 Mengapa hasilnya berbeda?
15. Hitung jumlah produk yang **belum memiliki rating**.

---
zoom: 0.75
---

# Lembar Kerja 1 · C. Menantang (16–20)

16. Hitung **nilai stok** (stok × harga) untuk seluruh produk kategori Kopi.
17. Buat ringkasan produk yang stoknya tersedia (`stock > 0`) dalam satu query: jumlah produk, rata-rata harga (dibulatkan), harga termurah, harga termahal, dan total stok.
18. Hitung total nilai penjualan (`quantity * unit_price`) untuk Kopi Arabika Gayo (`product_id = 1`) pada `order_items`. 💬 Mengapa hasilnya tidak sama dengan `total kuantitas × harga katalog saat ini`?
19. Tampilkan **nama** dan harga produk termahal **tanpa** menulis `SELECT name, MAX(price)`. 💬 Jelaskan mengapa penulisan tersebut bermasalah.
20. Dalam **satu query**, tampilkan: jumlah pelanggan, jumlah kota unik, tanggal bergabung pelanggan terlama, dan terbaru. 💬 Mengapa `COUNT(city)` tidak sama dengan `COUNT(*)` pada data ini?

---
layout: section
---

# PERTEMUAN 2

`GROUP BY` · `HAVING` · `CASE WHEN` · Laporan Bisnis

---
zoom: 0.8
---

# Rencana Waktu Pertemuan 2 (240 menit)

| Menit | Kegiatan |
|---|---|
| 0–10 | Pemanasan: ulas Pertemuan 1 |
| 10–60 | `GROUP BY` |
| 60–100 | `HAVING` dan urutan eksekusi |
| 100–110 | Istirahat |
| 110–145 | *Conditional aggregation* (`CASE WHEN`) |
| 145–170 | Agregat bertingkat dengan CTE |
| 170–190 | Praktik industri |
| 190–240 | Lembar Kerja 2 |

> Minggu ini setiap query hanya memakai **satu tabel**.

---
zoom: 0.85
---

# Pemanasan (10 menit)

Pastikan database `kopikita` masih lengkap:

```sql
SELECT COUNT(*) AS jumlah_pesanan FROM orders;                               -- 15
SELECT SUM(quantity * unit_price) AS total_nilai_penjualan FROM order_items; -- 3385000
```

Jawab dari ingatan:

1. Apa beda `COUNT(*)` dan `COUNT(kolom)`?
2. Apa hasil `SUM` jika tidak ada baris yang cocok?
3. Fungsi agregat tanpa `GROUP BY` menghasilkan berapa baris?

> Hari ini: dari *"satu angka untuk seluruh tabel"* menjadi *"satu angka untuk setiap kelompok"*.

---
layout: section
---

# GROUP BY

Meringkas per kelompok

---
zoom: 0.9
---

# Satu Angka per Kelompok

Pertanyaan pemilik toko: *"Berapa pesanan per status?"*

```
orders (15 baris)
  ├─ selesai    → 10 baris ──► COUNT → 10
  ├─ dikirim    →  3 baris ──► COUNT →  3
  ├─ menunggu   →  1 baris ──► COUNT →  1
  └─ dibatalkan →  1 baris ──► COUNT →  1
```

- `COUNT(*)` biasa: **satu** angka untuk seluruh tabel
- `GROUP BY`: **satu angka per kelompok**

---
zoom: 0.8
---

# `GROUP BY` Satu Kolom

```sql
SELECT status, COUNT(*) AS jumlah_pesanan
FROM orders
GROUP BY status
ORDER BY jumlah_pesanan DESC;
```

| status | jumlah_pesanan |
|---|---|
| selesai | 10 |
| dikirim | 3 |
| menunggu | 1 |
| dibatalkan | 1 |

---
zoom: 0.9
---

# Aturan Emas `GROUP BY`

> Setiap kolom di `SELECT` harus **(a)** ada di `GROUP BY`, atau **(b)** dibungkus fungsi agregat.

```sql
SELECT status, COUNT(*) FROM orders;   -- ❌ error: status tidak ada di GROUP BY
```

```sql
SELECT status, COUNT(*) FROM orders GROUP BY status;   -- ✅
```

---
zoom: 0.75
---

# `NULL` Menjadi Kelompoknya Sendiri

```sql
SELECT city, COUNT(*) AS jumlah_pelanggan
FROM customers GROUP BY city ORDER BY jumlah_pelanggan DESC;
```

| city | jumlah_pelanggan |
|---|---|
| Jember | 4 |
| Surabaya | 2 |
| Malang | 2 |
| Banyuwangi | 1 |
| NULL | 1 |

Agar laporan ramah dibaca:

```sql
SELECT COALESCE(city, 'Tidak diketahui') AS kota, COUNT(*) AS jumlah_pelanggan
FROM customers GROUP BY COALESCE(city, 'Tidak diketahui');
```

---
zoom: 0.75
---

# Banyak Agregat per Kelompok

```sql
SELECT category_id, COUNT(*) AS jumlah_produk, ROUND(AVG(price), 0) AS rata2_harga,
       MIN(price) AS termurah, MAX(price) AS termahal
FROM products
GROUP BY category_id;
```

| category_id | jumlah_produk | rata2_harga | termurah | termahal |
|---|---|---|---|---|
| 1 | 3 | 78333 | 55000 | 95000 |
| 2 | 3 | 40000 | 35000 | 45000 |
| 3 | 3 | 181667 | 120000 | 250000 |
| 4 | 3 | 34333 | 25000 | 48000 |

`category_id`: 1 = Kopi, 2 = Teh, 3 = Peralatan, 4 = Camilan

---
zoom: 0.75
---

# Barang Terjual per Produk

```sql
SELECT product_id, SUM(quantity) AS total_terjual,
       SUM(quantity * unit_price) AS nilai_penjualan
FROM order_items
GROUP BY product_id
ORDER BY total_terjual DESC, product_id;
```

| product_id | total_terjual | nilai_penjualan |
|---|---|---|
| 10 | 10 | 250000 |
| 5 | 7 | 245000 |
| 1 | 6 | 500000 |
| 2 | 5 | 260000 |
| … | … | … *(12 baris semuanya)* |

💡 `ORDER BY total_terjual DESC, product_id` memberi **pembeda kedua** agar urutan selalu konsisten.

---
zoom: 0.85
---

# `GROUP BY` pada Ekspresi: Per Bulan

```sql
SELECT DATE_FORMAT(order_date, '%Y-%m') AS bulan,
       COUNT(*) AS jumlah_pesanan
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY bulan;
```

| bulan | jumlah_pesanan |
|---|---|
| 2026-07 | 3 |
| 2026-08 | 4 |
| 2026-09 | 3 |
| 2026-10 | 5 |

🌐 PostgreSQL: `DATE_FORMAT(x, '%Y-%m')` diganti `TO_CHAR(x, 'YYYY-MM')`.

---
zoom: 0.8
---

# Per Bulan, Hanya Pesanan Selesai

```sql
SELECT DATE_FORMAT(order_date, '%Y-%m')  AS bulan,
       COUNT(*)                          AS pesanan_selesai,
       COALESCE(SUM(shipping_fee), 0)    AS total_ongkir
FROM orders
WHERE status = 'selesai'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY bulan;
```

| bulan | pesanan_selesai | total_ongkir |
|---|---|---|
| 2026-07 | 3 | 35000 |
| 2026-08 | 3 | 35000 |
| 2026-09 | 2 | 35000 |
| 2026-10 | 2 | 25000 |

---
zoom: 0.85
---

# `GROUP BY` Lebih dari Satu Kolom

```sql
SELECT status, DATE_FORMAT(order_date, '%Y-%m') AS bulan, COUNT(*) AS jumlah
FROM orders
GROUP BY status, DATE_FORMAT(order_date, '%Y-%m')
ORDER BY bulan, status;
```

Setiap **kombinasi unik** `(status, bulan)` menjadi satu kelompok.

🧪 **Coba sendiri:** tampilkan total stok per `category_id`, urut dari stok terbesar.

<v-click>

*Jawaban:* kategori 4 → 275, kategori 2 → 180, kategori 1 → 125, kategori 3 → 35

</v-click>

---
layout: section
---

# HAVING

Menyaring kelompok

---
zoom: 0.85
---

# `WHERE` Tidak Bisa Memakai Agregat

```sql
SELECT city, COUNT(*) FROM customers
WHERE COUNT(*) >= 2        -- ❌ ERROR: agregat tidak boleh di WHERE
GROUP BY city;
```

Jawabannya `HAVING`:

```sql
SELECT city, COUNT(*) AS jumlah_pelanggan
FROM customers
GROUP BY city
HAVING COUNT(*) >= 2;
```

| city | jumlah_pelanggan |
|---|---|
| Jember | 4 |
| Surabaya | 2 |
| Malang | 2 |

---
layout: two-cols
zoom: 0.85
---

# `WHERE` vs `HAVING`

| | `WHERE` | `HAVING` |
|---|---|---|
| Menyaring | **Baris** | **Kelompok** |
| Berjalan | **Sebelum** `GROUP BY` | **Sesudah** `GROUP BY` |
| Pakai agregat? | ❌ | ✅ |

::right::

<div class="pl-6 pt-2">

### Urutan eksekusi

| Ditulis | Diproses |
|---|---|
| `SELECT` | 5️⃣ |
| `FROM` | 1️⃣ |
| `WHERE` | 2️⃣ |
| `GROUP BY` | 3️⃣ |
| `HAVING` | 4️⃣ |
| `ORDER BY` | 6️⃣ |
| `LIMIT` | 7️⃣ |

</div>

---
zoom: 0.85
---

# `WHERE` dan `HAVING` Bersama

Kategori dengan **minimal 3 produk berstok** (stok > 0):

```sql
SELECT category_id, COUNT(*) AS produk_berstok
FROM products
WHERE stock > 0
GROUP BY category_id
HAVING COUNT(*) >= 3;
```

| category_id | produk_berstok |
|---|---|
| 1 | 3 |
| 4 | 3 |

1. `WHERE` membuang produk yang stoknya habis
2. Sisanya dikelompokkan
3. `HAVING` menyisakan kelompok dengan minimal 3 produk

---
zoom: 0.8
---

# `HAVING` pada Hasil Ekspresi

Pesanan dengan **nilai total ≥ 300.000**:

```sql
SELECT order_id, SUM(quantity * unit_price) AS nilai_pesanan
FROM order_items
GROUP BY order_id
HAVING SUM(quantity * unit_price) >= 300000
ORDER BY nilai_pesanan DESC;
```

| order_id | nilai_pesanan |
|---|---|
| 12 | 446000 |
| 8 | 310000 |
| 10 | 305000 |

---
zoom: 0.75
---

# Pelanggan dengan Minimal 2 Pesanan

```sql
SELECT customer_id, COUNT(*) AS jumlah_pesanan, MAX(order_date) AS pesanan_terakhir
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 2
ORDER BY jumlah_pesanan DESC, customer_id;
```

| customer_id | jumlah_pesanan | pesanan_terakhir |
|---|---|---|
| 1 | 3 | 2026-10-01 |
| 2 | 3 | 2026-10-18 |
| 3 | 2 | 2026-09-15 |
| 4 | 2 | 2026-10-12 |
| 6 | 2 | 2026-10-15 |

---
zoom: 0.9
---

# 🏭 Aturan Praktis: `WHERE` Dulu, `HAVING` Seperlunya

Filter yang **bisa** dilakukan dengan `WHERE`, lakukan dengan `WHERE`.

- Menyaring lebih awal = lebih sedikit baris yang harus dikelompokkan = **lebih cepat**
- Simpan `HAVING` hanya untuk kondisi yang butuh hasil agregat

🧪 **Coba sendiri:** tampilkan `product_id` yang total terjualnya **minimal 6 unit**.

<v-click>

*Jawaban:* produk 10 → 10, produk 5 → 7, produk 1 → 6

</v-click>

---
layout: section
---

# CASE WHEN

*Conditional aggregation*

---
zoom: 0.8
---

# Ringkasan Status dalam Satu Baris

`CASE WHEN kondisi THEN nilai_a ELSE nilai_b END` adalah "jika-maka" di SQL.

```sql
SELECT
  COUNT(*)                                               AS total,
  SUM(CASE WHEN status = 'selesai'    THEN 1 ELSE 0 END) AS selesai,
  SUM(CASE WHEN status = 'dikirim'    THEN 1 ELSE 0 END) AS dikirim,
  SUM(CASE WHEN status = 'menunggu'   THEN 1 ELSE 0 END) AS menunggu,
  SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) AS dibatalkan
FROM orders;
```

| total | selesai | dikirim | menunggu | dibatalkan |
|---|---|---|---|---|
| 15 | 10 | 3 | 1 | 1 |

---
zoom: 0.9
---

# Cara Membaca `SUM(CASE WHEN ...)`

1. `CASE WHEN` mengubah setiap baris menjadi **1** (cocok) atau **0** (tidak)
2. `SUM` menjumlahkan angka itu
3. Hasilnya sama dengan menghitung "berapa yang cocok"

🏭 Teknik ini umum di laporan produksi: **satu kali baca tabel** menghasilkan banyak kolom, jauh lebih efisien daripada empat query terpisah.

---
zoom: 0.75
---

# Laporan Status per Bulan

```sql
SELECT DATE_FORMAT(order_date, '%Y-%m') AS bulan,
  SUM(CASE WHEN status = 'selesai'    THEN 1 ELSE 0 END) AS selesai,
  SUM(CASE WHEN status = 'dikirim'    THEN 1 ELSE 0 END) AS dikirim,
  SUM(CASE WHEN status = 'menunggu'   THEN 1 ELSE 0 END) AS menunggu,
  SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) AS dibatalkan,
  COUNT(*) AS total
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY bulan;
```

| bulan | selesai | dikirim | menunggu | dibatalkan | total |
|---|---|---|---|---|---|
| 2026-07 | 3 | 0 | 0 | 0 | 3 |
| 2026-08 | 3 | 0 | 0 | 1 | 4 |
| 2026-09 | 2 | 1 | 0 | 0 | 3 |
| 2026-10 | 2 | 2 | 1 | 0 | 5 |

---
zoom: 0.75
---

# `CASE WHEN` di dalam `GROUP BY`: Segmentasi Harga

```sql
SELECT CASE WHEN price < 50000  THEN 'Murah'
            WHEN price < 150000 THEN 'Menengah'
            ELSE 'Premium' END   AS segmen,
       COUNT(*)                  AS jumlah_produk,
       ROUND(AVG(price), 0)      AS rata2_harga
FROM products
GROUP BY CASE WHEN price < 50000  THEN 'Murah'
              WHEN price < 150000 THEN 'Menengah'
              ELSE 'Premium' END;
```

| segmen | jumlah_produk | rata2_harga |
|---|---|---|
| Murah | 6 | 37167 |
| Menengah | 4 | 88750 |
| Premium | 2 | 212500 |

---
zoom: 0.9
---

# 🧪 Coba Sendiri: Periode Bergabung

Hitung jumlah pelanggan per **periode bergabung**:

- **"2025"** untuk `joined_at` sebelum `2026-01-01`
- **"2026"** untuk selebihnya

<v-click>

*Jawaban:* 2025 → 2 pelanggan, 2026 → 8 pelanggan

</v-click>

---
layout: section
---

# CTE

Agregat bertingkat

---
zoom: 0.9
---

# Rata-rata Nilai per Pesanan (AOV)

*AOV = Average Order Value*, metrik wajib toko online.

`AVG(SUM(...))` tidak bisa langsung ditulis. Hitung dulu total **per pesanan**, baru rata-ratakan:

1. **Langkah 1:** agregasi di level **pesanan** (CTE)
2. **Langkah 2:** agregasi di level **toko** (query utama)

CTE dibuat dengan `WITH nama AS ( ... )` agar langkah bertingkat rapi dan mudah dibaca.

---
zoom: 0.75
---

# AOV dengan CTE

```sql
WITH nilai_pesanan AS (
  SELECT order_id, SUM(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT COUNT(*)          AS jumlah_pesanan,
       ROUND(AVG(total)) AS aov,
       MIN(total)        AS pesanan_terkecil,
       MAX(total)        AS pesanan_terbesar,
       SUM(total)        AS total_nilai
FROM nilai_pesanan;
```

| jumlah_pesanan | aov | pesanan_terkecil | pesanan_terbesar | total_nilai |
|---|---|---|---|---|
| 15 | 225667 | 80000 | 446000 | 3385000 |

---
zoom: 0.9
---

# ✅ Cek Silang

`total_nilai` (3.385.000) sama dengan `SUM(quantity * unit_price)` dari `order_items` saat pemanasan.

Mengecek silang antar-query adalah kebiasaan analis yang baik.

> 📝 Angka ini mencakup **semua status** pesanan, karena kolom `status` ada di tabel `orders`, bukan `order_items`. Menyaring berdasarkan status akan dibahas pada materi berikutnya.

---
layout: section
---

# 🏭 Praktik Industri

Pertemuan 2

---
zoom: 0.8
---

# Filter Tanggal yang Efisien (*Sargable*)

❌ Fungsi pada kolom membuat indeks tidak terpakai:

```sql
SELECT COUNT(*) FROM orders
WHERE YEAR(order_date) = 2026 AND MONTH(order_date) = 9;
```

✅ Pola industri: **rentang tanggal** (batas bawah termasuk, batas atas tidak):

```sql
SELECT COUNT(*) AS pesanan_september
FROM orders
WHERE order_date >= '2026-09-01' AND order_date < '2026-10-01';   -- 3
```

Aman juga untuk kolom `DATETIME`: tidak ada jam 23:59:59 yang terlewat.

---
zoom: 0.8
---

# Indeks Mendukung Agregasi

Pada tabel besar, agregat tanpa indeks = membaca seluruh tabel.

```sql
CREATE INDEX idx_orders_status_date ON orders (status, order_date);
```

Periksa dengan `EXPLAIN`:

```sql
EXPLAIN
SELECT COUNT(*) FROM orders
WHERE status = 'selesai'
  AND order_date >= '2026-09-01' AND order_date < '2026-10-01';
```

Perhatikan kolom `key`: jika terisi `idx_orders_status_date`, indeks dipakai. Pada data kecil MySQL kadang tetap memilih *full scan*, dan itu wajar.

---
zoom: 0.8
---

# Satu Definisi Bisnis, Satu Tempat

"Pesanan sukses" = status **`selesai`**. Jika dua tim memakai definisi berbeda, dua dashboard menampilkan dua angka berbeda. Bakukan dalam **VIEW**:

```sql
CREATE VIEW v_pesanan_selesai AS
SELECT order_id, customer_id, order_date, shipping_fee
FROM orders
WHERE status = 'selesai';

SELECT COUNT(*) AS jumlah_pesanan,
       COALESCE(SUM(shipping_fee), 0) AS total_ongkir
FROM v_pesanan_selesai;
```

Hasil: 10 pesanan, total ongkir 130.000.

---
zoom: 0.8
---

# Tabel Ringkasan untuk Data Besar

Agregat atas puluhan juta baris setiap dashboard dibuka itu **lambat**. Jalankan agregasi terjadwal (misal tiap malam), simpan hasilnya di tabel kecil:

```sql
CREATE TABLE daily_orders_summary (
  order_day      DATE PRIMARY KEY,
  total_orders   INT NOT NULL,
  total_shipping DECIMAL(14,2) NOT NULL
);

INSERT INTO daily_orders_summary (order_day, total_orders, total_shipping)
SELECT order_date, COUNT(*), COALESCE(SUM(shipping_fee), 0)
FROM orders WHERE status = 'selesai' GROUP BY order_date;
```

Belum perlu dibuat sekarang. Cukup tahu polanya.

---
zoom: 0.85
---

# Sekilas: *Window Function* dan Daftar Periksa

`GROUP BY` **menciutkan** baris. `OVER (...)` menghitung agregat **sambil mempertahankan** baris (topik lanjutan).

**Daftar periksa sebelum mengirim query agregat:**

- [ ] `NULL` sudah dipertimbangkan? (`COUNT(*)` vs `COUNT(kolom)`, `COALESCE`)
- [ ] Kolom `SELECT` sudah ada di `GROUP BY` atau berupa agregat?
- [ ] Filter di `WHERE` (bukan `HAVING`) bila memungkinkan?
- [ ] Filter tanggal memakai rentang?
- [ ] `ORDER BY` punya pembeda kedua?
- [ ] Alias jelas dan hasil sudah dicek silang?

---
zoom: 0.8
---

# Rangkuman Pertemuan 2

| Konsep | Intinya |
|---|---|
| `GROUP BY` | Satu hasil per kelompok; kolom `SELECT` ada di `GROUP BY` atau berupa agregat |
| `HAVING` | Menyaring **kelompok** (sesudah agregasi); `WHERE` menyaring **baris** (sebelum) |
| `CASE WHEN` | Satu query, banyak kolom ringkasan; bisa untuk segmentasi |
| CTE | Memecah agregasi bertingkat agar mudah dibaca |
| Industri | Rentang tanggal, indeks, `VIEW`, tabel ringkasan |

---
zoom: 0.85
---

# 📝 Lembar Kerja Praktikum 2

`GROUP BY` · `HAVING` · `CASE WHEN` · Laporan · **20 soal**

- Gunakan database `kopikita`. Kerjakan **mandiri**
- Setiap soal cukup memakai **satu tabel**
- Tulis **query** dan **hasilnya**, beri alias yang bermakna
- Soal 💬 meminta penjelasan singkat
- Soal 17–20 menantang, kerjakan terakhir

| Bagian | Soal |
|---|---|
| A. `GROUP BY` dan `HAVING` | 1–8 |
| B. `WHERE` vs `HAVING` | 9–11 |
| C. Laporan per waktu dan `CASE WHEN` | 12–16 |
| D. Menantang | 17–20 |

---
zoom: 0.8
---

# Lembar Kerja 2 · A. `GROUP BY` dan `HAVING` (1–8)

1. Tampilkan jumlah produk per `category_id`.
2. Tampilkan jumlah pelanggan per kota, urut dari terbanyak. Tampilkan kota `NULL` sebagai **"Tidak diketahui"**.
3. Tampilkan jumlah pesanan per status, urut dari terbanyak.
4. Tampilkan **total stok** per `category_id`, urut dari stok terbesar.
5. Tampilkan rata-rata harga per `category_id` (dibulatkan), urut dari tertinggi.
6. Tampilkan total kuantitas terjual per `product_id` pada `order_items`, urut dari terbanyak.
7. Tampilkan kota yang memiliki **minimal 2 pelanggan**, beserta jumlahnya.
8. Tampilkan `product_id` yang total terjualnya **lebih dari 5 unit**, urut dari terbanyak.

---
zoom: 0.8
---

# Lembar Kerja 2 · B dan C (9–12)

9. Tampilkan `category_id` yang memiliki **minimal 3 produk dengan stok > 0**, beserta jumlahnya. 💬 Bagian mana yang kamu letakkan di `WHERE` dan mana di `HAVING`? Mengapa?
10. Tampilkan `customer_id` yang memiliki **minimal 2 pesanan berstatus `selesai`**, beserta jumlah pesanannya.
11. Tampilkan total ongkir per status, hanya untuk status yang total ongkirnya **lebih dari 50.000**. Pastikan hasil tidak `NULL`.
12. Tampilkan per bulan: jumlah pesanan dan total ongkir, khusus pesanan `selesai`.

---
zoom: 0.8
---

# Lembar Kerja 2 · C. Laporan dan `CASE WHEN` (13–16)

13. Tampilkan jumlah pelanggan yang bergabung per bulan (`joined_at`).
14. Buat laporan per bulan dengan kolom `bulan`, `selesai`, `dikirim`, `dibatalkan`, `menunggu` (jumlah pesanan per status, memakai `CASE WHEN`).
15. Kelompokkan produk menjadi tiga segmen harga: **Murah** (< 50.000), **Menengah** (50.000 sampai kurang dari 150.000), **Premium** (≥ 150.000). Tampilkan jumlah produk dan total stok tiap segmen.
16. Pada `order_items`, tampilkan per `order_id`: jumlah baris item dan total kuantitas, hanya untuk pesanan dengan **total kuantitas ≥ 5**.

---
zoom: 0.75
---

# Lembar Kerja 2 · D. Menantang (17–20)

17. Dengan CTE, hitung nilai total per pesanan dari `order_items`, lalu tampilkan jumlah pesanan, nilai rata-rata (dibulatkan), nilai terkecil, dan nilai terbesar.
18. Dengan CTE, hitung berapa **pesanan yang nilainya di atas rata-rata**. *Petunjuk: bandingkan `total` dengan `(SELECT AVG(total) FROM nama_cte)`.*
19. Seorang rekan menulis `WHERE MONTH(order_date) = 9 AND YEAR(order_date) = 2026`. (a) Tulis ulang sebagai filter rentang tanggal untuk menampilkan jumlah pesanan **per status** pada September 2026. 💬 Mengapa versi rentang lebih baik? (b) Tulis `CREATE INDEX` yang mendukung query tersebut.
20. **Mini-laporan pesanan Oktober 2026** dalam satu query: total pesanan, jumlah per status, total ongkir pesanan `selesai` (tidak boleh `NULL`), serta tanggal pesanan pertama dan terakhir. 💬 Sebutkan satu alasan mengapa definisi "pesanan selesai" sebaiknya dibakukan dalam `VIEW`.

---
layout: end
---

# Thank you
