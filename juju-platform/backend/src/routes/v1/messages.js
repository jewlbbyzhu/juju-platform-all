const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { auth: authenticate } = require('../../middleware/auth');

// 删除消息
router.delete('/:id', authenticate, chatController.deleteMessage);

// 撤回消息
router.post('/:id/recall', authenticate, chatController.recallMessage);

// 搜索消息
router.get('/search', authenticate, chatController.searchMessages);

module.exports = router;
