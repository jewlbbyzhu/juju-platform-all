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

module.exports = router;
