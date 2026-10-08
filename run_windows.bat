@echo off
rem NaryadAI - launcher for Windows 11. Double-click to run.
rem All logic lives in run_windows.ps1. This wrapper only starts it with the
rem execution policy bypassed (Windows blocks .ps1 files by default).
rem Options are passed through, e.g.:  run_windows.bat -LocalOnly   or   run_windows.bat -Port 8001
title NaryadAI
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_windows.ps1" %*
if errorlevel 1 (
    echo.
    echo NaryadAI stopped with an error. Read the messages above.
    pause
)
