const { sequelize } = require('../config/database');
const logger = require('./logger');

class TransactionManager {
  static Transaction = {
    ISOLATION_LEVELS: {
      READ_UNCOMMITTED: 'READ UNCOMMITTED',
      READ_COMMITTED: 'READ COMMITTED',
      REPEATABLE_READ: 'REPEATABLE READ',
      SERIALIZABLE: 'SERIALIZABLE'
    }
  };

  static async execute(callback, options = {}) {
    const { isolationLevel = null, lock = null } = options;
    
    const t = await sequelize.transaction({
      isolationLevel: isolationLevel,
      lock: lock
    });
    
    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      logger.error('Transaction failed, rolled back:', error);
      throw error;
    }
  }

  static async executeWithRetry(callback, options = {}, maxRetries = 3, retryDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(callback, options);
      } catch (error) {
        lastError = error;
        logger.warn(`Transaction attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    throw lastError;
  }
}

module.exports = TransactionManager;
