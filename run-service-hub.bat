@echo off
setlocal EnableExtensions
title Service-Hub - install and run
cd /d "%~dp0"

echo ========================================================
echo   Service-Hub - install and run (Windows)
echo ========================================================
echo.

REM ---- Settings (match .env.example defaults; local/demo only) ----
set "PGPORT_SH=5433"
set "PGSUPER_PASSWORD=servicehub"
set "PGBIN=C:\Program Files\PostgreSQL\16\bin"
set "DATABASE_URL=postgresql://servicehub:servicehub@localhost:%PGPORT_SH%/servicehub"
set "SESSION_SECRET=dev-only-secret-change-me-at-least-32-chars"
set "WEB_ORIGIN=http://localhost:5173"
set "SEED_PASSWORD=ChangeMe123!dev"
set "SEED_MARKER=%LOCALAPPDATA%\service-hub\seeded"

echo [1/6] Checking Node.js and pnpm...
where node >nul 2>nul || (echo [ERROR] Node.js not found. Install it from https://nodejs.org/ and re-run. & goto :fail)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm not found - installing it with npm...
  call npm install -g pnpm || goto :fail
)
call node -v
call pnpm -v

echo.
echo [2/6] Checking PostgreSQL...
if not exist "%PGBIN%\psql.exe" (
  echo PostgreSQL 16 not found - installing with winget ^(approve the admin prompt^)...
  where winget >nul 2>nul || (echo [ERROR] winget not available. Install PostgreSQL 16 manually on port %PGPORT_SH% with password "%PGSUPER_PASSWORD%". & goto :fail)
  winget install --id PostgreSQL.PostgreSQL.16 -e --accept-package-agreements --accept-source-agreements --override "--mode unattended --unattendedmodeui none --superpassword %PGSUPER_PASSWORD% --serverport %PGPORT_SH%" || goto :fail
)
sc query postgresql-x64-16 | find "RUNNING" >nul
if errorlevel 1 (
  echo Starting PostgreSQL service...
  net start postgresql-x64-16 >nul 2>nul
  if errorlevel 1 (echo [ERROR] Could not start the postgresql-x64-16 service. Run this script as Administrator once. & goto :fail)
)

echo.
echo [3/6] Ensuring the servicehub database exists...
set "PGPASSWORD=%PGSUPER_PASSWORD%"
"%PGBIN%\psql.exe" -h localhost -p %PGPORT_SH% -U postgres -c "select 1" >nul 2>nul
if errorlevel 1 (echo [ERROR] Cannot connect to PostgreSQL on port %PGPORT_SH% as "postgres" with the expected password. & goto :fail)
"%PGBIN%\psql.exe" -h localhost -p %PGPORT_SH% -U postgres -c "CREATE ROLE servicehub LOGIN PASSWORD 'servicehub'" >nul 2>nul
"%PGBIN%\psql.exe" -h localhost -p %PGPORT_SH% -U postgres -c "CREATE DATABASE servicehub OWNER servicehub" >nul 2>nul
"%PGBIN%\psql.exe" -h localhost -p %PGPORT_SH% -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='servicehub'" | find "1" >nul
if errorlevel 1 (echo [ERROR] Database "servicehub" could not be created. & goto :fail)
echo Database ready.

echo.
echo [4/6] Installing dependencies...
call pnpm install || goto :fail
call pnpm --filter @service-hub/api db:generate || goto :fail
call pnpm --filter @service-hub/shared build || goto :fail

echo.
echo [5/6] Migrating and seeding the database...
call pnpm --filter @service-hub/api db:migrate || goto :fail
if not exist "%SEED_MARKER%" (
  call pnpm --filter @service-hub/api db:seed || goto :fail
  if not exist "%LOCALAPPDATA%\service-hub" mkdir "%LOCALAPPDATA%\service-hub"
  echo seeded> "%SEED_MARKER%"
) else (
  echo Already seeded - skipping. ^(Delete "%SEED_MARKER%" to seed again.^)
)

echo.
echo [6/6] Starting API (:3001) and web (:5173)...
echo.
echo   Open:   http://localhost:5173
echo   Login:  admin@scheidt-bachmann.de  /  %SEED_PASSWORD%
echo   Stop:   press Ctrl+C
echo.
start "" /b cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:5173"
call pnpm dev
goto :eof

:fail
echo.
echo Setup failed - see the messages above.
pause
exit /b 1
