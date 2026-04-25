const express = require('express');
const router = express.Router();
const settlementController = require('../../controllers/settlementController');
const { auth, adminAuth } = require('../../middleware/auth');

// Settlement (admin)
router.get('/', auth, adminAuth, settlementController.getSettlementList);
router.get('/:id', auth, adminAuth, settlementController.getSettlementById);
router.post('/:id/process', auth, adminAuth, settlementController.processSettlement);

// System (public)
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      features: ['parties', 'orders', 'payments', 'vip', 'wallet'],
      maintenance: false
    }
  });
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});

module.exports = router;
