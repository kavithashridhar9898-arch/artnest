@echo off
echo ========================================
echo    ArtNest Local Network Server
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set IP=%%a
set IP=%IP:~1%

echo Your Network IP: %IP%
echo.
echo ========================================
echo Step 1: Starting Backend Server...
echo ========================================
cd backend
start "ArtNest Backend" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Step 2: Starting Frontend Server...
echo ========================================
cd ..
cd frontend

REM Check if http-server is installed
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo http-server not found. Installing...
    npm install -g http-server
)

start "ArtNest Frontend" cmd /k "http-server -p 8080 -c-1"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    ArtNest is Running!
echo ========================================
echo.
echo Local Access:     http://localhost:8080
echo Network Access:   http://%IP%:8080
echo.
echo ========================================
echo IMPORTANT: Update API Configuration
echo ========================================
echo 1. Open: frontend\js\config.js
echo 2. Replace YOUR_IP with: %IP%
echo 3. Change CURRENT_MODE to: 'NETWORK_URL'
echo 4. Save the file
echo ========================================
echo.
echo Press any key to open config file...
pause >nul
notepad frontend\js\config.js

echo.
echo Backend: http://%IP%:3000
echo Frontend: http://%IP%:8080
echo.
echo Press Ctrl+C to stop servers
pause
