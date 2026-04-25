const express = require('express');
const router = express.Router();
const pushSettingController = require('../../controllers/pushSettingController');
const { auth } = require('../../middleware/auth');

router.use(auth);

router.get('/push-settings', pushSettingController.getSettings.bind(pushSettingController));
router.put('/push-settings', pushSettingController.updateSettings.bind(pushSettingController));
router.post('/push-settings/reset', pushSettingController.resetSettings.bind(pushSettingController));

module.exports = router;
