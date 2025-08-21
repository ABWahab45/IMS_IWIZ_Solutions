@echo off
echo Starting PM2 and restoring saved processes...
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Starting PM2 daemon...
pm2 resurrect

echo.
echo PM2 startup completed!
echo Check status with: pm2 status
echo View logs with: pm2 logs
echo.
pause
