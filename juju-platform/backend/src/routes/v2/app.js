const express = require('express');
const router = express.Router();
const appController = require('../../controllers/appController');
const { auth, adminAuth } = require('../../middleware/auth');

router.get('/versions', auth, adminAuth, appController.getVersions);
router.post('/versions', auth, adminAuth, appController.createVersion);
router.put('/versions/:id', auth, adminAuth, appController.updateVersion);
router.delete('/versions/:id', auth, adminAuth, appController.deleteVersion);
router.post('/versions/:id/publish', auth, adminAuth, appController.publishVersion);

router.post('/upload', auth, adminAuth, appController.upload);

router.get('/feedback', auth, adminAuth, appController.getFeedback);
router.put('/feedback/:id/reply', auth, adminAuth, appController.replyFeedback);
router.put('/feedback/:id/status', auth, adminAuth, appController.updateFeedbackStatus);

router.get('/stats', auth, adminAuth, appController.getStats);
router.get('/downloads', auth, adminAuth, appController.getDownloadStats);
router.post('/downloads/track', auth, adminAuth, appController.trackDownload);

module.exports = router;
