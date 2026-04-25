const express = require('express');
const router = express.Router();
const vipController = require('../../controllers/vipController');
const { auth: authenticate } = require('../../middleware/auth');

// VIP 套餐
router.get('/packages', vipController.getVipPackages);

// VIP 订阅（需要登录）
router.post('/subscribe', authenticate, vipController.subscribe);
router.get('/status', authenticate, vipController.getSubscriptionStatus);
router.get('/history', authenticate, vipController.getSubscriptionHistory);
router.post('/renew', authenticate, vipController.renewSubscription);
router.post('/cancel', authenticate, vipController.cancelSubscription);
router.post('/auto-renewal', authenticate, vipController.toggleAutoRenewal);

// VIP 权益
router.get('/benefits', vipController.getVipBenefits);

// VIP 专属活动
router.get('/events', vipController.getExclusiveEvents);
router.post('/events/:eventId/join', authenticate, vipController.joinVipEvent);
router.get('/events/:eventId', vipController.getVipEventDetail);

// VIP 等级
router.get('/levels', vipController.getVipLevels);
router.get('/levels/:levelId', vipController.getVipLevelDetail);

// VIP 成长值
router.get('/growth-records', authenticate, vipController.getGrowthRecords);

// VIP 优惠券
router.get('/coupons', authenticate, vipController.getVipCoupons);

module.exports = router;
