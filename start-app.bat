@echo off
echo ===================================================
echo       VISUAL FASHION FINDER - DÉMARRAGE
echo ===================================================
echo.

REM Vérifier si le fichier .env existe, sinon exécuter le setup
if not exist "backend\.env" (
    echo Configuration de l'environnement nécessaire...
    call setup-environment.bat
)

echo Démarrage des services...
echo.

REM Vérification des prérequis
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Python n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Python depuis https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Création des dossiers si nécessaire
if not exist "backend\node_modules" (
    echo Installation des dépendances backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installation des dépendances frontend...
    cd frontend
    call npm install
    cd ..
)

REM Démarrage des services
echo.
echo Démarrage du service ML...
start "Service ML" cmd /c "cd ml-service && python app.py"

echo Démarrage du backend...
start "Backend" cmd /c "cd backend && npm run dev"

echo Démarrage du frontend...
start "Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo Tous les services ont été lancés !
echo.
echo L'application sera disponible dans quelques instants à:
echo http://localhost:3000
echo.
echo Ne fermez pas cette fenêtre tant que vous utilisez l'application.
echo ===================================================

timeout /t 15

start http://localhost:3000

echo.
echo Pour arrêter l'application, fermez cette fenêtre.
echo.
pause
taskkill /F /FI "WINDOWTITLE eq Service ML*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend*" >nul 2>&1
echo Application arrêtée.
pause