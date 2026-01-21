@echo off
echo ================================
echo Starting Production Scheduling
echo ================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] Dependencies belum diinstall!
    echo Jalankan INSTALL.bat terlebih dahulu.
    echo.
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo [WARNING] File .env.local tidak ditemukan!
    echo Copy .env.example menjadi .env.local
    echo Edit .env.local dengan konfigurasi MySQL Anda
    echo.
    pause
    exit /b 1
)

echo Starting development server...
echo.
echo Aplikasi akan berjalan di: http://localhost:3000
echo Login: admin / admin123
echo.
echo Tekan Ctrl+C untuk stop server
echo.
echo ================================

npm run dev
