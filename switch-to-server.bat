@echo off
echo ========================================
echo    SERVER DEPLOYMENT SETUP
echo ========================================
echo.

echo Step 1: Switching to server environment...
echo.

echo Step 2: Copying server environment files...

REM Copy frontend server environment
if exist "frontend\env.server" (
    copy "frontend\env.server" "frontend\.env.local" >nul 2>&1
    echo ✓ Frontend server environment configured
) else (
    echo ✗ Frontend env.server file not found
)

REM Copy backend server environment
if exist "backend\env.server" (
    copy "backend\env.server" "backend\.env" >nul 2>&1
    echo ✓ Backend server environment configured
) else (
    echo ✗ Backend env.server file not found
)

echo.
echo ========================================
echo    SERVER DEPLOYMENT SETUP COMPLETE
echo ========================================
echo.
echo IMPORTANT: Update the server IP address in frontend/env.server
echo Replace THEIR_SERVER_IP with the actual server IP address
echo.
echo Example:
echo REACT_APP_API_URL=http://192.168.1.100:3000/api
echo REACT_APP_BACKEND_URL=http://192.168.1.100:3000
echo.
echo ========================================
pause
