@echo off
echo Creating Windows Task Scheduler entry for PM2 Auto-Start...
echo.

REM Get the current directory and PM2 path
set CURRENT_DIR=%~dp0
set PM2_PATH=%APPDATA%\npm\pm2.cmd

echo Current Directory: %CURRENT_DIR%
echo PM2 Path: %PM2_PATH%
echo.

REM Create the task
echo Creating task: "PM2 Iwiz Backend"...
schtasks /create /tn "PM2 Iwiz Backend" /tr "%CURRENT_DIR%start-pm2.bat" /sc onstart /ru SYSTEM /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Task created successfully!
    echo.
    echo 📋 Task Details:
    echo    Name: PM2 Iwiz Backend
    echo    Trigger: At system startup
    echo    Action: Run start-pm2.bat
    echo    User: SYSTEM (runs with highest privileges)
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
    echo.
    echo 📋 To manage the task:
    echo    - View: schtasks /query /tn "PM2 Iwiz Backend"
    echo    - Delete: schtasks /delete /tn "PM2 Iwiz Backend" /f
) else (
    echo.
    echo ❌ Failed to create task. Error code: %ERRORLEVEL%
    echo.
    echo 🔧 Try running this script as Administrator:
    echo    1. Right-click on this file
    echo    2. Select "Run as administrator"
    echo.
    echo 📋 Or set up manually in Task Scheduler:
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
