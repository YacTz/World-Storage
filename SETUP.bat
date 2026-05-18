@echo off
:: ============================================================
::  World Storage - SETUP
::  Jalankan SEKALI setelah clone dari GitHub
:: ============================================================

:: Minta Run as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo  Membutuhkan Administrator. Membuka ulang...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

title World Storage - Setup
color 0A
cls
echo.
echo  ============================================================
echo    WORLD STORAGE - SETUP OTOMATIS
echo  ============================================================
echo.

:: ── CEK GIT ──────────────────────────────────────────────────
echo  [1/4] Mengecek Git...
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo        Git tidak ditemukan. Menginstall Git...
    powershell -Command "winget install Git.Git --silent --accept-package-agreements --accept-source-agreements"
    echo        Git berhasil diinstall!
) else (
    echo        Git sudah terinstall. OK
)

:: ── CEK NODE.JS ──────────────────────────────────────────────
echo.
echo  [2/4] Mengecek Node.js...
node -v >nul 2>&1
if %errorLevel% neq 0 (
    echo        Node.js tidak ditemukan. Menginstall Node.js LTS...
    powershell -Command "winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements"
    echo        Node.js berhasil diinstall!
    echo.
    echo  ============================================================
    echo    PERLU RESTART POWERSHELL
    echo    Tutup jendela ini, buka PowerShell baru sebagai
    echo    Administrator, lalu jalankan SETUP.bat lagi.
    echo  ============================================================
    echo.
    pause
    exit /b
) else (
    echo        Node.js sudah terinstall. OK
)

:: ── CEK EXECUTION POLICY ─────────────────────────────────────
echo.
echo  [3/4] Mengatur PowerShell Execution Policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo        Execution policy diatur. OK

:: ── NPM INSTALL ──────────────────────────────────────────────
echo.
echo  [4/4] Menginstall dependencies (npm install)...
echo        Ini mungkin memakan waktu beberapa menit...
echo.
cd /d "%~dp0"
call npm install
if %errorLevel% neq 0 (
    echo.
    echo  ERROR: npm install gagal!
    pause
    exit /b
)

:: ── BUILD ────────────────────────────────────────────────────
echo.
echo  ============================================================
echo    Dependencies berhasil diinstall!
echo  ============================================================
echo.
set /p BUILD="  Build aplikasi sekarang? (Y/N): "
if /i "%BUILD%"=="Y" (
    echo.
    echo  Building aplikasi...
    call npx electron-builder --win --x64
    echo.
    echo  Build selesai! Aplikasi ada di folder "World Storage\"
)

echo.
echo  ============================================================
echo    SETUP SELESAI!
echo    Jalankan START.bat untuk membuka aplikasi.
echo  ============================================================
echo.
pause
