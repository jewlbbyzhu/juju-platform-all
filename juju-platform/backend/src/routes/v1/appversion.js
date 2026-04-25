const express = require('express');
const router = express.Router();

const PLATFORMS = {
  android: {
    version: '1.0.0',
    downloadUrl: 'https://example.com/download/android',
    qrCodeUrl: 'https://example.com/qr/android.png',
    releaseDate: '2026-01-28',
    changelog: [
      'Bug fixes and improvements',
      'Performance optimizations',
      'New features added'
    ],
    minVersion: '5.0',
    fileSize: '45.2 MB'
  },
  ios: {
    version: '1.0.0',
    downloadUrl: 'https://example.com/download/ios',
    qrCodeUrl: 'https://example.com/qr/ios.png',
    releaseDate: '2026-01-28',
    changelog: [
      'Bug fixes and improvements',
      'Performance optimizations',
      'New features added'
    ],
    minVersion: '12.0',
    fileSize: '52.8 MB'
  },
  wechat: {
    version: '1.0.0',
    downloadUrl: 'https://example.com/download/wechat',
    qrCodeUrl: 'https://example.com/qr/wechat.png',
    releaseDate: '2026-01-28',
    changelog: [
      'Bug fixes and improvements',
      'Performance optimizations',
      'New features added'
    ],
    minVersion: '7.0.0',
    fileSize: 'N/A'
  }
};

// 获取特定平台版本信息 - 公开API
router.get('/:platform', (req, res) => {
  const { platform } = req.params;
  
  if (PLATFORMS[platform]) {
    res.json({
      success: true,
      data: PLATFORMS[platform]
    });
  } else {
    res.status(404).json({
      success: false,
      error: {
        code: 'PLATFORM_NOT_FOUND',
        message: 'Platform not found'
      }
    });
  }
});

router.get('/latest', (req, res) => {
  res.json({
    success: true,
    data: {
      version: '1.0.0',
      downloadUrl: 'https://example.com/download',
      updateDate: new Date().toISOString(),
      changelog: 'Bug fixes and improvements'
    }
  });
});

router.get('/versions', (req, res) => {
  const { platform } = req.query;
  
  if (platform && PLATFORMS[platform]) {
    const platformData = PLATFORMS[platform];
    res.json({
      success: true,
      data: [platformData]
    });
  } else {
    res.json({
      success: true,
      data: Object.values(PLATFORMS)
    });
  }
});

router.post('/check', (req, res) => {
  const { currentVersion, platform } = req.body;
  const hasUpdate = currentVersion !== '1.0.0';
  
  res.json({
    success: true,
    data: {
      hasUpdate,
      currentVersion,
      latestVersion: '1.0.0',
      forceUpdate: false,
      platform: platform || 'unknown'
    }
  });
});

router.get('/history', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        version: '1.0.0',
        releaseDate: '2026-01-28',
        changelog: 'Initial release'
      },
      {
        version: '0.9.0',
        releaseDate: '2026-01-15',
        changelog: 'Beta release'
      }
    ]
  });
});

module.exports = router;
