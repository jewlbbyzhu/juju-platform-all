const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { auth } = require('../../middleware/auth');

router.use(auth);

router.post('/conversations', chatController.createConversation.bind(chatController));
router.get('/conversations', chatController.getConversations.bind(chatController));
router.get('/conversations/:conversationId/messages', chatController.getMessages.bind(chatController));
router.post('/conversations/:conversationId/messages', chatController.sendMessage.bind(chatController));
router.put('/conversations/:conversationId/read', chatController.markAsRead.bind(chatController));
router.delete('/conversations/:conversationId', chatController.deleteConversation.bind(chatController));
router.get('/unread-count', chatController.getUnreadCount.bind(chatController));

module.exports = router;
