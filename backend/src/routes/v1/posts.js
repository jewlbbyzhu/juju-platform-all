const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');

// Posts routes - simple alias to articles
router.get('/', contentController.getArticles);
router.get('/hot', (req, res) => {
  // 热帖功能暂未实现，返回空列表
  res.json({ success: true, data: { items: [], total: 0, page: 1, pageSize: 20 } });
});
router.get('/:id', contentController.getArticleDetail);

module.exports = router;
