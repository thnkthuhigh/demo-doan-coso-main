@echo off
title Gym Management System - Launcher
color 0A

echo ========================================
echo   GYM MANAGEMENT SYSTEM
echo   Auto Launcher
echo ========================================
echo.

:: Kiem tra Node.js
echo [1/7] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo      OK - Node.js installed
echo.

:: Kill processes tren cac port
echo [2/7] Cleaning up ports...
echo      Killing processes on port 5000, 5173, 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul
echo      OK - Ports cleaned
echo.

:: Khoi dong Android Emulator
echo [3/7] Starting Android Emulator (Pixel_9)...
echo      Please wait for emulator to boot (30-60 seconds)
start "Android Emulator" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_9
timeout /t 3 >nul
echo      OK - Emulator starting
echo.

:: Khoi dong Backend Server
echo [4/7] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0 && color 0B && title Backend Server && echo Starting Backend... && npm run server"
timeout /t 3 >nul
echo      OK - Backend starting
echo.

:: Khoi dong Web Client
echo [5/7] Starting Web Client (Port 5173)...
start "Web Client" cmd /k "cd /d %~dp0 && color 0D && title Web Client && echo Starting Web... && npm run dev"
timeout /t 3 >nul
echo      OK - Web starting
echo.

:: Doi emulator boot xong
echo [6/7] Waiting for emulator to boot...
echo      This may take 30-60 seconds, please wait...
timeout /t 25 >nul
echo      Checking emulator status...
adb wait-for-device
echo      OK - Emulator ready!
echo.

:: Khoi dong Metro Bundler
echo [7/7] Starting Metro Bundler...
start "Metro Bundler" cmd /k "cd /d %~dp0mobile\GymApp && color 0E && title Metro Bundler && echo Starting Metro... && npm start"
timeout /t 8 >nul
echo      OK - Metro starting
echo.

:: Chay Android App
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Web:      http://localhost:5173
echo   Emulator: Pixel_9
echo   Metro:    Running
echo.
echo [FINAL] Building and installing Android app...
echo         This will take 1-2 minutes...
echo.

cd /d %~dp0mobile\GymApp
call npm run android

echo.
echo ========================================
echo   DONE! App should open in emulator
echo ========================================
echo.
echo Services running:
echo   - Backend Server (cmd window)
echo   - Web Client (cmd window)
echo   - Metro Bundler (cmd window)
echo   - Android Emulator (window)
echo.
echo To stop all services:
echo   1. Close all opened cmd windows
echo   2. Close emulator window
echo.
pause
