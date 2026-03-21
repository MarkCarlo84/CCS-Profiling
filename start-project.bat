@echo off
echo ========================================
echo CCS Profiling System - Setup and Start
echo ========================================
echo.

REM ========================================
REM BACKEND SETUP
REM ========================================
echo [BACKEND] Checking setup...
echo.

REM Check if vendor folder exists
if not exist backend\vendor (
    echo [BACKEND] Installing dependencies...
    cd backend
    call composer install
    cd ..
    echo [BACKEND] Dependencies installed!
    echo.
) else (
    echo [BACKEND] Dependencies already installed.
    echo.
)

REM Check if .env exists
if not exist backend\.env (
    echo [BACKEND] Creating .env file...
    copy backend\.env.example backend\.env
    echo [BACKEND] .env file created!
    echo.
)

REM Check if APP_KEY is set
findstr /C:"APP_KEY=base64:" backend\.env >nul
if errorlevel 1 (
    echo [BACKEND] Generating application key...
    cd backend
    call php artisan key:generate
    cd ..
    echo.
)

REM Check if database exists
if not exist backend\database\database.sqlite (
    echo [BACKEND] Creating database...
    type nul > backend\database\database.sqlite
    echo [BACKEND] Running migrations...
    cd backend
    call php artisan migrate --force
    echo.
    echo [BACKEND] Seeding database...
    call php artisan db:seed --force
    cd ..
    echo [BACKEND] Database setup complete!
    echo.
) else (
    echo [BACKEND] Database already exists.
    echo.
)

REM ========================================
REM FRONTEND SETUP
REM ========================================
echo [FRONTEND] Checking setup...
echo.

REM Check if node_modules exists
if not exist frontend\node_modules (
    echo [FRONTEND] Installing dependencies...
    cd frontend
    call npm install
    cd ..
    echo [FRONTEND] Dependencies installed!
    echo.
) else (
    echo [FRONTEND] Dependencies already installed.
    echo.
)

REM ========================================
REM START SERVERS
REM ========================================
echo.
echo ========================================
echo Starting Servers...
echo ========================================
echo.

echo [BACKEND] Starting Laravel server...
start "CCS Backend Server" cmd /k "cd backend && php artisan serve"

echo [BACKEND] Waiting for server to start...
timeout /t 5 /nobreak >nul

echo [FRONTEND] Starting development server...
start "CCS Frontend Server" cmd /k "cd frontend && npm run dev"

echo [FRONTEND] Waiting for server to start...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo Opening browser...
echo ========================================
echo.

REM Open frontend in default browser
start http://localhost:5173

echo.
echo ========================================
echo CCS Profiling System is Running!
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Browser should open automatically.
echo Close the server windows to stop.
echo ========================================
