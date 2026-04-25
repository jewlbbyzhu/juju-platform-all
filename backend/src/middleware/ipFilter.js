const logger = require('../utils/logger');

const WHITELIST = process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [];
const BLACKLIST = process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [];

const ipFilter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (BLACKLIST.length > 0 && BLACKLIST.includes(clientIp)) {
    logger.warn(`IP blocked (blacklist): ${clientIp}, Path: ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  if (WHITELIST.length > 0 && !WHITELIST.includes(clientIp)) {
    logger.warn(`IP blocked (not in whitelist): ${clientIp}, Path: ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

const isWhitelisted = (ip) => {
  return WHITELIST.length === 0 || WHITELIST.includes(ip);
};

const isBlacklisted = (ip) => {
  return BLACKLIST.length > 0 && BLACKLIST.includes(ip);
};

module.exports = {
  ipFilter,
  isWhitelisted,
  isBlacklisted
};
