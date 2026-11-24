@echo off
title Airgorah Local Wi-Fi Scanner
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%~dp0local_scanner.py"
) else (
  python "%~dp0local_scanner.py"
)
pause
