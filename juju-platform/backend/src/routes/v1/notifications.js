const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const { auth } = require('../../middleware/auth');

router.post('/', auth, notificationController.createNotification);
router.get('/', auth, notificationController.getNotifications);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.patch('/:id/unread', auth, notificationController.markAsUnread);
router.patch('/read-all', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);
router.delete('/read', auth, notificationController.deleteReadNotifications);
router.delete('/all', auth, notificationController.deleteAllNotifications);
router.get('/unread/count', auth, notificationController.getUnreadCount);
router.get('/statistics', auth, notificationController.getNotificationStatistics);
router.get('/type/:type', auth, notificationController.getNotificationsByType);

module.exports = router;
