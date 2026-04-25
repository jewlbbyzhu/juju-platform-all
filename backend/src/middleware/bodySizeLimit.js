const logger = require('../utils/logger');

const MAX_BODY_SIZE = '10mb';

const bodySizeLimit = (maxSize = MAX_BODY_SIZE) => {
  return (req, res, next) => {
    const contentLength = req.get('content-length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        logger.warn(`Request body too large: ${sizeInBytes} bytes, Max: ${maxSizeInBytes} bytes, IP: ${req.ip}`);
        return res.status(413).json({
          success: false,
          message: `Request body too large. Maximum size is ${maxSize}`
        });
      }
    }
    
    next();
  };
};

function parseSize(size) {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };
  
  const match = size.toString().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([kmg]?b?)$/);
  
  if (!match) {
    return parseInt(size, 10);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return value * (units[unit] || 1);
}

module.exports = bodySizeLimit;
