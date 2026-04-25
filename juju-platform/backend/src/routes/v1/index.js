const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');

router.use('/users', require('./users'));
router.use('/parties', require('./parties'));
router.use('/tickets', require('./tickets'));
router.use('/orders', require('./orders'));
router.use('/payments', require('./payments'));
router.use('/wallet', require('./wallet'));
router.use('/favorites', require('./favorites'));
router.use('/notifications', require('./notifications'));
router.use('/vip', require('./vip'));
router.use('/bankcards', require('./bankcards'));
router.use('/auth', require('./auth'));
router.use('/appversion', require('./appversion'));
router.use('/feedbacks', require('./feedbacks'));
router.use('/tags', require('./tags'));
router.use('/scan', require('./scan'));
router.use('/recommendations', require('./recommendations'));
router.use('/push', require('./push'));
router.use('/map', require('./map'));
router.use('/invite', require('./invite'));
router.use('/user', require('./user'));
router.use('/follows', require('./follows'));
router.use('/chat', require('./chat'));
router.use('/conversations', require('./conversations'));
router.use('/messages', require('./messages'));
router.use('/admins', require('./admins'));
router.use('/categories', require('./categories'));
router.use('/ui-themes', require('./ui-themes'));
router.use('/onboarding', require('./onboarding'));

router.get('/help/search', (req, res, next) => {
  contentController.searchHelp(req, res, next);
});

// 公开API - 帮助文章列表和详情
router.get('/help/articles', (req, res, next) => {
  contentController.getArticles(req, res, next);
});

router.get('/help/articles/:id', (req, res, next) => {
  contentController.getArticleDetail(req, res, next);
});

module.exports = router;
