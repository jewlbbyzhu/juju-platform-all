const redisClient = require('../config/redis').redisClient;
const logger = require('./logger');

class CacheService {
  constructor() {
    this.defaultTTL = 300;
    this.cachePrefix = 'cache';
  }

  async get(key) {
    try {
      const cacheKey = `${this.cachePrefix}:${key}`;
      const cached = await redisClient.get(cacheKey);
      
      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
      
      logger.debug(`Cache miss: ${cacheKey}`);
      return null;
    } catch (error) {
      logger.error(`Failed to get cache ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const cacheKey = `${this.cachePrefix}:${key}`;
      const cacheTTL = ttl || this.defaultTTL;
      
      await redisClient.set(cacheKey, JSON.stringify(value), {
        EX: cacheTTL
      });
      
      logger.debug(`Cache set: ${cacheKey}`, {
        ttl: cacheTTL
      });
      return true;
    } catch (error) {
      logger.error(`Failed to set cache ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      const cacheKey = `${this.cachePrefix}:${key}`;
      await redisClient.del(cacheKey);
      
      logger.debug(`Cache deleted: ${cacheKey}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete cache ${key}:`, error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const cachePattern = `${this.cachePrefix}:${pattern}`;
      const keys = await redisClient.keys(cachePattern);
      
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
        logger.debug(`Cache pattern deleted: ${cachePattern}`, {
          count: keys.length
        });
      }
      
      return keys.length;
    } catch (error) {
      logger.error(`Failed to delete cache pattern ${pattern}:`, error);
      return 0;
    }
  }

  async getOrSet(key, fetchFn, ttl = null) {
    const cached = await this.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    logger.debug(`Cache miss, fetching data for: ${key}`);
    const value = await fetchFn();
    
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttl);
    }
    
    return value;
  }

  async invalidateByPrefix(prefix) {
    try {
      const cachePattern = `${this.cachePrefix}:${prefix}*`;
      const keys = await redisClient.keys(cachePattern);
      
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Cache invalidated by prefix: ${prefix}`, {
          count: keys.length
        });
      }
      
      return keys.length;
    } catch (error) {
      logger.error(`Failed to invalidate cache by prefix ${prefix}:`, error);
      return 0;
    }
  }

  async invalidateByPattern(pattern) {
    try {
      const cachePattern = `${this.cachePrefix}:${pattern}`;
      const keys = await redisClient.keys(cachePattern);
      
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
        logger.info(`Cache invalidated by pattern: ${pattern}`, {
          count: keys.length
        });
      }
      
      return keys.length;
    } catch (error) {
      logger.error(`Failed to invalidate cache by pattern ${pattern}:`, error);
      return 0;
    }
  }

  async invalidateUserCache(userId) {
    return await this.invalidateByPrefix(`user:${userId}`);
  }

  async invalidatePartyCache(partyId) {
    return await this.invalidateByPrefix(`party:${partyId}`);
  }

  async invalidateOrderCache(orderId) {
    return await this.invalidateByPrefix(`order:${orderId}`);
  }

  async getCacheStats() {
    try {
      const cachePattern = `${this.cachePrefix}:*`;
      const keys = await redisClient.keys(cachePattern);
      
      const stats = {
        totalKeys: keys.length,
        timestamp: new Date().toISOString()
      };
      
      logger.info('Cache stats:', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return {
        totalKeys: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  async clearAll() {
    try {
      const cachePattern = `${this.cachePrefix}:*`;
      const keys = await redisClient.keys(cachePattern);
      
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
        logger.info('All cache cleared:', {
          count: keys.length
        });
      }
      
      return keys.length;
    } catch (error) {
      logger.error('Failed to clear all cache:', error);
      return 0;
    }
  }

  generateKey(type, id) {
    return `${type}:${id}`;
  }

  generateUserKey(userId) {
    return this.generateKey('user', userId);
  }

  generatePartyKey(partyId) {
    return this.generateKey('party', partyId);
  }

  generateOrderKey(orderId) {
    return this.generateKey('order', orderId);
  }

  generatePartyListKey(filters) {
    const filterStr = JSON.stringify(filters);
    return this.generateKey('party:list', Buffer.from(filterStr).toString('base64'));
  }

  generateUserListKey(filters) {
    const filterStr = JSON.stringify(filters);
    return this.generateKey('user:list', Buffer.from(filterStr).toString('base64'));
  }
}

const cacheService = new CacheService();

module.exports = {
  CacheService,
  cacheService
};
