# Déploiement sur Render

Ce guide explique comment déployer l'application sur Render.

## Prérequis

- Un compte [Render](https://render.com/)
- Un dépôt Git (GitHub, GitLab ou Bitbucket) contenant le code source
- Une base de données PostgreSQL (peut être créée sur Render)

## Étapes de déploiement

### 1. Préparation de l'environnement

1. Assurez-vous que votre application fonctionne en local avec la configuration de production
2. Vérifiez que toutes les dépendances sont listées dans `package.json`
3. Créez un fichier `.env` basé sur `.env.example` avec vos configurations de production

### 2. Configuration de la base de données sur Render

1. Allez sur [Render Dashboard](https://dashboard.render.com/)
2. Cliquez sur "New" puis sélectionnez "PostgreSQL"
3. Configurez votre base de données :
   - **Name** : `construction-site-db` (ou le nom de votre choix)
   - **Database** : `construction_site`
   - **User** : `construction_site_user` (ou le nom d'utilisateur de votre choix)
   - **Region** : Sélectionnez la région la plus proche de vos utilisateurs
   - **PostgreSQL Version** : Laissez la version par défaut
4. Cliquez sur "Create Database"
5. Notez les informations de connexion fournies (URL de connexion, nom d'utilisateur, mot de passe)

### 3. Déploiement du backend

1. Retournez au tableau de bord Render et cliquez sur "New" puis "Web Service"
2. Liez votre dépôt Git
3. Configurez le service web :
   - **Name** : `construction-site-api` (ou le nom de votre choix)
   - **Region** : Même région que votre base de données
   - **Branch** : `main` ou la branche que vous souhaitez déployer
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free (ou choississez un plan payant pour de meilleures performances)

4. Dans la section "Advanced" :
   - **Auto-Deploy** : Activé (pour déployer automatiquement les mises à jour)
   - **Pull Request Previews** : Activé si vous voulez des environnements d'évaluation

5. Dans la section "Environment Variables", ajoutez les variables d'environnement nécessaires :
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://user:password@host:5432/database_name
   JWT_SECRET=votre_clé_secrète_très_longue_et_sécurisée
   JWT_EXPIRES_IN=30d
   FRONTEND_URL=https://votre-frontend-render-url.onrender.com
   ```
   Remplacez les valeurs par celles de votre configuration.

6. Cliquez sur "Create Web Service"

### 4. Configuration du domaine personnalisé (optionnel)

1. Dans le tableau de bord de votre service web, allez dans l'onglet "Settings"
2. Faites défiler jusqu'à la section "Custom Domains"
3. Ajoutez votre nom de domaine personnalisé et suivez les instructions pour vérifier la propriété

### 5. Surveillance et maintenance

- **Logs** : Consultez les logs dans l'onglet "Logs" de votre service web
- **Métriques** : Surveillez les performances dans l'onglet "Metrics"
- **Mises à jour** : Les mises à jour sont automatiques si vous avez activé le déploiement automatique

## Dépannage

### Problèmes de connexion à la base de données
- Vérifiez que l'URL de la base de données est correcte
- Assurez-vous que le service web et la base de données sont dans la même région
- Vérifiez les logs pour les erreurs de connexion

### L'application ne démarre pas
- Vérifiez que le port d'écoute est correct (10000 par défaut)
- Assurez-vous que toutes les variables d'environnement requises sont définies
- Consultez les logs pour les erreurs de démarrage

### Problèmes de performances
- Passez à un plan supérieur si nécessaire
- Activez le cache de base de données si disponible
- Optimisez vos requêtes SQL

## Mise à jour de l'application

1. Poussez vos modifications sur la branche principale
2. Render détectera automatiquement les changements et redéploiera l'application
3. Surveillez le déploiement dans l'onglet "Deploys"
