<?php

use Illuminate\Support\Str;

return [

    // Session driver (file / cookie / database / memcached / redis / dynamodb / array)
    'driver' => env('SESSION_DRIVER', 'database'),

    // Durasi session dalam menit
    'lifetime' => (int) env('SESSION_LIFETIME', 120),
    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    // Enkripsi session
    'encrypt' => env('SESSION_ENCRYPT', false),

    // Lokasi file session (kalau pakai driver file)
    'files' => storage_path('framework/sessions'),

    // Koneksi database session
    'connection' => env('SESSION_CONNECTION'),

    // Tabel database session
    'table' => env('SESSION_TABLE', 'sessions'),

    // Cache store untuk session (berlaku di dynamodb / memcached / redis)
    'store' => env('SESSION_STORE'),

    // Peluang session cleanup (2 dari 100 request)
    'lottery' => [2, 100],

    // Nama cookie session
    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug((string) env('APP_NAME', 'laravel')).'-session'
    ),

    // Path cookie
    'path' => env('SESSION_PATH', '/'),

    // Domain cookie
    'domain' => env('SESSION_DOMAIN'),

    // HTTPS only
    'secure' => env('SESSION_SECURE_COOKIE'),

    // HTTP only (tidak bisa diakses via JavaScript)
    'http_only' => env('SESSION_HTTP_ONLY', true),

    // Same-site policy (lax / strict / none / null)
    'same_site' => env('SESSION_SAME_SITE', 'lax'),

    // Partitioned cookie (untuk cross-site context)
    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

];
