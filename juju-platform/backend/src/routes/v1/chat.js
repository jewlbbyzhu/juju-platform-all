const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { auth: authenticate } = require('../../middleware/auth');

// 会话
router.get('/conversations', authenticate, chatController.getConversations);
router.get('/conversations/:id/messages', authenticate, chatController.getMessages);
router.post('/conversations/:id/messages', authenticate, chatController.sendMessage);
router.post('/conversations/:id/read', authenticate, chatController.markAsRead);

// 消息
router.delete('/messages/:id', authenticate, chatController.deleteMessage);
router.post('/messages/:id/recall', authenticate, chatController.recallMessage);

// 群组
router.get('/groups', authenticate, chatController.getGroupList);
router.post('/groups', authenticate, chatController.createGroup);
router.get('/groups/:id/messages', authenticate, chatController.getGroupMessages);
router.post('/groups/:id/messages', authenticate, chatController.sendGroupMessage);
router.post('/groups/:id/join', authenticate, chatController.joinGroup);
router.post('/groups/:id/leave', authenticate, chatController.leaveGroup);
router.get('/groups/:id/members', authenticate, chatController.getGroupMembers);

// 上传
router.post('/upload/image', authenticate, chatController.uploadImage);
router.post('/upload/voice', authenticate, chatController.uploadVoice);

// 搜索
router.get('/messages/search', authenticate, chatController.searchMessages);

module.exports = router;
