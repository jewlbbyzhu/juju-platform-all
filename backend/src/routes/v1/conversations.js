const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { auth: authenticate } = require('../../middleware/auth');

// 会话列表
router.get('/', authenticate, chatController.getConversations);

// 会话消息
router.get('/:id/messages', authenticate, chatController.getMessages);
router.post('/:id/messages', authenticate, chatController.sendMessage);
router.post('/:id/read', authenticate, chatController.markAsRead);

module.exports = router;
