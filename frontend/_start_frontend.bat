@echo off
title NextPanel - Frontend
color 0B
cd /d "%~dp0"
echo.
echo  NextPanel - Frontend
echo  Puerto: 5500
echo  URL: http://localhost:5500/pages/auth.html
echo  --------------------------------
echo.
http-server . -p 5500 -c-1 --cors -o pages/auth.html
echo.
echo  El servidor se detuvo. Presiona cualquier tecla para cerrar.
pause >nul
