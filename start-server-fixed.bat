@echo off
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting server on port 1950...
echo Open: http://localhost:1950/index.html
echo.
echo Press Ctrl+C to stop
echo.
python -m http.server 1950

