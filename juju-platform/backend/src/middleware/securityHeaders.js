const helmet = require('helmet');
const logger = require('../utils/logger');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\''],
      fontSrc: ['\'self\''],
      objectSrc: ['\'none\''],
      mediaSrc: ['\'self\''],
      frameSrc: ['\'none\'']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  ieNoOpen: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: []
});

const securityHeadersLogger = (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    logger.debug(`Security headers set for ${req.path}`, {
      path: req.path,
      headers: {
        'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
        'Strict-Transport-Security': res.getHeader('Strict-Transport-Security'),
        'X-Content-Type-Options': res.getHeader('X-Content-Type-Options'),
        'X-Frame-Options': res.getHeader('X-Frame-Options'),
        'X-XSS-Protection': res.getHeader('X-XSS-Protection')
      }
    });
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  securityHeaders,
  securityHeadersLogger
};
