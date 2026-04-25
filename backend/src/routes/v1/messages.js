const express = require('express');
const router = express.Router();
const { auth: authenticate } = require('../../middleware/auth');

// 获取消息列表（需要登录）
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      messages: [],
      unreadCount: 0,
      total: 0
    }
  });
});

// 获取未读消息数（需要登录）
router.get('/unread-count', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      count: 0
    }
  });
});

// 标记消息已读（需要登录）
router.put('/:id/read', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '标记已读成功'
  });
});

// 标记所有消息已读（需要登录）
router.put('/read-all', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '全部标记已读成功'
  });
});

// 删除消息（需要登录）
router.delete('/:id', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '删除成功'
  });
});

module.exports = router;
