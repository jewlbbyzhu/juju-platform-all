const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const TokenBlacklist = require('../utils/tokenBlacklist');

const normalizeJwtPayload = (decoded) => {
  if (!decoded || typeof decoded !== 'object') return decoded;
  if (decoded.userId && !decoded.id) decoded.id = decoded.userId;
  if (decoded.adminId && !decoded.id) decoded.id = decoded.adminId;
  return decoded;
};

const isValidTestToken = (token) => {
  // 测试Token仅在明确启用测试模式时可用，且必须从环境变量配置
  // 生产环境绝对禁止测试Token
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.NODE_ENV !== 'test' || process.env.ENABLE_TEST_TOKEN !== 'true') return false;
  
  const testTokens = process.env.TEST_TOKENS ? process.env.TEST_TOKENS.split(',') : [];
  if (testTokens.length === 0) return false;
  return testTokens.includes(token);
};

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权，请重新登录',
        code: 'UNAUTHORIZED',
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权，请重新登录'
        }
      });
    }
    
    if (isValidTestToken(token)) {
      // 从环境变量获取测试用户ID，避免所有测试共享同一身份
      const testUserId = parseInt(process.env.TEST_USER_ID, 10) || 9999;
      req.user = {
        id: testUserId,
        username: 'test_user',
        role: 'user',
        tokenType: 'access'
      };
      req.token = token;
      next();
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.tokenType && decoded.tokenType !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Token无效',
        code: 'UNAUTHORIZED',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token无效'
        }
      });
    }
    
    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token已失效，请重新登录',
        code: 'TOKEN_INVALIDATED',
        error: {
          code: 'TOKEN_INVALIDATED',
          message: 'Token已失效，请重新登录'
        }
      });
    }
    
    req.user = normalizeJwtPayload(decoded);
    req.token = token;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    const isExpired = error.name === 'TokenExpiredError';
    let message = 'Token无效';
    let expiredAt = null;
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token已过期';
      expiredAt = error.expiredAt;
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token格式错误';
    }
    
    const errorResponse = {
      success: false,
      message,
      code: isExpired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
      error: {
        code: isExpired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
        message
      }
    };
    
    if (expiredAt) {
      errorResponse.error.expiredAt = expiredAt;
    }
    
    return res.status(401).json(errorResponse);
  }
};

const authWithRefresh = auth;

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权，请重新登录',
        code: 'UNAUTHORIZED',
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权，请重新登录'
        }
      });
    }
    
    if (isValidTestToken(token)) {
      req.user = {
        id: 1,
        username: 'test_admin',
        role: 'admin',
        tokenType: 'access'
      };
      req.token = token;
      next();
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded && decoded.tokenType && decoded.tokenType !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Token无效',
        code: 'UNAUTHORIZED',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token无效'
        }
      });
    }
    
    req.user = normalizeJwtPayload(decoded);
    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    const isExpired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Token已过期' : 'Token无效',
      code: isExpired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
      error: {
        code: isExpired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
        message: isExpired ? 'Token已过期' : 'Token无效'
      }
    });
  }
};

module.exports = { auth, authWithRefresh, adminAuth };
