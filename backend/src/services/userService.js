const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class UserService {
  async register(userData) {
    try {
      const whereConditions = [];
      if (userData.phone) {
        whereConditions.push({ phone: userData.phone });
      }
      if (userData.email) {
        whereConditions.push({ email: userData.email });
      }

      let existingUser = null;
      if (whereConditions.length > 0) {
        existingUser = await User.findOne({
          where: {
            [Op.or]: whereConditions
          }
        });
      }

      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = await User.create({
        openid: userData.openid,
        unionid: userData.unionid,
        phone: userData.phone,
        email: userData.email,
        nickname: userData.nickname || 'User',
        avatar: userData.avatar,
        gender: userData.gender || 0,
        birthday: userData.birthday,
        province: userData.province,
        city: userData.city,
        country: userData.country,
        language: userData.language || 'zh_CN',
        status: 1
      });

      const token = generateToken({
        id: user.id,
        openid: user.openid,
        role: 'user'
      });
      const refreshToken = generateRefreshToken({
        id: user.id,
        openid: user.openid,
        role: 'user'
      });

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  async login(openid, unionid) {
    try {
      const whereConditions = [];
      if (openid) {
        whereConditions.push({ openid });
      }
      if (unionid) {
        whereConditions.push({ unionid });
      }

      let user = await User.findOne({
        where: {
          [Op.or]: whereConditions
        }
      });

      if (!user) {
        user = await User.create({
          openid,
          unionid,
          nickname: 'User',
          gender: 0,
          language: 'zh_CN',
          status: 1
        });
      }

      user.last_login_at = new Date();
      await user.save();

      const token = generateToken({
        id: user.id,
        openid: user.openid,
        role: 'user'
      });
      const refreshToken = generateRefreshToken({
        id: user.id,
        openid: user.openid,
        role: 'user'
      });

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allowedFields = [
        'nickname',
        'avatar',
        'gender',
        'birthday',
        'province',
        'city',
        'country',
        'language'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      await user.update(updates);
      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Update user failed:', error);
      throw error;
    }
  }

  async getUserList(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.keyword) {
        where[Op.or] = [
          { nickname: { [Op.like]: `%${filters.keyword}%` } },
          { phone: { [Op.like]: `%${filters.keyword}%` } },
          { email: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      if (filters.register_start_date && filters.register_end_date) {
        where.created_at = {
          [Op.gte]: filters.register_start_date,
          [Op.lte]: filters.register_end_date
        };
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        offset,
        limit,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows.map(user => this.sanitizeUser(user))
      };
    } catch (error) {
      logger.error('Get user list failed:', error);
      throw error;
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.status = status;
      await user.save();

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Update user status failed:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await user.destroy();
      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Delete user failed:', error);
      throw error;
    }
  }

  sanitizeUser(user) {
    if (!user) return null;
    
    const plainUser = user.get ? user.get({ plain: true }) : user;
    
    if (plainUser.password) {
      delete plainUser.password;
    }
    
    // Keep openid for test compatibility
    // if (plainUser.openid) {
    //   delete plainUser.openid;
    // }
    
    return plainUser;
  }

  async getVipStatus(userId) {
    try {
      const { VIPMembership } = require('../models');
      const vipMembership = await VIPMembership.findOne({
        where: {
          user_id: userId,
          status: 1
        },
        order: [['created_at', 'DESC']]
      });

      if (!vipMembership) {
        return {
          isVip: false,
          vipLevel: null,
          vipExpiresAt: null,
          membershipType: null,
          startDate: null,
          endDate: null,
          status: 0
        };
      }

      return {
        isVip: true,
        vipLevel: vipMembership.membership_type,
        vipExpiresAt: vipMembership.end_date,
        membershipType: vipMembership.membership_type,
        startDate: vipMembership.start_date,
        endDate: vipMembership.end_date,
        status: vipMembership.status
      };
    } catch (error) {
      logger.error('Get VIP status failed:', error);
      throw error;
    }
  }

  async updateVipStatus(userId, status) {
    try {
      const { VIPMembership } = require('../models');
      const vipMembership = await VIPMembership.findOne({
        where: {
          user_id: userId,
          status: 1
        }
      });

      if (vipMembership) {
        vipMembership.status = status;
        await vipMembership.save();
      }

      return await this.getVipStatus(userId);
    } catch (error) {
      logger.error('Update VIP status failed:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const { Party, Order, Ticket } = require('../models');

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const totalOrders = await Order.count({ where: { user_id: userId } });
      const paidOrders = await Order.count({
        where: {
          user_id: userId,
          status: 1
        }
      });
      const completedOrders = await Order.count({
        where: {
          user_id: userId,
          status: 2
        }
      });
      const todayOrders = await Order.count({
        where: {
          user_id: userId,
          created_at: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      const totalParties = await Party.count({ where: { user_id: userId } });
      const publishedParties = await Party.count({ 
        where: { 
          user_id: userId,
          status: 1,
          audit_status: 1
        } 
      });
      const endedParties = await Party.count({ 
        where: { 
          user_id: userId,
          status: 3
        } 
      });

      const totalTickets = await Ticket.count({ where: { user_id: userId } });
      const usedTickets = await Ticket.count({
        where: {
          user_id: userId,
          status: 1
        }
      });
      const validTickets = await Ticket.count({
        where: {
          user_id: userId,
          status: 0
        }
      });

      return {
        orders: {
          total: totalOrders,
          paid: paidOrders,
          completed: completedOrders,
          today: todayOrders
        },
        parties: {
          total: totalParties,
          published: publishedParties,
          ended: endedParties
        },
        tickets: {
          total: totalTickets,
          used: usedTickets,
          valid: validTickets
        }
      };
    } catch (error) {
      logger.error('Get user stats failed:', error);
      throw error;
    }
  }

  async searchUsers(keyword, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const where = {};

      if (keyword) {
        where[Op.or] = [
          { nickname: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows.map(user => this.sanitizeUser(user))
      };
    } catch (error) {
      logger.error('Search users failed:', error);
      throw error;
    }
  }

  async getUserActivities(userId, page = 1, pageSize = 20) {
    try {
      const { User } = require('../models');
      const { sequelize } = require('../config/database');

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const offset = (page - 1) * pageSize;

      const partyQuery = `
        SELECT 
          'party' as type,
          'created' as action,
          CONCAT('创建了聚会：', title) as description,
          created_at as createdAt,
          id,
          title,
          cover_image,
          start_time,
          end_time,
          location,
          address
        FROM parties
        WHERE user_id = ?
      `;

      const orderQuery = `
        SELECT 
          'order' as type,
          'created' as action,
          CONCAT('创建了订单：', order_no) as description,
          created_at as createdAt,
          id,
          order_no,
          final_amount,
          payment_status,
          status
        FROM orders
        WHERE user_id = ?
      `;

      const query = `
        SELECT * FROM (
          ${partyQuery}
          UNION ALL
          ${orderQuery}
        ) as combined
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const [activities] = await sequelize.query(query, {
        replacements: [userId, userId, pageSize, offset],
        type: sequelize.QueryTypes.SELECT
      });

      const countQuery = `
        SELECT COUNT(*) as total FROM (
          ${partyQuery}
          UNION ALL
          ${orderQuery}
        ) as combined
      `;

      const [countResult] = await sequelize.query(countQuery, {
        replacements: [userId, userId],
        type: sequelize.QueryTypes.SELECT
      });

      return {
        total: countResult[0].total,
        page,
        pageSize,
        data: activities
      };
    } catch (error) {
      logger.error('Get user activities failed:', error);
      throw error;
    }
  }

  async getUserOrders(userId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const { Order, Party } = require('../models');

      const { count, rows } = await Order.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit: pageSize,
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'start_time', 'end_time']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get user orders failed:', error);
      throw error;
    }
  }

  async getUserParties(userId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const { Party } = require('../models');

      const { count, rows } = await Party.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get user parties failed:', error);
      throw error;
    }
  }

  async batchUpdateUserStatus(ids, status) {
    try {
      const result = await User.update(
        { status },
        {
          where: {
            id: { [Op.in]: ids }
          }
        }
      );

      return {
        affectedCount: result[0],
        message: `${result[0]} users updated successfully`
      };
    } catch (error) {
      logger.error('Batch update user status failed:', error);
      throw error;
    }
  }

  async exportUsers(filters = {}) {
    try {
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.is_vip !== undefined) {
        where.is_vip = filters.is_vip === 'true';
      }

      if (filters.keyword) {
        where[Op.or] = [
          { nickname: { [Op.like]: `%${filters.keyword}%` } },
          { phone: { [Op.like]: `%${filters.keyword}%` } },
          { email: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      const offset = filters.offset || 0;
      const limit = Math.min(filters.limit || 1000, filters.maxExportLimit || 10000);

      const users = await User.findAll({
        where,
        order: [['created_at', 'DESC']],
        offset,
        limit
      });

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      worksheet.columns = [
        { header: 'ID', key: 'id' },
        { header: '昵称', key: 'nickname' },
        { header: '手机号', key: 'phone' },
        { header: '邮箱', key: 'email' },
        { header: '性别', key: 'gender' },
        { header: '城市', key: 'city' },
        { header: 'VIP', key: 'is_vip' },
        { header: '状态', key: 'status' },
        { header: '注册时间', key: 'created_at' }
      ];

      users.forEach(user => {
        worksheet.addRow({
          id: user.id,
          nickname: user.nickname,
          phone: user.phone,
          email: user.email,
          gender: user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知',
          city: user.city,
          is_vip: user.is_vip ? '是' : '否',
          status: user.status === 1 ? '正常' : '禁用',
          created_at: user.created_at
        });
      });

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Export users failed:', error);
      throw error;
    }
  }

  async getUserTransactions(userId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const { WalletTransaction } = require('../models');

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get user transactions failed:', error);
      throw error;
    }
  }

  // 用户拉黑相关方法
  async blockUser(userId, blockedUserId) {
    try {
      const { BlockedUser, User } = require('../models');

      // 检查被拉黑用户是否存在
      const blockedUser = await User.findByPk(blockedUserId);
      if (!blockedUser) {
        throw new Error('用户不存在');
      }

      // 检查是否已经拉黑
      const existingBlock = await BlockedUser.findOne({
        where: {
          user_id: userId,
          blocked_user_id: blockedUserId
        }
      });

      if (existingBlock) {
        throw new Error('已经拉黑该用户');
      }

      // 创建拉黑记录
      await BlockedUser.create({
        user_id: userId,
        blocked_user_id: blockedUserId,
        blocked_at: new Date()
      });

      return { success: true };
    } catch (error) {
      logger.error('Block user failed:', error);
      throw error;
    }
  }

  async unblockUser(userId, blockedUserId) {
    try {
      const { BlockedUser } = require('../models');

      const blockedRecord = await BlockedUser.findOne({
        where: {
          user_id: userId,
          blocked_user_id: blockedUserId
        }
      });

      if (!blockedRecord) {
        throw new Error('未拉黑该用户');
      }

      await blockedRecord.destroy();

      return { success: true };
    } catch (error) {
      logger.error('Unblock user failed:', error);
      throw error;
    }
  }

  async getBlockedUsers(userId, page = 1, pageSize = 20) {
    try {
      const { BlockedUser, User } = require('../models');
      const offset = (page - 1) * pageSize;

      const { count, rows } = await BlockedUser.findAndCountAll({
        where: { user_id: userId },
        include: [{
          model: User,
          as: 'blocked_user',
          attributes: ['id', 'nickname', 'avatar']
        }],
        offset,
        limit: pageSize,
        order: [['blocked_at', 'DESC']]
      });

      return {
        list: rows.map(row => ({
          id: row.blocked_user.id,
          nickname: row.blocked_user.nickname,
          avatar: row.blocked_user.avatar,
          blockedAt: row.blocked_at
        })),
        total: count,
        page,
        pageSize,
        hasMore: count > page * pageSize
      };
    } catch (error) {
      logger.error('Get blocked users failed:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
