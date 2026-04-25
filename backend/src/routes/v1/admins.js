const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');

// 管理员登录
router.post('/login', adminController.login);

module.exports = router;
