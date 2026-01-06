const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const compression = require('compression');
const { StatusCodes } = require('http-status-codes');

// Initialiser l'application Express
const app = express();

// Charger la configuration en fonction de l'environnement
const env = process.env.NODE_ENV || 'development';
const config = require('./config');
const envConfig = config[env === 'production' ? 'production' : 'development'] || {};

// Configuration du proxy (nécessaire pour Railway et derrière un reverse proxy)
app.set('trust proxy', envConfig.server?.trustProxy ? 1 : 0);

// Importer les routes et les middlewares
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { sequelize, testConnection } = require('./config/database');
const { syncDatabase } = require('./models');

// Configuration des logs d'accès
const logDirectory = path.join(__dirname, '..', 'logs');

// Créer le répertoire des logs s'il n'existe pas
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Créer un flux de rotation pour les logs d'accès
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotation quotidienne
  path: logDirectory,
  compress: 'gzip',
  size: '10M',
  maxFiles: 7 // conserver les logs pendant 7 jours
});

// Middleware de compression des réponses
app.use(compression());

// Middleware de logging
const logFormat = env === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat, { 
  stream: env === 'production' ? accessLogStream : process.stdout 
}));

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactiver si vous avez des problèmes avec les ressources externes
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Configuration CORS avec des valeurs par défaut sécurisées
const corsOptions = envConfig.server?.cors || {
  origin: env === 'production' 
    ? [
        'https://constructionsite-production.up.railway.app',
        'https://chic-exploration-production.up.railway.app',
        'https://*.railway.app'
      ]
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600
};

app.use(cors(corsOptions));

// Middleware pour parser le corps des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de limitation de débit (rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.'
});

// Appliquer à toutes les requêtes
app.use(limiter);

// Servir les fichiers statiques
if (fs.existsSync(path.join(__dirname, '..', 'uploads'))) {
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '1y', // Mise en cache pour 1 an
    etag: true
  }));
}

// Routes de l'API
app.use('/api', routes);

// Route de santé pour les vérifications de disponibilité
app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env,
    database: 'connected',
    version: require('../package.json').version
  });
});

// Route racine
app.get('/', (req, res) => {
  res.status(StatusCodes.OK).json({
    name: 'Construction Site Management API',
    version: require('../package.json').version,
    environment: env,
    documentation: '/api-docs', // Si vous utilisez Swagger/OpenAPI
    status: 'running'
  });
});

// Gestion des erreurs 404
app.use(notFoundHandler);

// Gestion des erreurs globales
app.use(errorHandler);

// Health check endpoint specifically for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'connected'
  });
});

// API Routes
app.use('/api', routes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  
  // Serve static files from the frontend build
  app.use(express.static(frontendPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/' || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Sync database (don't reset in production)
    const shouldReset = process.env.RESET_DB === 'true' && process.env.NODE_ENV !== 'production';
    
    console.log('🔄 Syncing database...');
    await syncDatabase(shouldReset);
    console.log('✅ Database synchronized successfully');
    
    const port = process.env.PORT || config.port;
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`
========================================
  Construction Site Management API
========================================
  Environment: ${config.nodeEnv}
  Port: ${port}
  Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}
  Health Check: http://0.0.0.0:${port}/health
========================================
      `);
    });
    
    // Graceful shutdown handler for Railway
    process.on('SIGTERM', () => {
      console.log('🔻 SIGTERM received: graceful shutdown initiated');
      server.close(() => {
        console.log('✅ HTTP server closed gracefully');
        process.exit(0);
      });
      
      // Force shutdown after 10 seconds if graceful fails
      setTimeout(() => {
        console.log('⏰ Force shutdown after timeout');
        process.exit(1);
      }, 10000);
    });
    
    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Démarrer le serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;