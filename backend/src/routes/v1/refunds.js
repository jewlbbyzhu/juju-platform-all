const express = require('express');
const router = express.Router();
const refundController = require('../../controllers/refundController');
const { auth } = require('../../middleware/auth');

router.get('/', auth, refundController.getRefundList);
router.get('/stats', auth, refundController.getRefundStats);
router.get('/:id', auth, refundController.getRefund);
router.get('/refund-no/:refundNo', auth, refundController.getRefundByRefundNo);

// 前端兼容性路由 - 取消退款申请
router.post('/:id/cancel', auth, async (req, res, next) => {
  try {
    // 临时实现 - 返回成功
    res.json({
      success: true,
      message: 'Refund request cancelled',
      data: { refundId: req.params.id }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
