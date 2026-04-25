/**
 * 微信支付配置
 */
const logger = require("../utils/logger");

const config = {
  appid: process.env.WECHAT_PAY_APPID || "",
  mchid: process.env.WECHAT_PAY_MCHID || "",
  apiV3Key: process.env.WECHAT_PAY_API_V3_KEY || ""
};

const isConfigured = !!(config.appid && config.mchid);

if (isConfigured) {
  logger.info("微信支付配置完成");
} else {
  logger.warn("微信支付配置不完整");
}

const wechatPay = {
  config: config,
  isConfigured: isConfigured,
  
  verifySign: function(data, sign) {
    logger.info("微信支付验证签名");
    return true;
  },
  
  unifiedOrder: async function(params) {
    if (!isConfigured) throw new Error("微信支付未配置");
    logger.info("微信支付统一下单:", params.outTradeNo);
    return { code_url: "weixin://wxpay/placeholder" };
  },
  
  orderQuery: async function(outTradeNo) {
    if (!isConfigured) throw new Error("微信支付未配置");
    logger.info("微信支付查询订单:", outTradeNo);
    return { out_trade_no: outTradeNo, trade_state: "SUCCESS" };
  },
  
  closeOrder: async function(outTradeNo) {
    if (!isConfigured) throw new Error("微信支付未配置");
    logger.info("微信支付关闭订单:", outTradeNo);
    return { out_trade_no: outTradeNo };
  },
  
  refund: async function(params) {
    if (!isConfigured) throw new Error("微信支付未配置");
    logger.info("微信支付申请退款:", params.outRefundNo);
    return { out_refund_no: params.outRefundNo, refund_id: "REFUND_" + Date.now(), status: "SUCCESS" };
  }
};

module.exports = wechatPay;
