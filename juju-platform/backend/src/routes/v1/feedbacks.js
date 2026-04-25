const express = require('express');
const router = express.Router();
const feedbackController = require('../../controllers/feedbackController');
const { auth, adminAuth } = require('../../middleware/auth');

// 用户反馈路由
router.post('/', auth, feedbackController.createFeedback);
router.get('/my', auth, feedbackController.getUserFeedbacks);
router.get('/my/:id', auth, feedbackController.getFeedbackById);
router.put('/my/:id', auth, feedbackController.updateFeedback);
router.delete('/my/:id', auth, feedbackController.deleteFeedback);

// 管理后台路由
router.get('/', auth, adminAuth, feedbackController.getFeedbackList);
router.get('/stats', auth, adminAuth, feedbackController.getFeedbackStats);
router.get('/:id', auth, adminAuth, feedbackController.getFeedbackById);
router.post('/:id/reply', auth, adminAuth, feedbackController.replyFeedback);
router.patch('/:id/status', auth, adminAuth, feedbackController.updateFeedbackStatus);

module.exports = router;
