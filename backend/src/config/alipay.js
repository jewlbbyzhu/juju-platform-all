/**
 * 支付宝支付配置
 */
const AlipaySdk = require('alipay-sdk').default;
const logger = require('../utils/logger');

const alipayConfig = {
  appId: process.env.ALIPAY_APPID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  signType: 'RSA2',
  alipayPublicKey: process.env.ALIPAY_ALIPAY_PUBLIC_KEY || '',
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  timeout: 10000,
  camelcase: true
};

let alipaySdk;
try {
  if (alipayConfig.appId && alipayConfig.privateKey) {
    alipaySdk = new AlipaySdk(alipayConfig);
    logger.info('支付宝 SDK 初始化成功');
  } else {
    logger.warn('支付宝配置不完整');
    alipaySdk = {
      exec: async () => { throw new Error('支付宝未配置'); }
    };
  }
} catch (error) {
  logger.error('支付宝 SDK 初始化失败:', error);
  alipaySdk = {
    exec: async () => { throw new Error('支付宝未配置'); }
  };
}

// 验证异步通知
function verifyNotify(params) {
  logger.info('验证支付宝异步通知');
  if (!alipayConfig.alipayPublicKey) {
    logger.warn('支付宝公钥未配置，跳过验证');
    return true;
  }
  try {
    return alipaySdk.checkResponseSign ? alipaySdk.checkResponseSign(params) : true;
  } catch (error) {
    logger.error('验证签名失败:', error);
    return false;
  }
}

const alipayExport = {
  ...alipaySdk,
  config: alipayConfig,
  verifyNotify: verifyNotify
};

module.exports = alipayExport;
