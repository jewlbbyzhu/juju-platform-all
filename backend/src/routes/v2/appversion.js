const express = require('express');
const router = express.Router();

const PLATFORMS = {
  android: {
    version: '1.0.0',
    downloadUrl: 'https://hfparty.asia/download/juju-app-latest.apk',
    qrCodeUrl: '/qrcodes/android.png',
    releaseDate: '2026-01-28',
    changelog: [
      '修复已知问题，提升应用稳定性',
      '优化性能，提升加载速度',
      '新增功能，改善用户体验'
    ],
    minVersion: '5.0',
    fileSize: '45.2 MB'
  },
  ios: {
    version: '1.0.0',
    downloadUrl: 'https://apps.apple.com/app/juju/id123456789',
    qrCodeUrl: '/qrcodes/ios.png',
    releaseDate: '2026-01-28',
    changelog: [
      '修复已知问题，提升应用稳定性',
      '优化性能，提升加载速度',
      '新增功能，改善用户体验'
    ],
    minVersion: '12.0',
    fileSize: '52.8 MB'
  },
  wechat: {
    version: '1.0.0',
    downloadUrl: 'weixin://dl/discover',
    qrCodeUrl: '/qrcodes/wechat.png',
    releaseDate: '2026-01-28',
    changelog: [
      '修复已知问题，提升应用稳定性',
      '优化性能，提升加载速度',
      '新增功能，改善用户体验'
    ],
    minVersion: '7.0.0',
    fileSize: 'N/A'
  }
};

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

router.get('/:platform', (req, res) => {
  const { platform } = req.params;
  const normalizedPlatform = platform.toLowerCase();

  if (!PLATFORMS[normalizedPlatform]) {
    return res.status(404).json({
      success: false,
      message: `Platform '${platform}' not found`,
      error: { code: 'NOT_FOUND', message: `Platform '${platform}' not found` }
    });
  }

  res.json({
    success: true,
    data: PLATFORMS[normalizedPlatform]
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
