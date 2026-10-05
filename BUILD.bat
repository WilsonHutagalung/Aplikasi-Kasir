@echo off
title Build Aplikasi Kasir Desktop
color 0B
echo.
echo  ================================================
echo   BUILD APLIKASI KASIR - WINDOWS DESKTOP (.exe)
echo  ================================================
echo.

:: Cek Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan! Install dari https://nodejs.org
    pause
    exit /b 1
)

:: Cek PHP
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] PHP tidak ditemukan di PATH, mencari XAMPP...
    if not exist "C:\xampp\php\php.exe" (
        echo [ERROR] PHP tidak ditemukan! Install XAMPP atau PHP terlebih dahulu.
        pause
        exit /b 1
    )
    set PATH=%PATH%;C:\xampp\php
)

echo [1/5] Menginstall dependencies npm...
call npm install
if %errorlevel% neq 0 (echo [ERROR] npm install gagal & pause & exit /b 1)

echo.
echo [2/5] Build assets React (Vite)...
call npm run build
if %errorlevel% neq 0 (echo [ERROR] Vite build gagal & pause & exit /b 1)

echo.
echo [3/5] Install Composer dependencies...
call composer install --no-dev --optimize-autoloader
if %errorlevel% neq 0 (echo [ERROR] Composer install gagal & pause & exit /b 1)

echo.
echo [4/5] Optimasi Laravel...
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo.
echo [5/5] Build Electron (.exe installer)...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (echo [ERROR] Electron build gagal & pause & exit /b 1)

echo.
echo  ================================================
echo   BUILD SELESAI!
echo   File .exe ada di folder: dist-electron\
echo  ================================================
echo.
pause
