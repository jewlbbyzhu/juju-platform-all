const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const { auth } = require('../../middleware/auth');

// User notification routes
router.get('/', auth, notificationController.getNotifications);
router.get('/:id', auth, notificationController.getNotificationDetail);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/read-all', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
