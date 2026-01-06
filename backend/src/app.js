// Start server
const startServer = async () => {
  try {
    // Sync database (don't reset in production)
    const shouldReset = process.env.RESET_DB === 'true' && process.env.NODE_ENV !== 'production';
    
    console.log('🔄 Syncing database...');
    await syncDatabase(shouldReset);
    console.log('✅ Database synchronized successfully');
    
    const PORT = process.env.PORT || 5000;
    
    // DÉMARRER LE SERVEUR ICI - NE PAS OUBLIER !
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
========================================
  Construction Site Management API
========================================
  Environment: ${env}
  Port: ${PORT}
  Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite'}
  Health Check: http://0.0.0.0:${PORT}/health
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
  startServer();
}