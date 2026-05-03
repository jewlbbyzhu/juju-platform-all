const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');
const { auth } = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// to prevent Express from matching :id with "banners" or "announcements"

// Banners - 公开内容但添加generalLimiter防止枚举
router.get('/banners', generalLimiter, contentController.getBanners);
router.get('/banners/:id', generalLimiter, contentController.getBannerDetail);

// Announcements - 公开内容但添加generalLimiter防止枚举
// 注意：若包含未发布内部公告，需在controller层过滤status='published'
router.get('/announcements', generalLimiter, contentController.getAnnouncements);
router.get('/announcements/:id', generalLimiter, contentController.getAnnouncementDetail);

// Posts compatibility (alias to articles) - 公开内容但添加generalLimiter防止枚举
router.get('/posts', generalLimiter, contentController.getArticles);
router.get('/posts/:id', generalLimiter, contentController.getArticleDetail);

// Content / Posts - parameterized routes LAST - 公开内容但添加generalLimiter防止枚举
router.get('/', generalLimiter, contentController.getArticles);
router.get('/:id', generalLimiter, contentController.getArticleDetail);

module.exports = router;
