const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');
const { Category } = require('../../models');

// 获取所有主题分类
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'slug', 'name', 'name_en', 'icon', 'color', 'description'],
      raw: true
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
});

module.exports = router;
