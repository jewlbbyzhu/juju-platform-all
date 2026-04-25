const express = require('express');
const router = express.Router();
const refundController = require('../../controllers/refundController');
const { auth, adminAuth } = require('../../middleware/auth');
const { validateAuditRefund } = require('../../validators/refundValidator');

// User routes (without adminAuth)
router.get('/', auth, refundController.getRefundList);
router.get('/:id', auth, refundController.getRefund);

// Admin routes
router.put('/:id/audit', auth, adminAuth, validateAuditRefund, refundController.auditRefund);
router.post('/:id/process', auth, adminAuth, refundController.processRefund);

module.exports = router;
