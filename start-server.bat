@echo off
echo Starting local web server...
echo.
echo Open your browser and go to: http://localhost:1950
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 1950
pause

