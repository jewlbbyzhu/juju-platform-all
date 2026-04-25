const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');
const { auth, adminAuth } = require('../../middleware/auth');

// Articles
router.get('/articles', auth, contentController.getArticles);
router.get('/articles/:id', auth, contentController.getArticleDetail);

// Banners
router.get('/banners', auth, adminAuth, contentController.getBanners);
router.get('/banners/:id', auth, adminAuth, contentController.getBannerDetail);
router.post('/banners', auth, adminAuth, contentController.createBanner);
router.put('/banners/:id', auth, adminAuth, contentController.updateBanner);
router.delete('/banners/:id', auth, adminAuth, contentController.deleteBanner);
router.patch('/banners/:id/status', auth, adminAuth, contentController.updateBannerStatus);
router.post('/banners/sort', auth, adminAuth, contentController.sortBanners);
router.post('/banners/batch/delete', auth, adminAuth, contentController.batchDeleteBanners);
router.post('/banners/batch/status', auth, adminAuth, contentController.batchUpdateBannerStatus);

// Announcements
router.get('/announcements', auth, adminAuth, contentController.getAnnouncements);
router.get('/announcements/:id', auth, adminAuth, contentController.getAnnouncementDetail);
router.post('/announcements', auth, adminAuth, contentController.createAnnouncement);
router.put('/announcements/:id', auth, adminAuth, contentController.updateAnnouncement);
router.delete('/announcements/:id', auth, adminAuth, contentController.deleteAnnouncement);
router.post('/announcements/:id/publish', auth, adminAuth, contentController.publishAnnouncement);
router.post('/announcements/:id/archive', auth, adminAuth, contentController.archiveAnnouncement);
router.post('/announcements/batch/delete', auth, adminAuth, contentController.batchDeleteAnnouncements);

// Upload & Stats
router.post('/upload', auth, adminAuth, contentController.upload);
router.get('/stats', auth, adminAuth, contentController.getContentStats);

module.exports = router;
