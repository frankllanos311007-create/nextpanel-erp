@echo off
title NextPanel ERP - Cargando...
color 0A
cd /d "%~dp0"

echo ==========================================
echo       NEXTPANEL ERP - INICIANDO
echo ==========================================
echo.

:: 1. Verificar node_modules
if not exist "backend\node_modules\" (
    echo [1/3] Instalando dependencias...
    cd backend && call npm install && cd ..
) else (
    echo [1/3] Dependencias listas.
)

:: 2. Crear admin silenciosamente
echo [2/3] Verificando usuario administrador...
cd backend && node crear_admin.js > nul 2>&1 && cd ..

:: 3. Lanzar todo
echo [3/3] Abriendo sistema...
echo.

:: Lanzar Backend
start "NextPanel-Backend" cmd /k "cd backend && node src\index.js"

:: Esperar un momento
timeout /t 3 /nobreak >nul

:: Lanzar Frontend (con auto-open de auth.html)
start "NextPanel-Frontend" cmd /k "cd frontend && npx http-server . -p 5500 -c-1 --cors -o pages/auth.html"

echo.
echo ==========================================
echo  TODO LISTO! El sistema abrira en breve.
echo ==========================================
timeout /t 5 >nul
exit
