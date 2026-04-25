const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');
const { auth, adminAuth } = require('../../middleware/auth');

// User routes (without adminAuth)
router.post('/wechat', auth, paymentController.createWechatPayment);
router.get('/status/:paymentId', auth, paymentController.getPaymentStatus);
router.get('/', auth, paymentController.getUserPayments);
router.get('/stats', auth, paymentController.getPaymentStats);

// Admin routes
router.get('/admin', auth, adminAuth, paymentController.queryPayment);
router.get('/admin/:id', auth, adminAuth, paymentController.getPayment);

module.exports = router;
