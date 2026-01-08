const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const config = require('.');

// Charger la configuration en fonction de l'environnement
const env = process.env.NODE_ENV || 'development';
const dbConfig = env === 'production' 
  ? require('./production').database 
  : require('./development').database;

// Créer le répertoire des logs s'il n'existe pas
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuration du logging
const logging = process.env.SQL_LOGGING === 'true' 
  ? console.log 
  : false;

let sequelize;

try {
  // Configuration de la connexion à la base de données
  if (process.env.DATABASE_URL) {
    // Configuration pour PostgreSQL (production sur Render)
    console.log('🔗 Using PostgreSQL (DATABASE_URL)');
    
    // Parse the DATABASE_URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    // Extract connection parameters
    const connectionConfig = {
      username: dbUrl.username,
      password: dbUrl.password,
      host: dbUrl.hostname,
      port: dbUrl.port,
      database: dbUrl.pathname.replace(/^\//, ''), // Remove leading slash
      dialect: 'postgres',
      protocol: 'postgres',
      logging,
      ...dbConfig,
      dialectOptions: {
        ...(process.env.NODE_ENV === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {}),
        ...(dbConfig.dialectOptions || {})
      },
      pool: {
        max: 5,
        min: 0,
        acquire: process.env.NODE_ENV === 'production' ? 60000 : 30000,
        idle: 10000,
        ...(dbConfig.pool || {})
      }
    };
    
    sequelize = new Sequelize(connectionConfig);
  } else if (process.env.DB_URL) {
    // Configuration pour PostgreSQL avec URL complète
    console.log('🔗 Using PostgreSQL (DB_URL)');
    
    sequelize = new Sequelize(process.env.DB_URL, {
      dialect: 'postgres',
      logging,
      ...dbConfig,
      dialectOptions: {
        ...(process.env.NODE_ENV === 'production' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {}),
        ...(dbConfig.dialectOptions || {})
      },
      pool: {
        max: 5,
        min: 0,
        acquire: process.env.NODE_ENV === 'production' ? 60000 : 30000,
        idle: 10000,
        ...(dbConfig.pool || {})
      }
    });
  } else {
    // Configuration pour SQLite (développement/local)
    console.log('💾 Using SQLite');
    
    // Déterminer le chemin de la base de données
    const dbPath = process.env.NODE_ENV === 'production'
      ? '/tmp/database.sqlite'  // Répertoire temporaire sur Render
      : path.join(__dirname, '..', 'database.sqlite');
    
    console.log(`📂 Database path: ${dbPath}`);
    
    // Créer le répertoire parent si nécessaire
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging,
      ...dbConfig
    });
  }
} catch (error) {
  console.error('❌ Failed to connect to the database:', error);
  process.exit(1);
}

// Tester la connexion à la base de données
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

// Exporter l'instance Sequelize et la fonction de test
module.exports = {
  sequelize,
  testConnection,
  config: dbConfig
};