// backend/src/config/database.js - VERSION SIMPLIFIÉE
const { Sequelize } = require('sequelize');

console.log('🔍 Environment check:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);

let sequelize;

if (process.env.DATABASE_URL) {
  console.log('🔗 Using PostgreSQL (DATABASE_URL)');
  
  try {
    // Parse DATABASE_URL pour afficher les infos (sans le mot de passe)
    const dbUrl = new URL(process.env.DATABASE_URL);
    console.log('📊 Database Info:');
    console.log(`  Host: ${dbUrl.hostname}`);
    console.log(`  Port: ${dbUrl.port || '5432'}`);
    console.log(`  Database: ${dbUrl.pathname.replace('/', '')}`);
    console.log(`  Username: ${dbUrl.username}`);
    
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: process.env.SQL_LOGGING === 'true' ? console.log : false,
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
      },
      retry: {
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /SequelizeConnectionError/
        ],
        max: 3
      }
    });
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    process.exit(1);
  }
} else {
  console.log('💾 Using SQLite for development');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.SQL_LOGGING === 'true' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  testConnection
};