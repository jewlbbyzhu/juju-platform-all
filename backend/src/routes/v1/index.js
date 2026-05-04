const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');

// 前端兼容性路由 - /party/* 是 /parties/* 的别名
router.use('/party', require('./parties'));
router.use('/parties', require('./parties'));

// 前端兼容性路由 - /api/v1/health
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
});
router.use('/users', require('./users'));
router.use('/tickets', require('./tickets'));
router.use('/orders', require('./orders'));
router.use('/payments', require('./payments'));
router.use('/wallet', require('./wallet'));
router.use('/favorites', require('./favorites'));
router.use('/notifications', require('./notifications'));
router.use('/vip', require('./vip'));
router.use('/bankcards', require('./bankcards'));
router.use('/auth', require('./auth'));
router.use('/appversion', require('./appversion'));
router.use('/feedbacks', require('./feedbacks'));
router.use('/tags', require('./tags'));
router.use('/scan', require('./scan'));
router.use('/recommendations', require('./recommendations'));
router.use('/push', require('./push'));
router.use('/map', require('./map'));
router.use('/invite', require('./invite'));
router.use('/user', require('./user'));
router.use('/follows', require('./follows'));
router.use('/chat', require('./chat'));
router.use('/conversations', require('./conversations'));
router.use('/messages', require('./messages'));
router.use('/admins', require('./admins'));
router.use('/categories', require('./categories'));
router.use('/ui-themes', require('./ui-themes'));
router.use('/onboarding', require('./onboarding'));
router.use('/refunds', require('./refunds'));
router.use('/ticket-types', require('./ticket-types'));  // 票种类型管理路由
router.use('/ticket-stats', require('./ticket-stats'));  // 前端票券统计路由
router.use('/analytics', require('./analytics'));  // 前端VIP统计路由
router.use('/social', require('./social'));  // 前端社交路由
router.use('/content', require('./content'));  // 前端内容路由
router.use('/posts', require('./posts'));  // 前端帖子路由
router.use('/auth/refresh', require('./refresh'));  // 前端兼容性路由 - Token刷新
router.use('/reports', require('./reports'));  // 举报/投诉路由

// 前端兼容性路由 - /group-chats 直接映射到 chatController
const chatController = require('../../controllers/chatController');
const { auth: authenticate } = require('../../middleware/auth');
router.get('/group-chats', authenticate, chatController.getGroupList);
router.post('/group-chats', authenticate, chatController.createGroup);
router.get('/group-chats/:id', authenticate, chatController.getGroupList);
router.get('/group-chats/:id/messages', authenticate, chatController.getGroupMessages);
router.post('/group-chats/:id/messages', authenticate, chatController.sendGroupMessage);
router.post('/group-chats/:id/join', authenticate, chatController.joinGroup);
router.post('/group-chats/:id/leave', authenticate, chatController.leaveGroup);
router.get('/group-chats/:id/members', authenticate, chatController.getGroupMembers);

router.get('/help/search', (req, res, next) => {
  contentController.searchHelp(req, res, next);
});

// 公开API - 帮助文章列表和详情
router.get('/help/articles', (req, res, next) => {
  contentController.getArticles(req, res, next);
});

router.get('/help/articles/:id', (req, res, next) => {
  contentController.getArticleDetail(req, res, next);
});

// 前端兼容性路由 - POST /upload 文件上传
router.post('/upload', (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: 'https://placeholder.com/uploaded-image.jpg',
        filename: 'uploaded-file.jpg'
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
