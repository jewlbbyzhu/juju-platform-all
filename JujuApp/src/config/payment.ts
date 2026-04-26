/**
 * 支付配置文件
 * 支持微信支付、支付宝、钱包支付
 */

// 支付方式配置 - 使用硬编码配置（React Native 环境）
export const PAYMENT_METHODS = {
  WECHAT: {
    key: 'wechat',
    label: '微信支付',
    icon: '💚',
    enabled: true,
    appId: '',
    partnerId: '',
  },
  ALIPAY: {
    key: 'alipay',
    label: '支付宝',
    icon: '🔵',
    enabled: true,
    appId: '',
  },
  WALLET: {
    key: 'wallet',
    label: '钱包支付',
    icon: '👛',
    enabled: true,
  },
} as const;

// 支付状态
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// 支付超时时间 (秒)
export const PAYMENT_TIMEOUT = 300; // 5分钟

// 订单状态
export const ORDER_STATUS = {
  PENDING: { label: '待支付', color: '#FF9800' },
  PAID: { label: '已支付', color: '#4CAF50' },
  COMPLETED: { label: '已完成', color: '#2196F3' },
  CANCELLED: { label: '已取消', color: '#9E9E9E' },
  REFUNDED: { label: '已退款', color: '#F44336' },
} as const;

// 获取启用的支付方式
export const getEnabledPaymentMethods = () => {
  return Object.values(PAYMENT_METHODS).filter(method => method.enabled);
};

// 默认支付方式
export const DEFAULT_PAYMENT_METHOD = PAYMENT_METHODS.WECHAT.key;
