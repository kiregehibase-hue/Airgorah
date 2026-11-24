@echo off
setlocal
title Airgorah Local Launcher
cd /d "%~dp0"

echo.
echo  ==========================================
echo       AIRGORAH - LOCAL WINDOWS LAUNCHER
echo  ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not on PATH.
  echo Install Node.js 20.19+ or 22.12+ from https://nodejs.org/
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found. Reinstall Node.js with npm included.
  pause
  exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
  echo Installing Airgorah web dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

where py >nul 2>nul
if not errorlevel 1 (
  py -3 --version >nul 2>nul
  if not errorlevel 1 (
    echo Starting the local Wi-Fi scanner...
    start "Airgorah Wi-Fi Scanner" /D "%~dp0" cmd /k "py -3 local_scanner.py"
    goto start_web
  )
)

where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python 3 was not found.
  echo Install Python 3 from https://www.python.org/downloads/windows/
  echo During setup, enable "Add Python to PATH".
  pause
  exit /b 1
)

python --version
echo Starting the local Wi-Fi scanner...
start "Airgorah Wi-Fi Scanner" /D "%~dp0" cmd /k "python local_scanner.py"

:start_web
echo Starting the Airgorah web application...
start "Airgorah Web App" /D "%~dp0" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"

echo.
echo Airgorah is starting in two terminal windows.
echo Web app:       http://127.0.0.1:5173
echo Scanner health: http://127.0.0.1:8765/health
echo.
echo Keep both terminal windows open while using Real Scan.
echo Close those windows to stop the app and scanner.
timeout /t 4 /nobreak >nul
start "" "http://127.0.0.1:5173"
exit /b 0
