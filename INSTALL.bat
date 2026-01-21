@echo off
echo ================================
echo Production Scheduling Installer
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js dari https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js terdeteksi: 
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm tidak ditemukan!
    echo.
    pause
    exit /b 1
)

echo [OK] npm terdeteksi:
npm --version
echo.

echo ================================
echo Installing Dependencies...
echo ================================
echo Tunggu 2-5 menit...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Gagal install dependencies!
    echo Coba jalankan manual: npm install
    echo.
    pause
    exit /b 1
)

echo.
echo ================================
echo [SUCCESS] Instalasi Selesai!
echo ================================
echo.
echo Langkah Selanjutnya:
echo 1. Setup database MySQL (lihat WINDOWS-INSTALL.md)
echo 2. Copy .env.example menjadi .env.local
echo 3. Edit .env.local sesuai konfigurasi MySQL Anda
echo 4. Jalankan: npm run dev
echo 5. Buka browser: http://localhost:3000
echo.
echo Login: admin / admin123
echo.
pause
