@echo off
echo Switching to PRODUCTION environment...
echo.

echo Copying production environment files...

REM Copy frontend production environment
if exist "frontend\env.production" (
    copy "frontend\env.production" "frontend\.env.local" >nul 2>&1
    echo ✓ Frontend production environment configured
) else (
    echo ✗ Frontend env.production file not found
)

REM Copy backend production environment
if exist "backend\env.config" (
    copy "backend\env.config" "backend\.env" >nul 2>&1
    echo ✓ Backend production environment configured
) else (
    echo ✗ Backend env.config file not found
)

echo.
echo ========================================
echo PRODUCTION ENVIRONMENT SETUP COMPLETE
echo ========================================
echo.
echo Your application is now configured for production:
echo - Frontend: Vercel deployment
echo - Backend: Render deployment
echo - Database: MongoDB Atlas
echo - Images: Cloudinary
echo.
echo ========================================
pause
