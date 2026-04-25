const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { auth } = require('../../middleware/auth');
const { generalLimiter, authLimiter } = require('../../middleware/rateLimiter');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../../validators/userValidator');

router.post('/register', generalLimiter, validateRegister, userController.register);
router.post('/login', authLimiter, validateLogin, userController.login);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validateUpdateProfile, userController.updateProfile);
router.get('/vip/status', auth, userController.getVipStatus);
router.put('/vip/status', auth, userController.updateVipStatus);
router.get('/statistics', auth, userController.getUserStats);
router.get('/', auth, userController.getUserList);
router.get('/:id', auth, userController.getUserById);
router.put('/:id/status', auth, userController.updateUserStatus);
router.delete('/:id', auth, userController.deleteUser);
router.get('/search', auth, userController.searchUsers);
router.get('/:id/activities', auth, userController.getUserActivities);
router.get('/:id/orders', auth, userController.getUserOrders);
router.get('/:id/parties', auth, userController.getUserParties);
router.put('/batch/status', auth, userController.batchUpdateUserStatus);
router.get('/export', auth, userController.exportUsers);

// 用户拉黑相关路由
router.post('/:userId/block', auth, userController.blockUser);
router.post('/:userId/unblock', auth, userController.unblockUser);
router.get('/blocked', auth, userController.getBlockedUsers);

module.exports = router;
