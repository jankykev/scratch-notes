<#
.SYNOPSIS
    Starts Scratch Notes local server

.DESCRIPTION
    This script starts a simple HTTP server to run the Scratch Notes app locally.
    It tries Python, Node.js, and PHP in order, falling back to opening index.html directly.

.NOTES
    For full functionality (Service Worker, ES Modules), a local server is required.
#>

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Scratch Notes - Local Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Starting server with Python..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening http://localhost:8765" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    python -m http.server 8765 --bind 127.0.0.1
    exit
}

# Try Python3
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    Write-Host "Starting server with Python3..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening http://localhost:8765" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    python3 -m http.server 8765 --bind 127.0.0.1
    exit
}

# Try Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Starting server with Node.js..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening http://localhost:8765" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    npx serve . -l 8765 -s
    exit
}

# Try PHP
if (Get-Command php -ErrorAction SilentlyContinue) {
    Write-Host "Starting server with PHP..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening http://localhost:8765" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    php -S 127.0.0.1:8765
    exit
}

# Fallback: Open directly
Write-Warning "No local server found (Python, Node.js, or PHP required for full features)."
Write-Host ""
Write-Host "Opening index.html directly in browser..." -ForegroundColor Yellow
Write-Host "Note: Some features (Service Worker, ES Modules) require a server." -ForegroundColor Gray
Write-Host ""

Start-Process "index.html"

Write-Host ""
Write-Host "Done! The app opened in your default browser." -ForegroundColor Green
Write-Host "For full functionality, install Python, Node.js, or PHP and run this script again." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"