@echo off
echo ========================================
echo   Starting ML Service (Python Flask)
echo ========================================
echo.

cd /d "%~dp0ml_service"
if not exist "requirements.txt" (
    echo Error: requirements.txt not found!
    pause
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt >nul 2>&1

cd src
if not exist "app.py" (
    echo Error: app.py not found!
    pause
    exit /b 1
)

echo.
echo ML Service starting on http://localhost:5000
echo Press Ctrl+C to stop
echo.

python app.py

pause

