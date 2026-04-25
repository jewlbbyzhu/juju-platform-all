const redis = require('redis');
const logger = require('../utils/logger');
const cacheManager = require('../utils/cacheManager');
const { Op } = require('sequelize');

class CacheOptimizationService {
  constructor() {
    this.redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || ''
    });

    this.redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.redisClient.on('connect', () => {
      logger.info('Redis optimization service connected');
    });

    this.hotDataKeys = new Set([
      'hot_parties',
      'featured_parties',
      'popular_categories',
      'trending_parties'
    ]);

    this.cacheStrategies = {
      LRU: 'lru',
      TTL: 'ttl',
      WRITE_THROUGH: 'write_through',
      WRITE_BEHIND: 'write_behind'
    };
  }

  async getHotParties(page = 1, limit = 20) {
    try {
      const cacheKey = cacheManager.getHotPartiesCacheKey(page, limit);
      let parties = await cacheManager.get(cacheKey);

      if (!parties) {
        const { Party } = require('../models');
        const { Op } = require('sequelize');

        const { count, rows } = await Party.findAndCountAll({
          where: {
            status: 1,
            start_time: { [Op.gte]: new Date() }
          },
          include: [
            {
              model: Party,
              as: 'stats',
              attributes: ['view_count', 'favorite_count']
            }
          ],
          order: [
            [{ model: Party, as: 'stats' }, 'view_count', 'DESC'],
            ['created_at', 'DESC']
          ],
          offset: (page - 1) * limit,
          limit
        });

        parties = {
          total: count,
          page,
          limit,
          data: rows
        };

        await cacheManager.set(cacheKey, parties, 300);
        logger.info(`Hot parties cached for page ${page}`);
      }

      return parties;
    } catch (error) {
      logger.error('Get hot parties failed:', error);
      return null;
    }
  }

  async getFeaturedParties(page = 1, limit = 10) {
    try {
      const cacheKey = cacheManager.getFeaturedPartiesCacheKey(page, limit);
      let parties = await cacheManager.get(cacheKey);

      if (!parties) {
        const { PartyFeatured, Party } = require('../models');

        const { count, rows } = await PartyFeatured.findAndCountAll({
          include: [
            {
              model: Party,
              as: 'party',
              where: {
                status: 1,
                start_time: { [Op.gte]: new Date() }
              }
            }
          ],
          offset: (page - 1) * limit,
          limit,
          order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
        });

        parties = {
          total: count,
          page,
          limit,
          data: rows.map(featured => featured.party)
        };

        await cacheManager.set(cacheKey, parties, 600);
        logger.info(`Featured parties cached for page ${page}`);
      }

      return parties;
    } catch (error) {
      logger.error('Get featured parties failed:', error);
      return null;
    }
  }

  async getUserVIPStatus(userId) {
    try {
      const cacheKey = cacheManager.getUserCacheKey(userId);
      let status = await cacheManager.get(cacheKey);

      if (!status) {
        const { VIPMembership } = require('../models');
        const { Op } = require('sequelize');

        const membership = await VIPMembership.findOne({
          where: {
            user_id: userId,
            status: 1,
            end_date: { [Op.gt]: new Date() }
          },
          order: [['end_date', 'DESC']]
        });

        status = {
          is_vip: !!membership,
          membership_type: membership ? membership.membership_type : null,
          start_date: membership ? membership.start_date : null,
          end_date: membership ? membership.end_date : null,
          days_remaining: membership ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0
        };

        await cacheManager.set(cacheKey, status, 300);
        logger.info(`User VIP status cached for user ${userId}`);
      }

      return status;
    } catch (error) {
      logger.error('Get user VIP status failed:', error);
      return null;
    }
  }

  async getPartyStats(partyId) {
    try {
      const cacheKey = cacheManager.getPartyStatsCacheKey(partyId);
      let stats = await cacheManager.get(cacheKey);

      if (!stats) {
        const { PartyStats } = require('../models');

        stats = await PartyStats.findOne({
          where: { party_id: partyId }
        });

        if (stats) {
          await cacheManager.set(cacheKey, stats, 60);
          logger.info(`Party stats cached for party ${partyId}`);
        }
      }

      return stats;
    } catch (error) {
      logger.error('Get party stats failed:', error);
      return null;
    }
  }

  async incrementPartyViewCount(partyId) {
    try {
      const cacheKey = cacheManager.getPartyStatsCacheKey(partyId);
      let stats = await cacheManager.get(cacheKey);

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

        await cacheManager.set(cacheKey, stats, 60);
      } else {
        stats.view_count += 1;
        await cacheManager.set(cacheKey, stats, 60);
      }

      logger.info(`Party view count incremented for party ${partyId}`);
      return stats;
    } catch (error) {
      logger.error('Increment party view count failed:', error);
      return null;
    }
  }

  async incrementPartyFavoriteCount(partyId) {
    try {
      const cacheKey = cacheManager.getPartyStatsCacheKey(partyId);
      let stats = await cacheManager.get(cacheKey);

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

        await cacheManager.set(cacheKey, stats, 60);
      } else {
        stats.favorite_count += 1;
        await cacheManager.set(cacheKey, stats, 60);
      }

      logger.info(`Party favorite count incremented for party ${partyId}`);
      return stats;
    } catch (error) {
      logger.error('Increment party favorite count failed:', error);
      return null;
    }
  }

  async invalidatePartyCache(partyId) {
    try {
      const cacheKey = cacheManager.getPartyCacheKey(partyId);
      await cacheManager.del(cacheKey);

      const statsCacheKey = cacheManager.getPartyStatsCacheKey(partyId);
      await cacheManager.del(statsCacheKey);

      logger.info(`Party cache invalidated for party ${partyId}`);
      return true;
    } catch (error) {
      logger.error('Invalidate party cache failed:', error);
      return false;
    }
  }

  async invalidateUserCache(userId) {
    try {
      const userCacheKey = cacheManager.getUserCacheKey(userId);
      await cacheManager.del(userCacheKey);

      const userStatsCacheKey = cacheManager.getUserStatsCacheKey(userId);
      await cacheManager.del(userStatsCacheKey);

      logger.info(`User cache invalidated for user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Invalidate user cache failed:', error);
      return false;
    }
  }

  async invalidateHotPartiesCache() {
    try {
      for (let page = 1; page <= 5; page++) {
        const cacheKey = cacheManager.getHotPartiesCacheKey(page, 20);
        await cacheManager.del(cacheKey);
      }

      logger.info('Hot parties cache invalidated');
      return true;
    } catch (error) {
      logger.error('Invalidate hot parties cache failed:', error);
      return false;
    }
  }

  async invalidateFeaturedPartiesCache() {
    try {
      for (let page = 1; page <= 5; page++) {
        const cacheKey = cacheManager.getFeaturedPartiesCacheKey(page, 10);
        await cacheManager.del(cacheKey);
      }

      logger.info('Featured parties cache invalidated');
      return true;
    } catch (error) {
      logger.error('Invalidate featured parties cache failed:', error);
      return false;
    }
  }

  async preheatCache() {
    try {
      logger.info('Starting cache preheating...');

      await this.getHotParties(1, 20);
      await this.getFeaturedParties(1, 10);

      logger.info('Cache preheating completed');
      return true;
    } catch (error) {
      logger.error('Cache preheating failed:', error);
      return false;
    }
  }

  async getCacheStats() {
    try {
      const info = await new Promise((resolve, reject) => {
        this.redisClient.info((err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });

      const stats = {
        connected: this.redisClient.connected,
        used_memory: info.used_memory_human,
        total_keys: info.db0 || '0',
        hits: info.keyspace_hits || '0',
        misses: info.keyspace_misses || '0',
        hit_rate: this.calculateHitRate(info.keyspace_hits, info.keyspace_misses)
      };

      return stats;
    } catch (error) {
      logger.error('Get cache stats failed:', error);
      return null;
    }
  }

  calculateHitRate(hits, misses) {
    const hitCount = parseInt(hits) || 0;
    const missCount = parseInt(misses) || 0;
    const total = hitCount + missCount;

    if (total === 0) return '0.00%';

    return ((hitCount / total) * 100).toFixed(2) + '%';
  }

  async clearCache() {
    try {
      await new Promise((resolve, reject) => {
        this.redisClient.flushdb((err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });

      logger.info('Cache cleared');
      return true;
    } catch (error) {
      logger.error('Clear cache failed:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      await new Promise((resolve, reject) => {
        this.redisClient.quit((err, reply) => {
          if (err) reject(err);
          else resolve(reply);
        });
      });

      logger.info('Redis optimization service disconnected');
      return true;
    } catch (error) {
      logger.error('Disconnect failed:', error);
      return false;
    }
  }
}

module.exports = new CacheOptimizationService();
