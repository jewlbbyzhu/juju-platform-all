const express = require('express');
const router = express.Router();
const miscController = require('../../controllers/miscController');
const { auth: authenticate } = require('../../middleware/auth');

router.post('/verify', authenticate, miscController.scanQRCode);
router.get('/history', authenticate, miscController.getScanHistory);
router.get('/stats', authenticate, miscController.getScanStats);
router.get('/:id', authenticate, miscController.getScanDetail);

module.exports = router;
