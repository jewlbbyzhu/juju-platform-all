const logger = require('../utils/logger');

class GracefulShutdown {
  constructor() {
    this.shutdownInProgress = false;
    this.shutdownCallbacks = [];
    this.server = null;
    this.shutdownTimeout = 30000;
  }

  registerServer(server) {
    this.server = server;
    this.setupShutdownHandlers();
  }

  registerCallback(callback) {
    this.shutdownCallbacks.push(callback);
  }

  setupShutdownHandlers() {
    const shutdown = (signal) => {
      if (this.shutdownInProgress) {
        logger.warn('Shutdown already in progress, ignoring signal');
        return;
      }

      this.shutdownInProgress = true;
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      this.performGracefulShutdown();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.performGracefulShutdown();
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      if (process.env.NODE_ENV === 'production') {
        this.performGracefulShutdown();
        process.exit(1);
      }
    });
  }

  async performGracefulShutdown() {
    try {
      logger.info('Executing shutdown callbacks...');

      const shutdownPromise = (async () => {
        for (const callback of this.shutdownCallbacks) {
          try {
            await callback();
          } catch (error) {
            logger.error('Error executing shutdown callback:', error);
          }
        }

        if (this.server) {
          logger.info('Closing HTTP server...');
          await new Promise((resolve, reject) => {
            this.server.close((err) => {
              if (err) {
                logger.error('Error closing server:', err);
                reject(err);
              } else {
                logger.info('HTTP server closed successfully');
                resolve();
              }
            });
          });
        }

        await this.closeDatabaseConnections();
        await this.closeRedisConnection();
      })();

      await Promise.race([
        shutdownPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Shutdown timeout')), this.shutdownTimeout)
        )
      ]);

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  async closeDatabaseConnections() {
    try {
      logger.info('Closing database connections...');
      
      const database = require('../config/database');
      if (database && database.sequelize) {
        await database.sequelize.close();
        logger.info('Database connection closed');
      }

      const databaseReadWrite = require('../config/databaseReadWrite');
      if (databaseReadWrite) {
        await databaseReadWrite.closeConnections();
        logger.info('Database read-write connections closed');
      }
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }
  }

  async closeRedisConnection() {
    try {
      logger.info('Closing Redis connection...');
      
      const redis = require('../config/redis');
      if (redis && redis.redisClient) {
        await redis.redisClient.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }

  setShutdownTimeout(timeout) {
    this.shutdownTimeout = timeout;
  }
}

const gracefulShutdown = new GracefulShutdown();

module.exports = gracefulShutdown;
