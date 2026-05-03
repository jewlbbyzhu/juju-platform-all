const logger = require('../utils/logger');
const { Payment, Order } = require('../models');
const wechatPay = require('../config/wechatPay');
const alipay = require('../config/alipay');

/**
 * 支付服务类
 */
class PaymentService {
  /**
   * 创建支付订单
   */
  async createPayment(orderId, paymentMethod, userId) {
    try {
      logger.info('创建支付订单:', { userId, orderId, paymentMethod });

      // 检查订单是否存在
      const order = await Order.findByPk(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // 检查订单是否已支付
      if (order.payment_status === 1 || order.payment_status === 'paid') {
        throw new Error('Order already paid');
      }

      // 检查是否已有支付记录
      let payment = await Payment.findOne({
        where: { order_id: orderId, status: 'pending' }
      });

      if (payment) {
        return payment;
      }

      // 创建支付记录
      payment = await Payment.create({
        user_id: userId,
        order_id: orderId,
        payment_method: paymentMethod,
        amount: order.amount || order.final_amount,
        status: 'pending',
        created_at: new Date()
      });

      return payment;
    } catch (error) {
      logger.error('创建支付订单失败:', error);
      throw error;
    }
  }

  /**
   * 处理微信支付
   */
  async processWechatPayment(payment, openid) {
    try {
      logger.info('处理微信支付:', { paymentId: payment.id, openid });

      const paymentResult = await wechatPay.createOrder({
        out_trade_no: payment.id.toString(),
        total_fee: payment.amount * 100, // 转换为分
        body: `订单支付-${payment.order_id}`,
        openid
      });

      return {
        id: payment.id,
        prepay_id: paymentResult.prepay_id,
        payment,
        ...paymentResult
      };
    } catch (error) {
      logger.error('处理微信支付失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付宝支付
   */
  async processAlipayPayment(payment, userId) {
    try {
      logger.info('处理支付宝支付:', { paymentId: payment.id, userId });

      const paymentResult = await alipay.createOrder({
        out_trade_no: payment.id.toString(),
        total_amount: payment.amount,
        subject: `订单支付-${payment.order_id}`
      });

      return {
        id: payment.id,
        payment,
        payment_url: paymentResult.payment_url
      };
    } catch (error) {
      logger.error('处理支付宝支付失败:', error);
      throw error;
    }
  }

  /**
   * 处理钱包支付
   */
  async processWalletPayment(payment, userId) {
    try {
      logger.info('处理钱包支付:', { paymentId: payment.id, userId });

      const { Wallet } = require('../models');
      const wallet = await Wallet.findOne({ where: { user_id: userId } });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const amount = parseFloat(payment.amount);
      if (parseFloat(wallet.balance) < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // 扣除余额
      wallet.balance = parseFloat(wallet.balance) - amount;
      await wallet.save();

      // 更新支付状态
      payment.status = 'completed';
      payment.paid_at = new Date();
      await payment.save();

      // 更新订单状态
      const order = await Order.findByPk(payment.order_id);
      if (order) {
        order.status = 'paid';
        order.paid_at = new Date();
        await order.save();
      }

      return {
        payment,
        wallet: { id: userId, balance: wallet.balance }
      };
    } catch (error) {
      logger.error('处理钱包支付失败:', error);
      throw error;
    }
  }

  /**
   * 查询支付（供 controller 使用）
   */
  async queryPayment(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      return payment;
    } catch (error) {
      logger.error('查询支付失败:', error);
      throw error;
    }
  }

  /**
   * 处理微信回调通知
   */
  async handleWechatNotify(callbackData) {
    try {
      logger.info('处理微信回调:', callbackData);

      const isValid = wechatPay.verifySign(callbackData, callbackData.sign);
      if (!isValid) {
        throw new Error('签名验证失败');
      }

      const paymentId = callbackData.out_trade_no;
      const payment = await Payment.findByPk(paymentId);
      
      if (payment) {
        payment.status = 'completed';
        payment.paid_at = new Date();
        payment.transaction_id = callbackData.transaction_id;
        await payment.save();

        const order = await Order.findByPk(payment.order_id);
        if (order) {
          order.status = 'paid';
          order.paid_at = new Date();
          await order.save();
        }
      }

      return '<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>';
    } catch (error) {
      logger.error('处理微信回调失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付宝回调通知
   */
  async handleAlipayNotify(callbackData) {
    try {
      logger.info('处理支付宝回调:', callbackData);

      const isValid = alipay.verifyNotify(callbackData);
      if (!isValid) {
        throw new Error('签名验证失败');
      }

      const paymentId = callbackData.out_trade_no;
      const payment = await Payment.findByPk(paymentId);
      
      if (payment) {
        payment.status = 'completed';
        payment.paid_at = new Date();
        payment.transaction_id = callbackData.trade_no;
        await payment.save();

        const order = await Order.findByPk(payment.order_id);
        if (order) {
          order.status = 'paid';
          order.paid_at = new Date();
          await order.save();
        }
      }

      return 'success';
    } catch (error) {
      logger.error('处理支付宝回调失败:', error);
      throw error;
    }
  }

  /**
   * 获取支付统计
   */
  async getPaymentStats(userId) {
    try {
      const { count, rows } = await Payment.findAndCountAll({
        where: { user_id: userId }
      });

      const completedPayments = rows.filter(p => p.status === 'completed');
      const failedPayments = rows.filter(p => p.status === 'failed');

      const totalAmount = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      return {
        totalAmount,
        totalCount: count,
        successCount: completedPayments.length,
        failedCount: failedPayments.length
      };
    } catch (error) {
      logger.error('获取支付统计失败:', error);
      throw error;
    }
  }

  /**
   * 查询支付状态
   */
  async queryPaymentStatus(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      // 如果已经支付完成，直接返回
      if (payment.status === 'completed') {
        return { status: 'completed', payment };
      }

      // 查询第三方支付状态
      let queryResult;
      if (payment.payment_method === 'wechat') {
        queryResult = await wechatPay.queryOrder(paymentId.toString());
      } else if (payment.payment_method === 'alipay') {
        queryResult = await alipay.queryOrder(paymentId.toString());
      }

      // 更新本地支付状态
      if (queryResult && queryResult.tradeState === 'SUCCESS') {
        payment.status = 'completed';
        payment.paid_at = new Date();
        await payment.save();
      }

      return { status: payment.status, payment };
    } catch (error) {
      logger.error('查询支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付回调
   */
  async handlePaymentCallback(paymentMethod, callbackData) {
    try {
      logger.info('处理支付回调:', { paymentMethod, callbackData });

      let isValid = false;
      let paymentId;

      if (paymentMethod === 'wechat') {
        isValid = wechatPay.verifySign(callbackData, callbackData.sign);
        paymentId = callbackData.out_trade_no;
      } else if (paymentMethod === 'alipay') {
        isValid = alipay.verifyNotify(callbackData);
        paymentId = callbackData.out_trade_no;
      }

      if (!isValid) {
        throw new Error('签名验证失败');
      }

      // 签名验证通过后，才更新支付状态
      const payment = await Payment.findByPk(paymentId);
      if (payment) {
        payment.status = 'completed';
        payment.paid_at = new Date();
        payment.transaction_id = callbackData.transaction_id || callbackData.trade_no;
        await payment.save();

        // 更新订单状态
        const order = await Order.findByPk(payment.order_id);
        if (order) {
          order.status = 'paid';
          order.paid_at = new Date();
          await order.save();
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('处理支付回调失败:', error);
      throw error;
    }
  }

  /**
   * 更新支付状态
   */
  async updatePaymentStatus(paymentId, status, transactionId = null) {
    try {
      logger.info('更新支付状态:', { paymentId, status, transactionId });

      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.status = status;
      if (transactionId) {
        payment.transaction_id = transactionId;
      }
      
      // Add payment_time when status is completed
      if (status === 1 || status === 'completed') {
        payment.payment_time = new Date();
      }
      
      await payment.save();

      return payment;
    } catch (error) {
      logger.error('更新支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 关闭支付订单
   */
  async closePayment(paymentId) {
    try {
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      if (payment.payment_method === 'wechat') {
        await wechatPay.closeOrder(paymentId.toString());
      } else if (payment.payment_method === 'alipay') {
        await alipay.closeOrder(paymentId.toString());
      }

      payment.status = 'closed';
      await payment.save();

      return { success: true };
    } catch (error) {
      logger.error('关闭支付订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户支付记录
   */
  async getUserPayments(userId, page = 1, pageSize = 20) {
    try {
      const { count, rows } = await Payment.findAndCountAll({
        where: { user_id: userId },
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
      logger.error('获取用户支付记录失败:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
