# Script để chạy tất cả services cho Gym Management System
# Chạy script này: .\start-all.ps1

Write-Host "🏋️ Starting Gym Management System..." -ForegroundColor Green
Write-Host ""

# Kiểm tra Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Starting services in new windows..." -ForegroundColor Cyan
Write-Host ""

# 0. Android Emulator (optional)
Write-Host "0️⃣ Starting Android Emulator..." -ForegroundColor Yellow
Write-Host "   Available emulators: Pixel_9, Medium_Phone_API_36.0" -ForegroundColor Gray
$startEmulator = Read-Host "Do you want to start Android Emulator? (y/n)"
if ($startEmulator -eq 'y' -or $startEmulator -eq 'Y') {
    Start-Process -FilePath "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd","Pixel_9"
    Write-Host "   ✅ Emulator starting... (wait for it to boot)" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

# 1. Backend Server
Write-Host "1️⃣ Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🔧 Backend Server (Port 5000)' -ForegroundColor Cyan; npm run server"
Start-Sleep -Seconds 2

# 2. Web Client
Write-Host "2️⃣ Starting Web Client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host '🌐 Web Client (Port 5173)' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 2

# 3. Mobile Metro Bundler
Write-Host "3️⃣ Starting Mobile Metro Bundler..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\mobile\GymApp'; Write-Host '📱 Metro Bundler' -ForegroundColor Cyan; npm start"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "   Web Admin:    http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📱 To run Android app, open a new terminal and run:" -ForegroundColor Yellow
Write-Host "   cd mobile\GymApp" -ForegroundColor White
Write-Host "   npm run android" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
