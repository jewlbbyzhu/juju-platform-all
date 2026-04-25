const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/scheduleController');
const { auth } = require('../../middleware/auth');

router.post('/auto-cancel', auth, scheduleController.triggerAutoCancel);
router.get('/parties-to-cancel', auth, scheduleController.getPartiesToCancel);

module.exports = router;
