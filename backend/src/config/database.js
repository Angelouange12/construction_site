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

// Configuration de la connexion à la base de données
if (process.env.DATABASE_URL) {
  // Configuration pour PostgreSQL (production sur Railway)
  console.log('🔗 Using PostgreSQL (DATABASE_URL)');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    logging,
    ...dbConfig,
    pool: {
      ...dbConfig.pool,
      // Délai d'attente plus long pour les connexions en production
      acquire: process.env.NODE_ENV === 'production' ? 60000 : 30000,
    }
  });
} else {
  // Configuration pour SQLite (développement/local)
  console.log('💾 Using SQLite');
  
  // Déterminer le chemin de la base de données
  const dbPath = process.env.NODE_ENV === 'production'
    ? '/tmp/database.sqlite'  // Répertoire temporaire sur Railway
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
    ...dbConfig,
    // Désactiver les contraintes de clé étrangère par défaut pour SQLite
    dialectOptions: {
      // Activer les contraintes de clé étrangère
      foreign_keys: 'ON',
      // Désactiver la journalisation en production
      busyTimeout: 30000
    }
  });
}

// Tester la connexion à la base de données
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
};

// Exporter l'instance Sequelize et la fonction de test
module.exports = {
  sequelize,
  testConnection
};