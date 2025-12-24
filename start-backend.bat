@echo off
echo ========================================
echo  Backend Server (Port 5000)
echo ========================================
echo.
cd /d "%~dp0"
npm run server
pause
