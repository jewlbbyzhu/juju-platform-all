const express = require('express');
const router = express.Router();
const bankCardController = require('../../controllers/bankCardController');
const { auth } = require('../../middleware/auth');

router.get('/', auth, bankCardController.getBankCards);
router.post('/', auth, bankCardController.addBankCard);
router.delete('/:id', auth, bankCardController.deleteBankCard);
router.put('/:id/default', auth, bankCardController.setDefaultBankCard);

// 前端兼容性路由 - 获取支持的银行列表
router.get('/supported-banks', auth, async (req, res, next) => {
  try {
    // 临时实现 - 返回常见银行列表
    const supportedBanks = [
      { code: 'ICBC', name: '中国工商银行' },
      { code: 'CCB', name: '中国建设银行' },
      { code: 'ABC', name: '中国农业银行' },
      { code: 'BOC', name: '中国银行' },
      { code: 'COMM', name: '交通银行' },
      { code: 'CMB', name: '招商银行' },
      { code: 'CMBC', name: '中国民生银行' },
      { code: 'CIB', name: '兴业银行' },
      { code: 'SPDB', name: '上海浦东发展银行' },
      { code: 'CEB', name: '中国光大银行' },
      { code: 'PAB', name: '平安银行' },
      { code: 'HXB', name: '华夏银行' },
      { code: 'BOS', name: '上海银行' },
      { code: 'PSBC', name: '中国邮政储蓄银行' }
    ];
    res.json({
      success: true,
      data: supportedBanks
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
