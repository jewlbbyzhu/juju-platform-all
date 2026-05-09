const express = require('express');
const router = express.Router();
const socialController = require('../../controllers/socialController');
const { auth: authenticate } = require('../../middleware/auth');

// 获取当前用户的关注列表（GET /follows）
router.get('/', authenticate, socialController.getFollowing);

// 关注/取消关注
router.post('/', authenticate, socialController.follow);
router.post('/:id', authenticate, socialController.followUser);
router.delete('/:id', authenticate, socialController.unfollowUser);

// 检查关注状态
router.get('/check', authenticate, async (req, res) => {
  try {
    const { userId } = req.query;
    const currentUserId = req.user.id;
    const { Follow } = require('../../models');
    
    const follow = await Follow.findOne({
      where: {
        follower_id: currentUserId,
        following_id: userId,
        status: 1
      }
    });
    
    res.json({
      code: 0,
      data: {
        isFollowing: !!follow
      }
    });
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: '检查关注状态失败'
    });
  }
});

// 获取粉丝列表
router.get('/followers', authenticate, socialController.getFollowers);

// 获取关注列表
router.get('/following', authenticate, socialController.getFollowing);

// 前端兼容性路由 - GET /follows/followers/:userId
router.get('/followers/:userId', authenticate, socialController.getFollowers);

// 前端兼容性路由 - GET /follows/following/:userId
router.get('/following/:userId', authenticate, socialController.getFollowing);

// 前端兼容性路由 - GET /follows/check/:userId
router.get('/check/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;
    const { Follow } = require('../../models');
    
    const follow = await Follow.findOne({
      where: {
        follower_id: currentUserId,
        following_id: userId,
        status: 1
      }
    });
    
    res.json({
      code: 0,
      data: {
        isFollowing: !!follow
      }
    });
  } catch (error) {
    res.status(500).json({
      code: -1,
      message: '检查关注状态失败'
    });
  }
});

module.exports = router;
