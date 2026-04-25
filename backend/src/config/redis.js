const redis = require('redis');
const logger = require('../utils/logger');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to Redis:', error);
    throw error;
  }
};

module.exports = { redisClient, connectRedis };
