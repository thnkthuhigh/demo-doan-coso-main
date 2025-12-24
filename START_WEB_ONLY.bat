@echo off
title Gym Management System - Web Only
color 0A

echo ========================================
echo   GYM MANAGEMENT SYSTEM
echo   Web Development Mode
echo ========================================
echo.

:: Kiem tra Node.js
echo [1/3] Checking Node.js...
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
echo [2/3] Cleaning up ports...
echo      Killing processes on port 5000, 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 >nul
echo      OK - Ports cleaned
echo.

:: Khoi dong Backend Server
echo [3/3] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && color 0B && title Backend Server && echo Starting Backend... && node server.js"
timeout /t 3 >nul
echo      OK - Backend starting
echo.

:: Khoi dong Web Client
echo [3/3] Starting Web Client (Port 5173)...
start "Web Client" cmd /k "cd /d %~dp0 && color 0D && title Web Client && echo Starting Web... && npm run dev"
timeout /t 3 >nul
echo      OK - Web starting
echo.

echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   Backend:  http://localhost:5000
echo   Web:      http://localhost:5173
echo.
echo Services running:
echo   - Backend Server (cmd window)
echo   - Web Client (cmd window)
echo.
echo To stop all services:
echo   1. Close all opened cmd windows
echo.
echo Press any key to open browser...
pause >nul

:: Mo browser
start http://localhost:5173

echo.
echo Browser opened!
echo Keep this window open to see this message.
echo.
pause
