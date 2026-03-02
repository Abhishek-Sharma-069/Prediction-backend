@echo off
echo ========================================
echo   Starting Backend Server (Node.js)
echo ========================================
echo.

cd /d "%~dp0backend-server"
if not exist "package.json" (
    echo Error: package.json not found!
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install >nul 2>&1

echo.
echo Backend Server starting on http://localhost:3000
echo Make sure ML Service is running on port 5000!
echo Press Ctrl+C to stop
echo.

npm start

pause

