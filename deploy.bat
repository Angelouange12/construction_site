@echo off
echo 🚀 Préparation du déploiement sur Render
echo ========================================

REM Vérifier si git est disponible
git --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Git n'est pas installé
    exit /b 1
)

REM Vérifier si des modifications sont en attente
git status --porcelain > temp_status.txt
set /p status_check=<temp_status.txt
del temp_status.txt

if not "%status_check%"=="" (
    echo ⚠️  Vous avez des modifications non commitées
    echo Veuillez les commit avant de continuer
    exit /b 1
)

echo ✅ Tous les fichiers sont commités

REM Vérifier la configuration
echo 📋 Vérification de la configuration...

REM Backend
if exist "backend\package.json" (
    echo ✅ Backend package.json trouvé
) else (
    echo ❌ Backend package.json manquant
    exit /b 1
)

REM Frontend
if exist "frontend\package.json" (
    echo ✅ Frontend package.json trouvé
) else (
    echo ❌ Frontend package.json manquant
    exit /b 1
)

REM Render configuration
if exist "render.yaml" (
    echo ✅ render.yaml trouvé
) else (
    echo ❌ render.yaml manquant
    exit /b 1
)

REM Frontend environment
if exist "frontend\.env.production" (
    echo ✅ Frontend .env.production trouvé
    findstr "VITE_API_URL" frontend\.env.production
) else (
    echo ❌ Frontend .env.production manquant
    exit /b 1
)

echo.
echo 🎯 Configuration pour le déploiement :
echo    Backend: https://construction-site-api-8llr.onrender.com
echo    Frontend: https://construction-site-frontend-f08z.onrender.com
echo.
echo 📝 Actions requises :
echo 1. Poussez les modifications : git push origin main
echo 2. Allez sur Render Dashboard
echo 3. Vérifiez que les services se déploient correctement
echo 4. Testez l'application complète
echo.
echo 🔗 URLs importantes :
echo    - Backend API: https://construction-site-api-8llr.onrender.com/health
echo    - Frontend: https://construction-site-frontend-f08z.onrender.com
echo    - Render Dashboard: https://dashboard.render.com
echo.
echo ✅ Prêt pour le déploiement !
pause
