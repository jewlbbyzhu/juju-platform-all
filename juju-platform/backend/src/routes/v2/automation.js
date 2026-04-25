const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/reports', express.json({ limit: '2mb' }), (req, res) => {
  try {
    const outDir = path.resolve(__dirname, '../../../logs');
    try { fs.mkdirSync(outDir, { recursive: true }); } catch { /* ignore */ }
    const ts = Date.now();
    const file = path.join(outDir, `automation-report-${ts}.json`);
    const payload = req.body || {};
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    return res.status(200).json({ success: true, data: { file, ts } });
  } catch (e) {
    return res.status(500).json({ success: false, error: { code: 'REPORT_SAVE_ERROR', message: '保存报告失败' } });
  }
});

module.exports = router;
