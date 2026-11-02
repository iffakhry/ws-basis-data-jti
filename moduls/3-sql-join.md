# Panduan Praktikum Workshop Basis Data
## SQL JOIN: INNER, LEFT, RIGHT, dan FULL

> **Durasi:** 2 pertemuan × 4 jam
> **Database:** MySQL 8 / MariaDB 10.5+ (catatan untuk PostgreSQL disertakan)
> **Tools:** MySQL Workbench, DBeaver, phpMyAdmin, atau terminal `mysql`

---

## Daftar Isi

- [Gambaran Umum & Alur Belajar](#gambaran-umum--alur-belajar)
- [Persiapan: Membangun Database Studi Kasus](#persiapan-membangun-database-studi-kasus)
- **[PERTEMUAN 1: INNER, LEFT, dan RIGHT JOIN](#pertemuan-1)**
- **[PERTEMUAN 2: FULL JOIN, Anti-Join, dan JOIN Tingkat Industri](#pertemuan-2)**
- **[MATERI PENGAYAAN: SELF JOIN dan CROSS JOIN](#pengayaan)**

---

## Gambaran Umum & Alur Belajar

### Tujuan Pembelajaran

Setelah menyelesaikan praktikum ini, kamu mampu:

1. Menjelaskan mengapa data dipisah ke beberapa tabel dan dihubungkan dengan **Primary Key** dan **Foreign Key**.
2. Menulis query `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, dan `FULL JOIN`, serta memilih yang tepat untuk sebuah kebutuhan laporan.
3. Menemukan data "yatim" (tanpa pasangan) memakai teknik **anti-join**.
4. Menghindari kesalahan umum JOIN yang sering terjadi di aplikasi nyata (duplikasi baris, jebakan `ON` vs `WHERE`, dan masalah `NULL`).
5. Menulis JOIN yang bersih, aman, dan cepat sesuai standar industri.

### Studi Kasus: **Nusantara Mart** 🛒

Sepanjang dua pertemuan, kamu akan menjadi *backend developer* di toko online **Nusantara Mart**. Setiap latihan memakai database yang **sama**, sehingga hasil query selalu bisa kamu bandingkan dan dikaitkan dengan latihan sebelumnya.

Cerita singkatnya: tim bisnis membutuhkan berbagai laporan, misalnya "daftar pesanan beserta nama pelanggan", "pelanggan yang belum pernah belanja", "produk yang belum pernah terjual", dan "omzet per kategori". Semua laporan itu membutuhkan **JOIN**.

### Peta Waktu

| Pertemuan | Sesi | Durasi | Materi |
|---|---|---|---|
| **1** | A | 30 menit | Persiapan database & konsep relasi (PK/FK) |
| | B | 60 menit | `INNER JOIN` |
| | C | 15 menit | Istirahat |
| | D | 60 menit | `LEFT JOIN` |
| | E | 30 menit | `RIGHT JOIN` + rangkuman |
| | F | 45 menit | **Lembar Kerja 1** (20 soal) |
| **2** | A | 15 menit | Review pertemuan 1 |
| | B | 45 menit | `FULL JOIN` (dan cara membuatnya di MySQL) |
| | C | 45 menit | Anti-Join: mencari data tanpa pasangan |
| | D | 15 menit | Istirahat |
| | E | 45 menit | Jebakan `ON` vs `WHERE`, duplikasi baris, `NULL` |
| | F | 30 menit | JOIN + agregasi, VIEW, dan performa |
| | G | 45 menit | **Lembar Kerja 2** (20 soal) |
| **Pengayaan** | – | 45–60 menit | `SELF JOIN` dan `CROSS JOIN` (opsional / mandiri) |

### Cara Memakai Panduan Ini

Ikuti pola belajar berikut di setiap sub-materi:

| Ikon | Arti |
|---|---|
| 🧠 | **Konsep**: baca dan pahami dulu |
| ⌨️ | **Praktik**: ketik sendiri querynya (jangan *copy-paste*, mengetik membantu otak mengingat) |
| 🔮 | **Prediksi**: tebak jumlah baris/hasilnya **sebelum** menjalankan query |
| ✅ | **Cek Hasil**: bandingkan hasilmu dengan hasil yang diharapkan |
| 💡 | **Insight Industri**: praktik yang dipakai tim engineer profesional |
| ⚠️ | **Awas**: kesalahan yang sering terjadi |

---

## Persiapan: Membangun Database Studi Kasus

### Skema Database

```
categories (1) ──────< (N) products (1) ──────< (N) order_items (N) >────── (1) orders (N) >────── (1) customers
   id (PK)                  id (PK)                    id (PK)                   id (PK)                id (PK)
   name                     category_id (FK)           order_id (FK)             customer_id (FK)       name
                            name                       product_id (FK)           order_date             city
                            price                      quantity                  status                 email
                            stock                      unit_price
```

Cara membaca: satu **kategori** punya banyak **produk**. Satu **pelanggan** punya banyak **pesanan**. Satu **pesanan** punya banyak **item**, dan satu **produk** bisa muncul di banyak item.

> 💡 **Insight Industri: konvensi penamaan.** Tim engineer umumnya memakai nama tabel **jamak** dan **snake_case** berbahasa Inggris (`order_items`, bukan `DetailPesanan`). Konvensi ini sama dengan yang dipakai Laravel, Rails, dan Django, sehingga mudah dikenali lintas tim.

### ⌨️ Langkah 1: Buat Database

```sql
DROP DATABASE IF EXISTS nusantara_mart;
CREATE DATABASE nusantara_mart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nusantara_mart;
```

### ⌨️ Langkah 2: Buat Tabel

Urutan pembuatan penting: tabel yang **dirujuk** (induk) dibuat lebih dulu daripada tabel yang **merujuk** (anak).

```sql
CREATE TABLE categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE customers (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    city  VARCHAR(50)  NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NULL,
    name        VARCHAR(100)  NOT NULL,
    price       DECIMAL(12,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
);

CREATE TABLE orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,                -- NULL = pesanan tamu (guest checkout)
    order_date  DATE NOT NULL,
    status      VARCHAR(20) NOT NULL,    -- pending, completed, cancelled
    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,   -- harga saat transaksi (snapshot)
    CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id),
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);
```

> 💡 **Insight Industri: harga disalin ke `order_items.unit_price`.** Harga produk bisa berubah kapan saja. Kalau laporan masa lalu membaca `products.price`, omzet bulan lalu ikut berubah, dan itu salah. Praktik standar di e-commerce adalah menyimpan **snapshot harga** saat transaksi terjadi.

### ⌨️ Langkah 3: Isi Data

```sql
INSERT INTO categories (id, name) VALUES
(1, 'Elektronik'), (2, 'Fashion'), (3, 'Buku'), (4, 'Olahraga');

INSERT INTO customers (id, name, city, email) VALUES
(1, 'Andi Pratama',   'Jember',     'andi@mail.com'),
(2, 'Budi Santoso',   'Surabaya',   'budi@mail.com'),
(3, 'Citra Lestari',  'Jember',     'citra@mail.com'),
(4, 'Dewi Anggraini', 'Malang',     'dewi@mail.com'),
(5, 'Eko Wijaya',     'Banyuwangi', 'eko@mail.com'),
(6, 'Fina Rahma',     'Jember',     'fina@mail.com');

INSERT INTO products (id, category_id, name, price, stock) VALUES
(1, 1,    'Laptop Aero 14',      9500000, 10),
(2, 1,    'Mouse Wireless',       150000, 50),
(3, 2,    'Kaos Polos',            75000, 100),
(4, 2,    'Jaket Hoodie',         250000, 40),
(5, 3,    'Novel Laskar',          90000, 30),
(6, 3,    'Buku SQL Dasar',       120000, 25),
(7, NULL, 'Powerbank 10000mAh',   200000, 15),
(8, 1,    'Headset Gaming',       350000, 20);

INSERT INTO orders (id, customer_id, order_date, status) VALUES
(1, 1,    '2026-10-01', 'completed'),
(2, 1,    '2026-10-05', 'completed'),
(3, 2,    '2026-10-07', 'completed'),
(4, 3,    '2026-10-10', 'cancelled'),
(5, 4,    '2026-10-12', 'completed'),
(6, 2,    '2026-10-15', 'pending'),
(7, NULL, '2026-10-18', 'completed');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
(1,  1, 1, 1, 9500000),
(2,  1, 2, 1,  150000),
(3,  2, 3, 2,   75000),
(4,  3, 5, 1,   90000),
(5,  3, 6, 1,  120000),
(6,  4, 4, 1,  250000),
(7,  5, 2, 2,  150000),
(8,  5, 3, 1,   75000),
(9,  6, 6, 3,  120000),
(10, 7, 7, 1,  200000);
```

### ✅ Cek Data

```sql
SELECT 'categories' AS tabel, COUNT(*) AS jumlah FROM categories
UNION ALL SELECT 'customers',   COUNT(*) FROM customers
UNION ALL SELECT 'products',    COUNT(*) FROM products
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
```

Hasil yang benar: `4, 6, 8, 7, 10`. Jika berbeda, ulangi langkah 1–3 sebelum lanjut.

### 🧠 Data "Jebakan" yang Sengaja Disiapkan

Database ini sengaja berisi data **tanpa pasangan** supaya perbedaan tiap JOIN terlihat jelas:

| Data | Keterangan | Dipakai untuk memahami |
|---|---|---|
| Eko & Fina | Pelanggan yang **belum pernah** memesan | `LEFT JOIN`, anti-join |
| Pesanan #7 | Pesanan tamu, `customer_id` = `NULL` | `RIGHT JOIN`, `FULL JOIN` |
| Kategori *Olahraga* | Kategori **tanpa produk** | `LEFT/RIGHT JOIN` |
| Produk *Powerbank* | Produk **tanpa kategori** | `INNER` vs `LEFT JOIN` |
| Produk *Headset Gaming* | Produk yang **belum pernah terjual** | Anti-join |

---

<a id="pertemuan-1"></a>
# PERTEMUAN 1
## INNER JOIN, LEFT JOIN, dan RIGHT JOIN

---

## 1.1 Konsep Dasar: Mengapa Perlu JOIN? (30 menit)

### 🧠 Data dipisah, bukan ditumpuk

Lihat tabel `orders`. Di dalamnya hanya ada `customer_id` (angka), bukan nama pelanggan. Mengapa? Karena jika nama pelanggan ditulis di setiap pesanan:

- Data **berulang** (Andi punya 2 pesanan, namanya tersimpan 2 kali).
- Jika Andi mengganti email, kamu harus mengubah banyak baris. Jika ada yang terlewat, datanya **tidak konsisten**.

Solusinya adalah **normalisasi**: setiap fakta disimpan **sekali** di tabel yang tepat, lalu dihubungkan lewat kunci.

| Istilah | Arti | Contoh di Nusantara Mart |
|---|---|---|
| **Primary Key (PK)** | Pengenal unik tiap baris | `customers.id` |
| **Foreign Key (FK)** | Kolom yang menunjuk ke PK tabel lain | `orders.customer_id` → `customers.id` |
| **JOIN** | Menggabungkan baris dari 2+ tabel berdasarkan kondisi yang menghubungkan PK dan FK | `orders` digabung `customers` |

### ⌨️ Rasakan masalahnya dulu

```sql
SELECT * FROM orders;
SELECT * FROM customers;
```

Pertanyaan: *siapa nama pelanggan untuk pesanan #3?* Kamu harus melihat `customer_id = 2` lalu mencarinya manual di tabel `customers`. **JOIN melakukan pencarian ini secara otomatis untuk semua baris.**

### 🧠 Anatomi JOIN

```sql
SELECT   kolom_yang_ingin_ditampilkan
FROM     tabel_kiri
JOIN     tabel_kanan
  ON     kondisi_penghubung;
```

- **Tabel kiri** adalah tabel yang ditulis setelah `FROM`.
- **Tabel kanan** adalah tabel yang ditulis setelah `JOIN`.
- `ON` menyatakan baris mana yang dianggap **berpasangan**. Biasanya: `FK = PK`.

### Ringkasan 4 Jenis JOIN

| JOIN | Yang ditampilkan | Baris tanpa pasangan |
|---|---|---|
| `INNER JOIN` | Hanya baris yang **cocok di kedua tabel** | Dibuang dari kedua sisi |
| `LEFT JOIN` | **Semua** baris kiri + pasangannya di kanan | Kiri tetap tampil, kolom kanan `NULL` |
| `RIGHT JOIN` | **Semua** baris kanan + pasangannya di kiri | Kanan tetap tampil, kolom kiri `NULL` |
| `FULL JOIN` | **Semua** baris dari kedua tabel | Keduanya tetap tampil, sisi tanpa pasangan `NULL` |

Pegang tabel ini. Di sesi-sesi berikutnya, kamu akan membuktikannya sendiri lewat query.

---

## 1.2 INNER JOIN (60 menit)

### 🧠 Konsep

`INNER JOIN` hanya mengembalikan baris yang **punya pasangan di kedua tabel**. Baris tanpa pasangan **hilang** dari hasil.

> Analogi: daftar hadir rapat yang dicocokkan dengan daftar undangan. Yang tampil hanya orang yang **diundang dan hadir**.

### ⌨️ Latihan 1.2.1: Pesanan beserta nama pelanggan

🔮 **Prediksi:** tabel `orders` berisi 7 baris. Menurutmu, berapa baris hasil query di bawah?

```sql
SELECT orders.id, orders.order_date, customers.name
FROM orders
INNER JOIN customers ON orders.customer_id = customers.id;
```

✅ **Cek Hasil:** **6 baris**. Pesanan #7 (tamu, `customer_id` = `NULL`) tidak punya pasangan di `customers`, sehingga hilang. Inilah sifat utama `INNER JOIN`.

### ⌨️ Latihan 1.2.2: Memakai alias

Menulis nama tabel lengkap berulang kali itu melelahkan. Gunakan **alias**:

```sql
SELECT o.id, o.order_date, c.name
FROM orders AS o
INNER JOIN customers AS c ON o.customer_id = c.id;
```

Hasilnya identik, tetapi jauh lebih ringkas. `JOIN` tanpa kata `INNER` pun berarti `INNER JOIN`.

> 💡 **Insight Industri: selalu beri prefix alias pada setiap kolom.** Tulis `o.id`, bukan `id`. Selain mencegah error *ambiguous*, query yang sudah ditulis rapi tetap aman ketika beberapa bulan kemudian seseorang menambah kolom bernama sama di tabel lain.

### ⚠️ Latihan 1.2.3: Rasakan error "ambiguous"

```sql
SELECT id, name
FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

Kamu akan melihat `Column 'id' in field list is ambiguous`. Kolom `id` ada di kedua tabel, sehingga MySQL tidak tahu harus memilih yang mana. Perbaiki dengan menambahkan prefix `o.id`.

### ⌨️ Latihan 1.2.4: JOIN + WHERE + ORDER BY

Tampilkan pesanan **selesai** milik pelanggan **Jember**, urut tanggal terbaru:

```sql
SELECT o.id, c.name, c.city, o.order_date, o.status
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE c.city = 'Jember'
  AND o.status = 'completed'
ORDER BY o.order_date DESC;
```

🧠 Urutan pikir yang benar: *gabungkan dulu* (`FROM … JOIN … ON`), *saring* (`WHERE`), lalu *urutkan* (`ORDER BY`).

✅ **Cek Hasil:** 2 baris (pesanan #2 dan #1 milik Andi).

### ⌨️ Latihan 1.2.5: JOIN tiga tabel

Bagaimana menampilkan **nama produk** di tiap item pesanan? Data ada di `order_items` (menyimpan `product_id`) dan `products` (menyimpan nama). Rantai JOIN-nya bisa diperpanjang:

```sql
SELECT o.id AS order_id,
       p.name AS product_name,
       oi.quantity,
       oi.unit_price,
       oi.quantity * oi.unit_price AS subtotal
FROM order_items oi
JOIN orders   o ON oi.order_id   = o.id
JOIN products p ON oi.product_id = p.id
ORDER BY o.id, p.name;
```

✅ **Cek Hasil:** 10 baris (semua item pesanan punya pasangan).

### ⌨️ Latihan 1.2.6: JOIN empat tabel (laporan lengkap)

Gabungkan seluruh rantai: pelanggan → pesanan → item → produk.

```sql
SELECT c.name  AS customer_name,
       o.id    AS order_id,
       o.order_date,
       p.name  AS product_name,
       oi.quantity,
       oi.quantity * oi.unit_price AS subtotal
FROM customers c
JOIN orders      o  ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id   = o.id
JOIN products    p  ON oi.product_id = p.id
ORDER BY c.name, o.order_date;
```

🔮 **Prediksi:** apakah hasilnya 10 baris? Mengapa mungkin kurang?

✅ **Cek Hasil:** **9 baris**. Item dari pesanan tamu (#7) tidak muncul karena rantai JOIN terputus di `customers`. Pelanggan Eko dan Fina juga tidak tampil.

> 🧠 **Aturan emas `INNER JOIN`:** setiap tabel yang kamu tambahkan adalah **filter tambahan**. Jika satu mata rantai putus, baris itu hilang dari hasil.

### 🧠 Mini-Challenge 1.2

Tanpa melihat contoh di atas, tulis query untuk menampilkan **nama produk beserta nama kategorinya**.
✅ Hasil seharusnya **7 baris**. Kenapa bukan 8 (jumlah produk)? *(Petunjuk: perhatikan Powerbank.)*

---

☕ **ISTIRAHAT 15 MENIT**

---

## 1.3 LEFT JOIN (60 menit)

### 🧠 Konsep

`LEFT JOIN` mengembalikan **semua baris dari tabel kiri**, ditambah pasangannya dari tabel kanan jika ada. Jika tidak ada pasangan, kolom tabel kanan diisi **`NULL`**.

> Analogi: daftar absensi seluruh mahasiswa (kiri) dengan nilai ujian (kanan). Semua mahasiswa tetap tertulis. Yang belum ujian nilainya kosong.

### ⌨️ Latihan 1.3.1: Semua pelanggan beserta pesanannya

```sql
SELECT c.id, c.name, o.id AS order_id, o.order_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
ORDER BY c.id;
```

🔮 **Prediksi:** ada 6 pelanggan dan 6 pesanan milik pelanggan. Berapa baris hasilnya? Apa isi kolom `order_id` untuk Eko?

✅ **Cek Hasil:** **8 baris**. Andi muncul 2× dan Budi 2× karena masing-masing punya 2 pesanan. Eko dan Fina tetap tampil dengan `order_id` dan `order_date` bernilai `NULL`.

### 🧠 Perbandingan Langsung

Jalankan versi `INNER JOIN` dari query yang sama dan bandingkan:

| Query | Jumlah baris | Eko & Fina |
|---|---|---|
| `customers INNER JOIN orders` | 6 | Hilang |
| `customers LEFT JOIN orders` | 8 | Tampil dengan `NULL` |

Perbedaan 2 baris itulah **pelanggan tanpa pesanan**.

### ⌨️ Latihan 1.3.2: Mengganti `NULL` yang kurang ramah

```sql
SELECT c.name,
       COALESCE(o.id, 0)  AS order_id,
       COALESCE(o.status, 'Belum pernah memesan') AS status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
```

`COALESCE(a, b)` mengembalikan nilai pertama yang **bukan `NULL`**.

> 💡 **Insight Industri: `COALESCE` adalah standar SQL** dan didukung semua database besar (MySQL, PostgreSQL, SQL Server, Oracle). Sedangkan `IFNULL` hanya ada di MySQL, dan `NVL` hanya ada di Oracle. Pilih `COALESCE` agar querymu portabel.

### ⌨️ Latihan 1.3.3: Semua produk beserta kategorinya

```sql
SELECT p.name AS product_name,
       COALESCE(c.name, 'Belum dikategorikan') AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

✅ **Cek Hasil:** **8 baris**. Powerbank tampil dengan kategori "Belum dikategorikan". Bandingkan dengan Mini-Challenge 1.2 (7 baris).

### ⌨️ Latihan 1.3.4: Urutan tabel itu penting!

Balik posisi tabelnya:

```sql
SELECT c.name AS category_name, p.name AS product_name
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
ORDER BY c.name;
```

🔮 **Prediksi:** Kategori mana yang produknya `NULL`?

✅ **Cek Hasil:** **8 baris**. Kategori **Olahraga** tampil dengan `product_name` = `NULL`. Powerbank **tidak** muncul, karena ia tidak punya kategori dan sekarang berada di sisi kanan.

> 🧠 Perhatikan bahwa `products LEFT JOIN categories` dan `categories LEFT JOIN products` menghasilkan data **berbeda**. Pada `LEFT JOIN`, **tabel yang ditulis di `FROM` adalah tabel yang "dilindungi"**.

### ⌨️ Latihan 1.3.5: Menemukan data tanpa pasangan (pengenalan anti-join)

Karena baris tanpa pasangan bernilai `NULL`, kita bisa menyaringnya:

```sql
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

✅ **Cek Hasil:** Eko Wijaya dan Fina Rahma, yaitu pelanggan yang belum pernah memesan. Teknik ini sangat sering dipakai di dunia kerja untuk mencari "pelanggan tidur", "produk tak laku", dan sejenisnya. Kita akan membahasnya lebih dalam di Pertemuan 2.

> ⚠️ Gunakan `IS NULL`, bukan `= NULL`. Perbandingan apa pun dengan `NULL` memakai `=` selalu menghasilkan *unknown*, bukan *true*.

### ⌨️ Latihan 1.3.6: LEFT JOIN berantai

Tampilkan **semua pelanggan** beserta produk yang pernah dibelinya. Pelanggan tanpa pembelian tetap tampil:

```sql
SELECT c.name AS customer_name,
       o.id   AS order_id,
       p.name AS product_name
FROM customers c
LEFT JOIN orders      o  ON o.customer_id = c.id
LEFT JOIN order_items oi ON oi.order_id   = o.id
LEFT JOIN products    p  ON oi.product_id = p.id
ORDER BY c.name, o.id;
```

✅ **Cek Hasil:** **11 baris** (9 item pesanan pelanggan + Eko + Fina).

> ⚠️ **Jangan mencampur `LEFT` lalu `INNER` dalam satu rantai tanpa sengaja.** Jika baris ketiga diubah menjadi `INNER JOIN order_items`, Eko dan Fina akan **hilang lagi**. `INNER JOIN` setelah `LEFT JOIN` membuang baris `NULL` yang sudah susah payah dipertahankan.

> 💡 **Insight Industri: `LEFT JOIN` adalah JOIN yang paling sering dipakai untuk laporan**, karena laporan bisnis jarang boleh "kehilangan" baris. Jika manajer meminta "semua pelanggan", angka 6 harus muncul, bukan 4.

---

## 1.4 RIGHT JOIN (30 menit)

### 🧠 Konsep

`RIGHT JOIN` adalah **cermin** dari `LEFT JOIN`: semua baris **tabel kanan** dipertahankan, kolom kiri diisi `NULL` jika tidak ada pasangan.

### ⌨️ Latihan 1.4.1: Semua pesanan, termasuk pesanan tamu

```sql
SELECT o.id AS order_id, o.order_date, c.name AS customer_name
FROM customers c
RIGHT JOIN orders o ON o.customer_id = c.id
ORDER BY o.id;
```

✅ **Cek Hasil:** **7 baris**. Pesanan #7 muncul dengan `customer_name` = `NULL`.

### 🧠 Fakta Penting: RIGHT JOIN = LEFT JOIN yang tabelnya ditukar

Query berikut menghasilkan data yang **sama persis** dengan latihan 1.4.1:

```sql
SELECT o.id AS order_id, o.order_date, c.name AS customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.id;
```

> 💡 **Insight Industri: di tim profesional, `RIGHT JOIN` hampir tidak dipakai.** Alasannya adalah keterbacaan. Otak kita membaca dari kiri ke kanan: *"mulai dari tabel utama, lalu tambahkan info pendukung."* Konvensi yang umum dipakai: **tabel utama di `FROM`, lalu gunakan `LEFT JOIN`**. Kamu tetap perlu paham `RIGHT JOIN` karena akan menemukannya di *legacy code* atau query buatan orang lain.

### ⌨️ Latihan 1.4.2: Buktikan sendiri

Tulis ulang Latihan 1.3.1 (semua pelanggan + pesanannya) memakai `RIGHT JOIN`, lalu bandingkan hasilnya dengan versi `LEFT JOIN`.

---

## 1.5 Rangkuman & Cheat Sheet Pertemuan 1

| Pertanyaan bisnis | JOIN yang dipilih |
|---|---|
| "Tampilkan pesanan **yang pelanggannya diketahui**" | `INNER JOIN` |
| "Tampilkan **semua** pelanggan, termasuk yang belum pesan" | `customers LEFT JOIN orders` |
| "Tampilkan **semua** produk, termasuk yang tak punya kategori" | `products LEFT JOIN categories` |
| "Tampilkan **semua** pesanan, termasuk pesanan tamu" | `orders LEFT JOIN customers` (atau `RIGHT JOIN` versi terbalik) |

**Tiga kalimat untuk diingat:**

1. `INNER` berarti **irisan**: hanya yang cocok.
2. `LEFT` berarti **lindungi tabel kiri** (tabel di `FROM`).
3. Baris tanpa pasangan akan berisi `NULL` di kolom tabel yang tidak punya pasangan.

### ⚠️ Kesalahan Umum Pemula

| Gejala | Penyebab | Solusi |
|---|---|---|
| `Column 'id' ... is ambiguous` | Kolom sama ada di 2 tabel | Beri prefix alias (`o.id`) |
| Jumlah baris lebih sedikit dari dugaan | Memakai `INNER JOIN` padahal butuh `LEFT JOIN` | Pikirkan: "baris tanpa pasangan boleh hilang?" |
| Hasil berlipat ganda | `ON` salah / lupa `ON` | Pastikan `ON` menghubungkan **FK = PK** |
| `Unknown column 'c.name'` | Alias tidak cocok dengan yang ditulis di `FROM` | Cek penulisan alias |

---

## 📝 LEMBAR KERJA PRAKTIKUM 1
### INNER JOIN, LEFT JOIN, dan RIGHT JOIN

**Petunjuk Pengerjaan**

- Gunakan database `nusantara_mart`.
- Tulis **query** dan **jumlah baris hasil** untuk setiap soal.
- Beri alias pada semua tabel dan gunakan prefix pada semua kolom. **Jangan** memakai `SELECT *`.
- Soal bertanda ✍️ dijawab dengan kalimat singkat.
- Simpan semua jawaban dalam satu file `lembar-kerja-1-NIM.sql` (jawaban tertulis dalam bentuk komentar `-- ...`).

### Bagian A: INNER JOIN

1. Tampilkan **nama produk** dan **nama kategori**-nya. Berapa jumlah baris hasilnya?
2. Tampilkan **id pesanan**, **tanggal pesanan**, dan **nama pelanggan**. Berapa baris yang muncul? ✍️ Mengapa jumlahnya tidak sama dengan jumlah baris tabel `orders`?
3. Tampilkan pesanan (id, tanggal, status, nama pelanggan) milik pelanggan dari kota **Jember**.
4. Tampilkan produk kategori **Elektronik** dengan harga di atas **100.000**, urut dari harga **tertinggi**. Kolom: nama produk, nama kategori, harga.
5. Tampilkan detail item pesanan: `order_id`, nama produk, `quantity`, dan `unit_price`.
6. Kembangkan soal 5: tambahkan kolom `subtotal` (`quantity × unit_price`), lalu urutkan dari subtotal **terbesar**.

### Bagian B: LEFT JOIN

7. Tampilkan **semua pelanggan** beserta id pesanannya. Pelanggan tanpa pesanan tetap harus tampil.
8. ✍️ Berapa baris hasil soal 7? Bandingkan dengan `INNER JOIN` pada query yang sama. Jelaskan penyebab selisih jumlah barisnya.
9. Tampilkan **hanya pelanggan yang belum pernah memesan** (nama dan kota).
10. Tampilkan **semua produk** beserta nama kategorinya. Jika produk belum punya kategori, tampilkan teks `'Belum dikategorikan'` memakai `COALESCE`.
11. Tampilkan **semua kategori** beserta nama produknya. Kategori apa yang belum memiliki produk?
12. Tampilkan **semua produk** beserta `order_id` tempat produk itu dibeli (`products LEFT JOIN order_items`). Produk apa yang tidak punya `order_id`?

### Bagian C: RIGHT JOIN

13. Tulis ulang query soal 7 menggunakan **`RIGHT JOIN`** (hasil harus sama).
14. Tampilkan **semua pesanan** beserta nama pelanggannya memakai `customers RIGHT JOIN orders`. Pesanan nomor berapa yang tidak memiliki nama pelanggan?
15. Tulis ulang soal 14 memakai **`LEFT JOIN`** dengan hasil yang sama. ✍️ Menurutmu, versi mana yang lebih mudah dibaca? Mengapa?

### Bagian D: Gabungan

16. Tampilkan laporan lengkap dengan **empat tabel** (INNER JOIN): nama pelanggan, id pesanan, nama produk, dan quantity. Berapa baris hasilnya?
17. Dari soal 16, saring hanya pesanan berstatus **`completed`** dan urutkan berdasarkan tanggal pesanan.
18. Tampilkan semua pesanan dengan tanggal **setelah 2026-10-05**, lengkap dengan nama pelanggan. Pesanan tamu tetap tampil dengan tulisan `'Tamu'` pada nama pelanggannya.
19. Tampilkan **nama produk yang pernah dipesan** beserta nama kategorinya, **tanpa duplikat** (gunakan `DISTINCT`). Produk tanpa kategori tetap tampil.
20. ✍️ **Studi kasus:** Manajer meminta laporan *"seluruh pelanggan beserta jumlah pesanannya, termasuk yang belum pernah belanja"*. Jenis JOIN apa yang kamu pilih dan tabel mana yang ditulis di `FROM`? Jelaskan alasannya dalam 2–3 kalimat, lalu tulis querynya (cukup `SELECT` nama pelanggan dan id pesanan).

---

<a id="pertemuan-2"></a>
# PERTEMUAN 2
## FULL JOIN, Anti-Join, dan JOIN Tingkat Industri

---

## 2.1 Review Singkat (15 menit)

Jawab tanpa melihat catatan (diskusikan dengan teman sebangku):

1. Query `orders JOIN customers` menghasilkan 6 baris. Pesanan mana yang hilang dan mengapa?
2. Apa beda `customers LEFT JOIN orders` dengan `orders LEFT JOIN customers`?
3. Bagaimana cara menampilkan pelanggan yang belum pernah memesan?

Pastikan database `nusantara_mart` masih lengkap. Jika ragu, jalankan ulang skrip dari bagian **Persiapan**.

---

## 2.2 FULL JOIN (45 menit)

### 🧠 Konsep

`FULL JOIN` (nama lengkap: `FULL OUTER JOIN`) mengembalikan **semua baris dari kedua tabel**:

- baris yang cocok akan digabung,
- baris kiri tanpa pasangan tetap tampil (kolom kanan `NULL`),
- baris kanan tanpa pasangan tetap tampil (kolom kiri `NULL`).

Dengan kata lain: **`LEFT JOIN` + `RIGHT JOIN` dalam satu hasil**.

### ⚠️ Fakta Penting: MySQL tidak punya `FULL JOIN`

| Database | Dukungan `FULL JOIN` |
|---|---|
| PostgreSQL, SQL Server, Oracle, SQLite (≥ 3.39) | ✅ Didukung |
| **MySQL, MariaDB** | ❌ **Tidak didukung** |

Jika kamu menjalankan `FULL JOIN` di MySQL, akan muncul *syntax error*. Cara mengatasinya adalah **meniru** `FULL JOIN` dengan menggabungkan `LEFT JOIN` dan `RIGHT JOIN`.

### ⌨️ Latihan 2.2.1: Meniru FULL JOIN di MySQL

Kita ingin melihat **semua pelanggan dan semua pesanan** sekaligus:

```sql
SELECT c.id AS customer_id, c.name AS customer_name, o.id AS order_id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id

UNION ALL

SELECT c.id, c.name, o.id
FROM customers c
RIGHT JOIN orders o ON o.customer_id = c.id
WHERE c.id IS NULL;
```

**Cara membacanya:**

| Bagian | Isi |
|---|---|
| Query atas (`LEFT JOIN`) | Semua pelanggan + pasangannya (8 baris, termasuk Eko & Fina) |
| Query bawah (`RIGHT JOIN` + `WHERE c.id IS NULL`) | **Hanya** pesanan tanpa pelanggan (1 baris, yaitu pesanan #7) |
| `UNION ALL` | Menyambung keduanya tanpa membuang baris |

🔮 **Prediksi:** berapa total barisnya?

✅ **Cek Hasil:** **9 baris** = 6 baris cocok + Eko + Fina + pesanan #7.

> 💡 **Insight Industri: gunakan `UNION ALL`, bukan `UNION`.** `UNION` otomatis membuang baris duplikat (dan itu memperlambat query karena ada proses pengurutan). Pada data yang sah, dua baris yang identik bisa saja valid, misalnya dua item pesanan yang sama. `WHERE c.id IS NULL` pada query bawah sudah memastikan tidak ada baris yang tumpang tindih, sehingga `UNION ALL` aman dan lebih cepat.

### 🧠 Versi PostgreSQL (hanya untuk referensi)

Di PostgreSQL atau SQL Server, cukup:

```sql
SELECT c.id, c.name, o.id
FROM customers c
FULL JOIN orders o ON o.customer_id = c.id;
```

### ⌨️ Latihan 2.2.2: FULL JOIN produk dan kategori

```sql
SELECT p.name AS product_name, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id

UNION ALL

SELECT p.name, c.name
FROM products p
RIGHT JOIN categories c ON p.category_id = c.id
WHERE p.id IS NULL;
```

✅ **Cek Hasil:** **9 baris** (7 cocok + Powerbank tanpa kategori + kategori Olahraga tanpa produk).

### ⌨️ Latihan 2.2.3: Menandai jenis baris dengan `CASE`

Laporan audit data sering membutuhkan keterangan jenis masalahnya. Tambahkan kolom `data_status` pada **masing-masing** bagian query:

```sql
SELECT c.name AS customer_name, o.id AS order_id,
       CASE WHEN o.id IS NULL THEN 'Pelanggan tanpa pesanan'
            ELSE 'Normal'
       END AS data_status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id

UNION ALL

SELECT c.name, o.id, 'Pesanan tanpa pelanggan'
FROM customers c
RIGHT JOIN orders o ON o.customer_id = c.id
WHERE c.id IS NULL;
```

✅ **Cek Hasil:** 9 baris. Eko dan Fina berstatus *Pelanggan tanpa pesanan*, pesanan #7 berstatus *Pesanan tanpa pelanggan*, dan sisanya *Normal*.

> 🧠 `FULL JOIN` jarang dipakai untuk laporan harian. Kegunaan utamanya adalah **audit dan rekonsiliasi data**, yaitu membandingkan dua sumber data dan mencari yang tidak cocok, misalnya mencocokkan data transaksi aplikasi dengan data dari payment gateway.

---

## 2.3 Anti-Join: Mencari Data Tanpa Pasangan (45 menit)

### 🧠 Konsep

**Anti-join** adalah pola untuk menjawab pertanyaan **"mana yang TIDAK punya…?"** Contoh pertanyaan bisnis:

- Pelanggan mana yang belum pernah belanja? (untuk kampanye promo)
- Produk mana yang tidak pernah terjual? (untuk cuci gudang)
- Kategori mana yang masih kosong?

Teknik anti-join yang dipelajari di modul ini adalah **`LEFT JOIN … IS NULL`**. (Ada cara lain memakai subquery, yang akan dibahas di modul berikutnya.)

### ⌨️ Pola `LEFT JOIN … IS NULL`

```sql
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

**Cara membacanya:**

1. `LEFT JOIN` mempertahankan **semua** pelanggan, termasuk yang tidak punya pasangan.
2. Pelanggan tanpa pasangan memiliki `o.id` bernilai `NULL`.
3. `WHERE o.id IS NULL` menyaring **hanya** baris tanpa pasangan itu.

🔮 **Prediksi:** siapa yang muncul?
✅ **Cek Hasil:** Eko Wijaya dan Fina Rahma.

> ⚠️ **Pilih kolom yang pasti terisi untuk dicek `IS NULL`.** Gunakan PK tabel kanan (`o.id`), yang tidak mungkin `NULL` pada baris yang benar-benar berpasangan. Jika memakai kolom yang boleh `NULL` (misalnya `o.customer_id`), kamu bisa salah menyaring.

> 💡 **Insight Industri:** pola ini dipakai untuk kampanye "pelanggan tidur", pembersihan produk tak laku, dan pencarian data yatim (*orphan*) sebelum migrasi database.

### ⌨️ Latihan 2.3.1: Produk yang belum pernah terjual

```sql
SELECT p.id, p.name, p.stock
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.id IS NULL;
```

✅ **Cek Hasil:** Headset Gaming.

### ⌨️ Latihan 2.3.2: Kategori kosong

Tulis query sendiri untuk menampilkan **kategori yang belum punya produk**.
✅ Hasil: Olahraga.

---

☕ **ISTIRAHAT 15 MENIT**

---

## 2.4 Jebakan `ON` vs `WHERE`, Duplikasi Baris, dan `NULL` (45 menit)

### 🧠 Jebakan 1: Syarat di `ON` vs di `WHERE` pada LEFT JOIN

**Kasus:** tampilkan semua pelanggan beserta pesanan yang berstatus **completed**.

### ⌨️ Versi A: syarat di `ON`

```sql
SELECT c.name, o.id AS order_id, o.status
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'completed'
ORDER BY c.name;
```

### ⌨️ Versi B: syarat di `WHERE`

```sql
SELECT c.name, o.id AS order_id, o.status
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'completed'
ORDER BY c.name;
```

🔮 **Prediksi:** berapa baris masing-masing? Apakah Eko, Fina, dan Citra muncul?

✅ **Cek Hasil:**

| Versi | Baris | Eko, Fina, Citra |
|---|---|---|
| A (`ON`) | **7** | Tampil, kolom pesanan `NULL` |
| B (`WHERE`) | **4** | **Hilang** |

**Penjelasannya:**

- `ON` bekerja **saat penggabungan**: pesanan yang tidak memenuhi syarat dianggap *tidak berpasangan*, tetapi pelanggannya tetap dipertahankan oleh `LEFT JOIN`.
- `WHERE` bekerja **setelah penggabungan**: baris yang kolom `status`-nya `NULL` (Eko, Fina) atau `cancelled` (Citra) langsung disaring. Hasilnya `LEFT JOIN` berubah diam-diam menjadi `INNER JOIN`.

> 🧠 **Aturan praktis:**
> - Syarat pada tabel **kanan** yang ingin tetap mempertahankan baris kiri → taruh di **`ON`**.
> - Syarat pada tabel **kiri** (tabel utama) → taruh di **`WHERE`**.

### 🧠 Jebakan 2: Duplikasi Baris (Fan-out)

Ketika satu baris kiri berpasangan dengan **banyak** baris kanan, baris kiri **diduplikasi**. Satu pesanan punya banyak item, sehingga ikut menggandakan pesanan saat di-JOIN dengan `order_items`.

### ⌨️ Latihan: Lihat sendiri efeknya

```sql
SELECT COUNT(*) AS total_baris,
       COUNT(DISTINCT o.id) AS total_pesanan
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id   = o.id
WHERE c.name = 'Andi Pratama';
```

✅ **Cek Hasil:** `total_baris` = **3**, `total_pesanan` = **2**. Andi hanya punya 2 pesanan, tetapi karena pesanan #1 memiliki 2 item, hasil JOIN-nya 3 baris.

> ⚠️ **Ini penyebab nomor satu laporan omzet yang salah di dunia kerja.** Jika kamu menjumlahkan kolom milik `orders` (misalnya `shipping_cost`) setelah JOIN ke `order_items`, nilainya terhitung **berkali-kali**. Selalu tanyakan: *"Apakah JOIN ini menggandakan baris yang sedang kuhitung?"* Gunakan `COUNT(DISTINCT …)` atau pastikan kolom yang dijumlahkan berasal dari tabel yang tidak ikut menggandakan baris.

### 🧠 Jebakan 3: `NULL` tidak pernah sama dengan `NULL`

Pesanan #7 memiliki `customer_id` = `NULL`. Kondisi `o.customer_id = c.id` bernilai *unknown* (bukan *true*) ketika salah satu sisinya `NULL`. Itulah sebabnya pesanan tamu **tidak pernah** berpasangan dengan pelanggan mana pun, bahkan dengan sesama `NULL`.

---

## 2.5 JOIN + Agregasi, VIEW, dan Performa (30 menit)

### ⌨️ Latihan 2.5.1: Laporan jumlah pesanan selesai per pelanggan

Gabungan dari yang sudah kamu pelajari: `LEFT JOIN`, syarat di `ON`, agregasi, dan `COALESCE`:

```sql
SELECT c.name AS customer_name,
       COUNT(o.id) AS completed_orders
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'completed'
GROUP BY c.id, c.name
ORDER BY completed_orders DESC, c.name;
```

✅ **Cek Hasil:** Andi 2, Budi 1, Dewi 1, sedangkan Citra, Eko, dan Fina bernilai 0.

> 🧠 Gunakan `COUNT(o.id)` (kolom tabel kanan), bukan `COUNT(*)`. `COUNT(*)` akan menghitung baris `NULL` milik Eko sebagai **1**, padahal ia tidak punya pesanan. `COUNT(o.id)` mengabaikan `NULL` sehingga hasilnya benar (0).

### ⌨️ Latihan 2.5.2: Total belanja per pelanggan

```sql
SELECT c.name AS customer_name,
       COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_spent
FROM customers c
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'completed'
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;
```

✅ **Cek Hasil:** Andi **9.800.000**, Dewi **375.000**, Budi **210.000**, lalu Citra, Eko, Fina bernilai **0**.

### ⌨️ Latihan 2.5.3: Membuat VIEW agar JOIN tidak ditulis ulang

Query 4 tabel yang panjang tidak perlu diketik berulang. Simpan sebagai **VIEW**:

```sql
CREATE OR REPLACE VIEW v_order_details AS
SELECT o.id                  AS order_id,
       o.order_date,
       o.status,
       COALESCE(c.name, 'Tamu') AS customer_name,
       p.name                AS product_name,
       oi.quantity,
       oi.unit_price,
       oi.quantity * oi.unit_price AS subtotal
FROM orders o
LEFT JOIN customers   c  ON o.customer_id = c.id
JOIN      order_items oi ON oi.order_id   = o.id
JOIN      products    p  ON oi.product_id = p.id;
```

Sekarang laporan cukup ditulis sederhana:

```sql
SELECT * FROM v_order_details WHERE status = 'completed' AND customer_name = 'Tamu';
SELECT order_id, SUM(subtotal) AS total FROM v_order_details GROUP BY order_id;
```

> 💡 **Insight Industri:** VIEW dipakai untuk **menyembunyikan kerumitan JOIN** dari tim lain (analis data, dashboard BI, atau API). Jika struktur tabel berubah, cukup perbaiki satu VIEW, tidak perlu mengubah puluhan query.

### 🧠 Performa: Index pada Foreign Key

JOIN akan lambat jika kolom penghubungnya **tidak punya index**. Database harus memeriksa tabel baris demi baris (*full table scan*).

```sql
SHOW INDEX FROM orders;
```

Kamu akan melihat index `fk_orders_customer`. **MySQL (InnoDB) otomatis membuat index untuk Foreign Key.**

> ⚠️ **PostgreSQL TIDAK otomatis membuat index untuk FK.** Di PostgreSQL kamu harus membuatnya sendiri:
> ```sql
> CREATE INDEX idx_orders_customer_id ON orders (customer_id);
> ```
> Lupa membuat index pada kolom FK adalah penyebab klasik halaman aplikasi yang lambat setelah data mencapai jutaan baris.

### ⌨️ Latihan 2.5.4: Membaca `EXPLAIN`

```sql
EXPLAIN
SELECT c.name, o.id
FROM customers c
JOIN orders o ON o.customer_id = c.id;
```

Perhatikan kolom `key` (index yang dipakai), `type` (cara akses: `ref`/`eq_ref` bagus, `ALL` berarti scan seluruh tabel), dan `rows` (perkiraan baris yang diperiksa).

Untuk filter yang sering dipakai pada tabel besar, buat index gabungan:

```sql
CREATE INDEX idx_orders_status_date ON orders (status, order_date);
```

### 💡 Insight Industri: Hindari Masalah N+1 di Aplikasi

Kesalahan yang sering muncul saat membuat aplikasi: mengambil daftar pesanan, lalu **mengulang** satu query per pesanan untuk mengambil nama pelanggan.

```php
// ❌ N+1: 1 query untuk orders + N query untuk customer (lambat)
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->name;   // query baru di setiap perulangan!
}

// ✅ Eager loading: hanya 2 query, tidak peduli berapa banyak data
$orders = Order::with('customer')->get();
```

`with()` di Laravel (dan `includes` di Rails atau `select_related` di Django) memakai prinsip yang sama dengan JOIN: mengambil data berelasi **sekaligus**, bukan satu per satu. Memahami JOIN membantumu mengerti apa yang sebenarnya terjadi di balik ORM.

### 💡 Insight Industri: Checklist Menulis JOIN yang Baik

| ✅ Lakukan | ❌ Hindari |
|---|---|
| `JOIN … ON` eksplisit | `FROM a, b WHERE a.id = b.a_id` (gaya lama, mudah lupa kondisi) |
| Alias pendek + prefix kolom | Kolom tanpa prefix |
| Menyebut kolom yang dibutuhkan saja | `SELECT *` pada query produksi |
| Tabel utama di `FROM` + `LEFT JOIN` | `RIGHT JOIN` yang membingungkan |
| `COALESCE` untuk menangani `NULL` | Menampilkan `NULL` mentah ke pengguna akhir |
| `LEFT JOIN … IS NULL` untuk mencari data tanpa pasangan | `WHERE kolom = NULL` (harus `IS NULL`) |
| Index pada kolom FK dan kolom filter utama | Membiarkan JOIN pada kolom tanpa index di tabel besar |
| `EXPLAIN` untuk query yang lambat | Menebak-nebak penyebab lambat |

---

## 2.6 Cheat Sheet Akhir

```sql
-- INNER: hanya yang cocok
FROM a JOIN b ON a.fk = b.id

-- LEFT: semua a, pasangan b (jika ada)
FROM a LEFT JOIN b ON a.fk = b.id

-- RIGHT: semua b, pasangan a (jika ada)  -> lebih baik tulis ulang sebagai LEFT
FROM a RIGHT JOIN b ON a.fk = b.id

-- FULL di MySQL: LEFT + (RIGHT yang tidak cocok)
SELECT ... FROM a LEFT JOIN b ON ...
UNION ALL
SELECT ... FROM a RIGHT JOIN b ON ... WHERE a.id IS NULL

-- ANTI-JOIN: data milik a yang tidak punya pasangan di b
FROM a LEFT JOIN b ON a.id = b.fk WHERE b.id IS NULL
```

| Pertanyaan yang perlu ditanyakan sebelum memilih JOIN |
|---|
| 1. Baris mana yang **harus tetap muncul** walau tidak berpasangan? (jawabannya menentukan tabel yang dilindungi) |
| 2. Apakah JOIN ini akan **menggandakan** baris yang sedang saya hitung? |
| 3. Syarat tambahan ini sebaiknya di **`ON`** atau **`WHERE`**? |
| 4. Kolom penghubungnya sudah **ter-index**? |

---

## 📝 LEMBAR KERJA PRAKTIKUM 2
### FULL JOIN, Anti-Join, dan JOIN Tingkat Lanjut

**Petunjuk Pengerjaan**

- Gunakan database `nusantara_mart` (kondisi data awal, tanpa perubahan).
- Tulis **query** dan **jumlah baris hasil** untuk setiap soal.
- Gunakan alias dan prefix kolom. **Jangan** memakai `SELECT *` (kecuali pada soal yang meminta membaca dari VIEW).
- Soal bertanda ✍️ dijawab dengan kalimat singkat.
- Simpan jawaban dalam satu file `lembar-kerja-2-NIM.sql` (jawaban tertulis dalam bentuk komentar `-- ...`).

### Bagian A: FULL JOIN (di MySQL)

1. Tampilkan **semua pelanggan dan semua pesanan** (nama pelanggan dan id pesanan) menggunakan teknik `LEFT JOIN` + `UNION ALL` + `RIGHT JOIN`. Berapa baris hasilnya?
2. Tampilkan **semua produk dan semua kategori** (nama produk dan nama kategori) dengan teknik yang sama. Berapa baris hasilnya?
3. Kembangkan soal 1: tambahkan kolom `keterangan` memakai `CASE` dengan nilai `'Pelanggan tanpa pesanan'`, `'Pesanan tanpa pelanggan'`, atau `'Normal'`.
4. ✍️ Pada soal 2, bagian query mana (atas atau bawah) yang menghasilkan baris **kategori tanpa produk**? Mengapa bagian bawah harus diberi `WHERE p.id IS NULL`, dan apa yang terjadi jika `WHERE` tersebut dihapus?

### Bagian B: Anti-Join

5. Tampilkan pelanggan yang **belum pernah memesan** memakai `LEFT JOIN … IS NULL`.
6. Tampilkan **kategori yang belum memiliki produk** memakai `LEFT JOIN … IS NULL`.
7. Tampilkan produk yang **belum pernah terjual** (nama dan stok).
8. Tampilkan pelanggan dari **Jember** yang **belum pernah memiliki pesanan berstatus `completed`**. *(Petunjuk: perhatikan letak syarat `status` di `ON` atau `WHERE`.)*

### Bagian C: `ON` vs `WHERE`

9. Tampilkan semua pelanggan beserta pesanan berstatus `completed` dengan syarat status ditulis di **`ON`**. Berapa baris hasilnya?
10. Ulangi soal 9 dengan syarat status ditulis di **`WHERE`**. Berapa baris hasilnya? ✍️ Pelanggan siapa yang hilang dan mengapa?
11. Tampilkan semua pelanggan beserta **jumlah pesanan `completed`** miliknya (0 jika tidak ada). Gunakan `COUNT(o.id)`.

### Bagian D: JOIN + Agregasi

12. Tampilkan **jumlah produk per kategori**, termasuk kategori yang belum punya produk (jumlahnya 0).
13. Tampilkan **total belanja per pelanggan** dari pesanan `completed` (`SUM(quantity × unit_price)`), urut dari terbesar. Pelanggan tanpa belanja tampil dengan nilai 0.
14. Tampilkan **omzet per kategori** (dari seluruh pesanan `completed`). Produk tanpa kategori dikelompokkan dalam `'Tanpa Kategori'`.
15. Tampilkan **3 produk terlaris** berdasarkan total `quantity` yang terjual.
16. Tampilkan **jumlah pesanan per kota pelanggan** (`COUNT(DISTINCT o.id)`), hanya untuk kota yang memiliki **lebih dari 1 pesanan**.

### Bagian E: Duplikasi, VIEW, dan Performa

17. Jalankan `COUNT(*)` dan `COUNT(DISTINCT o.id)` pada JOIN `customers → orders → order_items` untuk pelanggan **Budi Santoso**. ✍️ Mengapa dua angka itu berbeda?
18. Buat VIEW `v_order_details` seperti pada materi (jika belum), lalu tampilkan semua baris dari VIEW tersebut untuk **pesanan nomor 3**.
19. Jalankan `EXPLAIN` pada query `orders JOIN customers`. ✍️ Sebutkan nilai kolom `key` dan `type` yang kamu temukan. Kemudian buat index gabungan `idx_orders_status_date` pada `orders (status, order_date)` dan tulis satu query yang akan memanfaatkannya.
20. ✍️ **Studi kasus akhir:** Tim bisnis meminta tiga laporan berikut. Untuk masing-masing, tentukan **jenis JOIN**, **tabel yang ditulis di `FROM`**, dan **alasannya**:
    - (a) Daftar pelanggan yang belum pernah belanja untuk kampanye promo.
    - (b) Daftar semua pesanan beserta nama pelanggannya, termasuk pesanan tamu, untuk laporan harian admin.
    - (c) Audit data: temukan pesanan tanpa pelanggan **dan** pelanggan tanpa pesanan dalam satu hasil.

---

<a id="pengayaan"></a>
# MATERI PENGAYAAN
## SELF JOIN dan CROSS JOIN

> Materi ini **opsional**: dikerjakan sebagai penutup jika waktu tersisa, atau secara mandiri di rumah. Syarat: Pertemuan 1 dan 2 sudah dipahami.

### 🧠 Dua jenis JOIN lain

| JOIN | Gagasan | Butuh `ON`? | Contoh kebutuhan |
|---|---|---|---|
| `SELF JOIN` | Sebuah tabel di-JOIN dengan **dirinya sendiri** | Ya | Karyawan dan atasannya, pelanggan sekota |
| `CROSS JOIN` | **Semua kombinasi** baris tabel kiri × tabel kanan | Tidak | Varian produk (ukuran × warna), matriks laporan |

`SELF JOIN` **bukan** sintaks baru. Ia memakai `JOIN` biasa (`INNER`/`LEFT`) pada tabel yang sama, dengan **alias berbeda** supaya database bisa membedakan "peran" kedua salinan tabel tersebut.

### ⌨️ Persiapan Data Pengayaan

Tabel ini ditambahkan ke database `nusantara_mart` yang sama:

```sql
USE nusantara_mart;

-- Karyawan Nusantara Mart (manager_id menunjuk ke id karyawan lain di tabel yang sama)
CREATE TABLE staff (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    position   VARCHAR(50)  NOT NULL,
    manager_id INT NULL,
    CONSTRAINT fk_staff_manager FOREIGN KEY (manager_id) REFERENCES staff(id)
);

INSERT INTO staff (id, name, position, manager_id) VALUES
(1, 'Rina Kusuma',    'Store Manager',       NULL),
(2, 'Dimas Aditya',   'Supervisor Gudang',   1),
(3, 'Sari Wulandari', 'Supervisor CS',       1),
(4, 'Joko Susilo',    'Staf Gudang',         2),
(5, 'Lina Marlina',   'Staf Gudang',         2),
(6, 'Tono Hartono',   'Customer Service',    3);

-- Pilihan ukuran dan warna untuk varian produk
CREATE TABLE sizes  (size_code  VARCHAR(5)  PRIMARY KEY);
CREATE TABLE colors (color_name VARCHAR(20) PRIMARY KEY);
INSERT INTO sizes  (size_code)  VALUES ('S'), ('M'), ('L'), ('XL');
INSERT INTO colors (color_name) VALUES ('Hitam'), ('Putih'), ('Navy');
```

---

## P.1 SELF JOIN

### 🧠 Konsep

Tabel `staff` menyimpan **atasan** dalam kolom `manager_id`, yang isinya adalah `id` karyawan lain di tabel yang sama. Untuk menampilkan **nama** atasan, tabel `staff` harus dipakai **dua kali**: satu sebagai "karyawan", satu sebagai "atasan".

```
staff AS s (karyawan)              staff AS m (atasan)
┌────┬──────────────┬────────────┐  ┌────┬──────────────┐
│ id │ name         │ manager_id │  │ id │ name         │
├────┼──────────────┼────────────┤  ├────┼──────────────┤
│  4 │ Joko Susilo  │     2 ─────┼──▶  2 │ Dimas Aditya │
└────┴──────────────┴────────────┘  └────┴──────────────┘
```

### ⌨️ Latihan P.1.1: Karyawan beserta atasannya

```sql
SELECT s.name AS employee,
       s.position,
       COALESCE(m.name, '— (pimpinan tertinggi)') AS manager
FROM staff s
LEFT JOIN staff m ON s.manager_id = m.id
ORDER BY s.id;
```

🔮 **Prediksi:** berapa baris? Apa yang terjadi pada Rina jika memakai `INNER JOIN`?

✅ **Cek Hasil:** **6 baris** dengan `LEFT JOIN`. Dengan `INNER JOIN` hanya **5 baris**, karena Rina tidak punya atasan (`manager_id` = `NULL`) sehingga hilang. Prinsipnya sama dengan pesanan tamu di Pertemuan 1.

### ⌨️ Latihan P.1.2: Jumlah bawahan setiap atasan

Sekarang peran dibalik: `m` sebagai tabel utama, `s` sebagai bawahannya.

```sql
SELECT m.name AS manager,
       COUNT(s.id) AS jumlah_bawahan
FROM staff m
LEFT JOIN staff s ON s.manager_id = m.id
GROUP BY m.id, m.name
ORDER BY jumlah_bawahan DESC, m.name;
```

✅ **Cek Hasil:** Dimas 2, Rina 2, Sari 1, sedangkan Joko, Lina, dan Tono bernilai 0.

### ⌨️ Latihan P.1.3: Dua tingkat atasan

Satu `SELF JOIN` naik **satu** tingkat. Untuk naik dua tingkat, tambahkan satu JOIN lagi:

```sql
SELECT s.name  AS employee,
       m.name  AS manager,
       gm.name AS manager_of_manager
FROM staff s
LEFT JOIN staff m  ON s.manager_id = m.id
LEFT JOIN staff gm ON m.manager_id = gm.id
ORDER BY s.id;
```

✅ **Cek Hasil:** Joko → Dimas → Rina, dan Tono → Sari → Rina.

### ⌨️ Latihan P.1.4: Pasangan pelanggan sekota (SELF JOIN tanpa hierarki)

`SELF JOIN` tidak harus tentang atasan-bawahan. Contoh: mencari **pasangan pelanggan yang tinggal di kota yang sama** (misalnya untuk program "ajak teman").

Coba tiga versi dan perhatikan jumlah barisnya:

```sql
-- Versi 1: hanya kota yang sama
SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a
JOIN customers b ON a.city = b.city;

-- Versi 2: tambah syarat id berbeda
SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a
JOIN customers b ON a.city = b.city AND a.id <> b.id;

-- Versi 3: syarat id "lebih kecil"
SELECT a.name AS customer_1, b.name AS customer_2, a.city
FROM customers a
JOIN customers b ON a.city = b.city AND a.id < b.id
ORDER BY a.city, a.id;
```

🔮 **Prediksi:** berapa baris tiap versi? (Petunjuk: Jember dihuni 3 pelanggan: Andi, Citra, Fina.)

✅ **Cek Hasil:**

| Versi | Baris | Masalah |
|---|---|---|
| 1 | **12** | Pelanggan dipasangkan dengan **dirinya sendiri** (Andi–Andi) |
| 2 | **6** | Setiap pasangan muncul **dua kali** (Andi–Citra dan Citra–Andi) |
| 3 | **3** | ✅ Tepat: Andi–Citra, Andi–Fina, Citra–Fina |

> 💡 **Insight Industri: pola `a.id < b.id` adalah trik standar** untuk membuat pasangan unik pada `SELF JOIN`. Kamu akan menemukannya saat mencari data duplikat (misalnya dua akun dengan nomor telepon sama) atau membuat daftar pasangan.

> 💡 **Insight Industri: pola atasan-bawahan (*adjacency list*)** berupa kolom `parent_id` atau `manager_id` yang menunjuk ke tabel yang sama sangat umum, misalnya pada **kategori bertingkat** (Elektronik → Laptop → Laptop Gaming), **balasan komentar**, dan **struktur organisasi**. Jika kedalaman hierarkinya tidak terbatas, `SELF JOIN` berantai menjadi tidak praktis. Untuk itu dipakai teknik lain yang dibahas pada modul lanjutan.

---

## P.2 CROSS JOIN

### 🧠 Konsep

`CROSS JOIN` memasangkan **setiap baris tabel kiri dengan setiap baris tabel kanan**, tanpa kondisi `ON`. Hasilnya disebut **Cartesian product**:

> **jumlah baris hasil = jumlah baris kiri × jumlah baris kanan**

```
sizes (4)       colors (3)             hasil CROSS JOIN (4 × 3 = 12)
 S               Hitam                  S-Hitam   S-Putih   S-Navy
 M       ×       Putih          =       M-Hitam   M-Putih   M-Navy
 L               Navy                   L-Hitam   L-Putih   L-Navy
 XL                                     XL-Hitam  XL-Putih  XL-Navy
```

### ⌨️ Latihan P.2.1: Membuat varian produk (SKU)

Produk *Kaos Polos* tersedia dalam 4 ukuran dan 3 warna. Kita ingin daftar seluruh variannya:

```sql
SELECT p.name AS product_name,
       s.size_code,
       c.color_name,
       CONCAT('KAOS-', UPPER(c.color_name), '-', s.size_code) AS sku
FROM products p
CROSS JOIN sizes  s
CROSS JOIN colors c
WHERE p.id = 3
ORDER BY c.color_name, s.size_code;
```

🔮 **Prediksi:** berapa baris? Mengapa tidak perlu `ON`?

✅ **Cek Hasil:** **12 baris** (1 produk × 4 ukuran × 3 warna). Tidak ada `ON` karena kita memang menginginkan **semua kombinasi**, bukan pasangan berdasarkan kunci.

### ⌨️ Latihan P.2.2: Hitung dulu, jalankan kemudian

```sql
SELECT COUNT(*) FROM customers CROSS JOIN categories;
```

✅ **Cek Hasil:** 6 × 4 = **24**. Biasakan **menghitung perkiraan baris sebelum menjalankan** `CROSS JOIN`.

### ⚠️ Latihan P.2.3: CROSS JOIN yang tidak disengaja

Di MySQL, `JOIN` **tanpa `ON`** tidak menghasilkan error, melainkan diam-diam berubah menjadi `CROSS JOIN`:

```sql
SELECT COUNT(*) FROM customers c JOIN orders o;
```

✅ **Cek Hasil:** 6 × 7 = **42**. Hasil ini tidak masuk akal sebagai laporan, tetapi tidak ada pesan error yang memperingatkanmu. (PostgreSQL akan menolak query seperti ini dengan error sintaks.)

Gaya penulisan lama `FROM customers, orders` tanpa `WHERE` juga menghasilkan `CROSS JOIN`. Inilah salah satu alasan JOIN eksplisit lebih disukai.

> ⚠️ **Bahaya skala:** `CROSS JOIN` dua tabel masing-masing 1 juta baris menghasilkan **1 triliun baris**, cukup untuk membuat server kehabisan memori. Jika sebuah query tiba-tiba sangat lambat, periksa apakah ada `ON` yang terlewat.
> **Aturan praktis:** tulis `CROSS JOIN` secara **eksplisit** hanya jika memang disengaja, dan pastikan tabel yang dikalikan **kecil**.

### ⌨️ Latihan P.2.4: Laporan matriks tanpa baris yang hilang

Manajer ingin laporan **setiap pelanggan × setiap kategori**: berapa item yang dibeli (pesanan `completed`), termasuk yang **0**. Laporan seperti ini tidak bisa dibuat hanya dengan `LEFT JOIN`, karena kombinasi yang tidak pernah terjadi tidak punya baris sama sekali. Solusinya: buat dulu semua kombinasi dengan `CROSS JOIN`, lalu isi datanya dengan `LEFT JOIN`:

```sql
SELECT c.name   AS customer_name,
       cat.name AS category_name,
       COUNT(p.id) AS items_bought
FROM customers c
CROSS JOIN categories cat
LEFT JOIN orders o
       ON o.customer_id = c.id
      AND o.status = 'completed'
LEFT JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN products p
       ON p.id = oi.product_id
      AND p.category_id = cat.id
GROUP BY c.id, c.name, cat.id, cat.name
ORDER BY c.name, cat.name;
```

✅ **Cek Hasil:** **24 baris** (6 pelanggan × 4 kategori). Contoh: Andi–Elektronik = 2, Andi–Fashion = 1, Andi–Buku = 0, Budi–Buku = 2, Dewi–Elektronik = 1, dan seluruh baris Eko dan Fina = 0.

> 💡 **Insight Industri: teknik "mengisi lubang" (*gap filling*)** ini sangat umum pada laporan dashboard. Contohnya laporan penjualan **per hari × per toko**, di mana hari tanpa penjualan tetap harus tampil dengan angka 0, bukan menghilang dari grafik. Pola yang dipakai: `CROSS JOIN` untuk kerangka laporan, lalu `LEFT JOIN` untuk datanya.

> 💡 **Insight Industri:** `CROSS JOIN` juga dipakai untuk **membuat data uji** dalam jumlah besar dan untuk **kombinasi varian produk** seperti di Latihan P.2.1.

---

## P.3 Cheat Sheet Pengayaan

```sql
-- SELF JOIN: tabel yang sama, alias berbeda
FROM staff s LEFT JOIN staff m ON s.manager_id = m.id      -- karyawan -> atasan
FROM customers a JOIN customers b ON a.city = b.city
                                 AND a.id < b.id           -- pasangan unik

-- CROSS JOIN: semua kombinasi (m × n baris), tanpa ON
FROM sizes s CROSS JOIN colors c
```

| | `SELF JOIN` | `CROSS JOIN` |
|---|---|---|
| Alias wajib? | **Ya** (dua peran, satu tabel) | Disarankan |
| Kondisi `ON` | Ada | **Tidak ada** |
| Jumlah baris | Tergantung kecocokan | **Selalu** m × n |
| Risiko utama | Pasangan ganda atau dengan diri sendiri | Ledakan jumlah baris |

---

## 📝 SOAL TANTANGAN PENGAYAAN (Opsional)

Gunakan database `nusantara_mart` beserta tabel `staff`, `sizes`, dan `colors`.

1. Tampilkan karyawan beserta atasannya, **hanya** untuk karyawan yang atasannya bernama **Dimas Aditya**.
2. Tampilkan karyawan yang **tidak punya bawahan** memakai `SELF JOIN` dan `IS NULL`. *(Petunjuk: Joko, Lina, dan Tono seharusnya muncul.)*
3. Tampilkan pasangan karyawan yang **memiliki jabatan sama** (`position`) tanpa duplikasi dan tanpa pasangan dengan diri sendiri.
4. Buat daftar **seluruh varian SKU** untuk produk *Jaket Hoodie* (id 4) dengan ukuran `M`, `L`, dan `XL` saja, untuk **semua warna**. Berapa baris hasilnya?
5. Buat semua kombinasi **kategori × ukuran** (`categories` × `sizes`). Berapa baris hasilnya? ✍️ Sebutkan satu situasi nyata ketika kombinasi seperti ini bermanfaat.
6. ✍️ Jelaskan perbedaan **jumlah baris** antara `SELF JOIN` dengan syarat `a.id <> b.id` dan `a.id < b.id`. Mengapa pada pencarian pasangan, versi kedua lebih tepat?

---

## Penutup

Selamat, kamu sudah menyelesaikan materi JOIN! Beberapa hal yang perlu kamu bawa pulang:

1. **JOIN adalah cara menghubungkan data yang sengaja dipisah**, bukan sekadar sintaks yang dihafal. Selalu mulai dari pertanyaan: *"baris mana yang tidak boleh hilang?"*
2. **`LEFT JOIN` adalah pilihan utama untuk laporan**, `INNER JOIN` untuk data yang pasti berpasangan, dan `FULL JOIN` untuk audit.
3. **Waspadai tiga jebakan**: syarat `ON` vs `WHERE`, duplikasi baris, dan `NULL`.
4. **Aplikasi yang baik memikirkan performa sejak awal**: index pada FK, `EXPLAIN`, dan menghindari N+1.

Materi berikutnya adalah **subquery dan nested query**, yang akan melengkapi kemampuanmu menulis laporan kompleks dan menjadi cara lain untuk mencari data tanpa pasangan.
