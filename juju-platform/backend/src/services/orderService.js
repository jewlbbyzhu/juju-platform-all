/* eslint-disable no-unused-vars */
const { Order, OrderItem, Party, TicketType, Ticket, Payment, Refund, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { TICKET_CONSTANTS, ORDER_PREFIX } = require('../constants');
const { toJSONSafe } = require('../utils/circularRefCleaner');

class OrderService {
  async createOrder(userId, orderData) {
    try {
      const TransactionManager = require('../utils/transactionManager');
      
      return await TransactionManager.execute(async (t) => {
        const { party_id, items } = orderData;

        const party = await Party.findByPk(party_id, {
          transaction: t
        });
        if (!party) {
          throw new Error('Party not found');
        }

        if (party.status !== 1) {
          throw new Error('Party is not available');
        }

        const user = await User.findByPk(userId, {
          transaction: t
        });
        if (!user) {
          throw new Error('User not found');
        }

        if (party.min_age && user.birthday) {
          const age = this.calculateAge(user.birthday);
          if (age < party.min_age) {
            throw new Error('年龄不符合要求');
          }
        }

        if (party.max_age && user.birthday) {
          const age = this.calculateAge(user.birthday);
          if (age > party.max_age) {
            throw new Error('年龄不符合要求');
          }
        }

        if (party.gender_restriction && party.gender_restriction !== user.gender) {
          throw new Error('性别不符合要求');
        }

        const existingOrder = await Order.findOne({
          where: {
            user_id: userId,
            party_id: party_id,
            status: 1
          },
          transaction: t
        });

        if (existingOrder) {
          throw new Error('重复参与聚会');
        }

        let totalAmount = 0;
        const orderItems = [];
        let totalQuantity = 0;

        for (const item of items) {
          const ticketType = await TicketType.findOne({
            where: {
              id: item.ticket_type_id,
              party_id: party_id,
              status: 1
            },
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          if (!ticketType) {
            throw new Error(`Ticket type ${item.ticket_type_id} not found`);
          }

          if (ticketType.available_count - ticketType.sold_count < item.quantity) {
            throw new Error(`Insufficient tickets for ${ticketType.name}`);
          }

          const itemTotal = ticketType.price * item.quantity;
          totalAmount += itemTotal;
          totalQuantity += item.quantity;

          orderItems.push({
            ticket_type_id: item.ticket_type_id,
            ticket_type_name: ticketType.name,
            price: ticketType.price,
            quantity: item.quantity,
            total_amount: itemTotal
          });

          // 预占库存：创建订单时立即扣减 sold_count
          await TicketType.increment('sold_count', {
            by: item.quantity,
            where: { id: item.ticket_type_id },
            transaction: t
          });
        }

        // 检查聚会总参与人数限制
        if (party.max_participants > 0) {
          const currentParticipants = party.current_participants || 0;
          if (currentParticipants + totalQuantity > party.max_participants) {
            throw new Error('聚会参与人数已达上限');
          }
        }

        const orderNo = `${ORDER_PREFIX.ORDER}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const order = await Order.create({
          user_id: userId,
          order_no: orderNo,
          party_id: party_id,
          total_amount: totalAmount,
          discount_amount: 0,
          final_amount: totalAmount,
          payment_status: 0,
          status: 0,
          remark: orderData.remark
        }, { transaction: t });

        for (const item of orderItems) {
          await OrderItem.create({
            order_id: order.id,
            ticket_type_id: item.ticket_type_id,
            ticket_type_name: item.ticket_type_name,
            price: item.price,
            quantity: item.quantity,
            total_amount: item.total_amount
          }, { transaction: t });
        }

        return await this.getOrderById(order.id);
      });
    } catch (error) {
      logger.error('Create order failed:', error);
      throw error;
    }
  }

  calculateAge(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  async getOrderById(orderId) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: OrderItem,
            as: 'order_items',
            paranoid: false,
            required: false,
            include: [
              {
                model: TicketType,
                as: 'ticket_type',
                paranoid: false,
                required: false
              }
            ]
          },
          {
            model: Party,
            as: 'party',
            paranoid: false,
            required: false,
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar'],
                paranoid: false,
                required: false
              }
            ]
          },
          {
            model: Payment,
            as: 'payment',
            paranoid: false,
            required: false
          },
          {
            model: Refund,
            as: 'refunds',
            paranoid: false,
            required: false
          }
        ],
        paranoid: false
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const plainOrder = order.get({ plain: true });
      
      plainOrder.paidAt = plainOrder.payment_time;
      plainOrder.cancelledAt = plainOrder.cancel_time;
      plainOrder.refundedAt = plainOrder.refund_time || null;

      return plainOrder;
    } catch (error) {
      logger.error('Get order by ID failed:', error);
      throw error;
    }
  }

  async getOrderByOrderNo(orderNo) {
    try {
      const order = await Order.findOne({
        where: { order_no: orderNo },
        include: [
          {
            model: OrderItem,
            as: 'order_items',
            paranoid: false,
            required: false,
            include: [
              {
                model: TicketType,
                as: 'ticket_type',
                paranoid: false,
                required: false
              }
            ]
          },
          {
            model: Party,
            as: 'party',
            paranoid: false,
            required: false
          },
          {
            model: Payment,
            as: 'payment',
            paranoid: false,
            required: false
          }
        ],
        paranoid: false
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return toJSONSafe(order);
    } catch (error) {
      logger.error('Get order by order no failed:', error);
      throw error;
    }
  }

  async getOrderList(userId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (filters.user_id) {
        where.user_id = filters.user_id;
      }

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.payment_status !== undefined) {
        where.payment_status = filters.payment_status;
      }

      if (filters.party_id) {
        where.party_id = filters.party_id;
      }

      if (filters.keyword) {
        where.order_no = { [Op.like]: `%${filters.keyword}%` };
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time'],
            paranoid: false,
            required: false
          },
          {
            model: Payment,
            as: 'payment',
            paranoid: false,
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        paranoid: false
      });

      const orders = rows.map(order => {
        const plainOrder = order.get ? order.get({ plain: true }) : order;
        plainOrder.paidAt = plainOrder.payment_time;
        plainOrder.cancelledAt = plainOrder.cancel_time;
        plainOrder.refundedAt = plainOrder.refund_time || null;
        return plainOrder;
      });

      return {
        total: count,
        page,
        limit,
        data: orders
      };
    } catch (error) {
      logger.error('Get order list failed:', error);
      throw error;
    }
  }

  async cancelOrder(orderId, userId) {
    const TransactionManager = require('../utils/transactionManager');
    return await TransactionManager.execute(async (t) => {
      const order = await Order.findByPk(orderId, { transaction: t });
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // 只有待支付订单可以取消
      if (order.status !== 0 || order.payment_status !== 0) {
        throw new Error('Only pending orders can be cancelled');
      }

      order.status = 3;
      order.cancel_time = new Date();
      await order.save({ transaction: t });

      // 恢复票型库存
      const OrderItem = require('../models').OrderItem;
      const TicketType = require('../models').TicketType;
      const orderItems = await OrderItem.findAll({
        where: { order_id: orderId },
        transaction: t
      });

      for (const item of orderItems) {
        await TicketType.increment('sold_count', {
          by: -item.quantity,
          where: { id: item.ticket_type_id },
          transaction: t
        });
      }

      return await this.getOrderById(order.id);
    });
  }

  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;
      await order.save();

      return await this.getOrderById(order.id);
    } catch (error) {
      logger.error('Update order status failed:', error);
      throw error;
    }
  }

  async updatePaymentStatus(orderId, paymentStatus, transaction = null) {
    try {
      const options = transaction ? { transaction } : {};
      const order = await Order.findByPk(orderId, options);
      if (!order) {
        throw new Error('Order not found');
      }

      order.payment_status = paymentStatus;
      if (paymentStatus === 1) {
        order.status = 1;
        order.payment_time = new Date();
      }
      await order.save(options);

      return await this.getOrderById(order.id);
    } catch (error) {
      logger.error('Update payment status failed:', error);
      throw error;
    }
  }

  async applyRefund(orderId, userId, reason) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Party,
            as: 'party'
          }
        ]
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (order.status !== 1) {
        throw new Error('Order cannot be refunded');
      }

      const existingRefund = await Refund.findOne({
        where: {
          order_id: orderId,
          status: { [Op.in]: [0, 1] }
        }
      });

      if (existingRefund) {
        throw new Error('Refund already in progress');
      }

      const now = new Date();
      const partyEndTime = new Date(order.party.end_time);
      const hoursUntilEnd = Math.floor((partyEndTime - now) / (1000 * 60 * 60));

      if (hoursUntilEnd < 6) {
        throw new Error('Refund deadline has passed');
      }

      const refundNo = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const refund = await Refund.create({
        order_id: orderId,
        payment_id: order.payment_id,
        user_id: userId,
        refund_no: refundNo,
        amount: order.final_amount,
        reason: reason,
        status: 0,
        audit_status: 0
      });

      return refund;
    } catch (error) {
      logger.error('Apply refund failed:', error);
      throw error;
    }
  }

  async generateTickets(orderId) {
    try {
      const TransactionManager = require('../utils/transactionManager');
      
      return await TransactionManager.execute(async (t) => {
        const order = await Order.findByPk(orderId, {
          include: [
            {
              model: OrderItem,
              as: 'order_items'
            }
          ],
          transaction: t
        });

        if (!order) {
          throw new Error('Order not found');
        }

        if (order.status !== 1) {
          throw new Error('Order is not paid');
        }

        const party = await Party.findByPk(order.party_id, {
          transaction: t
        });

        for (const item of order.order_items) {
          for (let i = 0; i < item.quantity; i++) {
            const ticketCode = `${ORDER_PREFIX.TICKET}${Date.now()}${Math.floor(Math.random() * TICKET_CONSTANTS.TICKET_CODE_RANDOM_MAX)}`;
            await Ticket.create({
              user_id: order.user_id,
              order_id: order.id,
              ticket_type_id: item.ticket_type_id,
              party_id: order.party_id,
              ticket_code: ticketCode,
              status: 0,
              expires_at: party.end_time
            }, { transaction: t });
          }
          // 库存已在创建订单时扣减，这里不再重复扣减
        }

        await Party.increment('current_participants', {
          by: order.order_items.reduce((sum, item) => sum + item.quantity, 0),
          where: { id: order.party_id },
          transaction: t
        });

        return await this.getOrderById(order.id);
      });
    } catch (error) {
      logger.error('Generate tickets failed:', error);
      throw error;
    }
  }

  async getMyOrders(userId, page = 1, pageSize = 20, status) {
    try {
      const offset = (page - 1) * pageSize;
      const where = { user_id: userId };

      if (status !== undefined) {
        where.status = status;
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time'],
            paranoid: false,
            required: false
          },
          {
            model: Payment,
            as: 'payment',
            paranoid: false,
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        paranoid: false
      });

      return {
        total: count,
        page,
        pageSize,
        data: rows
      };
    } catch (error) {
      logger.error('Get my orders failed:', error);
      throw error;
    }
  }

  async getOrderStatistics(userId) {
    try {
      const totalOrders = await Order.count({
        where: { user_id: userId }
      });

      const paidOrders = await Order.count({
        where: {
          user_id: userId,
          payment_status: 1
        }
      });

      const totalAmount = await Order.sum('final_amount', {
        where: {
          user_id: userId,
          payment_status: 1
        }
      });

      const participatedParties = await Order.count({
        where: {
          user_id: userId,
          status: 1
        },
        distinct: true,
        col: 'party_id'
      });

      return {
        totalOrders,
        paidOrders,
        totalAmount: totalAmount || 0,
        participatedParties
      };
    } catch (error) {
      logger.error('Get order statistics failed:', error);
      throw error;
    }
  }

  async getPartyOrders(partyId, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Order.findAndCountAll({
        where: { party_id: partyId },
        offset,
        limit: pageSize,
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time']
          },
          {
            model: Payment,
            as: 'payment'
          },
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
      logger.error('Get party orders failed:', error);
      throw error;
    }
  }

  async getPartyOrderStatistics(partyId) {
    try {
      const party = await Party.findByPk(partyId);
      if (!party) {
        throw new Error('Party not found');
      }

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

      const totalParticipants = await Order.count({
        where: {
          party_id: partyId,
          status: 1
        },
        distinct: true,
        col: 'user_id'
      });

      return {
        partyId: party.id,
        partyTitle: party.title,
        totalOrders,
        paidOrders,
        totalRevenue: totalRevenue || 0,
        totalParticipants
      };
    } catch (error) {
      logger.error('Get party order statistics failed:', error);
      throw error;
    }
  }

  async payOrder(orderId, userId, paymentMethod, paymentPassword) {
    const TransactionManager = require('../utils/transactionManager');
    
    return await TransactionManager.execute(async (t) => {
      const order = await Order.findByPk(orderId, { transaction: t });
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (order.status !== 0) {
        throw new Error('Order cannot be paid');
      }

      if (paymentMethod === 'wallet') {
        const { Wallet, WalletTransaction } = require('../models');
        const wallet = await Wallet.findOne({
          where: { user_id: userId },
          transaction: t
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        if (wallet.balance < order.final_amount) {
          throw new Error('Insufficient balance');
        }

        const isPasswordValid = await wallet.verifyPassword(paymentPassword);
        if (!isPasswordValid) {
          throw new Error('Invalid payment password');
        }

        await Wallet.update(
          { balance: wallet.balance - order.final_amount },
          { where: { id: wallet.id }, transaction: t }
        );

        await WalletTransaction.create({
          user_id: userId,
          wallet_id: wallet.id,
          type: 'payment',
          amount: order.final_amount,
          balance: wallet.balance - order.final_amount,
          description: `支付订单 ${order.order_no}`,
          related_order_id: order.id,
          status: 1
        }, { transaction: t });

        await this.updatePaymentStatus(orderId, 1, t);
      } else {
        const { Payment } = require('../models');
        const paymentNo = `${ORDER_PREFIX.PAYMENT}${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await Payment.create({
          order_id: order.id,
          payment_no: paymentNo,
          payment_method: paymentMethod,
          amount: order.final_amount,
          status: 1,
          payment_time: new Date()
        }, { transaction: t });

        await this.updatePaymentStatus(orderId, 1, t);
      }

      return await this.getOrderById(orderId);
    });
  }

  async getOrderStats() {
    try {
      const totalOrders = await Order.count();
      const paidOrders = await Order.count({ where: { status: 1 } });
      const pendingOrders = await Order.count({ where: { status: 0 } });
      const completedOrders = await Order.count({ where: { status: 2 } });
      const cancelledOrders = await Order.count({ where: { status: 3 } });

      const totalRevenue = await Order.sum('final_amount', {
        where: { status: 1 }
      });

      const todayOrders = await Order.count({
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      const todayRevenue = await Order.sum('final_amount', {
        where: {
          status: 1,
          created_at: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      return {
        orders: {
          total: totalOrders,
          paid: paidOrders,
          pending: pendingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          today: todayOrders
        },
        revenue: {
          total: totalRevenue || 0,
          today: todayRevenue || 0
        }
      };
    } catch (error) {
      logger.error('Get order stats failed:', error);
      throw error;
    }
  }

  async searchOrders(keyword, page = 1, pageSize = 20) {
    try {
      const offset = (page - 1) * pageSize;
      const where = {};

      if (keyword) {
        where[Op.or] = [
          { order_no: { [Op.like]: `%${keyword}%` } },
          { user_id: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time']
          },
          {
            model: User,
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
      logger.error('Search orders failed:', error);
      throw error;
    }
  }

  async getOrderTickets(orderId) {
    try {
      const tickets = await Ticket.findAll({
        where: { order_id: orderId },
        include: [
          {
            model: TicketType,
            as: 'ticket_type',
            attributes: ['id', 'name', 'price']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return tickets;
    } catch (error) {
      logger.error('Get order tickets failed:', error);
      throw error;
    }
  }

  async getOrderRefund(orderId) {
    try {
      const refund = await Refund.findOne({
        where: { order_id: orderId },
        order: [['created_at', 'DESC']]
      });

      return refund;
    } catch (error) {
      logger.error('Get order refund failed:', error);
      throw error;
    }
  }

  async auditRefund(orderId, status, reason) {
    try {
      const refund = await Refund.findOne({
        where: { order_id: orderId }
      });

      if (!refund) {
        throw new Error('Refund not found');
      }

      refund.audit_status = status;
      refund.audit_reason = reason;
      refund.audit_time = new Date();
      await refund.save();

      return refund;
    } catch (error) {
      logger.error('Audit refund failed:', error);
      throw error;
    }
  }

  async batchExportOrders(ids) {
    try {
      const orders = await Order.findAll({
        where: {
          id: { [Op.in]: ids }
        },
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'start_time', 'end_time']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      worksheet.columns = [
        { header: '订单号', key: 'order_no' },
        { header: '用户', key: 'user.nickname' },
        { header: '聚会', key: 'party.title' },
        { header: '金额', key: 'final_amount' },
        { header: '状态', key: 'status' },
        { header: '支付状态', key: 'payment_status' },
        { header: '创建时间', key: 'created_at' }
      ];

      orders.forEach(order => {
        worksheet.addRow({
          order_no: order.order_no,
          'user.nickname': order.user ? order.user.nickname : '',
          'party.title': order.party ? order.party.title : '',
          final_amount: order.final_amount,
          status: order.status === 0 ? '待支付' : 
            order.status === 1 ? '已支付' : 
              order.status === 2 ? '已取消' : 
                order.status === 3 ? '已退款' : '未知',
          payment_status: order.payment_status === 0 ? '未支付' : '已支付',
          created_at: order.created_at
        });
      });

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Batch export orders failed:', error);
      throw error;
    }
  }

  async exportOrders(filters = {}) {
    try {
      const where = {};

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.payment_status !== undefined) {
        where.payment_status = filters.payment_status;
      }

      if (filters.keyword) {
        where[Op.or] = [
          { order_no: { [Op.like]: `%${filters.keyword}%` } },
          { user_id: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }

      const orders = await Order.findAll({
        where,
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'start_time', 'end_time']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      worksheet.columns = [
        { header: '订单号', key: 'order_no' },
        { header: '用户', key: 'user.nickname' },
        { header: '聚会', key: 'party.title' },
        { header: '金额', key: 'final_amount' },
        { header: '状态', key: 'status' },
        { header: '支付状态', key: 'payment_status' },
        { header: '创建时间', key: 'created_at' }
      ];

      orders.forEach(order => {
        worksheet.addRow({
          order_no: order.order_no,
          'user.nickname': order.user ? order.user.nickname : '',
          'party.title': order.party ? order.party.title : '',
          final_amount: order.final_amount,
          status: order.status === 0 ? '待支付' : order.status === 1 ? '已支付' : order.status === 2 ? '已完成' : order.status === 3 ? '已取消' : '已退款',
          payment_status: order.payment_status === 0 ? '未支付' : '已支付',
          created_at: order.created_at
        });
      });

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Export orders failed:', error);
      throw error;
    }
  }

  async createPayment(orderId, userId, paymentMethod, paymentPassword) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      if (order.status !== 0) {
        throw new Error('Order cannot be paid');
      }

      const { Payment } = require('../models');
      const paymentNo = `${ORDER_PREFIX.PAYMENT}${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const payment = await Payment.create({
        order_id: order.id,
        payment_no: paymentNo,
        payment_method: paymentMethod,
        amount: order.final_amount,
        status: 0,
        payment_time: null
      });

      logger.info('Payment created', { orderId, paymentId: payment.id });
      return payment;
    } catch (error) {
      logger.error('Create payment failed:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderId, userId) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const { Payment } = require('../models');
      const payment = await Payment.findOne({
        where: { order_id: orderId }
      });

      if (!payment) {
        return {
          status: 'not_created',
          paymentStatus: 0
        };
      }

      return {
        status: 'created',
        paymentId: payment.id,
        paymentNo: payment.payment_no,
        paymentMethod: payment.payment_method,
        amount: payment.amount,
        paymentStatus: payment.status,
        paymentTime: payment.payment_time
      };
    } catch (error) {
      logger.error('Get payment status failed:', error);
      throw error;
    }
  }

  async verifyPayment(orderId, userId, transactionId, paymentData) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const { Payment } = require('../models');
      const payment = await Payment.findOne({
        where: { order_id: orderId }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 1) {
        throw new Error('Payment already verified');
      }

      payment.transaction_id = transactionId;
      payment.channel_data = JSON.stringify(paymentData);
      payment.status = 1;
      payment.payment_time = new Date();
      await payment.save();

      await this.updatePaymentStatus(orderId, 1);

      logger.info('Payment verified', { orderId, paymentId: payment.id });
      return await this.getOrderById(orderId);
    } catch (error) {
      logger.error('Verify payment failed:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();
