const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const { generalLimiter } = require('../../middleware/rateLimiter');

// 地图配置 - 必须认证访问，防止配置信息泄露和Key被滥用
// 生产环境部署前必须替换 'your_amap_key_here' 为真实Key
router.get('/config', auth, (req, res) => {
  const amapKey = process.env.AMAP_KEY;
  if (!amapKey || amapKey === 'your_amap_key_here') {
    return res.status(503).json({
      success: false,
      message: 'Map service not configured',
      code: 'MAP_KEY_MISSING'
    });
  }
  res.json({
    success: true,
    data: {
      provider: 'amap',
      key: amapKey,
      style: 'normal',
      center: [114.4905, 36.6099],
      zoom: 12
    }
  });
});

// 搜索地点 - 添加限流防止滥用
router.get('/search', auth, generalLimiter, (req, res) => {
  const { keyword } = req.query;
  
  // 模拟搜索结果
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: keyword || '紫山公园',
        address: '邯郸市丛台区',
        latitude: 36.6099,
        longitude: 114.4905,
        distance: 0
      }
    ]
  });
});

// 获取地点详情 - 必须认证
router.get('/places/:id', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: '紫山公园',
      address: '邯郸市丛台区',
      latitude: 36.6099,
      longitude: 114.4905,
      phone: '0310-1234567',
      photos: ['https://example.com/photo1.jpg']
    }
  });
});

module.exports = router;
