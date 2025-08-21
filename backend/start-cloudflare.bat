@echo off
echo Starting Iwiz Inventory Backend with Cloudflare Tunnel...
echo Cloudflare URL: https://chosen-annotation-hearings-improvement.trycloudflare.com
echo.

cd /d "%~dp0"
set NODE_ENV=production
set PORT=5000

echo Installing dependencies...
npm install

echo Starting server...
npm start

pause