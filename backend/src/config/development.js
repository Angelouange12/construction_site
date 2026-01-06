module.exports = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 5000,
    env: 'development',
    logLevel: 'dev',
    trustProxy: false,
    // Configuration CORS pour le développement
    cors: {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      maxAge: 600 // 10 minutes
    },
    // Limites de taille pour les requêtes
    bodyParser: {
      json: { limit: '10mb' },
      urlencoded: { extended: true, limit: '10mb' }
    }
  },

  // Configuration de la base de données
  database: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '..', 'database.sqlite'),
    logging: console.log, // Afficher les requêtes SQL dans la console
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Configuration spécifique à SQLite
    dialectOptions: {
      // Activer les contraintes de clé étrangère pour SQLite
      foreign_keys: 'ON'
    }
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
    expiresIn: '30d',
    refreshExpiresIn: '90d'
  },

  // Configuration des téléchargements
  uploads: {
    directory: process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads'),
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },

  // Configuration des logs
  logging: {
    level: 'debug',
    file: path.join(__dirname, '..', '..', 'logs', 'app.log'),
    errorFile: path.join(__dirname, '..', '..', 'logs', 'error.log'),
    maxSize: '10m',
    maxFiles: '7d'
  },

  // Configuration du taux limite (rate limiting)
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000 // limite chaque IP à 1000 requêtes par minute
  },

  // Configuration de la sécurité
  security: {
    helmet: {
      contentSecurityPolicy: false // Désactiver en développement pour éviter les problèmes avec webpack-dev-server
    },
    cors: true
  }
};
