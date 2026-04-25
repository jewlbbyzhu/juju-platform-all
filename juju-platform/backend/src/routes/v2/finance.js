const express = require('express');
const router = express.Router();
const financeController = require('../../controllers/financeController');
const { auth, adminAuth } = require('../../middleware/auth');

// 提现列表
router.get('/withdrawals', auth, adminAuth, financeController.getWithdrawals);

// 财务统计
router.get('/stats', auth, adminAuth, financeController.getFinancialStats);

router.get('/withdrawals/:id', auth, adminAuth, financeController.getWithdrawalDetail);
router.post('/withdrawals/:id/audit', auth, adminAuth, financeController.auditWithdrawal);
router.post('/withdrawals/batch/audit', auth, adminAuth, financeController.batchAuditWithdrawals);
router.get('/withdrawals/pending/count', auth, adminAuth, financeController.getPendingWithdrawalsCount);
router.get('/transactions', auth, adminAuth, financeController.getTransactions);
router.get('/transactions/:id', auth, adminAuth, financeController.getTransactionDetail);
router.post('/report/export', auth, adminAuth, financeController.exportFinancialReport);

module.exports = router;
