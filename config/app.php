<?php

return [

    // Nama aplikasi
    'name' => env('APP_NAME', 'Laravel'),

    // Environment (production / local)
    'env' => env('APP_ENV', 'production'),

    // Mode debug - tampilkan error detail kalau true
    'debug' => (bool) env('APP_DEBUG', false),

    // URL dasar aplikasi
    'url' => env('APP_URL', 'http://localhost'),

    // Timezone default
    'timezone' => 'UTC',

    // Locale & faker
    'locale' => env('APP_LOCALE', 'en'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    // Encryption
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    // Maintenance mode (driver: file / cache)
    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
