#!/bin/bash

echo "🚀 Préparation du déploiement sur Render"
echo "========================================"

# Vérifier si toutes les modifications sont commitées
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Vous avez des modifications non commitées"
    echo "Veuillez les commit avant de continuer"
    exit 1
fi

echo "✅ Tous les fichiers sont commités"

# Vérifier la configuration
echo "📋 Vérification de la configuration..."

# Backend
if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json trouvé"
else
    echo "❌ Backend package.json manquant"
    exit 1
fi

# Frontend
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json trouvé"
else
    echo "❌ Frontend package.json manquant"
    exit 1
fi

# Render configuration
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml trouvé"
else
    echo "❌ render.yaml manquant"
    exit 1
fi

# Frontend environment
if [ -f "frontend/.env.production" ]; then
    echo "✅ Frontend .env.production trouvé"
    echo "   API URL: $(grep VITE_API_URL frontend/.env.production)"
else
    echo "❌ Frontend .env.production manquant"
    exit 1
fi

echo ""
echo "🎯 Configuration pour le déploiement :"
echo "   Backend: https://construction-site-api-8llr.onrender.com"
echo "   Frontend: https://construction-site-frontend-f08z.onrender.com"
echo ""
echo "📝 Actions requises :"
echo "1. Poussez les modifications : git push origin main"
echo "2. Allez sur Render Dashboard"
echo "3. Vérifiez que les services se déploient correctement"
echo "4. Testez l'application complète"
echo ""
echo "🔗 URLs importantes :"
echo "   - Backend API: https://construction-site-api-8llr.onrender.com/health"
echo "   - Frontend: https://construction-site-frontend-f08z.onrender.com"
echo "   - Render Dashboard: https://dashboard.render.com"
echo ""
echo "✅ Prêt pour le déploiement !"
