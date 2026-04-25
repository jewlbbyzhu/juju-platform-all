const logger = require('../utils/logger');
const { Refund, Payment, Order } = require('../models');
const wechatPay = require('../config/wechatPay');
const alipay = require('../config/alipay');

/**
 * 退款服务类
 */
class RefundService {
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
