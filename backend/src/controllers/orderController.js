const orderService = require('../services/orderService');
const logger = require('../utils/logger');
const { toJSONSafe } = require('../utils/circularRefCleaner');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      logger.error('Create order error:', error);
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      // 权限校验：非管理员只能查看自己的订单
      if (order && req.user.role !== 'admin' && order.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '无权查看该订单'
        });
      }
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Get order by ID error:', error);
      next(error);
    }
  }

  async getOrderByOrderNo(req, res, next) {
    try {
      const order = await orderService.getOrderByOrderNo(req.params.orderNo);
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      logger.error('Get order by order no error:', error);
      next(error);
    }
  }

  async getOrderList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        payment_status: req.query.payment_status ? parseInt(req.query.payment_status) : undefined,
        party_id: req.query.party_id ? parseInt(req.query.party_id) : undefined,
        keyword: req.query.keyword,
        user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined
      };

      // 管理员获取所有订单，普通用户只能查看自己的
      const userId = req.user && req.user.role === 'admin' ? null : req.user.id;
      // 安全校验：如果filters中传入了user_id，普通用户只能查看自己的
      if (filters.user_id && req.user.role !== 'admin' && filters.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '无权查看其他用户的订单'
        });
      }
      // 强制普通用户只能查看自己的订单
      if (req.user.role !== 'admin') {
        filters.user_id = req.user.id;
      }
      const result = await orderService.getOrderList(userId, page, limit, filters);
      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (error) {
      logger.error('Get order list error:', error);
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      logger.error('Cancel order error:', error);
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      logger.error('Update order status error:', error);
      next(error);
    }
  }

  async applyRefund(req, res, next) {
    try {
      const { reason } = req.body;
      const refund = await orderService.applyRefund(req.params.id, req.user.id, reason);
      res.json({
        success: true,
        message: 'Refund applied successfully',
        data: refund
      });
    } catch (error) {
      logger.error('Apply refund error:', error);
      if (error.message === 'Order not found' || error.message === 'Unauthorized') {
        return res.status(401).json({
          success: false,
          message: error.message,
          code: 'UNAUTHORIZED'
        });
      }
      next(error);
    }
  }

  async generateTickets(req, res, next) {
    try {
      const order = await orderService.generateTickets(req.params.id);
      res.json({
        success: true,
        message: 'Tickets generated successfully',
        data: order
      });
    } catch (error) {
      logger.error('Generate tickets error:', error);
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const status = req.query.status ? parseInt(req.query.status) : undefined;

      const result = await orderService.getMyOrders(req.user.id, page, pageSize, status);
      res.json({
        success: true,
        data: toJSONSafe(result)
      });
    } catch (error) {
      logger.error('Get my orders error:', error);
      next(error);
    }
  }

  async getOrderStatistics(req, res, next) {
    try {
      const statistics = await orderService.getOrderStatistics(req.user.id);
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Get order statistics error:', error);
      next(error);
    }
  }

  async getPartyOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const result = await orderService.getPartyOrders(req.params.partyId, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get party orders error:', error);
      next(error);
    }
  }

  async getPartyOrderStatistics(req, res, next) {
    try {
      const statistics = await orderService.getPartyOrderStatistics(req.params.partyId);
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Get party order statistics error:', error);
      next(error);
    }
  }

  async payOrder(req, res, next) {
    try {
      const { paymentMethod, paymentPassword } = req.body;
      const result = await orderService.payOrder(req.params.id, req.user.id, paymentMethod, paymentPassword);
      res.json({
        success: true,
        message: 'Payment successful',
        data: result
      });
    } catch (error) {
      logger.error('Pay order error:', error);
      next(error);
    }
  }

  async getOrderStats(req, res, next) {
    try {
      const stats = await orderService.getOrderStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get order stats error:', error);
      next(error);
    }
  }

  async searchOrders(req, res, next) {
    try {
      const { keyword, page = 1, pageSize = 20 } = req.query;
      const result = await orderService.searchOrders(keyword, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search orders error:', error);
      next(error);
    }
  }

  async getOrderTickets(req, res, next) {
    try {
      const tickets = await orderService.getOrderTickets(req.params.id);
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      logger.error('Get order tickets error:', error);
      next(error);
    }
  }

  async getOrderRefund(req, res, next) {
    try {
      const refund = await orderService.getOrderRefund(req.params.id);
      res.json({
        success: true,
        data: refund
      });
    } catch (error) {
      logger.error('Get order refund error:', error);
      next(error);
    }
  }

  async auditRefund(req, res, next) {
    try {
      const { status, reason } = req.body;
      const result = await orderService.auditRefund(req.params.id, status, reason);
      res.json({
        success: true,
        message: 'Refund audited successfully',
        data: result
      });
    } catch (error) {
      logger.error('Audit refund error:', error);
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, pageSize = 20 } = req.query;
      const result = await orderService.getUserOrders(userId, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user orders error:', error);
      next(error);
    }
  }

  async batchExportOrders(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await orderService.batchExportOrders(ids);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
      res.send(result);
    } catch (error) {
      logger.error('Batch export orders error:', error);
      next(error);
    }
  }

  async exportOrders(req, res, next) {
    try {
      const { status, payment_status, keyword } = req.query;
      const result = await orderService.exportOrders({ status, payment_status, keyword });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
      res.send(result);
    } catch (error) {
      logger.error('Export orders error:', error);
      next(error);
    }
  }

  async createPayment(req, res, next) {
    try {
      const { paymentMethod, paymentPassword } = req.body;
      const payment = await orderService.createPayment(req.params.id, req.user.id, paymentMethod, paymentPassword);
      res.json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      logger.error('Create payment error:', error);
      next(error);
    }
  }

  async getPaymentStatus(req, res, next) {
    try {
      const status = await orderService.getPaymentStatus(req.params.id, req.user.id);
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Get payment status error:', error);
      next(error);
    }
  }

  async verifyPayment(req, res, next) {
    try {
      const { transactionId, paymentData } = req.body;
      const result = await orderService.verifyPayment(req.params.id, req.user.id, transactionId, paymentData);
      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: result
      });
    } catch (error) {
      logger.error('Verify payment error:', error);
      next(error);
    }
  }
}

module.exports = new OrderController();
