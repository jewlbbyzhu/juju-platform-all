const express = require('express');
const router = express.Router();
const wechatController = require('../../controllers/wechatController');

// 微信登录
router.post('/login', wechatController.login);

module.exports = router;
