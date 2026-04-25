const express = require('express');
const router = express.Router();
const userProfileController = require('../../controllers/userProfileController');
const { auth: authenticate } = require('../../middleware/auth');

// 用户资料
router.get('/profile', authenticate, userProfileController.getUserProfile);
router.put('/profile', authenticate, userProfileController.updateUserProfile);

// 用户标签
router.get('/tags', authenticate, userProfileController.getUserTags);
router.put('/tags', authenticate, userProfileController.updateUserTags);

// 用户兴趣
router.get('/interests', authenticate, userProfileController.getUserInterests);
router.put('/interests', authenticate, userProfileController.updateUserInterests);

// 用户偏好设置
router.get('/preferences', authenticate, userProfileController.getUserPreferences);
router.put('/preferences', authenticate, userProfileController.updateUserPreferences);

// 用户统计
router.get('/statistics', authenticate, userProfileController.getUserStatistics);

// 推荐
router.get('/recommended-parties', authenticate, userProfileController.getRecommendedParties);
router.get('/recommended-users', authenticate, userProfileController.getRecommendedUsers);

// 用户行为
router.get('/behavior', authenticate, userProfileController.getUserBehavior);
router.post('/behavior', authenticate, userProfileController.trackUserBehavior);

module.exports = router;
