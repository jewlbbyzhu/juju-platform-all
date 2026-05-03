const logger = require('../../utils/logger');
const express = require('express');
const router = express.Router();
const { strictLimiter } = require('../../middleware/rateLimiter');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseExpiresInToSeconds,
  ACCESS_EXPIRES_IN
} = require('../../config/jwt');

// Token刷新路由 - 添加strictLimiter防止重放攻击和资源耗尽
router.post('/', strictLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        code: 'VALIDATION_ERROR',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required'
        }
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessPayload = { id: decoded.id, role: decoded.role };
    if (decoded.username) accessPayload.username = decoded.username;
    if (decoded.openid) accessPayload.openid = decoded.openid;
    if (decoded.role_id) accessPayload.role_id = decoded.role_id;

    const newToken = generateAccessToken(accessPayload);
    const newRefreshToken = generateRefreshToken(accessPayload);

    logger.info('Token refreshed successfully', { userId: decoded.id });

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: parseExpiresInToSeconds(ACCESS_EXPIRES_IN)
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED',
        error: {
          code: 'REFRESH_TOKEN_EXPIRED',
          message: 'Refresh token expired'
        }
      });
    }

    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token'
      }
    });
  }
});

module.exports = router;
