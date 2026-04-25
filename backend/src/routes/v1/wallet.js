const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/walletController');
const bankCardController = require('../../controllers/bankCardController');
const { auth } = require('../../middleware/auth');
const { strictLimiter } = require('../../middleware/rateLimiter');

// 标准路由
router.get('/', auth, walletController.getWallet);
router.get('/transactions', auth, walletController.getWalletTransactions);
router.post('/recharge', auth, strictLimiter, walletController.recharge);
router.post('/withdraw', auth, strictLimiter, walletController.withdraw);
router.post('/password', auth, strictLimiter, walletController.setPassword);
router.put('/password', auth, strictLimiter, walletController.updatePassword);

// 前端兼容性路由 - /wallet/my 映射到 getWallet
router.get('/my', auth, walletController.getWallet);

// 前端兼容性路由 - /wallet/my/transactions 映射到 getWalletTransactions
router.get('/my/transactions', auth, walletController.getWalletTransactions);

// 前端兼容性路由 - /wallet/password/verify 验证支付密码
router.post('/password/verify', auth, strictLimiter, walletController.verifyPassword);

// 前端兼容性路由 - /wallet/transfer 转账
router.post('/transfer', auth, strictLimiter, walletController.transfer);

router.get('/bankcards', auth, bankCardController.getBankCards);
router.post('/bankcards', auth, strictLimiter, bankCardController.addBankCard);
router.delete('/bankcards/:id', auth, strictLimiter, bankCardController.deleteBankCard);
router.put('/bankcards/:id/default', auth, strictLimiter, bankCardController.setDefaultBankCard);

module.exports = router;
