const express = require('express');
const router = express.Router();
const { PartyCategory } = require('../../models');

// 获取所有主题分类
router.get('/', async (req, res) => {
  try {
    const categories = await PartyCategory.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']],
      attributes: ['id', 'slug', 'name', 'name_en', 'icon', 'color', 'description']
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
});

module.exports = router;
