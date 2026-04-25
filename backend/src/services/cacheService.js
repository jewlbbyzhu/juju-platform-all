const redis = require('redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || ''
    });

    this.redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });
  }

  async get(key) {
    try {
      const data = await this.redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error('Cache get failed:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      await this.redisClient.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set failed:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete failed:', error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache delete pattern failed:', error);
      return 0;
    }
  }

  async getUserVIPStatus(userId) {
    const cacheKey = `user:${userId}:vip_status`;
    let status = await this.get(cacheKey);

    if (!status) {
      const { VIPMembership } = require('../models');
      const membership = await VIPMembership.findOne({
        where: {
          user_id: userId,
          status: 1
        },
        order: [['created_at', 'DESC']]
      });

      status = {
        is_vip: membership && new Date(membership.end_date) > new Date(),
        membership: membership,
        expires_at: membership ? membership.end_date : null,
        days_remaining: membership ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0
      };

      await this.set(cacheKey, status, 300);
    }

    return status;
  }

  async invalidateUserVIPStatus(userId) {
    const cacheKey = `user:${userId}:vip_status`;
    await this.del(cacheKey);
  }

  async getPartyStats(partyId) {
    const cacheKey = `party:${partyId}:stats`;
    let stats = await this.get(cacheKey);

    if (!stats) {
      const { PartyStats } = require('../models');
      stats = await PartyStats.findOne({
        where: { party_id: partyId }
      });

      if (stats) {
        await this.set(cacheKey, stats, 60);
      }
    }

    return stats;
  }

  async incrementPartyViewCount(partyId) {
    const cacheKey = `party:${partyId}:stats`;
    let stats = await this.get(cacheKey);

    if (!stats) {
      const { PartyStats } = require('../models');
      stats = await PartyStats.findOne({
        where: { party_id: partyId }
      });

      if (!stats) {
        stats = await PartyStats.create({
          party_id: partyId,
          view_count: 1,
          favorite_count: 0
        });
      } else {
        stats.view_count += 1;
        await stats.save();
      }

      await this.set(cacheKey, stats, 60);
    } else {
      stats.view_count += 1;
      await this.set(cacheKey, stats, 60);
    }

    return stats;
  }

  async incrementPartyFavoriteCount(partyId) {
    const cacheKey = `party:${partyId}:stats`;
    let stats = await this.get(cacheKey);

    if (!stats) {
      const { PartyStats } = require('../models');
      stats = await PartyStats.findOne({
        where: { party_id: partyId }
      });

      if (!stats) {
        stats = await PartyStats.create({
          party_id: partyId,
          view_count: 0,
          favorite_count: 1
        });
      } else {
        stats.favorite_count += 1;
        await stats.save();
      }

      await this.set(cacheKey, stats, 60);
    } else {
      stats.favorite_count += 1;
      await this.set(cacheKey, stats, 60);
    }

    return stats;
  }

  async invalidatePartyStats(partyId) {
    const cacheKey = `party:${partyId}:stats`;
    await this.del(cacheKey);
  }
}

module.exports = new CacheService();
