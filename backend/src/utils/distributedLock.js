const redisClient = require('../config/redis').redisClient;
const logger = require('./logger');

class DistributedLock {
  constructor(key, ttl = 5000) {
    this.key = `lock:${key}`;
    this.ttl = ttl;
    this.lockValue = null;
    this.acquireTime = null;
    this.releaseTime = null;
    this.maxRetries = 3;
    this.retryDelay = 100;
  }

  async acquire() {
    let retries = 0;
    const startTime = Date.now();
    
    while (retries < this.maxRetries) {
      try {
        const lockValue = `${startTime}_${retries}_${Date.now()}`;
        const result = await redisClient.set(this.key, lockValue, {
          NX: true,
          PX: this.ttl
        });

        if (result === 'OK') {
          this.lockValue = lockValue;
          this.acquireTime = startTime;
          const waitTime = Date.now() - startTime;
          
          if (waitTime > 100) {
            logger.warn(`Lock acquisition took ${waitTime}ms:`, {
              key: this.key,
              threshold: 100
            });
          }
          
          logger.debug(`Lock acquired: ${this.key}`, {
            waitTime: `${waitTime}ms`,
            acquireTime: new Date(startTime).toISOString()
          });
          return true;
        }
      } catch (error) {
        logger.error(`Lock acquisition attempt ${retries + 1} failed:`, error);
      }

      retries++;
      if (retries < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }

    const waitTime = Date.now() - startTime;
    logger.debug(`Lock acquisition failed after ${retries} attempts: ${this.key}`, {
      waitTime: `${waitTime}ms`
    });
    return false;
  }

  async release() {
    if (!this.lockValue) {
      logger.warn(`No lock to release: ${this.key}`);
      return;
    }

    try {
      const releaseTime = Date.now();
      const holdTime = this.acquireTime ? releaseTime - this.acquireTime : null;
      
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      await redisClient.eval(script, 1, this.key, this.lockValue);
      
      if (holdTime !== null) {
        logger.debug(`Lock released: ${this.key}`, {
          holdTime: `${holdTime}ms`,
          releaseTime: new Date(releaseTime).toISOString()
        });
        
        if (holdTime > 5000) {
          logger.warn(`Lock held for ${holdTime}ms (threshold: 5000ms):`, {
            key: this.key,
            holdTime: `${holdTime}ms`,
            threshold: 5000
          });
        }
      }
      
      this.lockValue = null;
      this.releaseTime = releaseTime;
    } catch (error) {
      logger.error(`Failed to release lock ${this.key}:`, error);
      this.lockValue = null;
      this.releaseTime = null;
    }
  }

  async forceRelease() {
    try {
      await redisClient.del(this.key);
      logger.info(`Lock force released: ${this.key}`);
      this.lockValue = null;
      this.releaseTime = null;
    } catch (error) {
      logger.error(`Failed to force release lock ${this.key}:`, error);
    }
  }

  static async withLock(key, callback, ttl = 5000) {
    const lock = new DistributedLock(key, ttl);
    const acquired = await lock.acquire();

    if (!acquired) {
      throw new Error('操作进行中，请稍后重试');
    }

    try {
      return await callback();
    } finally {
      await lock.release();
    }
  }
}

module.exports = DistributedLock;
