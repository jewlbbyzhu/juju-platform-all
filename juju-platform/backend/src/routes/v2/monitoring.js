const express = require('express');
const router = express.Router();
const monitoringController = require('../../controllers/monitoringController');
const { auth, adminAuth } = require('../../middleware/auth');

router.get('/metrics', auth, adminAuth, monitoringController.getMetrics);
router.get('/system/overview', auth, adminAuth, monitoringController.getSystemOverview);
router.get('/health', auth, adminAuth, monitoringController.getHealthDetails);
router.get('/business', auth, adminAuth, monitoringController.getBusinessMetrics);
router.get('/database', auth, adminAuth, monitoringController.getDatabaseStats);
router.get('/redis', auth, adminAuth, monitoringController.getRedisStats);
router.get('/api', auth, adminAuth, monitoringController.getAPIStats);
router.get('/logs', auth, adminAuth, monitoringController.getLogs);
router.get('/alerts/history', auth, adminAuth, monitoringController.getAlertHistory);
router.get('/alerts/stats', auth, adminAuth, monitoringController.getAlertStats);
router.post('/alerts/check', auth, adminAuth, monitoringController.checkAlerts);
router.put('/alerts/rules', auth, adminAuth, monitoringController.updateAlertRule);
router.post('/alerts/silence', auth, adminAuth, monitoringController.setAlertSilencePeriod);
router.post('/alerts/channels', auth, adminAuth, monitoringController.addNotificationChannel);

module.exports = router;
