const express = require('express');
const router = express.Router();
const miscController = require('../../controllers/miscController');
const { auth: authenticate } = require('../../middleware/auth');

router.get('/code', authenticate, miscController.getInviteCode);
router.post('/generate', authenticate, miscController.generateInviteCode);
router.post('/validate', miscController.validateInviteCode);
router.post('/use', authenticate, miscController.useInviteCode);
router.get('/stats', authenticate, miscController.getInviteStats);
router.get('/history', authenticate, miscController.getInviteHistory);
router.get('/rewards', authenticate, miscController.getInviteRewards);
router.post('/rewards/:id/claim', authenticate, miscController.claimReward);
router.post('/share', authenticate, miscController.shareInvite);

// 前端兼容性路由
router.post('/code', authenticate, miscController.generateInviteCode);  // 前端调用 POST /invite/code
router.get('/records', authenticate, miscController.getInviteHistory);  // 前端调用 GET /invite/records
router.get('/statistics', authenticate, miscController.getInviteStats);  // 前端调用 GET /invite/statistics

module.exports = router;
