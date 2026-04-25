const express = require('express');
const router = express.Router();
const pushController = require('../../controllers/pushController');
const { auth } = require('../../middleware/auth');

// Notifications
router.get('/notifications', auth, pushController.getPushMessages);
router.put('/notifications/:messageId/read', auth, pushController.markAsRead);
router.put('/notifications/read-all', auth, pushController.markAllAsRead);
router.delete('/notifications/:messageId', auth, pushController.deleteMessage);
router.post('/notifications/clear', auth, pushController.clearAllMessages);
router.get('/notifications/unread-count', auth, pushController.getUnreadCount);

// Settings
router.get('/settings', auth, pushController.getPushSettings);
router.put('/settings', auth, pushController.updatePushSettings);
router.post('/settings/:type/enable', auth, pushController.enablePush);
router.post('/settings/:type/disable', auth, pushController.disablePush);

module.exports = router;
