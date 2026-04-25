const { User, Tag } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * 用户资料控制器
 */
class UserProfileController {
  /**
   * 获取用户资料
   */
  async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'openid', 'unionid'] },
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });

      if (!user) {
        return error(res, '用户不存在', 404);
      }

      return success(res, user);
    } catch (err) {
      logger.error('获取用户资料失败:', err);
      return error(res, '获取用户资料失败', 500);
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const { nickname, avatar, gender, birthday, bio, city, province } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 404);
      }

      const updateData = {};
      if (nickname !== undefined) updateData.nickname = nickname;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (gender !== undefined) updateData.gender = gender;
      if (birthday !== undefined) updateData.birthday = birthday;
      if (bio !== undefined) updateData.bio = bio;
      if (city !== undefined) updateData.city = city;
      if (province !== undefined) updateData.province = province;

      await user.update(updateData);

      return success(res, { message: '更新成功', user });
    } catch (err) {
      logger.error('更新用户资料失败:', err);
      return error(res, '更新用户资料失败', 500);
    }
  }

  /**
   * 获取用户标签
   */
  async getUserTags(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Tag,
            as: 'tags',
            through: { attributes: [] }
          }
        ]
      });

      return success(res, user?.tags || []);
    } catch (err) {
      logger.error('获取用户标签失败:', err);
      return error(res, '获取用户标签失败', 500);
    }
  }

  /**
   * 更新用户标签
   */
  async updateUserTags(req, res) {
    try {
      const userId = req.user.id;
      const { tagIds } = req.body;

      if (!Array.isArray(tagIds)) {
        return error(res, '标签ID必须是数组', 400);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return error(res, '用户不存在', 404);
      }

      // 设置用户标签
      await user.setTags(tagIds);

      return success(res, { message: '标签更新成功' });
    } catch (err) {
      logger.error('更新用户标签失败:', err);
      return error(res, '更新用户标签失败', 500);
    }
  }

  /**
   * 获取用户兴趣
   */
  async getUserInterests(req, res) {
    try {
      const userId = req.user.id;
      const { UserPreference } = require('../models');

      const preference = await UserPreference.findOne({
        where: { user_id: userId }
      });

      return success(res, preference?.interests || []);
    } catch (err) {
      logger.error('获取用户兴趣失败:', err);
      return error(res, '获取用户兴趣失败', 500);
    }
  }

  /**
   * 更新用户兴趣
   */
  async updateUserInterests(req, res) {
    try {
      const userId = req.user.id;
      const { interests } = req.body;
      const { UserPreference } = require('../models');

      if (!Array.isArray(interests)) {
        return error(res, '兴趣必须是数组', 400);
      }

      let preference = await UserPreference.findOne({
        where: { user_id: userId }
      });

      if (preference) {
        await preference.update({ interests });
      } else {
        preference = await UserPreference.create({
          user_id: userId,
          interests
        });
      }

      return success(res, { message: '兴趣更新成功', interests: preference.interests });
    } catch (err) {
      logger.error('更新用户兴趣失败:', err);
      return error(res, '更新用户兴趣失败', 500);
    }
  }

  /**
   * 获取用户偏好设置
   */
  async getUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { UserPreference } = require('../models');

      const preference = await UserPreference.findOne({
        where: { user_id: userId }
      });

      return success(res, preference || {
        preferences: {},
        notification_settings: {},
        privacy_settings: {}
      });
    } catch (err) {
      logger.error('获取用户偏好失败:', err);
      return error(res, '获取用户偏好失败', 500);
    }
  }

  /**
   * 更新用户偏好设置
   */
  async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { preferences, notification_settings, privacy_settings } = req.body;
      const { UserPreference } = require('../models');

      let preference = await UserPreference.findOne({
        where: { user_id: userId }
      });

      const updateData = {};
      if (preferences !== undefined) updateData.preferences = preferences;
      if (notification_settings !== undefined) updateData.notification_settings = notification_settings;
      if (privacy_settings !== undefined) updateData.privacy_settings = privacy_settings;

      if (preference) {
        await preference.update(updateData);
      } else {
        preference = await UserPreference.create({
          user_id: userId,
          ...updateData
        });
      }

      return success(res, { message: '偏好设置更新成功', preference });
    } catch (err) {
      logger.error('更新用户偏好失败:', err);
      return error(res, '更新用户偏好失败', 500);
    }
  }

  /**
   * 获取用户统计
   */
  async getUserStatistics(req, res) {
    try {
      const userId = req.user.id;
      const { Party, Order, Follow } = require('../models');

      const [partyCount, orderCount, followingCount, followerCount] = await Promise.all([
        Party.count({ where: { user_id: userId } }),
        Order.count({ where: { user_id: userId } }),
        Follow.count({ where: { follower_id: userId, status: 1 } }),
        Follow.count({ where: { following_id: userId, status: 1 } })
      ]);

      return success(res, {
        partyCount,
        orderCount,
        followingCount,
        followerCount
      });
    } catch (err) {
      logger.error('获取用户统计失败:', err);
      return error(res, '获取用户统计失败', 500);
    }
  }

  /**
   * 获取推荐活动
   */
  async getRecommendedParties(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 20 } = req.query;
      const { Party, UserPreference } = require('../models');

      // 获取用户兴趣
      const preference = await UserPreference.findOne({
        where: { user_id: userId }
      });

      const where = { status: 'active' };
      
      // 根据兴趣推荐
      if (preference?.interests && preference.interests.length > 0) {
        where.category = { [Op.in]: preference.interests };
      }

      const { count, rows: parties } = await Party.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: parties,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取推荐活动失败:', err);
      return error(res, '获取推荐活动失败', 500);
    }
  }

  /**
   * 获取推荐用户
   */
  async getRecommendedUsers(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;
      const { User, Follow } = require('../models');

      // 获取已关注的用户ID
      const following = await Follow.findAll({
        where: { follower_id: userId, status: 1 },
        attributes: ['following_id']
      });
      const followingIds = following.map(f => f.following_id);

      // 推荐未关注的用户
      const users = await User.findAll({
        where: {
          id: { 
            [Op.notIn]: [...followingIds, userId] 
          },
          status: 1
        },
        attributes: ['id', 'nickname', 'avatar', 'bio', 'is_vip'],
        limit: parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      return success(res, users);
    } catch (err) {
      logger.error('获取推荐用户失败:', err);
      return error(res, '获取推荐用户失败', 500);
    }
  }

  /**
   * 获取用户行为
   */
  async getUserBehavior(req, res) {
    try {
      const userId = req.user.id;
      const { ScanRecord } = require('../models');

      // 获取最近的行为记录
      const recentScans = await ScanRecord.findAll({
        where: { user_id: userId },
        order: [['scanned_at', 'DESC']],
        limit: 10
      });

      return success(res, {
        recentScans: recentScans.map(s => ({
          type: s.type,
          result: s.result,
          time: s.scanned_at
        }))
      });
    } catch (err) {
      logger.error('获取用户行为失败:', err);
      return error(res, '获取用户行为失败', 500);
    }
  }

  /**
   * 记录用户行为
   */
  async trackUserBehavior(req, res) {
    try {
      const userId = req.user.id;
      const { action, targetType, targetId, metadata = {} } = req.body;

      logger.info('用户行为追踪:', {
        userId,
        action,
        targetType,
        targetId,
        metadata,
        timestamp: new Date()
      });

      return success(res, { message: '行为记录成功' });
    } catch (err) {
      logger.error('记录用户行为失败:', err);
      return error(res, '记录用户行为失败', 500);
    }
  }
}

module.exports = new UserProfileController();
