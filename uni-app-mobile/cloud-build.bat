@echo off
title HBuilderX Cloud Build Helper
echo.
echo ==========================================
echo    HBuilderX Cloud Build Helper
echo ==========================================
echo.

REM Check if HBuilderX is running
tasklist | findstr "HBuilderX.exe" >nul
if errorlevel 1 (
    echo [1/3] Starting HBuilderX...
    start "" "D:\HBuilderX.4.45.2025010707-full\HBuilderX\HBuilderX.exe" "D:\workspace\uni-app-mobile"
    echo     Waiting for HBuilderX to start...
    timeout /t 15 /nobreak >nul
) else (
    echo [1/3] HBuilderX is already running
)

echo.
echo [2/3] Preparing cloud build...
echo.
echo ==========================================
echo    Please follow these steps:
echo ==========================================
echo.
echo Step 1: In HBuilderX, press Alt+F
echo         (Open Publish menu)
echo.
echo Step 2: Select:
echo         [Native App - Cloud Packaging]
echo         Press Enter
echo.
echo Step 3: In the popup window:
echo         - Select [Android]
echo         - Select [Use own certificate]
echo         - Certificate file: D:\workspace\uni-app-mobile\android.keystore
echo         - Certificate alias: juju
echo         - Certificate password: abcd1234
echo         - Click [Package] button
echo.
echo Step 4: Wait 2-5 minutes
echo         (APK will be downloaded automatically)
echo.
echo ==========================================
echo.

REM Activate HBuilderX window
powershell -c "(New-Object -ComObject WScript.Shell).AppActivate('HBuilderX')" >nul 2>&1

echo [3/3] HBuilderX window activated
echo.
echo Please follow the steps above to complete cloud packaging!
echo.
pause
