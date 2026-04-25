const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { adminAuth } = require('../../middleware/auth');
const { validateUpdateOrderStatus } = require('../../validators/orderValidator');

router.get('/stats', adminAuth, orderController.getOrderStats);
router.get('/search', adminAuth, orderController.searchOrders);
router.get('/:id/tickets', adminAuth, orderController.getOrderTickets);
router.get('/:id/refund', adminAuth, orderController.getOrderRefund);
router.post('/:id/refund/audit', adminAuth, orderController.auditRefund);
router.post('/:id/cancel', adminAuth, orderController.cancelOrder);
router.get('/users/:userId', adminAuth, orderController.getUserOrders);
router.get('/parties/:partyId', adminAuth, orderController.getPartyOrders);
router.post('/batch/export', adminAuth, orderController.batchExportOrders);
router.get('/export', adminAuth, orderController.exportOrders);
router.get('/', adminAuth, orderController.getOrderList);
router.get('/:id', adminAuth, orderController.getOrderById);
router.put('/:id/status', adminAuth, validateUpdateOrderStatus, orderController.updateOrderStatus);
router.post('/:id/tickets', adminAuth, orderController.generateTickets);

module.exports = router;
