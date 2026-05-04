const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// 确保环境变量已加载（当直接运行脚本时）
if (!process.env.DB_HOST) {
  const path = require('path');
  const dotenv = require('dotenv');
  const env = process.env.NODE_ENV || 'development';
  const envPath = path.resolve(__dirname, `../../.env.${env}`);
  dotenv.config({ path: envPath });
  
  // 如果特定环境文件不存在，尝试默认 .env
  if (!process.env.DB_HOST) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  }
}

const isTest = process.env.NODE_ENV === 'test';

let sequelize;

if (isTest) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      logging: (msg) => {
        const match = msg.match(/Executing \((\d+)ms\)/);
        const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS) || 2000;
        
        if (match && parseInt(match[1]) > slowQueryThreshold) {
          logger.warn(`慢查询检测 (${match[1]}ms):`, msg);
        } else {
          logger.debug(msg);
        }
      },
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        min: parseInt(process.env.DB_POOL_MIN) || 5,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT) || 60000,
        idle: parseInt(process.env.DB_POOL_TIMEOUT) || 30000,
        evict: 10000,
        handleDisconnects: true
      },
      retry: {
        max: 3,
        match: [
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNREFUSED/,
          /ECONNRESET/
        ]
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        constraints: false
      }
    }
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
