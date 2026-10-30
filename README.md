# Aplikasi Kasir Toko Bangunan

Aplikasi kasir berbasis web dan desktop untuk operasional **Toko Bangunan Jaya**. Aplikasi ini menangani penjualan material bangunan, pengelolaan stok, shift kasir, pelanggan, supplier, laporan, serta backup database.

## Gambaran Aplikasi

Website digunakan untuk:

- Mengelola katalog material bangunan, kategori, dan satuan.
- Menjalankan transaksi kasir dengan pencarian nama, SKU, dan barcode.
- Menyimpan pesanan sementara menggunakan fitur hold.
- Menerima pembayaran dan mencetak struk thermal.
- Mengontrol stok dan mencatat setiap pergerakan inventory.
- Mengelola shift kasir dan perhitungan kas awal, penjualan tunai, serta selisih kas.
- Mengelola pelanggan dan supplier.
- Menampilkan ringkasan penjualan, produk terlaris, laba kotor, dan stok menipis.
- Mengatur profil toko dan melakukan backup/restore database.
- Membatasi akses berdasarkan role dan permission.

## Data Demo

Seeder bawaan menggunakan satu skenario usaha, yaitu toko bahan bangunan.

Contoh data yang tersedia:

- Semen dan mortar.
- Besi beton.
- Cat dan pelapis.
- Pipa dan sanitasi.
- Perkakas.
- Pasir beton dan triplek.
- Pelanggan umum, kontraktor, dan pemilik proyek.
- Supplier material bangunan.

## Alur Kasir

Transaksi mengikuti alur berikut:

```text
Login
  -> Buka shift
  -> Tambahkan barang ke keranjang
  -> Hold pesanan atau lanjut ke pembayaran
  -> Selesaikan pembayaran
  -> Stok berkurang dan transaksi tercatat
  -> Tutup shift
```

Shift wajib dibuka sebelum kasir dapat menambahkan pesanan, melakukan hold, atau menyelesaikan pembayaran.

## Role dan Akses

- **Owner:** akses penuh ke seluruh fitur, termasuk backup dan restore database.
- **Admin:** mengelola produk, kategori, satuan, pelanggan, supplier, inventory, shift, dan laporan.
- **Kasir:** melakukan transaksi, mengelola pelanggan, dan membuka/menutup shift.

## Teknologi

- **Backend:** Laravel 12 dan PHP 8.2+
- **Frontend:** React 19, Vite, Tailwind CSS
- **API Authentication:** Laravel Sanctum
- **Database:** MySQL atau SQLite sesuai konfigurasi lokal
- **Desktop:** Electron
- **Testing:** PHPUnit dan Laravel Pint

## Menjalankan Secara Lokal

### Persyaratan

- PHP 8.2 atau lebih baru.
- Composer.
- Node.js dan npm.
- MySQL atau SQLite.

### Instalasi

```bash
composer install
npm install
```

Buat file `.env` secara lokal dan isi sesuai konfigurasi database serta environment mesin. File `.env` tidak boleh di-commit ke repository.

Generate application key:

```bash
php artisan key:generate
```

Jalankan migration dan data demo:

```bash
php artisan migrate --seed
```

Jalankan backend dan frontend pada terminal terpisah:

```bash
php artisan serve
npm run dev
```

Buka alamat yang ditampilkan oleh Laravel, biasanya:

```text
http://127.0.0.1:8000
```

## Menjalankan Desktop Electron

Pastikan backend dan frontend development sudah berjalan, lalu gunakan:

```bash
npm run electron:dev
```

Untuk menjalankan Electron tanpa mode development:

```bash
npm run build
npm run electron
```

## Build Installer Windows

Installer NSIS dan versi portable dapat dibuat dengan:

```bash
npm run electron:build
npm run electron:build:portable
```

Hasil build disimpan di folder `dist-desktop/`. Folder hasil build tidak perlu di-commit.

## Menjalankan Test

```bash
php artisan test
```

Pemeriksaan format kode PHP:

```bash
vendor/bin/pint --test
```

Pemeriksaan build frontend:

```bash
npm run build
```

