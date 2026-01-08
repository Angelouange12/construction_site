const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// Configuration du logging
const logging = process.env.SQL_LOGGING === 'true' ? console.log : false;

// Base configuration
const baseConfig = {
  // Default to sqlite for development
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  // Production configuration (uses DATABASE_URL environment variable)
  production: {
    dialect: 'postgres',
    protocol: 'postgres',
    logging,
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Handle environment and configuration
const env = process.env.NODE_ENV || 'development';
const config = { ...baseConfig[env] };

// Handle DATABASE_URL if provided
if (process.env.DATABASE_URL) {
  console.log('🔗 Using PostgreSQL (DATABASE_URL)');
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  // Update config with DATABASE_URL values
  config.username = dbUrl.username;
  config.password = dbUrl.password;
  config.host = dbUrl.hostname;
  config.port = dbUrl.port;
  config.database = dbUrl.pathname.replace(/^\//, ''); // Remove leading slash
  config.protocol = 'postgres';
  config.dialect = 'postgres';
}

// Handle DB_URL if provided (alternative to DATABASE_URL)
if (process.env.DB_URL) {
  console.log('🔗 Using PostgreSQL (DB_URL)');
  config.dialect = 'postgres';
  config.protocol = 'postgres';
}

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log the database being used
if (env === 'production') {
  console.log('🚀 Production database configuration:');
  console.log(`- Host: ${config.host}`);
  console.log(`- Database: ${config.database}`);
  console.log(`- Port: ${config.port}`);
} else {
  console.log('💾 Using SQLite for development');
  console.log(`📂 Database path: ${config.storage}`);
}

// Initialize Sequelize
let sequelize;
try {
  sequelize = new Sequelize(config);
  console.log('✅ Database connection configured successfully');
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}

// Test database connection
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

// Export the configuration and Sequelize instance
module.exports = {
  // For backward compatibility
  [env]: { database: config },
  database: config,
  sequelize,
  testConnection,
  Sequelize // Export Sequelize for model definitions
};
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