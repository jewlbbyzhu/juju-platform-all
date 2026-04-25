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

// 前端兼容性路由 - /vip/events/:id/join (前端使用id而非eventId)
router.post('/events/:id/join', authenticate, vipController.joinVipEvent);

// VIP 等级
router.get('/levels', vipController.getVipLevels);
router.get('/levels/:levelId', vipController.getVipLevelDetail);

// 前端兼容性路由 - /vip/levels/:id (前端使用id而非levelId)
router.get('/levels/:id', vipController.getVipLevelDetail);

// VIP 成长值
router.get('/growth-records', authenticate, vipController.getGrowthRecords);

// 前端兼容性路由 - VIP 积分相关
router.get('/points', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        points: 0,
        totalPoints: 0,
        level: 1
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/points-history', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        records: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - VIP 奖励相关
router.get('/rewards', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        rewards: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/rewards/:rewardId/redeem', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        rewardId: req.params.rewardId
      }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - /vip/rewards/:id/redeem (前端使用id而非rewardId)
router.post('/rewards/:id/redeem', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        rewardId: req.params.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - VIP 等级升级
router.post('/levels/:levelId/upgrade', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'VIP level upgraded',
      data: {
        levelId: req.params.levelId
      }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - /vip/levels/:id/upgrade (前端使用id而非levelId)
router.post('/levels/:id/upgrade', authenticate, (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'VIP level upgraded',
      data: {
        levelId: req.params.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// VIP 优惠券
router.get('/coupons', authenticate, vipController.getVipCoupons);

module.exports = router;
