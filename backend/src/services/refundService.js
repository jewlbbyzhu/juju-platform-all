const logger = require('../utils/logger');
const { Refund, Payment, Order } = require('../models');
const wechatPay = require('../config/wechatPay');
const alipay = require('../config/alipay');

/**
 * 退款服务类
 */
class RefundService {
  /**
   * 获取退款列表
   */
  async getRefundList(userId, page = 1, pageSize = 20, filters = {}) {
    try {
      const { Refund, Payment, Order } = require('../models');
      const { Op } = require('sequelize');
      
      const where = { user_id: userId };
      if (filters.status !== undefined) {
        where.status = filters.status;
      }
      if (filters.keyword) {
        where[Op.or] = [
          { reason: { [Op.like]: `%${filters.keyword}%` } },
          { refund_no: { [Op.like]: `%${filters.keyword}%` } }
        ];
      }
      
      const { count, rows } = await Refund.findAndCountAll({
        where,
        include: [
          { model: Payment, as: 'payment', attributes: ['id', 'payment_method', 'amount'] },
          { model: Order, as: 'order', attributes: ['id', 'order_no', 'status'] }
        ],
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: pageSize
      });
      
      return {
        list: rows,
        total: count,
        page,
        pageSize
      };
    } catch (error) {
      logger.error('获取退款列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取退款统计
   */
  async getRefundStats(userId) {
    try {
      const { Refund } = require('../models');
      const { Op } = require('sequelize');
      
      const totalCount = await Refund.count({ where: { user_id: userId } });
      const pendingCount = await Refund.count({ where: { user_id: userId, status: 0 } });
      const completedCount = await Refund.count({ where: { user_id: userId, status: 2 } });
      const failedCount = await Refund.count({ where: { user_id: userId, status: 3 } });
      
      const totalAmount = await Refund.sum('amount', { where: { user_id: userId, status: 2 } }) || 0;
      
      return {
        totalCount,
        pendingCount,
        completedCount,
        failedCount,
        totalAmount
      };
    } catch (error) {
      logger.error('获取退款统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取退款详情
   */
  async getRefundById(refundId) {
    try {
      const { Refund, Payment, Order } = require('../models');
      const refund = await Refund.findByPk(refundId, {
        include: [
          { model: Payment, as: 'payment' },
          { model: Order, as: 'order' }
        ]
      });
      if (!refund) {
        throw new Error('退款记录不存在');
      }
      return refund;
    } catch (error) {
      logger.error('获取退款详情失败:', error);
      throw error;
    }
  }

  /**
   * 根据退款单号获取退款
   */
  async getRefundByRefundNo(refundNo) {
    try {
      const { Refund, Payment, Order } = require('../models');
      const refund = await Refund.findOne({
        where: { refund_no: refundNo },
        include: [
          { model: Payment, as: 'payment' },
          { model: Order, as: 'order' }
        ]
      });
      if (!refund) {
        throw new Error('退款记录不存在');
      }
      return refund;
    } catch (error) {
      logger.error('根据退款单号获取退款失败:', error);
      throw error;
    }
  }

  /**
   * 审核退款
   */
  async auditRefund(refundId, auditStatus, auditReason = '') {
    try {
      const { Refund, Order, Payment, Wallet, WalletTransaction } = require('../models');
      const TransactionManager = require('../utils/transactionManager');
      
      return await TransactionManager.execute(async (t) => {
        const refund = await Refund.findByPk(refundId, {
          transaction: t,
          include: [
            { model: Order, as: 'order' },
            { model: Payment, as: 'payment' }
          ]
        });
        
        if (!refund) {
          throw new Error('退款记录不存在');
        }
        
        // 更新审核状态
        refund.audit_status = auditStatus;
        refund.audit_reason = auditReason;
        refund.audit_time = new Date();
        
        if (auditStatus === 1) {
          // 审核通过 - 执行退款
          refund.status = 1; // 处理中
          await refund.save({ transaction: t });
          
          // 调用第三方支付退款接口
          let refundResult;
          if (refund.payment && refund.payment.payment_method === 'wechat') {
            refundResult = await wechatPay.refund({
              out_refund_no: refund.refund_no,
              out_trade_no: refund.payment_id.toString(),
              total_fee: parseFloat(refund.payment.amount) * 100,
              refund_fee: parseFloat(refund.amount) * 100,
              refund_desc: refund.reason
            });
          } else if (refund.payment && refund.payment.payment_method === 'alipay') {
            refundResult = await alipay.refund({
              out_trade_no: refund.payment_id.toString(),
              refund_amount: parseFloat(refund.amount),
              refund_reason: refund.reason,
              out_request_no: refund.refund_no
            });
          } else if (refund.payment && refund.payment.payment_method === 'wallet') {
            // 钱包支付 - 直接退回余额
            const wallet = await Wallet.findOne({
              where: { user_id: refund.user_id },
              transaction: t
            });
            
            if (wallet) {
              const newBalance = parseFloat(wallet.balance) + parseFloat(refund.amount);
              await Wallet.update(
                { balance: newBalance },
                { where: { id: wallet.id }, transaction: t }
              );
              
              await WalletTransaction.create({
                user_id: refund.user_id,
                wallet_id: wallet.id,
                type: 'refund',
                amount: parseFloat(refund.amount),
                balance: newBalance,
                description: `订单退款 ${refund.order ? refund.order.order_no : ''}`,
                related_order_id: refund.order_id,
                status: 1
              }, { transaction: t });
            }
            
            refundResult = { success: true };
          } else {
            throw new Error('不支持的支付方式');
          }
          
          // 更新退款状态为成功
          refund.status = 2;
          refund.refund_time = new Date();
          await refund.save({ transaction: t });
          
          // 更新订单状态
          if (refund.order) {
            refund.order.status = 3; // 已退款
            refund.order.refund_time = new Date();
            await refund.order.save({ transaction: t });
          }
          
          // 更新支付记录
          if (refund.payment) {
            refund.payment.status = 3; // 已退款
            await refund.payment.save({ transaction: t });
          }
          
        } else if (auditStatus === 2) {
          // 审核拒绝
          refund.status = 3; // 退款失败
          await refund.save({ transaction: t });
        }
        
        return refund;
      });
    } catch (error) {
      logger.error('审核退款失败:', error);
      throw error;
    }
  }

  /**
   * 处理退款
   */
  async processRefund(refundId) {
    try {
      const { Refund } = require('../models');
      const refund = await Refund.findByPk(refundId);
      if (!refund) {
        throw new Error('退款记录不存在');
      }
      
      // 模拟处理退款
      refund.status = 2; // 成功
      refund.refund_time = new Date();
      await refund.save();
      
      return refund;
    } catch (error) {
      logger.error('处理退款失败:', error);
      throw error;
    }
  }

  /**
   * 申请退款
   */
  async createRefund(userId, paymentId, amount, reason) {
    try {
      logger.info('申请退款:', { userId, paymentId, amount, reason });

      // 检查支付记录是否存在
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 检查支付状态
      if (payment.status !== 'completed') {
        throw new Error('只有已完成的支付才能退款');
      }

      // 检查是否已退款
      const existingRefund = await Refund.findOne({
        where: { payment_id: paymentId, status: 'completed' }
      });
      if (existingRefund) {
        throw new Error('该支付已退款');
      }

      // 创建退款记录
      const refund = await Refund.create({
        user_id: userId,
        payment_id: paymentId,
        order_id: payment.order_id,
        amount: amount,
        reason: reason,
        status: 'pending',
        created_at: new Date()
      });

      // 调用第三方支付退款接口
      let refundResult;
      if (payment.payment_method === 'wechat') {
        refundResult = await wechatPay.refund({
          out_refund_no: refund.id.toString(),
          out_trade_no: paymentId.toString(),
          total_fee: payment.amount * 100,
          refund_fee: amount * 100,
          refund_desc: reason
        });
      } else if (payment.payment_method === 'alipay') {
        refundResult = await alipay.refund({
          out_trade_no: paymentId.toString(),
          refund_amount: amount,
          refund_reason: reason,
          out_request_no: refund.id.toString()
        });
      } else {
        throw new Error('不支持的支付方式');
      }

      // 更新退款记录
      refund.status = 'completed';
      refund.refund_no = refundResult.refundId || refundResult.refund_id;
      refund.completed_at = new Date();
      await refund.save();

      // 更新支付记录
      payment.refund_amount = (payment.refund_amount || 0) + amount;
      if (payment.refund_amount >= payment.amount) {
        payment.status = 'refunded';
      }
      await payment.save();

      // 更新订单状态
      const order = await Order.findByPk(payment.order_id);
      if (order) {
        order.refund_amount = (order.refund_amount || 0) + amount;
        if (order.refund_amount >= order.total_amount) {
          order.status = 'refunded';
        }
        await order.save();
      }

      return {
        refundId: refund.id,
        status: 'completed',
        amount: amount
      };
    } catch (error) {
      logger.error('申请退款失败:', error);
      throw error;
    }
  }

  /**
   * 查询退款状态
   */
  async queryRefundStatus(refundId) {
    try {
      const refund = await Refund.findByPk(refundId, {
        include: [{ model: Payment, as: 'payment' }]
      });

      if (!refund) {
        throw new Error('退款记录不存在');
      }

      // 如果退款已完成或失败，直接返回
      if (refund.status !== 'pending') {
        return { status: refund.status, refund };
      }

      // 查询第三方支付退款状态
      let queryResult;
      if (refund.payment.payment_method === 'wechat') {
        queryResult = await wechatPay.queryRefund(refundId.toString());
      } else if (refund.payment.payment_method === 'alipay') {
        queryResult = await alipay.queryRefund(
          refund.payment_id.toString(),
          refundId.toString()
        );
      }

      // 更新退款状态
      if (queryResult) {
        if (queryResult.refundStatus === 'SUCCESS') {
          refund.status = 'completed';
          refund.completed_at = new Date();
        } else if (queryResult.refundStatus === 'FAIL') {
          refund.status = 'failed';
        }
        await refund.save();
      }

      return { status: refund.status, refund };
    } catch (error) {
      logger.error('查询退款状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户退款记录
   */
  async getUserRefunds(userId, page = 1, pageSize = 20) {
    try {
      const { count, rows } = await Refund.findAndCountAll({
        where: { user_id: userId },
        include: [{ model: Payment, as: 'payment' }],
        order: [['created_at', 'DESC']],
        offset: (page - 1) * pageSize,
        limit: pageSize
      });

      return {
        list: rows,
        total: count,
        page,
        pageSize
      };
    } catch (error) {
      logger.error('获取用户退款记录失败:', error);
      throw error;
    }
  }

  /**
   * 处理退款回调
   */
  async handleRefundCallback(paymentMethod, callbackData) {
    try {
      logger.info('处理退款回调:', { paymentMethod, callbackData });

      const refundId = callbackData.out_refund_no;
      const refund = await Refund.findByPk(refundId);

      if (!refund) {
        throw new Error('退款记录不存在');
      }

      // 更新退款状态
      if (callbackData.refund_status === 'SUCCESS') {
        refund.status = 'completed';
        refund.completed_at = new Date();
      } else if (callbackData.refund_status === 'FAIL') {
        refund.status = 'failed';
        refund.fail_reason = callbackData.err_code_des || callbackData.sub_msg;
      }

      await refund.save();

      return { success: true };
    } catch (error) {
      logger.error('处理退款回调失败:', error);
      throw error;
    }
  }
}

module.exports = new RefundService();
