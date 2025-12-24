# Gym Management System - Web Only Launcher
# PowerShell Script for VPS

Write-Host "========================================" -ForegroundColor Green
Write-Host "  GYM MANAGEMENT SYSTEM" -ForegroundColor Cyan
Write-Host "  Web Development Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "[1/3] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "     OK - Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "     ERROR: Node.js not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Clean up ports
Write-Host "[2/3] Cleaning up ports..." -ForegroundColor Yellow
$ports = @(5000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Seconds 2
Write-Host "     OK - Ports cleaned" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[3/3] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Backend Server...' -ForegroundColor Cyan; node server.js" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "     OK - Backend starting" -ForegroundColor Green
Write-Host ""

# Start Web Client
Write-Host "[3/3] Starting Web Client (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Starting Web Client...' -ForegroundColor Magenta; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "     OK - Web starting" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Services Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  Web:      http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Services running:" -ForegroundColor Yellow
Write-Host "  - Backend Server (PowerShell window)" -ForegroundColor Gray
Write-Host "  - Web Client (PowerShell window)" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "  1. Close all opened PowerShell windows" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to open browser..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Browser opened!" -ForegroundColor Green
Write-Host "Keep terminal windows open to keep services running." -ForegroundColor Yellow
Write-Host ""
