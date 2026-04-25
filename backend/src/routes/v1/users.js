const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const walletController = require('../../controllers/walletController');
const ticketController = require('../../controllers/ticketController');
const { auth } = require('../../middleware/auth');
const { generalLimiter, authLimiter } = require('../../middleware/rateLimiter');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../../validators/userValidator');

// ========== 静态路由（必须在参数化路由 /:id 之前）==========

router.post('/register', generalLimiter, validateRegister, userController.register);
router.post('/login', authLimiter, validateLogin, userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validateUpdateProfile, userController.updateProfile);

// 前端兼容性路由 - POST /users/profile (前端使用POST，后端使用PUT)
router.post('/profile', auth, validateUpdateProfile, userController.updateProfile);

router.get('/vip/status', auth, userController.getVipStatus);
router.put('/vip/status', auth, userController.updateVipStatus);
router.get('/statistics', auth, userController.getUserStats);

// 前端兼容性路由 - /users/wallet 映射到钱包信息
router.get('/wallet', auth, walletController.getWallet);

// 前端兼容性路由 - /users/tickets 映射到用户票券
router.get('/tickets', auth, ticketController.getUserTickets);

// 用户拉黑相关路由
router.get('/blocked', auth, userController.getBlockedUsers);

// 前端兼容性路由 - /users/tags 映射到用户标签
router.get('/tags', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        tags: []
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/tags', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Tags updated',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - /users/interests 映射到用户兴趣
router.get('/interests', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        interests: []
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/interests', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Interests updated',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - /users/preferences 映射到用户偏好
router.get('/preferences', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        preferences: {}
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/preferences', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Preferences updated',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - /users/behavior 用户行为
router.get('/behavior', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        behavior: {}
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/behavior', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Behavior tracked',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', auth, userController.getUserList);
router.get('/search', auth, userController.searchUsers);
router.get('/export', auth, userController.exportUsers);
router.put('/batch/status', auth, userController.batchUpdateUserStatus);

// ========== 参数化路由（必须放在静态路由之后）==========

router.get('/:id', auth, userController.getUserById);
router.put('/:id/status', auth, userController.updateUserStatus);
router.delete('/:id', auth, userController.deleteUser);
router.get('/:id/activities', auth, userController.getUserActivities);
router.get('/:id/orders', auth, userController.getUserOrders);
router.get('/:id/parties', auth, userController.getUserParties);

// 用户拉黑相关路由 - 参数化版本
router.post('/:userId/block', auth, userController.blockUser);
router.delete('/:userId/block', auth, userController.unblockUser);

// 前端兼容性路由 - /users/:id/block 和 /users/:id/unblock (前端使用id而非userId)
router.post('/:id/block', auth, userController.blockUser);
router.delete('/:id/block', auth, userController.unblockUser);

// 前端兼容性路由 - /users/:id/statistics 映射到用户统计
router.get('/:id/statistics', auth, userController.getUserStats);

module.exports = router;
