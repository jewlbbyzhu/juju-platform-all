const express = require('express');
const router = express.Router();

// 应用版本信息
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      build: '2026.04.25',
      platform: 'all',
      minVersion: '1.0.0',
      updateUrl: 'https://hfparty.asia/download',
      forceUpdate: false,
      releaseNotes: '初始版本发布'
    }
  });
});

// 检查更新
router.get('/check', (req, res) => {
  const { platform, version } = req.query;
  
  res.json({
    success: true,
    data: {
      hasUpdate: false,
      latestVersion: '1.0.0',
      updateUrl: 'https://hfparty.asia/download',
      forceUpdate: false,
      releaseNotes: '当前已是最新版本'
    }
  });
});

module.exports = router;
