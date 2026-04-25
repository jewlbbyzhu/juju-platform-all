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

module.exports = router;
