@echo off
TITLE Botica Nova Salud (FarmaPlus) - SENATI 2026
COLOR 0A

echo =================================================================
echo   INICIANDO SISTEMA WEB: BOTICA NOVA SALUD (FarmaPlus)
echo   Trabajo Final Fullstack Developer - SENATI
echo =================================================================
echo.

:: 1. Iniciar Backend en segundo plano / nueva ventana
echo [1/2] Iniciando Servidor Backend (Node.js + Express + MongoDB Atlas)...
start "Nova Salud - Backend API (Puerto 5000)" cmd /k "cd /d %~dp0backend && npm start"

:: Pausa breve para arranque de Express
timeout /t 3 /nobreak >nul

:: 2. Iniciar Frontend en nueva ventana
echo [2/2] Iniciando Servidor Frontend (React + Vite)...
start "Nova Salud - Frontend Web (Puerto 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Pausa breve para arranque de Vite
timeout /t 3 /nobreak >nul

:: 3. Abrir navegador web en el sistema
echo.
echo =================================================================
echo   SISTEMA OPERATIVO Y DISPONIBLE EN:
echo   http://localhost:5173
echo =================================================================
start http://localhost:5173

exit

