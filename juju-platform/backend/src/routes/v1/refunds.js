const express = require('express');
const router = express.Router();
const refundController = require('../../controllers/refundController');
const { auth } = require('../../middleware/auth');

router.get('/', auth, refundController.getRefundList);
router.get('/stats', auth, refundController.getRefundStats);
router.get('/:id', auth, refundController.getRefund);
router.get('/refund-no/:refundNo', auth, refundController.getRefundByRefundNo);

module.exports = router;
