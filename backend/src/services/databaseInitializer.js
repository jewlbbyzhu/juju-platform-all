const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

const initializeDatabase = async () => {
  try {
    logger.info('Initializing database...');

    await sequelize.sync({ force: true });

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
