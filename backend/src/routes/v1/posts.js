const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');

// Posts routes - simple alias to articles
router.get('/', contentController.getArticles);
router.get('/:id', contentController.getArticleDetail);

module.exports = router;
