const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');
const { auth } = require('../../middleware/auth');
const { validateCreatePayment } = require('../../validators/paymentValidator');

// 获取支付方式列表
router.get('/methods', auth, paymentController.getPaymentMethods);

// 获取支付配置
router.get('/config', auth, paymentController.getPaymentConfig);

router.post('/', auth, validateCreatePayment, paymentController.createPayment);
router.get('/:id', auth, paymentController.getPayment);
router.post('/wechat/notify', paymentController.wechatNotify);
router.post('/alipay/notify', paymentController.alipayNotify);

module.exports = router;
