/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, parseExpiresInToSeconds, ACCESS_EXPIRES_IN } = require('../../config/jwt');
const userService = require('../../services/userService');
const logger = require('../../utils/logger');

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
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
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token'
        }
      });
    }

    const user = await userService.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'NOT_FOUND',
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const accessPayload = { id: user.id, role: 'user' };
    if (user.openid) accessPayload.openid = user.openid;
    if (user.unionid) accessPayload.unionid = user.unionid;

    const newToken = generateAccessToken(accessPayload);
    const newRefreshToken = generateRefreshToken(accessPayload);

    logger.info('Token refreshed successfully', { userId: user.id });

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
    logger.error('Token refresh error:', error);
    
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

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
        code: 'VALIDATION_ERROR',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token is required'
        }
      });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET); // 只验证不解析结果
    
    res.json({
      success: true,
      data: { valid: true }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      data: { valid: false }
    });
  }
});

module.exports = router;
