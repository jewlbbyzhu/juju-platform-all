const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth } = require('../../middleware/auth');
const { validateCreateOrder, validateCancelOrder, validateApplyRefund } = require('../../validators/orderValidator');
const { strictLimiter } = require('../../middleware/rateLimiter');

router.post('/', auth, validateCreateOrder, orderController.createOrder);
router.get('/', auth, orderController.getOrderList);
router.get('/my', auth, orderController.getMyOrders);
router.get('/statistics', auth, orderController.getOrderStatistics);
router.get('/party/:partyId', auth, orderController.getPartyOrders);
router.get('/party/:partyId/statistics', auth, orderController.getPartyOrderStatistics);
router.get('/:id', auth, orderController.getOrderById);
router.get('/no/:orderNo', auth, orderController.getOrderByOrderNo);
router.patch('/:id', auth, validateCancelOrder, orderController.cancelOrder);
router.put('/:id/cancel', auth, validateCancelOrder, orderController.cancelOrder);

// 前端兼容性路由 - POST /orders/:id/cancel (前端使用POST而非PATCH/PUT)
router.post('/:id/cancel', auth, validateCancelOrder, orderController.cancelOrder);

router.post('/:id/refund', auth, strictLimiter, validateApplyRefund, orderController.applyRefund);
router.post('/:id/pay', auth, strictLimiter, orderController.payOrder);
router.post('/:id/payment', auth, strictLimiter, orderController.createPayment);
router.get('/:id/payment/status', auth, orderController.getPaymentStatus);
router.post('/:id/payment/verify', auth, strictLimiter, orderController.verifyPayment);

// 前端兼容性路由 - GET /orders/:id/payment-status 映射到 getPaymentStatus
router.get('/:id/payment-status', auth, orderController.getPaymentStatus);

// 前端兼容性路由 - GET /orders/stats 映射到 getOrderStatistics
router.get('/stats', auth, orderController.getOrderStatistics);

// 前端兼容性路由 - GET /orders/:id/tickets 获取订单的票券列表
router.get('/:id/tickets', auth, async (req, res, next) => {
  try {
    const { Ticket } = require('../../models');
    const tickets = await Ticket.findAll({
      where: { order_id: req.params.id },
      order: [['created_at', 'DESC']]
    });
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
