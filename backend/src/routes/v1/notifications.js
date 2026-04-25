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

// 前端兼容性路由 - PUT /notifications/read-all (前端使用PUT)
router.put('/read-all', auth, notificationController.markAllAsRead);

// 前端兼容性路由 - GET /notifications/unread-count
router.get('/unread-count', auth, notificationController.getUnreadCount);

// 前端兼容性路由 - PUT /notifications/:id/read (前端使用PUT而非PATCH)
router.put('/:id/read', auth, notificationController.markAsRead);

// 前端兼容性路由 - DELETE /notifications (删除所有通知)
router.delete('/', auth, notificationController.deleteAllNotifications);

module.exports = router;
