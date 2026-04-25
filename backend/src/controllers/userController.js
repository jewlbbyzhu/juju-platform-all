const userService = require('../services/userService');
const logger = require('../utils/logger');

class UserController {
  async register(req, res, next) {
    try {
      const result = await userService.register(req.body);
      res.json({
        success: true,
        message: 'Registration successful',
        data: result.user
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      let openid, unionid;

      if (req.body.code) {
        if (process.env.NODE_ENV === 'test' && req.body.code === 'test_mock_code_123456') {
          openid = 'smoke_openid_68713bff0761d19bdf351646';
          unionid = null;
          logger.info('Test mode: using mock openid for test code');
        } else {
          const { getOpenIdByCode } = require('../services/wechatService');
          const wechatInfo = await getOpenIdByCode(req.body.code);
          openid = wechatInfo.openid;
          unionid = wechatInfo.unionid || null;
        }
      } else {
        openid = req.body.openid;
        unionid = req.body.unionid;
      }

      const result = await userService.login(openid, unionid);
      const data = {
        ...result.user,
        token: result.token
      };

      if (result.refreshToken) {
        data.refreshToken = result.refreshToken;
      }
      res.json({
        success: true,
        message: 'Login successful',
        data
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { nickname, avatar, gender, birthday, language } = req.body;
      
      if (nickname && (typeof nickname !== 'string' || nickname.length < 1 || nickname.length > 50)) {
        return res.status(400).json({
          success: false,
          message: 'Nickname must be between 1 and 50 characters'
        });
      }
      
      if (avatar && (typeof avatar !== 'string' || avatar.length > 500)) {
        return res.status(400).json({
          success: false,
          message: 'Avatar URL must be less than 500 characters'
        });
      }
      
      if (gender !== undefined && gender !== null && ![0, 1, 2].includes(parseInt(gender))) {
        return res.status(400).json({
          success: false,
          message: 'Gender must be 0 (unknown), 1 (male), or 2 (female)'
        });
      }
      
      if (birthday && isNaN(Date.parse(birthday))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birthday format'
        });
      }
      
      if (language && (typeof language !== 'string' || language.length > 20)) {
        return res.status(400).json({
          success: false,
          message: 'Language must be less than 20 characters'
        });
      }
      
      const user = await userService.updateUser(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  async getUserList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        is_vip: req.query.is_vip ? req.query.is_vip === 'true' : undefined,
        keyword: req.query.keyword
      };

      const result = await userService.getUserList(page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user list error:', error);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const user = await userService.updateUserStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'User status updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update user status error:', error);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      next(error);
    }
  }

  async getVipStatus(req, res, next) {
    try {
      const vipStatus = await userService.getVipStatus(req.user.id);
      res.json({
        success: true,
        data: vipStatus
      });
    } catch (error) {
      logger.error('Get VIP status error:', error);
      next(error);
    }
  }

  async updateVipStatus(req, res, next) {
    try {
      const { status } = req.body;
      const result = await userService.updateVipStatus(req.user.id, status);
      res.json({
        success: true,
        message: 'VIP status updated successfully',
        data: result
      });
    } catch (error) {
      logger.error('Update VIP status error:', error);
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      const { keyword, page = 1, pageSize = 20 } = req.query;
      const result = await userService.searchUsers(keyword, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search users error:', error);
      next(error);
    }
  }

  async getUserActivities(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await userService.getUserActivities(id, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user activities error:', error);
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await userService.getUserOrders(id, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user orders error:', error);
      next(error);
    }
  }

  async getUserParties(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await userService.getUserParties(id, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user parties error:', error);
      next(error);
    }
  }

  async batchUpdateUserStatus(req, res, next) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required'
        });
      }
      
      const { ids, status } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs must be a non-empty array'
        });
      }
      
      if (typeof status !== 'number' || ![0, 1].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be 0 (disabled) or 1 (active)'
        });
      }
      
      if (ids.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update more than 100 users at once'
        });
      }
      
      const result = await userService.batchUpdateUserStatus(ids, status);
      res.json({
        success: true,
        message: 'Batch update user status successful',
        data: result
      });
    } catch (error) {
      logger.error('Batch update user status error:', error);
      next(error);
    }
  }

  async exportUsers(req, res, next) {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Admin access required'
        });
      }
      
      const { status, is_vip, keyword } = req.query;
      
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 1000;
      const maxExportLimit = 10000;
      
      if (page < 1 || pageSize < 1 || pageSize > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }
      
      const offset = (page - 1) * pageSize;
      const result = await userService.exportUsers({ status, is_vip, keyword, offset, limit: pageSize, maxExportLimit });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
      res.send(result);
    } catch (error) {
      logger.error('Export users error:', error);
      next(error);
    }
  }

  async getUserTransactions(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await userService.getUserTransactions(id, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user transactions error:', error);
      next(error);
    }
  }

  // 用户拉黑相关方法
  async blockUser(req, res, next) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      
      if (parseInt(userId) === currentUserId) {
        return res.status(400).json({
          success: false,
          message: '不能拉黑自己'
        });
      }

      const result = await userService.blockUser(currentUserId, userId);
      res.json({
        success: true,
        message: '拉黑成功',
        data: result
      });
    } catch (error) {
      logger.error('Block user error:', error);
      next(error);
    }
  }

  async unblockUser(req, res, next) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      
      const result = await userService.unblockUser(currentUserId, userId);
      res.json({
        success: true,
        message: '取消拉黑成功',
        data: result
      });
    } catch (error) {
      logger.error('Unblock user error:', error);
      next(error);
    }
  }

  async getBlockedUsers(req, res, next) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const currentUserId = req.user.id;
      
      const result = await userService.getBlockedUsers(currentUserId, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get blocked users error:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
