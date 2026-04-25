const redisClient = require('../config/redis').redisClient;
const logger = require('./logger');

const TokenBlacklist = {
  async addToBlacklist(token, expiresIn, reason = 'user_logout') {
    try {
      const key = `blacklist:${token}`;
      const value = JSON.stringify({
        reason,
        addedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      });
      
      await redisClient.setEx(key, expiresIn, value);
      
      logger.info('Token added to blacklist', {
        tokenPrefix: token.substring(0, 10),
        reason,
        expiresIn: `${expiresIn}s`
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to add token to blacklist:', error);
      return false;
    }
  },

  async isBlacklisted(token) {
    try {
      const key = `blacklist:${token}`;
      const result = await redisClient.exists(key);
      const isBlacklisted = result === 1;
      
      if (isBlacklisted) {
        const value = await redisClient.get(key);
        const data = JSON.parse(value);
        
        logger.info('Token is blacklisted', {
          tokenPrefix: token.substring(0, 10),
          reason: data.reason,
          addedAt: data.addedAt
        });
      }
      
      return isBlacklisted;
    } catch (error) {
      logger.error('Failed to check token blacklist status:', error);
      return false;
    }
  },

  async removeFromBlacklist(token) {
    try {
      const key = `blacklist:${token}`;
      await redisClient.del(key);
      
      logger.info('Token removed from blacklist', {
        tokenPrefix: token.substring(0, 10)
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to remove token from blacklist:', error);
      return false;
    }
  },

  async getBlacklistInfo(token) {
    try {
      const key = `blacklist:${token}`;
      const value = await redisClient.get(key);
      
      if (!value) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      logger.error('Failed to get blacklist info:', error);
      return null;
    }
  },

  async clearAllBlacklistedTokens() {
    try {
      const keys = await redisClient.keys('blacklist:*');
      
      if (keys.length === 0) {
        logger.info('No blacklisted tokens to clear');
        return 0;
      }
      
      await redisClient.del(keys);
      
      logger.info('Cleared all blacklisted tokens', {
        count: keys.length
      });
      
      return keys.length;
    } catch (error) {
      logger.error('Failed to clear blacklisted tokens:', error);
      return 0;
    }
  },

  async getBlacklistStats() {
    try {
      const keys = await redisClient.keys('blacklist:*');
      const stats = {
        total: keys.length,
        byReason: {}
      };
      
      for (const key of keys) {
        const value = await redisClient.get(key);
        const data = JSON.parse(value);
        const reason = data.reason || 'unknown';
        
        stats.byReason[reason] = (stats.byReason[reason] || 0) + 1;
      }
      
      return stats;
    } catch (error) {
      logger.error('Failed to get blacklist stats:', error);
      return {
        total: 0,
        byReason: {}
      };
    }
  },

  async cleanupExpiredTokens() {
    try {
      const keys = await redisClient.keys('blacklist:*');
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        
        if (ttl === -1) {
          await redisClient.del(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.info('Cleaned up expired tokens', {
          count: cleanedCount
        });
      }
      
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired tokens:', error);
      return 0;
    }
  }
};

module.exports = TokenBlacklist;