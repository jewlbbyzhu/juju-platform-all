const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/reportController');
const { auth, adminAuth } = require('../../middleware/auth');
const { strictLimiter } = require('../../middleware/rateLimiter');

// 用户端路由 - 创建举报（限流：每用户每小时最多5次）
router.post('/', auth, strictLimiter, reportController.createReport);
router.get('/my', auth, reportController.getMyReports);
router.get('/my/:id', auth, reportController.getReportById);

// 管理后台路由
router.get('/', auth, adminAuth, reportController.getReportList);
router.get('/stats', auth, adminAuth, reportController.getReportStatistics);
router.get('/:id', auth, adminAuth, reportController.getAdminReportById);
router.patch('/:id', auth, adminAuth, reportController.handleReport);

module.exports = router;