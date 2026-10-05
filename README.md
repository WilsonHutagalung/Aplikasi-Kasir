# Aplikasi Kasir (Universal POS)

Aplikasi kasir offline berbasis desktop untuk semua jenis usaha — retail, F&B, jasa, dan lainnya.

## Tech Stack

- **Backend:** Laravel (PHP) + SQLite
- **Frontend:** React + Vite
- **Desktop:** Electron (wrapper jadi .exe)
- **Auth:** Laravel Sanctum

## Fitur

- POS kasir dengan keranjang belanja
- Manajemen produk & jasa
- Manajemen pelanggan & supplier
- Inventory & stok
- Shift kasir (buka/tutup shift)
- Riwayat transaksi
- Laporan penjualan
- Pengaturan & backup database
- Multi-role (Admin, Kasir, Manajer)
- Berjalan offline tanpa internet

## Cara Menjalankan (Development)

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Buat database & seed data
php artisan migrate --seed

# Jalankan dev server
php artisan serve
npm run dev
```

## Build Desktop (.exe)

```bash
# Build frontend dulu
npm run build

# Jalankan Electron
npm run electron
```

