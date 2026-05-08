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

// 检查配置完整性
const hasAppId = !!alipayConfig.appId;
const hasPrivateKey = !!alipayConfig.privateKey;
const hasPublicKey = !!alipayConfig.alipayPublicKey;
const isConfigured = hasAppId && hasPrivateKey;

let alipaySdk;
try {
  if (isConfigured) {
    alipaySdk = new AlipaySdk(alipayConfig);
    logger.info('支付宝 SDK 初始化成功');
  } else {
    if (!hasAppId) {
      logger.warn('支付宝配置不完整：缺少 APPID');
    } else if (!hasPrivateKey) {
      logger.warn('支付宝配置不完整：缺少 PRIVATE_KEY（生产环境需配置）');
    }
    // 开发环境：创建占位SDK，不抛出错误
    alipaySdk = {
      exec: async (method, params) => {
        logger.warn(`支付宝未配置，无法执行: ${method}`);
        return { code: '40004', msg: '支付宝未配置', subCode: 'CONFIG.MISSING' };
      },
      checkResponseSign: () => true
    };
  }
} catch (error) {
  logger.error('支付宝 SDK 初始化失败:', error);
  alipaySdk = {
    exec: async (method, params) => {
      logger.warn(`支付宝SDK初始化失败，无法执行: ${method}`);
      return { code: '40004', msg: '支付宝SDK初始化失败', subCode: 'SDK.INIT_FAILED' };
    },
    checkResponseSign: () => true
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
  verifyNotify: verifyNotify,
  isConfigured: isConfigured
};

module.exports = alipayExport;
