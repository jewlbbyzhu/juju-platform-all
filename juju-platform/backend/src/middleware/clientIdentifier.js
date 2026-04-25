const logger = require('../utils/logger');

const clientIdentifier = (req, res, next) => {
  const clientTypeHeader = req.headers['x-client-type'];
  const userAgent = req.headers['user-agent'] || '';
  let client = 'unknown';

  if (clientTypeHeader) {
    client = clientTypeHeader;
  } else if (userAgent.includes('MicroMessenger')) {
    client = 'wechat-miniprogram';
  } else if (userAgent.includes('uni-app')) {
    client = 'uni-app';
  } else if (userAgent.includes('Mozilla') && userAgent.includes('AppleWebKit')) {
    client = 'web-admin';
  } else if (userAgent.includes('Mozilla')) {
    client = 'web';
  }

  req.client = client;
  logger.debug(`Client identified: ${client}`, { userAgent: userAgent.substring(0, 100) });

  next();
};

module.exports = clientIdentifier;
