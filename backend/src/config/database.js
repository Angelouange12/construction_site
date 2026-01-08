const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// Configuration du logging
const logging = process.env.SQL_LOGGING === 'true' ? console.log : false;

// Créer l'instance Sequelize directement
let sequelize;

console.log('🔍 Environment check:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

if (process.env.DATABASE_URL) {
  console.log('🔗 Using PostgreSQL (DATABASE_URL)');
  
  try {
    // Parse DATABASE_URL pour afficher les infos (sans le mot de passe)
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log(`📊 Database Info:`);
    console.log(`  Host: ${dbUrl.hostname}`);
    console.log(`  Port: ${dbUrl.port || '5432'}`);
    console.log(`  Database: ${dbUrl.pathname.replace('/', '')}`);
    console.log(`  Username: ${dbUrl.username}`);
    
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EHOSTUNREACH/,
          /EPIPE/,
          /EAI_AGAIN/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        max: 3
      }
    });
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    process.exit(1);
  }
} else if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Using PostgreSQL (production environment variables)');
  
  // Vérifier les variables requises
  const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`📊 Database Info:`);
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  Username: ${process.env.DB_USER}`);
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log('💾 Using SQLite for development');
  
  // Créer le répertoire logs si nécessaire
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`📁 Created logs directory: ${logDir}`);
  }
  
  const dbPath = path.join(__dirname, '..', 'database.sqlite');
  console.log(`📂 Database path: ${dbPath}`);
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 2
    }
  });
}

// Fonction pour tester la connexion
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Synchroniser les modèles en développement
    if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
      console.log('🔄 Syncing database models...');
      const { syncDatabase } = require('../models');
      await syncDatabase();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    
    // Afficher plus de détails pour le debug
    if (error.original) {
      console.error('🔍 Original error:', error.original.message);
    }
    
    return false;
  }
}

// Exportations
module.exports = {
  sequelize,
  testConnection,
  Sequelize,
  
  // Configuration pour référence
  getConfig: () => ({
    dialect: sequelize.options.dialect,
    database: sequelize.config.database,
    host: sequelize.config.host,
    port: sequelize.config.port,
    username: sequelize.config.username
  })
};