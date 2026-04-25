const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/walletController');
const { auth, adminAuth } = require('../../middleware/auth');

// ==================== 用户级接口 ====================
// 获取我的钱包信息
router.get('/my', auth, walletController.getWallet);

// 获取我的交易记录
router.get('/my/transactions', auth, walletController.getWalletTransactions);

// 钱包充值
router.post('/recharge', auth, walletController.recharge);

// 钱包提现
router.post('/withdraw', auth, walletController.withdraw);

// 设置支付密码
router.post('/password', auth, walletController.setPassword);

// 修改支付密码
router.put('/password', auth, walletController.updatePassword);

// 验证支付密码
router.post('/password/verify', auth, walletController.verifyPassword);

// 转账
router.post('/transfer', auth, walletController.transfer);

// ==================== 管理员接口 ====================
// 获取指定用户钱包（管理员）
router.get('/', auth, adminAuth, walletController.getWallet);

// 获取指定用户交易记录（管理员）
router.get('/transactions', auth, adminAuth, walletController.getWalletTransactions);

module.exports = router;
