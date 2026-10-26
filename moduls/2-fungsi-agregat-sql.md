# Panduan Praktikum Workshop Basis Data
## Fungsi Agregat SQL: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`

> **Durasi:** 2 pertemuan × 4 jam  
> **Studi kasus:** **KopiKita**, toko online kopi, teh, peralatan seduh, dan camilan  
> **Prasyarat:** sudah memahami `SELECT`, `WHERE`, `LIKE`, operator, dan `ORDER BY`

---

## Tujuan Pembelajaran

Setelah menyelesaikan dua pertemuan ini, kamu mampu:

1. Menjelaskan apa itu fungsi agregat dan kapan menggunakannya.
2. Menggunakan `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` dengan benar.
3. Memahami perilaku `NULL` pada fungsi agregat.
4. Mengelompokkan data dengan `GROUP BY`, menyaring kelompok dengan `HAVING`, dan memakai `CASE WHEN` di dalam agregat.
5. Membuat laporan ringkasan bisnis dari satu tabel: per bulan, per status, dan per segmen.
6. Menerapkan praktik yang dipakai di industri: penanganan `NULL`, tipe data uang, filter tanggal yang efisien, dan definisi metrik yang konsisten.

## Alat yang Dibutuhkan

- **MySQL 8.0+** atau **MariaDB 10.6+** (query pada modul ini diuji untuk keduanya)
- Klien SQL: MySQL Workbench, DBeaver, phpMyAdmin, atau terminal `mysql`

## Cara Mengikuti Modul

| Simbol | Artinya |
|---|---|
| 🔮 **Prediksi dulu** | Tebak hasilnya di kertas/kepala **sebelum** menjalankan query. |
| 🧪 **Coba sendiri** | Tulis query sendiri, jangan salin-tempel. |
| ⚠️ **Jebakan** | Kesalahan yang sering terjadi pada pemula (dan juga di dunia kerja). |
| 🏭 **Praktik Industri** | Cara yang dipakai tim pengembang profesional. |
| ✅ **Checkpoint** | Cocokkan hasilmu sebelum lanjut. |

> 💡 **Aturan emas praktikum:** ketik sendiri setiap query. Otot jari ikut belajar.

---

# PERTEMUAN 1: Dasar Fungsi Agregat

## Rencana Waktu (240 menit)

| Menit | Kegiatan |
|---|---|
| 0–20 | Bagian 0: Persiapan database KopiKita |
| 20–35 | Bagian 1: Konsep fungsi agregat |
| 35–70 | Bagian 2: `COUNT` |
| 70–95 | Bagian 3: `SUM` |
| 95–125 | Bagian 4: `AVG` |
| 125–145 | Bagian 5: `MIN` dan `MAX` |
| 145–155 | Istirahat |
| 155–180 | Bagian 6: Menggabungkan beberapa agregat |
| 180–200 | Bagian 7: Praktik industri |
| 200–240 | Bagian 8: Lembar Kerja 1 |

---

## Bagian 0: Persiapan Database KopiKita

Kamu bekerja sebagai **data analyst junior** di KopiKita. Pemilik toko ingin tahu: berapa pesanan masuk, berapa omzet, produk mana yang laris, dan pelanggan mana yang paling loyal. Semua jawabannya ada di database, dan kamu akan menggalinya dengan fungsi agregat.

### Struktur tabel

> Hubungan antar tabel digambarkan agar kamu paham isi datanya. **Minggu ini setiap query hanya memakai satu tabel.**

```
categories ──< products ──< order_items >── orders >── customers
```

| Tabel | Isi | Kolom penting |
|---|---|---|
| `categories` | Kategori produk | `category_id`, `name` |
| `products` | Katalog produk | `price`, `stock`, `rating` (boleh `NULL`) |
| `customers` | Pelanggan | `city` (boleh `NULL`), `joined_at` |
| `orders` | Header pesanan | `order_date`, `status`, `shipping_fee` (boleh `NULL`) |
| `order_items` | Rincian barang per pesanan | `quantity`, `unit_price` |

**Status pesanan:** `menunggu`, `dikirim`, `selesai`, `dibatalkan`.

### Langkah 1: Buat database

```sql
CREATE DATABASE kopikita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kopikita;
```

### Langkah 2: Buat tabel

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

### Langkah 3: Isi data

```sql
INSERT INTO categories VALUES
(1,'Kopi'),(2,'Teh'),(3,'Peralatan'),(4,'Camilan'),(5,'Merchandise');

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

INSERT INTO order_items VALUES
(1,1,1,2,80000),(2,1,5,1,35000),
(3,2,7,1,250000),
(4,3,2,3,50000),(5,3,10,2,25000),
(6,4,4,2,45000),(7,4,5,2,35000),
(8,5,3,1,95000),
(9,6,8,1,175000),(10,6,1,1,85000),
(11,7,2,1,55000),(12,7,12,3,48000),
(13,8,9,1,120000),(14,8,3,2,95000),
(15,9,1,1,85000),(16,9,11,2,30000),
(17,10,7,1,250000),(18,10,2,1,55000),
(19,11,4,3,45000),(20,11,10,5,25000),
(21,12,8,2,175000),(22,12,12,2,48000),
(23,13,6,2,40000),
(24,14,1,2,85000),(25,14,3,1,95000),
(26,15,5,4,35000),(27,15,10,3,25000);
```

### ✅ Checkpoint 0

Jalankan, lalu pastikan jumlah barisnya cocok:

```sql
SELECT COUNT(*) FROM categories;    -- 5
SELECT COUNT(*) FROM products;      -- 12
SELECT COUNT(*) FROM customers;     -- 10
SELECT COUNT(*) FROM orders;        -- 15
SELECT COUNT(*) FROM order_items;   -- 27
```

Kalau ada yang tidak cocok, ulangi langkah 3 untuk tabel tersebut sebelum lanjut. Ya, `COUNT(*)` baru saja kamu pakai: itu fungsi agregat pertamamu.

> 📝 **Catatan penting:** kolom `unit_price` di `order_items` menyimpan **harga saat transaksi terjadi**. Perhatikan, pesanan #1 membeli Kopi Arabika seharga 80.000, sedangkan harga di katalog sekarang 85.000. Kenapa begini? Jawabannya ada di Bagian 7.

---

## Bagian 1: Apa Itu Fungsi Agregat?

Query biasa mengembalikan **banyak baris**. Fungsi agregat **meringkas banyak baris menjadi satu nilai**.

```
Banyak baris  ──►  [ fungsi agregat ]  ──►  1 nilai
```

| Fungsi | Pertanyaan yang dijawab | Contoh di KopiKita |
|---|---|---|
| `COUNT` | Berapa banyak? | Jumlah pesanan |
| `SUM` | Berapa totalnya? | Total omzet |
| `AVG` | Berapa rata-ratanya? | Rata-rata harga produk |
| `MIN` | Berapa yang terkecil/terawal? | Produk termurah |
| `MAX` | Berapa yang terbesar/terakhir? | Tanggal pesanan terbaru |

**Tiga aturan dasar yang harus kamu ingat:**

1. Hasil fungsi agregat (tanpa `GROUP BY`) selalu **satu baris**.
2. Fungsi agregat **mengabaikan nilai `NULL`** (kecuali `COUNT(*)`).
3. `WHERE` bekerja **sebelum** agregasi: baris disaring dulu, baru diringkas.

---

## Bagian 2: `COUNT`: Menghitung Baris

### 2.1 `COUNT(*)`: hitung semua baris

```sql
SELECT COUNT(*) FROM orders;
```

| COUNT(*) |
|---|
| 15 |

Beri **alias** agar kolom hasil mudah dibaca:

```sql
SELECT COUNT(*) AS total_pesanan FROM orders;
```

### 2.2 `COUNT(*)` + `WHERE`

```sql
SELECT COUNT(*) AS pesanan_selesai
FROM orders
WHERE status = 'selesai';
```

Hasil: **10**. Urutan kerjanya: MySQL menyaring baris berstatus `selesai` dulu, baru menghitung.

🧪 **Coba sendiri:** berapa produk yang stoknya habis (`stock = 0`)? *(Jawaban: 2)*

### 2.3 `COUNT(kolom)`: hanya menghitung yang **tidak NULL**

🔮 **Prediksi dulu:** tabel `customers` punya 10 baris, tapi ada satu pelanggan (Eko) yang kotanya `NULL`. Menurutmu hasil query ini berapa?

```sql
SELECT
  COUNT(*)    AS semua_baris,
  COUNT(city) AS kota_terisi
FROM customers;
```

| semua_baris | kota_terisi |
|---|---|
| 10 | 9 |

⚠️ **Jebakan:** `COUNT(*)` menghitung baris, sedangkan `COUNT(kolom)` menghitung **nilai yang terisi**. Keduanya bisa berbeda, dan memilih yang salah akan membuat laporan keliru tanpa pesan error.

### 2.4 `COUNT(DISTINCT kolom)`: hitung nilai unik

```sql
SELECT COUNT(DISTINCT city) AS jumlah_kota FROM customers;
```

Hasil: **4** (Jember, Surabaya, Malang, Banyuwangi; `NULL` tidak dihitung).

```sql
SELECT COUNT(DISTINCT customer_id) AS pelanggan_yang_pernah_order FROM orders;
```

Hasil: **8**. Dari 10 pelanggan, hanya 8 yang pernah memesan.

### Ringkasan `COUNT`

| Bentuk | Menghitung | `NULL`? |
|---|---|---|
| `COUNT(*)` | Semua baris | Ikut dihitung |
| `COUNT(kolom)` | Baris dengan kolom terisi | Diabaikan |
| `COUNT(DISTINCT kolom)` | Nilai unik yang terisi | Diabaikan |

---

## Bagian 3: `SUM`: Menjumlahkan

### 3.1 `SUM` pada satu kolom

```sql
SELECT SUM(stock) AS total_stok FROM products;
```

Hasil: **615**.

```sql
SELECT SUM(quantity) AS total_barang_terjual FROM order_items;
```

Hasil: **52**.

### 3.2 `SUM` pada ekspresi

Kamu boleh menghitung dulu per baris, baru dijumlahkan. Total nilai penjualan = jumlah barang × harga:

```sql
SELECT SUM(quantity * unit_price) AS total_nilai_penjualan
FROM order_items;
```

Hasil: **3.385.000**.

Nilai stok di gudang (stok × harga katalog):

```sql
SELECT SUM(stock * price) AS nilai_stok FROM products;
```

Hasil: **31.555.000**.

> Angka di atas mencakup **semua** pesanan, termasuk yang dibatalkan, karena `status` berada di tabel `orders`, bukan `order_items`. Untuk saat ini, itu tidak masalah.

### 3.3 `SUM` + `WHERE` dan penanganan `NULL`

```sql
SELECT SUM(shipping_fee) AS total_ongkir
FROM orders
WHERE status = 'selesai';
```

Hasil: **130.000**. Ada 10 pesanan selesai, tetapi hanya 7 yang ongkirnya terisi. Sisanya `NULL` dan diabaikan.

⚠️ **Jebakan:** bagaimana kalau tidak ada baris yang cocok?

```sql
SELECT SUM(shipping_fee) FROM orders WHERE status = 'ditolak';
```

Hasilnya **`NULL`**, bukan 0. Padahal di laporan atau aplikasi, kamu biasanya ingin angka 0. Gunakan `COALESCE`:

```sql
SELECT COALESCE(SUM(shipping_fee), 0) AS total_ongkir
FROM orders
WHERE status = 'ditolak';
```

Hasil: **0**. `COALESCE(a, b)` artinya "pakai `a`; kalau `a` NULL, pakai `b`".

---

## Bagian 4: `AVG`: Rata-rata

### 4.1 `AVG` dasar

```sql
SELECT AVG(price) AS rata_rata_harga FROM products;
```

Hasil: ± **83.583,33**. Rapikan dengan `ROUND(nilai, jumlah_desimal)`:

```sql
SELECT ROUND(AVG(price), 0) AS rata_rata_harga FROM products;
```

Hasil: **83.583**.

### 4.2 `AVG` mengabaikan `NULL`: ini penting!

Tiga produk belum punya rating (`NULL`). Sekarang bandingkan dua cara menghitung rata-rata:

🔮 **Prediksi dulu:** apakah dua angka ini sama?

```sql
SELECT
  AVG(rating)                 AS cara_1,
  SUM(rating) / COUNT(*)      AS cara_2,
  SUM(rating) / COUNT(rating) AS cara_3,
  COUNT(rating)               AS produk_berating
FROM products;
```

| cara_1 | cara_2 | cara_3 | produk_berating |
|---|---|---|---|
| 4.4 | 3.3 | 4.4 | 9 |

`AVG(rating)` membagi dengan **9** (hanya baris yang terisi), bukan 12. Cara 2 salah karena `COUNT(*)` ikut menghitung produk tanpa rating.

⚠️ **Jebakan:** "rata-rata" bergantung pada **apa yang dianggap sebagai pembagi**. Tanyakan ke diri sendiri: *NULL di sini berarti "tidak diketahui" atau "nol"?*

| Makna `NULL` | Perlakuan |
|---|---|
| Tidak diketahui (rating belum ada) | Biarkan, `AVG` mengabaikannya |
| Sebenarnya nol (ongkir gratis) | Ubah jadi 0 dengan `COALESCE` |

Contohnya ongkir. `NULL` pada `shipping_fee` berarti gratis ongkir:

```sql
SELECT
  AVG(shipping_fee)              AS rata2_tanpa_null,   -- 18.416,67
  AVG(COALESCE(shipping_fee, 0)) AS rata2_null_jadi_nol -- 14.733,33
FROM orders;
```

Dua angka, dua makna bisnis berbeda. Kamu yang menentukan mana yang benar, bukan MySQL.

### 4.3 `AVG` + `WHERE`

```sql
SELECT ROUND(AVG(price), 0) AS rata2_harga_ready
FROM products
WHERE stock > 0;
```

Hasil: **84.300**.

🧪 **Coba sendiri:** berapa rata-rata harga produk kategori Kopi (`category_id = 1`)? *(Jawaban ≈ 78.333)*

---

## Bagian 5: `MIN` dan `MAX`

### 5.1 Pada angka

```sql
SELECT MIN(price) AS termurah, MAX(price) AS termahal FROM products;
```

| termurah | termahal |
|---|---|
| 25000 | 250000 |

### 5.2 Pada tanggal

```sql
SELECT
  MIN(order_date) AS pesanan_pertama,
  MAX(order_date) AS pesanan_terakhir
FROM orders;
```

| pesanan_pertama | pesanan_terakhir |
|---|---|
| 2026-07-05 | 2026-10-18 |

Pada tanggal, `MIN` berarti **terawal** dan `MAX` berarti **terakhir**.

### 5.3 Pada teks

```sql
SELECT MIN(name) AS pertama_abjad, MAX(name) AS terakhir_abjad FROM products;
```

Hasil: `Coffee Grinder Manual` dan `Teh Melati`. Teks diurutkan menurut abjad.

### 5.4 ⚠️ Jebakan: "Siapa" produk termahal?

Kamu mungkin tergoda menulis:

```sql
SELECT name, MAX(price) FROM products;   -- ❌ SALAH / tidak konsisten
```

Query ini bermasalah. `MAX(price)` menghasilkan satu nilai, sedangkan `name` punya 12 kemungkinan. Di MySQL modern dengan mode default (`ONLY_FULL_GROUP_BY`) query ini **error**. Di setting lama, ia bisa menampilkan nama yang **tidak cocok** dengan harganya, dan itu lebih berbahaya.

Cara yang benar:

```sql
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 1;
```

Hasil: `Coffee Grinder Manual | 250000`. Ada cara lain untuk kasus ini (subquery) yang akan dibahas pada materi lanjutan.

---

## Bagian 6: Menggabungkan Beberapa Agregat

Satu query boleh memuat banyak fungsi agregat sekaligus. Ini kebiasaan yang bagus: **satu kali baca tabel, banyak jawaban**.

### Studi kasus: Ringkasan Katalog KopiKita

```sql
SELECT
  COUNT(*)                AS jumlah_produk,
  SUM(stock)              AS total_stok,
  ROUND(AVG(price), 0)    AS rata2_harga,
  MIN(price)              AS harga_min,
  MAX(price)              AS harga_max
FROM products;
```

| jumlah_produk | total_stok | rata2_harga | harga_min | harga_max |
|---|---|---|---|---|
| 12 | 615 | 83583 | 25000 | 250000 |

### Dengan filter: Ringkasan Kategori Kopi

```sql
SELECT
  COUNT(*)             AS jumlah_produk,
  ROUND(AVG(price), 0) AS rata2_harga,
  MIN(price)           AS harga_min,
  MAX(price)           AS harga_max
FROM products
WHERE category_id = 1;
```

| jumlah_produk | rata2_harga | harga_min | harga_max |
|---|---|---|---|
| 3 | 78333 | 55000 | 95000 |

### Ringkasan Pelanggan

```sql
SELECT
  COUNT(*)         AS total_pelanggan,
  COUNT(city)      AS punya_kota,
  MIN(joined_at)   AS pelanggan_terlama,
  MAX(joined_at)   AS pelanggan_terbaru
FROM customers;
```

🧪 **Coba sendiri:** buat ringkasan `orders`: jumlah pesanan, jumlah pelanggan unik yang memesan, tanggal pesanan pertama dan terakhir, dalam **satu** query.

---

## Bagian 7: 🏭 Praktik Industri

Ini bagian yang membedakan query "asal jalan" dengan query "siap produksi".

### 7.1 Hitung di database, bukan di aplikasi

❌ **Pola yang salah (sering dilakukan pemula):** ambil semua data ke aplikasi, lalu hitung dengan loop.

```php
// Laravel: SALAH. Menarik ribuan baris ke memori hanya untuk menghitung
$orders = Order::all();
$total = count($orders);
```

✅ **Pola yang benar:** biarkan database yang menghitung. Database punya indeks dan dioptimalkan untuk ini.

```php
// Laravel: BENAR. Hanya satu angka yang dikirim lewat jaringan
$total  = Order::where('status', 'selesai')->count();
$omzet  = OrderItem::sum(DB::raw('quantity * unit_price'));
$rata2  = Product::avg('price');
```

Query SQL di baliknya sama dengan yang kamu pelajari hari ini.

### 7.2 Pakai `DECIMAL` untuk uang, bukan `FLOAT`

`FLOAT`/`DOUBLE` menyimpan angka pecahan secara **aproksimasi**. Setelah dijumlahkan ribuan kali, selisih kecil menumpuk. Karena itu tabel KopiKita memakai `DECIMAL(10,2)` untuk `price`, `unit_price`, dan `shipping_fee`. Aturan industri: **uang = `DECIMAL`** (atau integer dalam satuan terkecil, misalnya sen).

### 7.3 Selalu pikirkan `NULL`

Sebelum menulis agregat, tanyakan:

1. Apakah kolom ini bisa `NULL`?
2. Apa arti `NULL` di sini: *tidak diketahui* atau *nol*?
3. Bagaimana kalau tidak ada baris yang cocok? (`SUM` → `NULL`)

Pola aman untuk laporan:

```sql
SELECT COALESCE(SUM(shipping_fee), 0) AS total_ongkir FROM orders WHERE status = 'selesai';
```

### 7.4 Simpan "harga saat transaksi" (snapshot)

Itulah alasan `order_items` punya kolom `unit_price`, padahal `products` sudah punya `price`. Harga katalog bisa berubah kapan saja. Kalau omzet dihitung dari harga katalog hari ini, **laporan bulan lalu ikut berubah**, dan itu salah.

```sql
-- ✅ Benar: pakai harga saat transaksi
SELECT SUM(quantity * unit_price) FROM order_items;
```

Pesanan #1 membeli Kopi Arabika seharga 80.000. Dengan snapshot, nilainya tetap 80.000 walau harga katalog sekarang 85.000.

### 7.5 Beri alias yang bermakna

`SELECT SUM(quantity * unit_price)` menghasilkan kolom bernama `SUM(quantity * unit_price)`. Aplikasi dan rekan tim lebih mudah membaca `AS total_omzet`. Gunakan `snake_case` yang deskriptif.

### 7.6 Jangan `SELECT *` hanya untuk menghitung

`SELECT COUNT(*) FROM orders` bagus. Menarik semua kolom lalu menghitung di aplikasi tidak.

---

## Bagian 8: Rangkuman Pertemuan 1

| Fungsi | `NULL` | Tanpa baris cocok | Tipe data |
|---|---|---|---|
| `COUNT(*)` | Dihitung | `0` | Angka |
| `COUNT(kolom)` | Diabaikan | `0` | Angka |
| `SUM` | Diabaikan | `NULL` | Angka |
| `AVG` | Diabaikan | `NULL` | Angka |
| `MIN`/`MAX` | Diabaikan | `NULL` | Angka, tanggal, teks |

**Lanjut ke Lembar Kerja Praktikum 1 ↓**

---

## 📝 LEMBAR KERJA PRAKTIKUM 1: Fungsi Agregat Dasar

| | |
|---|---|
| **Nama** | ……………………………… |
| **NIM / Kelas** | ……………………………… |
| **Tanggal** | ……………………………… |

**Petunjuk pengerjaan**

- Gunakan database `kopikita`. Kerjakan secara **mandiri**.
- Untuk setiap soal, tuliskan **query** dan **hasilnya** (salin atau screenshot).
- Beri **alias** yang bermakna pada setiap kolom hasil.
- Soal bertanda 💬 meminta penjelasan singkat (1–2 kalimat).
- Soal 16–20 tingkat menantang. Kerjakan terakhir.

### A. Dasar (Soal 1–8)

1. Hitung jumlah seluruh pelanggan.
2. Hitung jumlah produk pada kategori Teh (`category_id = 2`).
3. Hitung jumlah pesanan berstatus `dikirim`.
4. Hitung jumlah pelanggan yang berasal dari kota **Jember**.
5. Hitung jumlah pelanggan yang datanya **tidak memiliki kota** (`city` bernilai `NULL`). Tuliskan **dua cara** berbeda.
6. Hitung jumlah kota yang **berbeda** pada tabel `customers`.
7. Hitung total stok seluruh produk.
8. Hitung total kuantitas barang terjual pada tabel `order_items`.

### B. Menengah (Soal 9–15)

9. Hitung total ongkos kirim (`shipping_fee`) dari pesanan berstatus `selesai`. Pastikan hasilnya **0, bukan `NULL`**, jika tidak ada data.
10. Hitung rata-rata harga produk kategori Camilan (`category_id = 4`), dibulatkan tanpa desimal.
11. Hitung rata-rata `rating` seluruh produk. 💬 Berapa produk yang ikut dihitung, dan mengapa tidak 12?
12. Tampilkan harga termurah dan termahal produk kategori Peralatan (`category_id = 3`) dalam satu query.
13. Tampilkan tanggal pesanan **pertama** dan **terakhir** khusus pesanan berstatus `selesai`.
14. Hitung rata-rata `shipping_fee` seluruh pesanan dengan dua cara: (a) apa adanya, (b) `NULL` dianggap 0. 💬 Mengapa hasilnya berbeda?
15. Hitung jumlah produk yang **belum memiliki rating**.

### C. Menantang (Soal 16–20)

16. Hitung **nilai stok** (stok × harga) untuk seluruh produk kategori Kopi.
17. Buat ringkasan produk yang **stoknya tersedia** (`stock > 0`) dalam satu query: jumlah produk, rata-rata harga (dibulatkan), harga termurah, harga termahal, dan total stok.
18. Hitung total nilai penjualan (`quantity * unit_price`) untuk produk Kopi Arabika Gayo (`product_id = 1`) pada tabel `order_items`. 💬 Mengapa hasilnya tidak sama dengan `total kuantitas × harga katalog saat ini`?
19. Tampilkan **nama** dan harga produk termahal **tanpa** menulis `SELECT name, MAX(price)`. 💬 Jelaskan mengapa penulisan tersebut bermasalah.
20. Dalam **satu query**, tampilkan: jumlah pelanggan, jumlah kota unik, tanggal bergabung pelanggan terlama, dan tanggal bergabung pelanggan terbaru. 💬 Mengapa `COUNT(city)` tidak sama dengan `COUNT(*)` pada data ini?

---

# PERTEMUAN 2: `GROUP BY`, `HAVING`, `CASE WHEN`, dan Laporan Bisnis

> Minggu ini setiap query hanya memakai **satu tabel**. Penggabungan antar tabel belum dibahas.

## Rencana Waktu (240 menit)

| Menit | Kegiatan |
|---|---|
| 0–10 | Pemanasan: ulas Pertemuan 1 |
| 10–60 | Bagian 1: `GROUP BY` |
| 60–100 | Bagian 2: `HAVING` dan urutan eksekusi |
| 100–110 | Istirahat |
| 110–145 | Bagian 3: *Conditional aggregation* (`CASE WHEN`) |
| 145–170 | Bagian 4: Agregat bertingkat dengan CTE |
| 170–190 | Bagian 5: Praktik industri |
| 190–240 | Bagian 6: Lembar Kerja 2 |

---

## Pemanasan (10 menit)

Pastikan database `kopikita` masih lengkap. Jalankan lalu cocokkan:

```sql
SELECT COUNT(*) AS jumlah_pesanan FROM orders;                                   -- 15
SELECT SUM(quantity * unit_price) AS total_nilai_penjualan FROM order_items;     -- 3385000
```

Jika angkanya berbeda, jalankan ulang Checkpoint 0 dari Pertemuan 1. Setelah itu, jawab dari ingatan:

1. Apa beda `COUNT(*)` dan `COUNT(kolom)`?
2. Apa hasil `SUM` jika tidak ada baris yang cocok?
3. Fungsi agregat tanpa `GROUP BY` menghasilkan berapa baris?

> Hari ini kita beralih dari *"satu angka untuk seluruh tabel"* menjadi *"satu angka untuk setiap kelompok"*.

---

## Bagian 1: `GROUP BY`: Meringkas per Kelompok

Pemilik KopiKita bertanya: *"Berapa pesanan per status?"* Dengan `COUNT(*)` biasa kamu hanya dapat satu angka. Dengan `GROUP BY`, kamu mendapat satu angka **per kelompok**.

```
orders (15 baris)
  ├─ selesai    → 10 baris ──► COUNT → 10
  ├─ dikirim    →  3 baris ──► COUNT →  3
  ├─ menunggu   →  1 baris ──► COUNT →  1
  └─ dibatalkan →  1 baris ──► COUNT →  1
```

### 1.1 Satu kolom pengelompokan

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

### 1.2 Aturan emas `GROUP BY`

> Setiap kolom di `SELECT` harus **(a)** ada di `GROUP BY`, atau **(b)** dibungkus fungsi agregat.

```sql
SELECT status, COUNT(*) FROM orders;   -- ❌ error: status tidak ada di GROUP BY
```

### 1.3 `NULL` menjadi kelompoknya sendiri

```sql
SELECT city, COUNT(*) AS jumlah_pelanggan
FROM customers
GROUP BY city
ORDER BY jumlah_pelanggan DESC;
```

| city | jumlah_pelanggan |
|---|---|
| Jember | 4 |
| Surabaya | 2 |
| Malang | 2 |
| Banyuwangi | 1 |
| NULL | 1 |

Supaya laporan lebih ramah dibaca:

```sql
SELECT COALESCE(city, 'Tidak diketahui') AS kota, COUNT(*) AS jumlah_pelanggan
FROM customers
GROUP BY COALESCE(city, 'Tidak diketahui')
ORDER BY jumlah_pelanggan DESC;
```

### 1.4 Banyak fungsi agregat per kelompok

Ringkasan harga per kategori produk:

```sql
SELECT
  category_id,
  COUNT(*)             AS jumlah_produk,
  ROUND(AVG(price), 0) AS rata2_harga,
  MIN(price)           AS termurah,
  MAX(price)           AS termahal
FROM products
GROUP BY category_id;
```

| category_id | jumlah_produk | rata2_harga | termurah | termahal |
|---|---|---|---|---|
| 1 | 3 | 78333 | 55000 | 95000 |
| 2 | 3 | 40000 | 35000 | 45000 |
| 3 | 3 | 181667 | 120000 | 250000 |
| 4 | 3 | 34333 | 25000 | 48000 |

> Arti `category_id`: 1 = Kopi, 2 = Teh, 3 = Peralatan, 4 = Camilan.

### 1.5 Barang terjual per produk

```sql
SELECT
  product_id,
  SUM(quantity)                    AS total_terjual,
  SUM(quantity * unit_price)       AS nilai_penjualan
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
| 4 | 5 | 225000 |
| 12 | 5 | 240000 |
| 3 | 4 | 380000 |
| 8 | 3 | 525000 |
| 6 | 2 | 80000 |
| 7 | 2 | 500000 |
| 11 | 2 | 60000 |
| 9 | 1 | 120000 |

> 💡 Ada beberapa produk dengan jumlah terjual sama. `ORDER BY total_terjual DESC, product_id` menambahkan **pembeda kedua** supaya urutannya selalu konsisten. Kebiasaan baik untuk laporan.

🧪 **Coba sendiri:** tampilkan total stok per `category_id`, urut dari stok terbesar. *(Jawaban: kategori 4 → 275, kategori 2 → 180, kategori 1 → 125, kategori 3 → 35)*

### 1.6 `GROUP BY` pada ekspresi: laporan per bulan

Kamu boleh mengelompokkan berdasarkan **hasil perhitungan**, misalnya mengambil bulan dari tanggal:

```sql
SELECT
  DATE_FORMAT(order_date, '%Y-%m') AS bulan,
  COUNT(*)                         AS jumlah_pesanan
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

Sekarang hanya pesanan `selesai`, lengkap dengan total ongkir:

```sql
SELECT
  DATE_FORMAT(order_date, '%Y-%m')      AS bulan,
  COUNT(*)                              AS pesanan_selesai,
  COALESCE(SUM(shipping_fee), 0)        AS total_ongkir
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

> 🌐 *Catatan PostgreSQL:* `DATE_FORMAT(x, '%Y-%m')` diganti `TO_CHAR(x, 'YYYY-MM')`. Konsep `GROUP BY`-nya sama.

### 1.7 `GROUP BY` lebih dari satu kolom

```sql
SELECT status, DATE_FORMAT(order_date, '%Y-%m') AS bulan, COUNT(*) AS jumlah
FROM orders
GROUP BY status, DATE_FORMAT(order_date, '%Y-%m')
ORDER BY bulan, status;
```

Setiap **kombinasi unik** `(status, bulan)` menjadi satu kelompok.

---

## Bagian 2: `HAVING`: Menyaring Kelompok

Kamu sudah tahu `WHERE` menyaring **baris**. Bagaimana kalau ingin menyaring **hasil agregat**, misalnya "kota yang punya minimal 2 pelanggan"?

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

### 2.1 `WHERE` vs `HAVING`

| | `WHERE` | `HAVING` |
|---|---|---|
| Menyaring | **Baris** | **Kelompok** |
| Berjalan | **Sebelum** `GROUP BY` | **Sesudah** `GROUP BY` |
| Boleh pakai agregat? | ❌ Tidak | ✅ Ya |

### 2.2 Urutan eksekusi (hafalkan!)

Urutan **penulisan** berbeda dengan urutan **pemrosesan**:

| Ditulis | Diproses |
|---|---|
| `SELECT` | 5️⃣ |
| `FROM` | 1️⃣ |
| `WHERE` | 2️⃣ |
| `GROUP BY` | 3️⃣ |
| `HAVING` | 4️⃣ |
| `ORDER BY` | 6️⃣ |
| `LIMIT` | 7️⃣ |

Karena `WHERE` dijalankan sebelum `GROUP BY`, ia tidak mungkin tahu hasil `COUNT`. Itulah alasan agregat tidak boleh ada di `WHERE`.

### 2.3 `WHERE` dan `HAVING` bersama

Kategori produk yang memiliki **minimal 3 produk berstok** (stok > 0):

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

Langkahnya: (1) `WHERE` membuang produk yang stoknya habis, (2) sisanya dikelompokkan, (3) `HAVING` menyisakan kelompok dengan minimal 3 produk. Kategori 2 dan 3 gugur karena masing-masing hanya punya 2 produk berstok.

### 2.4 `HAVING` pada hasil ekspresi

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

Pelanggan yang **memesan minimal 2 kali**, beserta pesanan terakhirnya:

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

🧪 **Coba sendiri:** tampilkan `product_id` yang total terjualnya **minimal 6 unit**. *(Jawaban: produk 10 → 10, produk 5 → 7, produk 1 → 6)*

🏭 **Aturan praktis:** filter yang **bisa** dilakukan dengan `WHERE`, lakukan dengan `WHERE`. Menyaring lebih awal berarti lebih sedikit baris yang harus dikelompokkan, jadi lebih cepat. Simpan `HAVING` hanya untuk kondisi yang butuh hasil agregat.

---

## Bagian 3: *Conditional Aggregation* (`CASE WHEN`)

`CASE WHEN` adalah "jika-maka" di dalam SQL:

```sql
CASE WHEN kondisi THEN nilai_a ELSE nilai_b END
```

### 3.1 Ringkasan status dalam satu baris

Pemilik toko ingin satu baris ringkasan: jumlah pesanan per status **dalam kolom berjajar** (gaya dashboard).

```sql
SELECT
  COUNT(*)                                            AS total,
  SUM(CASE WHEN status = 'selesai'    THEN 1 ELSE 0 END) AS selesai,
  SUM(CASE WHEN status = 'dikirim'    THEN 1 ELSE 0 END) AS dikirim,
  SUM(CASE WHEN status = 'menunggu'   THEN 1 ELSE 0 END) AS menunggu,
  SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) AS dibatalkan
FROM orders;
```

| total | selesai | dikirim | menunggu | dibatalkan |
|---|---|---|---|---|
| 15 | 10 | 3 | 1 | 1 |

**Cara bacanya:** `CASE WHEN` mengubah setiap baris menjadi 1 (cocok) atau 0 (tidak), lalu `SUM` menjumlahkannya. Hasilnya sama dengan menghitung "berapa yang cocok".

Teknik ini sangat umum di laporan produksi karena **satu kali baca tabel** menghasilkan banyak kolom, jauh lebih efisien daripada menjalankan empat query terpisah.

### 3.2 Digabung dengan `GROUP BY`: laporan status per bulan

```sql
SELECT
  DATE_FORMAT(order_date, '%Y-%m')                     AS bulan,
  SUM(CASE WHEN status = 'selesai'    THEN 1 ELSE 0 END) AS selesai,
  SUM(CASE WHEN status = 'dikirim'    THEN 1 ELSE 0 END) AS dikirim,
  SUM(CASE WHEN status = 'menunggu'   THEN 1 ELSE 0 END) AS menunggu,
  SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) AS dibatalkan,
  COUNT(*)                                             AS total
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

### 3.3 `CASE WHEN` di dalam `GROUP BY`: segmentasi

Kelompokkan produk berdasarkan **rentang harga**:

```sql
SELECT
  CASE
    WHEN price < 50000  THEN 'Murah'
    WHEN price < 150000 THEN 'Menengah'
    ELSE 'Premium'
  END                   AS segmen,
  COUNT(*)              AS jumlah_produk,
  ROUND(AVG(price), 0)  AS rata2_harga
FROM products
GROUP BY
  CASE
    WHEN price < 50000  THEN 'Murah'
    WHEN price < 150000 THEN 'Menengah'
    ELSE 'Premium'
  END;
```

| segmen | jumlah_produk | rata2_harga |
|---|---|---|
| Murah | 6 | 37167 |
| Menengah | 4 | 88750 |
| Premium | 2 | 212500 |

🧪 **Coba sendiri:** hitung jumlah pelanggan per **periode bergabung**: "2025" untuk `joined_at` sebelum `2026-01-01`, "2026" untuk selebihnya. *(Jawaban: 2025 → 2, 2026 → 8)*

---

## Bagian 4: Agregat Bertingkat dengan CTE

Pertanyaan: *"Berapa **rata-rata nilai per pesanan**?"* (di industri disebut **AOV**, *Average Order Value*, metrik wajib toko online).

Kamu tidak bisa langsung menulis `AVG(SUM(...))`. Hitung dulu total **per pesanan**, baru rata-ratakan. CTE (`WITH`) membuat langkah ini rapi dan mudah dibaca:

```sql
WITH nilai_pesanan AS (
  SELECT
    order_id,
    SUM(quantity * unit_price) AS total
  FROM order_items
  GROUP BY order_id
)
SELECT
  COUNT(*)           AS jumlah_pesanan,
  ROUND(AVG(total))  AS aov,
  MIN(total)         AS pesanan_terkecil,
  MAX(total)         AS pesanan_terbesar,
  SUM(total)         AS total_nilai
FROM nilai_pesanan;
```

| jumlah_pesanan | aov | pesanan_terkecil | pesanan_terbesar | total_nilai |
|---|---|---|---|---|
| 15 | 225667 | 80000 | 446000 | 3385000 |

> 💡 **Langkah 1:** agregasi di level **pesanan** (CTE). **Langkah 2:** agregasi di level **toko** (query utama). Pola "agregasi dua tingkat" ini sering dipakai di laporan.

✅ **Cek silang:** `total_nilai` (3.385.000) sama dengan `SUM(quantity * unit_price)` dari tabel `order_items` di Pemanasan. Mengecek silang antar-query adalah kebiasaan analis yang baik.

> 📝 Angka di atas mencakup **semua status pesanan**, karena kolom `status` berada di tabel `orders`, bukan `order_items`. Menyaring berdasarkan status akan dibahas pada materi berikutnya.

---

## Bagian 5: 🏭 Praktik Industri

### 5.1 Filter tanggal yang efisien (*sargable*)

Ingin jumlah pesanan September 2026? Pola yang sering dipakai pemula:

```sql
-- ❌ Kurang efisien: fungsi pada kolom membuat indeks tidak terpakai
SELECT COUNT(*) FROM orders
WHERE YEAR(order_date) = 2026 AND MONTH(order_date) = 9;
```

Pola industri, yaitu **rentang tanggal** (batas bawah termasuk, batas atas tidak termasuk):

```sql
-- ✅ Efisien: indeks pada order_date dapat dipakai
SELECT COUNT(*) AS pesanan_september
FROM orders
WHERE order_date >= '2026-09-01'
  AND order_date <  '2026-10-01';
```

Hasil: **3** (cocok dengan baris `2026-09` di 1.6). Pola `>= awal AND < awal_bulan_berikutnya` juga aman untuk kolom `DATETIME` karena tidak ada jam 23:59:59 yang terlewat.

### 5.2 Indeks mendukung agregasi

Pada tabel besar (jutaan baris), agregat tanpa indeks = membaca seluruh tabel. Buat indeks pada kolom yang sering dipakai di `WHERE`:

```sql
CREATE INDEX idx_orders_status_date ON orders (status, order_date);
```

Bandingkan rencana eksekusinya dengan `EXPLAIN`:

```sql
EXPLAIN
SELECT COUNT(*) FROM orders
WHERE status = 'selesai' AND order_date >= '2026-09-01' AND order_date < '2026-10-01';
```

Perhatikan kolom `key`: jika terisi `idx_orders_status_date`, indeks dipakai. (Pada data kecil, MySQL kadang tetap memilih *full scan*; itu wajar. Kebiasaan `EXPLAIN` yang perlu kamu bawa.)

### 5.3 Satu definisi bisnis, satu tempat

"Pesanan sukses" menurut KopiKita = pesanan berstatus **`selesai`**. Kalau tim A menghitungnya dengan pesanan `dikirim` dan tim B tidak, dua dashboard menampilkan dua angka berbeda dan rapat berubah jadi debat. Di industri, definisi dibakukan, misalnya dalam **VIEW**:

```sql
CREATE VIEW v_pesanan_selesai AS
SELECT order_id, customer_id, order_date, shipping_fee
FROM orders
WHERE status = 'selesai';

-- Semua orang tinggal memakai definisi yang sama:
SELECT COUNT(*) AS jumlah_pesanan, COALESCE(SUM(shipping_fee), 0) AS total_ongkir
FROM v_pesanan_selesai;
```

Hasil: 10 pesanan, total ongkir 130.000.

### 5.4 Tabel ringkasan untuk data besar

Dashboard yang menjalankan agregat atas puluhan juta baris setiap kali dibuka akan lambat. Praktik umum: agregasi dijalankan terjadwal (misalnya tiap malam) dan hasilnya disimpan di **tabel ringkasan**, lalu dashboard membaca tabel kecil itu:

```sql
CREATE TABLE daily_orders_summary (
  order_day     DATE PRIMARY KEY,
  total_orders  INT NOT NULL,
  total_shipping DECIMAL(14,2) NOT NULL
);

INSERT INTO daily_orders_summary (order_day, total_orders, total_shipping)
SELECT order_date, COUNT(*), COALESCE(SUM(shipping_fee), 0)
FROM orders
WHERE status = 'selesai'
GROUP BY order_date;
```

Kamu belum perlu membuatnya sekarang. Cukup tahu bahwa polanya ada dan umum dipakai.

### 5.5 Sekilas: *Window Function*

`GROUP BY` **menciutkan** baris. Kadang kita ingin angka agregat **tanpa** kehilangan baris detail, misalnya peringkat atau persentase kontribusi. Itu dikerjakan *window function* (`SUM() OVER (...)`, `RANK() OVER (...)`), topik lanjutan. Ingat saja: `GROUP BY` = meringkas, `OVER` = menghitung sambil mempertahankan baris.

### Daftar Periksa Sebelum Mengirim Query Agregat

- [ ] Apakah `NULL` sudah dipertimbangkan? (`COUNT(*)` vs `COUNT(kolom)`, `COALESCE`)
- [ ] Setiap kolom di `SELECT` sudah ada di `GROUP BY` atau berupa agregat?
- [ ] Filter sudah di `WHERE` (bukan `HAVING`) bila memungkinkan?
- [ ] Filter tanggal memakai rentang, bukan fungsi pada kolom?
- [ ] Urutan hasil sudah konsisten (ada pembeda kedua pada `ORDER BY`)?
- [ ] Alias kolom jelas? Hasil sudah dicek silang?

### Rangkuman Pertemuan 2

| Konsep | Intinya |
|---|---|
| `GROUP BY` | Satu hasil per kelompok; kolom `SELECT` harus ada di `GROUP BY` atau berupa agregat |
| `HAVING` | Menyaring **kelompok** (setelah agregasi); `WHERE` menyaring **baris** (sebelum) |
| `CASE WHEN` dalam agregat | Satu query, banyak kolom ringkasan; bisa juga untuk segmentasi |
| CTE | Memecah agregasi bertingkat agar mudah dibaca |
| Industri | Rentang tanggal, indeks, `VIEW` untuk definisi bisnis, tabel ringkasan |

---

## 📝 LEMBAR KERJA PRAKTIKUM 2: `GROUP BY`, `HAVING`, `CASE WHEN`, dan Laporan

| | |
|---|---|
| **Nama** | ……………………………… |
| **NIM / Kelas** | ……………………………… |
| **Tanggal** | ……………………………… |

**Petunjuk pengerjaan**

- Gunakan database `kopikita`. Kerjakan secara **mandiri**.
- Setiap soal cukup memakai **satu tabel**.
- Tuliskan **query** dan **hasilnya** (salin atau screenshot) untuk setiap soal.
- Beri alias yang bermakna. Soal 💬 meminta penjelasan singkat.
- Soal 17–20 tingkat menantang. Kerjakan terakhir.

### A. `GROUP BY` dan `HAVING` (Soal 1–8)

1. Tampilkan jumlah produk per `category_id`.
2. Tampilkan jumlah pelanggan per kota, urut dari terbanyak. Tampilkan kota `NULL` sebagai teks **"Tidak diketahui"**.
3. Tampilkan jumlah pesanan per status, urut dari terbanyak.
4. Tampilkan **total stok** per `category_id`, urut dari stok terbesar.
5. Tampilkan rata-rata harga per `category_id` (dibulatkan tanpa desimal), urut dari rata-rata tertinggi.
6. Tampilkan total kuantitas terjual per `product_id` pada tabel `order_items`, urut dari terbanyak.
7. Tampilkan kota yang memiliki **minimal 2 pelanggan**, beserta jumlahnya.
8. Tampilkan `product_id` yang total terjualnya **lebih dari 5 unit**, urut dari terbanyak.

### B. `WHERE` vs `HAVING` (Soal 9–11)

9. Tampilkan `category_id` yang memiliki **minimal 3 produk dengan stok > 0**, beserta jumlah produk berstok tersebut. 💬 Bagian mana yang kamu letakkan di `WHERE` dan mana di `HAVING`? Mengapa?
10. Tampilkan `customer_id` yang memiliki **minimal 2 pesanan berstatus `selesai`**, beserta jumlah pesanannya.
11. Tampilkan total ongkir (`shipping_fee`) per status, hanya untuk status yang total ongkirnya **lebih dari 50.000**. Pastikan hasil tidak `NULL`.

### C. Laporan per Waktu dan `CASE WHEN` (Soal 12–16)

12. Tampilkan per bulan: jumlah pesanan dan total ongkir, khusus pesanan berstatus `selesai`.
13. Tampilkan jumlah pelanggan yang bergabung per bulan (`joined_at`).
14. Buat laporan per bulan dengan kolom: `bulan`, `selesai`, `dikirim`, `dibatalkan`, `menunggu` (jumlah pesanan per status, memakai `CASE WHEN`).
15. Kelompokkan produk menjadi tiga segmen harga: **Murah** (< 50.000), **Menengah** (50.000 sampai kurang dari 150.000), **Premium** (≥ 150.000). Tampilkan jumlah produk dan total stok tiap segmen.
16. Pada tabel `order_items`, tampilkan per `order_id`: jumlah baris item dan total kuantitas, hanya untuk pesanan dengan **total kuantitas ≥ 5**.

### D. Menantang (Soal 17–20)

17. Dengan CTE, hitung nilai total per pesanan dari `order_items`, lalu tampilkan: jumlah pesanan, nilai rata-rata (dibulatkan), nilai terkecil, dan nilai terbesar.
18. Dengan CTE, hitung berapa **pesanan yang nilainya di atas rata-rata** nilai pesanan. *Petunjuk: bandingkan `total` dengan `(SELECT AVG(total) FROM nama_cte)`.*
19. Seorang rekan menulis `WHERE MONTH(order_date) = 9 AND YEAR(order_date) = 2026`.
    (a) Tulis ulang sebagai filter rentang tanggal untuk menampilkan jumlah pesanan **per status** pada September 2026. 💬 Mengapa versi rentang lebih baik untuk data besar?
    (b) Tulis perintah `CREATE INDEX` yang mendukung query tersebut.
20. **Mini-laporan.** Buat laporan **pesanan Oktober 2026** dalam satu query: total pesanan, jumlah per status (selesai, dikirim, menunggu, dibatalkan), total ongkir pesanan `selesai` (tidak boleh `NULL`), serta tanggal pesanan pertama dan terakhir. 💬 Sebutkan satu alasan mengapa definisi "pesanan selesai" sebaiknya dibakukan dalam `VIEW`.

---

### Kriteria Penilaian (saran untuk penilaian mandiri)

| Aspek | Yang dinilai |
|---|---|
| Ketepatan hasil | Angka sesuai data |
| Kebenaran logika | Pemilihan `COUNT(*)` vs `COUNT(kolom)`, `WHERE` vs `HAVING`, isi `GROUP BY` |
| Penanganan `NULL` | `COALESCE` dipakai bila perlu |
| Keterbacaan | Alias jelas, format rapi |
| Penjelasan 💬 | Singkat, tepat, memakai istilah yang benar |

*Selamat berlatih! Kesalahan di praktikum adalah bahan belajar terbaik. Lebih baik salah di sini daripada di laporan perusahaan.* ☕
