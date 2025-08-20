@echo off
echo ========================================
echo    NGROK TESTING SETUP
echo ========================================
echo.

echo Step 1: Switching to local environment...
call switch-to-local.bat
echo.

echo Step 2: Starting backend server...
echo Please start your backend in a new terminal:
echo cd backend ^&^& npm start
echo.

echo Step 3: Starting ngrok tunnel...
echo Please run this command in a new terminal:
echo ngrok http 8080
echo.

echo Step 4: Testing connection...
echo Once ngrok is running, copy the HTTPS URL and run:
echo node test-ngrok-connection.js YOUR_NGROK_URL
echo.

echo Step 5: Update Vercel environment variables
echo Go to Vercel dashboard and set:
echo REACT_APP_API_URL=https://YOUR_NGROK_URL/api
echo REACT_APP_BACKEND_URL=https://YOUR_NGROK_URL
echo.

echo ========================================
echo    SETUP COMPLETE
echo ========================================
echo.
echo Your Vercel frontend will now connect to your local backend!
echo.
pause
