const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');
const { auth } = require('../../middleware/auth');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// to prevent Express from matching :id with "banners" or "announcements"

// Banners - specific routes first
router.get('/banners', contentController.getBanners);
router.get('/banners/:id', contentController.getBannerDetail);

// Announcements - specific routes first  
router.get('/announcements', contentController.getAnnouncements);
router.get('/announcements/:id', contentController.getAnnouncementDetail);

// Posts compatibility (alias to articles)
router.get('/posts', contentController.getArticles);
router.get('/posts/:id', contentController.getArticleDetail);

// Content / Posts - parameterized routes LAST
router.get('/', contentController.getArticles);
router.get('/:id', contentController.getArticleDetail);

module.exports = router;
