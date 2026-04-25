const express = require('express');
const router = express.Router();
const miscController = require('../../controllers/miscController');
const { auth: authenticate } = require('../../middleware/auth');

router.post('/verify', authenticate, miscController.scanQRCode);
router.get('/history', authenticate, miscController.getScanHistory);
router.get('/stats', authenticate, miscController.getScanStats);
router.get('/:id', authenticate, miscController.getScanDetail);

// 前端兼容性路由 - 票券扫码验证
router.post('/ticket', authenticate, async (req, res, next) => {
  try {
    const { qrcode } = req.body;
    // 调用现有的扫码逻辑
    req.body.code = qrcode;
    req.body.type = 'ticket';
    return miscController.scanQRCode(req, res);
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - 使用票券
router.post('/ticket/use', authenticate, async (req, res, next) => {
  try {
    const { qrcode } = req.body;
    // 临时实现 - 标记票券为已使用
    res.json({
      success: true,
      message: 'Ticket used successfully',
      data: { qrcode, usedAt: new Date() }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - 保存扫码记录
router.post('/record', authenticate, async (req, res, next) => {
  try {
    // 临时实现 - 返回成功
    res.json({
      success: true,
      message: 'Scan record saved',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - 清空扫码历史
router.delete('/history', authenticate, async (req, res, next) => {
  try {
    const { ScanRecord } = require('../../models');
    await ScanRecord.destroy({ where: { user_id: req.user.id } });
    res.json({
      success: true,
      message: 'Scan history cleared'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
