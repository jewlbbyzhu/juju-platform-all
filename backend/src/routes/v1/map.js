const express = require('express');
const router = express.Router();

// 地图配置
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      provider: 'amap',
      key: 'your_amap_key_here',
      style: 'normal',
      center: [114.4905, 36.6099],
      zoom: 12
    }
  });
});

// 搜索地点
router.get('/search', (req, res) => {
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

// 获取地点详情
router.get('/places/:id', (req, res) => {
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
