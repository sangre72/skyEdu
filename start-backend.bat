@echo off
chcp 65001 > nul
title SkyEdu Backend Server
cd /d "%~dp0backend"

echo ========================================
echo   SkyEdu Backend Server
echo ========================================
echo.

call .venv\Scripts\activate.bat

echo Starting FastAPI server on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
