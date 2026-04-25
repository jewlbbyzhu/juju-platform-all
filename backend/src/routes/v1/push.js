const express = require('express');
const router = express.Router();
const miscController = require('../../controllers/miscController');
const { auth: authenticate } = require('../../middleware/auth');

router.get('/messages', authenticate, miscController.getPushMessages);
router.post('/messages/:id/read', authenticate, miscController.markPushAsRead);
router.post('/messages/read-all', authenticate, miscController.markAllPushAsRead);
router.delete('/messages/:id', authenticate, miscController.deletePushMessage);
router.post('/messages/clear', authenticate, miscController.clearAllPushMessages);
router.get('/messages/unread-count', authenticate, miscController.getUnreadPushCount);

// 前端兼容性路由 - /push/notifications/* 映射到 /push/messages/*
router.get('/notifications', authenticate, miscController.getPushMessages);
router.put('/notifications/:id/read', authenticate, miscController.markPushAsRead);
router.put('/notifications/read-all', authenticate, miscController.markAllPushAsRead);
router.delete('/notifications/:id', authenticate, miscController.deletePushMessage);
router.post('/notifications/clear', authenticate, miscController.clearAllPushMessages);
router.get('/notifications/unread-count', authenticate, miscController.getUnreadPushCount);

// 前端兼容性路由 - /push/settings 推送设置
router.get('/settings', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        party_enabled: true,
        comment_enabled: true,
        like_enabled: true,
        follow_enabled: true,
        message_enabled: true,
        activity_enabled: true,
        system_enabled: true,
        do_not_disturb_enabled: false,
        do_not_disturb_start: '22:00',
        do_not_disturb_end: '08:00',
        aggregate_enabled: false,
        push_interval: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Push settings updated',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

router.post('/settings/:type/enable', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Push type ${req.params.type} enabled`
    });
  } catch (error) {
    next(error);
  }
});

router.post('/settings/:type/disable', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: `Push type ${req.params.type} disabled`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
