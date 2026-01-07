module.exports = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 10000,
    env: 'production',
    logLevel: 'combined',
    trustProxy: true,
    // Configuration CORS pour la production
    cors: {
      origin: [
        process.env.FRONTEND_URL,
        process.env.RENDER_EXTERNAL_URL,
        'https://*.onrender.com',
        'http://localhost:3000' // Pour les tests locaux
      ].filter(Boolean),
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
    dialect: 'postgres',
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    define: {
      timestamps: true,
      paranoid: true,
      underscored: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 60000, // Augmenté pour les environnements cloud
      idle: 10000
    },
    // Configuration spécifique à PostgreSQL
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  },

  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'votre_clé_secrète_très_longue_et_sécurisée',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '90d'
  },

  // Configuration des téléchargements
  uploads: {
    directory: process.env.UPLOAD_DIR || '/tmp/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
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
    level: 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    errorFile: process.env.ERROR_LOG_FILE || 'logs/error.log',
    maxSize: '20m',
    maxFiles: '14d'
  },

  // Configuration du taux limite (rate limiting)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par fenêtre
  },

  // Configuration de la sécurité
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    },
    cors: true
  }
};
