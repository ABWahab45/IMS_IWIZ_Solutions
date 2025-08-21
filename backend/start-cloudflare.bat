@echo off
echo Starting IWIZ Inventory Management System with Cloudflare Tunnel...

REM Load environment variables from .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    set %%a=%%b
)

REM Set production environment
set NODE_ENV=production

REM Start the server
node server.js

pause
