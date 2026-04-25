const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/paymentController');
const { auth } = require('../../middleware/auth');
const { validateCreatePayment } = require('../../validators/paymentValidator');

router.post('/', auth, validateCreatePayment, paymentController.createPayment);
router.get('/:id', auth, paymentController.getPayment);
router.post('/wechat/notify', paymentController.wechatNotify);
router.post('/alipay/notify', paymentController.alipayNotify);

module.exports = router;
