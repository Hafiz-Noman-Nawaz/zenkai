// Zenkai API Server Entry Point
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Zenkai API Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('🔌 HTTP server closed.');
        await prisma.$disconnect();
        console.log('📦 Database connection closed.');
        process.exit(0);
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        console.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start Zenkai server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
