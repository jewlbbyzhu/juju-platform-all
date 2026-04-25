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
router.post('/:id/refund', auth, strictLimiter, validateApplyRefund, orderController.applyRefund);
router.post('/:id/pay', auth, strictLimiter, orderController.payOrder);
router.post('/:id/payment', auth, strictLimiter, orderController.createPayment);
router.get('/:id/payment/status', auth, orderController.getPaymentStatus);
router.post('/:id/payment/verify', auth, strictLimiter, orderController.verifyPayment);

module.exports = router;
