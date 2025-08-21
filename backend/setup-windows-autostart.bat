@echo off
echo Setting up PM2 Auto-Start for Windows...
echo.

REM Get the current directory
set CURRENT_DIR=%~dp0
set PM2_PATH=%APPDATA%\npm\pm2.cmd

echo Current Directory: %CURRENT_DIR%
echo PM2 Path: %PM2_PATH%
echo.

REM Create a batch file to start PM2
echo @echo off > "%CURRENT_DIR%start-pm2.bat"
echo cd /d "%CURRENT_DIR%" >> "%CURRENT_DIR%start-pm2.bat"
echo "%PM2_PATH%" resurrect >> "%CURRENT_DIR%start-pm2.bat"

echo Created start-pm2.bat file
echo.

REM Create Windows Task Scheduler entry
echo Creating Windows Task Scheduler entry...
schtasks /create /tn "PM2 Iwiz Backend" /tr "%CURRENT_DIR%start-pm2.bat" /sc onstart /ru SYSTEM /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ PM2 Auto-Start setup completed successfully!
    echo.
    echo 📋 What was created:
    echo    - start-pm2.bat: Script to start PM2 and restore saved processes
    echo    - Windows Task: "PM2 Iwiz Backend" (runs at system startup)
    echo.
    echo 🔄 Your backend will now start automatically when Windows boots up!
    echo.
    echo 📝 To test:
    echo    1. Restart your computer
    echo    2. Check if PM2 is running: pm2 status
    echo    3. Check your backend: http://localhost:5000/api/health
    echo.
    echo 🛠️ Manual commands:
    echo    - Start PM2: pm2 resurrect
    echo    - Check status: pm2 status
    echo    - View logs: pm2 logs
) else (
    echo.
    echo ❌ Failed to create Windows Task Scheduler entry.
    echo.
    echo 🔧 Manual setup required:
    echo    1. Open Task Scheduler (taskschd.msc)
    echo    2. Create Basic Task
    echo    3. Name: "PM2 Iwiz Backend"
    echo    4. Trigger: At startup
    echo    5. Action: Start a program
    echo    6. Program: %CURRENT_DIR%start-pm2.bat
    echo    7. Run with highest privileges
)

echo.
pause
