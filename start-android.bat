@echo off
echo ========================================
echo  Android App
echo ========================================
echo.
echo Make sure Metro Bundler is running first!
echo.
cd /d "%~dp0mobile\GymApp"
npm run android
pause
