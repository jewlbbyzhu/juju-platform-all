const compression = require('compression');
const logger = require('../utils/logger');

const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
  level: 6,
  chunkSize: 16 * 1024
});

const compressionLogger = (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // const acceptEncoding = req.headers['accept-encoding'] || ''; // 保留以备将来使用
    const isCompressed = res.getHeader('Content-Encoding') === 'gzip' || res.getHeader('Content-Encoding') === 'deflate';
    
    if (isCompressed) {
      logger.debug(`Response compressed for ${req.path}`, {
        path: req.path,
        encoding: res.getHeader('Content-Encoding'),
        originalSize: data ? data.length : 0
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  compressionMiddleware,
  compressionLogger
};
