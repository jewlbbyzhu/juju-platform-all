const { Party, TicketType, Favorite, Order } = require('../models');
/* eslint-disable no-unused-vars */
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const cacheManager = require('../utils/cacheManager');
const { toJSONSafe } = require('../utils/circularRefCleaner');
const { ORDER_PREFIX } = require('../constants');
const webSocketService = require('./webSocketService');

class PartyService {
  async createParty(userId, partyData) {
    const TransactionManager = require('../utils/transactionManager');
    
    return await TransactionManager.execute(async (t) => {
      const party = await Party.create({
        user_id: userId,
        title: partyData.title,
        description: partyData.description,
        cover_image: partyData.cover_image,
        images: partyData.images,
        category: partyData.category,
        start_time: partyData.start_time,
        end_time: partyData.end_time,
        location: partyData.location,
        address: partyData.address,
        latitude: partyData.latitude,
        longitude: partyData.longitude,
        max_participants: partyData.max_participants,
        current_participants: 0,
        min_price: partyData.min_price || 0,
        max_price: partyData.max_price || 0,
        status: 0,
        audit_status: 0,
        view_count: 0,
        favorite_count: 0,
        is_featured: false,
        is_hot: false
      }, { transaction: t });

      if (partyData.ticket_types && partyData.ticket_types.length > 0) {
        const ticketTypesData = partyData.ticket_types.map(ticketType => ({
          party_id: party.id,
          name: ticketType.name,
          description: ticketType.description,
          type: ticketType.type || 1,
          price: ticketType.price,
          original_price: ticketType.original_price,
          available_count: ticketType.available_count || ticketType.quantity,
          sold_count: 0,
          max_per_user: ticketType.max_per_user || 0,
          sale_start_time: ticketType.sale_start_time,
          sale_end_time: ticketType.sale_end_time,
          early_bird_deadline: ticketType.early_bird_deadline,
          status: 1,
          sort_order: ticketType.sort_order || 0
        }));
        await TicketType.bulkCreate(ticketTypesData, { transaction: t });
      }

      return await this.getPartyById(party.id);
    });
  }

  async updateParty(partyId, userId, updateData) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      if (party.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const allowedFields = [
        'title',
        'description',
        'cover_image',
        'images',
        'category',
        'start_time',
        'end_time',
        'location',
        'address',
        'latitude',
        'longitude',
        'max_participants',
        'min_price',
        'max_price'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      await party.update(updates);

      if (updateData.ticket_types) {
        await TicketType.destroy({ where: { party_id: partyId } });
        
        for (const ticketType of updateData.ticket_types) {
          await TicketType.create({
            party_id: party.id,
            name: ticketType.name,
            description: ticketType.description,
            type: ticketType.type || 1,
            price: ticketType.price,
            original_price: ticketType.original_price,
            available_count: ticketType.available_count || ticketType.quantity,
            sold_count: ticketType.sold_count || 0,
            max_per_user: ticketType.max_per_user || 0,
            sale_start_time: ticketType.sale_start_time,
            sale_end_time: ticketType.sale_end_time,
            early_bird_deadline: ticketType.early_bird_deadline,
            status: ticketType.status !== undefined ? ticketType.status : 1,
            sort_order: ticketType.sort_order || 0
          });
        }
      }

      return await this.getPartyById(party.id);
    } catch (error) {
      logger.error('Update party failed:', error);
      throw error;
    }
  }

  async deleteParty(partyId, userId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      if (party.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      await party.destroy();
      return { message: 'Party deleted successfully' };
    } catch (error) {
      logger.error('Delete party failed:', error);
      throw error;
    }
  }

  async getPartyById(partyId) {
    try {
      const party = await Party.findByPk(partyId, {
        include: [
          {
            model: TicketType,
            as: 'ticket_types',
            where: { status: 1 },
            required: false
          },
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      if (!party) {
        throw new Error('Party not found');
      }

      await party.increment('view_count');
      const result = toJSONSafe(party);
      
      // Add priceRange field (formatted price range for frontend)
      const minPrice = parseFloat(result.min_price || 0);
      const maxPrice = parseFloat(result.max_price || 0);
      if (minPrice === 0 && maxPrice === 0) {
        result.priceRange = { min: '0.00', max: '0.00', text: '免费' };
      } else if (minPrice === maxPrice) {
        result.priceRange = { min: minPrice.toFixed(2), max: maxPrice.toFixed(2), text: `¥${minPrice.toFixed(2)}` };
      } else {
        result.priceRange = { min: minPrice.toFixed(2), max: maxPrice.toFixed(2), text: `¥${minPrice.toFixed(2)} - ¥${maxPrice.toFixed(2)}` };
      }
      
      // Add organizer as alias for user
      if (result.user) {
        result.organizer = result.user;
      }
      
      // Use first image from images array as coverImage if cover_image is null
      if (!result.cover_image && result.images && result.images.length > 0) {
        result.coverImage = result.images[0];
      } else {
        result.coverImage = result.cover_image;
      }
      
      return result;
    } catch (error) {
      logger.error('Get party by ID failed:', error);
      throw error;
    }
  }

  async getPartyList(page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.audit_status !== undefined) {
        where.audit_status = filters.audit_status;
      }

      if (filters.category !== undefined && filters.category !== null && filters.category !== '') {
        where.category = filters.category;
      }

      if (filters.is_featured !== undefined) {
        where.is_featured = filters.is_featured;
      }

      if (filters.is_hot !== undefined) {
        where.is_hot = filters.is_hot;
      }

      if (filters.keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${filters.keyword}%` } },
          { description: { [Op.like]: `%${filters.keyword}%` } },
          { location: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      if (filters.start_date && filters.end_date) {
        where.start_time = {
          [Op.gte]: filters.start_date,
          [Op.lte]: filters.end_date
        };
      }

      if (filters.min_price !== undefined && filters.max_price !== undefined) {
        where[Op.and] = [
          { min_price: { [Op.lte]: filters.max_price } },
          { max_price: { [Op.gte]: filters.min_price } }
        ];
      }

      const { count, rows } = await Party.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar'],
            paranoid: false,
            required: false
          }
        ],
        order: [
          filters.sort_by === 'price_asc' ? ['min_price', 'ASC'] :
            filters.sort_by === 'price_desc' ? ['min_price', 'DESC'] :
              filters.sort_by === 'start_time' ? ['start_time', 'ASC'] :
                filters.sort_by === 'view_count' ? ['view_count', 'DESC'] :
                  filters.sort_by === 'favorite_count' ? ['favorite_count', 'DESC'] :
                    ['created_at', 'DESC']
        ],
        paranoid: false
      });

      const parties = rows.map(party => toJSONSafe(party));

      return {
        total: count,
        page,
        pageSize: limit,
        data: parties
      };
    } catch (error) {
      logger.error('Get party list failed:', error);
      throw error;
    }
  }

  async auditParty(partyId, auditData) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      party.audit_status = auditData.audit_status;

      if (auditData.audit_status === 1) {
        party.status = 1;
      } else if (auditData.audit_status === 2) {
        party.status = 0;
        party.audit_reason = auditData.audit_reason;
      }
      
      await party.save();
      return await this.getPartyById(party.id);
    } catch (error) {
      logger.error('Audit party failed:', error);
      throw error;
    }
  }

  async updatePartyStatus(partyId, status) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      party.status = status;
      await party.save();

      return await this.getPartyById(party.id);
    } catch (error) {
      logger.error('Update party status failed:', error);
      throw error;
    }
  }

  async getPartyByUserId(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Party.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        pageSize: limit,
        data: rows
      };
    } catch (error) {
      logger.error('Get party by user ID failed:', error);
      throw error;
    }
  }

  async incrementParticipants(partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      if (party.current_participants >= party.max_participants) {
        throw new Error('Party is full');
      }

      party.current_participants += 1;
      await party.save();

      return party;
    } catch (error) {
      logger.error('Increment participants failed:', error);
      throw error;
    }
  }

  async decrementParticipants(partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      if (party.current_participants > 0) {
        party.current_participants -= 1;
        await party.save();
      }

      return party;
    } catch (error) {
      logger.error('Decrement participants failed:', error);
      throw error;
    }
  }

  async getPublishedParties(page = 1, pageSize = 20, filters = {}) {
    try {
      const cacheKey = cacheManager.getPublishedPartiesCacheKey(page, pageSize, filters);
      const cachedResult = await cacheManager.get(cacheKey);

      if (cachedResult) {
        logger.info(`Published parties cache hit for page ${page}`);
        return cachedResult;
      }

      const offset = (page - 1) * pageSize;
      const where = {
        status: 1,
        audit_status: 1
      };

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined && 
          filters.minPrice !== null && filters.maxPrice !== null) {
        where[Op.and] = [
          { min_price: { [Op.lte]: filters.maxPrice } },
          { max_price: { [Op.gte]: filters.minPrice } }
        ];
      }

      if (filters.participantsMin !== undefined && filters.participantsMax !== undefined && 
          filters.participantsMin !== null && filters.participantsMax !== null) {
        where[Op.and] = where[Op.and] || [];
        where[Op.and].push(
          { max_participants: { [Op.gte]: filters.participantsMin } },
          { max_participants: { [Op.lte]: filters.participantsMax } }
        );
      }

      if (filters.favorite !== undefined && filters.favorite !== null && filters.favorite !== '') {
        const favoriteUserId = Number(filters.favorite);
        if (Number.isInteger(favoriteUserId) && favoriteUserId > 0) {
          const favorites = await Favorite.findAll({
            where: { user_id: favoriteUserId },
            attributes: ['party_id']
          });
          const favoritePartyIds = favorites.map(f => f.party_id);
          where.id = { [Op.in]: favoritePartyIds.length ? favoritePartyIds : [-1] };
        }
      }

      const order = [
        filters.sortBy === 'latest' ? ['created_at', 'DESC'] :
          filters.sortBy === 'startTime' ? ['start_time', 'ASC'] :
            filters.sortBy === 'minPrice' ? ['min_price', 'ASC'] :
              filters.sortBy === 'viewCount' ? ['view_count', 'DESC'] :
                filters.sortBy === 'favoriteCount' ? ['favorite_count', 'DESC'] :
                  ['created_at', 'DESC']
      ];

      const queryOptions = {
        where,
        offset,
        limit: pageSize,
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          },
          {
            model: require('../models').Order,
            as: 'orders',
            where: { status: 1 },
            required: false,
            include: [{
              model: require('../models').User,
              as: 'user',
              attributes: ['id', 'nickname', 'avatar']
            }],
            limit: 3,
            order: [['created_at', 'DESC']]
          }
        ],
        order,
        nest: true
      };

      const { rows } = await Party.findAndCountAll(queryOptions);

      let parties = rows.map(party => toJSONSafe(party));
      
      // 调试：检查第一个聚会的日期格式
      if (parties.length > 0) {
        const firstParty = parties[0];
        logger.info(`First party date fields: start_time=${firstParty.start_time}, end_time=${firstParty.end_time}, type=${typeof firstParty.start_time}`);
      }

      // 计算距离并筛选
      if (filters.latitude && filters.longitude) {
        const userLat = parseFloat(filters.latitude);
        const userLng = parseFloat(filters.longitude);
        const maxDistance = parseFloat(filters.maxDistance) || 100; // 默认100km
        
        logger.info(`Distance filter: userLat=${userLat}, userLng=${userLng}, maxDistance=${maxDistance}, partiesCount=${parties.length}`);

        parties.forEach(party => {
          if (party.latitude && party.longitude) {
            const distance = this.calculateDistance(userLat, userLng, party.latitude, party.longitude);
            party.distance = distance;
            logger.info(`Party ${party.id}: lat=${party.latitude}, lng=${party.longitude}, distance=${distance}km`);
          } else {
            logger.info(`Party ${party.id}: no lat/lng`);
          }
        });

        // 根据maxDistance筛选聚会
        const beforeFilter = parties.length;
        parties = parties.filter(party => {
          if (!party.distance) return false;
          return party.distance <= maxDistance;
        });
        logger.info(`After distance filter: ${parties.length}/${beforeFilter} parties remain`);

        // 如果是按距离排序，则按距离排序
        if (filters.sortBy === 'distance') {
          parties.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
      }

      const result = {
        total: parties.length,
        page,
        pageSize,
        data: parties || []
      };

      await cacheManager.set(cacheKey, result, 300);
      logger.info(`Published parties cached for page ${page}`);

      return result;
    } catch (error) {
      logger.error('Get published parties failed:', error);
      throw error;
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  calculatePartyWeight(party, userLat = null, userLng = null) {
    let weight = 1.0;

    const user = party.user;
    if (user && user.is_vip) {
      if (user.vip_level === 'yearly') {
        weight *= 2.5;
      } else if (user.vip_level === 'quarterly') {
        weight *= 1.8;
      } else if (user.vip_level === 'monthly') {
        weight *= 1.2;
      }
    }

    if (userLat !== null && userLng !== null && party.latitude && party.longitude) {
      const distance = this.calculateDistance(userLat, userLng, party.latitude, party.longitude);
      if (distance <= 100) {
        const distanceWeight = (100 - distance) / 100;
        weight *= (1 + distanceWeight * 0.3);
      }
    }

    const now = new Date();
    const hoursUntilStart = (new Date(party.start_time) - now) / (1000 * 60 * 60);
    if (hoursUntilStart > 0 && hoursUntilStart <= 24) {
      const timeWeight = (24 - hoursUntilStart) / 24;
      weight *= (1 + timeWeight * 0.2);
    }

    if (party.max_participants > 0) {
      const currentParticipants = party.orders ? party.orders.length : 0;
      const progress = currentParticipants / party.max_participants;
      if (progress >= 0.3 && progress <= 0.7) {
        const progressWeight = 1 - Math.abs(progress - 0.5) / 0.5;
        weight *= (1 + progressWeight * 0.15);
      }
    }

    return weight;
  }

  async getUpcomingParties(page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const now = new Date();

      const { count, rows } = await Party.findAndCountAll({
        where: {
          status: 1,
          audit_status: 1,
          start_time: { [Op.gte]: now }
        },
        offset,
        limit: pageSize,
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['start_time', 'ASC']],
        nest: true
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get upcoming parties failed:', error);
      throw error;
    }
  }

  async getHotParties(page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Party.findAndCountAll({
        where: {
          status: 1,
          audit_status: 1,
          is_hot: true
        },
        offset,
        limit: pageSize,
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['view_count', 'DESC']],
        nest: true
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get hot parties failed:', error);
      throw error;
    }
  }

  async publishParty(partyId, userId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      if (party.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      party.status = 1;
      party.audit_status = 1;
      await party.save();

      return await this.getPartyById(party.id);
    } catch (error) {
      logger.error('Publish party failed:', error);
      throw error;
    }
  }

  async cancelParty(partyId, userId, reason) {
    const TransactionManager = require('../utils/transactionManager');
    let orders = [];
    let party = null;
    
    await TransactionManager.execute(async (t) => {
      party = await Party.findByPk(partyId, { transaction: t });
      if (!party) {
        throw new Error('Party not found');
      }

      // 管理员可以取消任何聚会，普通用户只能取消自己的
      const { Admin } = require('../models');
      const admin = await Admin.findByPk(userId, { transaction: t });
      if (!admin && party.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      party.status = 4;
      await party.save({ transaction: t });

      // 下架所有票型
      const TicketType = require('../models').TicketType;
      await TicketType.update(
        { status: 0 },
        { 
          where: { party_id: partyId },
          transaction: t 
        }
      );

      // 获取所有已支付的订单
      const Order = require('../models').Order;
      orders = await Order.findAll({
        where: { 
          party_id: partyId,
          status: 1, // 已支付
          payment_status: 1 // 已支付
        },
        transaction: t
      });

      // 自动为已支付订单发起退款
      const Refund = require('../models').Refund;
      for (const order of orders) {
        // 创建退款记录
        const refundNo = `${ORDER_PREFIX.REFUND}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await Refund.create({
          order_id: order.id,
          payment_id: order.payment_id,
          user_id: order.user_id,
          refund_no: refundNo,
          amount: order.final_amount,
          reason: '聚会取消',
          status: 0
        }, { transaction: t });

        // 更新订单状态
        order.status = 4; // 已退款
        order.payment_status = 3; // 已退款
        await order.save({ transaction: t });
      }
    });

    // 发送通知（在事务外发送，避免事务超时）
    const notificationPromises = orders.map(order =>
      webSocketService.sendNotification(order.user_id, {
        type: 'party_cancelled',
        title: '聚会已取消',
        content: `您报名的聚会"${party.title}"已被组织者取消，退款将在1-3个工作日内到账`,
        related_id: party.id,
        related_type: 'party'
      }).catch(err => {
        logger.error(`Failed to send notification to user ${order.user_id}:`, err);
      })
    );
    await Promise.allSettled(notificationPromises);

    return await this.getPartyById(party.id);
  }

  async endParty(partyId, userId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      if (party.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      party.status = 3;
      await party.save();

      return await this.getPartyById(party.id);
    } catch (error) {
      logger.error('End party failed:', error);
      throw error;
    }
  }

  async getParticipants(partyId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Order.findAndCountAll({
        where: {
          party_id: partyId,
          status: 1
        },
        offset,
        limit: pageSize,
        attributes: ['id', 'user_id', 'party_id', 'status', 'created_at'],
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const data = rows.map(order => ({
        id: order.id,
        userId: order.user_id,
        partyId: order.party_id,
        status: order.status,
        createdAt: order.created_at,
        user: order.user ? {
          id: order.user.id,
          nickname: order.user.nickname,
          avatar: order.user.avatar
        } : null
      }));

      return {
        total: count,
        page,
        pageSize,
        data
      };
    } catch (error) {
      logger.error('Get participants failed:', error);
      throw error;
    }
  }

  async getPartyStatistics(partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      const { Order } = require('../models');

      const totalOrders = await Order.count({
        where: { party_id: partyId }
      });

      const paidOrders = await Order.count({
        where: {
          party_id: partyId,
          payment_status: 1
        }
      });

      const totalRevenue = await Order.sum('final_amount', {
        where: {
          party_id: partyId,
          payment_status: 1
        }
      });

      return {
        partyId: party.id,
        totalParticipants: party.current_participants,
        maxParticipants: party.max_participants,
        totalOrders,
        paidOrders,
        totalRevenue: totalRevenue || 0,
        viewCount: party.view_count,
        favoriteCount: party.favorite_count
      };
    } catch (error) {
      logger.error('Get party statistics failed:', error);
      throw error;
    }
  }

  async getAvailableTickets(partyId) {
    try {
      const tickets = await TicketType.findAll({
        where: {
          party_id: partyId,
          status: 1
        },
        order: [['sort_order', 'ASC']]
      });

      return tickets;
    } catch (error) {
      logger.error('Get available tickets failed:', error);
      throw error;
    }
  }

  async checkAvailability(partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      const available = party.status === 1 && 
                     party.audit_status === 1 && 
                     party.current_participants < party.max_participants &&
                     new Date(party.end_time) > new Date();

      return {
        available,
        message: available ? 'Party is available' : 'Party is not available'
      };
    } catch (error) {
      logger.error('Check availability failed:', error);
      throw error;
    }
  }

  async getPartyStats() {
    try {
      const totalParties = await Party.count();
      const activeParties = await Party.count({ where: { status: 1 } });
      const pendingParties = await Party.count({ where: { audit_status: 0 } });
      const completedParties = await Party.count({ where: { status: 3 } });
      const cancelledParties = await Party.count({ where: { status: 4 } });

      const { Order } = require('../models');
      const totalOrders = await Order.count();
      const paidOrders = await Order.count({ where: { status: 1 } });

      return {
        parties: {
          total: totalParties,
          active: activeParties,
          pending: pendingParties,
          completed: completedParties,
          cancelled: cancelledParties
        },
        orders: {
          total: totalOrders,
          paid: paidOrders
        }
      };
    } catch (error) {
      logger.error('Get party stats failed:', error);
      throw error;
    }
  }

  async searchParties(keyword, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const where = {};

      if (keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } },
          { location: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const { count, rows } = await Party.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
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
      logger.error('Search parties failed:', error);
      throw error;
    }
  }

  async getPartyAuditHistory(partyId) {
    try {
      const { PartyAudit } = require('../models');
      const history = await PartyAudit.findAll({
        where: { party_id: partyId },
        order: [['created_at', 'DESC']]
      });

      return history;
    } catch (error) {
      logger.error('Get party audit history failed:', error);
      throw error;
    }
  }

  async batchAuditParties(ids, auditStatus, auditReason) {
    try {
      const results = [];
      
      for (const id of ids) {
        const party = await Party.findByPk(id);
        if (!party) {
          continue;
        }

        party.audit_status = auditStatus;
        party.status = auditStatus === 1 ? 1 : 0;
        
        if (auditStatus === 2) {
          party.audit_reason = auditReason;
        }

        await party.save();

        const { PartyAudit } = require('../models');
        await PartyAudit.create({
          party_id: party.id,
          audit_status: auditStatus,
          audit_reason: auditReason,
          auditor_id: 1
        });

        results.push({ id: party.id, status: 'audited' });
      }

      return {
        affectedCount: results.length,
        results
      };
    } catch (error) {
      logger.error('Batch audit parties failed:', error);
      throw error;
    }
  }

  async completeParty(partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

      party.status = 3;
      await party.save();

      return await this.getPartyById(partyId);
    } catch (error) {
      logger.error('Complete party failed:', error);
      throw error;
    }
  }

  async exportParties(filters = {}) {
    try {
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.audit_status !== undefined) {
        where.audit_status = filters.audit_status;
      }

      if (filters.keyword) {
        where[Op.or] = [
          { title: { [Op.like]: `%${filters.keyword}%` } },
          { description: { [Op.like]: `%${filters.keyword}%` } },
          { location: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      const parties = await Party.findAll({
        where,
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Parties');

      worksheet.columns = [
        { header: 'ID', key: 'id' },
        { header: '标题', key: 'title' },
        { header: '分类', key: 'category' },
        { header: '地点', key: 'location' },
        { header: '开始时间', key: 'start_time' },
        { header: '结束时间', key: 'end_time' },
        { header: '最大人数', key: 'max_participants' },
        { header: '当前人数', key: 'current_participants' },
        { header: '最低价格', key: 'min_price' },
        { header: '状态', key: 'status' },
        { header: '审核状态', key: 'audit_status' },
        { header: '创建时间', key: 'created_at' }
      ];

      parties.forEach(party => {
        worksheet.addRow({
          id: party.id,
          title: party.title,
          category: party.category,
          location: party.location,
          start_time: party.start_time,
          end_time: party.end_time,
          max_participants: party.max_participants,
          current_participants: party.current_participants,
          min_price: party.min_price,
          status: party.status === 0 ? '草稿' : 
            party.status === 1 ? '待审核' : 
              party.status === 2 ? '进行中' : 
                party.status === 3 ? '已结束' : 
                  party.status === 4 ? '已取消' : 
                    party.status === 5 ? '已拒绝' : '未知',
          audit_status: party.audit_status === 0 ? '待审核' : party.audit_status === 1 ? '已通过' : '已拒绝',
          created_at: party.created_at
        });
      });

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Export parties failed:', error);
      throw error;
    }
  }
}

module.exports = new PartyService();
