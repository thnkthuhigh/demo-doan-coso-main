@echo off
echo ========================================
echo  Starting Android Emulator
echo ========================================
echo.
echo Available emulators:
echo   1. Pixel_9
echo   2. Medium_Phone_API_36.0
echo.
echo Starting Pixel_9 emulator...
echo.

start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_9

echo.
echo ✅ Emulator is starting...
echo    Wait for emulator to fully boot before running the app
echo.
pause
