const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const wechatController = require('../../controllers/wechatController');
const { auth, adminAuth } = require('../../middleware/auth');
const { validateUpdateUserStatus } = require('../../validators/userValidator');

// 用户资料更新（微信小程序）
router.post('/profile', auth, wechatController.updateProfile);

router.get('/', auth, adminAuth, userController.getUserList);
router.get('/stats', auth, adminAuth, userController.getUserStats);
router.get('/search', auth, adminAuth, userController.searchUsers);
router.get('/:id', auth, adminAuth, userController.getUserById);
router.get('/:id/activities', auth, adminAuth, userController.getUserActivities);
router.get('/:id/orders', auth, adminAuth, userController.getUserOrders);
router.get('/:id/parties', auth, adminAuth, userController.getUserParties);
router.get('/:id/transactions', auth, adminAuth, userController.getUserTransactions);
router.put('/:id/status', auth, adminAuth, validateUpdateUserStatus, userController.updateUserStatus);
router.put('/batch/status', auth, adminAuth, userController.batchUpdateUserStatus);
router.delete('/:id', auth, adminAuth, userController.deleteUser);
router.get('/export', auth, adminAuth, userController.exportUsers);

module.exports = router;
