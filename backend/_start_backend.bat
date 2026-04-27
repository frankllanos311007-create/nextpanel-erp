@echo off
title NextPanel - Backend API
color 0B
cd /d "%~dp0"
echo.
echo  NextPanel - Backend API
echo  Puerto: 3001
echo  --------------------------------
echo.
node src\index.js
echo.
echo  El servidor se detuvo. Presiona cualquier tecla para cerrar.
pause >nul
