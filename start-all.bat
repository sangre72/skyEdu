@echo off
chcp 65001 > nul
title SkyEdu Development Servers
cd /d "%~dp0"

echo ========================================
echo   SkyEdu Development Servers
echo ========================================
echo.
echo Starting Backend and Frontend servers...
echo.

start "SkyEdu Backend" cmd /k "chcp 65001 > nul && cd /d %~dp0backend && call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak > nul

start "SkyEdu Frontend" cmd /k "chcp 65001 > nul && cd /d %~dp0frontend && pnpm dev"

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo Close this window or press any key to exit.
pause > nul
