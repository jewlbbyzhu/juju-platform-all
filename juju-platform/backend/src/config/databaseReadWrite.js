const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const readWriteConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'juju_platform',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  timezone: process.env.DB_TIMEZONE || '+08:00',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT) || 60000,
    idle: parseInt(process.env.DB_POOL_TIMEOUT) || 30000
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
  }
};

const readOnlyConfig = {
  ...readWriteConfig,
  host: process.env.DB_READ_HOST || process.env.DB_SLAVE_HOST || readWriteConfig.host,
  port: parseInt(process.env.DB_READ_PORT) || readWriteConfig.port,
  database: process.env.DB_READ_NAME || readWriteConfig.database,
  username: process.env.DB_READ_USER || readWriteConfig.username,
  password: process.env.DB_READ_PASSWORD || readWriteConfig.password,
  pool: {
    min: parseInt(process.env.DB_READ_POOL_MIN) || 2,
    max: parseInt(process.env.DB_READ_POOL_MAX) || 10,
    acquire: parseInt(process.env.DB_READ_POOL_ACQUIRE_TIMEOUT) || 60000,
    idle: parseInt(process.env.DB_READ_POOL_TIMEOUT) || 30000
  }
};

let readWriteSequelize = null;
let readOnlySequelize = null;

function getReadWriteSequelize() {
  if (!readWriteSequelize) {
    readWriteSequelize = new Sequelize(readWriteConfig);
    
    readWriteSequelize.authenticate()
      .then(() => {
        logger.info('Read-write database connection established successfully');
      })
      .catch(err => {
        logger.error('Unable to connect to read-write database:', err);
      });
  }
  
  return readWriteSequelize;
}

function getReadOnlySequelize() {
  if (!readOnlySequelize) {
    readOnlySequelize = new Sequelize(readOnlyConfig);
    
    readOnlySequelize.authenticate()
      .then(() => {
        logger.info('Read-only database connection established successfully');
      })
      .catch(err => {
        logger.error('Unable to connect to read-only database:', err);
      });
  }
  
  return readOnlySequelize;
}

async function testConnections() {
  const rw = getReadWriteSequelize();
  const ro = getReadOnlySequelize();
  
  try {
    await rw.authenticate();
    await ro.authenticate();
    logger.info('All database connections are healthy');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

async function closeConnections() {
  const promises = [];
  
  if (readWriteSequelize) {
    promises.push(readWriteSequelize.close());
  }
  
  if (readOnlySequelize) {
    promises.push(readOnlySequelize.close());
  }
  
  try {
    await Promise.all(promises);
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
}

module.exports = {
  readWrite: getReadWriteSequelize,
  readOnly: getReadOnlySequelize,
  testConnections,
  closeConnections,
  readWriteConfig,
  readOnlyConfig
};