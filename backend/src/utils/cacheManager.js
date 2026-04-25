const Redis = require('redis');
const logger = require('./logger');

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  init() {
    try {
      this.client = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retry_strategy: (options) => {
          const delay = Math.min(options.attempt * 50, 2000);
          logger.warn(`Redis reconnection attempt ${options.attempt}, delay: ${delay}ms`);
          return delay;
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        logger.error('Redis connection error:', error);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis connection closed');
      });
    } catch (error) {
      logger.error('Redis initialization failed:', error);
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        return null;
      }

      const value = await new Promise((resolve, reject) => {
        this.client.get(key, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get failed:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected) {
        return false;
      }

      await new Promise((resolve, reject) => {
        this.client.setex(key, ttl, JSON.stringify(value), (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return true;
    } catch (error) {
      logger.error('Cache set failed:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) {
        return false;
      }

      await new Promise((resolve, reject) => {
        this.client.del(key, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return true;
    } catch (error) {
      logger.error('Cache delete failed:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const keys = await new Promise((resolve, reject) => {
        this.client.keys(pattern, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      if (keys.length > 0) {
        await new Promise((resolve, reject) => {
          this.client.del(keys, (err, reply) => {
            if (err) reject(err);
            else resolve(reply);
          });
        });
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern failed:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await new Promise((resolve, reject) => {
        this.client.exists(key, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return result === 1;
    } catch (error) {
      logger.error('Cache exists check failed:', error);
      return false;
    }
  }

  async expire(key, ttl) {
    try {
      if (!this.isConnected) {
        return false;
      }

      await new Promise((resolve, reject) => {
        this.client.expire(key, ttl, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return true;
    } catch (error) {
      logger.error('Cache expire failed:', error);
      return false;
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected) {
        return -1;
      }

      return await new Promise((resolve, reject) => {
        this.client.ttl(key, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
    } catch (error) {
      logger.error('Cache ttl check failed:', error);
      return -1;
    }
  }

  async incr(key) {
    try {
      if (!this.isConnected) {
        return null;
      }

      return await new Promise((resolve, reject) => {
        this.client.incr(key, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
    } catch (error) {
      logger.error('Cache increment failed:', error);
      return null;
    }
  }

  async decr(key) {
    try {
      if (!this.isConnected) {
        return null;
      }

      return await new Promise((resolve, reject) => {
        this.client.decr(key, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
    } catch (error) {
      logger.error('Cache decrement failed:', error);
      return null;
    }
  }

  async mget(keys) {
    try {
      if (!this.isConnected) {
        return [];
      }

      const values = await new Promise((resolve, reject) => {
        this.client.mget(keys, (err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget failed:', error);
      return [];
    }
  }

  async mset(keyValuePairs) {
    try {
      if (!this.isConnected) {
        return false;
      }

      const multi = this.client.multi();
      for (const [key, value, ttl] of keyValuePairs) {
        multi.setex(key, ttl, JSON.stringify(value));
      }
      await new Promise((resolve, reject) => {
        multi.exec((err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      return true;
    } catch (error) {
      logger.error('Cache mset failed:', error);
      return false;
    }
  }

  async flushDb() {
    try {
      if (!this.isConnected) {
        return false;
      }

      await new Promise((resolve, reject) => {
        this.client.flushdb((err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });
      logger.info('Cache database flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush failed:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await new Promise((resolve, reject) => {
          this.client.quit((err, reply) => {
            if (err) reject(err);
            else resolve(reply);
          });
        });
        this.isConnected = false;
        logger.info('Redis disconnected successfully');
      }
    } catch (error) {
      logger.error('Redis disconnect failed:', error);
    }
  }

  getCacheKey(prefix, identifier) {
    return `${prefix}:${identifier}`;
  }

  getUserCacheKey(userId) {
    return this.getCacheKey('user', userId);
  }

  getPartyCacheKey(partyId) {
    return this.getCacheKey('party', partyId);
  }

  getOrderCacheKey(orderId) {
    return this.getCacheKey('order', orderId);
  }

  getTicketCacheKey(ticketId) {
    return this.getCacheKey('ticket', ticketId);
  }

  getHotPartiesCacheKey(page, limit) {
    return this.getCacheKey('hot_parties', `${page}:${limit}`);
  }

  getFeaturedPartiesCacheKey(page, limit) {
    return this.getCacheKey('featured_parties', `${page}:${limit}`);
  }

  getUserStatsCacheKey(userId) {
    return this.getCacheKey('user_stats', userId);
  }

  getPartyStatsCacheKey(partyId) {
    return this.getCacheKey('party_stats', partyId);
  }

  getPublishedPartiesCacheKey(page, pageSize, filters) {
    const filterStr = Object.keys(filters).sort().map(k => `${k}:${filters[k]}`).join('|');
    return this.getCacheKey('published_parties', `${page}:${pageSize}:${filterStr}`);
  }
}

module.exports = new CacheManager();
