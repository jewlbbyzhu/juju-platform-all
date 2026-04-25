const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analyticsController');
const { adminAuth } = require('../../middleware/auth');

router.get('/orders', adminAuth, analyticsController.orders);
router.get('/revenue', adminAuth, analyticsController.revenue);
router.get('/parties', adminAuth, analyticsController.parties);
router.get('/users', adminAuth, analyticsController.users);
router.post('/export', adminAuth, analyticsController.export);
router.get('/overview', adminAuth, analyticsController.overview);
router.get('/realtime', adminAuth, analyticsController.realtime);
router.post('/drilldown', adminAuth, analyticsController.drillDown);

router.get('/reports', adminAuth, analyticsController.getReports);
router.get('/reports/:id', adminAuth, analyticsController.getReportById);
router.post('/reports', adminAuth, analyticsController.createReport);
router.put('/reports/:id', adminAuth, analyticsController.updateReport);
router.delete('/reports/:id', adminAuth, analyticsController.deleteReport);
router.post('/reports/:id/execute', adminAuth, analyticsController.executeReport);
router.post('/reports/:id/schedule', adminAuth, analyticsController.scheduleReport);
router.delete('/reports/:id/schedule', adminAuth, analyticsController.cancelScheduledReport);

router.get('/dashboards', adminAuth, analyticsController.getDashboards);
router.get('/dashboards/:id', adminAuth, analyticsController.getDashboardById);
router.post('/dashboards', adminAuth, analyticsController.createDashboard);
router.put('/dashboards/:id', adminAuth, analyticsController.updateDashboard);
router.delete('/dashboards/:id', adminAuth, analyticsController.deleteDashboard);
router.post('/dashboards/:id/default', adminAuth, analyticsController.setDefaultDashboard);

router.get('/:param/range', adminAuth, analyticsController.getAnalyticsByTimeRange);
router.get('/:param/compare', adminAuth, analyticsController.compareAnalytics);
router.get('/:param/metrics', adminAuth, analyticsController.getAvailableMetrics);
router.get('/:param/filters', adminAuth, analyticsController.getAvailableFilters);

module.exports = router;
