const logger = require('../utils/logger');

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
const corsCredentials = process.env.CORS_CREDENTIALS === 'true';

const corsConfig = {
  origin: (origin, callback) => {
    if (corsOrigins.includes('*')) {
      return callback(null, true);
    }
    
    if (!origin) {
      return callback(null, true);
    }
    
    if (corsOrigins.includes(origin)) {
      logger.info(`CORS allowed origin: ${origin}`);
      return callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: corsCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400,
  optionsSuccessStatus: 204
};

const corsLogger = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    logger.debug(`CORS request from origin: ${origin}`, {
      origin,
      method: req.method,
      path: req.path
    });
  }
  next();
};

module.exports = {
  corsConfig,
  corsLogger
};
