const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

class PaymentController {
  async getPaymentConfig(req, res, next) {
    try {
      const config = {
        wechat: { enabled: true, appId: process.env.WECHAT_APPID || '' },
        alipay: { enabled: true, appId: process.env.ALIPAY_APPID || '' },
        wallet: { enabled: true }
      };
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Get payment config error:', error);
      next(error);
    }
  }

  async getPaymentMethods(req, res, next) {
    try {
      const methods = [
        { id: 'wechat', name: '微信支付', icon: 'wechat-pay', enabled: true },
        { id: 'alipay', name: '支付宝', icon: 'alipay', enabled: true },
        { id: 'wallet', name: '余额支付', icon: 'wallet', enabled: true }
      ];
      res.json({
        success: true,
        data: methods
      });
    } catch (error) {
      logger.error('Get payment methods error:', error);
      next(error);
    }
  }

  async createPayment(req, res, next) {
    try {
      const { order_id, payment_method } = req.body;
      const payment = await paymentService.createPayment(order_id, payment_method, req.user.id);

      let result;
      if (payment_method === 'wechat') {
        result = await paymentService.processWechatPayment(payment, req.user.openid);
      } else if (payment_method === 'alipay') {
        result = await paymentService.processAlipayPayment(payment, req.user.id);
      } else if (payment_method === 'wallet') {
        result = await paymentService.processWalletPayment(payment, req.user.id);
      } else {
        throw new Error('Invalid payment method');
      }

      res.json({
        success: true,
        message: 'Payment created successfully',
        data: result
      });
    } catch (error) {
      logger.error('Create payment error:', error);
      next(error);
    }
  }

  async getPayment(req, res, next) {
    try {
      const payment = await paymentService.queryPayment(req.params.id);
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Get payment error:', error);
      next(error);
    }
  }

  async wechatNotify(req, res, next) {
    try {
      const result = await paymentService.handleWechatNotify(req.body);
      res.type('application/xml').send(result);
    } catch (error) {
      logger.error('Wechat notify error:', error);
      next(error);
    }
  }

  async alipayNotify(req, res, next) {
    try {
      const result = await paymentService.handleAlipayNotify(req.body);
      res.send(result);
    } catch (error) {
      logger.error('Alipay notify error:', error);
      next(error);
    }
  }

  async queryPayment(req, res, next) {
    try {
      const payment = await paymentService.queryPayment(req.params.id);
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      logger.error('Query payment error:', error);
      next(error);
    }
  }

  async createWechatPayment(req, res, next) {
    try {
      const { orderId, amount, description } = req.body;
      const payment = await paymentService.createPayment(orderId, 'wechat', req.user.id);
      const result = await paymentService.processWechatPayment(payment, req.user.openid);
      
      res.json({
        success: true,
        message: 'WeChat payment created successfully',
        data: {
          paymentId: result.id,
          prepayId: result.prepay_id,
          orderId,
          amount,
          description
        }
      });
    } catch (error) {
      logger.error('Create WeChat payment error:', error);
      next(error);
    }
  }

  async getPaymentStatus(req, res, next) {
    try {
      const paymentId = req.params.paymentId;
      const payment = await paymentService.queryPayment(paymentId);
      
      res.json({
        success: true,
        data: {
          status: payment.status,
          paymentId: payment.id,
          amount: payment.amount,
          paymentMethod: payment.payment_method
        }
      });
    } catch (error) {
      logger.error('Get payment status error:', error);
      next(error);
    }
  }

  async getUserPayments(req, res, next) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const { count, rows } = await paymentService.getUserPayments(req.user.id, page, pageSize);
      
      res.json({
        success: true,
        data: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          data: rows
        }
      });
    } catch (error) {
      logger.error('Get user payments error:', error);
      next(error);
    }
  }

  async getPaymentStats(req, res, next) {
    try {
      const stats = await paymentService.getPaymentStats(req.user.id);
      
      res.json({
        success: true,
        data: {
          totalAmount: stats.totalAmount || 0,
          totalCount: stats.totalCount || 0,
          successCount: stats.successCount || 0,
          failedCount: stats.failedCount || 0
        }
      });
    } catch (error) {
      logger.error('Get payment stats error:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();
