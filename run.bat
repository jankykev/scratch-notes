@echo off
:: Scratch Notes - Run Script
:: This script starts a simple HTTP server to run the app locally

echo.
echo ========================================
echo   Scratch Notes - Local Server
echo ========================================
echo.

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting server with Python...
    echo.
    echo Opening http://localhost:8765
    echo Press Ctrl+C to stop
    echo.
    python -m http.server 8765 --bind 127.0.0.1
    goto :eof
)

:: Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting server with Node.js...
    echo.
    echo Opening http://localhost:8765
    echo Press Ctrl+C to stop
    echo.
    npx serve . -l 8765 -s
    goto :eof
)

:: Check if PHP is available
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting server with PHP...
    echo.
    echo Opening http://localhost:8765
    echo Press Ctrl+C to stop
    echo.
    php -S 127.0.0.1:8765
    goto :eof
)

:: Fallback: Open directly in browser (limited functionality)
echo No local server found (Python, Node.js, or PHP required for full features).
echo.
echo Opening index.html directly in browser...
echo Note: Some features (Service Worker, ES Modules) require a server.
echo.

start "" "index.html"

echo.
echo Done! The app opened in your default browser.
echo For full functionality, install Python, Node.js, or PHP and run this script again.
echo.
pause