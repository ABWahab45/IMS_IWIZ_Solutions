@echo off
echo ========================================
echo    PREPARE FOR SERVER DEPLOYMENT
echo ========================================
echo.

echo Step 1: Creating deployment package...
echo.

REM Create deployment folder
if not exist "deployment" mkdir deployment
if not exist "deployment\backend" mkdir deployment\backend

REM Copy essential files
echo Copying essential files...
copy "backend\test-server-production.js" "deployment\backend\"
copy "backend\package.json" "deployment\backend\"
copy "backend\env.server" "deployment\backend\"

REM Copy optional files for full functionality
echo Copying optional files...
if exist "backend\server.js" copy "backend\server.js" "deployment\backend\"
if exist "backend\models" xcopy "backend\models" "deployment\backend\models\" /E /I /Y
if exist "backend\routes" xcopy "backend\routes" "deployment\backend\routes\" /E /I /Y
if exist "backend\middleware" xcopy "backend\middleware" "deployment\backend\middleware\" /E /I /Y
if exist "backend\controllers" xcopy "backend\controllers" "deployment\backend\controllers\" /E /I /Y
if exist "backend\services" xcopy "backend\services" "deployment\backend\services\" /E /I /Y

echo.
echo ========================================
echo    DEPLOYMENT PACKAGE READY
echo ========================================
echo.
echo ✅ Files copied to: deployment\backend\
echo.
echo 📋 Next steps:
echo 1. Copy the 'deployment\backend' folder to their server
echo 2. On their server, run: cd backend && npm install
echo 3. Start server: node test-server-production.js
echo 4. Update Vercel environment variables with their server IP
echo.
echo 📁 Files included:
echo - test-server-production.js (main server)
echo - package.json (dependencies)
echo - env.server (environment config)
echo - All backend code files
echo.
echo ========================================
pause
