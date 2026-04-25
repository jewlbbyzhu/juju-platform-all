const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const crypto = require('crypto');

/**
 * 杂项控制器 - 处理各种API
 */
class MiscController {
  // ===== 扫码相关 =====
  async scanQRCode(req, res) {
    try {
      const { code, type = 'qrcode' } = req.body;
      const userId = req.user.id;
      const { ScanRecord } = require('../models');

      if (!code) {
        return error(res, '请提供扫码内容', 400);
      }

      // 解析二维码内容
      let result = { raw: code };
      let status = 1;

      // 检查是否是活动二维码
      if (code.includes('/party/') || code.includes('party_id=')) {
        const partyIdMatch = code.match(/party\/(\d+)|party_id=(\d+)/);
        if (partyIdMatch) {
          const partyId = partyIdMatch[1] || partyIdMatch[2];
          const { Party } = require('../models');
          const party = await Party.findByPk(partyId);
          if (party) {
            result = {
              type: 'party',
              partyId: party.id,
              title: party.title,
              url: `/pages/party/detail?id=${party.id}`
            };
          } else {
            status = 0;
            result = { type: 'invalid', message: '活动不存在' };
          }
        }
      }
      // 检查是否是用户二维码
      else if (code.includes('/user/') || code.includes('user_id=')) {
        const userIdMatch = code.match(/user\/(\d+)|user_id=(\d+)/);
        if (userIdMatch) {
          const targetUserId = userIdMatch[1] || userIdMatch[2];
          const { User } = require('../models');
          const user = await User.findByPk(targetUserId, {
            attributes: ['id', 'nickname', 'avatar']
          });
          if (user) {
            result = {
              type: 'user',
              userId: user.id,
              nickname: user.nickname,
              avatar: user.avatar
            };
          } else {
            status = 0;
            result = { type: 'invalid', message: '用户不存在' };
          }
        }
      }
      // 检查是否是邀请码
      else if (code.startsWith('INVITE_')) {
        const { InviteRecord } = require('../models');
        const invite = await InviteRecord.findOne({
          where: { code, status: 'pending' }
        });
        if (invite) {
          result = {
            type: 'invite',
            code: invite.code,
            inviterId: invite.inviter_id
          };
        } else {
          status = 0;
          result = { type: 'invalid', message: '邀请码无效或已使用' };
        }
      }

      // 保存扫码记录
      await ScanRecord.create({
        user_id: userId,
        code,
        type,
        result,
        status,
        scanned_at: new Date()
      });

      return success(res, { 
        valid: status === 1, 
        code, 
        type: result.type || 'unknown',
        result,
        message: status === 1 ? '扫码成功' : result.message || '扫码失败'
      });
    } catch (err) {
      logger.error('扫码失败:', err);
      return error(res, '扫码失败', 500);
    }
  }

  async getScanHistory(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const userId = req.user.id;
      const { ScanRecord } = require('../models');

      const { count, rows: records } = await ScanRecord.findAndCountAll({
        where: { user_id: userId },
        order: [['scanned_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: records,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取扫码历史失败:', err);
      return error(res, '获取扫码历史失败', 500);
    }
  }

  async getScanStats(req, res) {
    try {
      const userId = req.user.id;
      const { ScanRecord, sequelize } = require('../models');

      const totalScans = await ScanRecord.count({
        where: { user_id: userId }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayScans = await ScanRecord.count({
        where: {
          user_id: userId,
          scanned_at: { [Op.gte]: today }
        }
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyScans = await ScanRecord.count({
        where: {
          user_id: userId,
          scanned_at: { [Op.gte]: weekAgo }
        }
      });

      // 获取扫码类型分布
      const typeStats = await ScanRecord.findAll({
        where: { user_id: userId },
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['type']
      });

      return success(res, {
        totalScans,
        todayScans,
        weeklyScans,
        typeDistribution: typeStats.reduce((acc, item) => {
          acc[item.type] = parseInt(item.get('count'));
          return acc;
        }, {})
      });
    } catch (err) {
      logger.error('获取扫码统计失败:', err);
      return error(res, '获取扫码统计失败', 500);
    }
  }

  async getScanDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { ScanRecord } = require('../models');

      const record = await ScanRecord.findOne({
        where: { id, user_id: userId }
      });

      if (!record) {
        return error(res, '扫码记录不存在', 404);
      }

      return success(res, record);
    } catch (err) {
      logger.error('获取扫码详情失败:', err);
      return error(res, '获取扫码详情失败', 500);
    }
  }

  // ===== 推荐相关 =====
  async getRecommendations(req, res) {
    try {
      const { page = 1, pageSize = 20, type = 'all' } = req.query;
      const userId = req.user?.id;
      const { Party, UserPreference } = require('../models');

      const where = { status: 'active' };
      const order = [['created_at', 'DESC']];

      // 如果有用户偏好，根据偏好推荐
      if (userId) {
        const preference = await UserPreference.findOne({
          where: { user_id: userId }
        });

        if (preference?.interests && preference.interests.length > 0) {
          // 根据兴趣标签推荐
          where.category = { [Op.in]: preference.interests };
        }
      }

      // 根据类型筛选
      if (type !== 'all') {
        where.category = type;
      }

      const { count, rows: parties } = await Party.findAndCountAll({
        where,
        order,
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
      logger.error('获取推荐失败:', err);
      return error(res, '获取推荐失败', 500);
    }
  }

  async getSimilarParties(req, res) {
    try {
      const { id } = req.params;
      const { Party } = require('../models');

      const party = await Party.findByPk(id);
      if (!party) {
        return error(res, '活动不存在', 404);
      }

      // 查找同类别的活动
      const similarParties = await Party.findAll({
        where: {
          id: { [Op.ne]: id },
          category: party.category,
          status: 'active'
        },
        limit: 10,
        order: [['created_at', 'DESC']]
      });

      return success(res, similarParties);
    } catch (err) {
      logger.error('获取相似活动失败:', err);
      return error(res, '获取相似活动失败', 500);
    }
  }

  async getHotParties(req, res) {
    try {
      const { limit = 10 } = req.query;
      const { Party, PartyStats } = require('../models');

      // 根据参与人数排序获取热门活动
      const hotParties = await Party.findAll({
        where: { status: 'active' },
        include: [{
          model: PartyStats,
          as: 'stats',
          required: false
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit)
      });

      return success(res, hotParties);
    } catch (err) {
      logger.error('获取热门活动失败:', err);
      return error(res, '获取热门活动失败', 500);
    }
  }

  async getNearbyParties(req, res) {
    try {
      const { lat, lng, radius = 5000, page = 1, pageSize = 20 } = req.query;
      const { Party, sequelize } = require('../models');

      if (!lat || !lng) {
        return error(res, '请提供经纬度', 400);
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInKm = parseInt(radius) / 1000;

      // 使用Haversine公式计算距离
      const parties = await Party.findAll({
        where: {
          status: 'active',
          latitude: { [Op.ne]: null },
          longitude: { [Op.ne]: null }
        },
        attributes: {
          include: [
            [sequelize.literal(`(
              6371 * acos(
                cos(radians(${latitude})) *
                cos(radians(latitude)) *
                cos(radians(longitude) - radians(${longitude})) +
                sin(radians(${latitude})) *
                sin(radians(latitude))
              )
            )`), 'distance']
          ]
        },
        having: sequelize.literal(`distance <= ${radiusInKm}`),
        order: sequelize.literal('distance ASC'),
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: parties,
        total: parties.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: false
      });
    } catch (err) {
      logger.error('获取附近活动失败:', err);
      return error(res, '获取附近活动失败', 500);
    }
  }

  async updatePreferences(req, res) {
    try {
      const userId = req.user.id;
      const { categories, notification, privacy } = req.body;
      const { UserPreference } = require('../models');

      let preference = await UserPreference.findOne({
        where: { user_id: userId }
      });

      const updateData = {};
      if (categories) updateData.preferences = categories;
      if (notification) updateData.notification_settings = notification;
      if (privacy) updateData.privacy_settings = privacy;

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
      logger.error('更新偏好设置失败:', err);
      return error(res, '更新偏好设置失败', 500);
    }
  }

  async getPreferences(req, res) {
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
      logger.error('获取偏好设置失败:', err);
      return error(res, '获取偏好设置失败', 500);
    }
  }

  async trackBehavior(req, res) {
    try {
      const userId = req.user.id;
      const { action, targetType, targetId, metadata = {} } = req.body;

      // 这里可以将行为数据发送到分析服务或保存到数据库
      logger.info('用户行为追踪:', {
        userId,
        action,
        targetType,
        targetId,
        metadata,
        timestamp: new Date()
      });

      // 更新用户偏好（基于行为）
      if (action === 'view_party' && targetType === 'party') {
        const { Party, UserPreference } = require('../models');
        const party = await Party.findByPk(targetId, { attributes: ['category'] });
        
        if (party) {
          let preference = await UserPreference.findOne({
            where: { user_id: userId }
          });

          if (!preference) {
            preference = await UserPreference.create({
              user_id: userId,
              interests: [party.category]
            });
          } else {
            const interests = preference.interests || [];
            if (!interests.includes(party.category)) {
              interests.push(party.category);
              await preference.update({ interests });
            }
          }
        }
      }

      return success(res, { message: '行为记录成功' });
    } catch (err) {
      logger.error('记录行为失败:', err);
      return error(res, '记录行为失败', 500);
    }
  }

  // ===== 推送相关 =====
  async getPushMessages(req, res) {
    try {
      const { page = 1, pageSize = 20, type } = req.query;
      const userId = req.user.id;
      const { PushMessage } = require('../models');

      const where = { user_id: userId };
      if (type) where.type = type;

      const { count, rows: messages } = await PushMessage.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: messages,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取推送消息失败:', err);
      return error(res, '获取推送消息失败', 500);
    }
  }

  async markPushAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { PushMessage } = require('../models');

      const message = await PushMessage.findOne({
        where: { id, user_id: userId }
      });

      if (!message) {
        return error(res, '消息不存在', 404);
      }

      await message.update({ is_read: true, read_at: new Date() });

      return success(res, { message: '标记已读成功' });
    } catch (err) {
      logger.error('标记推送已读失败:', err);
      return error(res, '标记推送已读失败', 500);
    }
  }

  async markAllPushAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { PushMessage } = require('../models');

      await PushMessage.update(
        { is_read: true, read_at: new Date() },
        { where: { user_id: userId, is_read: false } }
      );

      return success(res, { message: '全部标记已读成功' });
    } catch (err) {
      logger.error('标记全部已读失败:', err);
      return error(res, '标记全部已读失败', 500);
    }
  }

  async deletePushMessage(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { PushMessage } = require('../models');

      const message = await PushMessage.findOne({
        where: { id, user_id: userId }
      });

      if (!message) {
        return error(res, '消息不存在', 404);
      }

      await message.destroy();

      return success(res, { message: '删除成功' });
    } catch (err) {
      logger.error('删除推送消息失败:', err);
      return error(res, '删除推送消息失败', 500);
    }
  }

  async clearAllPushMessages(req, res) {
    try {
      const userId = req.user.id;
      const { PushMessage } = require('../models');

      await PushMessage.destroy({
        where: { user_id: userId }
      });

      return success(res, { message: '清空成功' });
    } catch (err) {
      logger.error('清空推送消息失败:', err);
      return error(res, '清空推送消息失败', 500);
    }
  }

  async getUnreadPushCount(req, res) {
    try {
      const userId = req.user.id;
      const { PushMessage } = require('../models');

      const count = await PushMessage.count({
        where: { user_id: userId, is_read: false }
      });

      return success(res, { count });
    } catch (err) {
      logger.error('获取未读推送数失败:', err);
      return error(res, '获取未读推送数失败', 500);
    }
  }

  // ===== 地图相关 =====
  async searchLocation(req, res) {
    try {
      const { keyword, city } = req.query;

      if (!keyword) {
        return error(res, '请提供搜索关键词', 400);
      }

      // 这里应该调用地图服务API（如高德、百度地图）
      // 暂时返回模拟数据
      const mockResults = [
        {
          name: `${keyword}附近地点`,
          address: `${city || '北京市'}朝阳区`,
          location: {
            lat: 39.9042,
            lng: 116.4074
          }
        }
      ];

      return success(res, mockResults);
    } catch (err) {
      logger.error('搜索位置失败:', err);
      return error(res, '搜索位置失败', 500);
    }
  }

  async geocode(req, res) {
    try {
      const { address } = req.query;

      if (!address) {
        return error(res, '请提供地址', 400);
      }

      // 这里应该调用地图服务API
      // 暂时返回模拟数据
      return success(res, {
        lat: 39.9042,
        lng: 116.4074,
        address: address,
        precision: 'high'
      });
    } catch (err) {
      logger.error('地理编码失败:', err);
      return error(res, '地理编码失败', 500);
    }
  }

  async reverseGeocode(req, res) {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return error(res, '请提供经纬度', 400);
      }

      // 这里应该调用地图服务API
      // 暂时返回模拟数据
      return success(res, {
        address: '北京市朝阳区',
        formatted_address: '北京市朝阳区某某街道',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        street: '某某街道',
        location: { lat: parseFloat(lat), lng: parseFloat(lng) }
      });
    } catch (err) {
      logger.error('逆地理编码失败:', err);
      return error(res, '逆地理编码失败', 500);
    }
  }

  async getDistance(req, res) {
    try {
      const { origin, destination, mode = 'driving' } = req.query;

      if (!origin || !destination) {
        return error(res, '请提供起点和终点', 400);
      }

      // 这里应该调用地图服务API
      // 暂时返回模拟数据
      return success(res, {
        distance: 5000,
        duration: 900,
        mode: mode
      });
    } catch (err) {
      logger.error('获取距离失败:', err);
      return error(res, '获取距离失败', 500);
    }
  }

  async calculateRoute(req, res) {
    try {
      const { origin, destination, mode = 'driving' } = req.query;

      if (!origin || !destination) {
        return error(res, '请提供起点和终点', 400);
      }

      // 这里应该调用地图服务API
      // 暂时返回模拟数据
      return success(res, {
        routes: [{
          distance: 5000,
          duration: 900,
          mode: mode,
          steps: []
        }]
      });
    } catch (err) {
      logger.error('计算路线失败:', err);
      return error(res, '计算路线失败', 500);
    }
  }

  // ===== 邀请相关 =====
  async getInviteCode(req, res) {
    try {
      const userId = req.user.id;
      const { InviteRecord } = require('../models');

      // 查找用户有效的邀请码
      let invite = await InviteRecord.findOne({
        where: {
          inviter_id: userId,
          status: 'pending',
          expired_at: { [Op.gt]: new Date() }
        }
      });

      // 如果没有有效邀请码，生成一个新的
      if (!invite) {
        const code = `INVITE_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 30); // 30天有效期

        invite = await InviteRecord.create({
          inviter_id: userId,
          code,
          status: 'pending',
          reward_amount: 10.00,
          expired_at: expiredAt
        });
      }

      return success(res, {
        code: invite.code,
        url: `${process.env.APP_URL}/invite?code=${invite.code}`,
        expiredAt: invite.expired_at,
        rewardAmount: invite.reward_amount
      });
    } catch (err) {
      logger.error('获取邀请码失败:', err);
      return error(res, '获取邀请码失败', 500);
    }
  }

  async generateInviteCode(req, res) {
    try {
      const userId = req.user.id;
      const { InviteRecord } = require('../models');

      // 生成新的邀请码
      const code = `INVITE_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      const expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + 30);

      const invite = await InviteRecord.create({
        inviter_id: userId,
        code,
        status: 'pending',
        reward_amount: 10.00,
        expired_at: expiredAt
      });

      return success(res, {
        code: invite.code,
        url: `${process.env.APP_URL}/invite?code=${invite.code}`,
        expiredAt: invite.expired_at,
        rewardAmount: invite.reward_amount
      });
    } catch (err) {
      logger.error('生成邀请码失败:', err);
      return error(res, '生成邀请码失败', 500);
    }
  }

  async validateInviteCode(req, res) {
    try {
      const { code } = req.body;
      const { InviteRecord } = require('../models');

      if (!code) {
        return error(res, '请提供邀请码', 400);
      }

      const invite = await InviteRecord.findOne({
        where: {
          code,
          status: 'pending',
          expired_at: { [Op.gt]: new Date() }
        }
      });

      return success(res, {
        valid: !!invite,
        code: code,
        inviterId: invite?.inviter_id,
        rewardAmount: invite?.reward_amount
      });
    } catch (err) {
      logger.error('验证邀请码失败:', err);
      return error(res, '验证邀请码失败', 500);
    }
  }

  async useInviteCode(req, res) {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      const { InviteRecord, Wallet } = require('../models');

      if (!code) {
        return error(res, '请提供邀请码', 400);
      }

      const invite = await InviteRecord.findOne({
        where: {
          code,
          status: 'pending',
          expired_at: { [Op.gt]: new Date() }
        }
      });

      if (!invite) {
        return error(res, '邀请码无效或已过期', 400);
      }

      if (invite.inviter_id === userId) {
        return error(res, '不能使用自己的邀请码', 400);
      }

      // 更新邀请记录
      await invite.update({
        status: 'used',
        invitee_id: userId,
        used_at: new Date()
      });

      // 给邀请人发放奖励
      const inviterWallet = await Wallet.findOne({
        where: { user_id: invite.inviter_id }
      });

      if (inviterWallet) {
        await inviterWallet.increment('balance', { by: invite.reward_amount });
      }

      return success(res, {
        message: '邀请码使用成功',
        rewardAmount: invite.reward_amount
      });
    } catch (err) {
      logger.error('使用邀请码失败:', err);
      return error(res, '使用邀请码失败', 500);
    }
  }

  async getInviteStats(req, res) {
    try {
      const userId = req.user.id;
      const { InviteRecord } = require('../models');

      const totalSent = await InviteRecord.count({
        where: { inviter_id: userId }
      });

      const totalUsed = await InviteRecord.count({
        where: { inviter_id: userId, status: 'used' }
      });

      const totalPending = await InviteRecord.count({
        where: { inviter_id: userId, status: 'pending' }
      });

      const totalRewards = await InviteRecord.sum('reward_amount', {
        where: { inviter_id: userId, status: 'used' }
      }) || 0;

      return success(res, {
        totalSent,
        totalUsed,
        totalPending,
        totalRewards
      });
    } catch (err) {
      logger.error('获取邀请统计失败:', err);
      return error(res, '获取邀请统计失败', 500);
    }
  }

  async getInviteHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, pageSize = 20 } = req.query;
      const { InviteRecord, User } = require('../models');

      const { count, rows: invites } = await InviteRecord.findAndCountAll({
        where: { inviter_id: userId },
        include: [{
          model: User,
          as: 'invitee',
          attributes: ['id', 'nickname', 'avatar'],
          required: false
        }],
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: parseInt(pageSize)
      });

      return success(res, {
        list: invites,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        hasMore: count > page * pageSize
      });
    } catch (err) {
      logger.error('获取邀请历史失败:', err);
      return error(res, '获取邀请历史失败', 500);
    }
  }

  async getInviteRewards(req, res) {
    try {
      const userId = req.user.id;
      const { InviteRecord } = require('../models');

      // 获取待领取的奖励
      const pendingRewards = await InviteRecord.findAll({
        where: {
          inviter_id: userId,
          status: 'used',
          reward_status: 'pending'
        },
        attributes: ['id', 'code', 'reward_amount', 'used_at', 'invitee_id']
      });

      // 获取已领取的奖励
      const claimedRewards = await InviteRecord.findAll({
        where: {
          inviter_id: userId,
          reward_status: 'claimed'
        },
        attributes: ['id', 'code', 'reward_amount', 'used_at', 'invitee_id']
      });

      const totalPending = pendingRewards.reduce((sum, r) => sum + parseFloat(r.reward_amount), 0);
      const totalClaimed = claimedRewards.reduce((sum, r) => sum + parseFloat(r.reward_amount), 0);

      return success(res, {
        pending: {
          list: pendingRewards,
          totalAmount: totalPending
        },
        claimed: {
          list: claimedRewards,
          totalAmount: totalClaimed
        }
      });
    } catch (err) {
      logger.error('获取邀请奖励失败:', err);
      return error(res, '获取邀请奖励失败', 500);
    }
  }

  async claimReward(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { InviteRecord, Wallet } = require('../models');

      const invite = await InviteRecord.findOne({
        where: {
          id,
          inviter_id: userId,
          status: 'used',
          reward_status: 'pending'
        }
      });

      if (!invite) {
        return error(res, '奖励不存在或已领取', 404);
      }

      // 更新奖励状态
      await invite.update({ reward_status: 'claimed' });

      // 发放奖励到钱包
      const wallet = await Wallet.findOne({ where: { user_id: userId } });
      if (wallet) {
        await wallet.increment('balance', { by: invite.reward_amount });
      }

      return success(res, {
        message: '奖励领取成功',
        rewardAmount: invite.reward_amount
      });
    } catch (err) {
      logger.error('领取奖励失败:', err);
      return error(res, '领取奖励失败', 500);
    }
  }

  async shareInvite(req, res) {
    try {
      const userId = req.user.id;
      const { InviteRecord } = require('../models');

      // 获取或生成邀请码
      let invite = await InviteRecord.findOne({
        where: {
          inviter_id: userId,
          status: 'pending',
          expired_at: { [Op.gt]: new Date() }
        }
      });

      if (!invite) {
        const code = `INVITE_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 30);

        invite = await InviteRecord.create({
          inviter_id: userId,
          code,
          status: 'pending',
          reward_amount: 10.00,
          expired_at: expiredAt
        });
      }

      // 生成分享信息
      const shareInfo = {
        title: '邀请你加入聚聚',
        desc: '快来加入聚聚，发现更多精彩活动！',
        link: `${process.env.APP_URL}/invite?code=${invite.code}`,
        code: invite.code,
        posterUrl: `${process.env.APP_URL}/api/v1/invite/poster?code=${invite.code}`
      };

      return success(res, shareInfo);
    } catch (err) {
      logger.error('分享邀请失败:', err);
      return error(res, '分享邀请失败', 500);
    }
  }
}

module.exports = new MiscController();
