@echo off
title LaunchPad - Universal Project Manager
echo Starting LaunchPad...
echo.
echo LaunchPad will open in your default browser.
echo Close this window to stop the local server.
echo.

REM Start local server and open browser
cd /d "%~dp0"
start "" "web-version.html"

REM Keep window open
echo LaunchPad is running!
echo Press any key to close...
pause >nul