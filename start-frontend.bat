@echo off
chcp 65001 > nul
title SkyEdu Frontend Server
cd /d "%~dp0frontend"

echo ========================================
echo   SkyEdu Frontend Server
echo ========================================
echo.

echo Starting Next.js dev server on http://localhost:3000
echo.

pnpm dev

pause
