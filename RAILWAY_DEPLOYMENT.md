# 🚀 Railway Deployment Guide

## Construction Site Management Application - Burundi

This guide explains how to deploy the application to Railway.

---

## 📋 Prerequisites

1. A [Railway](https://railway.app) account
2. Git repository with your code
3. PostgreSQL database (Railway provides this)

---

## 🛠️ Deployment Steps

### Option 1: One-Click Deploy (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/construction-site.git
   git push -u origin main
   ```

2. **Create a new project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create `DATABASE_URL` variable

4. **Configure Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add the following variables:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Environment mode |
   | `JWT_SECRET` | `your-secret-key` | JWT signing secret (generate a strong one) |
   | `JWT_EXPIRES_IN` | `24h` | Token expiration |
   | `RESET_DB` | `true` | Set to `true` ONCE to seed initial data |

5. **Deploy**
   - Railway will automatically build and deploy
   - After first deployment, set `RESET_DB=false` to prevent data reset

---

### Option 2: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Link**
   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add --database postgres
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-super-secret-key
   railway variables set JWT_EXPIRES_IN=24h
   railway variables set RESET_DB=true
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **After successful deployment, disable DB reset**
   ```bash
   railway variables set RESET_DB=false
   ```

---

## 🔐 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | PostgreSQL connection string (auto-set by Railway) |
| `PORT` | ❌ | Railway auto | Server port (Railway sets this automatically) |
| `NODE_ENV` | ✅ | development | Set to `production` |
| `JWT_SECRET` | ✅ | - | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | ❌ | 24h | JWT token expiration |
| `RESET_DB` | ❌ | false | Reset and seed database on start |

---

## 📁 Project Structure

```
construction-site/
├── backend/           # Express.js API
│   ├── src/
│   │   ├── app.js     # Main application
│   │   ├── config/    # Configuration files
│   │   ├── models/    # Sequelize models
│   │   ├── routes/    # API routes
│   │   └── ...
│   └── package.json
├── frontend/          # React (Vite) application
│   ├── src/
│   ├── dist/          # Production build (generated)
│   └── package.json
├── package.json       # Root package.json for monorepo
├── railway.json       # Railway configuration
├── nixpacks.toml      # Build configuration
└── Procfile           # Process file
```

---

## 🔄 How It Works

1. **Build Phase**: Railway installs dependencies and builds the React frontend
2. **Start Phase**: The backend serves both the API and the static frontend files
3. **Database**: PostgreSQL is used in production (SQLite in development)

---

## 🧪 Test Accounts

After seeding the database (first deployment with `RESET_DB=true`):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@construction.com | admin123 |
| Chef de chantier | chef@construction.com | chef123 |
| Ouvrier | ouvrier@construction.com | ouvrier123 |

---

## 🌍 Localization

The application is configured for Burundi:
- **Timezone**: Africa/Bujumbura (CAT)
- **Currency**: BIF (Franc Burundais)
- **Language**: French
- **Cities**: All 17 provinces of Burundi

---

## 🐛 Troubleshooting

### Build Fails
- Check if all dependencies are in `package.json`
- Ensure Node.js version is >= 18

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check if PostgreSQL service is running

### Frontend Not Loading
- Ensure frontend build completed successfully
- Check if `dist` folder exists after build

### CORS Errors
- Add your Railway domain to `FRONTEND_URL` environment variable

---

## 📞 Support

For issues, please create a GitHub issue or contact support.

---

## 📄 License

MIT License - See LICENSE file for details.

