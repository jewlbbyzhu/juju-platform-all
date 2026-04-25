const express = require('express');
const router = express.Router();
const miscController = require('../../controllers/miscController');
const { auth: authenticate } = require('../../middleware/auth');

router.get('/', miscController.getRecommendations);
router.get('/similar/:id', miscController.getSimilarParties);
router.get('/hot', miscController.getHotParties);
router.get('/nearby', miscController.getNearbyParties);
router.post('/preferences', authenticate, miscController.updatePreferences);
router.get('/preferences', authenticate, miscController.getPreferences);
router.post('/behavior', authenticate, miscController.trackBehavior);

module.exports = router;
