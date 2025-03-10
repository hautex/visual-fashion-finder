@echo off
echo ===================================================
echo       CONFIGURATION DE L'ENVIRONNEMENT
echo ===================================================
echo.

REM Vérifier si le dossier backend existe
if not exist "backend" (
    echo ERREUR: Le dossier backend n'existe pas.
    pause
    exit /b 1
)

REM Créer le fichier .env dans le dossier backend
set ENV_FILE=backend\.env

echo # Fichier de configuration créé le %date% à %time% > %ENV_FILE%
echo. >> %ENV_FILE%
echo # Configuration API Google >> %ENV_FILE%
echo GOOGLE_API_KEY=AIzaSyCHbV8s_R3Q-zcZ4npyFH06MwhGCdptoNQ >> %ENV_FILE%
echo GOOGLE_SEARCH_ENGINE_ID=233b9e048806d4add >> %ENV_FILE%
echo. >> %ENV_FILE%
echo # Autres variables d'environnement >> %ENV_FILE%
echo PORT=3001 >> %ENV_FILE%
echo ML_SERVICE_URL=http://localhost:8000 >> %ENV_FILE%

echo.
echo Configuration terminée! Le fichier .env a été créé dans le dossier backend.
echo.
echo Pour démarrer l'application, exécutez start-app.bat
echo ===================================================
echo.
pause