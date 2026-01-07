const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { syncDatabase } = require('./models');
const apiRoutes = require('./routes');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Sécurité
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev')); // Logging des requêtes

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

// Start server
const startServer = async () => {
  try {
    // Sync database (don't reset in production)
    const shouldReset = process.env.RESET_DB === 'true' && process.env.NODE_ENV !== 'production';
    
    console.log('🔄 Syncing database...');
    await syncDatabase(shouldReset);
    console.log('✅ Database synchronized successfully');
    
    // Use Render's default port or fallback to 5000
    const PORT = process.env.PORT || 10000;
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
========================================
  Construction Site Management API
========================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}
  Health Check: http://0.0.0.0:${PORT}/health
  Server URL: ${process.env.RENDER_EXTERNAL_URL || 'http://localhost:' + PORT}
========================================
      `);
    });
    
    // Graceful shutdown handler for Render
    process.on('SIGTERM', () => {
      console.log('🔻 SIGTERM received: graceful shutdown initiated');
      server.close(() => {
        console.log('✅ HTTP server closed gracefully');
        process.exit(0);
      });
      
      // Force shutdown after 5 seconds if graceful fails
      setTimeout(() => {
        console.log('⏰ Force shutdown after timeout');
        process.exit(1);
      }, 5000);
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
  startServer();
}