@echo off
chcp 65001 >nul
echo Installazione di KOCHBUCH FUER TEENAGER in corso...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0installa_libro.ps1"
echo.
pause
