@echo off
echo Switching to LOCAL environment for testing...
echo.

echo Copying local environment files...

REM Copy frontend local environment
if exist "frontend\env.local" (
    copy "frontend\env.local" "frontend\.env.local" >nul 2>&1
    echo ✓ Frontend local environment configured
) else (
    echo ✗ Frontend env.local file not found
)

REM Copy backend local environment
if exist "backend\env.local" (
    copy "backend\env.local" "backend\.env" >nul 2>&1
    echo ✓ Backend local environment configured
) else (
    echo ✗ Backend env.local file not found
)

echo.
echo ========================================
echo LOCAL ENVIRONMENT SETUP COMPLETE
echo ========================================
echo.
echo To start your application locally:
echo.
echo 1. Start Backend (in backend folder):
echo    npm start
echo.
echo 2. Start Frontend (in frontend folder):
echo    npm start
echo.
echo Your frontend will run on: http://localhost:3000
echo Your backend will run on:  http://localhost:5000
echo.
echo ========================================
pause
