const express = require('express');
const router = express.Router();
const walletController = require('../../controllers/walletController');
const bankCardController = require('../../controllers/bankCardController');
const { auth } = require('../../middleware/auth');
const { strictLimiter } = require('../../middleware/rateLimiter');

router.get('/', auth, walletController.getWallet);
router.get('/transactions', auth, walletController.getWalletTransactions);
router.post('/recharge', auth, strictLimiter, walletController.recharge);
router.post('/withdraw', auth, strictLimiter, walletController.withdraw);
router.post('/password', auth, strictLimiter, walletController.setPassword);
router.put('/password', auth, strictLimiter, walletController.updatePassword);

router.get('/bankcards', auth, bankCardController.getBankCards);
router.post('/bankcards', auth, strictLimiter, bankCardController.addBankCard);
router.delete('/bankcards/:id', auth, strictLimiter, bankCardController.deleteBankCard);
router.put('/bankcards/:id/default', auth, strictLimiter, bankCardController.setDefaultBankCard);

module.exports = router;
