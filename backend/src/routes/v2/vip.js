const express = require('express');
const router = express.Router();
const vipController = require('../../controllers/vipController');
const { auth, adminAuth } = require('../../middleware/auth');

// User routes
router.get('/packages', auth, vipController.getVipPackages);
router.post('/subscribe', auth, vipController.subscribe);
router.get('/status', auth, vipController.getSubscriptionStatus);
router.get('/subscription/history', auth, vipController.getSubscriptionHistory);
router.post('/renew', auth, vipController.renewSubscription);
router.post('/cancel', auth, vipController.cancelSubscription);
router.post('/auto-renewal', auth, vipController.toggleAutoRenewal);
router.get('/benefits', auth, vipController.getVipBenefits);
router.get('/events', auth, vipController.getExclusiveEvents);
router.post('/events/:id/join', auth, vipController.joinVipEvent);
router.get('/events/:id', auth, vipController.getVipEventDetail);
router.get('/levels', auth, vipController.getVipLevels);
router.get('/levels/:id', auth, vipController.getVipLevelDetail);
router.get('/growth-records', auth, vipController.getGrowthRecords);
router.get('/coupons', auth, vipController.getVipCoupons);

// Admin routes
router.get('/history', auth, adminAuth, vipController.getVipHistory);

module.exports = router;
