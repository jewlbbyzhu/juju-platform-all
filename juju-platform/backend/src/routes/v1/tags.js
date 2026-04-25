const express = require('express');
const router = express.Router();
const tagController = require('../../controllers/tagController');
const { auth: authenticate } = require('../../middleware/auth');

// 公开接口
router.get('/', tagController.getTagList);
router.get('/hot', tagController.getHotTags);
router.get('/recommended', tagController.getRecommendedTags);
router.get('/search', tagController.searchTags);
router.get('/:id', tagController.getTagDetail);
router.get('/:id/parties', tagController.getTagParties);

// 需要登录的接口
router.post('/:id/follow', authenticate, tagController.followTag);
router.post('/:id/unfollow', authenticate, tagController.unfollowTag);

// 管理接口（需要管理员权限）
router.post('/', authenticate, tagController.createTag);
router.put('/:id', authenticate, tagController.updateTag);
router.delete('/:id', authenticate, tagController.deleteTag);

module.exports = router;
